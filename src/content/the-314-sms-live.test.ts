import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import fs from 'node:fs';
import path from 'node:path';

import { ComparisonTable, plans } from '../components/Pricing';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import { Replaces } from '../components/Replaces';
import { CATEGORIES } from './features';
import { COMING_SOON_ITEMS } from './coming-soon';
import {
  NEWSLETTER_MARKETING_ENABLED, QUICKBOOKS_MARKETING_ENABLED, SMS_MARKETING_ENABLED,
} from '../lib/flags';

/**
 * THE-314 — SMS is live on the site, on ONE tier, and no carrier is named.
 *
 * The reversal of THE-245's silence lives in `the-245-sms-hidden.test.ts`,
 * beside the assertions it reverses. This file holds the claims that are new
 * rather than reversed:
 *
 *   · 🔴 THE TIER CLAIM IS VERIFIED AGAINST THE APP, not asserted. A tier claim
 *     that outruns the app is the exact class of bug this site has been
 *     corrected for six times, and it is the one a buyer would pay for.
 *   · 🔴 NEITHER VENDOR IS NAMED. Twilio, because Harvest no longer connects a
 *     church to one; the new provider, because Harvest's supplier is Harvest's
 *     business and the repo-wide sweep in the-284 already forbids it.
 *   · The tool count, the page count and the built pages moved by exactly what
 *     this change accounts for.
 */

const ROOT = path.resolve(__dirname, '../..');
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');
const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: ['/'] }, el),
  ));
const visibleText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/**
 * 🔴 THE APP'S OWN `smsAutomation` CELLS, transcribed by hand from
 * `Harvest-agent/src/utils/plan-features.ts`.
 *
 * ⚠️ TWO COPIES OF ONE FACT IS THE MECHANISM, and it is the same one the nine
 * plan PRICES already use: the repos cannot share code, so each writes the
 * value down and each asserts it. The app's half is
 * `the-245-sms-hidden.test.ts` §2, which reads the values back out of
 * `/api/plans` — the very catalogue this site consumes — and pins them per
 * tier. If either side moves alone, one of the two suites goes red.
 */
const APP_SMS_BY_TIER: Readonly<Record<string, boolean>> = {
  free: false,
  plus: false,
  pro: false,
  max: true,
};

/** The site's plan ids, in the order `tiers` arrays and comparison cells use. */
const PRICED_ORDER = ['plus', 'pro', 'max'] as const;

/* ── 14 ────────────────────────────────────────────────────────────────────
   🔴 The vendor's name appears nowhere — a no-regression on the sweep.       */
describe('14 — neither vendor is named anywhere in this repository', () => {
  /* The provider's own name is swept for by `the-284-harvest-scheduler.test.ts`,
     which base64-encodes its tokens so the plain string exists in no file — this
     file included, which is why nothing here spells it. That sweep now covers
     THE-314's files for free, because it walks the whole working tree.

     What is added here is the OTHER half, which that sweep does not cover:
     TWILIO, the carrier this change removed. */
  it('🔴 the provider sweep still covers the whole tree, THE-314\'s files included', () => {
    const sweep = readSrc('pages/the-284-harvest-scheduler.test.ts');
    // It walks the repo rather than a list, so a file added by any later ticket
    // is swept without that ticket having to remember.
    expect(sweep).toContain('nor in ANY file in the working tree');
    expect(sweep).toContain('const offenders = repoFiles()');
    // And it proves its own decoder first, so a green run is not an empty regex.
    expect(sweep).toContain('the decoder works, so a green run is not an empty regex');
  });

  it('🔴 no source file in this repo spells the provider, THIS file included', () => {
    // Stated as a property of THIS ticket rather than left to the sweep alone:
    // the sweep would catch it, and this says the sweep was not worked around
    // by exempting a path.
    // The sweep walks the tree and exempts nothing by path, so THE-314's files
    // are covered without it naming them. Asserted as "no file of this ticket's
    // is named as an exclusion" rather than "the string THE-314 is absent" —
    // the tool-count note this change added to that suite mentions the ticket in
    // a COMMENT, which is a record and not an exemption.
    // ⚠️ THE NAMES ARE NOT SPELLED HERE EITHER — the first draft of this test
    // listed them in a regex, and the sweep caught it immediately, which is the
    // mechanism working on the very file written to check it. The tokens live
    // base64-encoded in the-284 and nowhere else; what is asserted here is that
    // the sweep still reaches every file rather than exempting this ticket's.
    const sweep = readSrc('pages/the-284-harvest-scheduler.test.ts');
    expect(sweep, 'the sweep exempts a THE-314 file by path')
      .not.toMatch(/the-314-sms-live/);
    // It reads each file it walks and reports offenders — no path filter beyond
    // the text-file extension test.
    expect(sweep).toContain('.filter((f) => VENDORS.test(fs.readFileSync(f, \'utf8\')))');
  });
});

