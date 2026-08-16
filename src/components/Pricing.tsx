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
  monthly: number;
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
 * Months charged for a year of service. Annual = monthly × this.
 *
 * This is a PRICING DECISION, not a rounding convention — do NOT "simplify" it
 * back to a literal or to `m * 0.75`. Churches budget annually and prefer a
 * single invoice, and a year paid up front is worth materially more to Harvest
 * than twelve monthly payments, so the discount is deliberately generous:
 * 9 of 12 months = 25% off.
 *
 * EVERY annual figure on this site derives from it — the pricing-card prices,
 * the toggle's discount badge, and the Replaces table's headline number.
 * Nothing computes an annual price or a discount percentage from a literal.
 *
 * ⚠️ CROSS-REPO: the app (Harvest-agent) carries its own copy of this constant
 * as `ANNUAL_BILLED_MONTHS` in src/utils/plan-features.ts, where it also backs
 * PLAN_PRICING.yearlyUsd. The two repos cannot share code, so they are kept in
 * sync by hand. Changing this value here means changing it there IN THE SAME
 * BREATH, or the public pricing page and the in-app plan comparison will quote
 * different prices for the same plan.
 */
export const ANNUAL_BILLED_MONTHS = 9;

/** Annual discount against twelve monthly payments, as a whole percent (25). */
export const ANNUAL_DISCOUNT_PCT = Math.round((1 - ANNUAL_BILLED_MONTHS / 12) * 100);

/**
 * Monthly-equivalent price on annual billing, e.g. 199 -> 149. The one place
 * this rounding lives; Replaces.tsx imports it rather than repeating the math.
 * Math.round(199 * 9 / 12) is exactly 149 — a consequence of the multiplier,
 * not a special case.
 */
export const annualMonthly = (monthly: number) =>
  Math.round((monthly * ANNUAL_BILLED_MONTHS) / 12);

// planId values are the app's `TenantPlan` union — 'plus' | 'pro' | 'max'.
// Anything else here deep-links signup to a plan the app cannot resolve.
export const plans: Plan[] = [
  { name: 'Individual', planId: 'plus', monthly: 49, fee: 0, blurb: 'For solo evangelists and missionaries.', features: ['150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses', 'CRM (Donors & Members)', 'Docs & Notes', 'SMS (bring your own Twilio)', 'Donation page & Fundraising'] },
  { name: 'Small Team', planId: 'pro', monthly: 99, fee: 0, blurb: 'For small ministries growing as a team.', features: ['Everything in Individual', '500 contacts · 5 admins', '5 courses', 'Livestream + Live Giving', 'Check-In System (QR)', 'Sermon Notes → Livestream', 'Church Map', 'Newsletter'] },
  { name: 'Ministry', planId: 'max', monthly: 199, fee: 0, popular: true, blurb: 'For established churches going deeper.', features: ['Everything in Small Team', '2,000 contacts · 15 admins', '15 courses', 'Custom Branding & Domain', 'Community Groups & Events', 'Automated SEO Blog & Newsletter', 'Custom Forms → CRM', 'Tax Receipts & Statements', 'Accounting + QuickBooks'] },
];

/* CROSS-REPO PRICE CONTRACT — the numbers this site must show, and the numbers
   the app's PLAN_PRICING publishes for the same tiers. This repo has no test
   runner, so the check runs at module scope and throws during the prerender,
   the same idiom as the comparison-row width check below: a build failure
   beats shipping a pricing page that disagrees with the app.

   These are deliberately written as literals. They are NOT a second source of
   truth for the multiplier — nothing renders them — they are the expected
   OUTPUT of ANNUAL_BILLED_MONTHS, which is what makes them able to catch a
   one-sided change. Move the multiplier on this side only and the build stops
   here and names the tier. Update these together with the app's yearlyUsd
   (441 / 891 / 1791) and its ANNUAL_BILLED_MONTHS, in the same change. */
const EXPECTED_ANNUAL_MONTHLY: Record<string, number> = { plus: 37, pro: 74, max: 149 };
const EXPECTED_ANNUAL_DISCOUNT_PCT = 25;

for (const p of plans) {
  const expected = EXPECTED_ANNUAL_MONTHLY[p.planId];
  if (expected === undefined) {
    throw new Error(`Pricing: plan "${p.planId}" has no expected annual price in the cross-repo contract.`);
  }
  if (annualMonthly(p.monthly) !== expected) {
    throw new Error(
      `Pricing: ${p.name} (${p.planId}) renders $${annualMonthly(p.monthly)}/mo billed annually, ` +
      `expected $${expected}. ANNUAL_BILLED_MONTHS is ${ANNUAL_BILLED_MONTHS} here — the app ` +
      `(Harvest-agent src/utils/plan-features.ts) must carry the same value and matching yearlyUsd.`
    );
  }
}
if (ANNUAL_DISCOUNT_PCT !== EXPECTED_ANNUAL_DISCOUNT_PCT) {
  throw new Error(
    `Pricing: the Annual toggle badge would read -${ANNUAL_DISCOUNT_PCT}%, expected ` +
    `-${EXPECTED_ANNUAL_DISCOUNT_PCT}%. A discount percentage that disagrees with the prices ` +
    `beside it is a false claim — fix ANNUAL_BILLED_MONTHS, not this number.`
  );
}

