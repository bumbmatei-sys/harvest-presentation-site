/**
 * The affiliate commission rate this site ADVERTISES, and the contract that
 * stops it drifting from the rate the app actually pays.
 *
 * ─── Why a literal, and why here ─────────────────────────────────────────────
 *
 * The rate is computed in the app (Harvest-agent
 * `src/app/api/stripe/webhook/route.ts`, `AFFILIATE_RATE`), and this repo cannot
 * import it — two repos, no shared code. That is the same problem the nine plan
 * prices have, and this is the same answer: EACH REPO CARRIES THE NUMBER AS ITS
 * OWN LITERAL, and each side pins what the other is expected to publish. A
 * one-sided edit fails a test here or a test there.
 *
 * ⚠️ Update this together with the app's `AFFILIATE_RATE`, in the same change.
 * A site advertising 30% while the app computes 15% is a false claim on a money
 * page — which is the whole reason this file exists rather than a bare string in
 * six components.
 *
 * ─── Why this is NOT wired into the prerender ────────────────────────────────
 *
 * `planPriceContract` throws at module scope because a wrong PRICE must stop the
 * build — it is what a church is charged. The commission rate is advertising
 * copy for a programme that is currently behind `AFFILIATE_PROGRAM_ENABLED ===
 * false`, so a mismatch is a failing test rather than a broken build. It is
 * deliberately NOT one of the nine numbers the price contract guards: adding it
 * there would make an affiliate copy edit able to fail a prerender over a plan
 * price, which is exactly the coupling that contract exists to keep narrow.
 */

/**
 * The app's `AFFILIATE_RATE` (0.30) expressed as whole percent — the form every
 * surface on this site actually renders.
 */
export const AFFILIATE_COMMISSION_RATE_PERCENT = 30;

/** The rate as the app stores it. Kept beside the percent so the two cannot drift. */
export const AFFILIATE_COMMISSION_RATE = 0.30;

/** How long a referral earns, in months. Unchanged by THE-269. */
export const AFFILIATE_COMMISSION_MONTHS = 12;

/**
 * Every string on this site that makes the rate claim, and the file it lives in.
 * The suite walks this list, so a NEW affiliate surface is added here or it is
 * not covered — the list is the coverage, not a sample of it.
 */
export const AFFILIATE_RATE_CLAIMS: ReadonlyArray<readonly [file: string, claim: string]> = [
  ['components/catalog.ts', 'Earn 30% recurring commission for 12 months on every ministry you refer.'],
  ['components/Affiliate.tsx', 'Earn 30% recurring commission on every invoice for their first 12 months.'],
  ['components/Affiliate.tsx', '30% / month, for 12 months'],
  ['components/FeatureMock.tsx', '30% · every plan'],
  ['content/coming-soon.ts', 'paying you 30% of what a church that joins through it actually pays for its plan'],
  ['content/features.ts', ", plus a 30% affiliate program"],
  ['content/features.ts', '30% for their first 12 months'],
  ['content/features.ts', 'Refer a ministry. Earn 30% for a year.'],
  ['content/features.ts', 'A flat 30% of what every church you refer pays, for their first 12 months'],
  ['content/features.ts', 'Flat 30% — every plan, no tiers, no ladder'],
] as const;

/**
 * The contract. Exported and callable so a test can hand it a deliberately wrong
 * rate and prove it has teeth — a contract only ever run against correct data is
 * a contract nobody has checked.
 */
export function affiliateRateContract(
  appRatePercent: number,
  advertised: number = AFFILIATE_COMMISSION_RATE_PERCENT,
): void {
  if (appRatePercent !== advertised) {
    throw new Error(
      `Affiliate: this site advertises ${advertised}% commission, but the app ` +
      `(Harvest-agent src/app/api/stripe/webhook/route.ts AFFILIATE_RATE) pays ` +
      `${appRatePercent}%. The two repos cannot share code — one of them was ` +
      `changed without the other.`,
    );
  }
}
