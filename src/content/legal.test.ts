import { describe, expect, it } from 'vitest';
import { ANNUAL_BILLED_MONTHS, plans } from '../components/Pricing';
import {
  LEGAL_DOCS,
  LEGAL_UPDATED,
  TIER_PRICE_CLAIMS,
  THIRD_PARTY_PROCESSING,
  formatLegalDate,
  legalCanonical,
  legalHref,
  plainText,
  tierPriceMismatches,
  type LegalDoc,
} from './legal';

/* What the policies say.
 *
 * These are commercial and data-protection commitments in writing, so the
 * suite treats the prose as an artefact to be checked rather than as copy: it
 * reads every document through `plainText`, which is exactly what the page
 * renders. Route wiring and the footer column are covered separately in
 * pages/LegalPage.test.ts — that file imports App.tsx, and a price mismatch
 * stops it at import, which would hide the named failure below. */

const docs = LEGAL_DOCS.map((d) => [d.slug, d] as const);
const terms = LEGAL_DOCS.find((d) => d.slug === 'terms')!;
const text = (doc: LegalDoc) => plainText(doc);

describe('the legal document set', () => {
  it('is exactly terms, privacy and refunds', () => {
    expect(LEGAL_DOCS.map((d) => d.slug)).toEqual(['terms', 'privacy', 'refunds']);
  });

  it.each(docs)('%s carries the SEO fields every route on this site sets', (_slug, doc) => {
    expect(doc.seoTitle).toMatch(/Harvest$/);
    expect(doc.seoDescription.length).toBeGreaterThan(60);
    // Search engines truncate past ~160; a description that runs long is a
    // description nobody reads the end of.
    expect(doc.seoDescription.length).toBeLessThanOrEqual(260);
    expect(legalCanonical(doc.slug)).toBe(`https://theharvest.site${legalHref(doc.slug)}`);
  });

  it.each(docs)('%s is a real policy, not a placeholder', (_slug, doc) => {
    expect(doc.sections.length).toBeGreaterThanOrEqual(5);
    for (const section of doc.sections) {
      expect(section.blocks.length, `"${section.heading}" is an empty section`).toBeGreaterThan(0);
    }
    // Roughly a page and a half of prose. A reviewer will read these; a stub
    // that passes every other check here would still fail the actual purpose.
    expect(text(doc).length).toBeGreaterThan(2500);
  });

  it.each(docs)('%s has unique section anchors', (_slug, doc) => {
    // Section ids are linkable — a support reply points at one. Duplicates make
    // the second unreachable.
    const ids = doc.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is dated, in a format that survives prerender and hydration alike', () => {
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatLegalDate('2026-08-10')).toBe('10 August 2026');
  });
});

/* ---------------------------------------------------------------- *
 * The paragraph the whole page set exists for.
 * ---------------------------------------------------------------- */

describe('the third-party processing statement', () => {
  // Asserted on substance rather than on the exact sentence: the wording may be
  // improved, but a Harvest that appears to touch donation money — to a payments
  // reviewer or to a church — must not be shippable. Each expectation below is
  // one fact the statement has to carry.
  const body = text(terms);

  it('appears in the Terms', () => {
    expect(body).toContain(THIRD_PARTY_PROCESSING);
  });

  it('says subscription fees buy the software', () => {
    expect(body).toMatch(/subscription fees cover access to the harvest software/i);
  });

  it('names Stripe Connect as the rail giving runs on', () => {
    expect(body).toMatch(/stripe connect/i);
  });

  it('says Harvest does not hold, control or forward donation funds', () => {
    expect(body).toMatch(/harvest does not\s+hold,\s*control or forward donation funds/i);
    // And the same promise, restated in the section's own words rather than
    // only inside the quoted paragraph.
    expect(body).toMatch(/never passes through an account harvest controls/i);
  });

  it('states a 0% platform fee on donations', () => {
    expect(body).toMatch(/0%\s+platform fee/i);
    expect(body).toMatch(/no tier of harvest that takes a percentage of giving/i);
  });

  it('is repeated in the Privacy and Refund policies, where it also matters', () => {
    for (const doc of LEGAL_DOCS) {
      expect(text(doc), `${doc.slug} does not carry the third-party processing statement`)
        .toContain(THIRD_PARTY_PROCESSING);
    }
  });
});

/* ---------------------------------------------------------------- *
 * Things a policy must not say.
 * ---------------------------------------------------------------- */

