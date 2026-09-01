import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  AFFILIATE_COMMISSION_RATE,
  AFFILIATE_COMMISSION_RATE_PERCENT,
  AFFILIATE_RATE_CLAIMS,
  affiliateRateContract,
} from './affiliate-rate';
import { AFFILIATE_PROGRAM_ENABLED } from '../lib/flags';
import { plans } from '../components/Pricing';

/**
 * THE-269 — the affiliate commission rate is 30%, not 15%.
 *
 * Founder decision, 2026-09-01. Copy only on this side: the site advertises the
 * rate, the app computes it.
 *
 * ─── The cross-repo half, and how it is asserted ─────────────────────────────
 *
 * `APP_AFFILIATE_RATE_PERCENT` below is the app's `AFFILIATE_RATE` transcribed
 * as a literal — the same mechanism `EXPECTED_PLAN_PRICES` in Pricing.tsx uses
 * for the nine plan prices, and for the same reason: two repos, no shared code.
 * The app pins the site's number in `src/lib/__tests__/the-269-affiliate-rate.
 * test.ts`; this file pins the app's. A one-sided edit fails one of them.
 *
 * ⚠️ NO `git show` and no reading the other repo off disk — this has to pass on
 * a shallow clone, in CI, and on a branch.
 *
 * ─── 🔴 The traps this suite exists to hold ──────────────────────────────────
 *
 * "15%" and "0.15" appear all over this repo and MOST OF THEM ARE NOT THE
 * COMMISSION. Section 4 pins every one that was deliberately left alone, so a
 * future rate sweep cannot eat them:
 *
 *   · the −15% QUARTERLY DISCOUNT badge (Pricing.tsx and five pricing suites) —
 *     a term discount, not a commission
 *   · `2.15%` in the Planning Center comparison post — that competitor's CARD
 *     PROCESSING rate, and the post makes no affiliate claim at all
 *   · `rgba(…, 0.15)` in FeatureMock.tsx and ContactPage.tsx — a border and a
 *     focus-ring alpha
 */

const SRC = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(SRC, rel), 'utf8');

/**
 * The app's half, transcribed. NOTHING RENDERS THIS — it is one side of a
 * two-sided contract. Update it with Harvest-agent
 * `src/app/api/stripe/webhook/route.ts` `AFFILIATE_RATE`, in the same change.
 */
const APP_AFFILIATE_RATE_PERCENT = 30;

/* ═══════════════════════════════════════════════════════════════════════════
   1 — every affiliate surface claims 30%.
   ═══════════════════════════════════════════════════════════════════════════ */