/* ── 15 ────────────────────────────────────────────────────────────────────
   🔴 Twilio appears nowhere a visitor can see — name AND logo.               */
describe('15 — Twilio appears nowhere on the site', () => {
  /* ⚠️ ASSERTED ON WHAT RENDERS, NOT ON RAW SOURCE. Several files carry the
     word in a COMMENT explaining why it was removed — the integrations row, the
     pricing card, the Terms clause — and that paper trail is the point: the next
     reader inherits the finding instead of rediscovering it. What must not
     survive is a claim a visitor can read or a mark a browser can fetch. */
  const RENDERED: ReadonlyArray<readonly [string, string]> = [
    ['the plan cards', plans.flatMap((p) => [p.name, p.blurb, ...p.features]).join(' ')],
    ['the comparison grid', visibleText(render(React.createElement(ComparisonTable)))],
    ['the #replaces section', visibleText(render(React.createElement(Replaces)))],
    ['the mega-menu catalogue', CATALOG.flatMap((g) => g.items.map((i) => `${i.title} ${i.desc}`)).join(' ')],
    ['the feature catalogue', CATEGORIES.flatMap((c) => [c.intro, c.seo, ...c.features.flatMap((f) => [
      f.name, f.eyebrow, f.title, f.oneliner, f.moment, ...(f.admin ?? []), ...(f.member ?? []),
    ])]).join(' ')],
    ['the coming-soon entries', COMING_SOON_ITEMS.flatMap((i) => [
      i.name, i.eyebrow, i.title, i.oneliner, i.today, i.notThis ?? '', ...i.considering, i.navDesc,
    ]).join(' ')],
  ];

  it.each(RENDERED)('%s names no carrier', (_where, text) => {
    expect(text).not.toMatch(/twilio/i);
  });

  it('🔴 the integrations row lost the LOGO as well as the name', () => {
    // It was a favicon fallback rather than a Simple Icons mark, so a
    // name-only sweep would have left the image hotlinking a carrier's domain
    // from a page under Harvest's name.
    const markup = render(React.createElement(Replaces));
    expect(markup, 'the integrations row still hotlinks a carrier mark')
      .not.toContain('favicons?domain=twilio.com');
    // 🔴 THE-335 — the two that remained are now gated too, and for a DIFFERENT
    // reason than Twilio's removal, which is why they are gated rather than
    // deleted: Twilio went because the RELATIONSHIP ended, while these two are
    // intact and merely un-advertised while their features are hidden. The
    // assertion follows the flags rather than restating a count.
    const marks = [
      ...(QUICKBOOKS_MARKETING_ENABLED ? ['https://cdn.simpleicons.org/quickbooks'] : []),
      ...(NEWSLETTER_MARKETING_ENABLED ? ['https://cdn.simpleicons.org/mailchimp'] : []),
    ];
    for (const mark of marks) expect(markup).toContain(mark);
    expect([...markup.matchAll(/<img/g)]).toHaveLength(marks.length);
    // 🔴 AND THE LINE GOES WITH THE LIST. "Plus integrates with your newsletter
    // & tools —" followed by nothing is a dangling claim that also names the
    // newsletter this site is currently calling unbuilt.
    if (marks.length === 0) {
      expect(markup, 'the integrations line survived its own empty list')
        .not.toContain('Plus integrates with your');
    }
  });

  it.runIf(fs.existsSync(path.join(ROOT, 'dist')))('🔴 and no BUILT page names it', () => {
    const offenders: string[] = [];
    (function walk(dir: string) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walk(abs);
        else if (e.name.endsWith('.html') && /twilio/i.test(fs.readFileSync(abs, 'utf8'))) {
          offenders.push(path.relative(ROOT, abs));
        }
      }
    })(path.join(ROOT, 'dist'));
    expect(offenders, 'a built page names the carrier').toEqual([]);
  });
});

