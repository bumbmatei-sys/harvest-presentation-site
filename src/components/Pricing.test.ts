import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  actualSavingPct, ADVERTISED_DISCOUNT_PCT, BILLING_TERMS, cardTerms, discountClaim,
  discountClaimContract, discountClaimShape, DISCOUNTED_TERMS, PlanCard, planPriceContract, plans,
  TERM_MONTHS, TERM_SUFFIX, termMonthlyEquivalent, TermToggle, CHEAPEST_MONTHLY,
  type BillingTerm, type Plan,
} from './Pricing';
import { appSignupUrl } from '../lib/ref';

/* Plan-data invariants the build cannot see.
 *
 * The cross-repo price contract at the top of Pricing.tsx already throws during
 * the prerender, and it stays there — a wrong price must break the build, not
 * merely fail a suite someone can skip. What is below is the part that contract
 * does not cover: the shape of the plan list itself. */

/** The app's `TenantPlan` union. A planId outside it deep-links signup to a
 *  plan the app cannot resolve — it falls back to `plus`, so the most expensive
 *  card silently signs the visitor up for the cheapest. `'ultra'` shipped once. */
const TENANT_PLANS = ['plus', 'pro', 'max'];

describe('plan ids', () => {
  it.each(plans.map((p) => [p.name, p.planId]))(
    '%s carries a planId the app can resolve (%s)',
    (_name, planId) => {
      expect(TENANT_PLANS).toContain(planId);
    },
  );

  it('covers each tier exactly once', () => {
    expect(plans.map((p) => p.planId).sort()).toEqual([...TENANT_PLANS].sort());
  });

  it('features exactly one plan', () => {
    // `popularIdx` drives both the card badge and the comparison table's
    // highlighted column; two flagged plans would highlight only the first.
    expect(plans.filter((p) => p.popular)).toHaveLength(1);
  });
});

/* ─── THE-195 TEST 1 ───────────────────────────────────────────────────────────
   The nine prices, per tier and per term, against the Dodo catalogue.

   Written out here rather than derived from `plans`, deliberately: a test that
   reads the same table it is checking asserts only that the table equals
   itself. These nine are the figures verified against the authenticated live
   Dodo API on 2026-08-20 (9900 / 19900 / 39900 minor units on the quarterly
   products, and so on), transcribed independently. */
const DODO_CATALOGUE_USD: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 39, quarterly: 99, yearly: 329 },
  pro: { monthly: 79, quarterly: 199, yearly: 659 },
  max: { monthly: 159, quarterly: 399, yearly: 1329 },
};

describe('the nine plan prices match the Dodo catalogue exactly', () => {
  it.each(
    plans.flatMap((p) => BILLING_TERMS.map((term) => [p.name, p.planId, term] as const)),
  )('%s (%s) on %s', (_name, planId, term) => {
    expect(plans.find((p) => p.planId === planId)!.price[term]).toBe(DODO_CATALOGUE_USD[planId][term]);
  });

  it('prices every tier on every term — no term is missing', () => {
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(Number.isInteger(p.price[term]), `${p.name} ${term} is not a whole dollar figure`).toBe(true);
        expect(p.price[term]).toBeGreaterThan(0);
      }
    }
  });

  it('prices the tiers in ascending order on every term', () => {
    // The cards render in array order; a cheaper plan to the right of a dearer
    // one reads as a mistake and undercuts the comparison table beneath it.
    for (const term of BILLING_TERMS) {
      const figures = plans.map((p) => p.price[term]);
      expect(figures, `${term} prices are not ascending`).toEqual([...figures].sort((a, b) => a - b));
    }
  });

  it('makes every longer term cheaper than the same span bought monthly', () => {
    // The whole proposition. A term that cost MORE than paying month by month
    // would make every "save" badge on the page a lie in the other direction.
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        expect(p.price[term], `${p.name} ${term}`).toBeLessThan(p.price.monthly * TERM_MONTHS[term]);
      }
    }
  });
});

/* ─── THE-195 TESTS 3 & 4 ─────────────────────────────────────────────────────
   The badges, and the honesty rule they have to satisfy. */
