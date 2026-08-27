import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ADD_ONS, BILLING_TERMS, ComparisonTable, DODO_ADD_ON_CATALOG, planPriceContract, plans, type BillingTerm } from './Pricing';

/* The contract's expectations, DERIVED from `plans` rather than typed out a
   fourth time. Handing it this passes; bumping one cell of it is a repo
   disagreeing with itself, which must throw. */
const EXPECTED_FOR_MUTATION: Record<string, Record<BillingTerm, number>> = Object.fromEntries(
  plans.map((p) => [p.planId, { ...p.price }]),
);

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

/**
 * ⚠️ MOCK PRODUCT SCREENSHOTS — A CHURCH'S MONEY, NEVER HARVEST'S PRICE.
 *
 * `components/FeatureMock.tsx` is a gallery of fake in-app screenshots: a
 * donation list, an event ticket table, a QuickBooks receipt ledger, a campaign
 * thermometer. Every dollar figure in it is SAMPLE DATA standing for a
 * congregation's own transactions — a $40 adult admission, a $50 gift, a
 * $250,000 campaign goal. None of it is a plan price and none of it is a claim
 * about what Harvest charges.
 *
 * 🔴 THIS EXEMPTION IS NEW, AND THE-222 IS WHY. The old prices — 39, 79, 159,
 * 99, 199, 399, 329, 659, 1329 — are odd figures that never turn up as a sample
 * ticket or a sample gift, so a bare `$`-scan over this file was clean for
 * free. The reprice to $20 / $40 / $80 ended that: those are the most ordinary
 * amounts in the file, and the scan started failing on a mock ticket price and
 * a mock receipt. Neither can quote a church anything.
 *
 * ⚠️ IT IS SCOPED TO THE CURRENT-PRICE SWEEP ONLY. This file stays inside the
 * RETIRED sweep below — a retired plan price appearing here would still be
 * caught — and the assertion beneath the sweep pins that the mock never names a
 * TIER beside a figure, which is the only way it could make a price claim at
 * all.
 */
const MOCK_UI_EXEMPT = ['components/FeatureMock.tsx'];

/** Every price this change published, as bare digits. */
const ALL_PRICE_DIGITS = [...new Set(plans.flatMap((p) => BILLING_TERMS.map((t) => String(p.price[t]))))];

/**
 * 🔴 A FIGURE THAT IS BOTH A PLAN PRICE AND AN ADD-ON PRICE CANNOT BE
 * ATTRIBUTED BY STRING MATCH, so it is not swept — it is pinned by context.
 *
 * This is the same reasoning the RETIRED list below applies to `$99` and
 * `$199`, arrived at from the other side. The figure that collides TODAY is
 * `$40`: THE-223 corrected Unlimited contacts to $40/mo, which is also Small
 * Team's monthly price, and no regex can tell the two apart — they are the same
 * three characters meaning different products.
 *
 * 🔴 `$20` USED TO BE HERE AND NO LONGER IS. THE-222 put Individual at $20 a
 * month while a $20 AI Assistant add-on was advertised, so the plan figure left
 * the sweep. THE-224 withdrew that card (see INTENTIONALLY_UNADVERTISED in
 * Pricing.tsx) and, because this set is DERIVED from `ADD_ONS` rather than
 * listed, $20 came back under the sweep with no edit here. That is the set
 * doing its job in the shrinking direction — worth saying, because every other
 * note in this file records it growing.
 *
 * ⚠️ THE COLLIDING FIGURE IS NOT LEFT UNGUARDED. Small Team's monthly price is
 * pinned by the cross-repo contract in Pricing.tsx, by FAQ_PLAN_CLAIMS in
 * content/faq.ts and by TIER_PRICE_CLAIMS in content/legal.ts — three
 * module-scope checks that fail the prerender and name the tier. What is given
 * up is a string sweep that could not have said which product it had found.
 *
 * Derived from `ADD_ONS` rather than listed, so an add-on repriced onto (or off)
 * a plan price moves this set without anyone remembering to.
 */