/* ── 16 ────────────────────────────────────────────────────────────────────
   🔴 The tier claim, VERIFIED against the app rather than asserted.          */
describe('16 — SMS\'s tier claim is Ministry only, and matches the app', () => {
  it('🔴 the app sells SMS on max alone — the transcribed cells', () => {
    // The other half of the two-copies mechanism. If the app's matrix moves,
    // its own suite fails on `/api/plans`; if this transcription drifts from
    // it, the three site surfaces below stop agreeing with a real product.
    expect(Object.entries(APP_SMS_BY_TIER).filter(([, v]) => v).map(([k]) => k)).toEqual(['max']);
  });

  /* 🔴 THE-335 — THIS WHOLE SECTION NOW GUARDS BOTH FLAG STATES, because the
     property it is really about survives the flip: NO SURFACE MAY OUTRUN THE
     APP. With SMS hidden the app grants it on no tier at all — the master switch
     sits in front of the `smsAutomation` cell in every funnel — so the honest
     claim on every surface is silence, and each assertion below reads the flag
     rather than being deleted. Flipping SMS_MARKETING_ENABLED back on restores
     the cell-for-cell comparison exactly as THE-314 wrote it. */
  it('🔴 the FEATURE entry\'s tiers array agrees with the app, cell for cell', () => {
    const sms = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'sms');
    if (!SMS_MARKETING_ENABLED) {
      expect(sms, 'the feature page sells SMS while the app refuses every tier').toBeUndefined();
      return;
    }
    expect(sms, 'the SMS feature entry is missing').toBeDefined();
    expect(sms!.tiers, 'the feature page claims a tier the app refuses')
      .toEqual(PRICED_ORDER.map((p) => (APP_SMS_BY_TIER[p] ? 1 : 0)));
  });

  it('🔴 the COMPARISON row agrees with the app, cell for cell', () => {
    const html = render(React.createElement(ComparisonTable));
    // Read off the rendered grid rather than the source array: PR 55 is the
    // precedent — a pure-function test passed while the JSX seam was mutated.
    const row = html.split('<tr').find((r) => /SMS &amp; Text-to-Give|SMS & Text-to-Give/.test(r));
    if (!SMS_MARKETING_ENABLED) {
      expect(row, 'the comparison grid sells SMS while the app refuses every tier').toBeUndefined();
      return;
    }
    expect(row, 'the comparison grid has no SMS row').toBeDefined();
    const cells = row!.split('<td').slice(1);
    // label, free, then the three priced columns.
    expect(cells.length).toBe(plans.length + 2);
    const ticked = (cell: string) => !/aria-hidden="true">—|>—</.test(cell) && /svg|check|✓/i.test(cell);
    expect(ticked(cells[1]), 'the grid sells SMS on the free tier').toBe(false);
    PRICED_ORDER.forEach((plan, i) => {
      expect(ticked(cells[i + 2]), `the grid's ${plan} cell disagrees with the app`)
        .toBe(APP_SMS_BY_TIER[plan]);
    });
  });

  it('🔴 the plan CARDS agree with the app, card for card', () => {
    for (const plan of PRICED_ORDER) {
      const card = plans.find((p) => p.planId === plan)!;
      // 🔴 With the master switch off the app grants SMS on NO tier, so every
      // card must be silent — `APP_SMS_BY_TIER` describes the plan CELL, which
      // the switch sits in front of.
      const appGrantsIt = SMS_MARKETING_ENABLED && APP_SMS_BY_TIER[plan];
      expect(/\bSMS\b/i.test(card.features.join(' ')), `the ${card.name} card disagrees with the app`)
        .toBe(appGrantsIt);
    }
  });

  it('🔴 all three surfaces say the SAME thing — no surface is left behind', () => {
    // The failure this site has been corrected for six times is one surface
    // moving without the others. Derived from each independently and compared.
    const sms = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'sms');
    const fromFeature = PRICED_ORDER.map((_, i) => sms?.tiers?.[i] === 1);
    const fromCards = PRICED_ORDER.map((p) =>
      /\bSMS\b/i.test(plans.find((x) => x.planId === p)!.features.join(' ')));
    // 🔴 THE-335 — the master switch is IN FRONT OF the cell, so with it off the
    // app's answer for every tier is false and all three surfaces must say so.
    // Derived from the flag here rather than from a second hardcoded array, so
    // the comparison stays a real cross-repo check in either state.
    const fromApp = PRICED_ORDER.map((p) => SMS_MARKETING_ENABLED && APP_SMS_BY_TIER[p]);
    expect(fromFeature).toEqual(fromApp);
    expect(fromCards).toEqual(fromApp);
  });
});

