import { describe, expect, it } from 'vitest';
import { ADVERTISED_DISCOUNT_PCT, discountClaim, plans } from '../components/Pricing';
import { TRIAL_LENGTH_DAYS } from './legal';
import {
  FAQS,
  FAQ_CANONICAL,
  FAQ_HREF,
  FAQ_PLAN_CLAIMS,
  FAQ_SEO_DESCRIPTION,
  FAQ_SEO_TITLE,
  answerText,
  faqJsonLd,
  faqPlainText,
  faqPlanMismatches,
} from './faq';

/* What the FAQ says.
 *
 * This is the page a church leader or treasurer reads immediately before
 * deciding to pay, so the suite treats the answers as commercial claims rather
 * than as copy: it reads the finished prose through `faqPlainText`, which is
 * exactly what the page renders. Route wiring, the footer link and the
 * prerender list are covered in pages/FaqPage.test.ts — that file imports
 * App.tsx, and a price mismatch stops it at import, which would hide the named
 * failure below. */

const body = faqPlainText();
const entries = FAQS.map((f) => [f.id, f] as const);

describe('the FAQ page metadata', () => {
  it('carries the SEO fields every route on this site sets', () => {
    expect(FAQ_SEO_TITLE).toMatch(/Harvest$/);
    expect(FAQ_SEO_DESCRIPTION.length).toBeGreaterThan(60);
    // Search engines truncate past ~160; a description that runs long is a
    // description nobody reads the end of.
    expect(FAQ_SEO_DESCRIPTION.length).toBeLessThanOrEqual(260);
    expect(FAQ_CANONICAL).toBe(`https://theharvest.site${FAQ_HREF}`);
  });

  it('is a real FAQ, not a placeholder', () => {
    expect(FAQS.length).toBeGreaterThanOrEqual(8);
    for (const faq of FAQS) {
      expect(faq.question.endsWith('?'), `"${faq.question}" is not a question`).toBe(true);
      expect(faq.answer.length, `"${faq.question}" has no answer`).toBeGreaterThan(0);
      expect(answerText(faq).length, `"${faq.question}" is answered in a phrase`).toBeGreaterThan(120);
    }
  });

  it('has unique anchors and asks nothing twice', () => {
    // Anchor ids are linkable — a support reply points at one. Duplicates make
    // the second unreachable, and a repeated question in FAQPage markup is a
    // structured-data error as well as a reading one.
    const ids = FAQS.map((f) => f.id);
    const questions = FAQS.map((f) => f.question);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(questions).size).toBe(questions.length);
  });
});

/* ---------------------------------------------------------------- *
 * Prices and limits, against the source of truth.
 * ---------------------------------------------------------------- */

describe('the prices and limits quoted in the FAQ', () => {
  it('match the plans the pricing cards sell', () => {
    // The failure this catches: a price or a plan limit moves in Pricing.tsx and
    // the FAQ keeps quoting the old one, or the reverse. This site has shipped a
    // stale price in a blog post three times; on this page it would be a false
    // commercial claim to somebody about to pay it. pages/FaqPage.tsx runs the
    // same check at module scope, so it fails the prerender too — this names it.
    expect(faqPlanMismatches(plans)).toEqual([]);
  });

  it('covers every plan on sale, and no plan that is not', () => {
    expect(FAQ_PLAN_CLAIMS.map((c) => c.planId).sort()).toEqual(plans.map((p) => p.planId).sort());
  });

  // Independent of the grouping helper in faq.ts on purpose — a test that
  // reuses the code under test cannot catch it formatting "$1791".
  const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  it.each(FAQ_PLAN_CLAIMS.map((c) => [c.name, c] as const))(
    '%s is quoted at its monthly price, its annual price and its limits',
    (_name, claim) => {
      expect(body, `the FAQ does not quote $${claim.monthly}/mo for ${claim.name}`)
        .toContain(`$${grouped(claim.monthly)} a month`);
      expect(body, `the FAQ does not quote $${claim.annual}/yr for ${claim.name}`)
        .toContain(`$${grouped(claim.annual)} a year`);
      expect(body, `the FAQ does not state ${claim.name}'s contact and admin ceilings`)
        .toContain(`${claim.contacts} contacts, ${claim.admins} admin accounts, ${claim.courses} courses`);
    },
  );

  it('quotes the quarterly price for every tier as well', () => {
    for (const claim of FAQ_PLAN_CLAIMS) {
      expect(body, `the FAQ does not quote $${claim.quarterly} every three months for ${claim.name}`)
        .toContain(`$${grouped(claim.quarterly)} every three months`);
    }
  });

  it('describes each discount in the wording the prices permit', () => {
    // 🔴 The sentence carries `discountClaim`, which decides FROM THE PRICES
    // whether a percentage may be stated flat or has to say "up to". Quarterly
    // is flat (worst tier saves 15.4% against 15%); yearly is "up to" (worst
    // tier saves 29.70% against 30%). Asserting the rendered prose is what
    // stops a copy edit quietly turning the hedge back into a flat claim.
    expect(body).toContain(discountClaim('quarterly'));
    expect(body.toLowerCase()).toContain(discountClaim('yearly').toLowerCase());
    expect(discountClaim('yearly')).toBe('Save up to 30%');
    expect(body.toLowerCase()).not.toMatch(/\bsave 30%/);
    // The old 9-of-12 sentence must not survive: there is no such multiplier.
    expect(body.toLowerCase()).not.toContain('nine months of the monthly rate');
  });

  it('says the longer terms are one charge, not a cheaper monthly one', () => {
    // ⚠️ What a church is actually charged must be unambiguous.
    expect(body).toContain(`a single payment of $${grouped(FAQ_PLAN_CLAIMS[0].annual)}`);
    expect(ADVERTISED_DISCOUNT_PCT.quarterly).toBe(15);
  });
});

