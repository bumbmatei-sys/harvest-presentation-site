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
 * What a term works out to per month, rounded — a DISPLAY figure, never charged.
 *
 * $329 a year is $27.42 a month. No church is ever billed $27, so every surface
 * that prints this must print the CHARGED amount and its cycle beside it; see
 * `PlanCard`, which does exactly that and is checked on rendered output.
 */
export const termMonthlyEquivalent = (price: number, term: BillingTerm) =>
  Math.round(price / TERM_MONTHS[term]);

// planId values are the app's `TenantPlan` union — 'plus' | 'pro' | 'max'.
// Anything else here deep-links signup to a plan the app cannot resolve.
export const plans: Plan[] = [
  { name: 'Individual', planId: 'plus', price: { monthly: 39,  quarterly: 99,  yearly: 329  }, fee: 0, blurb: 'For solo evangelists and missionaries.', features: ['150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses', 'CRM (Donors & Members)', 'SMS (bring your own Twilio)', 'Donation page & Fundraising'] },
  { name: 'Small Team', planId: 'pro',  price: { monthly: 79,  quarterly: 199, yearly: 659  }, fee: 0, blurb: 'For small ministries growing as a team.', features: ['Everything in Individual', '500 contacts · 5 admins', '5 courses', 'Livestream + Live Giving', 'Check-In System (QR)', 'Docs & Notes', 'Sermon Notes → Livestream', 'Church Map', 'Newsletter'] },
  { name: 'Ministry',   planId: 'max',  price: { monthly: 159, quarterly: 399, yearly: 1329 }, fee: 0, popular: true, blurb: 'For established churches going deeper.', features: ['Everything in Small Team', '2,000 contacts · 15 admins', '15 courses', 'Custom Branding & Domain', 'Community Groups & Events', 'Automated SEO Blog & Newsletter', 'Custom Forms → CRM', 'Tax Receipts & Statements', 'Accounting + QuickBooks'] },
];

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
  plus: { monthly: 39,  quarterly: 99,  yearly: 329  },
  pro:  { monthly: 79,  quarterly: 199, yearly: 659  },
  max:  { monthly: 159, quarterly: 399, yearly: 1329 },
};

