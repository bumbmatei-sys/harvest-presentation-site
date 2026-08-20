import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ON_BILLED_MONTHS, ADD_ONS, AddOnCard, AddOns, addOnAvailability, addOnPricingContract,
  ADVERTISED_DISCOUNT_PCT, BILLING_TERMS, planPriceContract, PlanCard, Pricing, plans, type AddOn,
  TERM_MONTHS, termMonthlyEquivalent,
} from './Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';
import { MULTI_CAMPUS_ENABLED } from '../lib/flags';

/* The add-on section, and the two false claims it is one edit away from making.
 *
 * 1. A price a third under what Dodo charges. The plan cards divide by 12 after
 *    multiplying by 9 (`annualMonthly`) and the toggle defaults to Annual, so
 *    the obvious way to add an annual add-on figure is the wrong one:
 *    annualMonthly(19) is 14, and Dodo charges 228 a year, not 171.
 * 2. Availability a visitor cannot have. Contacts +500 is not sold on the
 *    Individual plan and unlimited contacts is Ministry only — enforced in Dodo
 *    (THE-133), so a card that implies otherwise sells something the checkout
 *    will refuse.
 *
 * Everything below reads RENDERED markup wherever a claim is a rendered thing.
 * PR 55 is why: a pure-function test passed while the JSX seam was mutated, and
 * only the prerendered dist/ caught it. Data-level assertions are kept only for
 * facts that are not rendered at all (the contract's teeth, the tool count). */

const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const addOnsHtml = (discounted: boolean) =>
  html(React.createElement(AddOns, { term: discounted ? ('yearly' as const) : ('monthly' as const) }));
const pageHtml = () => html(React.createElement(Pricing));
const cardHtml = (addOn: AddOn) => html(React.createElement(AddOnCard, { addOn }));

/** Every `$N` figure printed in a piece of markup, in order. */
/* ⚠️ THE-196 widened this to admit CENTS. It read /\$([0-9][0-9,]*)/, which
   matches "$27.42" as 27 — silently truncating at the decimal point and
   comparing a headline against the wrong number. Any figure on a card may now
   carry cents, so the fraction is part of the match. */
const dollars = (markup: string) => [...markup.matchAll(/\$([0-9][0-9,]*(?:\.[0-9]{2})?)/g)].map((m) => Number(m[1].replace(/,/g, '')));
/** Markup with tags stripped, entities decoded — what a visitor actually reads. */
const words = (markup: string) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

/* Two views of the source, because "what the file says" and "what the file
   does" are different questions. A comment may name `annualMonthly` to warn
   against it, and may quote a price while explaining why the price must not be
   quoted — neither reaches a visitor. */