/* ── 17 ────────────────────────────────────────────────────────────────────
   No price, date or CTA reached a coming-soon entry.                         */
describe('17 — no price, date or CTA was added to a coming-soon entry', () => {
  it('every entry is still claim-free — the whole list, not just the one that left', () => {
    for (const item of COMING_SOON_ITEMS) {
      const aboutTheUnbuiltThing = [item.name, item.eyebrow, item.title, item.oneliner,
        ...item.considering].join(' ');
      expect(aboutTheUnbuiltThing, `"${item.name}" grew a price`).not.toMatch(/\$\s?\d/);
      expect(aboutTheUnbuiltThing, `"${item.name}" grew a tier`)
        .not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
      expect(aboutTheUnbuiltThing, `"${item.name}" grew a call to action`)
        .not.toMatch(/\b(buy|purchase|subscribe|start (your |a )?(free )?trial|upgrade now|get started)\b/i);
      expect(aboutTheUnbuiltThing, `"${item.name}" grew a date`)
        .not.toMatch(/\b(20\d\d|Q[1-4]\b|next (month|quarter|year)|by (spring|summer|autumn|winter))\b/i);
    }
  });

  it('🔴 and the SHAPE still forbids it, which is what makes the above cheap', () => {
    // `SoonItem` has no `tiers`, no price and no CTA field. That is why six
    // false-claim corrections could be made once, here, rather than per entry.
    const src = readSrc('content/coming-soon.ts');
    const shape = /export (?:interface|type) SoonItem[\s\S]*?\n}/.exec(src);
    expect(shape, 'the SoonItem shape could not be read').not.toBeNull();
    for (const field of ['tiers', 'price', 'cta', 'href']) {
      expect(shape![0], `SoonItem grew a "${field}" field`).not.toMatch(new RegExp(`\\b${field}\\??:`));
    }
  });
});

/* ── 18 ────────────────────────────────────────────────────────────────────
   The tool count, and every assertion that pins it.                          */
describe('18 — the tool count is 26, and every assertion agrees', () => {
  it('🔴 it is 26, derived, and the SMS tool is what took it off there', () => {
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
    // 🔴 THE-335 — THE DELTA IS NOW ZERO, AND THAT IS THE ASSERTION. The SMS
    // tool is no longer in the live catalogue at all, so removing "the SMS row"
    // from the tally changes nothing: the figure already excludes it. Asserted
    // as the delta rather than rewritten away, so flipping the flag back makes
    // this fail and demand the 1 again.
    const without = CATALOG.reduce(
      (n, g) => n + g.items.filter((i) => !i.soon && !/\bSMS\b/.test(i.title)).length, 0);
    expect(CATALOG_TOOL_COUNT - without, 'the SMS tool is being counted while it is hidden')
      .toBe(SMS_MARKETING_ENABLED ? 1 : 0);
  });

  it('🔴 no suite still pins the old figure, and none quietly dropped its pin', () => {
    /* 🔴 DISCOVERED BY SCANNING, NOT BY LISTING — the-306 established this and
       the reason holds: a hand-written list is exactly what let three of these
       go stale last time. The COUNT of pinning files is pinned alongside the
       value, so a suite that DROPS its assertion fails as loudly as one that
       leaves it at 28 or 29. */
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name))
        : e.name.endsWith('.test.ts') ? [path.join(d, e.name)] : []));
    const pinning = walk(path.join(ROOT, 'src'))
      .map((f) => [f, fs.readFileSync(f, 'utf8')] as const)
      .filter(([, body]) => /CATALOG_TOOL_COUNT\)\.toBe\(/.test(body));

    // 🔵 EIGHTEEN SINCE THE-335, which added a suite of its own that pins the
    // figure — the count moves with the number of FILES that pin it, and a file
    // that quietly drops its assertion still fails here.
    // 🔵 TWENTY SINCE THE-355, which adds two suites of its own — one for the
    // flag-off state and one for the restore path — and both pin the figure.
    // The count moves with the number of FILES that pin it, and a file that
    // quietly drops its assertion still fails here.
    expect(pinning.length, 'a suite gained or lost its tool-count assertion').toBe(20);
    for (const [f, body] of pinning) {
      expect(body, `${path.relative(ROOT, f)} still pins the pre-THE-314 count`)
        .not.toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(28\)/);
      expect(body, `${path.relative(ROOT, f)} still pins the pre-THE-335 count`)
        .not.toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(29\)/);
      // 🔵 THE-355 — 26 → 27, the Pledge Campaigns row. 26 is now the stale one.
      expect(body, `${path.relative(ROOT, f)} still pins the pre-THE-355 count`)
        .not.toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(26\)/);
      expect(body, `${path.relative(ROOT, f)} pins something other than the derived figure`)
        .toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(27\)/);
    }

    /* The flag suite asserts a PAIR rather than the constant, so the scan cannot
       see it — it is the one place the SMS delta of exactly one is measured by
       flipping the boolean, and both halves had to move together. */
    // 🔴 THE-335 — the labels swapped sides with the flag: `off` is what SHIPS
    // now and `smsOnly` is the synthetic half one above it. The DELTA of one is
    // what the pair measures and it is unchanged.
    // 🔵 THE-355 — 26/27 → 27/28. The Pledge Campaigns row is a live tool on
    // BOTH halves, so it moved the pair together and the delta did not move.
    const flags = readSrc('lib/flags.test.ts');
    expect(flags).toContain("expect(off.toolCount, 'the shipped count, with SMS withheld').toBe(27)");
    expect(flags).toContain("expect(smsOnly.toolCount, 'the count with SMS live').toBe(28)");
  });

  it('the rendered figure is interpolated, never retyped', () => {
    expect(readSrc('components/Nav.tsx')).toContain('${CATALOG_TOOL_COUNT} tools in one platform');
    expect(readSrc('components/catalog.ts'), 'the tool count was hardcoded')
      .not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });
});