/**
 * The lowest monthly sticker price across all plans — what "from $X/mo" means
 * on the static marketing copy that names no billing term (Nav's mega-menu
 * footer, the BlogPost CTA band, the Landing SEO description).
 *
 * Deliberately the plain monthly figure, not `annualMonthly(...)`: none of
 * those surfaces is a signup CTA or carries a toggle, so there is no "billed
 * annually" context to hang the annual-equivalent figure on. Quoting $37
 * there without that qualifier would be the same mismatch #55 fixed, in
 * miniature — see cardTerms above.
 */
export const CHEAPEST_MONTHLY = Math.min(...plans.map((p) => p.monthly));

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
 * put every visitor on monthly. The toggle defaults to Annual, so the DEFAULT
 * pricing page advertised $37 and charged $49.
 *
 * Returning both from one call is what makes that drift unrepresentable: a card
 * cannot render the annual price without holding the annual term in the same
 * hand. This is also the one place the site's "Annual" is translated into the
 * app's `yearly` — see `BillingPeriod` in lib/ref.ts for why the words differ.
 */
export function cardTerms(monthly: number, annual: boolean): { price: number; billing: BillingPeriod } {
  return annual
    ? { price: annualMonthly(monthly), billing: 'yearly' }
    : { price: monthly, billing: 'monthly' };
}

/**
 * Months charged for a year of an ADD-ON. Twelve — add-ons carry NO annual
 * discount, and this constant exists so that fact has a name instead of being
 * an unstated absence.
 *
 * ⚠️ THIS IS NOT `ANNUAL_BILLED_MONTHS`, and the two must never be conflated.
 * The 9-of-12 discount is a pricing decision about PLANS. Dodo bills every
 * add-on at twelve months a year, so an add-on's annual price is exactly
 * monthly × 12: $19/mo is $228 a year.
 *
 * `annualMonthly` is the trap. It is the right helper for a plan and a false
 * price for an add-on — annualMonthly(19) is 14, a third under what Dodo
 * charges. Nothing in the add-on section may call it, and `addOnPricingContract`
 * below fails the build if an add-on's two figures ever stop agreeing.
 *
 * The toggle's −25% badge is the second half of the same hazard: a price sitting
 * under "save 25%" with no qualifier is read as discounted. That is why the
 * section says out loud, whenever the annual toggle is on, that add-ons are not
 * — an unstated exception to a headline discount is a false impression, not a
 * mere omission.
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
  { name: 'AI Assistant seat', monthly: 19, annual: 228, blurb: 'An AI assistant seat for one person on your team.', planIds: ['plus', 'pro', 'max'] },
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
        `annually — if this came from annualMonthly(), that is the plan discount and it ` +
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
 * to appear beside a −25% badge can then be checked on rendered output.
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
export function AddOns({ annual }: { annual: boolean }) {
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
      {annual && (
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-muted)' }}>
          {`Add-ons are not discounted annually — the −${ANNUAL_DISCOUNT_PCT}% applies to plans only. ` +
           `A year of an add-on is ${ADD_ON_BILLED_MONTHS} × its monthly price, which is the yearly figure shown on each one.`}
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
export function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const pop = plan.popular;
  const { price, billing } = cardTerms(plan.monthly, annual);
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
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 500, color: pop ? '#fff' : 'var(--navy-900)' }}>${price}</span>
        <span style={{ fontSize: 13, color: pop ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>/mo</span>
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

export function Pricing() {
  const [annual, setAnnual] = React.useState(true);
  const [showTable, setShowTable] = React.useState(false);
  // Annual bills monthly × ANNUAL_BILLED_MONTHS (pay 9 months, get 12) — a 25%
  // discount. The multiplier and the rounding both live in one place; see the
  // constant's comment before changing anything here. The price and the term
  // the card's button buys come from the same `cardTerms` call, per card.
  return (
    <section id="pricing" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Kicker>Pricing</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Simple plans\nfor serious ministry'}</H2>
        </div>
        <Reveal delay={80} style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: 999, padding: 4, boxShadow: '0 6px 16px rgba(45,37,25,0.05)' }}>
            {([['Annual', true], ['Monthly', false]] as [string, boolean][]).map(([l, v]) => (
              <button key={l} onClick={() => setAnnual(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, padding: '9px 22px', borderRadius: 999, background: annual === v ? 'var(--navy-900)' : 'transparent', color: annual === v ? '#fff' : 'var(--text-body)', transition: 'all 200ms' }}>
                {l}{v ? <span style={{ color: annual === v ? 'var(--gold-400)' : 'var(--brand)', marginLeft: 6, fontSize: 11 }}>-{ANNUAL_DISCOUNT_PCT}%</span> : null}
              </button>
            ))}
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 18, alignItems: 'stretch' }} className="pricing-grid">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 70} style={{ display: 'flex' }}>
              <PlanCard plan={p} annual={annual} />
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
            annual qualifier renders in the one state that needs it. */}
        <AddOns annual={annual} />
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
