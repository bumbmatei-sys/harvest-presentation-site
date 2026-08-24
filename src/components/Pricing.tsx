import React from 'react';
import { useAppSignupUrl, type BillingPeriod } from '../lib/ref';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { I } from './icons';
import { Kicker, H2, container, softCard } from './shared';
import { MERCHANT_OF_RECORD_NOTE } from '../content/legal';

export interface Plan {
  name: string;
  planId: string; // load-bearing: forwarded to the app via appSignupUrl(planId)
  /**
   * The CHARGED price on each term, in whole USD — three numbers, not a monthly
   * figure plus a multiplier. The multiplier is gone: 30% off a year is x8.4
   * months and 15% off a quarter is x2.55, so there is no integer to name and
   * the prices are stored. The cross-repo contract below compares this table
   * against the app's, cell for cell.
   */
  price: Record<BillingTerm, number>;
  // Platform fee as a DECIMAL fraction, mirroring the app's PLATFORM_FEE_MAP
  // (src/lib/stripe-config.ts). Single source of truth for the marketing site:
  // the pricing cards read from here so the number can never drift. It is flat
  // zero on every plan today — Harvest takes no cut of a donation — which is
  // why there is no per-tier fee row in the comparison table: three identical
  // cells in a differentiation grid earn nothing. Do NOT reintroduce a
  // "retention" field; it was a derived complement of this one, and carrying
  // two numbers for one fact is what let "keeps 100%" outlive a nonzero fee.
  fee: number;
  popular?: boolean;
  blurb: string;
  features: string[];
}

/**
 * The billing terms this site sells, cheapest-commitment first. The order the
 * toggle renders in.
 *
 * ⚠️ CROSS-REPO VOCABULARY: the app's `BillingPeriod` (lib/ref.ts) is the same
 * three words, and `cardTerms` is the one place a card's term is translated into
 * the `?billing=` value its button carries.
 */
export const BILLING_TERMS = ['monthly', 'quarterly', 'yearly'] as const;

export type BillingTerm = (typeof BILLING_TERMS)[number];

/** Months of service one charge on a term buys — what a saving is measured against. */
export const TERM_MONTHS: Readonly<Record<BillingTerm, number>> = Object.freeze({
  monthly: 1,
  quarterly: 3,
  yearly: 12,
});

/** The suffix a term's CHARGED figure carries. "$329/yr", never "$329/mo". */
export const TERM_SUFFIX: Readonly<Record<BillingTerm, string>> = Object.freeze({
  monthly: 'mo',
  quarterly: 'qtr',
  yearly: 'yr',
});

/** The label each segment of the term toggle wears. */
export const TERM_LABEL: Readonly<Record<BillingTerm, string>> = Object.freeze({
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
});

/**
 * ─── 🔴 THE PER-MONTH HEADLINE (THE-196) ─────────────────────────────────────
 *
 * This was `Math.round(price / months)`, which was fine while the per-month
 * figure was a footnote under the charged total. THE-196 makes it the HEADLINE,
 * and a rounded-to-nearest headline understates two of the six discounted cells:
 *
 *     Individual yearly    $329/12 = $27.4167  →  $27  → implies $324, bills $329
 *     Small Team quarterly $199/3  = $66.3333  →  $66  → implies $198, bills $199
 *
 * A church reading "$27/mo" expects $324 a year. That is a pricing
 * misrepresentation, not a rounding preference, so the headline is CEILED — it
 * may never imply less than the bill.
 *
 * Ceiled at the CENT rather than the dollar. Ceiling to the dollar also never
 * understates, but it puts "$28/mo" directly above "billed as $329 every 12
 * months", and $28 x 12 is $336: the two numbers on the card would not
 * reconcile, which is the same class of defect this ticket exists to remove.
 * At the cent they reconcile to within four cents — the rounding itself.
 *
 * ⚠️ MUST MATCH THE APP. `plan-features.ts` in Harvest-agent carries the same
 * rule as `ceilToCent`, and `planPriceContract` below compares the two repos'
 * price tables. A church can see the marketing card and the in-app card in one
 * session and they must not present a price differently.
 *
 * The `toFixed(6)` guards the exact divisions: $99/3 is $33.00, and a binary
 * float landing a hair above 3300 cents would ceil an exact $33 to $33.01.
 */
export const ceilToCent = (exact: number) =>
  Math.ceil(Number((exact * 100).toFixed(6))) / 100;

/** The per-month figure a card headlines, as a number. Ceiled at the cent. */
export const termMonthlyEquivalent = (price: number, term: BillingTerm) =>
  ceilToCent(price / TERM_MONTHS[term]);

/**
 * The headline as it is printed — `$27.42`, `$33`, `$159`. An exact division
 * keeps its whole-dollar form; only a real remainder shows cents.
 */