/* ---------------------------------------------------------------- *
 * The answer the page exists for.
 * ---------------------------------------------------------------- */

describe('the donation-fee answer', () => {
  const fee = FAQS.find((f) => f.id === 'donation-fee');

  it('is on the page, and is the first thing asked', () => {
    expect(fee, 'the FAQ does not answer whether Harvest takes a cut of donations').toBeDefined();
    expect(FAQS[0].id).toBe('donation-fee');
  });

  it('states a 0% platform fee on every plan', () => {
    const text = answerText(fee!);
    expect(text).toMatch(/0% platform fee/i);
    expect(text).toMatch(/no tier of harvest that takes a percentage/i);
    expect(text).toMatch(/not an introductory rate/i);
  });

  it('says the same thing the policies say about where the money goes', () => {
    // The Terms, the Privacy Policy and the Refund Policy all carry the
    // third-party processing statement. A buyer page that described giving
    // differently would contradict the documents they are asked to agree to.
    const text = answerText(fee!);
    expect(text).toMatch(/stripe connect/i);
    expect(text).toMatch(/harvest does not hold, control or forward donation funds/i);
  });

  it('claims nothing about what anybody else charges', () => {
    // Competitors do charge a percentage, and it is the reason this answer is
    // worth leading with — but no figure for another company's fee is
    // verifiable from this repo, so none is published.
    expect(body).not.toMatch(/competitors?\b/i);
    expect(body).not.toMatch(/\b\d+(\.\d+)?\s*[–-]\s*\d+(\.\d+)?%/);
  });
});

/* ---------------------------------------------------------------- *
 * Things the FAQ must not say.
 * ---------------------------------------------------------------- */

