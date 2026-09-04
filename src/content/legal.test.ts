import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATALOG_TOOL_COUNT } from '../components/catalog';
import { ADD_ONS, plans } from '../components/Pricing';
import {
  LEGAL_DOCS,
  LEGAL_UPDATED,
  MERCHANT_OF_RECORD_NOTE,
  PRIVACY_UPDATED,
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
import { CUSTOM_DOMAIN_MARKETING_ENABLED, SMS_MARKETING_ENABLED } from '../lib/flags';

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
     campuses — are sold in the app, not from the website, and the pricing page
     is the one surface that advertises them. A policy is a written commitment,
     so naming a purchasable extra here would bind Harvest to terms nobody
     drafted for it; naming an unsold one would promise a product that does not
     exist. Neither belongs in a policy, which is why the ban is on the subject
     and not on whether it happens to be buyable this month. */
  /* 🔴 DERIVED FROM `ADD_ONS` SINCE THE-223, for the reason content/faq.test.ts
     gives at the same spot: four hard-coded figures were banning $19 and $59,
     which no add-on costs any more, and were silent about $12 and $15, which
     two of them do. A policy naming an add-on price is the hazard; which
     figures those are is not this file's to remember. */
  const ALL_ADD_ON_PATTERNS: [string, RegExp][] = [
    ['an add-on', /add-?ons?\b/i],
    ['unlimited anything', /\bunlimited\b/i],
    ['extra seats', /\b(extra|additional|per-)\s?(seat|seats)\b/i],
    ['campuses', /\bcampus(es)?\b/i],
    ...ADD_ONS.flatMap(({ name, monthly, annual }): [string, RegExp][] => [
      [`the ${name} monthly price`, new RegExp(`\\$${monthly}(?![\\d,])`)],
      [`the ${name} annual price`, new RegExp(`\\$${annual}(?![\\d,])`)],
    ]),
  ];

  /* 🔴 THE-222 BROKE ONE OF THESE PATTERNS, and dropping it is the fix — the
     same collision content/faq.test.ts hits, for the same reason.

     The four PRICE patterns assume an add-on's price is a figure the policies
     have no other reason to print. THE-222 puts Individual at $20 a month, and
     the Terms are REQUIRED to quote it (TIER_PRICE_CLAIMS, rendered into the
     fees clause and checked at module scope by pages/LegalPage.tsx). So `/\$20/`
     now fires on the Terms being correct, and kept it would fail the build on
     the document saying the thing it must say.

     ⚠️ THE CONCEPT IS STILL GUARDED. The four WORD patterns are the
     load-bearing half — a policy that promised extra contacts would have to say
     "add-on", "unlimited", "extra seats" or "campus" — and they still fire.
     What is dropped is a numeric coincidence that can no longer tell a plan
     price from an add-on price.

     Derived from the plan table, so a future reprice off $20 restores the
     pattern on its own, and one onto $19 / $59 / $10 drops that one in turn. */
  const PLAN_PRICE_FIGURES = new Set(
    plans.flatMap((p) => [p.price.monthly, p.price.quarterly, p.price.yearly].map(String)),
  );
  const ADD_ON_PATTERNS = ALL_ADD_ON_PATTERNS.filter(([, re]) => {
    const figure = re.source.match(/\\\$(\d+)/)?.[1];
    return figure === undefined || !PLAN_PRICE_FIGURES.has(figure);
  });

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
    // Branding is the top tier only — Pricing.tsx's comparison rows read
    // [false, false, false, true]. Naming the plan from `plans` rather than as a
    // literal means renaming the tier cannot leave the Terms promising branding
    // to a plan that does not include it.
    const topTier = plans[plans.length - 1].name;
    // 🔴 THE-280 — asserted THROUGH the flag, because the clause is a
    // contractual statement and exactly one version of it is true at a time.
    // The BRANDING half is unconditional: it ships either way, and a correction
    // that took it out with the domain would have understated the tier.
    expect(body, 'the Terms stopped promising branding on the top tier')
      .toContain(`the ${topTier} plan adds your`);
    expect(body).toMatch(/your brand colour/i);
    if (CUSTOM_DOMAIN_MARKETING_ENABLED) {
      expect(body).toContain(`the ${topTier} plan adds your own domain`);
    } else {
      expect(body, 'the Terms still promise a domain that cannot be pointed')
        .not.toMatch(/your own domain/i);
      // And the address a church DOES get is still stated, so removing the
      // clause did not leave the section vaguer than it was.
      expect(body).toMatch(/its own address on theharvest\.app/i);
    }
  });

  it('describes the services a church connects itself, and only those', () => {
    // THE-245 — asserted THROUGH the flag, because both readings are statements
    // about what Harvest does and exactly one is true at a time. Mailchimp and
    // Stripe are unconditional: neither changed.
    const terms = text(LEGAL_DOCS.find((d) => d.slug === 'terms')!);
    expect(terms).toMatch(/your own mailchimp account/i);
    expect(terms).toMatch(/your own stripe account/i);

    if (SMS_MARKETING_ENABLED) {
      expect(terms).toMatch(/bring-your-own twilio/i);
    } else {
      // 🔴 No Twilio clause at all while the feature is hidden. A contract that
      // describes a connection a church cannot make is a promise about a
      // service that is not being provided.
      expect(terms).not.toMatch(/twilio/i);
      expect(terms).not.toMatch(/\bsms\b/i);
    }
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

/* ---------------------------------------------------------------- *
 * THE-198 — the product analytics disclosure.
 *
 * PostHog is installed in the Harvest application (app repo PR #365) and is
 * inert only until NEXT_PUBLIC_POSTHOG_KEY is set. Once it is, the application
 * captures usage against a Firebase uid on authenticated screens, and this
 * policy is the only place a member is told so.
 *
 * Every expectation below is a fact of the SHIPPED configuration, read from
 * src/lib/analytics/{config,events,identity}.ts and docs/analytics-posthog.md
 * in the app repo — not from PostHog's defaults. Asserted against the rendered
 * prose, because a constant nobody renders discloses nothing.
 * ---------------------------------------------------------------- */

describe('product analytics disclosure', () => {
  const privacyDoc = LEGAL_DOCS.find((d) => d.slug === 'privacy')!;
  const privacy = text(privacyDoc);

  it('the privacy policy names the product analytics processor', () => {
    // Naming the vendor is the disclosure. "A third-party analytics provider"
    // would satisfy a reader and tell a data subject nothing they could act on.
    expect(privacy).toContain('PostHog');
  });

  it('it distinguishes marketing-site page views from in-app product analytics', () => {
    // 🔴 The sentence this PR exists to correct. Before THE-198 the policy's
    // only analytics claim was "aggregated page-view analytics for this
    // marketing site" — true of Vercel, false as a description of what Harvest
    // now holds, because PostHog runs inside the application on authenticated
    // screens. Both must be present AND distinguished; either alone is the bug.
    expect(privacy).toMatch(/aggregated page-view analytics for this marketing site/i);
    expect(privacy).toMatch(/product analytics for the harvest application/i);
    // The site claim must be scoped, so it cannot be read as covering the app.
    expect(privacy).toMatch(/this covers theharvest\.site only/i);
    // And the two must be stated as different things, not as one paragraph.
    expect(privacy).toMatch(/these work differently from the site analytics/i);
  });

  it('it states where product analytics data is processed', () => {
    // ⚠️ Deliberately not a named region. The PostHog project does not exist
    // yet: the founder chooses EU or US AT CREATION and it cannot be migrated
    // (docs/analytics-posthog.md §3). config.ts defaults to eu.i.posthog.com
    // and US requires setting NEXT_PUBLIC_POSTHOG_HOST. So the region is
    // unverifiable today and naming one would be the kind of false sentence
    // this whole PR exists to remove. What IS true either way, and is the fact
    // that matters, is that it does not live with workspace data.
    expect(privacy).toMatch(/held by posthog on posthog's own cloud infrastructure/i);
    expect(privacy).toMatch(/separately from your workspace data/i);
    expect(privacy).toMatch(/nor necessarily in the same country/i);
  });

  it('it does not describe uid-identified analytics as anonymous', () => {
    // 🔴 The accuracy guard. A Firebase uid identifies a person indirectly: it
    // is pseudonymous, not anonymous. "Aggregated" is accurate for the
    // marketing site and would not be accurate here. This scans the rendered
    // prose so a future edit cannot reintroduce the word by writing a new
    // sentence somewhere else in the document.
    const claimsAnonymity = privacy
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => /\banonymous\b/i.test(sentence))
      .filter((sentence) => !/\bnot anonymous\b/i.test(sentence));
    expect(claimsAnonymity, 'the privacy policy calls something anonymous').toEqual([]);
    // And it says so positively, rather than merely avoiding the word.
    expect(privacy).toMatch(/it does stand for a single person — so it is not anonymous/i);
    expect(privacy).toMatch(/not a name or an email address/i);
  });

  it('it states that session recording and autocapture are off', () => {
    // Both are OFF in config.ts and both are double-locked:
    //   replay      — disable_session_recording: true, and
    //                 disable_external_dependency_loading: true means the
    //                 recorder cannot even be fetched.
    //   autocapture — autocapture/capture_heatmaps/capture_dead_clicks/
    //                 rageclick all false, and before_send drops any event
    //                 outside the closed vocabulary, $copy_autocapture included.
    expect(privacy).toMatch(/there is no session recording/i);
    expect(privacy).toMatch(/does not capture or replay what is on your screen/i);
    expect(privacy).toMatch(/blocked from being downloaded/i);
    expect(privacy).toMatch(/nothing is collected automatically from the page/i);
    expect(privacy).toMatch(/what you click, type, copy or hover over is not read/i);
    // capture_exceptions: false — Sentry does that, with its own scrubbing.
    expect(privacy).toMatch(/errors are not sent to it either/i);
  });

  it('it states the cookie and its lifetime', () => {
    // persistence is left at PostHog's default 'localStorage+cookie', which
    // writes a first-party ph_<token>_posthog cookie lasting 365 days
    // (docs/analytics-posthog.md, "Consent"). ⚠️ The policy had NO cookie
    // section before this PR — this is the first mention of a cookie in any of
    // the three documents.
    expect(privacy).toMatch(/first-party cookie/i);
    expect(privacy).toMatch(/365 days/i);
  });

  it('it states which surfaces send nothing', () => {
    // ⚠️ REWRITTEN BY THE-209, and the rewrite is the point. This test used to
    // require the words "public blog, form and event pages" inside the
    // send-nothing sentence — it pinned the claim that app PR #373 made false.
    // The guard itself is still worth having: a reader must be told which
    // surfaces are outside this. What changed is the true set, so the
    // assertion narrows to the two survivors and THE_209 below refuses the
    // third. `/auth`, `/onboarding` and `/church-onboarding` are absent from
    // ROUTE_TABLE in the app's src/lib/analytics/routes.ts and named in
    // PRE_AUTH_PATTERNS; the marketing site is this repo, which has no PostHog.
    expect(privacy).toMatch(/send nothing at all/i);
    expect(privacy).toMatch(/this marketing site is a separate application/i);
    expect(privacy).toMatch(/sign-in and onboarding are deliberately left out/i);
  });

  it('the subprocessor list includes the analytics processor', () => {
    // The list is the place a church's own reviewer looks. Asserted through
    // the rendered section rather than the SUB_PROCESSORS constant.
    const whereDataLives = privacyDoc.sections.find((s) => s.id === 'where-data-lives')!;
    const listed = whereDataLives.blocks.flatMap((b) => (b.kind === 'p' ? [] : b.items));
    expect(listed.some((entry) => entry.startsWith('PostHog —'))).toBe(true);
    // And Vercel's own entry is scoped to this site, so the two analytics
    // claims cannot be read as one.
    expect(
      listed.some((entry) => /^Vercel —.*aggregated page-view analytics for this site\.$/.test(entry)),
    ).toBe(true);
  });
});

/* ---------------------------------------------------------------- *
 * THE-198 — what this PR must NOT have moved.
 *
 * A privacy edit that quietly changes a payments claim, a price or another
 * policy is the failure mode these three guard. Hashes are of the RENDERED
 * prose, taken from origin/main at 4ee9a33 before any edit in this branch.
 * ---------------------------------------------------------------- */

describe('what the analytics disclosure must not have touched', () => {
  const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');

  it('THIRD_PARTY_PROCESSING is unchanged', () => {
    // Byte for byte. Shared by all three policies precisely so the payments
    // claim cannot drift, so it is pinned as bytes rather than as substance —
    // the substance is already covered above.
    expect(THIRD_PARTY_PROCESSING).toBe(
      'Subscription fees cover access to the Harvest software. Congregational giving and donation ' +
        'features connect directly through third-party payment rails (Stripe Connect); Harvest does not ' +
        'hold, control or forward donation funds, and charges a 0% platform fee on them.',
    );
    expect(sha256(THIRD_PARTY_PROCESSING))
      .toBe('d520667c4c782b92bf8239ef157967a00548675eec5f94526b745bf57a086ca9');
  });

  it('the Terms and Refund policies are unchanged', () => {
    // Nothing in THE-198 makes a sentence in either document false: neither
    // mentions analytics, cookies or sub-processors at all. If a legitimate
    // future edit changes one, this fails loudly and on purpose — read the
    // diff, decide, then move the hash.
    //
    // 🔴 THE TERMS HASH MOVED AT THE-248, and this is that mechanism working
    // rather than failing. The Terms QUOTE the tier prices — `tierRows` renders
    // "Individual — $20 per month, $54 per three months, or $190 per year" out
    // of TIER_PRICE_CLAIMS — so a reprice necessarily changes the document's
    // text. The diff was read: only the six discounted figures moved, no clause
    // was reworded, and the monthly column is untouched. The REFUND policy hash
    // below quotes no price and is unchanged, which is the control on that
    // reading.
    //
    // 🔴 AND AGAIN AT THE-245, for a different reason: §6 lists the services a
    // church connects itself, and one of them was "SMS is bring-your-own
    // Twilio". While SMS is hidden that bullet describes a connection nobody
    // can make, which in a contract is worse than an out-of-date price. The
    // diff was read: exactly one list item was REMOVED, no clause reworded, no
    // price touched, and the surrounding paragraphs are byte-identical. The
    // REFUND hash below is unchanged again, which is the same control holding.
    //
    // 🔴 AND AGAIN AT THE-280, for the same reason as THE-245. §1 said "the
    // Ministry plan adds your own domain, your logo and your brand colour" —
    // and a custom domain cannot be pointed at Harvest: the provisioning route
    // answers 503 and always rested on hosting the platform does not pay for.
    // In a contract that is a statement about a service not being provided. The
    // diff was read: exactly ONE CLAUSE was removed from one sentence in §1
    // ("your own domain, "), the logo and brand-colour claims are untouched
    // because branding does ship, no other clause was reworded, no price was
    // touched, and every other paragraph is byte-identical. The REFUND hash
    // below is unchanged for the third time, which is the same control holding.
    expect(sha256(text(LEGAL_DOCS.find((d) => d.slug === 'terms')!)))
      .toBe('04a5b733fc639b9ca695374cd836ff9810c047205acbf0b9863e5937f6f44f61');
    expect(sha256(text(LEGAL_DOCS.find((d) => d.slug === 'refunds')!)))
      .toBe('0a169518e5929793709b6127bc8719e68382cf0f206c1c326766c61a147a9fb0');
  });

  it('no price or tool count changed', () => {
    // The prices the Terms quote still match the cards that sell them, and the
    // catalogue count the pricing page renders is untouched.
    expect(tierPriceMismatches(plans)).toEqual([]);
    // 🔵 27 → 28 at THE-306, which added the Shareable Giving Page — a live, unflagged tool that shipped in THE-281 with no mega-menu row at all.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(TIER_PRICE_CLAIMS.map((c) => `${c.planId}:${c.monthly}/${c.quarterly}/${c.annual}`)).toEqual([
      'plus:20/54/190',
      'pro:40/108/380',
      'max:80/216/760',
    ]);
  });
});

