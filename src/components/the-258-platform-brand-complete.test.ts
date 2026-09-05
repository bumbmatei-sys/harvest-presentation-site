import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { Replaces } from './Replaces';
import { formatMonthlyHeadline, plans } from './Pricing';
import { CATEGORIES, type Category } from '../content/features';
import { COMING_SOON_ITEMS } from '../content/coming-soon';
import {
  AFFILIATE_PROGRAM_ENABLED, CUSTOM_DOMAIN_MARKETING_ENABLED, MULTI_CAMPUS_ENABLED,
  SMS_MARKETING_ENABLED,
} from '../lib/flags';

/* 🔴 THE-280 — the branding feature's CAPTION is now flag-dependent, so this
   suite reads it from the flag rather than from a literal.

   THE-280 hid custom domains: the app's provisioning route refuses and the
   feature was never activated, so `features.ts` drops the domain half of this
   entry's name — "Branding & Domain" while `CUSTOM_DOMAIN_MARKETING_ENABLED`,
   "Branding" while it is off. The entry itself is NOT hidden and its `tiers` are
   untouched: custom BRANDING ships, and withdrawing it to hide a dead capability
   is exactly what THE-280 refused to do.

   ⚠️ Derived rather than re-pinned, so this passes in EITHER flag state — the
   shape `the-250-sms-pricing-removed.test.ts` already uses. What THE-258 exists
   to hold is that the row reads FIVE items and that its captions match the
   catalogue verbatim; both still hold, under whichever caption the flag selects. */
const BRANDING_CAPTION = CUSTOM_DOMAIN_MARKETING_ENABLED ? 'Branding & Domain' : 'Branding';

/* THE-258 — the two Platform & Brand features THE-257 left out.
 *
 * THE-257 built the `#replaces` section with a three-item Platform & Brand row —
 * Web App, Mobile App, Admin Dashboard — while `content/features.ts` shows five
 * unflagged features there. `Branding & Domain` and `Evangelism Analytics` were
 * omitted with no stated reason, so THE-257 named them in its own
 * EDITORIAL_EXCLUSIONS rather than letting them go silently missing. This ticket
 * adds them: the row now reads all five, and that set drops back to `aichat`.
 *
 * 🔴 WHITE-LABEL BRANDING IS THE STRONGEST DIFFERENTIATOR THE PRODUCT HAS, and
 * this section is the one place on the landing page that enumerates the plan.
 * Leaving it off understated the plan exactly where it is read most literally.
 *
 * ⚠️ EVERYTHING HERE READS RENDERED MARKUP, never the component's ROWS array —
 * same rule as THE-257. A test that asserted on the exported list would keep
 * passing if the component stopped rendering it.
 *
 * ⚠️ AND NOTHING HERE SHELLS OUT. `git show` at assertion time would make this a
 * statement about the repository's history rather than about the files on disk,
 * and it would behave differently in a shallow CI checkout. The one test that
 * needs to see another file's source reads that FILE, with `readFileSync`. */

const MARKUP = renderToStaticMarkup(React.createElement(Replaces));

const decode = (s: string) => s
  .replace(/&amp;/g, '&')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/');
const text = (s: string) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const SECTION = text(MARKUP);

/* The table parsed back out of the markup as rows, so the assertions below can
   say "this row holds exactly these items, in this order" rather than merely
   that a name appears somewhere in the section. The summary row carries no
   `.replaces-cat` and so is not one of these. */
type Row = { label: string; items: string[] };
const RENDERED_ROWS: Row[] = [
  ...MARKUP.matchAll(/<div class="replaces-cat"[^>]*>(.*?)<\/div><div class="replaces-tools"[^>]*>(.*?)<\/div>/g),
].map((m) => ({
  label: text(m[1]),
  items: text(m[2]).split('·').map((t) => t.trim()).filter(Boolean),
}));
const rowNamed = (label: string) => RENDERED_ROWS.find((r) => r.label === label);