describe('1 — every affiliate surface claims 30%', () => {
  it.each(AFFILIATE_RATE_CLAIMS)('%s carries "%s"', (file, claim) => {
    expect(read(file), `${file} does not carry the claim`).toContain(claim);
  });

  it('the worked earnings example is 30% arithmetic, not 15%', () => {
    // 🔴 THE ONE THE BRIEF DID NOT LIST. features.ts quotes a computed figure,
    // and the-197-stale-prices.test.ts derives it from the Ministry price and
    // the rate — so a rate change that missed this sentence would leave the
    // page advertising 30% beside earnings totalled at 15%.
    const ministryMonthly = plans.find((p) => p.planId === 'max')!.price.monthly;
    const perChurch = ministryMonthly * AFFILIATE_COMMISSION_RATE;
    const fiveMonthly = Math.round(perChurch * 5);
    const yearTotal = perChurch * 5 * 12;
    expect(read('content/features.ts')).toContain(
      `refer five churches on the $${ministryMonthly} plan and that’s about ` +
      `$${fiveMonthly} a month for twelve months, roughly $${yearTotal.toLocaleString()} in total`,
    );
    // The concrete numbers, so a silent change to the derivation is still caught.
    expect(fiveMonthly).toBe(120);
    expect(yearTotal.toLocaleString()).toBe('1,440');
  });

  it('no affiliate surface still claims 15%', () => {
    // Scoped to the files that make the claim. A repo-wide `15%` grep would hit
    // the quarterly discount badge and the competitor's card rate — see § 4.
    for (const file of [...new Set(AFFILIATE_RATE_CLAIMS.map(([f]) => f))]) {
      expect(read(file), `${file} still claims 15%`).not.toMatch(/\b15% (recurring|of|for|·|\/)/);
    }
    expect(read('content/coming-soon.ts')).not.toMatch(/\b15%/);
    expect(read('components/Affiliate.tsx')).not.toMatch(/\b15%/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2 — the site and the app agree on the rate.
   ═══════════════════════════════════════════════════════════════════════════ */
describe('2 — the site and the app agree', () => {
  it('the advertised rate is the rate the app pays', () => {
    expect(AFFILIATE_COMMISSION_RATE_PERCENT).toBe(APP_AFFILIATE_RATE_PERCENT);
    expect(() => affiliateRateContract(APP_AFFILIATE_RATE_PERCENT)).not.toThrow();
  });

  it('the percent and the decimal form cannot drift apart', () => {
    expect(AFFILIATE_COMMISSION_RATE * 100).toBe(AFFILIATE_COMMISSION_RATE_PERCENT);
  });

  it('🔴 the contract has teeth — a disagreeing app rate throws, and names both sides', () => {
    // A contract only ever run against correct data is a contract nobody has
    // checked. This is the mutation the suite would otherwise rely on a human
    // to perform.
    expect(() => affiliateRateContract(15)).toThrow(/this site advertises 30%/);
    expect(() => affiliateRateContract(15)).toThrow(/the app .* pays 15%/s);
    expect(() => affiliateRateContract(15)).toThrow(/AFFILIATE_RATE/);
  });

  it('names the app file a reader has to change with it', () => {
    const self = read('content/affiliate-rate.ts');
    expect(self).toContain('Harvest-agent');
    expect(self).toContain('src/app/api/stripe/webhook/route.ts');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3 — no-regression: the flag and the nine plan prices.
   ═══════════════════════════════════════════════════════════════════════════ */
describe('3 — what this change must NOT have moved', () => {
  it('AFFILIATE_PROGRAM_ENABLED is still false', () => {
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    expect(read('lib/flags.ts')).toMatch(/^export const AFFILIATE_PROGRAM_ENABLED = false;$/m);
  });

  it('the nine plan prices are unchanged', () => {
    // The cross-repo price contract throws at module scope during prerender if
    // these disagree with the app. The commission rate is deliberately not one
    // of the nine, and this is the check that it stayed that way.
    const table = Object.fromEntries(plans.map((p) => [p.planId, p.price]));
    expect(table).toMatchObject({
      plus: { monthly: 20, quarterly: 54,  yearly: 190 },
      pro:  { monthly: 40, quarterly: 108, yearly: 380 },
      max:  { monthly: 80, quarterly: 216, yearly: 760 },
    });
  });

  it('the rate is not wired into the price contract', () => {
    const pricing = read('components/Pricing.tsx');
    expect(pricing).not.toContain('AFFILIATE_COMMISSION_RATE');
    expect(pricing).not.toContain('affiliate-rate');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   4 — every 15% / 0.15 left alone, pinned so a future sweep cannot eat it.
   ═══════════════════════════════════════════════════════════════════════════ */
describe('4 — the 15%s that are not the commission', () => {
  it('the quarterly DISCOUNT badge is still 15%', () => {
    // −15% is what a church saves on the quarterly term. It is not a commission,
    // it sits beside real prices, and changing it would misstate what a visitor
    // pays. The 30%/15% pair here is the yearly/quarterly discount, and the
    // pricing suites assert both.
    expect(read('components/Pricing.tsx')).toContain('15% off a quarter is x2.55');
    expect(read('components/Pricing.tsx')).toContain('looking at a −15% quarterly badge');
    expect(read('components/the-248-discount-alignment.test.ts')).toContain("not.toContain('-15%')");
  });

  it('the pricing suites still describe the badges as 15% and 30% OFF', () => {
    for (const f of [
      'components/PricingAddOns.test.ts',
      'components/PricingComparison.test.ts',
      'content/plan-claims.test.ts',
    ]) {
      expect(read(f), `${f} lost the discount-badge note`)
        .toContain('badges are 15% and 30% and are NOT computed from the prices');
    }
  });

  it("the blog post's 2.15% is a competitor's card rate, and it makes no affiliate claim", () => {
    // 🔴 The brief flagged this post as a live 15% commission claim to decide
    // about. It is not one: its only "15%" is inside `2.15%`, Planning Center's
    // card processing rate, and the post never mentions affiliates at all. There
    // was no dated-content dilemma to resolve, and nothing here was edited.
    const post = read('content/posts/planning-center-alternative-small-churches.md');
    expect(post).toContain('2.15% + $0.30 on cards');
    expect(post).not.toMatch(/affiliate|commission|\brefer\b/i);
    expect(post).not.toMatch(/(?<![\d.])15%/);
  });

  it('the rgba alphas are untouched', () => {
    // A blind find-and-replace here changes a border and a focus ring, and
    // nobody notices for months.
    const mock = read('components/FeatureMock.tsx');
    expect(mock.match(/rgba\(45,37,25,0\.15\)/g)).toHaveLength(2);
    expect(read('pages/ContactPage.tsx')).toContain('0 0 0 3px rgba(201,150,58,0.15)');
  });
});
