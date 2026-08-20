import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BILLING_TERMS, ComparisonTable, plans } from './Pricing';

/* ─── THE-195 TESTS 10 & 11 ───────────────────────────────────────────────────
 *
 * Where a plan price is allowed to live, and what this change was not allowed
 * to touch. */

const SRC = fileURLToPath(new URL('..', import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

/**
 * The ONLY modules allowed to contain a plan price as a literal.
 *
 * Three, and each is a checked claim rather than a loose copy:
 *   · components/Pricing.tsx — the `plans` table, plus the cross-repo contract's
 *     independently-written transcription of the app's nine numbers. The
 *     contract exists BECAUSE they are written twice; that is the mechanism.
 *   · content/faq.ts and content/legal.ts — the FAQ's and the Terms' own price
 *     claims, each pinned by a module-scope mismatch check that fails the
 *     prerender. Written out on purpose so they are readable in review.
 *
 * Everything else must derive. #56 fixed three disconnected `$49` literals and
 * a `$59/mo` nav figure that outlived a reprice; this is what stops the fourth.
 */
const PRICE_BEARING = ['components/Pricing.tsx', 'content/faq.ts', 'content/legal.ts'];

/**
 * ⚠️ EDITORIAL PROSE, EXEMPT FROM THE LITERAL SCAN — NOT FROM BEING RIGHT.
 *
 * `content/features.ts` carries plan prices inside prose that makes a COMPARISON
 * ARGUMENT — affiliate arithmetic, a multi-campus bill worked out in the
 * sentence, "we take zero even on the cheapest plan". A figure embedded in an
 * argument's own arithmetic can't be scanned as a bare literal the way a card
 * price can — the sentence has to be read whole to know if it is right — so this
 * file is exempt from the mechanical per-digit checks below. It is listed here
 * rather than silently skipped so the exemption is visible in the diff and
 * someone has to justify each addition to it.
 *
 * The blog post `content/posts/planning-center-alternative-small-churches.md`
 * is in the same position and needs no entry: this walk scans .ts/.tsx only, so
 * prose files are out of its reach by construction. It is named here so the
 * second surface is not invisible just because nothing scans it.
 *
 * THE-197 corrected both against the THE-195 prices — the blog post's Harvest
 * figures and content/features.ts's "$39 plan" / "$159 plan" / "$159 + $220"
 * arithmetic — while leaving every competitor figure untouched. Being exempt
 * from this scan is not licence to drift again; `plan-claims.test.ts` and the
 * THE-197 guard in `content/features.test.ts` read these surfaces against
 * `PLAN_PRICING`/`plans` directly, which is what a literal-string scan cannot do
 * for prose built around arithmetic.
 */
const EDITORIAL_EXEMPT = ['content/features.ts'];

/** Every price this change published, as bare digits. */
const PRICE_DIGITS = [...new Set(plans.flatMap((p) => BILLING_TERMS.map((t) => String(p.price[t]))))];
/**
 * Prices this change RETIRED. None may survive in scanned source.
 *
 * ⚠️ `99` AND `199` ARE DELIBERATELY ABSENT. Both were old MONTHLY prices and
 * both are now real QUARTERLY ones — Individual is $99 a quarter, Small Team
 * $199 — so banning the string would ban the current catalogue. They are
 * distinguished by CONTEXT, not by string match: `PRICE_DIGITS` above pins
 * where each may appear, and the cross-repo contract pins what each means.
 *
 * `49` has no such collision — it is a price on no tier and no term any more —
 * so it is banned outright. It is also the exact literal #56 had to fix three
 * copies of.
 */
const RETIRED = ['49', '441', '891', '1791', '37', '74', '149'];

describe('no price literal appears outside the single source', () => {
  const modules = walk(SRC).filter((f) => !PRICE_BEARING.some((allowed) => f.endsWith(allowed)));

  it('finds the modules to scan at all', () => {
    // A walk that silently matched nothing would pass every assertion below.
    expect(modules.length).toBeGreaterThan(20);
  });

  /**
   * Comments are stripped before scanning.
   *
   * A comment that says "#56 fixed three disconnected $49 literals" is the
   * HISTORY of the rule, and it renders nothing. Only executable source can
   * quote a church the wrong price, and a rule that failed on its own rationale
   * would be turned off rather than obeyed.
   */
  const codeOf = (file: string) =>
    readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '');

  it.each(PRICE_DIGITS)('no module outside the source restates $%s', (digits) => {
    for (const file of modules) {
      if (EDITORIAL_EXEMPT.some((e) => file.endsWith(e))) continue;
      const src = codeOf(file);
      // `$99` in a template literal or in prose — a dollar sign immediately
      // followed by the figure. Bare integers are not searched: `99` is also a
      // border-radius, and a match on one of those is noise that would get this
      // test deleted rather than fixed.
      expect(src, `${file} writes $${digits} as a literal — prices derive from \`plans\``)
        .not.toMatch(new RegExp(`\\$${digits}(?![0-9])`));
    }
  });

  it.each(RETIRED)('no module anywhere still carries the retired price $%s', (digits) => {
    for (const file of walk(SRC)) {
      if (EDITORIAL_EXEMPT.some((e) => file.endsWith(e))) continue;
      const src = codeOf(file);
      expect(src, `${file} still carries the pre-THE-195 price $${digits}`)
        .not.toMatch(new RegExp(`\\$${digits}(?![0-9])`));
    }
  });

  it('names every editorial exemption explicitly, and keeps the list short', () => {
    // The exemption is the dangerous part of this test: an over-broad list
    // turns it into a no-op. One entry, and it is editorial prose.
    expect(EDITORIAL_EXEMPT).toEqual(['content/features.ts']);
  });
});

/* ─── THE-195 TEST 11 ─────────────────────────────────────────────────────────
   Prices and terms changed. What each tier INCLUDES did not. */
describe('the plan feature matrix is unchanged', () => {
  const rendered = renderToStaticMarkup(React.createElement(ComparisonTable));
  const text = rendered.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  it('still lists each tier with the same bullets it listed before', () => {
    // The card bullet lists, verbatim. A repricing that quietly moved a feature
    // between tiers would be a different product sold at a new price.
    expect(plans.find((p) => p.planId === 'plus')!.features).toEqual([
      '150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses',
      'CRM (Donors & Members)', 'SMS (bring your own Twilio)', 'Donation page & Fundraising',
    ]);
    expect(plans.find((p) => p.planId === 'pro')!.features).toEqual([
      'Everything in Individual', '500 contacts · 5 admins', '5 courses', 'Livestream + Live Giving',
      'Check-In System (QR)', 'Docs & Notes', 'Sermon Notes → Livestream', 'Church Map', 'Newsletter',
    ]);
    expect(plans.find((p) => p.planId === 'max')!.features).toEqual([
      'Everything in Small Team', '2,000 contacts · 15 admins', '15 courses',
      'Custom Branding & Domain', 'Community Groups & Events', 'Automated SEO Blog & Newsletter',
      'Custom Forms → CRM', 'Tax Receipts & Statements', 'Accounting + QuickBooks',
    ]);
  });

  it('keeps the comparison table ceilings where they were', () => {
    for (const row of ['150', '500', '2,000', '2', '5', '15']) {
      expect(text, `the comparison table no longer states "${row}"`).toContain(row);
    }
  });

  it('keeps the platform fee at zero on every tier', () => {
    // PLATFORM_FEE_MAP and the 0% donation fee were explicitly out of scope.
    for (const p of plans) expect(p.fee).toBe(0);
  });

  it('carries no price at all in the comparison table', () => {
    // The matrix answers "what do I get", never "what does it cost" — the cards
    // above it own that, and a price here would be a fourth source.
    expect(text).not.toMatch(/\$[0-9]/);
  });
});
