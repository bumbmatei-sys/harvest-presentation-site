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
  if (planId) params.set('signup', planId);
  if (ref) params.set('ref', ref);
  const qs = params.toString();
  return `https://theharvest.app/${qs ? `?${qs}` : ''}`;
}