/** Mirrored from the component — the one caption that deviates from a verbatim
 *  catalogue name ("Docs & Notes"). THE-258 adds no second deviation. */
const CAPTIONS: Readonly<Record<string, string>> = { docs: 'Docs' };
const captionOf = (id: string, name: string) => CAPTIONS[id] ?? name;

const featureById = (categories: readonly Category[]) =>
  new Map(categories.flatMap((c) => c.features.map((f) => [f.id, f] as const)));

/** Captions for a list of ids, read out of the FILTERED catalogue. Ids are
 *  typed here; names never are, so a rename in features.ts moves the component
 *  and this expectation together. */
const captionsFor = (ids: readonly string[]) => {
  const byId = featureById(CATEGORIES);
  return ids.map((id) => {
    const f = byId.get(id);
    if (!f) throw new Error(`content/features.ts has no visible feature #${id}`);
    return captionOf(id, f.name);
  });
};

/* THE-257's table exactly as it shipped, ids only. THE-258 changes ONE entry of
   this — the last row gains two ids — and the tests below pin both halves of
   that claim: the five items that are now there, and the five rows that are
   not allowed to have moved. */
const AS_SHIPPED_257: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Community & Engagement', ['feed', 'groups', 'prayer', 'map']],
  ['Events & Livestream', ['events', 'checkin', 'livestream']],
  ['Discipleship & Content', ['bible', 'courses', 'blog', 'aiblog', 'docs']],
  ['Automation', ['knowledge', 'newsletter', 'autonewsletter', 'forms']],
  ['Giving & Finance', ['donation', 'fundraising', 'crm', 'accounting']],
  ['Platform & Brand', ['webapp', 'pwa', 'dashboard']],
];
/** The whole of this ticket, as data. */
const ADDED = ['branding', 'analytics'] as const;

