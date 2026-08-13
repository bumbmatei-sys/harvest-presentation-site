import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ANNUAL_BILLED_MONTHS, ANNUAL_DISCOUNT_PCT, annualMonthly, cardTerms, PlanCard, plans, type Plan,
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

describe('annual pricing', () => {
  const EXPECTED = { plus: 37, pro: 74, max: 149 } as const;

  it.each(plans.map((p) => [p.planId, p.monthly]))(
    '%s bills at the published annual monthly-equivalent',
    (planId, monthly) => {
      expect(annualMonthly(monthly as number)).toBe(EXPECTED[planId as keyof typeof EXPECTED]);
    },
  );

  it('advertises a 25% discount', () => {
    expect(ANNUAL_DISCOUNT_PCT).toBe(25);
  });

  it('derives that discount from the billed-months multiplier', () => {
    // Not a second copy of the multiplier — the point is that the badge beside
    // the prices is computed from the same constant the prices are, so the two
    // cannot disagree.
    expect(ANNUAL_DISCOUNT_PCT).toBe(Math.round((1 - ANNUAL_BILLED_MONTHS / 12) * 100));
  });

  it('rounds to whole dollars, never below the true annual rate by more than a rounding step', () => {
    for (const p of plans) {
      const exact = (p.monthly * ANNUAL_BILLED_MONTHS) / 12;
      expect(Math.abs(annualMonthly(p.monthly) - exact)).toBeLessThanOrEqual(0.5);
      expect(Number.isInteger(annualMonthly(p.monthly))).toBe(true);
    }
  });

  it('never prices annual above monthly', () => {
    for (const p of plans) expect(annualMonthly(p.monthly)).toBeLessThan(p.monthly);
  });
});

describe('plan card claims', () => {
  it('quotes a whole-dollar monthly price on every plan', () => {
    for (const p of plans) {
      expect(Number.isInteger(p.monthly)).toBe(true);
      expect(p.monthly).toBeGreaterThan(0);
    }
  });

  it('carries a zero platform fee, which the copy beside it asserts', () => {
    // The card renders `{fee * 100}%` next to "Harvest takes nothing from a
    // gift". A nonzero fee turns that sentence into a false claim about money.
    for (const p of plans) expect(p.fee).toBe(0);
  });

  it('prices the tiers in ascending order', () => {
    // The cards render in array order; a cheaper plan to the right of a dearer
    // one reads as a mistake and undercuts the comparison table beneath it.
    const monthlies = plans.map((p) => p.monthly);
    expect(monthlies).toEqual([...monthlies].sort((a, b) => a - b));
  });
});

/* The card and its button must agree about which term is being sold.
 *
 * They did not. The toggle defaults to Annual, the card priced itself from that
 * state, and the signup link named no term at all — so the app's onboarding,
 * which fails closed to monthly on a missing `?billing=`, sold monthly to a
 * church that had been shown the annual price. Default state, not an edge; a
 * ~32% gap between the figure advertised and the figure charged.
 *
 * So these assertions are made against a RENDERED card rather than against the
 * helpers behind it: the price and the href are read back out of the same
 * markup, which is the only place the two facts have ever had to agree. A card
 * that prices itself from the toggle while its button is wired to a literal
 * satisfies every check made one layer down, and fails here.
 *
 * `renderToStaticMarkup` needs no DOM — it is the same server render the site
 * is prerendered with — so this stays inside the suite's node environment and
 * brings in no new dependency.
 *
 * Plans are named by label — `p.planId`, `p.name` — never by matching on a
 * figure: a price matched by pattern is a price matched on the wrong card. */
