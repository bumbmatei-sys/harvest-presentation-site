import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Replaces } from './Replaces';
import { formatMonthlyHeadline, plans } from './Pricing';
import { CATEGORIES, type Category } from '../content/features';
import { COMING_SOON_ITEMS } from '../content/coming-soon';
import {
  AFFILIATE_PROGRAM_ENABLED, MULTI_CAMPUS_ENABLED, SMS_MARKETING_ENABLED,
} from '../lib/flags';

/* THE-257 — the competitor table is retired, and what stands in its place.
 *
 * The `#replaces` section used to be a price comparison: nine rows of rival
 * products (Tithe.ly, Pushpay, Subsplash, HubSpot, Planning Center, Skool,
 * Teachable, Typeform, WordPress, Notion, The Church Co, Donorbox), a monthly
 * cost against each, a "$864–1,994/mo · 9 subscriptions to manage" total and a
 * Harvest row beneath it. Harvest is not making that argument — so the section
 * is now a plain list of what one plan contains, and the only price in it is
 * Harvest's own.
 *
 * ⚠️ EVERYTHING HERE READS RENDERED MARKUP, never the module's exports. The
 * claim being pinned is what a visitor sees in the section, and a test that
 * asserted on an exported array would keep passing if the component stopped
 * rendering it — which is exactly what happened to the assertion this suite
 * replaces (PricingComparison.test.ts asserted `toContain('Notes / Docs')`, a
 * label from the deleted `rows`).
 *
 * ⚠️ AND NOTHING HERE SHELLS OUT. `git show` at assertion time would make the
 * suite a statement about the repository's history rather than about the file
 * on disk, and it would pass or fail differently in a shallow CI checkout. */

const render = (el: React.ReactElement) => renderToStaticMarkup(el);
/** Markup with tags stripped and entities decoded — what a visitor reads. */
const words = (markup: string) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/')
  .replace(/\s+/g, ' ')
  .trim();

const SECTION = words(render(React.createElement(Replaces)));

/** The one caption that deviates from a verbatim features.ts name — mirrored
 *  from the component, because the deviation is the thing under test. */
const CAPTIONS: Readonly<Record<string, string>> = { docs: 'Docs' };
const captionOf = (id: string, name: string) => CAPTIONS[id] ?? name;

/* The section's contents, as IDS. Names are never typed in this file either:
   they are read out of content/features.ts, so a rename there moves the
   expectation and the component together and this suite cannot certify a name
   the catalogue does not carry. */
const EXPECTED: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Community & Engagement', ['feed', 'groups', 'prayer', 'map']],
  ['Events & Livestream', ['events', 'checkin', 'livestream']],
  ['Discipleship & Content', ['bible', 'courses', 'blog', 'aiblog', 'docs']],
  // 🔵 `sms` ADDED AT THE-314 — see the note on the row in Replaces.tsx.
  ['Automation', ['knowledge', 'newsletter', 'autonewsletter', 'sms', 'forms']],
  ['Giving & Finance', ['donation', 'fundraising', 'crm', 'accounting']],
  ['Platform & Brand', ['webapp', 'pwa', 'dashboard', 'branding', 'analytics']],
];

const featureById = (categories: readonly Category[]) =>
  new Map(categories.flatMap((c) => c.features.map((f) => [f.id, f] as const)));