describe('the discount badges read 15% and 30% and are not computed from the prices', () => {
  it('advertises exactly 15% and 30%', () => {
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 15, yearly: 30 });
  });

  it('does NOT compute the badge from the prices — a computed badge fails two different ways', () => {
    // 🔴 This is the point of storing them, and the two discounted terms fail a
    // computed badge for DIFFERENT reasons — which is why neither one alone
    // would have justified the decision.

    // 1. QUARTERLY: rounding disagrees across tiers. A per-tier badge would read
    //    15% beside Individual and 16% beside Ministry, on a toggle that sits
    //    above all three cards at once.
    const quarterlyRounded = plans.map((p) => Math.round(actualSavingPct(p, 'quarterly')));
    expect(new Set(quarterlyRounded).size).toBeGreaterThan(1);
    expect(Math.round(actualSavingPct(plans[0], 'quarterly'))).toBe(15);
    expect(Math.round(actualSavingPct(plans[2], 'quarterly'))).toBe(16);

    // 2. YEARLY: rounding happens to AGREE — all three tiers round to 30 — and
    //    that is precisely the trap. A badge computed by rounding would print a
    //    flat 30% while the worst tier saves 29.70%, i.e. it would compute
    //    itself into the false claim the honesty rule exists to stop. Storing
    //    the number and deriving only the WORDING is what separates the two.
    const yearlyRounded = plans.map((p) => Math.round(actualSavingPct(p, 'yearly')));
    expect(new Set(yearlyRounded)).toEqual(new Set([30]));
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')))).toBeLessThan(30);
    expect(discountClaimShape('yearly')).toBe('upTo');
  });

  it('renders the stored number on the toggle, per discounted term', () => {
    const html = renderToStaticMarkup(
      React.createElement(TermToggle, { value: 'yearly', onChange: () => {} }),
    );
    expect(html).toContain('-15%');
    expect(html).toContain('-30%');
    // Monthly carries no badge — there is nothing to save against itself.
    expect(html.match(/-[0-9]+%/g)).toHaveLength(2);
  });
});

describe('no copy claims a saving larger than the smallest actual saving', () => {
  /** The worst and best tier for a term, exactly. */
  const worst = (term: 'quarterly' | 'yearly') => Math.min(...plans.map((p) => actualSavingPct(p, term)));
  const best = (term: 'quarterly' | 'yearly') => Math.max(...plans.map((p) => actualSavingPct(p, term)));

  it('states a percentage FLAT only when the worst tier actually reaches it', () => {
    for (const term of DISCOUNTED_TERMS) {
      if (discountClaimShape(term) === 'flat') {
        expect(ADVERTISED_DISCOUNT_PCT[term], `flat "${discountClaim(term)}" overstates ${term}`)
          .toBeLessThanOrEqual(worst(term));
      }
    }
  });

  it('quarterly may be claimed flat — the worst tier saves 15.4% against an advertised 15%', () => {
    expect(worst('quarterly')).toBeGreaterThan(15);
    expect(discountClaimShape('quarterly')).toBe('flat');
    expect(discountClaim('quarterly')).toBe('Save 15%');
  });

  it('🔴 yearly may NOT be claimed flat — the worst tier saves 29.70% against an advertised 30%', () => {
    // The brief that set these prices stated 15% and 30% were both safe to
    // advertise flat. 30 is not: Individual is $329 against $468 at the monthly
    // rate, which is 29.70% — three tenths of a point short of the claim. "Up
    // to" is true of every tier and keeps 30 on the badge.
    expect(worst('yearly')).toBeLessThan(30);
    expect(worst('yearly')).toBeCloseTo(29.7008, 3);
    expect(discountClaimShape('yearly')).toBe('upTo');
    expect(discountClaim('yearly')).toBe('Save up to 30%');
  });

  it('never advertises more than even the best tier saves, under any wording', () => {
    for (const term of DISCOUNTED_TERMS) {
      expect(ADVERTISED_DISCOUNT_PCT[term]).toBeLessThanOrEqual(best(term));
    }
  });

  it('the honesty guard throws when an advertised percentage outruns every tier', () => {
    // By mutation: no wording rescues "up to 40%" when nothing reaches 40%.
    expect(() => discountClaimContract(plans, { quarterly: 15, yearly: 40 })).toThrow(/best tier only/);
    expect(() => discountClaimContract(plans, { quarterly: 99, yearly: 30 })).toThrow(/quarterly advertises 99%/);
    // And it passes for what the site actually advertises.
    expect(() => discountClaimContract(plans)).not.toThrow();
  });
});