export const formatMonthlyHeadline = (price: number, term: BillingTerm) => {
  const v = termMonthlyEquivalent(price, term);
  return `$${v.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * 🔴 THE HONESTY GUARD, run at module scope with the other contracts.
 *
 * ⚠️ It takes the ROUNDING RULE as its subject, deliberately. Checked against
 * `ceilToCent` alone it could never fail — a ceiling cannot round down — so it
 * would be true by construction and would guard nothing. What can regress is
 * the rule: `Math.round` restored, or the cents "tidied" to whole dollars.
 * Passing the rule in makes the contract a statement ABOUT the rule, and the
 * module-scope call binds it to the one the cards actually render.
 */
export function monthlyHeadlineContract(
  round: (exact: number) => number = ceilToCent,
  table: readonly Plan[] = plans,
): void {
  for (const plan of table) {
    for (const term of BILLING_TERMS) {
      const charged = plan.price[term];
      const months = TERM_MONTHS[term];
      const implied = round(charged / months) * months;
      if (implied < charged - 1e-9) {
        throw new Error(
          `Pricing: the ${plan.name} ${term} headline of $${round(charged / months)}/mo implies ` +
            `$${implied.toFixed(2)} over ${months} months, but Dodo charges $${charged}. ` +
            `A headline may never promise less than the bill.`,
        );
      }
    }
  }
}

/* ─── 🔴 THE CRM LABEL, PER TIER (THE-205) ────────────────────────────────────

   "Donors" is a claim about FUNDRAISING, not about the CRM. Free is
   `fundraising: false` in the app's matrix — no donate page, so no donor
   record can ever exist — and "CRM (Donors & Members)" on the free card
   therefore advertised half a roster the tier is structurally unable to fill.

   🔴 ONLY FREE CHANGES. Every priced tier has `fundraising: true`, so all three
   still read "CRM (Donors & Members)", character for character.

   ⚠️ THIS REPLACES FOUR HAND-WRITTEN COPIES, it does not add a fifth. Before
   this, the string was a literal on the Individual card, a literal on the free
   card, and a literal on the comparison row — three copies of one piece of
   feature vocabulary, which is exactly how a label drifts from the matrix it
   describes. They now all read this function.

   The app carries the same two strings in `crmLabel` (Harvest-agent
   src/utils/plan-features.ts), deliberately: the two repos cannot import from
   each other, so this is the same two-sided seam as the price contract below —
   two independently-written copies, each pinned by its own test. Change them
   together. The catalogue entry in components/catalog.ts is NOT a pricing claim
   (it describes the product, not a tier) and is deliberately left alone.        */
export function crmLabel(planId: string): string {
  return planId === FREE_TIER_PLAN_ID ? 'CRM (Members)' : 'CRM (Donors & Members)';
}

/** The app's `TenantPlan` value for the unpriced tier. Named once so the label
 *  above and the FREE_TIER record below cannot disagree about what "free" is. */
const FREE_TIER_PLAN_ID = 'free';

// planId values are the app's `TenantPlan` union — 'plus' | 'pro' | 'max'.
// Anything else here deep-links signup to a plan the app cannot resolve.
export const plans: Plan[] = [
  { name: 'Individual', planId: 'plus', price: { monthly: 20, quarterly: 49,  yearly: 165 }, fee: 0, blurb: 'For solo evangelists and missionaries.', features: ['150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses', crmLabel('plus'), 'SMS (bring your own Twilio)', 'Donation page & Fundraising'] },
  { name: 'Small Team', planId: 'pro',  price: { monthly: 40, quarterly: 99,  yearly: 329 }, fee: 0, blurb: 'For small ministries growing as a team.', features: ['Everything in Individual', '500 contacts · 5 admins', '5 courses', 'Livestream + Live Giving', 'Check-In System (QR)', 'Docs & Notes', 'Sermon Notes → Livestream', 'Church Map', 'Newsletter'] },
  { name: 'Ministry',   planId: 'max',  price: { monthly: 80, quarterly: 199, yearly: 659 }, fee: 0, popular: true, blurb: 'For established churches going deeper.', features: ['Everything in Small Team', '2,000 contacts · 15 admins', '15 courses', 'Custom Branding & Domain', 'Community Groups & Events', 'Automated SEO Blog & Newsletter', 'Custom Forms → CRM', 'Tax Receipts & Statements', 'Accounting + QuickBooks'] },
];

/* ─── 🔴 FOREVER FREE — A TIER, NOT A PRICE (THE-204) ─────────────────────────

   Free is deliberately NOT a member of `plans`.

   `Plan.price` is `Record<BillingTerm, number>` — three numbers, all required.
   Free has no price and no billing term, so putting it in `plans` would mean
   writing three zeros, and three zeros is a lie of a different kind: it says
   "this tier is billed, at nothing" when the truth is that it is not billed at
   all. It would also walk straight into the cross-repo price contract below,
   which compares `plans` cell-for-cell against the app's PLAN_PRICING — and
   the app deliberately keeps free OUT of PLAN_PRICING for exactly this reason.
   A zero row here would demand a zero row there, and the contract would stop
   guarding the thing it exists to guard.

   So this mirrors the seam the app already uses:

     app:   PLAN_ORDER (every tier)  vs  PRICED_PLANS (every tier you can buy)
     site:  ALL_TIER_NAMES           vs  plans

   `plans` stays the PRICED list, unchanged and still three long. Everything
   that reads it — the price contract, CHEAPEST_MONTHLY, the add-on
   availability strings, Replaces.tsx, FeatureBlock.tsx, FaqPage, LegalPage —
   keeps meaning "the plans you can buy", which is what every one of them
   actually wanted. Only the two surfaces that show the whole ladder, the card
   row and the comparison table, add free explicitly.                          */
export interface FreeTier {
  name: string;
  planId: string;
  /** No `price`. No `fee` either — a tier with no donate page charges no fee on
   *  a gift it cannot receive, and printing "0% platform fee" beside "no
   *  donation page" reads as a feature rather than as the absence of one. */
  blurb: string;
  features: string[];
  /** Stated on the card in its own right. Every other card leads with 0%
   *  donation fees, so a free card that merely OMITS the donate page invites
   *  the reader to assume it has one. */
  noDonatePage: string;
}

export const FREE_TIER: FreeTier = {
  name: 'Forever Free',
  planId: 'free',
  blurb: 'For evangelists discipling the people they lead to Christ.',
  // 🔴 EVERY LINE DERIVED FROM THE APP'S MATRIX, none written from the brief.
  // free: maxContacts 500, maxCourses 1, maxAdmins 1, crm true, pwaApp true,
  // and every other cell false. Five false claims have already been fixed on
  // this site; this card is the sixth opportunity and it is not being taken.
  features: [
    '500 members · 1 admin',
    '1 course, adopted from the library',
    // 🔴 MEMBERS ONLY (THE-205). Was 'CRM (Donors & Members)'. free is
    // `fundraising: false`: there is no donate page, so no donor record can
    // exist to be managed. Derived from `crmLabel` rather than rewritten here,
    // so this card and the Individual card above cannot disagree about the
    // vocabulary while disagreeing about the tier.
    crmLabel(FREE_TIER_PLAN_ID),
    'Mobile App (PWA)',
    'Bible',
    'Prayer Requests',
    // 🔴 'News & Community Feed' WAS HERE and is deliberately gone (THE-205).
    // Not a copy fix: the feed was ungated on every tier because it had no flag
    // at all, and the app added `newsFeed` to close it — false on free, true on
    // the three tiers that pay. Free is discipleship only, so the card must not
    // list a surface a free member cannot reach. This is the SIXTH false claim
    // corrected on this site; the five before it are why every line here is
    // pinned against the matrix in PricingComparison.test.ts rather than
    // proof-read.
    'Your own subdomain',
  ],
  noDonatePage: 'No donation page — giving and fundraising start on Individual.',
};

/* The free tier is not billed, so no term applies to it. Stated as a constant
   rather than left implicit in the card so the toggle cannot ever be wired to
   it by a later edit that "makes the cards consistent". */
export const FREE_TIER_HAS_NO_BILLING_TERM = true;

/** Every tier the ladder actually has, free first — the app's PLAN_ORDER. Used
 *  by the comparison table's header and by nothing that prices anything. */
export const ALL_TIER_NAMES = [FREE_TIER.name, ...plans.map((p) => p.name)];

/* ─── 🔴 CROSS-REPO PRICE CONTRACT ────────────────────────────────────────────

   The numbers this site must show, and the numbers the app's PLAN_PRICING
   publishes for the same tiers. This repo has no test runner, so the check runs
   at module scope and throws during the prerender, the same idiom as the
   comparison-row width check below: a build failure beats shipping a pricing
   page that disagrees with the app.

   ⚠️ WHAT CHANGED, AND WHY IT IS NOT A WEAKENING. This contract used to hold
   three numbers — the expected monthly-equivalents 37 / 74 / 149 — and check
   them against `annualMonthly(p.monthly)`, i.e. against the OUTPUT of a
   multiplier. There is no multiplier any more: the discounts stopped dividing
   into whole months, so both repos now carry a stored table and the contract
   compares TABLE TO TABLE, nine cells against nine, tier by tier and term by
   term. That is strictly MORE than it guarded before — it previously could not
   see a wrong monthly price at all, only a wrong derivation from one — and it
   still throws, still names the tier and term, and still stops the build.

   These nine are deliberately written as literals and NOTHING RENDERS THEM.
   They are the app's side of the contract, transcribed; the cards render
   `plans` above. Two independently-written copies of the same nine numbers is
   the entire mechanism — a one-sided edit makes them disagree and the build
   stops here. Update these together with the app's PLAN_PRICING
   (Harvest-agent src/utils/plan-features.ts), in the same change.               */
const EXPECTED_PLAN_PRICES: Record<string, Record<BillingTerm, number>> = {
  plus: { monthly: 20, quarterly: 49,  yearly: 165 },
  pro:  { monthly: 40, quarterly: 99,  yearly: 329 },
  max:  { monthly: 80, quarterly: 199, yearly: 659 },
};

/**
 * The contract itself. Exported and called at module scope, the same shape as
 * `addOnPricingContract` below: calling it is what fails the prerender, and
 * exporting it is what lets a test hand it a DELIBERATELY WRONG table and prove
 * it throws. A contract that has only ever been run against correct data is a
 * contract nobody has checked has teeth.
 */
export function planPriceContract(
  list: readonly Plan[],
  expectedPrices: Record<string, Record<BillingTerm, number>> = EXPECTED_PLAN_PRICES,
): void {
  for (const p of list) {
    const expected = expectedPrices[p.planId];
    if (expected === undefined) {
      throw new Error(`Pricing: plan "${p.planId}" has no expected prices in the cross-repo contract.`);
    }
    for (const term of BILLING_TERMS) {
      if (p.price[term] !== expected[term]) {
        throw new Error(
          `Pricing: ${p.name} (${p.planId}) renders $${p.price[term]} ${term}, but the app ` +
          `(Harvest-agent src/utils/plan-features.ts PLAN_PRICING) publishes $${expected[term]}. ` +
          `The two repos cannot share code — one of them was changed without the other.`
        );
      }
    }
  }
}

planPriceContract(plans);

/**
 * The percentages this site ADVERTISES on the term toggle.
 *
 * 🔴 STORED, NOT COMPUTED FROM THE PRICES. The founder chose rounded prices over
 * exact percentages — $405.45 on a pricing page reads like a spreadsheet error —
 * so every tier saves a different amount, and a computed badge would read 16%
 * beside the Ministry card and 15% beside the Individual one, on a toggle that
 * sits above all three at once. One number is the only honest presentation of a
 * control that governs all three cards, and one number cannot be derived from
 * three. Kept identical to the app's ADVERTISED_DISCOUNT_PCT.
 */
export const ADVERTISED_DISCOUNT_PCT: Record<DiscountedTerm, number> = { quarterly: 15, yearly: 30 };

export type DiscountedTerm = Exclude<BillingTerm, 'monthly'>;

/** The two terms carrying a discount. Derived, so a term cannot be forgotten. */
export const DISCOUNTED_TERMS = BILLING_TERMS.filter((t): t is DiscountedTerm => t !== 'monthly');

/** What `plan` on `term` actually saves against paying monthly, exactly. */
export const actualSavingPct = (plan: Plan, term: BillingTerm) =>
  (1 - plan.price[term] / (plan.price.monthly * TERM_MONTHS[term])) * 100;

/**
 * 🔴 THE HONESTY RULE, mechanised: no copy may claim a saving larger than the
 * smallest actual one.
 *
 * A flat "save 30%" is a claim about EVERY tier, so it is only true when the
 * worst tier saves at least 30%. The numbers, as of THE-222:
 *
 *              Quarterly   Yearly
 *   Individual    18.3%     31.3%
 *   Small Team    17.5%     31.5%
 *   Ministry      17.1%     31.4%
 *
 *   quarterly  advertises 15, worst tier saves 17.1  → 'flat'  → "Save 15%"
 *   yearly     advertises 30, worst tier saves 31.3  → 'flat'  → "Save 30%"
 *
 * ⚠️ YEARLY IS THE CASE THIS EXISTS FOR, AND IT HAS JUST FLIPPED. Under the
 * pre-THE-222 prices Individual saved 29.70% against an advertised 30% — three
 * tenths of a point short — so this returned 'upTo' and the badge read "Save up
 * to 30%". At $20/mo Individual's year is $165 against $240 bought monthly,
 * which is 31.25%, and it is STILL the worst yearly tier. Every tier now clears
 * 30, so the same derivation returns 'flat' and the qualifier drops off.
 *
 * 🔴 NOT A COPY EDIT. Nothing in this function changed — the prices moved under
 * it. That is the whole reason the wording is derived: this page has shipped a
 * false claim once already ("keeps 100%" against a real 2.5% fee), and a badge
 * that a human has to remember to re-word after a reprice is a badge that
 * eventually lies. If a future price puts a tier back under 30, "up to" returns
 * by itself.
 *
 * The NUMBER is stored; only the WORDING is derived. That is the split that
 * matters: the badge does not move when a price is rounded differently, but the
 * sentence beside it can never outlive the prices it describes.
 */
export type DiscountClaimShape = 'flat' | 'upTo';

export function discountClaimShape(term: DiscountedTerm): DiscountClaimShape {
  const worst = Math.min(...plans.map((p) => actualSavingPct(p, term)));
  return ADVERTISED_DISCOUNT_PCT[term] <= worst ? 'flat' : 'upTo';
}

/** The advertised saving for a term, in words. The one phrasing on this site. */
export function discountClaim(term: DiscountedTerm): string {
  const pct = ADVERTISED_DISCOUNT_PCT[term];
  return discountClaimShape(term) === 'flat' ? `Save ${pct}%` : `Save up to ${pct}%`;
}

/* 🔴 An advertised percentage that exceeds what the BEST tier saves is false
   under any wording — "up to 40%" when nothing reaches 40% is not a hedge, it is
   a lie — so it stops the prerender. The app carries the identical guard at the
   same place in its own table; a claim it cannot make is one this site must not
   print. */
export function discountClaimContract(
  list: readonly Plan[],
  advertised: Record<DiscountedTerm, number> = ADVERTISED_DISCOUNT_PCT,
): void {
  for (const term of DISCOUNTED_TERMS) {
    const best = Math.max(...list.map((p) => actualSavingPct(p, term)));
    if (advertised[term] > best) {
      throw new Error(
        `Pricing: ${term} advertises ${advertised[term]}% off, but the best tier only ` +
        `saves ${best.toFixed(1)}%. No wording makes that true — lower the advertised percentage ` +
        `or reprice.`
      );
    }
  }
}

discountClaimContract(plans);

/* 🔴 The honesty guard runs beside the other module-scope contracts, so a
   headline that would promise less than the bill stops the prerender rather
   than shipping to a pricing page. */
monthlyHeadlineContract();

/**
 * The lowest monthly sticker price across all plans — what "from $X/mo" means
 * on the static marketing copy that names no billing term (Nav's mega-menu
 * footer, the BlogPost CTA band, the Landing SEO description).
 *
 * Deliberately the plain monthly figure, not a discounted-term equivalent: none
 * of those surfaces is a signup CTA or carries a toggle, so there is no "billed
 * annually" context to hang a discounted figure on. Quoting $27 there without
 * that qualifier would be the same mismatch #55 fixed, in miniature — see
 * `cardTerms` below.
 */
export const CHEAPEST_MONTHLY = Math.min(...plans.map((p) => p.price.monthly));

// Index of the featured plan. The pricing cards read `p.popular` directly, but
// the comparison table used to hard-code column 1 for its gold header and tinted
// column — so moving `popular` between plans silently left the table featuring
// the old one. Derive both from the same flag. -1 (no popular plan) simply means
// no column is highlighted, since no index matches.
// 🔴 A COLUMN index, not a `plans` index — THE-204 shifted them apart.
// The comparison table's header and cells are keyed on ALL_TIER_NAMES, which
// puts Forever Free at column 0, so Ministry's `popular` flag now sits one
// column right of its position in `plans`. Deriving the column from the flag
// rather than restating it is the same guard #44 added when moving `popular`
// between plans silently left the table featuring the old one; the `+ 1` is
// the free column and is stated once, here.
const popularPlanIdx = plans.findIndex((p) => p.popular);
const popularIdx = popularPlanIdx === -1 ? -1 : popularPlanIdx + 1;

const T = true;
type Cell = boolean | string;
// Every row is positional against `plans` — one cell per plan, in plan order.
// A row with the wrong length renders a dropped or misaligned cell silently,
// so the width check below fails the build instead.
const featureMatrix: { grp: string; rows: [string, Cell[]][] }[] = [
  { grp: 'Platform', rows: [
    ['Web App', [T, T, T, T]],
    ['Mobile App (PWA)', [T, T, T, T]],
    ['Contacts', ['500', '150', '500', '2,000']],
    ['Admin accounts', ['1', '2', '5', '15']],
    ['Custom Branding', [false, false, false, T]],
    ['Custom Domain', [false, false, false, T]],
  ] },
  { grp: 'Community', rows: [
    /* 🔴 TWO ROWS, ONE PRODUCT, ONE ANSWER (THE-205). Both name the church
       feed — NewsTab/AllNews over /community_posts — and both must move
       together: leaving either at `T` re-makes the exact claim the other just
       dropped. `newsFeed` is false on free and true on every tier that pays. */
    ['News Feed', [false, T, T, T]],
    ['Community Feed', [false, T, T, T]],
    ['Prayer Requests', [T, T, T, T]],
    ['Community Groups', [false, false, false, T]],
    ['Event Registration', [false, false, false, T]],
    ['Church Map', [false, false, T, T]],
    ['Check-In System (QR)', [false, false, T, T]],
    ['Livestream + Live Giving', [false, false, T, T]],
  ] },
  { grp: 'Discipleship & Content', rows: [
    ['Bible', [T, T, T, T]],
    ['Courses', ['1', '2', '5', '15']],
    ['Blog', [false, T, T, T]],
    ['Automated SEO Blog Articles', [false, false, false, T]],
    /* No Docs & Notes row, deliberately (THE-163). Notes is a real feature on
       Small Team and Ministry and the product did not change — what changed is
       that no feature table should be carrying the row at all. The in-app plan
       table that mirrored this grid is being deleted wholesale in the same
       batch, so removing this row is what leaves no table anywhere making the
       claim; putting it back re-opens the claim on its own.

       Scope is THIS GRID ONLY. The feature keeps its catalogue entry in
       components/catalog.ts (which is where CATALOG_TOOL_COUNT comes from — a
       row and a catalogue entry are different objects, and deleting the entry
       to "finish the job" silently drops the tool count the Nav advertises),
       its section on /features/discipleship-content, and its line on the
       Individual card above. Do not chase the feature out of those. */
    ['Sermon Notes → Livestream', [false, false, T, T]],
  ] },
  { grp: 'Automation', rows: [
    ['Newsletter', [false, false, T, T]],
    ['Automated Newsletter', [false, false, false, T]],
    ['SMS (bring your own Twilio)', [false, T, T, T]],
    ['Custom Forms → CRM', [false, false, false, T]],
  ] },
  { grp: 'Giving & Finance', rows: [
    ['Donation Page', [false, T, T, T]],
    ['Fundraising', [false, T, T, T]],
    /* The ROW LABEL is shared by four columns, so it cannot itself be per-tier
       — it keeps the priced tiers' wording, which is also the wording three of
       the four columns want. Free's CELL carries the correction instead: it
       has the CRM, and it has it for members only. A `T` here would read as
       the row label's full claim. */
    [crmLabel('plus'), ['Members only', T, T, T]],
    ['Accounting + QuickBooks Sync', [false, false, false, T]],
    ['Tax Receipts & Giving Statements', [false, false, false, T]],
  ] },
];

/* Widths are only checkable at runtime — `Cell[]` cannot express "exactly as
   long as `plans`". Throwing here surfaces during the prerender, which is a
   build failure, rather than shipping a table whose cells have quietly slid
   one column left. */
for (const sec of featureMatrix) {
  for (const [label, vals] of sec.rows) {
    if (vals.length !== ALL_TIER_NAMES.length) {
      throw new Error(`Pricing comparison row "${label}" has ${vals.length} cells, expected ${ALL_TIER_NAMES.length}.`);
    }
  }
}
// Derived, so a rename or reorder in `plans` can't desync the table header from
// the cards — the matrix rows above are positional and assume this exact order.
// Every tier, free first — not `plans`, which is the PRICED list. A row that
// still carried three cells now fails the arity guard above rather than
// rendering one tier's answers under another tier's heading.
const planNames = ALL_TIER_NAMES;

/* Exported for the suite, not for reuse — `Pricing` is still its only caller.
   The table renders behind `showTable`, which starts closed, so it is absent
   from the prerendered pricing page and NO amount of grepping dist/ can see
   what a cell says. Rendering the component directly is the only place a claim
   in this grid is checkable as markup rather than as data — and #55 is why that
   distinction is load-bearing: a pure-function test passed while the JSX seam
   was mutated. */
export function ComparisonTable() {
  const cell = (v: Cell) => {
    if (v === true) return <span style={{ display: 'inline-flex', color: 'var(--brand)' }}>{I.check({ size: 16 })}</span>;
    if (v === false) return <span style={{ color: 'var(--stone-300)' }}>—</span>;
    if (v === 'soon') return <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky-600)' }}>soon</span>;
    return <span style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: 13.5 }}>{v}</span>;
  };
  return (
    <div style={{ ...softCard, overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-900)' }}>
              <th style={{ textAlign: 'left', padding: '16px 22px', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Feature</th>
              {planNames.map((n, i) => (
                <th key={n} style={{ textAlign: 'center', padding: '16px 12px', color: i === popularIdx ? 'var(--gold-400)' : '#fff', fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, minWidth: 92 }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureMatrix.map((sec) => (
              <React.Fragment key={sec.grp}>
                <tr>
                  <td colSpan={ALL_TIER_NAMES.length + 1} style={{ padding: '18px 22px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>{sec.grp}</td>
                </tr>
                {sec.rows.map(([label, vals], ri) => (
                  <tr key={label} style={{ borderTop: '1px solid rgba(45,37,25,0.06)', background: ri % 2 ? 'rgba(45,37,25,0.015)' : 'transparent' }}>
                    <td style={{ padding: '13px 22px', color: 'var(--text-body)', fontSize: 13.5 }}>{label}</td>
                    {vals.map((v, ci) => <td key={ci} style={{ textAlign: 'center', padding: '13px 12px', background: ci === popularIdx ? 'rgba(201,150,58,0.05)' : 'transparent' }}>{cell(v)}</td>)}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * What one pricing card SHOWS and what its button BUYS, derived together from a
 * single toggle state.
 *
 * These two facts used to be computed apart, and they disagreed. The card priced
 * itself off `annual`, while the signup link carried no term at all — so the
 * app's onboarding, which fails closed to monthly when `?billing=` is absent,
 * put every visitor on monthly. The toggle defaulted to Annual, so the DEFAULT
 * pricing page advertised the discounted figure and charged the monthly one.
 *
 * Returning them from one call is what makes that drift unrepresentable: a card
 * cannot render a term's price without holding that term in the same hand.
 *
 * ⚠️ `price` IS THE CHARGED AMOUNT and `suffix` names its cycle — "$99" and
 * "qtr". `monthlyHeadline` is the per-month EQUIVALENT — "$33" — and is what
 * the card now prints large, with `price` on the line beneath it (THE-196).
 * They travel together out of this one call so a card cannot show one term's
 * headline above another term's total. Three terms make that sharper, not
 * softer: $329/yr, $99/qtr and $39/mo are three different amounts on three
 * different cycles, and only one of them is a month.
 */
export function cardTerms(plan: Plan, term: BillingTerm): {
  price: number;
  suffix: string;
  monthlyHeadline: string;
  billing: BillingPeriod;
} {
  const price = plan.price[term];
  return {
    price,
    suffix: TERM_SUFFIX[term],
    // THE-196: the card headlines this and prints `price` beneath it. Both
    // still leave this one call together, for the reason above — a card must
    // not be able to hold one term's headline and another term's total.
    monthlyHeadline: formatMonthlyHeadline(price, term),
    // The site's term vocabulary and the app's are the same three words, so
    // this is an identity today — but it stays an explicit translation, because
    // the app's `?billing=` allowlist is what decides whether a forged or stale
    // value can select a term at all, and the two must be able to move apart.
    billing: term,
  };
}

/**
 * Months charged for a year of an ADD-ON. Twelve — add-ons carry NO annual
 * discount, and this constant exists so that fact has a name instead of being
 * an unstated absence.
 *
 * ⚠️ THIS IS NOT A PLAN DISCOUNT, and the two must never be conflated. Plans
 * are discounted on the longer terms; Dodo bills every add-on at twelve months
 * a year regardless, so an add-on's annual price is exactly monthly × 12:
 * $19/mo is $228 a year.
 *
 * 🔴 STILL TWELVE UNDER THREE TERMS, and quarterly is why that is worth saying
 * rather than assuming. Dodo charges an add-on on its PRODUCT's cycle, and a
 * quarterly plan product bills as three MONTHLY cycles — so the live quarterly
 * products carry the MONTHLY add-on ids, verified against the API. A quarterly
 * church pays $10 a month for an admin seat, the same $10 a monthly church
 * pays. There is no quarterly add-on price, and this section must not invent
 * one: both figures on each card below are the monthly and the yearly, and they
 * are the only two an add-on has.
 *
 * The discount badge is the second half of the same hazard: a price sitting
 * under "save 30%" with no qualifier is read as discounted. That is why the
 * section says out loud, whenever a DISCOUNTED term is selected, that add-ons
 * are not — an unstated exception to a headline discount is a false impression,
 * not a mere omission. Quarterly needed that sentence too, which is why the
 * condition below is "not monthly" rather than "annual".
 */
export const ADD_ON_BILLED_MONTHS = 12;

export interface AddOn {
  name: string;
  /** Sticker price per month, as Dodo charges it. */
  monthly: number;
  /**
   * Price for a year. Carried rather than derived because it is a figure Dodo
   * publishes on its own product, so it is a number that can be got wrong —
   * `addOnPricingContract` checks it against monthly × ADD_ON_BILLED_MONTHS.
   */
  annual: number;
  /** Capacity, in the visitor's words. Never a capability claim — an add-on
   *  raises a limit; it does not add a feature the catalogue doesn't list. */
  blurb: string;
  /**
   * Which plans can buy it, as `planId`s of `plans`.
   *
   * Availability is enforced in Dodo (THE-133) and is not a presentation
   * choice: Contacts +500 is not sold on Individual, and unlimited contacts is
   * Ministry only. A visitor on the Individual card who reads "add 500 contacts
   * for $20" and then cannot has been misled, so the restriction is STATED on
   * every add-on rather than left to be inferred from silence.
   *
   * Held as ids and rendered through `plans`, so this can neither name a tier
   * that does not exist nor drift from a plan rename — that is what keeps it
   * from being a second copy of the plan list.
   */
  planIds: string[];
}

/* ─── 🔴 THE DODO ADD-ON CONTRACT (THE-223) ───────────────────────────────────

   WHY THIS EXISTS. The nine PLAN prices are pinned three times over — the
   cross-repo contract above, TIER_PRICE_CLAIMS in content/legal.ts and
   FAQ_PLAN_CLAIMS in content/faq.ts — and those guards are what FOUND the two
   unknown price locations in THE-222, by failing the build. Add-ons had no
   guard at all, and the consequence is exactly what an unguarded price does:
   four of the five figures below drifted away from Dodo across three
   repricings and nobody noticed, including one that advertised $19 while Dodo
   charged $20. An advertised price BELOW the charged one is not staleness; it
   is a promise the checkout breaks.

   WHAT IS PINNED, AND WHY IT IS NOT CIRCULAR. Dodo is the source of truth and
   this site cannot call it at build time, so the prices are transcribed. What
   makes a transcription checkable rather than a second opinion is the ID: each
   figure below names the exact Dodo product it was read off, so re-verifying is
   a lookup, not a judgement call.

   ⚠️ THE APP HOLDS THE IDS AND DELIBERATELY HOLDS NO PRICES. Harvest-agent
   src/lib/dodo/catalogue.ts DODO_LIVE_ADDONS carries these same ten ids — so the
   id half of this table is a genuine cross-repo pin, the same mechanism as
   EXPECTED_PLAN_PRICES. The price half cannot be: the app reads add-on prices
   live from Dodo at runtime ("named and priced by Dodo, never by code" —
   utils/addon-change.ts) and its only add-on figures are a ban-list and test
   fixtures. So there is nothing in the app to pin a price against, and the
   transcription below is the site's own, dated and attributed.

   CENTS, NOT DOLLARS, because that is the unit Dodo's API returns (`price:
   2000`). Transcribing the API's own value keeps the check a comparison rather
   than a conversion someone has to trust.

   READ 2026-08-24 from the authenticated live API: `client.addons.list()` for
   the ten products below, and `client.products.retrieve()` on all nine plan
   products for the attachment matrix that `planIds` states. Re-read both when
   this table is next touched. */
export interface DodoAddOnProduct {
  /** Live Dodo `addon_id` for the monthly product. */
  readonly monthlyId: string;
  /** Live Dodo `addon_id` for the annual product. */
  readonly annualId: string;
  /** `price` exactly as Dodo's API returns it: USD minor units. */
  readonly monthlyCents: number;
  readonly annualCents: number;
}

/* Keyed by the add-on's rendered `name`, so a rename cannot quietly detach a
   card from the product it is priced against — it fails here instead. Order
   matches the app's DODO_LIVE_ADDONS table. */
export const DODO_ADD_ON_CATALOG: Record<string, DodoAddOnProduct> = {
  'AI Assistant': {
    monthlyId: 'adn_0NlKtuImtSn7PcdvjnSni', annualId: 'adn_0NlKtw3IOHfv1GGCevNol',
    monthlyCents: 2000, annualCents: 24000,
  },
  'Admin seat': {
    monthlyId: 'adn_0NlKtw7AayNYI6YYwphQ5', annualId: 'adn_0NlKtw9lWLs0VRN9hWciX',
    monthlyCents: 1000, annualCents: 12000,
  },
  Campus: {
    monthlyId: 'adn_0NlKwDcuqIWoVK7Qay13L', annualId: 'adn_0NlKwDgKMpuqzR5VmlCBD',
    monthlyCents: 1200, annualCents: 14400,
  },
  'Contacts +500': {
    monthlyId: 'adn_0NlKtwD3VfBLgx2LTw69O', annualId: 'adn_0NlKtwGbLRk2nPC07uC6o',
    monthlyCents: 1500, annualCents: 18000,
  },
  'Unlimited contacts': {
    monthlyId: 'adn_0NlKtwKAhJgz0jeaqDX2c', annualId: 'adn_0NlKtwMjMlsjzZ8z2Wt7P',
    monthlyCents: 4000, annualCents: 48000,
  },
};

/* THE ONE PLACE AN ADD-ON PRICE IS WRITTEN AS A FIGURE A VISITOR READS. Both
   figures for every add-on live here and nothing else on this site may restate
   one — #56 fixed three disconnected $49 literals and this is the add-on
   equivalent waiting to happen. The section below renders these fields; no copy
   quotes a price. `DODO_ADD_ON_CATALOG` above is the other copy, in Dodo's
   units, and the two disagreeing is a build failure — that is the mechanism,
   the same one EXPECTED_PLAN_PRICES is half of.

   ⚠️ CAMPUS WAS ABSENT FROM #58 UNTIL NOW, and the reason it was absent is
   gone. It was omitted because the two live Dodo add-on ids had never been
   recorded, so the app refused a live Campus purchase. Both ids exist now
   (Harvest-agent DODO_LIVE_ADDONS, recorded in PR 328), all nine live plan
   products carry the period-matched Campus add-on, and getEffectiveFeatures
   raises `maxChurches` by one per campus owned. It is buyable on every paid
   plan, so it is advertised.

   🔴 `MULTI_CAMPUS_ENABLED` STAYS FALSE, and that is not a contradiction. That
   flag gates the multi-campus FEATURE marketing — the features.ts section and
   the catalogue's Multi-Campus tool entry — not this add-on. Flipping it would
   add a tool to CATALOG_TOOL_COUNT, which is a derived 28 and not this
   change's to move. What is advertised here is the capacity a church can buy
   today, which is what this section is for. */
export const ADD_ONS: AddOn[] = [
  // Unlike every other row below, this is a whole-plan toggle, not a per-unit
  // capacity raise: one purchase turns the AI assistant on in the app for
  // every member on the plan. It is not sold per person and no member ever
  // needs their own seat.
  { name: 'AI Assistant', monthly: 20, annual: 240, blurb: 'Turns on the AI assistant for every member of your congregation, in the app — one purchase for the whole plan, not billed per person.', planIds: ['plus', 'pro', 'max'] },
  { name: 'Admin seat', monthly: 10, annual: 120, blurb: 'One more admin account, on top of the number your plan includes.', planIds: ['plus', 'pro', 'max'] },
  /* ⚠️ THE BLURB MAY NOT IMPLY A TIER INCLUDES MORE THAN ONE CAMPUS. Every
     paid tier is `maxChurches: 1` in the app's matrix and this add-on is the
     ONLY path past that, one campus per purchase — so the sentence has to say
     "one more", not "run every campus", which is the feature page's line for a
     feature page's job. Attached to all three paid products in Dodo. */
  { name: 'Campus', monthly: 12, annual: 144, blurb: 'One more campus, with its own address, service times and pastor. Your plan includes one — each additional campus is one of these.', planIds: ['plus', 'pro', 'max'] },
  { name: 'Contacts +500', monthly: 15, annual: 180, blurb: '500 more contacts, on top of your plan’s limit.', planIds: ['pro', 'max'] },
  { name: 'Unlimited contacts', monthly: 40, annual: 480, blurb: 'No contact limit at all.', planIds: ['max'] },
];

/**
 * ADD-ON PRICE CONTRACT — the same idiom as the cross-repo plan contract above,
 * for the mistake that contract cannot catch: an add-on priced as if the plan
 * discount applied to it.
 *
 * Exported and called at module scope, so it throws during the prerender (a
 * build failure beats shipping a price a third under what Dodo charges) while
 * still being callable with a bad list, which is what proves it has teeth.
 * ⚠️ It deliberately does NOT touch the plan contract, which stands as it is.
 */
export function addOnPricingContract(addOns: AddOn[]): void {
  for (const a of addOns) {
    const expected = a.monthly * ADD_ON_BILLED_MONTHS;
    if (a.annual !== expected) {
      throw new Error(
        `Pricing: add-on "${a.name}" is listed at ${a.monthly}/mo and ${a.annual}/year, but ` +
        `${ADD_ON_BILLED_MONTHS} × ${a.monthly} is ${expected}. Add-ons are NOT discounted ` +
        `annually or quarterly — if this figure came from a plan discount, that discount ` +
        `does not apply here.`
      );
    }
    if (a.planIds.length === 0) {
      throw new Error(`Pricing: add-on "${a.name}" is sold on no plan, so nothing could state where it is available.`);
    }
    for (const id of a.planIds) {
      if (!plans.some((p) => p.planId === id)) {
        throw new Error(
          `Pricing: add-on "${a.name}" is marked available on plan "${id}", which is not in \`plans\`. ` +
          `Availability is rendered through the plan names, so an unknown id would print nothing.`
        );
      }
    }
  }
}