for (const p of plans) {
  const expected = EXPECTED_PLAN_PRICES[p.planId];
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
 * worst tier saves at least 30%. The numbers:
 *
 *              Quarterly   Yearly
 *   Individual    15.4%     29.7%
 *   Small Team    16.0%     30.5%
 *   Ministry      16.4%     30.3%
 *
 *   quarterly  advertises 15, worst tier saves 15.4  → 'flat'  → "Save 15%"
 *   yearly     advertises 30, worst tier saves 29.7  → 'upTo'  → "Save up to 30%"
 *
 * ⚠️ YEARLY IS THE CASE THIS EXISTS FOR. The brief that set these prices stated
 * that 15% and 30% were both safe to advertise flat. 30 is not: Individual saves
 * 29.70%, three tenths of a point short, so a bare "save 30%" overstates what
 * the cheapest tier actually saves — on the page a treasurer reads before
 * paying, which is where this site has already shipped a false claim once
 * ("keeps 100%" against a real 2.5% fee). "Up to" is true of every tier and
 * keeps 30 on the badge, which is what was actually wanted.
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
for (const term of DISCOUNTED_TERMS) {
  const best = Math.max(...plans.map((p) => actualSavingPct(p, term)));
  if (ADVERTISED_DISCOUNT_PCT[term] > best) {
    throw new Error(
      `Pricing: ${term} advertises ${ADVERTISED_DISCOUNT_PCT[term]}% off, but the best tier only ` +
      `saves ${best.toFixed(1)}%. No wording makes that true — lower the advertised percentage ` +
      `or reprice.`
    );
  }
}

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
const popularIdx = plans.findIndex((p) => p.popular);

const T = true;
type Cell = boolean | string;
// Every row is positional against `plans` — one cell per plan, in plan order.
// A row with the wrong length renders a dropped or misaligned cell silently,
// so the width check below fails the build instead.
const featureMatrix: { grp: string; rows: [string, Cell[]][] }[] = [
  { grp: 'Platform', rows: [
    ['Web App', [T, T, T]],
    ['Mobile App (PWA)', [T, T, T]],
    ['Contacts', ['150', '500', '2,000']],
    ['Admin accounts', ['2', '5', '15']],
    ['Custom Branding', [false, false, T]],
    ['Custom Domain', [false, false, T]],
  ] },
  { grp: 'Community', rows: [
    ['News Feed', [T, T, T]],
    ['Community Feed', [T, T, T]],
    ['Prayer Requests', [T, T, T]],
    ['Community Groups', [false, false, T]],
    ['Event Registration', [false, false, T]],
    ['Church Map', [false, T, T]],
    ['Check-In System (QR)', [false, T, T]],
    ['Livestream + Live Giving', [false, T, T]],
  ] },
  { grp: 'Discipleship & Content', rows: [
    ['Bible', [T, T, T]],
    ['Courses', ['2', '5', '15']],
    ['Blog', [T, T, T]],
    ['Automated SEO Blog Articles', [false, false, T]],
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
    ['Sermon Notes → Livestream', [false, T, T]],
  ] },
  { grp: 'Automation', rows: [
    ['Newsletter', [false, T, T]],
    ['Automated Newsletter', [false, false, T]],
    ['SMS (bring your own Twilio)', [T, T, T]],
    ['Custom Forms → CRM', [false, false, T]],
  ] },
  { grp: 'Giving & Finance', rows: [
    ['Donation Page', [T, T, T]],
    ['Fundraising', [T, T, T]],
    ['CRM (Donors & Members)', [T, T, T]],
    ['Accounting + QuickBooks Sync', [false, false, T]],
    ['Tax Receipts & Giving Statements', [false, false, T]],
  ] },
];

/* Widths are only checkable at runtime — `Cell[]` cannot express "exactly as
   long as `plans`". Throwing here surfaces during the prerender, which is a
   build failure, rather than shipping a table whose cells have quietly slid
   one column left. */
for (const sec of featureMatrix) {
  for (const [label, vals] of sec.rows) {
    if (vals.length !== plans.length) {
      throw new Error(`Pricing comparison row "${label}" has ${vals.length} cells, expected ${plans.length}.`);
    }
  }
}
// Derived, so a rename or reorder in `plans` can't desync the table header from
// the cards — the matrix rows above are positional and assume this exact order.
const planNames = plans.map((p) => p.name);

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
                  <td colSpan={plans.length + 1} style={{ padding: '18px 22px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>{sec.grp}</td>
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
 * "qtr", not "$33" and "mo". The per-month equivalent is a separate, explicitly
 * labelled field, because the one thing a church must never have to guess is
 * what leaves its account and when. Three terms make that sharper, not softer:
 * $329/yr, $99/qtr and $39/mo are three different amounts on three different
 * cycles, and only one of them is a month.
 */
export function cardTerms(plan: Plan, term: BillingTerm): {
  price: number;
  suffix: string;
  perMonth: number;
  billing: BillingPeriod;
} {
  const price = plan.price[term];
  return {
    price,
    suffix: TERM_SUFFIX[term],
    perMonth: termMonthlyEquivalent(price, term),
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

/* THE ONE PLACE AN ADD-ON PRICE IS WRITTEN. Both figures for every add-on live
   here and nothing else on this site may restate one — #56 fixed three
   disconnected $49 literals and this is the add-on equivalent waiting to happen.
   The section below renders these fields; no copy quotes a price.

   ⚠️ CAMPUS IS DELIBERATELY ABSENT. A second campus is priced and live in Dodo
   in principle, but the two LIVE Dodo add-on ids for it were never recorded, so
   the app refuses a live Campus purchase (pinned by a test in REP-5b).
   Advertising it — even as a price with a "soon" label — is a claim the product
   cannot honour, and it is the same surface `MULTI_CAMPUS_ENABLED` (lib/flags.ts)
   exists to keep hidden. It is omitted entirely rather than listed as coming
   soon: this section's whole subject is what you can buy, and a row inside it is
   read as buyable whatever the label says. Add it when the live ids exist and
   the flag flips, in the same change. */
export const ADD_ONS: AddOn[] = [
  // Unlike every other row below, this is a whole-plan toggle, not a per-unit
  // capacity raise: one purchase turns the AI assistant on in the app for
  // every member on the plan. It is not sold per person and no member ever
  // needs their own seat.
  { name: 'AI Assistant', monthly: 19, annual: 228, blurb: 'Turns on the AI assistant for every member of your congregation, in the app — one purchase for the whole plan, not billed per person.', planIds: ['plus', 'pro', 'max'] },
  { name: 'Admin seat', monthly: 10, annual: 120, blurb: 'One more admin account, on top of the number your plan includes.', planIds: ['plus', 'pro', 'max'] },
  { name: 'Contacts +500', monthly: 20, annual: 240, blurb: '500 more contacts, on top of your plan’s limit.', planIds: ['pro', 'max'] },
  { name: 'Unlimited contacts', monthly: 59, annual: 708, blurb: 'No contact limit at all.', planIds: ['max'] },
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
 * Where an add-on can be bought, in words, derived from `plans` — never a
 * hand-written tier list. "Available on every plan" when it is sold on all of
 * them, and otherwise the plans that can buy it, named, followed by "only".
 */
export function addOnAvailability(planIds: string[]): string {
  const names = plans.filter((p) => planIds.includes(p.planId)).map((p) => p.name);
  if (names.length === plans.length) return 'Available on every plan';
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
  const { price, suffix, perMonth, billing } = cardTerms(plan, term);
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 4px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 500, color: pop ? '#fff' : 'var(--navy-900)' }}>${price.toLocaleString()}</span>
        <span style={{ fontSize: 13, color: pop ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>/{suffix}</span>
      </div>
      {/* 🔴 THE PER-MONTH LINE NEVER TRAVELS ALONE, and this is the decision
          THE-195 asked to be reported. The headline above is the CHARGED amount
          on the CHARGED cycle — $329/yr, $99/qtr — because that is the figure
          that leaves a church's account. The per-month equivalent is useful for
          comparing tiers, and it is a number nobody is ever billed ($329/12 is
          $27.42), so it appears only here, rounded, labelled "equivalent", and
          in the same sentence as the amount and cadence that produce it.
          Showing $27/mo as the headline would have been the #55 mismatch again:
          a figure a visitor reads as their bill and never sees on a statement.
          `minHeight` reserves the row on monthly so the three cards stay
          aligned across a toggle change. */}
      <div style={{ minHeight: 17, fontSize: 11.5, color: pop ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>
        {term !== 'monthly'
          ? `$${perMonth}/mo equivalent — billed as $${price.toLocaleString()} every ${TERM_MONTHS[term]} months`
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
 * Measured segment widths (track = min(420, viewport − 2 × 20px gutter), less
 * 8px of track padding and 2 × 4px of gaps, divided by three):
 *
 *     380px → 106px   ·   768px → 129px   ·   1024px → 129px
 *    1280px → 129px   ·  1440px → 129px
 *
 * "Quarterly" at 12.5px sets to roughly 62px, so the narrowest segment carries
 * ~44px of slack. Nothing is below 11px: labels 12.5px, badges 11px.
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
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 18, alignItems: 'stretch' }} className="pricing-grid">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 70} style={{ display: 'flex' }}>
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