/* The card and its button must agree about which term is being sold.
 *
 * They did not. The toggle defaults to the discounted term, the card priced
 * itself from that state, and the signup link named no term at all — so the
 * app's onboarding, which fails closed to monthly on a missing `?billing=`,
 * sold monthly to a church that had been shown a discounted price. Default
 * state, not an edge.
 *
 * So these assertions are made against a RENDERED card rather than against the
 * helpers behind it: the price and the href are read back out of the same
 * markup, which is the only place the two facts have ever had to agree. A card
 * that prices itself from the toggle while its button is wired to a literal
 * satisfies every check made one layer down, and fails here.
 *
 * Plans are named by label — `p.planId`, `p.name` — never by matching on a
 * figure: a price matched by pattern is a price matched on the wrong card. */
describe('what a card shows and what its button buys', () => {
  /** Render one card and read back the facts that must not disagree. */
  function shown(plan: Plan, term: BillingTerm) {
    const html = renderToStaticMarkup(React.createElement(PlanCard, { plan, term }));
    // The headline is the first dollar figure in a <span>; the fee beside it is
    // a percentage and no feature line carries a `$`.
    const price = html.match(/>\$([0-9,]+)<\/span>/)?.[1];
    const href = html.match(/href="(https:\/\/theharvest\.app\/[^"]*)"/)?.[1]?.replace(/&amp;/g, '&');
    expect(price, `${plan.name} rendered no price`).toBeDefined();
    expect(href, `${plan.name} rendered no signup link`).toBeDefined();
    return {
      price: Number(price!.replace(/,/g, '')),
      html,
      href: href!,
      params: new URL(href!).searchParams,
    };
  }

  it.each(BILLING_TERMS)('a card shown on %s links to a signup for that same term', (term) => {
    for (const p of plans) {
      const card = shown(p, term);
      // 🔴 The CHARGED figure, not a per-month equivalent.
      expect(card.price).toBe(p.price[term]);
      expect(card.href).toBe(`https://theharvest.app/?signup=${p.planId}&billing=${term}`);
    }
  });

  it("the link uses the app's vocabulary, not Dodo's", () => {
    // Dodo's term is `annual` but the app's is `yearly`, and the app's validator
    // fails closed on anything else — so 'annual' on the wire would quietly
    // reproduce the original bug.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const { params } = shown(p, term);
        expect(params.get('billing')).toBe(term);
        expect([...params.values()]).not.toContain('annual');
      }
    }
  });

  it("switching the toggle changes what every card's link buys", () => {
    for (const p of plans) {
      const seen = BILLING_TERMS.map((t) => shown(p, t));
      // Every card, not just the featured one: a link pinned to one term serves
      // the other terms' visitors a price they were never shown.
      expect(new Set(seen.map((s) => s.href)).size).toBe(BILLING_TERMS.length);
      expect(new Set(seen.map((s) => s.price)).size).toBe(BILLING_TERMS.length);
    }
  });

  it('names the charged cycle beside the charged amount, on every term', () => {
    // ⚠️ What a church is charged must be unambiguous. The headline suffix is
    // the CYCLE, so "$99" never appears over "/mo" on a quarterly card.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(shown(p, term).html).toContain(`/${TERM_SUFFIX[term]}`);
      }
    }
  });

  it('never shows a per-month equivalent without the amount and cadence that produce it', () => {
    // 🔴 $329/12 is $27.42 and no church is ever billed $27. Wherever the
    // equivalent appears it is labelled, and the charged total is in the same
    // sentence.
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        const { html } = shown(p, term);
        const perMonth = termMonthlyEquivalent(p.price[term], term);
        expect(html).toContain(`$${perMonth}/mo equivalent`);
        expect(html).toContain(`billed as $${p.price[term].toLocaleString()} every ${TERM_MONTHS[term]} months`);
      }
      // On monthly there is no equivalent to state — the headline IS per month.
      expect(shown(p, 'monthly').html).not.toContain('equivalent');
    }
  });

  it('the referral parameter still survives on the signup link', () => {
    // The stored ref is driven through sessionStorage in lib/ref.test.ts, and a
    // server render deliberately holds it at '' so hydration agrees. What is
    // checked here is that the card's own hand-off did not take the slot the
    // commission rides in: absent, never present-and-empty.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const { params, href } = shown(p, term);
        expect(params.has('ref')).toBe(false);
        expect(href).not.toContain('ref=');
        expect(params.get('signup')).toBe(p.planId);
      }
      // And with a ref in hand the term rides alongside it, never instead of it.
      const url = appSignupUrl(p.planId, cardTerms(p, 'quarterly').billing);
      expect(url).toContain('billing=quarterly');
      expect(url).toContain(`signup=${p.planId}`);
    }
  });

  it('no price or trial length is restated anywhere new', () => {
    // The signup link carries intent, never figures: the price lives on the
    // card and the trial length lives in TRIAL_LENGTH_DAYS. A copy of either on
    // the wire is a second source of truth that will go stale silently.
    const ALLOWED = ['signup', 'billing'];
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const { params, href } = shown(p, term);
        expect([...params.keys()]).toEqual(ALLOWED);
        expect(new URL(href).search).not.toMatch(/[0-9]/);
      }
    }
  });

  it('translates the toggle at exactly one boundary', () => {
    // `cardTerms` is that boundary. Asserted directly so the translation keeps a
    // named home of its own.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        expect(cardTerms(p, term)).toEqual({
          price: p.price[term],
          suffix: TERM_SUFFIX[term],
          perMonth: termMonthlyEquivalent(p.price[term], term),
          billing: term,
        });
      }
    }
  });
});

