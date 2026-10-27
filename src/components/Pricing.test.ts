import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  actualFreeMonths, actualSavingPct, ADVERTISED_DISCOUNT_PCT, ADVERTISED_FREE_MONTHS, BILLING_TERMS, cardTerms,
  discountClaim, discountClaimContract, DISCOUNTED_TERMS, PlanCard, planPriceContract, plans,
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
 *  card silently signs the visitor up for the cheapest. `'ultra'` shipped once.
 *  'pro' is still in the union (the app resolves a stored 'pro' to Church) but
 *  is no longer SOLD, so no card may carry it. */
const TENANT_PLANS = ['plus', 'pro', 'max'];

/** The two ids this site sells: Church is the stored 'plus', Ministry is 'max'.
 *  Never 'church': `signup=church` is the generic church-signup funnel in
 *  lib/ref.ts, so it would mean "no plan chosen". */
const SOLD_PLAN_IDS = ['plus', 'max'];

describe('plan ids', () => {
  it.each(plans.map((p) => [p.name, p.planId]))(
    '%s carries a planId the app can resolve (%s)',
    (_name, planId) => {
      expect(TENANT_PLANS).toContain(planId);
    },
  );

  it('sells exactly two paid plans: Church (plus) and Ministry (max)', () => {
    expect(plans.map((p) => [p.name, p.planId])).toEqual([['Church', 'plus'], ['Ministry', 'max']]);
    expect(plans.map((p) => p.planId).sort()).toEqual([...SOLD_PLAN_IDS].sort());
  });

  it('never sells the retired Small Team / pro id, and never sends signup=church', () => {
    expect(plans.map((p) => p.planId)).not.toContain('pro');
    expect(plans.map((p) => p.planId)).not.toContain('church');
  });

  it('features exactly one plan', () => {
    // `popularIdx` drives both the card badge and the comparison table's
    // highlighted column; two flagged plans would highlight only the first.
    expect(plans.filter((p) => p.popular)).toHaveLength(1);
  });
});

/* ─── THE TWO-PLAN PRICE TABLE ────────────────────────────────────────────────
   The four prices, per plan and per term, as the founder approved them
   (27 Oct 2026): Church $30 / $300, Ministry $90 / $900.

   Written out here rather than derived from `plans`, deliberately: a test that
   reads the same table it is checking asserts only that the table equals
   itself. A year is ten months' price for twelve — "2 months free", 16.67% —
   and the yearly figures are STORED, not computed from a multiplier. The three
   plus/pro/max tiers at $20/$40/$80 (and the quarterly term before them) are
   gone from the catalogue; the old Dodo products stay only for any legacy
   subscription. */
const DODO_CATALOGUE_USD: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 30, yearly: 300 },
  max: { monthly: 90, yearly: 900 },
};

describe('the four plan prices match the approved table exactly', () => {
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

/* ─── THE BADGE, AND THE HONESTY RULE IT HAS TO SATISFY ───────────────────────
   The page says "2 months free". The cross-repo number is 16: the real saving
   (16.67%) rounded DOWN, never up. */
describe('the discount reads "2 months free" and the contract number is 16', () => {
  it('advertises exactly 16 as the contract number, and 2 free months as the claim', () => {
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ yearly: 16 });
    expect(ADVERTISED_FREE_MONTHS).toEqual({ yearly: 2 });
    expect(discountClaim('yearly')).toBe('2 months free');
  });

  it('16 is the real saving rounded down — never 17, and never the old 20', () => {
    for (const p of plans) {
      expect(actualSavingPct(p, 'yearly')).toBeCloseTo(16.6667, 3);
      expect(Math.floor(actualSavingPct(p, 'yearly'))).toBe(ADVERTISED_DISCOUNT_PCT.yearly);
      expect(Math.round(actualSavingPct(p, 'yearly'))).toBe(17);
    }
    expect(ADVERTISED_DISCOUNT_PCT.yearly).not.toBe(20);
  });

  it('a year of every plan is ten months paid and two given away', () => {
    for (const p of plans) {
      expect(p.price.yearly, p.name).toBe(p.price.monthly * 10);
      expect(actualFreeMonths(p, 'yearly'), p.name).toBe(2);
    }
  });

  it('renders "2 months free" on the toggle, per discounted term, and no percentage', () => {
    const html = renderToStaticMarkup(
      React.createElement(TermToggle, { value: 'yearly', onChange: () => {} }),
    );
    expect(html).toContain('2 months free');
    expect(html).not.toMatch(/-[0-9]+%/);
    expect(html).not.toContain('20%');
    // Monthly carries no badge — there is nothing to save against itself.
    expect(html.match(/2 months free/g)).toHaveLength(1);
  });
});

