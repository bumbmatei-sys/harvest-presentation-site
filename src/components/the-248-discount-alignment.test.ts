import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ADD_ONS,
  ADD_ON_BILLED_MONTHS,
  ADVERTISED_DISCOUNT_PCT,
  BILLING_TERMS,
  CHEAPEST_MONTHLY,
  DISCOUNTED_TERMS,
  DODO_ADD_ON_CATALOG,
  FREE_TIER,
  PlanCard,
  Pricing,
  TERM_MONTHS,
  TermToggle,
  actualSavingPct,
  discountClaim,
  discountClaimContract,
  discountClaimShape,
  planPriceContract,
  plans,
  type BillingTerm,
} from './Pricing';
import { TIER_PRICE_CLAIMS, tierPriceMismatches } from '../content/legal';
import { FAQ_PLAN_CLAIMS, faqPlanMismatches } from '../content/faq';

/* ─────────────────────────────────────────────────────────────────────────────
 * THE-248 — quarterly at 10%, yearly at 20%, monthly with no badge at all.
 *
 * The six discounted cells were RAISED. The founder wants a flat 10% and 20%
 * rather than the 17–18% and 31% the previous rounded prices happened to give,
 * so this is a deliberate REDUCTION IN DISCOUNT and not a mistake to correct
 * back. The monthly column ($20 / $40 / $80) and every add-on price are
 * untouched.
 *
 * ⚠️ ASSERTED AGAINST RENDERED MARKUP WHEREVER A CHURCH WOULD READ IT. PR 55
 * learned this the hard way: a pure-function test passed while the JSX seam was
 * mutated, and only the prerendered `dist/` caught it. A price is not a claim
 * until something draws it.
 * ───────────────────────────────────────────────────────────────────────────*/

const words = (markup: string) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const cardText = (planId: string, term: BillingTerm) =>
  words(renderToStaticMarkup(
    React.createElement(PlanCard, { plan: plans.find((p) => p.planId === planId)!, term }),
  ));

const pageText = () => words(renderToStaticMarkup(React.createElement(Pricing)));

const toggleMarkup = (value: BillingTerm = 'yearly') =>
  renderToStaticMarkup(React.createElement(TermToggle, { value, onChange: () => {} }));

/** The nine, transcribed from the authenticated live Dodo API on 2026-08-27
 *  (2000 / 5400 / 19000 minor units on Individual, and so on) rather than read
 *  off `plans` — a test that reads its own subject asserts only that the
 *  subject equals itself. */
const LIVE_DODO_USD: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 20, quarterly: 54, yearly: 190 },
  pro: { monthly: 40, quarterly: 108, yearly: 380 },
  max: { monthly: 80, quarterly: 216, yearly: 760 },
};