/* ─── THE-195 TEST 12 ───────────────────────────────────────────────────────── */
describe('the cheapest-plan figure follows the new Individual monthly price', () => {
  it('is the lowest MONTHLY sticker price, which is now 39', () => {
    expect(CHEAPEST_MONTHLY).toBe(39);
    expect(CHEAPEST_MONTHLY).toBe(Math.min(...plans.map((p) => p.price.monthly)));
  });

  it('is never a discounted-term figure', () => {
    // The surfaces that render it (Nav's mega-menu footer, the BlogPost CTA
    // band, the Landing SEO description) carry no toggle and name no term, so a
    // discounted figure there would be a "from $27/mo" nobody can actually buy.
    for (const term of DISCOUNTED_TERMS) {
      expect(CHEAPEST_MONTHLY).not.toBe(Math.min(...plans.map((p) => termMonthlyEquivalent(p.price[term], term))));
    }
  });
});

/* ─── THE-195 TEST 5 ─────────────────────────────────────────────────────────── */
describe('the cross-repo price contract still throws when the two repos disagree', () => {
  it('throws for a disagreement on ANY tier and ANY term — verified by mutation', () => {
    // 🔴 The real thing, run against a deliberately wrong table. The contract
    // runs at module scope, so this file having imported ./Pricing at all proves
    // it passes for today's prices; what is proved here is that it FAILS for
    // prices it should reject, which importing can never show.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const mutated: Record<string, Record<BillingTerm, number>> = {
          plus: { ...DODO_CATALOGUE_USD.plus },
          pro: { ...DODO_CATALOGUE_USD.pro },
          max: { ...DODO_CATALOGUE_USD.max },
        };
        mutated[p.planId][term] += 1;
        expect(
          () => planPriceContract(plans, mutated),
          `a $1 drift on ${p.name} ${term} did not fail the contract`,
        ).toThrow(new RegExp(`${p.name}.*${term}`));
      }
    }
  });

  it('throws when the app publishes a tier this site does not price at all', () => {
    expect(() => planPriceContract(plans, { plus: DODO_CATALOGUE_USD.plus })).toThrow(/no expected prices/);
  });

  it('passes for the prices actually shipped', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('still runs at module scope and still THROWS, rather than warning', async () => {
    const src = await readFile(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8');
    // Downgraded to a warning it would ship exactly the mismatch it exists to
    // stop, and the build would pass.
    expect(src).toMatch(/throw new Error\(/);
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
    expect(src).toMatch(/const EXPECTED_PLAN_PRICES: Record<string, Record<BillingTerm, number>> = \{/);
    expect(src).not.toMatch(/console\.(warn|error)\(/);
  });

  it('compares the TABLE, not a multiplier — the old shape is gone', () => {
    // The contract used to check `annualMonthly(p.monthly)` against three
    // expected monthly-equivalents, i.e. the output of ANNUAL_BILLED_MONTHS.
    // There is no multiplier to check now, and comparing stored price to stored
    // price guards strictly more: the old shape could not see a wrong MONTHLY
    // price at all, only a wrong derivation from one.
    const mutated = {
      plus: { ...DODO_CATALOGUE_USD.plus, monthly: DODO_CATALOGUE_USD.plus.monthly + 10 },
      pro: { ...DODO_CATALOGUE_USD.pro },
      max: { ...DODO_CATALOGUE_USD.max },
    };
    expect(() => planPriceContract(plans, mutated)).toThrow(/Individual.*monthly/);
  });
});
