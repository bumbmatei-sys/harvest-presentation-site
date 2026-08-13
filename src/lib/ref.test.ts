import { afterEach, describe, expect, it, vi } from 'vitest';
import { appSignupUrl, captureRefFromUrl, getStoredRef } from './ref';

/* Affiliate attribution. Every assertion here is money: a ref that fails to
 * store, or a signup URL that drops it, is an unpaid commission on a referral
 * that was earned. `ref.ts` is deliberately NOT behind AFFILIATE_PROGRAM_ENABLED
 * — the programme is unadvertised but links already in circulation still have to
 * attribute — which makes it exactly the code a future tidy-up deletes as dead.
 * These tests are what says it isn't. */

/** Stand-in for `sessionStorage`. `throws: true` models private browsing, where
 *  the accessor itself raises rather than returning null. */
function fakeSessionStorage({ throws = false } = {}) {
  const store = new Map<string, string>();
  const boom = () => { throw new Error('SecurityError: storage is not available'); };
  return {
    store,
    getItem: (k: string) => (throws ? boom() : store.get(k) ?? null),
    setItem: (k: string, v: string) => { if (throws) boom(); store.set(k, v); },
  };
}

/** Put the module in a browser: a URL to read `?ref=` from, and a storage. */
function browserAt(search: string, storage = fakeSessionStorage()) {
  vi.stubGlobal('window', { location: { search } });
  vi.stubGlobal('sessionStorage', storage);
  return storage;
}

afterEach(() => vi.unstubAllGlobals());

describe('captureRefFromUrl', () => {
  it('stores the ref when the URL carries ?ref=', () => {
    const storage = browserAt('?ref=partner7');
    captureRefFromUrl();
    expect(getStoredRef()).toBe('partner7');
    expect(storage.store.get('harvest_ref')).toBe('partner7');
  });

  it('stores nothing when the URL has no ?ref=', () => {
    const storage = browserAt('?utm_source=newsletter');
    captureRefFromUrl();
    expect(storage.store.size).toBe(0);
    expect(getStoredRef()).toBe('');
  });

  it('trims surrounding whitespace off the ref', () => {
    browserAt('?ref=%20partner7%20');
    captureRefFromUrl();
    expect(getStoredRef()).toBe('partner7');
  });

  it('treats a whitespace-only ref as no ref', () => {
    browserAt('?ref=%20%20');
    captureRefFromUrl();
    // It is written as '' and reads back as '' — the visitor takes the organic
    // funnel rather than a ref of spaces travelling to checkout.
    expect(getStoredRef()).toBe('');
  });

  it('falls through silently when sessionStorage throws (private browsing)', () => {
    browserAt('?ref=partner7', fakeSessionStorage({ throws: true }));
    // A thrown SecurityError here would take down the whole app on load, for a
    // feature the visitor cannot see. Losing the ref is the acceptable outcome.
    expect(() => captureRefFromUrl()).not.toThrow();
    expect(getStoredRef()).toBe('');
  });

  it('is a no-op during the prerender, where there is no window', () => {
    vi.stubGlobal('window', undefined);
    expect(() => captureRefFromUrl()).not.toThrow();
    expect(getStoredRef()).toBe('');
  });
});

describe('getStoredRef', () => {
  it('defaults to the empty string when nothing was captured', () => {
    browserAt('');
    expect(getStoredRef()).toBe('');
  });
});

/* `buildSignupUrl` is module-private; `appSignupUrl` is a direct pass-through of
   (planId, getStoredRef()), so driving it through the stored ref covers all four
   combinations without exporting anything for the test's benefit. */
