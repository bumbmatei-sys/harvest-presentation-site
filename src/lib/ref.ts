import { useEffect, useState } from 'react';

const KEY = 'harvest_ref';

/* Capture and hand-off are deliberately NOT behind AFFILIATE_PROGRAM_ENABLED.
   The site no longer advertises the programme, but every ?ref= link already
   shared has to keep attributing — so the ref is still stored on arrival and
   still forwarded to signup. Gating this would silently void live referrals. */

/** Capture ?ref= from the URL on load and persist it for this browsing session. */
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) sessionStorage.setItem(KEY, ref.trim());
  } catch { /* ignore */ }
}

/** The stored affiliate ref, or '' if none. */
export function getStoredRef(): string {
  if (typeof window === 'undefined') return '';
  try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; }
}

/**
 * A billing term in the APP's vocabulary — its `BillingPeriod` union.
 *
 * ⚠️ CROSS-REPO VOCABULARY, and the whole reason this type exists rather than a
 * bare string. This site's toggle is labelled "Yearly" and Dodo's own word for
 * the term is `annual`, but the app's church onboarding validates `?billing=`
 * against its own allowlist and FAILS CLOSED to monthly on anything it does not
 * recognise. Sending 'annual' would therefore start a monthly subscription under
 * a card that quoted the yearly price — silently, no error anywhere, which is
 * precisely the defect this parameter was added to close. The two vocabularies
 * are kept apart deliberately: translate at the boundary (see `cardTerms` in
 * components/Pricing.tsx), never leak one into the other.
 *
 * 🔴 THESE THREE WORDS MUST STAY EXACTLY THE APP'S THREE. `quarterly` was added
 * here and to the app's `BILLING_TERMS` in the same change, and neither side may
 * gain a term alone: a term this site can put in a link but the app does not
 * recognise falls closed to MONTHLY there, which means a church that clicked a
 * quarterly card is charged the monthly rate on a monthly cycle — the exact
 * silent mis-sell described above, pointed at the new term.
 */
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

function buildSignupUrl(planId: string | undefined, ref: string, billing?: BillingPeriod): string {
  const params = new URLSearchParams();
  // Signup intent decides the app's landing funnel. A specific plan deep-links
  // that plan's church signup. Otherwise, when the visitor arrived via an
  // affiliate ref, still route them into the CHURCH signup funnel (which is what
  // consumes the ref at checkout and pays the commission) instead of the generic
  // member onboarding that silently drops it. Organic (no-ref) generic CTAs keep
  // their existing destination.
  const signup = planId || (ref ? 'church' : '');
  if (signup) params.set('signup', signup);
  // The billing term the visitor was SHOWN, sent explicitly for both terms —
  // including 'monthly', which the app would also reach by falling back. A link
  // that states what it buys keeps meaning what it says after either side
  // changes its default, and only a caller that actually quoted a term passes
  // one: the CTAs that advertise no price (Hero, Nav, FinalCTA, SiteCTA) send
  // nothing here, so the app's monthly default stays an honest outcome for them.
  if (billing) params.set('billing', billing);
  // `ref` stays last, where it has always been. It is set unconditionally on
  // every URL that has one — no parameter added here may gate, drop or displace
  // it, because a lost ref is an unpaid commission that nothing reports.
  if (ref) params.set('ref', ref);
  const qs = params.toString();
  return `https://theharvest.app/${qs ? `?${qs}` : ''}`;
}

/** Build the app signup URL, carrying the plan id, billing term and ref across
 *  the domain hop. `billing` is omitted for surfaces that quote no term. */
export function appSignupUrl(planId?: string, billing?: BillingPeriod): string {
  return buildSignupUrl(planId, getStoredRef(), billing);
}

/** `appSignupUrl` for use during the render of a prerendered page.
 *
 * The build-time HTML can only ever contain the ref-less URL, and React 18 does
 * not patch mismatched attributes while hydrating — so a component that reads
 * the ref during its first client render produces markup React silently
 * discards, leaving the ref-less href in the DOM and dropping the commission.
 * Holding the ref at '' for the first render keeps hydration in agreement with
 * the server, and the effect then re-renders the link with the stored ref, which
 * React does apply. */
export function useAppSignupUrl(planId?: string, billing?: BillingPeriod): string {
  const [ref, setRef] = useState('');
  useEffect(() => { setRef(getStoredRef()); }, []);
  return buildSignupUrl(planId, ref, billing);
}