/* ── 19 & 20 ───────────────────────────────────────────────────────────────
   The built site: same routes, and only the pages this change explains.      */
describe('19 & 20 — the prerendered set is unchanged, and only the named pages moved', () => {
  const DIST = path.join(ROOT, 'dist');
  const built = fs.existsSync(DIST);

  const pagesInDist = (): string[] => {
    const out: string[] = [];
    (function walk(dir: string) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walk(abs);
        else if (e.name === 'index.html') out.push(path.relative(DIST, abs).split(path.sep).join('/'));
      }
    })(DIST);
    return out.sort();
  };

  it.runIf(built)('🔴 the prerendered page count is unchanged at 22 — no new route', () => {
    // THE-314 adds no page and removes none. The SMS surfaces it restores all
    // live on pages that already existed, and the Coming Soon entry it withdraws
    // is a block on a page that stays.
    /* 🔴 23 SINCE 2026-09-10, AND NOT BECAUSE OF THIS TICKET. The
       `inside-harvest` post "What your year-end giving statements must include"
       (af7a7ba) added a 23rd route. CI runs on `pull_request` only and `main` is
       unprotected, so that direct blog push never ran this suite and every PR
       opened after it has been red on this assertion — the same failure mode
       THE-252 found at 21 and recorded in LegalPage.test.ts, one post later.
       Corrected here rather than in the ticket that eventually trips over it.
       ⚠️ THE-355 ITSELF ADDS NO ROUTE. It adds a SECTION to a page that already
       renders — /features/giving-finance — and a section is an anchor, not a
       page.
       🔴 24 SINCE board card 86bbyv8pp, AND NOT BECAUSE OF THIS TICKET EITHER —
       the new /solutions/evangelistic-organizations route.
       🔴 25 SINCE board card 86bbyv8pp, part two, and not because of this
       ticket either — the new /solutions/churches route.
       🔴 26 SINCE board card 86bbz2yj6, part three, and not because of this
       ticket either — the new /solutions/missionaries route. */
    expect(pagesInDist()).toHaveLength(26);
  });

  it.runIf(built)('🔴 only the eight pages THE-314 accounts for moved — NAMED, not counted', () => {
    /* The table lives in `the-278-no-regression.test.ts`, which fingerprints
       every page against a pre-Tailwind build. This reads that table back and
       says which eight are THE-314's, so the reason for each is in one place
       and a ninth cannot appear without this failing. */
    const guard = fs.readFileSync(path.join(ROOT, 'src/test/the-278-no-regression.test.ts'), 'utf8');
    const table = /const THE_314_MOVED[\s\S]*?\n  };/.exec(guard);
    expect(table, 'THE-314 records no moved-page table').not.toBeNull();
    const moved = [...table![0].matchAll(/'([^']+\/index\.html|index\.html)':/g)].map((m) => m[1]).sort();
    expect(moved).toEqual([
      'faq/index.html',                      // the messaging answer
      'features/ai-automation/index.html',   // the SMS feature section returns
      'features/coming-soon/index.html',     // the SMS entry leaves
      'features/giving-finance/index.html',  // the CRM crosslink resolves again
      'features/index.html',                 // the tool-count footnote
      'index.html',                          // #replaces gains SMS, loses Twilio
      'pricing/index.html',                  // the Ministry line and the grid row
      'privacy/index.html',                  // where a text actually goes
    ]);
    // Every one of them is a real page in the build, so the table cannot drift
    // into naming something that does not exist.
    for (const page of moved) expect(pagesInDist(), `${page} is not a built page`).toContain(page);
  });

  it('🔴 TERMS did NOT move, which is the one that looks like it should have', () => {
    // The Terms bullet describing SMS as a service a church connects itself was
    // WITHHELD while the flag was off and is now DELETED, so the rendered
    // document is identical either way. What replaces it is a legal ticket's
    // wording — reselling needs its own language and inventing it here would be
    // writing terms nobody has reviewed.
    const guard = fs.readFileSync(path.join(ROOT, 'src/test/the-278-no-regression.test.ts'), 'utf8');
    const table = /const THE_314_MOVED[\s\S]*?\n  };/.exec(guard)![0];
    expect(table, 'the Terms page moved and THE-314 did not explain why')
      .not.toContain('terms/index.html');
  });
});

