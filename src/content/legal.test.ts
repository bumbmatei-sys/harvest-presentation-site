import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { plans } from '../components/Pricing';
import {
  LEGAL_DOCS,
  LEGAL_UPDATED,
  MERCHANT_OF_RECORD_NOTE,
  TIER_PRICE_CLAIMS,
  THIRD_PARTY_PROCESSING,
  TRIAL_CTA_LABEL,
  TRIAL_LENGTH_DAYS,
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
    expect(tierPriceMismatches(plans)).toEqual([]);
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

  it('quotes the quarterly price for every tier as well', () => {
    for (const claim of TIER_PRICE_CLAIMS) {
      expect(text(terms), `the Terms do not quote $${claim.quarterly} per three months for ${claim.name}`)
        .toContain(`$${grouped(claim.quarterly)} per three months`);
    }
  });

  it('describes the terms without claiming a multiplier that no longer exists', () => {
    const body = text(terms);
    // The old clause said "a year paid up front costs nine months of the
    // monthly rate". That was exactly 25% and it is no longer true of any
    // tier — in the Terms, a stale rate is a false commercial claim.
    expect(body.toLowerCase()).not.toContain('nine months of the monthly rate');
    // What replaced it states the shape of the charge instead of a rate, which
    // is the fact a treasurer needs and the one that cannot go stale.
    expect(body).toMatch(/single payment for the whole term, not as a reduced monthly payment/i);
    expect(body).toMatch(/paid monthly, quarterly or annually/i);
    expect(body).toMatch(/a quarterly plan every three months/i);
  });
});

/* ---------------------------------------------------------------- *
 * Facts that must stay true of the product as it ships.
 * ---------------------------------------------------------------- */

describe('product facts stated in the policies', () => {
  it('quotes the trial the site actually advertises', () => {
    // Every CTA on this site renders TRIAL_CTA_LABEL, and the Terms clause and
    // the Refund policy both interpolate the same constant, so all six surfaces
    // move together. This guard used to require 7 and forbid 14 — correct until
    // the live Dodo products started running 14, at which point defending 7 was
    // defending the false number. Inverted, never loosened: a Terms clause
    // stating a trial length the product does not run is the failure mode, in
    // whichever direction it points.
    expect(text(terms)).toMatch(/14-day free trial/i);
    expect(text(terms)).not.toMatch(/\b(7|30)-day/i);
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

/* ---------------------------------------------------------------- *
 * The trial length, as a single source.
 * ---------------------------------------------------------------- */

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, '..');

/** Every source file the site renders copy from — components, content and
 *  pages. Tests are excluded on purpose: writing the number out as a literal is
 *  exactly what a guard is for, and the suite below is one of them. */
const renderedSources = (): [string, string][] => {
  const out: [string, string][] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) continue;
      out.push([path.relative(SRC, full), fs.readFileSync(full, 'utf8')]);
    }
  };
  for (const d of ['components', 'content', 'pages']) walk(path.join(SRC, d));
  return out;
};

/** Source with comments removed and every `${TRIAL_LENGTH_DAYS}` interpolation
 *  replaced by a non-numeric marker. What is left is the prose the site ships
 *  with the number written by hand. The `[^:]` guard on line comments keeps a
 *  `https://` inside a string literal from swallowing the rest of its line. */
const renderedProse = (source: string) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/\$\{\s*TRIAL_LENGTH_DAYS\s*\}/g, '<from-the-constant>');

describe('the trial length', () => {
  it('states the trial length the product actually runs', () => {
    // 14 is not this repo's choice. It is DODO_TRIAL_DAYS on the six live Dodo
    // products (the app's src/lib/dodo/catalogue.ts), and the app's checkout
    // path sets no override — so this is what a church signing up today gets.
    // The site said 7 from the moment Dodo went live for subscriptions, which
    // under-advertised Harvest's own trial by half.
    expect(TRIAL_LENGTH_DAYS).toBe(14);

    // Every surface that quotes a length derives it from that one constant.
    expect(TRIAL_CTA_LABEL).toBe(`Start your FREE ${TRIAL_LENGTH_DAYS}-day trial`);
    expect(text(terms)).toContain(`${TRIAL_LENGTH_DAYS}-day free trial`);
    expect(text(LEGAL_DOCS.find((d) => d.slug === 'refunds')!))
      .toContain(`${TRIAL_LENGTH_DAYS}-day free trial`);
  });

  it('never writes the trial length as a literal', () => {
    /* The test that would have caught the original bug, and the only one here
       that keeps catching the next one. Five surfaces said 7 because five
       surfaces each held their own copy of the number; correcting them to 14 by
       hand would leave the same five copies, ready to go stale again the next
       time Dodo is reconfigured. So this does not check which number appears —
       it checks that no rendered string states one at all. A trial length in
       this repo has to come through TRIAL_LENGTH_DAYS.

       Deliberately not a search for `7`: the 30-day prayer-request expiry in
       content/features.ts and the 30-day badge in FeatureMock.tsx are real,
       correct and nothing to do with billing, which is why the match is scoped
       to a day-count sitting beside the word "trial". */
    const LITERAL_BEFORE = /\b\d+[-\s]?days?\b(?=[^.\n]{0,40}?\btrial\b)/i;
    const LITERAL_AFTER = /\btrial\b[^.\n]{0,40}?\b\d+[-\s]?days?\b/i;

    const files = renderedSources();
    // A scan that silently walked nothing would pass forever. Name the files
    // that actually held the stale number, so a rename cannot quietly drop one
    // out of coverage.
    for (const expected of [
      path.join('components', 'Hero.tsx'),
      path.join('components', 'FinalCTA.tsx'),
      path.join('components', 'Nav.tsx'),
      path.join('components', 'SiteCTA.tsx'),
      path.join('content', 'faq.ts'),
      path.join('content', 'legal.ts'),
    ]) {
      expect(files.map(([f]) => f), `${expected} is no longer covered by the scan`).toContain(expected);
    }

    for (const [file, source] of files) {
      const prose = renderedProse(source);
      for (const pattern of [LITERAL_BEFORE, LITERAL_AFTER]) {
        const hit = prose.match(pattern);
        expect(
          hit,
          `${file} writes the trial length as a literal (${JSON.stringify(hit?.[0])}) ` +
          `instead of interpolating TRIAL_LENGTH_DAYS`,
        ).toBe(null);
      }
    }
  });
});