describe('what the FAQ must not claim', () => {
  /* Add-ons — AI, extra contacts, unlimited contacts, extra admin accounts and
     extra campuses — are priced and agreed but NOT BUILT. Naming one on the page
     a buyer reads before paying would sell a product nobody can buy. Mirrors the
     list in content/legal.test.ts, because the hazard is identical. */
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

  /* The trial is whatever the live Dodo products run, which is 14 days — set as
     DODO_TRIAL_DAYS in the app's src/lib/dodo/catalogue.ts, with nothing in the
     checkout path overriding it. These guards used to defend 7 and forbid 14,
     which was right until Dodo went live on 2026-08-12 and made 7 the false
     number. They are inverted, not relaxed: the job has never been to defend a
     particular figure, it is to stop this page quoting a trial the product does
     not run. 30 is forbidden alongside 7 because Dodo also offers a 30-day
     card-up-front trial that Harvest deliberately did not choose. */
  const TRIAL_PATTERNS: [string, RegExp][] = [
    ['a 7- or 30-day trial', /\b(7|30)[- ]day/i],
    ['a trial length other than the one the product runs', /\b(?!14\b)\d+-day free trial/i],
  ];

  /* SMS is bring-your-own Twilio and bulk email is the customer's own Mailchimp.
     There is no platform SMS: Harvest sells no messages, bundles none, and takes
     no margin on them. A buyer who read otherwise would budget wrongly. */
  const PLATFORM_SENDING_PATTERNS: [string, RegExp][] = [
    ['SMS credits or a message allowance', /\b(sms|text|message)\s+(credits?|allowance|bundle|package)/i],
    ['messages included in the subscription', /\b(sms|texts?|messages?)\s+(are\s+)?included\b/i],
    ['Harvest sending the texts itself', /\bwe\s+send\s+(the\s+|your\s+)?(sms|texts?)/i],
    ['Harvest sending bulk email itself', /\bwe\s+send\s+(the\s+|your\s+)?(newsletters?|bulk email)/i],
  ];

  /* ⚠️ There is no import tooling. Every CSV path in the app is an export, and
     an FAQ that implied otherwise would be the seventh false capability claim
     Harvest has shipped — this time to somebody deciding to pay on the strength
     of it. The `contacts-in` answer says so in as many words; these patterns are
     what stops a later edit softening it into an implied tool. */
  const IMPORTER_PATTERNS: [string, RegExp][] = [
    ['a data importer', /\bimport(er|ers|ed|ing|s)?\b/i],
    ['a migration path', /\bmigrat(e|es|ed|ing|ion)\b/i],
    ['bulk-loading a contact list', /\bupload(s|ed|ing)?\b|\bbulk[- ]load/i],
    ['bringing an existing list across', /\bbring\s+(your|their|an)\s+(existing\s+)?(contacts?|members?|list)/i],
  ];

  /* Both surfaces are behind flags in lib/flags.ts for a reason: the affiliate
     programme's payout rail is unsettled, and additional campuses are an unbuilt
     add-on. Neither may be answered here. */
  const HIDDEN_SURFACE_PATTERNS: [string, RegExp][] = [
    ['the affiliate programme', /\baffiliate\b/i],
    ['multi-campus', /\bmulti[- ]campus\b/i],
  ];

  /* Capabilities Harvest does not have. "A website builder" reached the first
     draft of the Terms and had to be corrected; what exists is per-tenant
     branding and an editor for the blog, documents and sermon notes. */
  const ABSENT_CAPABILITY_PATTERNS: [string, RegExp][] = [
    ['a website builder', /website\s+builder/i],
    ['a site builder', /\bsite\s+builder\b/i],
    ['drag-and-drop page editing', /drag[- ]and[- ]drop/i],
    ['a landing page product', /landing\s+pages?\b/i],
    ['an uptime guarantee', /uptime\s+(guarantee|sla)|\b99\.\d+%/i],
  ];

  const scan = (label: string, patterns: [string, RegExp][]) =>
    it(label, () => {
      for (const [what, pattern] of patterns) {
        expect(pattern.test(body), `the FAQ mentions ${what} (${pattern})`).toBe(false);
      }
    });

  scan('mentions no unbuilt add-on', ADD_ON_PATTERNS);
  scan('quotes no trial but the one the product runs', TRIAL_PATTERNS);
  scan('promises no platform SMS or platform bulk email', PLATFORM_SENDING_PATTERNS);
  scan('implies no data importer', IMPORTER_PATTERNS);
  scan('answers nothing about a deliberately hidden surface', HIDDEN_SURFACE_PATTERNS);
  scan('claims no capability Harvest does not have', ABSENT_CAPABILITY_PATTERNS);
});

/* ---------------------------------------------------------------- *
 * Facts that must stay true of the product as it ships.
 * ---------------------------------------------------------------- */