describe('Platform & Brand is complete', () => {
  it('Platform & Brand renders all five items', () => {
    const row = rowNamed('Platform & Brand');
    expect(row, 'the "Platform & Brand" row is missing from the section').toBeDefined();

    // Exact list, exact order — not `toContain`, which would pass on a row that
    // had quietly gained a sixth item or lost one of the original three.
    expect(row!.items).toEqual(captionsFor(['webapp', 'pwa', 'dashboard', ...ADDED]));
    expect(row!.items).toHaveLength(5);

    /* 🔴 THE TWO NAMES, PINNED VERBATIM AGAINST features.ts. The ticket's rule is
       that both are quoted exactly as the catalogue spells them — so if either
       is ever renamed there, this fails by name instead of the section quietly
       advertising a feature under a caption the product does not use. */
    const byId = featureById(CATEGORIES);
    expect(byId.get('branding')?.name).toBe(BRANDING_CAPTION);
    expect(byId.get('analytics')?.name).toBe('Evangelism Analytics');
    expect(row!.items).toContain(BRANDING_CAPTION);
    expect(row!.items).toContain('Evangelism Analytics');

    // And they are genuinely unflagged: present in the flag-FILTERED export,
    // which is the whole reason adding them was correct.
    for (const id of ADDED) {
      expect(byId.has(id), `#${id} is not visible in the filtered CATEGORIES`).toBe(true);
    }
  });

  it('Branding & Domain and Evangelism Analytics are no longer in EDITORIAL_EXCLUSIONS', () => {
    /* The constant lives in THE-257's suite and is module-local there, so this
       reads that FILE — on disk, never `git show`. The textual half matters
       because the set is documentation as much as code: leaving the two ids in
       it would keep asserting an omission that no longer exists. */
    const suite257 = readFileSync(
      new URL('./the-257-competitor-table-retired.test.ts', import.meta.url), 'utf8',
    );
    const literal = suite257.match(
      /const EDITORIAL_EXCLUSIONS: ReadonlySet<string> = new Set\(\[([^\]]*)\]\)/,
    );
    expect(literal, 'EDITORIAL_EXCLUSIONS is gone from the THE-257 suite').not.toBeNull();

    const excluded = [...literal![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
    for (const id of ADDED) {
      expect(excluded, `#${id} is still named in EDITORIAL_EXCLUSIONS`).not.toContain(id);
    }

    /* 🔴 THE CONSTANT ITSELF STAYS. AI Chat still belongs in it, and the
       mechanism is the reason this omission was catchable rather than silent.

       ⚠️ THE-281 added `sharegiving` beside it, for a reason of the same KIND —
       editorial, not flag-driven — and the assertion is still an exact equality
       rather than a `toContain`, so a third id cannot be added silently. What
       this test defends is that `branding` and `analytics` are NOT in here; it
       has never been a claim that `aichat` is the only entry that may be. */
    expect(excluded).toEqual(['aichat', 'sharegiving']);

    /* And the behavioural half: with the two out of that set, the coverage rule
       now REQUIRES them to render. Run here against the same exclusions, so this
       is the live rule and not a paraphrase of it. */
    const guard = (rendered: string) => {
      for (const c of CATEGORIES) {
        for (const f of c.features) {
          if (excluded.includes(f.id)) continue;
          if (!rendered.includes(captionOf(f.id, f.name))) {
            throw new Error(`"${f.name}" (#${f.id}) is visible in features.ts but absent from #replaces.`);
          }
        }
      }
    };
    expect(() => guard(SECTION)).not.toThrow();
    // ...and it really would have caught them: drop either name and it trips.
    for (const id of ADDED) {
      const withoutIt = SECTION.split(captionsFor([id])[0]).join('');
      expect(() => guard(withoutIt), `the guard does not require #${id}`)
        .toThrow(/absent from #replaces/);
    }
  });

  it('AI Chat and Affiliate are still excluded — SMS is not, since THE-314', () => {
    /* 🔴 NO-REGRESSION. Adding two names to this row must not have loosened the
       exclusions that stand — one flag-driven, one editorial.

       ⚠️ SMS LEFT THIS LIST AT THE-314, and it left it because the mechanism
       worked rather than because the mechanism was loosened. It was never
       excluded here by name: SMS_MARKETING_ENABLED kept it out of the filtered
       catalogue entirely, and turning that flag on put it back in — at which
       point THE-257's coverage guard demanded the section list it, and it was
       added to the Automation row. Affiliate and Multi-Campus are still hidden
       by their own flags, and the assertion below still proves it. */
    for (const absent of ['AI Chat', 'Affiliate', 'Multi-Campus']) {
      expect(SECTION, `"${absent}" is in the section`).not.toContain(absent);
    }
    expect(SECTION, 'SMS is live but the section does not list it')
      .toContain('SMS & Text-to-Give');

    const byId = featureById(CATEGORIES);
    // Affiliate and Multi-Campus are excluded by FLAG: they are not in the
    // filtered catalogue at all, so the section cannot name them even by mistake.
    for (const id of ['affiliate', 'churches']) {
      expect(byId.has(id), `#${id} is visible in CATEGORIES — a flag moved`).toBe(false);
    }
    expect(byId.has('sms'), '#sms is hidden again — SMS_MARKETING_ENABLED moved').toBe(true);
    // AI Chat is the editorial one: visible in the catalogue, deliberately not
    // in this section, because it is an add-on rather than part of the plan.
    expect(byId.get('aichat')?.name).toBe('AI Chat');
    expect(SECTION).not.toContain('AI Chat');
  });
});

describe('what THE-258 did not touch', () => {
  it('the bottom line is unchanged and still computed', async () => {
    const topPlan = plans.find((p) => p.planId === 'max')!;
    const monthly = formatMonthlyHeadline(topPlan.price.yearly, 'yearly');

    // 🔴 ADDING FEATURES DOES NOT TOUCH PRICE. The figure, the wording and the
    // absence of any yearly total are all exactly as THE-257 left them.
    expect(monthly).toBe('$63.34');
    expect(SECTION).toContain(`Everything above, on the ${topPlan.name} plan — ${monthly}/mo, billed annually.`);
    expect(SECTION).not.toMatch(/\/yr\b/);
    expect(SECTION).not.toContain(`$${topPlan.price.yearly}`);
    expect(SECTION).not.toContain(`$${topPlan.price.yearly.toLocaleString()}`);
    // Still exactly one figure in the section, and still that one.
    expect([...SECTION.matchAll(/\$[0-9][0-9,]*(?:\.[0-9]{2})?/g)].map((m) => m[0])).toEqual([monthly]);

    /* 🔴 THE MUTATION. `$63.34` being present proves nothing on its own — a
       hardcoded literal prints it too. So move the Ministry yearly price and
       re-import: the rendered figure has to move with it. The mock spreads the
       real module and replaces only `plans`, leaving Pricing.tsx's own
       module-scope contracts and features.ts's tiers-length check intact. */
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
      const movedText = text(renderToStaticMarkup(React.createElement(moved.Replaces)));
      const expected = actual.formatMonthlyHeadline(MOVED_YEARLY, 'yearly');

      expect(expected).toBe('$83.34');            // $1,000 / 12, ceiled at the cent
      expect(movedText).toContain(`${expected}/mo, billed annually.`);
      expect(movedText).not.toContain('$63.34');  // the live figure did not survive the move
      // The five-item row is still five items under the moved price — the two
      // changes are independent, which is the point of doing both here.
      expect(movedText).toContain(BRANDING_CAPTION);
      expect(movedText).toContain('Evangelism Analytics');
    } finally {
      vi.doUnmock('./Pricing');
      vi.resetModules();
    }
  });

  it('the other five categories are unchanged', () => {
    // Six rows plus the summary line, as before — no row added, none lost.
    expect(RENDERED_ROWS.map((r) => r.label)).toEqual(AS_SHIPPED_257.map(([label]) => label));

    /* Every row THE-257 shipped, item for item, in order — except the last,
       which is this ticket. If a future change reaches past Platform & Brand,
       it fails here by row name. */
    // ⚠️ AUTOMATION IS NOW THE SECOND ROW THIS FILE CANNOT PIN AS SHIPPED-257.
    // THE-314 added `sms` to it when the flag turned on, so the assertion below
    // skips it by name rather than by index — an index would silently start
    // pinning a different row if the order ever changed.
    for (const [label, ids] of AS_SHIPPED_257.slice(0, 5)) {
      if (label === 'Automation') continue;
      const row = rowNamed(label);
      expect(row, `the "${label}" row is missing`).toBeDefined();
      expect(row!.items, `the "${label}" row changed`).toEqual(captionsFor(ids));
    }
    // Automation, pinned with the one addition named.
    expect(rowNamed('Automation')!.items, 'the "Automation" row changed by more than SMS')
      .toEqual(captionsFor(['knowledge', 'newsletter', 'autonewsletter', 'sms', 'forms']));

    // The section's own copy is untouched too: the kicker and the H2 THE-257
    // wrote, and no reintroduced competitor claim.
    expect(SECTION).toContain('All-in-one');
    expect(MARKUP).toContain('aria-label="Everything your ministry runs on, in one plan"');
    for (const name of ['Tithe.ly', 'Pushpay', 'Subsplash', 'HubSpot', 'Planning Center',
      'Skool', 'Teachable', 'Typeform', 'WordPress', 'Donorbox', 'Notion', 'The Church Co']) {
      expect(SECTION, `"${name}" is named in the section`).not.toContain(name);
    }
    expect(SECTION).not.toMatch(/subscriptions to manage/i);
  });

  it('the integrations row is unchanged', () => {
    // These are the services Harvest CONNECTS TO, never a competitor claim.
    expect(SECTION).toContain('Plus integrates with your newsletter & tools —');
    for (const name of ['QuickBooks', 'Mailchimp']) {
      expect(SECTION, `the integrations row lost ${name}`).toContain(name);
    }
    expect(MARKUP).toContain('https://cdn.simpleicons.org/quickbooks');
    expect(MARKUP).toContain('https://cdn.simpleicons.org/mailchimp');
    // 🔴 TWILIO LEFT THE ROW AT THE-314 — name AND favicon. This row lists
    // services a church connects ITSELF, and Harvest resells messaging on its
    // own account now, so there is no such connection to advertise.
    expect(SECTION, 'the integrations row still names a carrier').not.toMatch(/twilio/i);
    expect(MARKUP, 'the integrations row still hotlinks a carrier mark')
      .not.toContain('favicons?domain=twilio.com');
    // Two images in the whole section — no logo came back with the two features
    // that did, and one left with the connection that ended.
    expect([...MARKUP.matchAll(/<img/g)]).toHaveLength(2);
  });

  it('no flag value changed, and coming-soon.ts is untouched', () => {
    /* 🔴 THIS TICKET READS FLAGS AND SETS NONE. Both features it adds are
       unflagged — that is what made adding them correct — and the three flags
       that do gate this section are exactly where THE-245, THE-252 and THE-223
       left them. */
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    // 🔵 TRUE since THE-314. THE-258 still sets no flag; this pin followed the
    // product rather than this ticket.
    expect(SMS_MARKETING_ENABLED).toBe(true);
    expect(MULTI_CAMPUS_ENABLED).toBe(false);
    // THE-280's flag joined them, also off. It is not THE-258's, and THE-258
    // still sets none — the claim this test makes is unchanged.
    expect(CUSTOM_DOMAIN_MARKETING_ENABLED).toBe(false);

    // Neither added feature is gated by anything: no flag names them, and both
    // survive into the filtered catalogue.
    const flagsSrc = readFileSync(new URL('../lib/flags.ts', import.meta.url), 'utf8');
    const declared = [...flagsSrc.matchAll(/export const (\w+) = (true|false);/g)]
      .map((m) => [m[1], m[2]] as const);
    expect(declared).toEqual([
      ['AFFILIATE_PROGRAM_ENABLED', 'false'],
      ['MULTI_CAMPUS_ENABLED', 'false'],
      ['SMS_MARKETING_ENABLED', 'true'],
      // 🔴 THE-280 added the fourth, at false. Listed rather than loosened to a
      // subset check: the point of this assertion is that a flag cannot appear
      // or flip unnoticed, and naming the new one keeps that exact.
      ['CUSTOM_DOMAIN_MARKETING_ENABLED', 'false'],
    ]);

    /* Coming Soon is not this ticket's either — THE-252 put the affiliate
       programme there and THE-245 put SMS there, and adding two unrelated
       features to a pricing-page row must not have disturbed either. Nor may
       anything THE-258 added appear there: a feature cannot be both in the plan
       and coming soon. */
    const soon = COMING_SOON_ITEMS.map((i) => i.id);
    expect(soon).toContain('affiliate');
    // 🔴 SMS LEFT COMING SOON AT THE-314, in the same motion that put it on the
    // pricing page and in the Automation row above. `COMING_SOON_ITEMS` filters
    // on SMS_MARKETING_ENABLED precisely so the two can never both be true.
    expect(soon, 'SMS is in the plan AND promised as coming soon').not.toContain('sms');
    expect(COMING_SOON_ITEMS.find((i) => i.id === 'affiliate')!.name).toBe('Affiliate referrals');
    for (const id of ADDED) {
      expect(soon, `#${id} is in COMING_SOON_ITEMS and in the plan table`).not.toContain(id);
    }
  });
});