/* ── 1 ─────────────────────────────────────────────────────────────────────── */
describe('the nine plan prices match the new table exactly', () => {
  it.each(
    plans.flatMap((p) => BILLING_TERMS.map((term) => [p.planId, p.name, term] as const)),
  )('%s (%s) on %s — in the data and on the card', (planId, name, term) => {
    const expected = LIVE_DODO_USD[planId][term];
    expect(plans.find((p) => p.planId === planId)!.price[term]).toBe(expected);
    // 🔴 And rendered. Monthly headlines the charged figure; the longer terms
    // print the charged total on the "billed as" line beneath the headline.
    const text = cardText(planId, term);
    if (term === 'monthly') {
      expect(text, `${name} monthly card`).toContain(`$${expected}`);
    } else {
      expect(text, `${name} ${term} card`)
        .toContain(`billed as $${expected.toLocaleString('en-US')} every ${TERM_MONTHS[term]} months`);
    }
  });

  it('🔴 the MONTHLY column did not move — $20 / $40 / $80', () => {
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
  });

  it('every discounted price went UP, which is what a smaller discount means', () => {
    const BEFORE: Record<string, Record<string, number>> = {
      plus: { quarterly: 49, yearly: 165 },
      pro: { quarterly: 99, yearly: 329 },
      max: { quarterly: 199, yearly: 659 },
    };
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        expect(p.price[term], `${p.name} ${term} did not rise`).toBeGreaterThan(BEFORE[p.planId][term]);
      }
    }
  });

  it('the Terms and the FAQ quote the same nine, and neither disagrees with the cards', () => {
    // Both are module-scope guards on their own pages; run them here too so a
    // failure names THIS ticket rather than only stopping the prerender.
    expect(tierPriceMismatches(plans)).toEqual([]);
    expect(faqPlanMismatches(plans)).toEqual([]);
    for (const claims of [TIER_PRICE_CLAIMS, FAQ_PLAN_CLAIMS]) {
      for (const c of claims) {
        expect([c.monthly, c.quarterly, c.annual], `${c.name} in a claim table`).toEqual([
          LIVE_DODO_USD[c.planId].monthly,
          LIVE_DODO_USD[c.planId].quarterly,
          LIVE_DODO_USD[c.planId].yearly,
        ]);
      }
    }
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────── */
describe('quarterly claims a flat 10% and yearly a flat 20%', () => {
  it('the helper says so', () => {
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    expect(discountClaim('quarterly')).toBe('Save 10%');
    expect(discountClaim('yearly')).toBe('Save 20%');
    for (const term of DISCOUNTED_TERMS) {
      expect(discountClaim(term), `${term} hedges`).not.toContain('up to');
    }
  });

  it('🔴 and the rendered toggle and page say so', () => {
    const toggle = toggleMarkup();
    expect(toggle).toContain('-10%');
    expect(toggle).toContain('-20%');
    const page = pageText().toLowerCase();
    expect(page).not.toContain('save up to');
    expect(page).not.toContain('up to 10%');
    expect(page).not.toContain('up to 20%');
    // The retired figures must not still be advertised anywhere on the page.
    expect(page).not.toContain('-15%');
    expect(page).not.toContain('-30%');
  });
});

/* ── 3 ── 🔴 MONTHLY CARRIES NO BADGE ───────────────────────────────────────── */
describe('monthly carries no discount badge at all', () => {
  it('renders no badge element for monthly — not an empty one, not a 0%', () => {
    // ⚠️ AN EMPTY PILL IS WORSE THAN NO PILL. It reads as a discount whose
    // figure failed to render, so this asserts the ELEMENT is absent rather
    // than that its text is empty.
    for (const value of BILLING_TERMS) {
      const html = toggleMarkup(value);
      expect(html, `with ${value} selected`).not.toContain('data-testid="term-toggle-badge" data-term="monthly"');
      // Exactly two badges exist, one per discounted term, whichever is selected.
      expect(html.match(/data-testid="term-toggle-badge"/g), `with ${value} selected`).toHaveLength(2);
      expect(html.match(/-[0-9]+%/g), `with ${value} selected`).toHaveLength(2);
    }
  });

  it('draws no percentage and no zero beside the Monthly label', () => {
    const html = toggleMarkup('monthly');
    // The Monthly segment, isolated from the two beside it — and reduced to the
    // text a visitor actually reads. Scanning raw markup would trip over
    // `min-width:0` in the inline style, which is a layout rule and not a
    // discount of nought.
    const afterAttr = html.split('data-term="monthly"')[1];
    // Drop the remainder of the opening tag, then take the button's body.
    const segment = words(afterAttr.slice(afterAttr.indexOf('>') + 1).split('</button>')[0]);
    expect(segment).toBe('Monthly');
    expect(segment).not.toMatch(/%/);
    expect(segment).not.toMatch(/\d/);
    expect(segment).not.toMatch(/save/i);
  });

  it('a monthly card shows no saving, no strike-through and no "billed as" note', () => {
    for (const p of plans) {
      const text = cardText(p.planId, 'monthly');
      expect(text, `${p.name} monthly`).not.toContain('billed as');
      expect(text, `${p.name} monthly`).not.toMatch(/save/i);
      expect(text, `${p.name} monthly`).not.toMatch(/[0-9]+% off/);
    }
  });

  it('monthly is not a discounted term in the data either', () => {
    expect(DISCOUNTED_TERMS).toEqual(['quarterly', 'yearly']);
    expect(Object.keys(ADVERTISED_DISCOUNT_PCT).sort()).toEqual(['quarterly', 'yearly']);
    expect(actualSavingPct(plans[0], 'monthly')).toBe(0);
  });
});

/* ── 4 ── 🔴 THE DERIVATION ─────────────────────────────────────────────────── */
describe('the claim shape is derived from the price table, not hardcoded', () => {
  /** The shipped rule, restated over an arbitrary table and percentage. */
  const shapeOf = (table: Record<string, Record<BillingTerm, number>>, term: BillingTerm, advertised: number) => {
    const saving = (id: string) => {
      const atMonthlyRate = table[id].monthly * TERM_MONTHS[term];
      return ((atMonthlyRate - table[id][term]) * 100) / atMonthlyRate;
    };
    return advertised <= Math.min(...Object.keys(table).map(saving)) ? 'flat' : 'upTo';
  };

  it('🔴 resolves FLAT for both terms — reported, not assumed', () => {
    expect(discountClaimShape('quarterly')).toBe('flat');
    expect(discountClaimShape('yearly')).toBe('flat');
  });

  it('the same rule answers "upTo" for a table that does not deliver the claim', () => {
    // A hardcoded 'flat' would be right for today's prices by luck. One point
    // over the live quarterly saving is the smallest claim that must hedge.
    expect(shapeOf(LIVE_DODO_USD, 'quarterly', 11)).toBe('upTo');
    expect(shapeOf(LIVE_DODO_USD, 'yearly', 21)).toBe('upTo');
    expect(shapeOf(LIVE_DODO_USD, 'quarterly', 10)).toBe('flat');
    expect(shapeOf(LIVE_DODO_USD, 'yearly', 20)).toBe('flat');
    // And a table that genuinely under-delivers, at the live percentages.
    const meaner = { plus: { monthly: 20, quarterly: 57, yearly: 200 } };
    expect(shapeOf(meaner, 'quarterly', ADVERTISED_DISCOUNT_PCT.quarterly)).toBe('upTo');
    expect(shapeOf(meaner, 'yearly', ADVERTISED_DISCOUNT_PCT.yearly)).toBe('upTo');
  });

  it('the shipped function agrees with that rule, and decides by price not by term', () => {
    for (const term of DISCOUNTED_TERMS) {
      expect(discountClaimShape(term), term).toBe(shapeOf(LIVE_DODO_USD, term, ADVERTISED_DISCOUNT_PCT[term]));
    }
    const src = readFileSync(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '');
    const body = src.slice(src.indexOf('export function discountClaimShape'));
    const fn = body.slice(0, body.indexOf('\n}') + 2);
    expect(fn).toContain('actualSavingPct');
    expect(fn).toContain('Math.min');
    expect(fn).not.toMatch(/'yearly'|"yearly"/);
    expect(fn).not.toMatch(/'quarterly'|"quarterly"/);
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────── */
describe('no copy claims a saving larger than the smallest actual saving', () => {
  it('the smallest savings are exactly 10.0% quarterly and 20.83% yearly, on every tier', () => {
    for (const p of plans) {
      expect(actualSavingPct(p, 'quarterly'), `${p.name} quarterly`).toBe(10);
      expect(actualSavingPct(p, 'yearly'), `${p.name} yearly`).toBeCloseTo(20.8333, 3);
    }
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'quarterly')))).toBe(10);
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')))).toBeCloseTo(20.8333, 3);
  });

  it('every flat claim holds for the worst tier', () => {
    for (const term of DISCOUNTED_TERMS) {
      const worst = Math.min(...plans.map((p) => actualSavingPct(p, term)));
      expect(discountClaimShape(term)).toBe('flat');
      expect(ADVERTISED_DISCOUNT_PCT[term], `flat "${discountClaim(term)}" overstates ${term}`)
        .toBeLessThanOrEqual(worst);
    }
  });

  it('🔴 no percentage RENDERED on the page exceeds the worst saving on its own term', () => {
    // Held against the worst tier ON THE TERM IT BELONGS TO. Comparing a yearly
    // badge against quarterly's worst would fail a truthful figure and pass an
    // untruthful one.
    const rendered = [...pageText().matchAll(/-(\d+)%/g)].map((m) => Number(m[1]));
    expect(rendered).toHaveLength(DISCOUNTED_TERMS.length);
    for (const pct of rendered) {
      const term = DISCOUNTED_TERMS.find((t) => ADVERTISED_DISCOUNT_PCT[t] === pct);
      expect(term, `the page renders -${pct}%, which is no term's advertised figure`).toBeDefined();
      expect(pct).toBeLessThanOrEqual(Math.min(...plans.map((p) => actualSavingPct(p, term!))));
    }
  });
});

/* ── 6 ── 🔴 THE KNIFE EDGE ─────────────────────────────────────────────────── */
describe('a saving exactly equal to the claim passes the percentage guard', () => {
  it('🔴 the guard is `>` — equal passes, one point over throws', () => {
    // Quarterly advertises 10 and every tier delivers exactly 10.0. If the
    // guard were `>=` this would fail the build on an honest claim; if the
    // claim could exceed the best tier and pass, the guard would be useless.
    expect(() => discountClaimContract(plans, { quarterly: 10, yearly: 20 })).not.toThrow();
    expect(() => discountClaimContract(plans, { quarterly: 11, yearly: 20 }))
      .toThrow(/quarterly advertises 11%/);
    expect(() => discountClaimContract(plans, { quarterly: 10, yearly: 21 }))
      .toThrow(/yearly advertises 21%/);
    // And for what the site actually advertises, at module scope and here.
    expect(() => discountClaimContract(plans)).not.toThrow();
  });

  it('🔴 the saving is computed EXACTLY, not to within a rounding error', () => {
    // ⚠️ THIS IS THE BUG THE-248 FOUND. `(1 - 54/60) * 100` is
    // 9.999999999999998 in binary floating point, not 10 — so `10 <= worst` was
    // false and `10 > best` was true. The badge would have read "Save up to
    // 10%" and the module-scope guard would have failed the prerender, both on
    // a percentage the prices genuinely deliver. The comparison operators were
    // never wrong; `actualSavingPct` now subtracts in dollars so the numerator
    // stays a whole number.
    const naive = (monthly: number, price: number, months: number) =>
      (1 - price / (monthly * months)) * 100;
    expect(naive(20, 54, 3)).not.toBe(10);          // the defect, pinned
    expect(naive(20, 54, 3)).toBeLessThan(10);      // …and on the failing side
    for (const p of plans) {
      expect(actualSavingPct(p, 'quarterly'), `${p.name}`).toBe(10);      // the fix
      expect(actualSavingPct(p, 'quarterly') >= ADVERTISED_DISCOUNT_PCT.quarterly).toBe(true);
    }
  });
});

/* ── 7 ─────────────────────────────────────────────────────────────────────── */
describe("no term's price is a whole number of months at the monthly rate", () => {
  it.each(plans.flatMap((p) => DISCOUNTED_TERMS.map((t) => [p.name, p.planId, t] as const)))(
    '%s %s is not an integer multiple of its monthly price', (_name, planId, term) => {
      const p = plans.find((x) => x.planId === planId)!;
      const inMonths = p.price[term] / p.price.monthly;
      expect(Number.isInteger(inMonths), `${planId} ${term} is exactly ${inMonths} months`).toBe(false);
    });

  it('the arithmetic in full, for all six discounted cells', () => {
    // 🔴 EVERY TIER LANDS ON THE SAME TWO MULTIPLES, because the discount is
    // flat: 2.7 months on a quarter, 9.5 on a year. Closer to an integer than
    // THE-222's six distinct multiples were — a year rounded to $200 (×10) or a
    // quarter to $60 (×3) would resurrect the multiplier this guard buries.
    const inMonths = (planId: string, term: BillingTerm) => {
      const p = plans.find((x) => x.planId === planId)!;
      return p.price[term] / p.price.monthly;
    };
    expect(inMonths('plus', 'quarterly')).toBe(2.7);   // 54 / 20
    expect(inMonths('plus', 'yearly')).toBe(9.5);      // 190 / 20
    expect(inMonths('pro', 'quarterly')).toBe(2.7);    // 108 / 40
    expect(inMonths('pro', 'yearly')).toBe(9.5);       // 380 / 40
    expect(inMonths('max', 'quarterly')).toBe(2.7);    // 216 / 80
    expect(inMonths('max', 'yearly')).toBe(9.5);       // 760 / 80
  });
});

/* ── 8 ─────────────────────────────────────────────────────────────────────── */
describe('the five add-on prices are unchanged and annual is still ×12', () => {
  /** Read off the live Dodo add-on products, independently of ADD_ONS. */
  const LIVE_ADDON_CENTS: Record<string, [number, number]> = {
    'AI Assistant': [2000, 24000],
    'Admin seat': [1000, 12000],
    Campus: [1200, 14400],
    'Contacts +500': [1500, 18000],
    'Unlimited contacts': [4000, 48000],
  };

  it('all five Dodo add-on products carry their unchanged prices', () => {
    expect(Object.keys(DODO_ADD_ON_CATALOG).sort()).toEqual(Object.keys(LIVE_ADDON_CENTS).sort());
    for (const [name, [monthly, annual]] of Object.entries(LIVE_ADDON_CENTS)) {
      expect(DODO_ADD_ON_CATALOG[name].monthlyCents, `${name} monthly`).toBe(monthly);
      expect(DODO_ADD_ON_CATALOG[name].annualCents, `${name} annual`).toBe(annual);
    }
  });

  it('a year of an add-on is still twelve monthly charges, undiscounted', () => {
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
    for (const a of ADD_ONS) {
      expect(a.annual, `${a.name} is not 12 × its monthly price`).toBe(a.monthly * ADD_ON_BILLED_MONTHS);
    }
    for (const [name, [monthly, annual]] of Object.entries(LIVE_ADDON_CENTS)) {
      expect(annual, `${name} in Dodo`).toBe(monthly * ADD_ON_BILLED_MONTHS);
    }
  });

  it('🔴 no add-on took the plan discount, at either new percentage', () => {
    for (const a of ADD_ONS) {
      for (const pct of Object.values(ADVERTISED_DISCOUNT_PCT)) {
        expect(a.annual, `${a.name} looks like it took the ${pct}% plan discount`)
          .not.toBeCloseTo(a.monthly * ADD_ON_BILLED_MONTHS * (1 - pct / 100), 2);
      }
    }
  });

  it('and the page still says add-ons are not discounted annually', () => {
    for (const term of DISCOUNTED_TERMS) {
      const html = words(renderToStaticMarkup(
        React.createElement(Pricing),
      ));
      expect(html).toContain('Add-ons are not discounted');
      expect(html).toContain(`A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price`);
      expect(term).toBeDefined();
    }
  });
});

/* ── 9 ─────────────────────────────────────────────────────────────────────── */
describe('the cross-repo price contract still throws when the repos disagree', () => {
  it('🔴 throws for a one-dollar drift on EVERY tier and EVERY term — by mutation', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const mutated = {
          plus: { ...LIVE_DODO_USD.plus },
          pro: { ...LIVE_DODO_USD.pro },
          max: { ...LIVE_DODO_USD.max },
        };
        mutated[p.planId as 'plus' | 'pro' | 'max'][term] += 1;
        expect(
          () => planPriceContract(plans, mutated),
          `a $1 drift on ${p.name} ${term} did not fail the contract`,
        ).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
  });

  it('names the app as the other side, and passes for what is shipped', () => {
    expect(() => planPriceContract(plans, { ...LIVE_DODO_USD, plus: { ...LIVE_DODO_USD.plus, monthly: 21 } }))
      .toThrow(/Harvest-agent src\/utils\/plan-features\.ts PLAN_PRICING/);
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('still runs at module scope, so a disagreement stops the prerender', () => {
    const src = readFileSync(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8');
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
    expect(src).toMatch(/^discountClaimContract\(plans\);$/m);
    expect(src).toMatch(/^monthlyHeadlineContract\(\);$/m);
  });
});

/* ── 10 ────────────────────────────────────────────────────────────────────── */
describe('free is still absent from the priced table', () => {
  it('is a tier, not a price row', () => {
    expect(plans.map((p) => p.planId)).toEqual(['plus', 'pro', 'max']);
    expect(plans.map((p) => p.planId)).not.toContain('free');
    expect(FREE_TIER.planId).toBe('free');
    expect(FREE_TIER).not.toHaveProperty('price');
    expect(TIER_PRICE_CLAIMS.map((c) => c.planId)).not.toContain('free');
    expect(FAQ_PLAN_CLAIMS.map((c) => c.planId)).not.toContain('free');
  });
});

/* ── 11 ────────────────────────────────────────────────────────────────────── */
describe('no price literal appears outside the single source', () => {
  const SRC = fileURLToPath(new URL('..', import.meta.url));
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
  const PRICE_BEARING = ['components/Pricing.tsx', 'content/faq.ts', 'content/legal.ts'];
  const EDITORIAL_EXEMPT = ['content/features.ts'];
  const codeOf = (f: string) => readFileSync(f, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '');

  /** The six THE-248 introduced. `20`, `40` and `80` are deliberately excluded:
   *  they are the untouched monthly column and each collides with an add-on
   *  price or a mock figure — see price-sources.test.ts, which owns that
   *  reasoning in full. */
  const NEW_FIGURES = ['54', '108', '216', '190', '380', '760'];

  it.each(NEW_FIGURES)('no module outside the source restates $%s', (digits) => {
    const modules = walk(SRC).filter((f) =>
      !PRICE_BEARING.some((a) => f.endsWith(a)) && !EDITORIAL_EXEMPT.some((e) => f.endsWith(e)));
    expect(modules.length).toBeGreaterThan(20);
    for (const file of modules) {
      expect(codeOf(file), `${file} writes $${digits} as a literal — prices derive from \`plans\``)
        .not.toMatch(new RegExp(`\\$${digits}(?![0-9])`));
    }
  });

  it('🔴 the six RETIRED figures are gone from every module', () => {
    // ⚠️ 49, 99 and 199 are NOT swept — each is still a live COMPETITOR price
    // on this site (Tithe.ly/Donorbox $49–99, Skool $99, Planning Center
    // $99–199). They are pinned by the three claim tables instead, which know
    // which company's price they are looking at. See price-sources.test.ts.
    for (const digits of ['165', '329', '659']) {
      for (const file of walk(SRC)) {
        if (EDITORIAL_EXEMPT.some((e) => file.endsWith(e))) continue;
        expect(codeOf(file), `${file} still carries the retired price $${digits}`)
          .not.toMatch(new RegExp(`\\$${digits}(?![0-9])`));
      }
    }
  });
});

/* ── 12 ────────────────────────────────────────────────────────────────────── */
describe('the cheapest-plan figure still follows Individual monthly', () => {
  it('is 20, derived rather than typed, and never a discounted-term figure', () => {
    expect(CHEAPEST_MONTHLY).toBe(20);
    expect(CHEAPEST_MONTHLY).toBe(Math.min(...plans.map((p) => p.price.monthly)));
    // 🔴 Never a discounted figure: those surfaces name no billing term, so a
    // discounted number there would be a price with no "billed annually" beside
    // it. $18 (the new quarterly headline) is the figure it must not become.
    const discounted = plans.flatMap((p) => DISCOUNTED_TERMS.map((t) => p.price[t]));
    expect(discounted).not.toContain(CHEAPEST_MONTHLY);
    expect(CHEAPEST_MONTHLY).not.toBe(18);
  });

  it('and the surfaces that quote it still say $20', () => {
    for (const file of ['Nav.tsx', '../pages/Landing.tsx', '../pages/BlogPost.tsx']) {
      const src = readFileSync(fileURLToPath(new URL(`./${file}`, import.meta.url)), 'utf8');
      expect(src, `${file} stopped deriving the from-price`).toContain('CHEAPEST_MONTHLY');
    }
  });
});

/* ── 13 ────────────────────────────────────────────────────────────────────── */
describe('the plan feature matrix and the Dodo product ids are unchanged', () => {
  it('every live add-on product id is byte-for-byte what it was', () => {
    // 🔴 An id transposed here is a real card charged for the wrong product.
    // Prices moved; ids did not.
    expect(Object.entries(DODO_ADD_ON_CATALOG).map(([n, p]) => [n, p.monthlyId, p.annualId])).toEqual([
      ['AI Assistant', 'adn_0NlKtuImtSn7PcdvjnSni', 'adn_0NlKtw3IOHfv1GGCevNol'],
      ['Admin seat', 'adn_0NlKtw7AayNYI6YYwphQ5', 'adn_0NlKtw9lWLs0VRN9hWciX'],
      ['Campus', 'adn_0NlKwDcuqIWoVK7Qay13L', 'adn_0NlKwDgKMpuqzR5VmlCBD'],
      ['Contacts +500', 'adn_0NlKtwD3VfBLgx2LTw69O', 'adn_0NlKtwGbLRk2nPC07uC6o'],
      ['Unlimited contacts', 'adn_0NlKtwKAhJgz0jeaqDX2c', 'adn_0NlKtwMjMlsjzZ8z2Wt7P'],
    ]);
  });

  it('add-on availability per tier is untouched', () => {
    /* ⚠️ THE AI ASSISTANT ROW RETURNED IN THE-253 (see the-224's suite), sold
       on all three paid tiers exactly as it was before THE-224 withdrew it. The
       four that were here are byte-for-byte unchanged, which is what this pin
       is for — a DISCOUNT change may not move an add-on's availability, and it
       did not.
       🔴 `plus` IS INCLUDED DELIBERATELY. Individual is the tier where the chat
       was never on, so it is the tier the add-on was always most clearly FOR;
       and free is absent for the reason every add-on is — no subscription to
       attach one to. */
    expect(ADD_ONS.map((a) => [a.name, [...a.planIds]])).toEqual([
      ['AI Assistant', ['plus', 'pro', 'max']],
      ['Admin seat', ['plus', 'pro', 'max']],
      ['Campus', ['plus', 'pro', 'max']],
      ['Contacts +500', ['pro', 'max']],
      ['Unlimited contacts', ['max']],
    ]);
  });

  it('🔴 the tier ladder and the platform fee are untouched by a reprice', () => {
    // The per-cell feature matrix is pinned by PricingComparison.test.ts, which
    // owns it; a reprice may not move the LADDER or the fee, which is what this
    // ticket could plausibly have disturbed.
    expect(plans.map((p) => p.name)).toEqual(['Individual', 'Small Team', 'Ministry']);
    expect(plans.map((p) => p.fee)).toEqual([0, 0, 0]);
    expect(plans.filter((p) => p.popular).map((p) => p.name)).toEqual(['Ministry']);
    // A stable digest of the price-independent half of each card, so a reprice
    // that quietly edited a tier's identity fails here and names it.
    const identity = plans.map((p) => `${p.planId}|${p.name}|${p.fee}|${p.popular ?? false}`).join('\n');
    expect(createHash('sha256').update(identity).digest('hex'))
      .toBe(createHash('sha256').update(
        'plus|Individual|0|false\npro|Small Team|0|false\nmax|Ministry|0|true',
      ).digest('hex'));
  });
});