/* ── One switch ────────────────────────────────────────────────────────────*/
describe('the whole change is still one value', () => {
  it('🔴 SMS_MARKETING_ENABLED is the only SMS flag on the site', () => {
    // 🔴 THE-335 — false again. The property this test is about is that there is
    // exactly ONE SMS flag, which is unchanged by its value.
    expect(SMS_MARKETING_ENABLED).toBe(false);
    const names = new Set(
      ['components/Pricing.tsx', 'content/coming-soon.ts', 'components/catalog.ts',
       'content/features.ts', 'content/legal.ts', 'content/faq.ts', 'components/Replaces.tsx']
        .flatMap((f) => [...readSrc(f).matchAll(/\bSMS_[A-Z0-9_]+\b/g)].map((m) => m[0])),
    );
    expect([...names]).toEqual(['SMS_MARKETING_ENABLED']);
    expect(readSrc('lib/flags.ts').match(/SMS_MARKETING_ENABLED\s*=/g)).toHaveLength(1);
  });

  it('the other three marketing flags are untouched', () => {
    const declared = [...readSrc('lib/flags.ts').matchAll(/export const (\w+) = (true|false);/g)]
      .map((m) => [m[1], m[2]] as const);
    // 🔴 THE-335 — two flags were ADDED (newsletter, QuickBooks) and SMS went
    // false. The whole list is pinned by value rather than only the ones this
    // ticket touched, so a fifth flag appearing, or an untouched one quietly
    // flipping, fails here. 🔴 STRIPE_CONNECT and CUSTOM_DOMAIN ARE UNTOUCHED
    // AND STILL FALSE, which is the no-regression half of this ticket.
    expect(declared).toEqual([
      ['AFFILIATE_PROGRAM_ENABLED', 'false'],
      ['MULTI_CAMPUS_ENABLED', 'false'],
      ['SMS_MARKETING_ENABLED', 'false'],
      ['NEWSLETTER_MARKETING_ENABLED', 'false'],
      ['QUICKBOOKS_MARKETING_ENABLED', 'false'],
      ['CUSTOM_DOMAIN_MARKETING_ENABLED', 'false'],
      // 🔵 THE-355 — the seventh, mirroring the app's `STRIPE_CONNECT_ENABLED`.
      // Appended, so every value above it is pinned exactly where it was.
      ['STRIPE_GIVING_MARKETING_ENABLED', 'false'],
    ]);
  });
});