addOnPricingContract(ADD_ONS);

/**
 * 🔴 THE GUARD THAT DID NOT EXIST — `ADD_ONS` against the live Dodo catalogue.
 *
 * `addOnPricingContract` above checks a RELATION (annual is twelve monthlies).
 * A relation cannot see a price that is internally consistent and simply wrong:
 * $19/$228 satisfies it perfectly while Dodo charges $20/$240. This checks the
 * FIGURES, against the transcribed products they were read from.
 *
 * Four failures, and the third is the one that let Campus sit unadvertised
 * through three repricings:
 *   1. an advertised price that is not the product's price
 *   2. an advertised add-on with no live product behind it
 *   3. 🔴 a LIVE PRODUCT THIS SITE DOES NOT ADVERTISE — absence is a defect
 *      here, not a default, and nothing else on this site could have said so
 *   4. two add-ons pinned to the same product, which is how a copy-paste makes
 *      one card quietly inherit another's price
 *
 * Module scope, so it fails the prerender rather than a page view; exported and
 * defaulted, so a test can hand it a wrong catalogue and prove it has teeth.
 * ⚠️ It reads no files and shells out to nothing — the ids are literals here
 * and in the app, and comparing two literals is the whole mechanism.
 */
export function dodoAddOnCatalogContract(
  addOns: readonly AddOn[],
  catalog: Record<string, DodoAddOnProduct> = DODO_ADD_ON_CATALOG,
): void {
  const advertised = new Set(addOns.map((a) => a.name));
  for (const name of Object.keys(catalog)) {
    if (!advertised.has(name)) {
      throw new Error(
        `Pricing: Dodo sells the add-on "${name}" (${catalog[name].monthlyId}) and this site does not ` +
        `advertise it. An add-on a church can buy but cannot find is the Campus defect THE-223 fixed — ` +
        `add it to ADD_ONS, or remove it from DODO_ADD_ON_CATALOG if Dodo has genuinely retired it.`
      );
    }
  }

  const seenIds = new Map<string, string>();
  for (const a of addOns) {
    const product = catalog[a.name];
    if (product === undefined) {
      throw new Error(
        `Pricing: add-on "${a.name}" is advertised but has no entry in DODO_ADD_ON_CATALOG, so nothing ` +
        `says which Dodo product it is priced against. Every advertised add-on must name its products.`
      );
    }
    const cells: [string, number, number][] = [
      ['monthly', a.monthly, product.monthlyCents],
      ['annual', a.annual, product.annualCents],
    ];
    for (const [term, dollars, cents] of cells) {
      if (dollars * 100 !== cents) {
        throw new Error(
          `Pricing: add-on "${a.name}" advertises $${dollars} ${term}, but the live Dodo product ` +
          `(${term === 'monthly' ? product.monthlyId : product.annualId}) charges ` +
          `$${cents / 100} — ${cents} minor units. ` +
          (dollars < cents / 100
            ? `🔴 THE SITE ADVERTISES LESS THAN DODO CHARGES. That is a promise the checkout breaks.`
            : `The advert is stale and overstates what a church would pay.`)
        );
      }
    }
    // Dodo's own two products must themselves obey the ×12 rule. A transcription
    // that got both cells wrong in the same direction would pass every check
    // above; this is what notices.
    if (product.annualCents !== product.monthlyCents * ADD_ON_BILLED_MONTHS) {
      throw new Error(
        `Pricing: the transcribed Dodo products for "${a.name}" are ${product.monthlyCents} and ` +
        `${product.annualCents} minor units, which is not ${ADD_ON_BILLED_MONTHS} × the monthly one. ` +
        `Either the transcription is wrong or Dodo has started discounting an add-on annually — ` +
        `re-read the API before changing this.`
      );
    }
    for (const [term, id] of [['monthly', product.monthlyId], ['annual', product.annualId]] as const) {
      if (!/^adn_[A-Za-z0-9]+$/.test(id)) {
        throw new Error(`Pricing: add-on "${a.name}" has "${id}" as its ${term} Dodo id, which is not an \`adn_\` add-on id.`);
      }
      const owner = seenIds.get(id);
      if (owner !== undefined) {
        throw new Error(
          `Pricing: add-on "${a.name}" and "${owner}" are both pinned to the Dodo product ${id}. ` +
          `One of them is priced against the wrong product and its figure is unguarded.`
        );
      }
      seenIds.set(id, a.name);
    }
  }
}

