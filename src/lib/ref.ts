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

function buildSignupUrl(planId: string | undefined, ref: string): string {
  const params = new URLSearchParams();
  // Signup intent decides the app's landing funnel. A specific plan deep-links
  // that plan's church signup. Otherwise, when the visitor arrived via an
  // affiliate ref, still route them into the CHURCH signup funnel (which is what
  // consumes the ref at checkout and pays the commission) instead of the generic
  // member onboarding that silently drops it. Organic (no-ref) generic CTAs keep
  // their existing destination.
  const signup = planId || (ref ? 'church' : '');
  if (signup) params.set('signup', signup);
  if (ref) params.set('ref', ref);
  const qs = params.toString();
  return `https://theharvest.app/${qs ? `?${qs}` : ''}`;
}

/** Build the app signup URL, carrying the plan id and ref across the domain hop. */
export function appSignupUrl(planId?: string): string {
  return buildSignupUrl(planId, getStoredRef());
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
export function useAppSignupUrl(planId?: string): string {
  const [ref, setRef] = useState('');
  useEffect(() => { setRef(getStoredRef()); }, []);
  return buildSignupUrl(planId, ref);
}