describe('what a card shows and what its button buys', () => {
  const both = [true, false] as const;

  /** Render one card and read back the two facts that must not disagree. */
  function shown(plan: Plan, annual: boolean) {
    const html = renderToStaticMarkup(React.createElement(PlanCard, { plan, annual }));
    // The card prints exactly one dollar figure — the headline price. The fee
    // beside it is a percentage, and no feature line carries a `$`.
    const price = html.match(/>\$([0-9]+)<\/span>/)?.[1];
    const href = html.match(/href="(https:\/\/theharvest\.app\/[^"]*)"/)?.[1]?.replace(/&amp;/g, '&');
    expect(price, `${plan.name} rendered no price`).toBeDefined();
    expect(href, `${plan.name} rendered no signup link`).toBeDefined();
    return { price: Number(price), href: href!, params: new URL(href!).searchParams };
  }

  it('a card shown at the annual price links to an annual signup', () => {
    for (const p of plans) {
      const card = shown(p, true);
      expect(card.price).toBe(annualMonthly(p.monthly));
      expect(card.href).toBe(`https://theharvest.app/?signup=${p.planId}&billing=yearly`);
    }
  });

  it('a card shown at the monthly price links to a monthly signup', () => {
    for (const p of plans) {
      const card = shown(p, false);
      expect(card.price).toBe(p.monthly);
      // Stated outright rather than left to the app's fallback: the link means
      // the same thing after either repo changes what it defaults to.
      expect(card.href).toBe(`https://theharvest.app/?signup=${p.planId}&billing=monthly`);
    }
  });

  it("the link uses the app's vocabulary, not Dodo's", () => {
    // The site's toggle says "Annual" and Dodo's term is `annual`, but the app's
    // BillingPeriod is `yearly` and its validator fails closed on anything else
    // — so 'annual' on the wire would quietly reproduce the original bug.
    for (const p of plans) {
      for (const annual of both) {
        const { params } = shown(p, annual);
        expect(params.get('billing')).toBe(annual ? 'yearly' : 'monthly');
        expect([...params.values()]).not.toContain('annual');
      }
    }
  });

  it("switching the toggle changes what every card's link buys", () => {
    for (const p of plans) {
      const yearly = shown(p, true);
      const monthly = shown(p, false);
      expect(yearly.price).not.toBe(monthly.price);
      // Every card, not just the featured one: a link pinned to one term serves
      // the other term's visitor a price they were never shown.
      expect(yearly.href).not.toBe(monthly.href);
      expect(yearly.params.get('billing')).toBe('yearly');
      expect(monthly.params.get('billing')).toBe('monthly');
    }
  });

  it('the referral parameter still survives on the signup link', () => {
    // The stored ref is driven through sessionStorage in lib/ref.test.ts, and a
    // server render deliberately holds it at '' so hydration agrees. What is
    // checked here is that the card's own hand-off did not take the slot the
    // commission rides in: absent, never present-and-empty.
    for (const p of plans) {
      for (const annual of both) {
        const { params, href } = shown(p, annual);
        expect(params.has('ref')).toBe(false);
        expect(href).not.toContain('ref=');
        expect(params.get('signup')).toBe(p.planId);
      }
    }
    // And with a ref in hand the term rides alongside it, never instead of it.
    for (const p of plans) {
      const url = appSignupUrl(p.planId, cardTerms(p.monthly, true).billing);
      expect(url).toContain('billing=yearly');
      expect(url).toContain(`signup=${p.planId}`);
    }
  });

  it('no price or trial length is restated anywhere new', () => {
    // The signup link carries intent, never figures: the price lives on the
    // card and the trial length lives in TRIAL_LENGTH_DAYS. A copy of either on
    // the wire is a second source of truth that will go stale silently. The
    // closed key set is the guard; the digit check catches a figure smuggled
    // into a value.
    const ALLOWED = ['signup', 'billing'];
    for (const p of plans) {
      for (const annual of both) {
        const { params, href } = shown(p, annual);
        expect([...params.keys()]).toEqual(ALLOWED);
        expect(new URL(href).search).not.toMatch(/[0-9]/);
      }
    }
  });

  it('translates the toggle at exactly one boundary', () => {
    // `cardTerms` is that boundary — the only place "Annual" becomes `yearly`.
    // Asserted directly so the translation keeps a named home of its own.
    for (const p of plans) {
      expect(cardTerms(p.monthly, true)).toEqual({ price: annualMonthly(p.monthly), billing: 'yearly' });
      expect(cardTerms(p.monthly, false)).toEqual({ price: p.monthly, billing: 'monthly' });
    }
  });
});

describe('the cross-repo price contract', () => {
  it('the cross-repo annual contract still throws when the prices disagree', async () => {
    // The contract runs at module scope, so this file having imported ./Pricing
    // at all is the proof that it passes for today's prices. Two things are
    // left to pin down, and neither is visible from the exports.
    const src = await readFile(fileURLToPath(new URL('./Pricing.tsx', import.meta.url)), 'utf8');

    // 1. It still THROWS, and names the tier. Downgraded to a warning it would
    //    ship exactly the mismatch it exists to stop, and the build would pass.
    expect(src).toMatch(/if \(annualMonthly\(p\.monthly\) !== expected\) \{\s*\n\s*throw new Error\(/);
    expect(src).toMatch(/const EXPECTED_ANNUAL_MONTHLY: Record<string, number> = \{/);

    // 2. It still has teeth: move the multiplier by a month on this side alone
    //    and at least one tier stops matching the figure the app publishes, so
    //    the check fires rather than agreeing with whatever it is handed.
    const shifted = (monthly: number) => Math.round((monthly * (ANNUAL_BILLED_MONTHS + 1)) / 12);
    expect(plans.some((p) => shifted(p.monthly) !== annualMonthly(p.monthly))).toBe(true);
  });
});