describe('what the policies must not claim', () => {
  /* Add-ons — AI, extra contacts, unlimited contacts, extra seats and extra
     campuses — are priced and agreed but NOT BUILT. Marketing copy naming an
     unsold product is a mistake; a policy naming one is a written promise about
     something nobody can buy. */
  const ADD_ON_PATTERNS: [string, RegExp][] = [
    ['an add-on', /add-?ons?\b/i],
    ['unlimited anything', /\bunlimited\b/i],
    ['extra seats', /\b(extra|additional|per-)\s?(seat|seats)\b/i],
    ['campuses', /\bcampus(es)?\b/i],
    ['the AI add-on price', /\$19(?![\d,])/],
    ['the extra-contacts price', /\$20(?![\d,])/],
    ['the unlimited-contacts price', /\$59(?![\d,])/],
    ['the extra-seat price', /\$10(?![\d,])/],
  ];

  /* Harvest is pre-incorporation. There is no company name, company number or
     registered address to give, so none may be invented — a policy that names a
     legal entity which does not exist is worse than one that names none. Vendor
     names (Stripe, Google Cloud, Vercel …) are deliberately fine: those are
     other people's companies, and naming them is the point of a sub-processor
     list. What is banned is Harvest wearing an entity's clothes. */
  const ENTITY_PATTERNS: [string, RegExp][] = [
    ['a company suffix', /\b(LLC|Ltd|Limited|Inc|Incorporated|GmbH|PLC|Pty|S\.?R\.?L)\b/],
    ['a company registration', /company (number|registration|registered)/i],
    ['a registered address', /registered (office|address|company|in)/i],
    ['an incorporation claim', /\bincorporat(ed|ion)\b/i],
    ['a tax registration', /\b(VAT|tax) (number|registration|id)\b/i],
    ['a trading name for Harvest', /Harvest\s+(Inc|LLC|Ltd|Limited|Technologies|Software|Group|Holdings)\b/],
  ];

  /* No legal advice and no jurisdiction claims — there is no entity to attach a
     governing law to, and picking one anyway would be a claim we cannot stand
     behind. Likewise no compliance assertions: the controller/processor split in
     the Privacy Policy is a description of who decides what, which is true, and
     it is as far as these documents go. */
  const OVERREACH_PATTERNS: [string, RegExp][] = [
    ['a governing law', /governing law|governed by the laws|laws of the/i],
    ['a jurisdiction', /\bjurisdiction\b/i],
    ['a choice of courts', /\bcourts? of\b/i],
    ['a GDPR compliance claim', /\bGDPR\b/i],
    ['a blanket compliance claim', /\b(fully )?compl(y|ies|iant) with\b/i],
  ];

  /* Capabilities Harvest does not have. A false capability claim in marketing
     copy is a mistake; in a policy it is a term a customer is entitled to rely
     on. "a website builder" shipped in the first draft of these Terms and had
     to be corrected — Harvest has no page builder. What exists is per-tenant
     branding (custom domain, logo, brand colour, on the Ministry plan) and an
     editor for the blog, documents and sermon notes. Harvest has shipped four
     features that did not exist; this list is here so a fifth cannot arrive by
     way of a policy document. */
  const ABSENT_CAPABILITY_PATTERNS: [string, RegExp][] = [
    ['a website builder', /website\s+builder/i],
    ['a site builder', /\bsite\s+builder\b/i],
    ['a page builder', /\bpage\s+builder\b/i],
    ['drag-and-drop page editing', /drag[- ]and[- ]drop/i],
    ['a landing page product', /landing\s+pages?\b/i],
    ['a theme or template gallery', /\b(themes?|templates?)\s+(gallery|library|store)\b/i],
  ];

  const scan = (patterns: [string, RegExp][]) =>
    it.each(LEGAL_DOCS.map((d) => [d.slug, d] as const))('%s mentions none of them', (_slug, doc) => {
      const body = text(doc);
      for (const [label, pattern] of patterns) {
        expect(pattern.test(body), `${doc.slug} mentions ${label} (${pattern})`).toBe(false);
      }
    });

  describe('no capability Harvest does not have', () => scan(ABSENT_CAPABILITY_PATTERNS));
  describe('no unbuilt add-on', () => scan(ADD_ON_PATTERNS));
  describe('no company name or legal entity', () => scan(ENTITY_PATTERNS));
  describe('no jurisdiction, legal advice or compliance assertion', () => scan(OVERREACH_PATTERNS));
});

/* ---------------------------------------------------------------- *
 * Prices, against the source of truth.
 * ---------------------------------------------------------------- */