/** Source with comments stripped — everything that can reach the page. */
const publishable = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ \t]*\/\/[^\n]*$/gm, '');
/** Source with comments and string literals stripped — executable code only. */
const executable = (src: string) => publishable(src)
  .replace(/`(?:[^`\\]|\\.)*`/g, '``')
  .replace(/'(?:[^'\\]|\\.)*'/g, "''")
  .replace(/"(?:[^"\\]|\\.)*"/g, '""');

const PRICING_SRC = await readFile(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8');
/** The ADD_ONS array literal — the one place an add-on price may be written. */
const ADD_ONS_BLOCK = PRICING_SRC.match(/export const ADD_ONS: AddOn\[\] = \[[\s\S]*?\n\];/)?.[0];

describe('add-on annual pricing', () => {
  it('every add-on annual price is twelve times its monthly price', () => {
    // 🔴 The false-price guard. Read off each RENDERED card, not off the data:
    // the card is where a visitor is quoted, and a card that prints a figure the
    // data does not hold satisfies every check made one layer down.
    expect(ADD_ONS.length).toBeGreaterThan(0);
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    for (const a of ADD_ONS) {
      const [monthly, annual, ...rest] = dollars(cardHtml(a));
      expect(rest, `${a.name} prints an unexplained third figure`).toEqual([]);
      expect(monthly, `${a.name} monthly`).toBe(a.monthly);
      expect(annual, `${a.name} annual`).toBe(a.annual);
      expect(annual, `${a.name} is not billed at ${ADD_ON_BILLED_MONTHS} × its monthly price`)
        .toBe(monthly * ADD_ON_BILLED_MONTHS);
    }
  });

  it('no add-on price passes through annualMonthly', () => {
    // A PLAN discount applied to an add-on, on either term and in either
    // direction: 15% or 30% off the monthly figure, and the same off the yearly
    // one. None of them may appear anywhere in the rendered section.
    const shown = dollars(addOnsHtml(true)).concat(dollars(addOnsHtml(false)));
    for (const a of ADD_ONS) {
      for (const pct of Object.values(ADVERTISED_DISCOUNT_PCT)) {
        for (const base of [a.monthly, a.annual]) {
          const wrong = Math.round(base * (1 - pct / 100));
          expect(shown, `${a.name}: $${wrong} is a ${pct}% plan discount applied to an add-on`)
            .not.toContain(wrong);
        }
      }
    }
    // And the helper is never CALLED from the add-on code — the section renders
    // its figures straight from ADD_ONS. Comments and error strings may name it,
    // and do, to say it must not be used; only executable code is scanned.
    const start = PRICING_SRC.indexOf('export const ADD_ON_BILLED_MONTHS');
    const end = PRICING_SRC.indexOf('/* The plan CTA is the affiliate hand-off');
    expect(start, 'the add-on section could not be located').toBeGreaterThan(0);
    expect(end).toBeGreaterThan(start);
    const section = executable(PRICING_SRC.slice(start, end));
    expect(section).not.toContain('annualMonthly');
    expect(section).not.toContain('ANNUAL_BILLED_MONTHS');
  });

  it('the page states that add-ons are not discounted whenever a discounted term is on', () => {
    // The toggle defaults to Yearly, so this is the DEFAULT prerendered page: a
    // −30% badge sits a few hundred pixels above these prices.
    const stated = words(pageHtml());
    expect(stated).toMatch(/add-ons are not discounted/i);
    expect(stated).toContain(`the −${ADVERTISED_DISCOUNT_PCT.yearly}% applies to plans only`);
    expect(stated).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
    // Stated in the state that makes the discount visible, and derived from the
    // same constant the badge is — the two cannot come to disagree.
    expect(words(addOnsHtml(true))).toMatch(/not discounted/i);
    // The prices themselves do not move with the toggle, because they do not
    // move in Dodo. Only the qualifier is conditional.
    expect(dollars(addOnsHtml(true))).toEqual(dollars(addOnsHtml(false)));
  });
});

describe('where an add-on can be bought', () => {
  const find = (name: string) => {
    const a = ADD_ONS.find((x) => x.name === name);
    expect(a, `no add-on named "${name}"`).toBeDefined();
    return a!;
  };
  // Named through `plans`, never as literals: the point of holding availability
  // as planIds is that this copy cannot drift from the tiers that exist.
  const planName = (planId: string) => plans.find((p) => p.planId === planId)!.name;

  it('Contacts +500 is not offered on Individual', () => {
    const a = find('Contacts +500');
    expect(a.planIds).not.toContain('plus');
    const read = words(cardHtml(a));
    // Stated, not implied: the card names the plans that can buy it and says
    // "only", and never names the plan that cannot.
    expect(read).toContain(`${planName('pro')} and ${planName('max')} only`);
    expect(read).not.toContain(planName('plus'));
    // And the restriction survives into the rendered section, on the page.
    expect(words(addOnsHtml(true))).toContain(`${planName('pro')} and ${planName('max')} only`);
  });

  it('Unlimited contacts is stated as Ministry only', () => {
    const a = find('Unlimited contacts');
    expect(a.planIds).toEqual(['max']);
    const read = words(cardHtml(a));
    expect(read).toContain(`${planName('max')} only`);
    expect(read).not.toContain(planName('plus'));
    expect(read).not.toContain(planName('pro'));
    expect(words(pageHtml())).toContain(`${planName('max')} only`);
  });

  it('states availability on every add-on, including the unrestricted ones', () => {
    // Silence on an unrestricted add-on would make "only" ambiguous elsewhere.
    for (const a of ADD_ONS) {
      expect(words(cardHtml(a)), `${a.name} states no availability`)
        .toContain(addOnAvailability(a.planIds));
    }
    const everywhere = ADD_ONS.filter((a) => a.planIds.length === plans.length);
    expect(everywhere.length).toBeGreaterThan(0);
    for (const a of everywhere) expect(words(cardHtml(a))).toContain('Available on every plan');
  });

  it('the add-on availability contract throws on a plan that does not exist', () => {
    // The contract runs at module scope — this file importing ./Pricing at all
    // is the proof it passes for today's data. What is checked here is that it
    // still fires, rather than agreeing with whatever it is handed.
    const bad: AddOn = { ...ADD_ONS[0], planIds: ['enterprise'] };
    expect(() => addOnPricingContract([bad])).toThrow(/not in `plans`/);
    expect(() => addOnPricingContract([{ ...ADD_ONS[0], planIds: [] }])).toThrow(/sold on no plan/);
  });

  it('the add-on price contract throws when a yearly figure is not twelve monthlies', () => {
    // 🔴 The build failure that stops the wrong price shipping: the plan
    // discount applied to an add-on is exactly what this catches.
    const discounted: AddOn = { ...ADD_ONS[0], annual: Math.round(ADD_ONS[0].annual * 0.7) };
    expect(() => addOnPricingContract([discounted])).toThrow(/NOT discounted\s+annually/);
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();
  });
});

describe('Campus', () => {
  it('Campus is not presented as purchasable', () => {
    // The two LIVE Dodo add-on ids for Campus were never recorded, so the app
    // refuses a live Campus purchase — advertising it, at any price or with any
    // "soon" label, is a claim the product cannot honour. It is omitted from
    // this page entirely, which is the same decision MULTI_CAMPUS_ENABLED
    // already encodes for every other campus surface on the site.
    expect(MULTI_CAMPUS_ENABLED).toBe(false);
    expect(ADD_ONS.map((a) => a.name).join(' ')).not.toMatch(/campus/i);
    for (const markup of [pageHtml(), addOnsHtml(true), addOnsHtml(false)]) {
      expect(words(markup)).not.toMatch(/campus/i);
    }
    // Nor its price, in either form, anywhere in this file.
    expect(PRICING_SRC).not.toMatch(/\$\s*15\b/);
    expect(PRICING_SRC).not.toMatch(/\$\s*180\b/);
  });
});

describe('one source for an add-on price', () => {
  it('no add-on price literal appears outside the single constant', () => {
    // #56 fixed three disconnected $49 literals. Every add-on figure lives in
    // ADD_ONS and nowhere else — not in copy, not in a second table, not in the
    // contract's expectations (the contract checks a relation, not a literal).
    expect(ADD_ONS_BLOCK, 'the ADD_ONS literal could not be located').toBeDefined();
    const rest = publishable(PRICING_SRC.replace(ADD_ONS_BLOCK!, ''));
    for (const a of ADD_ONS) {
      for (const price of [a.monthly, a.annual]) {
        expect(rest, `$${price} (${a.name}) is written outside ADD_ONS`)
          .not.toMatch(new RegExp(`\\$\\s*${price}\\b`));
      }
    }
    // And every figure the section prints came from ADD_ONS — a literal smuggled
    // into the JSX would show up here as a figure with no entry behind it.
    const allowed = ADD_ONS.flatMap((a) => [a.monthly, a.annual]).sort((x, y) => x - y);
    expect(dollars(addOnsHtml(true)).sort((x, y) => x - y)).toEqual(allowed);
  });
});

describe('when an add-on can be bought', () => {
  it('nothing claims add-ons can be bought during the trial', () => {
    // PR 321 refuses an add-on purchase during the trial, deliberately: Dodo's
    // proration ends the trial, so buying a seat on day 3 charges the full plan
    // price immediately and forfeits the remaining days. "Add anytime" is the
    // natural marketing sentence here and it would be a promise the app breaks.
    for (const annual of [true, false]) {
      const read = words(addOnsHtml(annual));
      expect(read).not.toMatch(/any\s?time/i);
      expect(read).not.toMatch(/trial/i);
      expect(read).not.toMatch(/from day one|day one|straight away|right away|instantly/i);
      // What it says instead.
      expect(read).toContain('once your plan is active');
    }
    // The trial length itself stays in TRIAL_LENGTH_DAYS — no digit-bearing
    // claim about timing is restated here.
    expect(ADD_ONS_BLOCK).not.toMatch(/\b14\b/);
  });
});

/* ---------------------------------------------------------------- *
 * No-regression. The add-on section must leave the plan pricing, its
 * discount, the tool count and the cross-repo contract exactly as it
 * found them.
 * ---------------------------------------------------------------- */

describe('what this change must not have touched', () => {
  it('the plan prices and the annual discount are unchanged', () => {
    // 🔴 Data and rendered cards both. Nine stored prices, three terms; the
    // badges are 15% and 30% and are NOT computed from the prices.
    expect(plans.map((p) => p.price.monthly)).toEqual([39, 79, 159]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([99, 199, 399]);
    expect(plans.map((p) => p.price.yearly)).toEqual([329, 659, 1329]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 15, yearly: 30 });
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        // 🔴 THE-196 flipped the hierarchy: the headline is now the per-month
        // figure and the CHARGED total is the line beneath. The prices
        // themselves did not move — that is what this test guards — so the
        // charged figure is asserted where it now lives.
        const cardHtml = html(React.createElement(PlanCard, { plan: p, term }));
        expect(dollars(cardHtml)[0]).toBe(termMonthlyEquivalent(p.price[term], term));
        if (term !== 'monthly') {
          expect(cardHtml).toContain(
            `billed as $${p.price[term].toLocaleString()} every ${TERM_MONTHS[term]} months`,
          );
        }
      }
    }
    // And on the page itself, with its toggle in the state it prerenders in.
    // And on the page itself, with its toggle in the state it prerenders in.
    const page = pageHtml();
    expect(words(page)).toContain(`-${ADVERTISED_DISCOUNT_PCT.yearly}%`);
    expect(words(page)).toContain(`-${ADVERTISED_DISCOUNT_PCT.quarterly}%`);
    for (const p of plans) expect(dollars(page)).toContain(p.price.yearly);
  });

  it('the tool count is unchanged at its derived value', () => {
    // Add-ons are capacity, not tools. Nothing about them may inflate the
    // "N tools in one platform" figure.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
  });

  it('the cross-repo plan contract still throws when a plan price disagrees', () => {
    // Same assertions as Pricing.test.ts, restated here because this change is
    // the one that could have loosened them. The contract now compares the
    // TABLE — nine cells against nine — rather than the output of a multiplier,
    // and it is exercised by MUTATION rather than only by pattern-matching its
    // source: handing it a wrong table must throw.
    expect(PRICING_SRC).toMatch(/^planPriceContract\(plans\);$/m);
    expect(PRICING_SRC).toMatch(/const EXPECTED_PLAN_PRICES: Record<string, Record<BillingTerm, number>> = \{/);
    expect(PRICING_SRC).toMatch(/throw new Error\(/);
    expect(PRICING_SRC).not.toMatch(/console\.(warn|error)\(/);
    expect(() =>
      planPriceContract(plans, {
        plus: { monthly: 39, quarterly: 99, yearly: 329 },
        pro: { monthly: 79, quarterly: 199, yearly: 659 },
        max: { monthly: 159, quarterly: 399, yearly: 1330 },
      }),
    ).toThrow(/Ministry.*yearly/);
    expect(() => planPriceContract(plans)).not.toThrow();
  });
});