describe('appSignupUrl — the four plan × ref combinations', () => {
  const withRef = () => { browserAt('?ref=partner7'); captureRefFromUrl(); };

  it('plan + ref: deep-links the plan and carries the ref', () => {
    withRef();
    expect(appSignupUrl('max')).toBe('https://theharvest.app/?signup=max&ref=partner7');
  });

  it('plan, no ref: deep-links the plan alone', () => {
    browserAt('');
    expect(appSignupUrl('max')).toBe('https://theharvest.app/?signup=max');
  });

  /* The subtle one, and the reason this file exists. A generic CTA clicked by a
     referred visitor must route to the CHURCH funnel, because that is the funnel
     that consumes the ref at checkout. The member onboarding accepts the ?ref=
     parameter and silently drops it — the visitor still signs up, the referrer
     is simply never paid, and nothing anywhere reports the loss. Until now this
     was a comment and nothing else. */
  it('ref, no plan: routes to signup=church so the commission is still paid', () => {
    withRef();
    expect(appSignupUrl()).toBe('https://theharvest.app/?signup=church&ref=partner7');
  });

  it('no plan, no ref: the bare app URL, no query string', () => {
    browserAt('');
    expect(appSignupUrl()).toBe('https://theharvest.app/');
  });

  it('carries the ref for every plan the pricing cards offer', () => {
    withRef();
    for (const planId of ['plus', 'pro', 'max']) {
      expect(appSignupUrl(planId)).toBe(`https://theharvest.app/?signup=${planId}&ref=partner7`);
    }
  });

  it('yields the ref-less URL during the prerender', () => {
    vi.stubGlobal('window', undefined);
    // What the build-time HTML contains; `useAppSignupUrl` re-renders it on the
    // client once the effect has read the ref.
    expect(appSignupUrl('max')).toBe('https://theharvest.app/?signup=max');
  });
});

/* The billing term. A signup link that names no term lands on an app that fails
   closed to monthly, which is how a card quoting the annual price came to sell a
   monthly subscription. These assertions are the same kind as the ones above —
   money — and the ref ones are repeated here against the new parameter, because
   the way an added parameter breaks attribution is by displacing the old one. */
describe('appSignupUrl — the billing term', () => {
  const withRef = () => { browserAt('?ref=partner7'); captureRefFromUrl(); };

  it('names the term explicitly for both periods, never leaving it to a default', () => {
    browserAt('');
    expect(appSignupUrl('max', 'yearly')).toBe('https://theharvest.app/?signup=max&billing=yearly');
    expect(appSignupUrl('max', 'monthly')).toBe('https://theharvest.app/?signup=max&billing=monthly');
  });

  it('omits the term entirely for a CTA that quoted no term', () => {
    // Hero, Nav, FinalCTA and SiteCTA advertise no price and no period, so the
    // app's monthly fallback is an honest outcome for them — sending a term
    // those buttons never showed would be the same lie in the other direction.
    browserAt('');
    expect(appSignupUrl('max')).toBe('https://theharvest.app/?signup=max');
    expect(appSignupUrl()).toBe('https://theharvest.app/');
  });

  it('the referral parameter still survives on the signup link', () => {
    withRef();
    const url = appSignupUrl('max', 'yearly');
    expect(url).toBe('https://theharvest.app/?signup=max&billing=yearly&ref=partner7');
    // Asserted by name as well as by whole-string equality: the exact-match
    // above is what pins the order, this is what fails loudly if a future
    // parameter swallows or renames the one that pays the commission.
    expect(new URL(url).searchParams.get('ref')).toBe('partner7');
  });

  it('carries the ref on every plan and every term the cards can offer', () => {
    withRef();
    for (const planId of ['plus', 'pro', 'max']) {
      for (const billing of ['monthly', 'yearly'] as const) {
        const params = new URL(appSignupUrl(planId, billing)).searchParams;
        expect(params.get('signup')).toBe(planId);
        expect(params.get('billing')).toBe(billing);
        expect(params.get('ref')).toBe('partner7');
      }
    }
  });

  it('carries the term into the church funnel a ref-only visitor takes', () => {
    withRef();
    expect(appSignupUrl(undefined, 'yearly'))
      .toBe('https://theharvest.app/?signup=church&billing=yearly&ref=partner7');
  });
});