/* ---------------------------------------------------------------- *
 * Who the church is actually paying.
 * ---------------------------------------------------------------- */

const PRICING_SOURCE = fs.readFileSync(path.join(SRC, 'components', 'Pricing.tsx'), 'utf8');

/** The two places a church reads a money commitment, each with what counting it
 *  means there. Named by surface rather than matched by value — a bare search
 *  for "Dodo" would hit the sub-processor list in the Privacy policy, which is a
 *  data-protection disclosure and a different fact.
 *
 *  The Terms carry the sentence in their prose, so the disclosure is counted in
 *  the text a reader sees. The pricing section renders the imported constant, so
 *  the words never appear in Pricing.tsx at all and what is counted there is the
 *  render site itself. Counting the phrase in that file instead would count the
 *  comment above the paragraph and go on passing after the paragraph was
 *  deleted — which is exactly what it did until a mutation caught it. */
const MOR_SURFACES: [string, string, RegExp][] = [
  ['the Terms', plainText(terms), /merchant of record/gi],
  ['the pricing section', PRICING_SOURCE, /\{MERCHANT_OF_RECORD_NOTE\}/g],
];

const countOf = (haystack: string, pattern: RegExp) => (haystack.match(pattern) ?? []).length;

describe('the merchant-of-record disclosure', () => {
  it('discloses that the card statement reads Dodo Payments', () => {
    /* Dodo Payments is the merchant of record, so Dodo is the party that makes
       the charge and Dodo's name is the descriptor on the statement. A treasurer
       reconciling a card statement against a budget line will not find "Harvest"
       on it anywhere, and nothing else on either surface would tell them why. */
    expect(MERCHANT_OF_RECORD_NOTE).toMatch(/merchant of record/i);
    expect(MERCHANT_OF_RECORD_NOTE).toMatch(/card statement will read Dodo Payments, not Harvest/i);

    // The Terms carry the sentence itself; the pricing section renders the same
    // constant rather than a second copy of the words.
    expect(plainText(terms)).toContain(MERCHANT_OF_RECORD_NOTE);
    expect(PRICING_SOURCE).toContain('{MERCHANT_OF_RECORD_NOTE}');
  });

  it('discloses the merchant of record exactly once per surface', () => {
    /* One statement per surface, from one constant. Four copies of the minimum
       plan is how that claim ended up over-selling in four places at once, and
       a disclosure repeated under every plan card reads as boilerplate and gets
       skipped — which for this fact is the same as not making it. */
    for (const [surface, content, pattern] of MOR_SURFACES) {
      expect(countOf(content, pattern), `${surface} states it more than once, or not at all`).toBe(1);
    }

    // The other two policies must not grow their own copy of it. They are read
    // by the same treasurer, and a second wording is a second thing to keep true.
    for (const slug of ['privacy', 'refunds']) {
      const doc = LEGAL_DOCS.find((d) => d.slug === slug)!;
      expect(countOf(plainText(doc), /merchant of record/gi), `${slug} carries a second copy of the disclosure`).toBe(0);
    }

    // Nor may any component hand-write the phrase. Pricing.tsx is the one
    // surface that shows it, and it shows it by importing the constant.
    for (const [file, source] of renderedSources()) {
      if (file === path.join('content', 'legal.ts')) continue; // where it is defined
      expect(countOf(renderedProse(source), /merchant of record/gi), `${file} writes the disclosure out by hand`).toBe(0);
    }
  });
});