dodoAddOnCatalogContract(ADD_ONS);

/**
 * Where an add-on can be bought, in words, derived from `plans` — never a
 * hand-written tier list. "Available on every plan" when it is sold on all of
 * them, and otherwise the plans that can buy it, named, followed by "only".
 */
export function addOnAvailability(planIds: string[]): string {
  const names = plans.filter((p) => planIds.includes(p.planId)).map((p) => p.name);
  // 🔴 "every PAID plan" since THE-204. `plans` is the priced list, and an
  // add-on is a subscription line item — Forever Free has no subscription to
  // add one to, so it can buy none of these. While free did not exist, "every
  // plan" and "every plan in `plans`" were the same sentence; they are not any
  // more, and the shorter one is now a claim about a tier that cannot buy.
  if (names.length === plans.length) return 'Available on every paid plan';
  const listed = names.length > 1
    ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
    : names[0];
  return `${listed} only`;
}

/* One add-on. Its own component for the same reason `PlanCard` is: the price it
   prints and the availability it states are the two things a visitor acts on,
   and both are checkable on a rendered card rather than on the data behind it.
   No CTA — add-ons are bought inside the app, never from this page. */
export function AddOnCard({ addOn }: { addOn: AddOn }) {
  return (
    <div style={{
      ...softCard, width: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 20, padding: 20, boxShadow: '0 12px 30px rgba(45,37,25,0.05)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-900)' }}>{addOn.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 0 2px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: 'var(--navy-900)' }}>${addOn.monthly}</span>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>/mo</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{`or $${addOn.annual} a year`}</div>
      <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-body)', lineHeight: 1.45, margin: '12px 0 14px' }}>{addOn.blurb}</div>
      <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
        <span style={{ display: 'inline-flex', color: 'var(--brand)', flexShrink: 0, marginTop: 1 }}>{I.check({ size: 14 })}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--brand)', lineHeight: 1.3 }}>{addOnAvailability(addOn.planIds)}</span>
      </div>
    </div>
  );
}

