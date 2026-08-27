import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  actualSavingPct, ADVERTISED_DISCOUNT_PCT, BILLING_TERMS, cardTerms, discountClaim,
  discountClaimContract, discountClaimShape, DISCOUNTED_TERMS, PlanCard, planPriceContract, plans,
  TERM_MONTHS, TERM_SUFFIX, termMonthlyEquivalent, formatMonthlyHeadline, TermToggle, CHEAPEST_MONTHLY,
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
   Dodo API on 2026-08-24 (4900 / 9900 / 19900 minor units on the quarterly
   products, and so on), transcribed independently.

   🔴 THE-222 MOVED THE WHOLE TABLE DOWN A TIER, which is exactly why these are
   transcribed rather than derived: a reprice that shifted a row instead of
   repricing it would leave every number on this page looking familiar and put
   two of the three tiers on the wrong price.

   🔴 THE-248 RAISED THE SIX DISCOUNTED CELLS AND LEFT THE MONTHLY COLUMN
   ALONE — verified live in Dodo on 2026-08-27 (5400 / 10800 / 21600 minor units
   quarterly, 19000 / 38000 / 76000 yearly), product ids unchanged. Prices went
   UP: the quarters were 49 / 99 / 199 and the years 165 / 329 / 659. That is a
   deliberate REDUCTION IN DISCOUNT — 10% and 20% in place of the 17–18% and 31%
   the old figures gave — and not a mistake to be "corrected" back. */