/**
 * 🔴 THE EXCLUSIONS THAT ARE *NOT* A FLAG, named one by one.
 *
 * Everything else the catalogue shows has to appear in the section — that is
 * `coverageGuard` below, and it is what makes the flag-driven exclusions real
 * rather than merely absent from a typed list.
 *
 *   aichat · founder direction: AI Chat is an ADD-ON, not an included plan
 *            feature, so it does not belong in a list of what one plan contains.
 *            Deliberately NOT keyed off the app's `aiChat` plan cells, which
 *            still say otherwise while THE-253 is in flight.
 *
 *   sharegiving · THE-281. It is live, unflagged and on all three plans, so it
 *            is NOT excluded for any of the reasons a flag would give. It is
 *            excluded editorially: every other item in this section is a
 *            product a church would otherwise buy a subscription for, and this
 *            is a share button and a QR code ON the Donation Page, which is
 *            already the first item in the very same row. Listing it beside
 *            "CRM" and "Accounting + QuickBooks" would size it as a peer of
 *            those, which overstates it — and this section's whole remaining
 *            job, after THE-257 took the competitor table out, is to be a claim
 *            the company will defend. It has its own section on the Giving &
 *            Finance page, which is where a capability of this size belongs.
 *
 * ⚠️ SMS AND AFFILIATE ARE NOT IN HERE AND NEVER WERE. They were excluded by
 * FLAG — SMS_MARKETING_ENABLED and AFFILIATE_PROGRAM_ENABLED kept them out of
 * `CATEGORIES` entirely, so they never reached this guard at all. That is the
 * stronger mechanism of the two, and `a flag flip trips the coverage guard`
 * below is what proves it: put one in here and the flip would stop failing.
 *
 * 🔴 AND THE-314 IS THAT MECHANISM PAYING OFF. Turning SMS_MARKETING_ENABLED on
 * made SMS a visible feature, this guard immediately demanded it appear in the
 * section, and it was added to the Automation row rather than quietly excluded
 * here. Affiliate is still flag-hidden and still absent.
 *
 * 🔴 branding AND analytics WERE HERE AND ARE NOT ANY MORE — THE-258. THE-257's
 * table omitted Branding & Domain and Evangelism Analytics while its own §4 gave
 * no reason for either; both are live and on no flag, so THE-257 named them here
 * rather than letting them go silently missing, and said adding them back was
 * one line each. THE-258 took that decision: their ids are now in the component's
 * Platform & Brand row, so `coverageGuard` REQUIRES them to render and this set
 * must not name them again. The constant stays because `aichat` still belongs in
 * it — and because this mechanism is the reason the omission was catchable.
 */
const EDITORIAL_EXCLUSIONS: ReadonlySet<string> = new Set(['aichat', 'sharegiving']);

/**
 * Every feature the catalogue currently SHOWS is either rendered in the section
 * or named above. Throws rather than expects, so the flag-flip mutation below
 * can run the very same rule and assert that it trips.
 */
const coverageGuard = (categories: readonly Category[], rendered: string) => {
  for (const c of categories) {
    for (const f of c.features) {
      if (EDITORIAL_EXCLUSIONS.has(f.id)) continue;
      const caption = captionOf(f.id, f.name);
      if (!rendered.includes(caption)) {
        throw new Error(`"${f.name}" (#${f.id}) is visible in features.ts but absent from #replaces.`);
      }
    }
  }
};