/**
 * The add-on section. Takes the toggle state as a prop rather than reading it —
 * the same shape as `PlanCard`, and for the same reason: the sentence that has
 * to appear beside a discount badge can then be checked on rendered output.
 *
 * The prices themselves do NOT move with the toggle, because they do not move
 * in Dodo. Both figures are shown either way; only the qualifier is conditional,
 * and it is conditional on exactly the state that makes the discount visible.
 *
 * On timing: PR 321 refuses an add-on purchase during the trial, deliberately —
 * Dodo's proration ends the trial, so a $10 seat bought on day 3 would charge
 * the full plan price there and then and forfeit the rest of the trial. So this
 * says "once your plan is active" and never "add anytime": the site must not
 * promise something the app is built to refuse.
 */
export function AddOns({ term }: { term: BillingTerm }) {
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <Kicker>Add-ons</Kicker>
        <p style={{ margin: '10px auto 0', maxWidth: 560, fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)' }}>
          Extra capacity for a plan you already have. Added from inside the app once your plan is active.
        </p>
      </div>
      <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${ADD_ONS.length}, 1fr)`, gap: 14, alignItems: 'stretch' }}>
        {ADD_ONS.map((a, i) => (
          <Reveal key={a.name} delay={i * 60} style={{ display: 'flex' }}>
            <AddOnCard addOn={a} />
          </Reveal>
        ))}
      </div>
      {/* Shown for EVERY discounted term, not just the yearly one. A visitor
          looking at a −15% quarterly badge reads the add-on prices under it as
          discounted too, exactly as an annual visitor does; the qualifier is
          conditional on a discount being visible, which is now two states. */}
      {term !== 'monthly' && (
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-muted)' }}>
          {`Add-ons are not discounted — the −${ADVERTISED_DISCOUNT_PCT[term]}% applies to plans only. ` +
           `A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price, which is the yearly figure shown on each one. ` +
           `On quarterly billing an add-on is charged at its monthly price, every month.`}
        </p>
      )}
    </div>
  );
}

/* The plan CTA is the affiliate hand-off. Its own component so the signup URL —
   which depends on sessionStorage and therefore cannot be resolved at build
   time — can be read through a hook rather than inline in the plan map.

   Load-bearing while the affiliate programme is unadvertised: a ?ref= link
   already in circulation still lands here, and this is what carries the stored
   ref across to signup so the referral is still attributed. Hiding the
   programme's marketing surfaces must not touch this path.

   `billing` comes from the same `cardTerms` call that produced the price above
   the button, and is never defaulted here — the term is the card's to state. */
function PlanCta({ planId, billing, variant }: { planId: string; billing: BillingPeriod; variant: 'gold' | 'light' }) {
  return <HBtn href={useAppSignupUrl(planId, billing)} variant={variant} block>Start free trial</HBtn>;
}

/* One pricing card. Takes the toggle state as a prop rather than reading it,
   which is what lets the price it prints and the term its button sells be
   checked against each other on a rendered card — the pair that disagreed. The
   card holds no state of its own; `Pricing` owns the toggle. */
export function PlanCard({ plan, term }: { plan: Plan; term: BillingTerm }) {
  const pop = plan.popular;
  const { price, monthlyHeadline, billing } = cardTerms(plan, term);
  return (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'column',
      background: pop ? 'var(--navy-900)' : '#fff',
      border: pop ? '1px solid var(--navy-900)' : '1px solid rgba(45,37,25,0.08)',
      borderRadius: 24, padding: 24, boxShadow: pop ? '0 30px 60px rgba(12,21,38,0.28)' : '0 12px 30px rgba(45,37,25,0.05)',
      position: 'relative',
    }}>
      {pop && <span style={{ position: 'absolute', top: 18, right: 18, background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 999 }}>RECOMMENDED</span>}
      <div style={{ fontSize: 13, fontWeight: 600, color: pop ? 'var(--gold-400)' : 'var(--brand)' }}>{plan.name}</div>
      {/* 🔴 THE-196 FLIPPED THIS. The headline is the PER-MONTH figure; the
          charged total is the line below. See `ceilToCent` for why the figure
          carries cents. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 4px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 500, color: pop ? '#fff' : 'var(--navy-900)' }}>{monthlyHeadline}</span>
        <span style={{ fontSize: 13, color: pop ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>/mo</span>
      </div>
      {/* ── 🔴 THE CHARGED TOTAL (THE-196) ───────────────────────────────────
          The headline above is a per-month EQUIVALENT — a figure no church is
          ever billed. THIS is the amount that leaves the account, and now that
          it is the smaller of the two it has to carry its own weight:

            12.5px, not the 11.5px it was. Explicit px, so it cannot drift with
            a rem base.

            `--navy-900` on the light card, at 18.25:1. It was `--text-muted`
            (#A99B84) which measures 2.72:1 on white and FAILED AA outright —
            acceptable-ish for a footnote nobody had to read, indefensible for
            the only number on the card that says what you pay. `--text-body`
            (#8B7355) was the obvious middle option and measures 4.49:1, which
            misses AA by a hundredth; it is not worth shipping a line that
            rounds to passing. On the dark card, white at 0.86 gives 13.56:1.

            600 weight. The hierarchy is carried by size — 40px serif against
            12.5px sans — not by making the true number faint.

          On MONTHLY this renders nothing: the headline is already the charged
          amount on the charged cycle, so "billed as $39 every 1 month" under
          "$39/mo" is the same sentence twice. `minHeight` still reserves the
          row so the cards keep their baselines across a toggle change. */}
      <div style={{ minHeight: 18, fontSize: 12.5, fontWeight: 600, color: pop ? 'rgba(255,255,255,0.86)' : 'var(--navy-900)' }}>
        {term !== 'monthly'
          ? `billed as $${price.toLocaleString()} every ${TERM_MONTHS[term]} months`
          : ''}
      </div>
      <div style={{ fontSize: 12.5, color: pop ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', minHeight: 34, lineHeight: 1.4 }}>{plan.blurb}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', padding: '10px 12px', borderRadius: 12, background: pop ? 'rgba(255,255,255,0.06)' : 'var(--gold-100)' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: pop ? 'var(--gold-400)' : 'var(--brand)', fontWeight: 500 }}>{plan.fee * 100}%</span>
        <span style={{ fontSize: 11, color: pop ? 'rgba(255,255,255,0.6)' : 'var(--text-body)', lineHeight: 1.2 }}>Platform fee — Harvest<br />takes nothing from a gift</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
        {plan.features.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ display: 'inline-flex', color: pop ? 'var(--gold-400)' : 'var(--brand)', flexShrink: 0, marginTop: 1 }}>{I.check({ size: 15 })}</span>
            <span style={{ fontSize: 12.5, color: pop ? 'rgba(255,255,255,0.82)' : 'var(--text-body)', lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>
      <PlanCta planId={plan.planId} billing={billing} variant={pop ? 'gold' : 'light'} />
    </div>
  );
}

/* ─── THE FREE CARD (THE-204) ─────────────────────────────────────────────────

   A SEPARATE COMPONENT, not `PlanCard` with branches. PlanCard's whole shape is
   built around a charged price: a 40px headline, a "/mo" suffix, a reserved
   `minHeight` row for the charged total, and a `billing` term threaded into the
   CTA so the price it prints and the term its button sells can be checked
   against each other. Free has none of those, and every one of them would have
   become `plan.price ? … : …` inside a component whose existing job is to be
   checkable.

   🔴 DISTINCT, AND DELIBERATELY NOT THE RECOMMENDED TREATMENT. Ministry owns
   the dark navy card with the RECOMMENDED pill, and that treatment sells the
   MOST EXPENSIVE plan. Reusing it here would put the cheapest and the dearest
   tier in the same visual slot and make the row say two contradictory things at
   once. So free is differentiated the other way: the cream ground the section
   already sits on, a solid brand border instead of the hairline the white cards
   carry, and a FOREVER FREE eyebrow in the brand colour where the priced cards
   put a price term. It reads as an on-ramp, not as a recommendation.           */
export function FreeTierCard({ tier }: { tier: FreeTier }) {
  const href = useAppSignupUrl(tier.planId);
  return (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--cream)',
      border: '1.5px solid var(--brand)',
      borderRadius: 24, padding: 24, boxShadow: '0 12px 30px rgba(45,37,25,0.05)',
      position: 'relative',
    }}>
      <span style={{
        position: 'absolute', top: 18, right: 18, background: 'transparent', color: 'var(--brand)',
        border: '1px solid var(--brand)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        padding: '3px 9px', borderRadius: 999,
      }}>FOR EVANGELISTS</span>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{tier.name}</div>

      {/* No "/mo". The priced cards print a per-month EQUIVALENT beside that
          suffix; free is not billed on a month or on anything else, and "$0/mo"
          would imply a cycle it does not have. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 4px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 500, color: 'var(--navy-900)' }}>$0</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>forever</span>
      </div>

      {/* Occupies the row the priced cards use for "billed as $X every N
          months", so all four cards keep one baseline through a toggle change.
          Same 12.5px/600/--navy-900 as that line, for the same reason: it is
          the line that says what you pay. */}
      <div style={{ minHeight: 18, fontSize: 12.5, fontWeight: 600, color: 'var(--navy-900)' }}>
        no card required
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', minHeight: 34, lineHeight: 1.4 }}>{tier.blurb}</div>

      {/* 🔴 WHERE THE OTHER CARDS PUT "0% PLATFORM FEE".
          Every priced card leads with the donation-fee callout, in this exact
          slot. A free card that simply omitted it would leave the reader to
          carry the assumption across from the card beside it — so the slot is
          not left empty, it is answered. Stated as an absence, in the negative,
          in the same box the others use for a benefit. */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', padding: '10px 12px',
        borderRadius: 12, background: 'rgba(45,37,25,0.04)', border: '1px dashed rgba(45,37,25,0.18)',
      }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-muted)', fontWeight: 500 }}>—</span>
        <span style={{ fontSize: 11, color: 'var(--text-body)', lineHeight: 1.2 }}>{tier.noDonatePage}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
        {tier.features.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ display: 'inline-flex', color: 'var(--brand)', flexShrink: 0, marginTop: 1 }}>{I.check({ size: 15 })}</span>
            <span style={{ fontSize: 12.5, color: 'var(--text-body)', lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* No `billing` argument — `useAppSignupUrl`'s second parameter is
          documented as omitted for surfaces that quote no term, and this is
          one. And not "Start free trial": the trial belongs to the paid
          products, free is not a trial of anything, and it never expires. */}
      <HBtn href={href} variant="light" block>Start free</HBtn>
    </div>
  );
}

/**
 * The term toggle — three segments, Monthly / Quarterly / Yearly.
 *
 * ─── 🔴 FITTING THREE SEGMENTS (THE-195) ─────────────────────────────────────
 *
 * The two-segment version was `display: inline-flex` with `padding: '9px 22px'`
 * per button and a badge appended inline. Inline-flex sizes to CONTENT, so the
 * track grew with each segment and had no relationship to the viewport at all:
 * adding a third segment — and the widest label of the three, "Quarterly" —
 * would have pushed the control past a 380px screen and clipped it against the
 * container, which is the same class of defect PR 361 fixed on the in-app cards
 * at 1120px.
 *
 * So the track is `display: grid` with `gridTemplateColumns: repeat(3,
 * minmax(0, 1fr))` inside a `maxWidth: 420` box that is `width: 100%`. Three
 * consequences, all of them the point:
 *
 *   · The track is never wider than its container, at any viewport. It cannot
 *     clip, because it has no content-driven width to clip with.
 *   · `minmax(0, 1fr)` — not `1fr` — is load-bearing. A grid column's implicit
 *     minimum is `auto`, which refuses to shrink below its content; `0` lets the
 *     columns divide the space evenly instead of overflowing.
 *   · Horizontal padding drops from 22px to 10px and the badge moves to its own
 *     line, so the widest label has room at the narrowest width.
 *
 * Measured segment widths (track = min(420, viewport − 2 × 28px gutter), less
 * 8px of track padding and 2 × 4px of gaps, divided by three):
 *
 *     380px → 103px   ·   768px → 135px   ·   1024px → 135px
 *    1280px → 135px   ·  1440px → 135px
 *
 * 380px is the only viewport where the track is viewport-bound; from 768px up
 * it sits at its 420px cap. "Quarterly" at 12.5px sets to roughly 62px against
 * 83px of usable room at 380px, so the narrowest case has slack rather than
 * fitting exactly — which is what stops the next font-size change from
 * clipping it. Nothing is below 11px: labels 12.5px, badges 11px.
 * `TermToggle.widths.test.ts` pins all of it.
 */
export function TermToggle({
  value,
  onChange,
}: {
  value: BillingTerm;
  onChange: (term: BillingTerm) => void;
}) {
  return (
    <div
      data-testid="term-toggle"
      role="tablist"
      aria-label="Billing term"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 4,
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        border: '1px solid rgba(45,37,25,0.08)',
        borderRadius: 22,
        padding: 4,
        boxShadow: '0 6px 16px rgba(45,37,25,0.05)',
      }}
    >
      {BILLING_TERMS.map((t) => {
        const on = t === value;
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={on}
            data-testid="term-toggle-segment"
            data-term={t}
            onClick={() => onChange(t)}
            style={{
              minWidth: 0,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
              fontWeight: 600,
              lineHeight: 1.25,
              padding: '8px 10px',
              borderRadius: 18,
              background: on ? 'var(--navy-900)' : 'transparent',
              color: on ? '#fff' : 'var(--text-body)',
              transition: 'all 200ms',
            }}
          >
            <span style={{ display: 'block' }}>{TERM_LABEL[t]}</span>
            {t !== 'monthly' && (
              <span
                data-testid="term-toggle-badge"
                data-term={t}
                style={{ display: 'block', fontSize: 11, color: on ? 'var(--gold-400)' : 'var(--brand)' }}
              >
                {`-${ADVERTISED_DISCOUNT_PCT[t as DiscountedTerm]}%`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pricing() {
  // Defaults to yearly, the term the page is built to sell. The price a card
  // shows and the term its button buys come from one `cardTerms` call per card,
  // so the default cannot advertise one term and sell another — the defect #55
  // fixed. Every price on this page is read from the stored table; nothing here
  // computes a discount.
  const [term, setTerm] = React.useState<BillingTerm>('yearly');
  const [showTable, setShowTable] = React.useState(false);
  return (
    <section id="pricing" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Kicker>Pricing</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Simple plans\nfor serious ministry'}</H2>
        </div>
        <Reveal delay={80} style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <TermToggle value={term} onChange={setTerm} />
        </Reveal>
        {/* FOUR cards since THE-204. `plan-card-grid` is a second class, not a
            replacement: `pricing-grid` still collapses this row to one column
            below 900px (index.css), and the add-on row below shares that class
            and must NOT take the two-column rule this one needs. The 1200px
            container leaves 1144px of content, so four 272px cards and three
            18px gaps fit at 1280 and 1440 — which render identically, both
            being capped by the container. 1024 is the width that does not fit
            four, and index.css drops it to 2x2 there. */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ALL_TIER_NAMES.length}, 1fr)`, gap: 18, alignItems: 'stretch' }} className="pricing-grid plan-card-grid">
          <Reveal key={FREE_TIER.name} style={{ display: 'flex' }}>
            <FreeTierCard tier={FREE_TIER} />
          </Reveal>
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={(i + 1) * 70} style={{ display: 'flex' }}>
              <PlanCard plan={p} term={term} />
            </Reveal>
          ))}
        </div>
        {/* Merchant of record. Directly under the plan buttons because that is
            where the money commitment is made, and because the fact only
            matters to the person who later reconciles the statement: the line
            item will read Dodo Payments, and nothing else on this page would
            tell a treasurer that. The sentence is imported, not written here —
            the Terms' billing clause renders the same constant, and one fact
            written out twice is one fact that ends up said two ways. */}
        <Reveal delay={80}>
          <p style={{ textAlign: 'center', marginTop: 26, fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>{MERCHANT_OF_RECORD_NOTE}</p>
        </Reveal>
        {/* Add-ons. Below the merchant-of-record line rather than above it: that
            sentence belongs directly under the plan buttons, where the money
            commitment is made. Add-ons are the next question a visitor asks
            after choosing a tier, and they take the same toggle state so the
            "not discounted" qualifier renders in the states that need it. */}
        <AddOns term={term} />
        {/* Full comparison */}
        <Reveal delay={80} style={{ textAlign: 'center', marginTop: 44 }}>
          <button onClick={() => setShowTable((s) => !s)} style={{ cursor: 'pointer', border: '1px solid rgba(45,37,25,0.12)', background: '#fff', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--navy-900)', padding: '11px 24px', borderRadius: 999, boxShadow: '0 6px 16px rgba(45,37,25,0.05)' }}>
            {showTable ? 'Hide full comparison ↑' : 'Compare all plans ↓'}
          </button>
        </Reveal>
        {showTable && <div style={{ marginTop: 24 }}><ComparisonTable /></div>}
      </div>
    </section>
  );
}