const ADD_ON_PRICE_DIGITS = new Set(
  ADD_ONS.flatMap((a) => [String(a.monthly), String(a.annual)]),
);

const PRICE_DIGITS = ALL_PRICE_DIGITS.filter((d) => !ADD_ON_PRICE_DIGITS.has(d));
/**
 * Prices this change RETIRED. None may survive in scanned source.
 *
 * 🔴 THE-222 MOVED THE TABLE DOWN A TIER, so five figures changed MEANING
 * rather than retiring, and not one of them may be banned:
 *
 *   $49    was Individual monthly (pre-THE-195) and was banned outright until
 *          now. It is Individual QUARTERLY as of THE-222, so it LEAVES this
 *          list — banning it would ban the live catalogue.
 *   $99    was Individual quarterly, is now Small Team quarterly.
 *   $199   was Small Team quarterly, is now Ministry quarterly.
 *   $329   was Individual yearly, is now Small Team yearly.
 *   $659   was Small Team yearly, is now Ministry yearly.
 *
 * They are distinguished by CONTEXT, not by string match: `PRICE_DIGITS` above
 * pins where each may appear, and the cross-repo contract pins what each means.
 *
 * 🔴 WHAT DID RETIRE: `39`, `79`, `159`, `399` and `1329` — the whole old
 * monthly column plus the two top-tier figures nothing inherited. They are a
 * price on no tier and no term now, so they are banned outright, exactly as
 * `$49` was and for the same reason: #56 had to fix three disconnected copies
 * of a figure a reprice had left behind.
 *
 * ─── 🔴 THE-248, AND THE THREE FIGURES IT COULD NOT BAN ──────────────────────
 *
 * THE-248 raised the six discounted cells, retiring `49`, `99`, `199`, `165`,
 * `329` and `659`. Only THREE of them join this list.
 *
 *   BANNED — `165`, `329`, `659`. Dead on every tier and every term, and each
 *     appears nowhere on this site in any other sense. (`0.165` in
 *     components/magic.tsx is a border-radius ratio and carries no `$`, so the
 *     `\$` anchor never reaches it.)
 *
 *   🔴 NOT BANNED — `49`, `99`, `199`. Each is still a REAL PRICE ON THIS
 *     PAGE — a competitor's. components/Replaces.tsx sells the "what you'd
 *     otherwise pay" table, and the prerendered output carries "Tithe.ly
 *     Donorbox $49–99/mo", "Skool $99/mo" and "Planning Center Check-Ins
 *     $99–199/mo"; the Planning Center blog post quotes Skool Pro at $99/mo.
 *     They survive today only because those figures are written WITHOUT a `$`
 *     in source (`cost: '49–99'`, and .md is outside this walk), so a ban would
 *     pass now and fire the first time someone writes a competitor price with
 *     its currency symbol attached — failing a true statement about another
 *     company's pricing. Banning a figure this site legitimately prints is how
 *     a rule gets deleted rather than obeyed.
 *
 * ⚠️ THAT IS NOT A HOLE. Those three are pinned by CONTEXT instead, which is
 * the stronger check anyway: the cross-repo contract in Pricing.tsx,
 * TIER_PRICE_CLAIMS in content/legal.ts and FAQ_PLAN_CLAIMS in content/faq.ts
 * each compare tier-by-tier and term-by-term and fail the prerender by name, so
 * a stale `$99` sitting where a Harvest price belongs is caught by the table it
 * disagrees with rather than by a string sweep that could never have said which
 * company's price it had found.
 */
