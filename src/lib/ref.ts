const KEY = 'harvest_ref';

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

/** Build the app signup URL, carrying the plan id and ref across the domain hop. */
export function appSignupUrl(planId?: string): string {
  const ref = getStoredRef();
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
