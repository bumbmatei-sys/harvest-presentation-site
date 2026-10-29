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
 * for the six plan prices, and for the same reason: two repos, no shared code.
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
    // The concrete numbers, so a silent change to the derivation is still
    // caught. ⚠️ These moved with the plan price (THE-343, THE-372, and the
    // two-plan reprice), not here: five churches on the $90 Ministry plan at
    // 30% is $135 a month and $1,620 over the twelve. The RATE
    // is what this file guards and it is untouched — 0.30 both before and
    // after — which is exactly what the derivation above proves.
    expect(AFFILIATE_COMMISSION_RATE).toBe(0.30);
    expect(fiveMonthly).toBe(135);
    expect(yearTotal.toLocaleString()).toBe('1,620');
  });

  it('🔴 NO file in the repo still claims a 15% commission — repo-wide sweep', () => {
    // Walks the whole tree rather than the claims list: a list-shaped sweep is
    // only as good as its list, and the app-side twin of this test passed while
    // four real claims were still wrong.
    //
    // A bare "15%" grep is useless here — it hits the competitor's 2.15% card
    // rate (§ 4). What is swept for is a
    // 15% sitting in a COMMISSION SENTENCE: the two within a few words.
    const COMMISSION_15 =
      /(commission|affiliate|refer(?:ral|red|s)?|earns?|pays? you)[^.\n]{0,80}\b15%|\b15%[^.\n]{0,80}(commission|of what|of subscription|of revenue|recurring)/i;

    // This file quotes the old rate to describe the change.
    const ALLOWED = new Set(['content/the-269-affiliate-rate.test.ts']);

    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(abs); continue; }
        if (!/\.(ts|tsx|md)$/.test(entry.name)) continue;
        const rel = path.relative(SRC, abs);
        if (ALLOWED.has(rel)) continue;
        for (const line of fs.readFileSync(abs, 'utf8').split('\n')) {
          if (COMMISSION_15.test(line)) offenders.push(`${rel}: ${line.trim().slice(0, 100)}`);
        }
      }
    };
    walk(SRC);
    expect(offenders, `these still claim a 15% commission:\n${offenders.join('\n')}`).toEqual([]);
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
   3 — no-regression: the flag and the six plan prices.
   ═══════════════════════════════════════════════════════════════════════════ */
describe('3 — what this change must NOT have moved', () => {
  it('AFFILIATE_PROGRAM_ENABLED is still false', () => {
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    expect(read('lib/flags.ts')).toMatch(/^export const AFFILIATE_PROGRAM_ENABLED = false;$/m);
  });

  it('the four plan prices are the approved ones', () => {
    // The cross-repo price contract throws at module scope during prerender if
    // these disagree with the app. The commission rate is deliberately not one
    // of the four, and this is the check that it stayed that way.
    const table = Object.fromEntries(plans.map((p) => [p.planId, p.price]));
    expect(table).toEqual({
      plus: { monthly: 30, yearly: 300 },
      max:  { monthly: 90, yearly: 900 },
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
  it('the only term discount is yearly ("2 months free", contract number 16), and the quarterly 15% is gone for good', () => {
    // The yearly discount is not a commission and sits beside real prices. The
    // quarterly term (and its badge) was withdrawn on 2026-10-23, so there is no
    // longer a 15% discount anywhere for a rate sweep to mistake for one.
    expect(read('components/Pricing.tsx')).toContain(
      'ADVERTISED_DISCOUNT_PCT: Record<DiscountedTerm, number> = { yearly: 16 }',
    );
    expect(read('components/Pricing.tsx')).not.toMatch(/15% off a quarter|−15% quarterly/);
  });

  it('the pricing suites still describe the badge as "2 months free" and not computed from the prices', () => {
    for (const f of [
      'components/PricingAddOns.test.ts',
      'components/PricingComparison.test.ts',
      'content/plan-claims.test.ts',
    ]) {
      expect(read(f), `${f} lost the discount-badge note`)
        .toContain('badge reads "2 months free"');
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

  it('the decorative alpha values are untouched', () => {
    // A blind find-and-replace here changes a border and a focus ring, and
    // nobody notices for months.
    const mock = read('components/FeatureMock.tsx');
    expect(mock.match(/rgba\(45,37,25,0\.15\)/g)).toHaveLength(2);
    // Fabale rebuild expresses the same 15% ring through a theme token.
    expect(read('pages/ContactPage.tsx')).toContain('0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent)');
  });
});