describe('the tier prices quoted in the Terms', () => {
  it('match the plans the pricing cards sell', () => {
    // The failure this catches: a price moves in Pricing.tsx and the Terms keep
    // quoting the old one, or the reverse. This site has shipped a stale price
    // in a blog post three times; in the Terms it would be a false commercial
    // claim. pages/LegalPage.tsx runs the same check at module scope, so it
    // fails the prerender too — this names it.
    expect(tierPriceMismatches(plans, ANNUAL_BILLED_MONTHS)).toEqual([]);
  });

  it('covers every plan on sale, and no plan that is not', () => {
    expect(TIER_PRICE_CLAIMS.map((c) => c.planId).sort()).toEqual(plans.map((p) => p.planId).sort());
  });

  // Independent of the grouping helper in legal.ts on purpose — a test that
  // reuses the code under test cannot catch it formatting "$1791".
  const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  it.each(TIER_PRICE_CLAIMS.map((c) => [c.name, c] as const))(
    '%s is quoted at both its monthly and its annual price',
    (_name, claim) => {
      const body = text(terms);
      expect(body, `the Terms do not quote $${claim.monthly}/mo for ${claim.name}`)
        .toContain(`$${grouped(claim.monthly)} per month`);
      expect(body, `the Terms do not quote $${claim.annual}/yr for ${claim.name}`)
        .toContain(`$${grouped(claim.annual)} per year`);
    },
  );

  it('describes the annual discount the way the site actually bills it', () => {
    // Nine months for twelve. The sentence in the Terms is prose, not a
    // computed figure, so this is what keeps it honest if the multiplier moves.
    expect(ANNUAL_BILLED_MONTHS).toBe(9);
    expect(text(terms)).toMatch(/a year paid up front costs nine months of the monthly rate/i);
  });
});

/* ---------------------------------------------------------------- *
 * Facts that must stay true of the product as it ships.
 * ---------------------------------------------------------------- */

describe('product facts stated in the policies', () => {
  it('quotes the trial the site actually advertises', () => {
    // Every CTA on this site says "Start your FREE 7-day trial". A longer trial
    // is planned and not shipped; quoting it here would be a false commercial
    // claim, so the Terms describe today's behaviour.
    expect(text(terms)).toMatch(/7-day free trial/i);
    expect(text(terms)).not.toMatch(/\b(14|30)-day/i);
  });

  it('describes the branded app, which exists, rather than a builder, which does not', () => {
    const body = text(terms);
    expect(body).toMatch(/public presence is the harvest app itself/i);
    // Branding and a custom domain are the top tier only — Pricing.tsx's
    // comparison rows read [false, false, true]. Naming the plan from `plans`
    // rather than as a literal means renaming the tier cannot leave the Terms
    // promising branding to a plan that does not include it.
    const topTier = plans[plans.length - 1].name;
    expect(body).toContain(`the ${topTier} plan adds your own domain`);
  });

  it('describes SMS and bulk email as the customer’s own accounts', () => {
    const body = text(terms);
    expect(body).toMatch(/bring-your-own twilio/i);
    expect(body).toMatch(/your own mailchimp account/i);
  });

  it('puts the church in control of member data and Harvest in the processor seat', () => {
    const privacy = text(LEGAL_DOCS.find((d) => d.slug === 'privacy')!);
    expect(privacy).toMatch(/your ministry is the data controller/i);
    expect(privacy).toMatch(/harvest is the data processor/i);
  });

  it('names every sub-processor that touches ministry data', () => {
    const privacy = text(LEGAL_DOCS.find((d) => d.slug === 'privacy')!);
    for (const vendor of ['Google Cloud', 'Stripe', 'Dodo Payments', 'Resend', 'Cloudflare', 'Vercel', 'Upstash']) {
      expect(privacy, `${vendor} is not named in the sub-processor list`).toContain(vendor);
    }
  });

  it('states the retention decision, notices included', () => {
    // Cancel → downgrade, never lock out; exports never gated; 12 months, with
    // notice at 11 and 11.5. All three documents lean on it, so it is checked
    // where a reader would look for it.
    const refunds = text(LEGAL_DOCS.find((d) => d.slug === 'refunds')!);
    const privacy = text(LEGAL_DOCS.find((d) => d.slug === 'privacy')!);
    for (const body of [refunds, privacy]) {
      expect(body).toMatch(/12 months/);
      expect(body).toMatch(/11 months/);
      expect(body).toMatch(/11\.5 months/);
      expect(body).toMatch(/export is never gated behind a payment/i);
    }
    expect(refunds).toMatch(/does not lock you out|never locked out/i);
    expect(refunds).toMatch(/downgraded rather than shut down|downgraded rather than closed/i);
  });

  it('tells a donor asking for a gift back to go to their church, not to Harvest', () => {
    const refunds = text(LEGAL_DOCS.find((d) => d.slug === 'refunds')!);
    expect(refunds).toMatch(/harvest never held that money/i);
    expect(refunds).toMatch(/contact that church directly/i);
  });

  it('gives a way to reach a human on every page', () => {
    for (const doc of LEGAL_DOCS) {
      expect(text(doc), `${doc.slug} gives no contact route`).toMatch(/theharvest\.site\/contact/);
    }
  });
});