describe('no copy claims a saving larger than the smallest actual saving', () => {
  /** The worst and best tier for a term, exactly. */
  const worst = (term: 'yearly') => Math.min(...plans.map((p) => actualSavingPct(p, term)));
  const best = (term: 'yearly') => Math.max(...plans.map((p) => actualSavingPct(p, term)));

  it('the contract number never exceeds what even the WORST tier saves', () => {
    for (const term of DISCOUNTED_TERMS) {
      expect(ADVERTISED_DISCOUNT_PCT[term], `"${discountClaim(term)}" overstates ${term}`)
        .toBeLessThanOrEqual(worst(term));
      expect(ADVERTISED_FREE_MONTHS[term]).toBeLessThanOrEqual(
        Math.min(...plans.map((p) => actualFreeMonths(p, term))),
      );
    }
  });

  it('a saving EXACTLY equal to the claim is computed exactly, never 9.999999999999998', () => {
    // 🔴 THE KNIFE EDGE. A claim can MEET the worst saving rather than clear
    // it. Proved on a synthetic yearly price that is exactly nine tenths of
    // twelve months ($216 against 12 x $20).
    //
    // `toBe(10)`, not `toBeCloseTo` — an exact assertion is the whole point.
    // `actualSavingPct` subtracts in DOLLARS so every value on the path is an
    // integer a double holds exactly; computed as a ratio it gives
    // 9.999999999999998.
    const tenOff = { ...plans[0], price: { monthly: 20, yearly: 216 } };
    expect(actualSavingPct(tenOff, 'yearly')).toBe(10);
  });

  it('both tiers save the same 16.67%, so the claim is flat and there is no "up to" wording', () => {
    expect(worst('yearly')).toBeCloseTo(16.6667, 3);
    expect(best('yearly')).toBeCloseTo(16.6667, 3);
    expect(discountClaim('yearly')).not.toContain('up to');
    expect(discountClaim('yearly')).not.toMatch(/[0-9]+%/);
  });

  it('the honesty guard throws when an advertised percentage outruns the WORST tier', () => {
    // By mutation. The claim is flat across every tier, so it is bounded by the
    // worst one.
    expect(() => discountClaimContract(plans, { yearly: 17 })).toThrow(/yearly advertises 17%/);
    expect(() => discountClaimContract(plans, { yearly: 20 })).toThrow(/worst tier only/);
    expect(() => discountClaimContract(plans, { yearly: 99 })).toThrow(/yearly advertises 99%/);
    // …and so does "3 months free" against prices that give two.
    expect(() => discountClaimContract(plans, ADVERTISED_DISCOUNT_PCT, { yearly: 3 })).toThrow(/3 months free/);
    // 🔴 A CLAIM EXACTLY EQUAL TO THE SAVING PASSES. The guard is `>`, not `>=`.
    const tenOff = [{ ...plans[0], price: { monthly: 20, yearly: 216 } }];
    expect(() => discountClaimContract(tenOff, { yearly: 10 }, { yearly: 1 })).not.toThrow();
    expect(() => discountClaimContract(tenOff, { yearly: 11 }, { yearly: 1 })).toThrow(/yearly advertises 11%/);
    expect(() => discountClaimContract(plans, { yearly: 16 })).not.toThrow();
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

  it('the term total is rendered beneath the headline on the yearly term', () => {
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
      const url = appSignupUrl(p.planId, cardTerms(p, 'yearly').billing);
      expect(url).toContain('billing=yearly');
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

describe('the cheapest-plan figure follows the Church monthly price', () => {
  it('is the lowest MONTHLY sticker price, which is now 30', () => {
    expect(CHEAPEST_MONTHLY).toBe(30);
    expect(CHEAPEST_MONTHLY).toBe(Math.min(...plans.map((p) => p.price.monthly)));
  });

  it('is never a discounted-term figure', () => {
    // The surfaces that render it (Nav's mega-menu footer, the BlogPost CTA
    // band, the Landing SEO description) carry no toggle and name no term, so a
    // discounted figure there would be a "from $25/mo" nobody can buy monthly.
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
      max: { ...DODO_CATALOGUE_USD.max },
    };
    expect(() => planPriceContract(plans, mutated)).toThrow(/Church.*monthly/);
  });
});