/* ---------------------------------------------------------------- *
 * THE-209 — the corrections app PR #373 made necessary.
 *
 * PR #373 extended PostHog from 4 of 14 pages to 14 of 14, the ten dedicated
 * public Next routes included. Three sentences written while those pages sent
 * nothing became false, and the policy was live while they were.
 *
 * Every expectation below is a fact of the SHIPPED configuration, read from
 * src/lib/analytics/routes.ts and src/lib/analytics/config.ts and
 * docs/analytics-posthog.md in bumbmatei-sys/Harvest-agent @ 95ddf9d5 — not
 * from PostHog's defaults and not from the ticket. Asserted against the
 * rendered prose (`plainText`, which is what LegalPage renders), because a
 * constant nobody renders discloses nothing.
 *
 * 🔴 NOT asserted, deliberately: the hosting REGION. config.ts defaults to
 * POSTHOG_EU_HOST and reads NEXT_PUBLIC_POSTHOG_HOST for anything else — a
 * Vercel environment variable, which is not in the app repo. "US cloud" is
 * therefore unverifiable from source, and naming a region would be exactly the
 * kind of sentence this ticket exists to remove. See the THE-198 test above,
 * which pins the region-free phrasing.
 * ---------------------------------------------------------------- */

describe('THE-209 — the public pages are now counted, and the policy says so', () => {
  const privacyDoc = LEGAL_DOCS.find((d) => d.slug === 'privacy')!;
  const privacy = text(privacyDoc);
  const sentences = privacy.split(/(?<=[.!?;])\s+/);

  /* 1 — the false one. */
  it('no sentence claims public blog, form or event pages send nothing', () => {
    // ROUTE_TABLE in the app's src/lib/analytics/routes.ts carries
    // /blog/[id], /form/[formId], /event/[eventId] and seven more, each
    // `surface: 'public', public: true`, each mounting PublicRouteAnalytics.
    // They send a $pageview. The sentence that said otherwise was published.
    const sendNothing = sentences.filter((s) => /sends? nothing/i.test(s));
    expect(sendNothing.length, 'the send-nothing claim vanished entirely').toBeGreaterThan(0);
    for (const sentence of sendNothing) {
      expect(/\bblog\b/i.test(sentence), `claims blog pages send nothing: "${sentence}"`).toBe(false);
      expect(/\bform\b/i.test(sentence), `claims form pages send nothing: "${sentence}"`).toBe(false);
      expect(/\bevent\b/i.test(sentence), `claims event pages send nothing: "${sentence}"`).toBe(false);
      expect(/\bpublic\b/i.test(sentence), `claims public pages send nothing: "${sentence}"`).toBe(false);
    }
    // And the exact published wording is gone, not merely reworded around.
    expect(privacy).not.toMatch(/public blog, form and event pages/i);
    expect(privacy).not.toMatch(/screens outside the signed-in application/i);
  });

  /* 2 — the survivor. Narrowed, not deleted. */
  it('the marketing site, sign-in and onboarding are still described as sending nothing', () => {
    // Still true, and the reason each is true is different. The marketing site
    // is THIS repo — it has no PostHog at all. /auth, /onboarding and
    // /church-onboarding are absent from ROUTE_TABLE and named in
    // PRE_AUTH_PATTERNS; PR #373 explicitly did not widen coverage to them.
    expect(privacy).toMatch(/send nothing at all/i);
    expect(privacy).toMatch(/this marketing site is a separate application/i);
    expect(privacy).toMatch(/sign-in and onboarding are deliberately left out/i);
    // The pre-auth exclusion is a real exclusion, not a configured blindness.
    expect(privacy).toMatch(/the analytics code is never started/i);
  });

  /* 3 — the substantive change, and the reason this ticket exists. */
  it('the policy describes what an anonymous visitor is given', () => {
    // person_profiles: 'identified_only' (config.ts) + public routes never
    // calling identify() (docs §5b) = a random device id in first-party
    // storage and NO stored person profile. The policy had never described
    // this case, because until PR #373 there was no unauthenticated visitor to
    // describe. Burying it would repeat the gap this exercise closed.
    expect(privacy).toMatch(/random device identifier/i);
    expect(privacy).toMatch(/no profile of them is stored/i);
    // Counted without signing in, without an account, without being asked.
    expect(privacy).toMatch(/without signing in, without an account, and without being asked/i);
    // And it is stated in the open, not left to be inferred from the cookie
    // paragraph — the disclosure must be a claim, not a side effect.
    expect(privacy).toMatch(/worth stating plainly/i);
    // The honest consequence: a browser that signed in before is still that
    // account (docs §5b — the persisted distinct_id survives).
    expect(privacy).toMatch(/if that browser has been signed in to harvest before/i);
    // The cookie reaches them too, before any relationship exists.
    expect(privacy).toMatch(/before you have signed in or been asked for anything/i);
  });

  /* 4 — the same honesty the account id already gets. */
  it('it does not describe the device identifier as anonymous', () => {
    // The policy already refuses to call the account id anonymous, because it
    // stands for one person. A device id stands for one browser across visits,
    // so it gets the same treatment rather than the flattering word.
    const deviceSentences = sentences.filter((s) => /device identifier/i.test(s));
    expect(deviceSentences.length, 'the device identifier is never described').toBeGreaterThan(0);
    for (const sentence of deviceSentences) {
      const claimsAnonymity = /\banonymous\b/i.test(sentence) && !/\bnot anonymous\b/i.test(sentence);
      expect(claimsAnonymity, `calls the device identifier anonymous: "${sentence}"`).toBe(false);
      expect(/\baggregated\b/i.test(sentence), `calls it aggregated: "${sentence}"`).toBe(false);
    }
    // Stated positively, so a later edit cannot quietly drop the qualification.
    expect(privacy).toMatch(/singles out one browser across visits — so it is not anonymous/i);
  });

  /* 5 — two values became three. */
  it('the list of what is sent no longer says only admin or member', () => {
    // AppSurface in routes.ts is 'admin' | 'member' | 'public'.
    expect(privacy).not.toMatch(/whether it was an admin or a member screen/i);
    expect(privacy).toMatch(/an admin screen, a member screen, or a public one/i);
  });

  /* 6 — "the person signed in" does not describe a blog reader. */
  it('it does not claim every event carries the id of a signed-in person', () => {
    // The account id is now conditional. Any sentence that mentions it must
    // carry the condition, rather than asserting it of every event.
    expect(privacy).not.toMatch(/the internal account id of the person signed in/i);
    const idSentences = sentences.filter((s) => /internal account id/i.test(s));
    expect(idSentences.length).toBeGreaterThan(0);
    for (const sentence of idSentences) {
      expect(
        /where (someone|the person) is signed in/i.test(sentence),
        `states the account id unconditionally: "${sentence}"`,
      ).toBe(true);
    }
  });

  /* The path guarantee, which is the reason a public URL can be counted at
     all. Not one of the three false sentences, but it is what makes the
     corrected ones true — a resolved path never becomes a property. */
  it('it states that the route pattern is stored, never the visited address', () => {
    // normalizeAnalyticsPath() in routes.ts; applied again in before_send via
    // stripUrlNoise() in config.ts, which is what catches $current_url,
    // $referrer and $pathname. UNROUTED_PATTERN is '/[unrouted]'.
    expect(privacy).toMatch(/recorded as its route pattern and never as the address actually visited/i);
    expect(privacy).toContain('/form/[formId]');
    expect(privacy).toContain('/[unrouted]');
    // An external referrer keeps its host and loses its path.
    expect(privacy).toMatch(/keeps the name of the site it came from and loses the rest/i);
  });

  /* 7 — the date the earlier PR was right to decline to bump. */
  it("the privacy policy's updated date is later than the Terms and Refund dates", () => {
    const on = (slug: string) => LEGAL_DOCS.find((d) => d.slug === slug)!.updated;
    expect(on('privacy') > on('terms')).toBe(true);
    expect(on('privacy') > on('refunds')).toBe(true);
    // Pinned, all three — the point of splitting them is that each one moves
    // only when its own wording does.
    expect(on('terms')).toBe('2026-08-10');
    expect(on('refunds')).toBe('2026-08-10');
    expect(on('privacy')).toBe('2026-08-23');
    expect(PRIVACY_UPDATED).toBe('2026-08-23');
    expect(LEGAL_UPDATED).toBe('2026-08-10');
    // Every document carries one, in the format the page can format.
    for (const doc of LEGAL_DOCS) {
      expect(doc.updated, `${doc.slug} has no date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // What the page actually prints (LegalPage.tsx: formatLegalDate(doc.updated)).
    expect(formatLegalDate(on('privacy'))).toBe('23 August 2026');
    expect(formatLegalDate(on('terms'))).toBe('10 August 2026');
  });

  /* 8 — the two documents this ticket must not have touched. */
  it('the Terms and Refund policies are unchanged apart from carrying their own dates', () => {
    // Same rendered-prose hashes as the THE-198 block above, re-asserted here
    // because per-document dates touched the LegalDoc shape that both share.
    // `plainText` walks title, standfirst and sections only, so adding
    // `updated` cannot move these — which is the proof that it did not.
    const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
    // 🔴 Terms hash moved at THE-280 — one clause out of §1, for the reason
    // recorded in full on the THE-198 block above. Kept in step deliberately:
    // the two sites pin the same document and must not disagree about it.
    expect(sha256(text(LEGAL_DOCS.find((d) => d.slug === 'terms')!)))
      .toBe('04a5b733fc639b9ca695374cd836ff9810c047205acbf0b9863e5937f6f44f61');
    expect(sha256(text(LEGAL_DOCS.find((d) => d.slug === 'refunds')!)))
      .toBe('0a169518e5929793709b6127bc8719e68382cf0f206c1c326766c61a147a9fb0');
    // And neither was restated as revised.
    expect(LEGAL_DOCS.find((d) => d.slug === 'terms')!.updated).toBe(LEGAL_UPDATED);
    expect(LEGAL_DOCS.find((d) => d.slug === 'refunds')!.updated).toBe(LEGAL_UPDATED);
  });

  /* 9 — the shared payments claim. */
  it('THIRD_PARTY_PROCESSING is unchanged', () => {
    // Byte for byte. Shared across all three policies precisely so the
    // payments claim cannot drift on the back of an unrelated edit.
    const sha256 = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
    expect(sha256(THIRD_PARTY_PROCESSING))
      .toBe('d520667c4c782b92bf8239ef157967a00548675eec5f94526b745bf57a086ca9');
    for (const doc of LEGAL_DOCS) {
      expect(text(doc), `${doc.slug} lost the third-party processing statement`)
        .toContain(THIRD_PARTY_PROCESSING);
    }
  });

  /* 10 — the ban this correction had to be written inside. */
  it('no overreach pattern appears', () => {
    // "jurisdiction" and "GDPR" are banned outright, and the existing copy
    // works around it with "not necessarily in the same country" — which the
    // new paragraphs had to preserve rather than reach past. The global scan
    // above covers all three documents; this re-asserts it for the prose this
    // ticket added.
    expect(privacy).not.toMatch(/\bjurisdiction\b/i);
    expect(privacy).not.toMatch(/\bGDPR\b/i);
    expect(privacy).not.toMatch(/governing law|governed by the laws|laws of the/i);
    expect(privacy).not.toMatch(/\bcourts? of\b/i);
    expect(privacy).not.toMatch(/\b(fully )?compl(y|ies|iant) with\b/i);
    // The workaround is still doing its job.
    expect(privacy).toMatch(/nor necessarily in the same country/i);
  });

  /* 11 — nothing commercial moved. */
  it('no price or tool count changed', () => {
    expect(tierPriceMismatches(plans)).toEqual([]);
    // 🔵 27 → 28 at THE-306, which added the Shareable Giving Page — a live, unflagged tool that shipped in THE-281 with no mega-menu row at all.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(TIER_PRICE_CLAIMS.map((c) => `${c.planId}:${c.monthly}/${c.quarterly}/${c.annual}`)).toEqual([
      'plus:20/54/190',
      'pro:40/108/380',
      'max:80/216/760',
    ]);
  });

  /* The sub-processor entry a church's own reviewer reads first. */
  it('the sub-processor entry describes both kinds of visitor', () => {
    const whereDataLives = privacyDoc.sections.find((s) => s.id === 'where-data-lives')!;
    const listed = whereDataLives.blocks.flatMap((b) => (b.kind === 'p' ? [] : b.items));
    const posthog = listed.find((entry) => entry.startsWith('PostHog —'))!;
    expect(posthog, 'PostHog is no longer in the sub-processor list').toBeDefined();
    expect(posthog).toMatch(/public pages/i);
    expect(posthog).toMatch(/device identifier where nobody is/i);
  });
});