const RETIRED = [
  '441', '891', '1791', '37', '74', '149', '39', '79', '159', '399', '1329',
  // THE-248's retirees. See above for the three deliberately absent.
  '165', '329', '659',
];

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
      if (MOCK_UI_EXEMPT.some((e) => file.endsWith(e))) continue;
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

  it('names the mock-UI exemption explicitly, and keeps it to the one file', () => {
    expect(MOCK_UI_EXEMPT).toEqual(['components/FeatureMock.tsx']);
  });

  /**
   * 🔴 THE COLLISION EXCLUSION IS ITSELF A HOLE, so its size is pinned.
   *
   * `PRICE_DIGITS` drops any figure that is also an add-on price. If add-ons
   * were ever repriced onto all nine plan figures the sweep would quietly
   * become a no-op and every assertion above would pass over an empty list.
   * Both halves are stated: exactly which figure collides today, and that eight
   * of the nine are still swept.
   */
  it('excludes only the figures that genuinely collide with an add-on price', () => {
    // 🔴 BACK TO ONE COLLISION — THE-224 SHRANK THIS HOLE RATHER THAN WIDENING
    // IT. THE-223 had grown it to two: correcting the add-ons against live Dodo
    // moved Unlimited Contacts to $40 (also Small Team's monthly), and the $20
    // AI Assistant collided with Individual's monthly. Withdrawing that card
    // takes $20 out of `ADD_ON_PRICE_DIGITS` — which is derived, so the set
    // moved on its own — and Individual's monthly price returns to the sweep.
    // Eight of the nine are swept now, where seven were.
    expect(ALL_PRICE_DIGITS).toHaveLength(9);
    expect([...ALL_PRICE_DIGITS].filter((d) => ADD_ON_PRICE_DIGITS.has(d)).sort()).toEqual(['40']);
    expect(PRICE_DIGITS).toHaveLength(8);
    expect(PRICE_DIGITS).toContain('20');
    expect(PRICE_DIGITS).not.toContain('40');
    // ⚠️ AND THE WITHDRAWN ADD-ON'S OWN PRICE DID NOT MOVE. $20/$240 is still
    // what Dodo charges and still what DODO_ADD_ON_CATALOG pins; it simply is
    // not advertised any more, so it no longer shields a plan figure.
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].monthlyCents).toBe(2000);
    expect(DODO_ADD_ON_CATALOG['AI Assistant'].annualCents).toBe(24000);
    // The one dropped is Small Team's monthly price, and it is the only one.
    expect(String(plans.find((p) => p.planId === 'plus')!.price.monthly)).toBe('20');
    expect(String(plans.find((p) => p.planId === 'pro')!.price.monthly)).toBe('40');
    // ⚠️ NEITHER IS LEFT UNGUARDED — asserted for both, because $20 has only
    // just rejoined the sweep and the guarantee that made dropping it
    // acceptable has to still hold. Both are pinned by the cross-repo contract in
    // Pricing.tsx, by FAQ_PLAN_CLAIMS and by TIER_PRICE_CLAIMS — three
    // module-scope checks that name the tier and fail the prerender. What is
    // given up is a string sweep that could not say which product it had found.
    for (const planId of ['plus', 'pro']) {
      const price = plans.find((p) => p.planId === planId)!.price;
      expect(() => planPriceContract(plans, {
        ...EXPECTED_FOR_MUTATION,
        [planId]: { ...EXPECTED_FOR_MUTATION[planId], monthly: price.monthly + 1 },
      })).toThrow(/monthly/);
    }
  });

  /**
   * 🔴 THE COMPENSATING GUARD for the exemption above.
   *
   * A mock screenshot can only make a PRICE CLAIM if it puts a tier's name
   * beside a figure — "Ministry $80/mo" in a fake settings panel would be a
   * pricing claim wearing a screenshot's clothes, and the digit sweep no longer
   * looks at this file. So the tier names are what is checked instead, in
   * executable source only: the two that appear in FeatureMock's comments are
   * prose about which vignette is which, and "Ministry name" is a form-field
   * label in a branding mock, not a tier.
   */
  it('the exempt mock never names a tier beside a price', () => {
    const mock = codeOf(join(SRC, 'components/FeatureMock.tsx'));
    for (const tier of plans.map((p) => p.name)) {
      // A tier name within ~40 characters of a dollar figure, either order.
      const nearPrice = new RegExp(`(${tier}[\\s\\S]{0,40}\\$\\d|\\$\\d[\\s\\S]{0,40}${tier})`);
      expect(mock, `FeatureMock puts "${tier}" beside a price — that is a plan claim, not a mock`)
        .not.toMatch(nearPrice);
    }
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