const DODO_CATALOGUE_USD: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 20, quarterly: 54, yearly: 190 },
  pro: { monthly: 40, quarterly: 108, yearly: 380 },
  max: { monthly: 80, quarterly: 216, yearly: 760 },
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
describe('the discount badges read 10% and 20% and are not computed from the prices', () => {
  it('advertises exactly 10% and 20%', () => {
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
  });

  it('does NOT compute the badge from the prices — a computed badge fails two different ways', () => {
    // 🔴 This is the point of storing them, and the two discounted terms fail a
    // computed badge for DIFFERENT reasons — which is why neither one alone
    // would have justified the decision.
    //
    // ⚠️ THE-248 INVERTED WHICH TERM FAILS WHICH WAY. The old argument was
    // "quarterly disagrees across tiers, yearly agrees but drifts". The spread
    // is gone — every tier now saves the same on both terms — so the first half
    // of that argument no longer holds, and it is restated here rather than
    // quietly left standing on a premise the prices retired.

    // 1. QUARTERLY: computing AGREES with the stored number, exactly. All three
    //    tiers save 10.0%, and 10 is what the toggle advertises. 🔴 THAT
    //    AGREEMENT IS THE TRAP, not a reason to derive it: it makes computing
    //    look safe on the one term where it currently is, and the next reprice
    //    that rounds one tier differently would start printing a per-tier badge
    //    above a toggle that governs all three cards at once.
    const quarterlySavings = plans.map((p) => actualSavingPct(p, 'quarterly'));
    expect(new Set(quarterlySavings)).toEqual(new Set([10]));
    expect(new Set(quarterlySavings.map(Math.round))).toEqual(
      new Set([ADVERTISED_DISCOUNT_PCT.quarterly]),
    );

    // 2. YEARLY: computing DISAGREES with the stored number. All three tiers
    //    save 20.83%, so a computed badge reads "20.8%" — or rounds to 21 —
    //    beside a page that says 20 in the Terms, in the FAQ and in the app. A
    //    percentage nobody chose is not more honest for being derived; it is a
    //    number every other surface would then have to chase.
    const yearlyRounded = plans.map((p) => Math.round(actualSavingPct(p, 'yearly')));
    expect(new Set(yearlyRounded)).toEqual(new Set([21]));
    expect(new Set(yearlyRounded)).not.toEqual(new Set([ADVERTISED_DISCOUNT_PCT.yearly]));
    expect(Math.min(...plans.map((p) => actualSavingPct(p, 'yearly')))).toBeGreaterThan(20);
    expect(discountClaimShape('yearly')).toBe('flat');

    // 🔴 Both failures argue for the same split: store the NUMBER, derive only
    // the WORDING. A badge that recomputes itself is a badge that changes what
    // the company advertises without anyone deciding to.
  });

  it('renders the stored number on the toggle, per discounted term', () => {
    const html = renderToStaticMarkup(
      React.createElement(TermToggle, { value: 'yearly', onChange: () => {} }),
    );
    expect(html).toContain('-10%');
    expect(html).toContain('-20%');
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

  it('quarterly may be claimed flat — every tier saves EXACTLY the advertised 10%', () => {
    // 🔴 THE KNIFE EDGE. This is the one case the derivation has never had to
    // handle: the claim does not CLEAR the worst saving, it MEETS it. $54
    // against $60, $108 against $120 and $216 against $240 are each exactly
    // nine tenths, so every tier saves 10.0% and the advertised figure is 10.
    //
    // `toBe(10)`, not `toBeCloseTo` — an exact assertion is the whole point.
    // `actualSavingPct` computed this as 9.999999999999998 until THE-248
    // reordered its arithmetic, and at that value `10 <= worst` is FALSE:
    // the badge would have read "Save up to 10%" and the module-scope contract
    // would have failed the prerender. A tolerant matcher here would have let
    // both through.
    expect(worst('quarterly')).toBe(10);
    expect(best('quarterly')).toBe(10);
    for (const p of plans) {
      expect(actualSavingPct(p, 'quarterly'), `${p.planId} quarterly`).toBe(10);
    }
    expect(ADVERTISED_DISCOUNT_PCT.quarterly).toBe(worst('quarterly'));
    expect(discountClaimShape('quarterly')).toBe('flat');
    expect(discountClaim('quarterly')).toBe('Save 10%');
    expect(discountClaim('quarterly')).not.toContain('up to');
  });

  it('yearly may be claimed flat — every tier saves 20.83% against an advertised 20%', () => {
    // Yearly clears with room, on all three tiers alike: $190 against $240,
    // $380 against $480, $760 against $960 are each 20.8333%. So yearly is NOT
    // the term a future reprice breaks first — quarterly, sitting on equality,
    // is. The founder's number is the round 20; the prices deliver more, which
    // is the direction a claim is allowed to be wrong in.
    expect(worst('yearly')).toBeGreaterThan(20);
    expect(worst('yearly')).toBeCloseTo(20.8333, 3);
    expect(best('yearly')).toBeCloseTo(worst('yearly'), 9);
    expect(discountClaimShape('yearly')).toBe('flat');
    expect(discountClaim('yearly')).toBe('Save 20%');
    expect(discountClaim('yearly')).not.toContain('up to');
  });

  it('never advertises more than even the best tier saves, under any wording', () => {
    for (const term of DISCOUNTED_TERMS) {
      expect(ADVERTISED_DISCOUNT_PCT[term]).toBeLessThanOrEqual(best(term));
    }
  });

  it('the honesty guard throws when an advertised percentage outruns every tier', () => {
    // By mutation: no wording rescues "up to 40%" when nothing reaches 40%.
    expect(() => discountClaimContract(plans, { quarterly: 10, yearly: 40 })).toThrow(/best tier only/);
    expect(() => discountClaimContract(plans, { quarterly: 99, yearly: 20 })).toThrow(/quarterly advertises 99%/);
    // 🔴 AND A CLAIM EXACTLY EQUAL TO THE SAVING PASSES. The guard is `>`, not
    // `>=`: only a claim ABOVE the best tier is false under every wording, and
    // quarterly's advertised 10 IS the best (and worst) tier's 10. One point
    // over is the smallest real lie, and it must still throw.
    expect(() => discountClaimContract(plans, { quarterly: 10, yearly: 20 })).not.toThrow();
    expect(() => discountClaimContract(plans, { quarterly: 11, yearly: 20 })).toThrow(/quarterly advertises 11%/);
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
    // 🔴 THE-196: the HEADLINE is the per-month figure and may carry cents
    // ("$27.42"), so the pattern admits a decimal. It is the first dollar
    // figure in a <span>; the fee beside it is a percentage and no feature
    // line carries a `$`.
    const headline = html.match(/>\$([0-9,]+(?:\.[0-9]{2})?)<\/span>/)?.[1];
    // The charged total, read off the line beneath rather than inferred.
    const termNote = html.match(/billed as \$([0-9,]+) every ([0-9]+) months/);
    const href = html.match(/href="(https:\/\/theharvest\.app\/[^"]*)"/)?.[1]?.replace(/&amp;/g, '&');
    expect(headline, `${plan.name} rendered no price`).toBeDefined();
    expect(href, `${plan.name} rendered no signup link`).toBeDefined();
    return {
      headline: Number(headline!.replace(/,/g, '')),
      chargedTotal: termNote ? Number(termNote[1].replace(/,/g, '')) : null,
      noteMonths: termNote ? Number(termNote[2]) : null,
      html,
      href: href!,
      params: new URL(href!).searchParams,
    };
  }

  it.each(BILLING_TERMS)('a card shown on %s links to a signup for that same term', (term) => {
    for (const p of plans) {
      const card = shown(p, term);
      // 🔴 THE-196: the headline is the PER-MONTH figure on every term.
      expect(card.headline).toBe(termMonthlyEquivalent(p.price[term], term));
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
      expect(new Set(seen.map((s) => s.headline)).size).toBe(BILLING_TERMS.length);
    }
  });

  it('the headline always names /mo, whatever the term', () => {
    // ⚠️ THE-196: the headline is a per-month figure on every term, so its
    // suffix is always "/mo". The CYCLE is named on the line beneath instead,
    // asserted in the next test — what a church is charged stays unambiguous,
    // it just moved one line down.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const { html } = shown(p, term);
        expect(html).toContain('/mo');
        if (term !== 'monthly') expect(html).not.toContain(`/${TERM_SUFFIX[term]}`);
      }
    }
  });

  it('the term total is rendered beneath the headline on quarterly and yearly', () => {
    // 🔴 The headline is a figure nobody is billed. The charged total and its
    // cadence sit directly under it, read back off the rendered card.
    for (const p of plans) {
      for (const term of DISCOUNTED_TERMS) {
        const { chargedTotal, noteMonths } = shown(p, term);
        expect(chargedTotal, `${p.name} ${term}`).toBe(p.price[term]);
        expect(noteMonths, `${p.name} ${term}`).toBe(TERM_MONTHS[term]);
      }
      // On monthly the headline IS the charged amount on the charged cycle, so
      // the note is suppressed rather than repeating it.
      const monthly = shown(p, 'monthly');
      expect(monthly.chargedTotal).toBeNull();
      expect(monthly.html).not.toContain('billed as');
      expect(monthly.headline).toBe(p.price.monthly);
    }
  });

  it('the per-month headline never implies less than the charged total', () => {
    // 🔴 THE HONESTY GUARD, on rendered output — one assertion per tier per
    // term. Under the old Math.round the Ministry yearly card would headline
    // $63, which implies $756 against a charged $760.
    for (const p of plans) {
      for (const term of BILLING_TERMS) {
        const { headline } = shown(p, term);
        const implied = headline * TERM_MONTHS[term];
        expect(
          implied,
          `${p.name} ${term}: headline $${headline}/mo implies $${implied.toFixed(2)}, charged $${p.price[term]}`,
        ).toBeGreaterThanOrEqual(p.price[term]);
        // …and reconciles, rather than merely exceeding: ceiling to the dollar
        // would put $64 over a charged $760 and pass the line above.
        //
        // The bound is DERIVED — ceiling at the cent adds at most one cent per
        // month, so `months × $0.01` is the honest ceiling. It was a flat 0.05,
        // which was only the worst gap the THE-222 prices happened to make; the
        // $760 year overshoots by $0.08 without breaking the rule at all.
        expect(implied - p.price[term], `${p.name} ${term}`)
          .toBeLessThan(TERM_MONTHS[term] * 0.01 + 1e-9);
      }
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
          monthlyHeadline: formatMonthlyHeadline(p.price[term], term),
          billing: term,
        });
      }
    }
  });
});

/* ─── THE-195 TEST 12 ───────────────────────────────────────────────────────── */
describe('the cheapest-plan figure follows the new Individual monthly price', () => {
  it('is the lowest MONTHLY sticker price, which is now 20', () => {
    expect(CHEAPEST_MONTHLY).toBe(20);
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