describe('the section lists what is in one plan', () => {
  it('every category and item renders, sourced from features.ts', () => {
    const byId = featureById(CATEGORIES);

    for (const [label, ids] of EXPECTED) {
      expect(SECTION, `the "${label}" row is missing`).toContain(label);

      for (const id of ids) {
        const feature = byId.get(id);
        // A missing id means the catalogue renamed or hid something this table
        // lists — the component throws on it at module scope; this says so by
        // name rather than failing on an inscrutable `undefined`.
        expect(feature, `content/features.ts has no visible feature #${id}`).toBeDefined();
        expect(SECTION, `#${id} is missing from the "${label}" row`)
          .toContain(captionOf(id, feature!.name));
      }
    }

    // The row count is pinned too: a seventh row, or a lost one, is a change to
    // what the section claims and should not pass silently.
    expect(EXPECTED).toHaveLength(6);
  });

  it('Docs renders once, and "Notes" appears nowhere in the section', () => {
    // 🔴 THE ONE PERMITTED DEVIATION FROM A VERBATIM NAME. features.ts calls it
    // "Docs & Notes"; docs and notes are the same thing, and listing both reads
    // as two features where there is one.
    expect(SECTION).toContain('Docs');
    expect(SECTION).not.toMatch(/notes?/i);
    expect(SECTION.match(/Docs/g)).toHaveLength(1);

    // ⚠️ And the catalogue still calls it what it calls it. The deviation is a
    // caption in one section, not a rename — if `docs` ever splits into two
    // genuinely separate features, merging them here becomes a false claim.
    const docs = featureById(CATEGORIES).get('docs');
    expect(docs, 'content/features.ts has no #docs feature').toBeDefined();
    expect(docs!.name).toBe('Docs & Notes');
  });

  it('AI Chat and Affiliate appear nowhere in the section — and SMS now does', () => {
    // ⚠️ SMS LEFT THIS LIST AT THE-314, and it left it for the reason the list
    // exists: these are things the section must not claim BECAUSE THEY ARE NOT
    // LIVE. SMS is live now — a Ministry church buys a number inside Harvest and
    // texts its congregation — so continuing to assert its absence would have
    // been asserting that the section understates the product.
    for (const absent of ['AI Chat', 'Affiliate', 'Multi-Campus']) {
      expect(SECTION, `"${absent}" is in the section`).not.toContain(absent);
    }
    expect(SECTION, 'the section understates the plan by omitting SMS')
      .toContain('SMS & Text-to-Give');
  });

  it('no competitor name appears anywhere in the section', () => {
    // 🔴 THE RETIRED CLAIM, named in full. Every one of these was printed in
    // the section before THE-257, most of them beside a monthly price.
    const COMPETITORS = [
      'Tithe.ly', 'Pushpay', 'Subsplash', 'HubSpot', 'Planning Center', 'Skool',
      'Teachable', 'Typeform', 'WordPress', 'Donorbox', 'Notion', 'The Church Co',
    ];
    for (const name of COMPETITORS) {
      expect(SECTION, `"${name}" is still named in the section`).not.toContain(name);
    }

    // Nor the shape of the argument that carried them: no per-row cost, no
    // total, and no count of subscriptions to manage.
    expect(SECTION).not.toMatch(/subscriptions to manage/i);
    expect(SECTION).not.toMatch(/billed separately/i);
    expect(SECTION).not.toMatch(/\d,\d{3}\/mo/);

    // And no competitor logo survives the table it belonged to. The
    // integrations row below is the only image left in the section.
    // 🔵 TWO SINCE THE-314, not three: Twilio's favicon left the row with its
    // name, because a church no longer connects a carrier account of its own.
    const markup = render(React.createElement(Replaces));
    expect([...markup.matchAll(/<img/g)]).toHaveLength(2);
  });
});

