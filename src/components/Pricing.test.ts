import { describe, expect, it } from 'vitest';
import { ANNUAL_BILLED_MONTHS, ANNUAL_DISCOUNT_PCT, annualMonthly, plans } from './Pricing';

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