describe('product facts stated in the FAQ', () => {
  it('quotes the trial the site actually advertises, from one constant', () => {
    expect(TRIAL_LENGTH_DAYS).toBe(14);
    expect(body).toContain(`${TRIAL_LENGTH_DAYS} days, on whichever plan you choose`);
  });

  it('carries the trial length into the SEO description too', () => {
    // The description is metadata, so faqPlainText() never sees it and the scan
    // above cannot reach it. It held the number as a literal and was the last
    // place on this page still saying 7 after the answer itself was fixed —
    // a search result advertising the wrong trial is read by more prospects
    // than the page it links to.
    expect(FAQ_SEO_DESCRIPTION).toContain(`a ${TRIAL_LENGTH_DAYS}-day trial`);
    expect(FAQ_SEO_DESCRIPTION).not.toMatch(/\b(7|30)-day/);
  });

  it('answers how contacts arrive without implying a tool that does not exist', () => {
    const text = answerText(FAQS.find((f) => f.id === 'contacts-in')!);
    expect(text).toMatch(/entered by hand/i);
    expect(text).toMatch(/no bulk tool/i);
  });

  it('puts a custom domain on the top tier only', () => {
    // Pricing.tsx's comparison rows read [false, false, true] for Custom Domain.
    // Naming the plan from `plans` rather than as a literal means renaming the
    // tier cannot leave the FAQ promising a domain to a plan without one.
    const topTier = plans[plans.length - 1].name;
    const text = answerText(FAQS.find((f) => f.id === 'custom-domain')!);
    expect(text).toContain(`On the ${topTier} plan, yes`);
    expect(text).toMatch(/no page builder/i);
  });

  it('describes SMS and bulk email as the customer’s own accounts', () => {
    const text = answerText(FAQS.find((f) => f.id === 'messaging')!);
    expect(text).toMatch(/bring-your-own twilio/i);
    expect(text).toMatch(/your own mailchimp account/i);
    expect(text).toMatch(/billed to you by twilio at their rates/i);
  });

  it('puts the church in control of member data and Harvest in the processor seat', () => {
    const text = answerText(FAQS.find((f) => f.id === 'data-owner')!);
    expect(text).toMatch(/your ministry is the data controller/i);
    expect(text).toMatch(/harvest is the data processor/i);
  });

  it('promises export on the same terms the policies do', () => {
    const text = answerText(FAQS.find((f) => f.id === 'export')!);
    expect(text).toMatch(/never gated behind a payment/i);
    expect(text).toMatch(/not after you cancel/i);
  });

  it('states the cancellation and retention terms the Refund Policy sets out', () => {
    // Cancel → downgrade, never lock out; 12 months, with notice at 11 and 11.5.
    // Answering these from the live policies rather than inventing terms is the
    // whole reason this question is on the page.
    const text = answerText(FAQS.find((f) => f.id === 'cancel')!);
    expect(text).toMatch(/does not lock you out/i);
    expect(text).toMatch(/downgraded rather than shut down/i);
    expect(text).toMatch(/12 months/);
    expect(text).toMatch(/11 months/);
    expect(text).toMatch(/11\.5 months/);
    expect(text).toMatch(/no cancellation fee, no notice period/i);
  });

  it('gives a way to reach a human', () => {
    expect(body).toMatch(/contact form on this site/i);
  });
});

/* ---------------------------------------------------------------- *
 * Structured data.
 * ---------------------------------------------------------------- */

describe('the FAQPage structured data', () => {
  const jsonLd = faqJsonLd() as {
    '@context': string;
    '@type': string;
    mainEntity: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[];
  };

  it('is a valid FAQPage document', () => {
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(Array.isArray(jsonLd.mainEntity)).toBe(true);
  });

  it('carries every visible question, and nothing else', () => {
    // The failure this catches: a Q&A is dropped from the markup while staying
    // on the page, or — worse for Google's policy on this — appears in the
    // markup without being visible. One array, two renderings; a filter or a
    // slice between them fails here.
    expect(jsonLd.mainEntity).toHaveLength(FAQS.length);
    expect(jsonLd.mainEntity.map((q) => q.name)).toEqual(FAQS.map((f) => f.question));
  });

  it.each(entries)('%s is marked up with the answer the page shows', (_id, faq) => {
    const question = jsonLd.mainEntity.find((q) => q.name === faq.question);
    expect(question, `"${faq.question}" is visible on the page but absent from the JSON-LD`).toBeDefined();
    expect(question!['@type']).toBe('Question');
    expect(question!.acceptedAnswer['@type']).toBe('Answer');
    // Not merely "an answer is present" — the marked-up text has to be the text
    // the visitor reads, paragraph for paragraph.
    expect(question!.acceptedAnswer.text).toBe(answerText(faq));
    for (const paragraph of faq.answer) {
      expect(question!.acceptedAnswer.text).toContain(paragraph);
    }
  });

  it('survives the round trip into the <script> tag', () => {
    // Seo.tsx emits it with JSON.stringify. An answer carrying something
    // unserialisable would silently ship an empty object.
    const round = JSON.parse(JSON.stringify(faqJsonLd()));
    expect(round).toEqual(faqJsonLd());
    expect(JSON.stringify(faqJsonLd())).not.toContain('</script');
  });
});