describe('the one price in the section', () => {
  const topPlan = plans.find((p) => p.planId === 'max')!;

  it('the bottom line reads $63.34/mo billed annually, and no /yr figure appears', () => {
    const monthly = formatMonthlyHeadline(topPlan.price.yearly, 'yearly');

    // Pinned against the computation, and against the figure it produces today.
    // A repricing must move both deliberately — this line is read aloud to 8,000
    // people, so it is not a number that should change without anyone noticing.
    expect(monthly).toBe('$63.34');
    expect(SECTION).toContain(`Everything above, on the ${topPlan.name} plan — ${monthly}/mo, billed annually.`);

    // 🔴 NO ANNUAL TOTAL, ANYWHERE. The retired Harvest row carried
    // "billed annually (<yearly>/yr)" under the figure; the founder asked for
    // the monthly figure alone. The yearly total is written here as an
    // expression rather than a literal so this file does not restate a price
    // that lives in `plans` — see price-sources.test.ts.
    expect(SECTION).not.toContain(`$${topPlan.price.yearly}`);
    expect(SECTION).not.toContain(`$${topPlan.price.yearly.toLocaleString()}`);
    expect(SECTION).not.toMatch(/\/yr\b/);
    expect(SECTION).not.toMatch(/per year|a year|annually \(/i);

    // Exactly one figure in the whole section, and it is that one.
    expect([...SECTION.matchAll(/\$[0-9][0-9,]*(?:\.[0-9]{2})?/g)].map((m) => m[0])).toEqual([monthly]);
  });

  it('the monthly figure is computed', async () => {
    /* 🔴 THE MUTATION, RUN IN-SUITE. Asserting that the rendered figure equals
       `formatMonthlyHeadline(<the live price>)` cannot fail on a typed literal
       while the literal happens to be right — the two agree today either way.
       So the fixture MOVES the Ministry yearly price and re-imports the
       component: a hardcoded "$63.34" keeps printing $63.34 and fails here.

       The mock spreads the real module and replaces only `plans`, so
       Pricing.tsx's own module-scope contracts are untouched and content/
       features.ts still sees three plans for its tiers-length check. */
    const MOVED_YEARLY = 1000;

    vi.resetModules();
    const actual = await vi.importActual<typeof import('./Pricing')>('./Pricing');
    vi.doMock('./Pricing', () => ({
      ...actual,
      plans: actual.plans.map((p) => (
        p.planId === 'max' ? { ...p, price: { ...p.price, yearly: MOVED_YEARLY } } : p
      )),
    }));

    try {
      const moved = await import('./Replaces');
      const movedText = words(render(React.createElement(moved.Replaces)));
      const expected = actual.formatMonthlyHeadline(MOVED_YEARLY, 'yearly');

      expect(expected).toBe('$83.34');           // $1,000 / 12, ceiled at the cent
      expect(movedText).toContain(`${expected}/mo, billed annually.`);
      expect(movedText).not.toContain('$63.34'); // the live figure did not survive the move
    } finally {
      vi.doUnmock('./Pricing');
      vi.resetModules();
    }
  });
});

describe('what the change did not touch', () => {
  it('the exclusions are flag-driven', () => {
    /* The section covers everything the catalogue currently SHOWS, bar the three
       editorial exclusions named at the top of this file — so an item leaves
       this table only because a flag hides it.

       ⚠️ THE FLAG VALUES ARE PINNED IN THEIR OWN TEST BELOW, deliberately not
       here. Asserting them first would short-circuit this one: flipping a flag
       for real would fail on `toBe(false)` before the guard ever ran, and the
       failure would say a flag moved rather than that the section had gone
       silent about a live feature — which is the thing worth being told. */
    expect(() => coverageGuard(CATEGORIES, SECTION)).not.toThrow();
  });

  it('a flag flip trips the coverage guard, so the exclusions are not merely typed out of a list', async () => {
    /* 🔴 THE SECOND MUTATION. `Affiliate Program` is absent from the section
       today — but so is anything simply left out of the component's ROWS, and
       the two are indistinguishable from the rendered markup alone. Flipping
       AFFILIATE_PROGRAM_ENABLED to true makes the catalogue show the feature
       again; the guard above must then FAIL, which is what proves the item
       leaves this section because the flag hides it rather than because nobody
       typed it.

       ⚠️ THE FLAG IS MOCKED, NEVER SET. THE-257 reads flags and writes none —
       the affiliate programme's real state belongs to THE-252 and to the
       rebuild that follows it. `vi.doUnmock` in the finally block is what keeps
       that true for every suite that runs after this one. */
    vi.resetModules();
    const actualFlags = await vi.importActual<typeof import('../lib/flags')>('../lib/flags');
    vi.doMock('../lib/flags', () => ({ ...actualFlags, AFFILIATE_PROGRAM_ENABLED: true }));

    try {
      const { CATEGORIES: flipped } = await import('../content/features');
      const { Replaces: FlippedReplaces } = await import('./Replaces');
      const flippedText = words(render(React.createElement(FlippedReplaces)));

      // The flip really did un-hide the feature...
      const affiliate = featureById(flipped).get('affiliate');
      expect(affiliate, 'the mocked flag did not un-hide #affiliate').toBeDefined();
      expect(affiliate!.name).toBe('Affiliate Program');

      // ...the section still does not render it...
      expect(flippedText).not.toContain('Affiliate');

      // ...and that combination is exactly what the guard is there to catch.
      expect(() => coverageGuard(flipped, flippedText))
        .toThrow(/Affiliate Program.*absent from #replaces/);
    } finally {
      vi.doUnmock('../lib/flags');
      vi.resetModules();
    }
  });

  it('the integrations row is unchanged', () => {
    // 🔴 NEVER A COMPETITOR CLAIM. These are the services Harvest CONNECTS TO,
    // which is why they survived a change that deleted every other logo in the
    // section — and why the sentence introducing them still reads the same.
    expect(SECTION).toContain('Plus integrates with your newsletter & tools —');
    for (const name of ['QuickBooks', 'Mailchimp']) {
      expect(SECTION, `the integrations row lost ${name}`).toContain(name);
    }

    // 🔴 TWILIO LEFT THE ROW AT THE-314, AND ITS ABSENCE IS ASSERTED RATHER THAN
    // MERELY ALLOWED. This row lists third-party services a church CONNECTS
    // ITSELF — that is the whole reason these three survived a change that
    // deleted every other logo in the section. Harvest RESELLS messaging now, on
    // one account of its own, so a church connects no carrier and holds no
    // account with one. Leaving the name and the favicon would have told a
    // visitor to go and open something that is not part of the product.
    expect(SECTION, 'the integrations row still names a carrier a church never touches')
      .not.toMatch(/twilio/i);

    const markup = render(React.createElement(Replaces));
    expect(markup).toContain('https://cdn.simpleicons.org/quickbooks');
    expect(markup).toContain('https://cdn.simpleicons.org/mailchimp');
    // 🔴 The LOGO goes with the name. It was a favicon fallback rather than a
    // Simple Icons mark, so it would have survived a name-only sweep.
    expect(markup, 'the integrations row still hotlinks a carrier mark')
      .not.toContain('favicons?domain=twilio.com');
  });

  it('no flag value changed, and coming-soon.ts is untouched', () => {
    // The flag values, pinned again from the other direction: this ticket reads
    // them and sets none.
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    // 🔵 TRUE since THE-314 — the SMS flip. THE-257 set no flag and still sets
    // none; this pin moved with the product, not with this ticket.
    expect(SMS_MARKETING_ENABLED).toBe(true);
    expect(MULTI_CAMPUS_ENABLED).toBe(false);

    /* 🔴 THE AFFILIATE PROGRAMME'S STATE IS NOT THIS TICKET'S. THE-252 put it
       on Coming Soon, and it is to be rebuilt on a third-party platform later —
       the supplier is a board decision (THE-97) that this repo deliberately
       does not name anywhere, see the-252-affiliate-coming-soon.test.ts §6.
       Removing the programme from one table must not have moved it anywhere
       else, so both relocated entries are still exactly where their own tickets
       put them. */
    const soon = COMING_SOON_ITEMS.map((i) => i.id);
    expect(soon).toContain('affiliate');
    expect(COMING_SOON_ITEMS.find((i) => i.id === 'affiliate')!.name).toBe('Affiliate referrals');
    // 🔴 SMS LEFT COMING SOON AT THE-314, in the same motion that put it on the
    // pricing page — `COMING_SOON_ITEMS` filters on SMS_MARKETING_ENABLED so the
    // two can never both be true. A capability sold on one page while another
    // calls it unbuilt is the same claim made twice, in two tenses.
    expect(soon, 'SMS is sold on the pricing page AND promised as coming soon')
      .not.toContain('sms');
  });
});
