import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ComingSoonPage } from './ComingSoonPage';
import { ComingSoonBlock } from '../components/ComingSoonBlock';
import { FeatureMenuColumns } from '../components/Nav';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import {
  ADD_ONS,
  DODO_ADD_ON_CATALOG,
  addOnPricingContract,
  dodoAddOnCatalogContract,
  planPriceContract,
  plans,
  type AddOn,
  type Plan,
} from '../components/Pricing';
import { blogRoutes } from '../../build/blog-plugin';
import { CUSTOM_DOMAIN_MARKETING_ENABLED } from '../lib/flags';
import { CATEGORIES, type Category } from '../content/features';
import {
  COMING_SOON_HREF, COMING_SOON_IDS, COMING_SOON_ITEMS, IN_PROCESS_LABEL, NOT_BUILT_LABEL,
  comingSoonContract, type SoonItem,
} from '../content/coming-soon';

/* ─── THE-280 — custom domains go on Coming Soon ──────────────────────────────
 *
 * 🔴 THE ENTRY FOR A FEATURE THAT SHIPPED A PANEL AND NEVER WORKED. Every other
 * item on this page describes work that was never started. This one describes a
 * setting a church could FIND, TYPE A DOMAIN INTO AND SAVE — and that could
 * never have resolved, because the Vercel subscription behind it was never
 * bought. `/api/domains/provision` answered 501, the UI fell back to writing the
 * domain straight to Firestore, and the DNS records the church was then shown
 * pointed at a project that served nothing. Verification never completed.
 *
 * That is worse than an absent feature and worse than an unbuilt one: a church
 * that followed the instructions had a broken address and no way to know why.
 * The app now refuses the write path (Harvest-agent `CUSTOM_DOMAIN_ENABLED`),
 * and this site had to stop selling what the app refuses — a capability sold
 * here while the app answers 503 is a false claim, which is the one thing this
 * page exists to prevent.
 *
 * ─── The three things this file holds ────────────────────────────────────────
 *
 *   1. THE GUARD. The entry carries a board ref and NO price, date, tier or call
 *      to action — asserted through the shape, through the contract, and against
 *      the drawn page.
 *   2. NO LIVE SURFACE STILL SELLS IT. The `branding` feature entry sold a custom
 *      domain in its name, title, one-liner and four bullets; the category intro,
 *      the SEO line, the PWA bullet, the comparison table and the mega-menu each
 *      named it again. Sold there and unbuilt here would be the same claim in two
 *      tenses.
 *   3. 🔴 THE SUBDOMAIN IS NOT PART OF IT. Every church is served on
 *      `<name>.theharvest.app`, that ships, and it must still be claimed. Taking
 *      it down alongside the custom domain would turn this correction into a new
 *      false claim — and it is the single most likely way to get this wrong.
 *
 * ⚠️ ASSERTED AGAINST RENDERED OUTPUT, and against the prerendered files when the
 * build has run. PR 55 is the precedent: a pure-function test passed while the
 * JSX seam was mutated. A claim is not a claim until something draws it.
 *
 * ⚠️ NO `git show` ANYWHERE, and no digest read out of git at assertion time —
 * the rule the-252 and the-256 already set, so this works on a shallow clone. */

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const DIST = path.join(ROOT, 'dist');
const DIST_PAGE = path.join(DIST, 'features', 'coming-soon', 'index.html');
const built = fs.existsSync(DIST_PAGE);
const readSrc = (rel: string) => fs.readFileSync(path.join(ROOT, 'src', rel), 'utf8');

/* ⚠️ HelmetProvider IS NOT OPTIONAL — the page renders <Seo/>, which is
   react-helmet-async, and its dispatcher throws without a provider. CI runs
   `npm test` BEFORE `npm run build`, so on a clean checkout the fallback render
   is the ONLY path this file takes. */
const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: [COMING_SOON_HREF] }, el),
  ));

/** Markup as a visitor reads it. ⚠️ React separates adjacent text nodes with
 *  `<!-- -->`, so a figure and its unit can arrive apart and only rejoin once
 *  the comments and tags are gone — normalise BEFORE matching, or every claim
 *  check below is vacuous. `&amp;` last, or `&amp;lt;` would decode twice. */
const words = (markup: string) => markup
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/')
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const pageHtml = built
  ? fs.readFileSync(DIST_PAGE, 'utf8')
  : render(React.createElement(ComingSoonPage));

/** Just the page. Nav and Footer wrap every route and carry the site's real
 *  trial CTA, so a sitewide sweep would be asserting the site sells nothing. */
const mainHtml = (() => {
  const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(pageHtml);
  expect(m, 'the page rendered no <main>').not.toBeNull();
  return m![1];
})();
const mainText = words(mainHtml);

const SOURCE = built ? 'dist/features/coming-soon/index.html' : 'rendered from ComingSoonPage.tsx';

/** The entry under test, and its card rendered on its own. */
const domains = COMING_SOON_ITEMS.find((i) => i.id === 'domains');
const item = () => {
  expect(domains, 'there is no custom-domains entry in COMING_SOON_ITEMS').toBeDefined();
  return domains!;
};
const blockHtml = renderToStaticMarkup(React.createElement(
  MemoryRouter, { initialEntries: [COMING_SOON_HREF] },
  React.createElement(ComingSoonBlock, { item: item() }),
));
const blockText = words(blockHtml);

/** Every field of this entry a visitor can read, as one string. */
const copy = (i: SoonItem) =>
  [i.name, i.eyebrow, i.title, i.oneliner, i.today, i.notThis ?? '', i.navDesc, ...i.considering].join(' ');

/** The half of the entry that is ABOUT THE UNBUILT THING — the fields the
 *  contract holds to the tier rule. `today` and `notThis` describe what already
 *  ships and are exempt from that one check, deliberately. */
const aboutTheUnbuilt = (i: SoonItem) =>
  [i.name, i.eyebrow, i.title, i.oneliner, ...i.considering].join(' ');

const menuHtml = (variant: 'desktop' | 'mobile') => renderToStaticMarkup(
  React.createElement(MemoryRouter, { initialEntries: ['/'] },
    React.createElement(FeatureMenuColumns, { variant })),
);
const desktopMenu = menuHtml('desktop');
const mobileMenu = menuHtml('mobile');

/** Every prerendered page, when the build has run — for the sweeps that have to
 *  hold across the whole site rather than on one route. */
const distPages = (): [string, string][] => {
  if (!built) return [];
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name))
      : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []));
  return walk(DIST).map((f) => [path.relative(ROOT, f), fs.readFileSync(f, 'utf8')]);
};

/** Anything that reads as "you can point a domain you own at Harvest". */
const DOMAIN_CLAIM = /\b(custom domain|your own domain|your domain)\b/i;

/* ── 1 ─────────────────────────────────────────────────────────────────────
   The entry exists, traces to a card, and is drawn.                          */
describe('1 — custom domains appear in Coming Soon', () => {
  it(`the entry exists, traces to an open board card, and renders in full (${SOURCE})`, () => {
    const i = item();
    expect(i.ref, 'the entry does not trace to this ticket\'s card').toBe('THE-280');
    expect(i.name).toBe('Custom domains');

    // Drawn, not merely present in the array — every field a visitor reads.
    expect(mainText, 'the title is not on the page').toContain(words(i.title));
    expect(mainText, 'the one-liner is not on the page').toContain(words(i.oneliner));
    expect(mainText, 'the honest "today" half is not on the page').toContain(words(i.today));
    expect(mainText, 'the notThis boundary is not on the page').toContain(words(i.notThis!));
    for (const line of i.considering) {
      expect(mainText, `a "considering" line is not on the page: ${line}`).toContain(words(line));
    }
  });

  it('is reachable — an anchor on the page and a card in the jump-to index', () => {
    expect(mainHtml, 'the entry has no in-page anchor').toContain('id="domains"');
    expect(mainHtml).toContain(`href="${COMING_SOON_HREF}#domains"`);
  });

  it('is badged "Not built yet · In process", in that order, like every other entry', () => {
    // The pair is what keeps the page honest: a church reads "Not built yet"
    // first and "In process" second, and no date is given anywhere.
    expect(blockText).toContain(NOT_BUILT_LABEL);
    expect(blockText).toContain(IN_PROCESS_LABEL);
    expect(blockText.indexOf(NOT_BUILT_LABEL)).toBeLessThan(blockText.indexOf(IN_PROCESS_LABEL));
  });

  it('reaches both mega-menus, derived from the same array rather than kept twice', () => {
    for (const [variant, html] of [['desktop', desktopMenu], ['mobile', mobileMenu]] as const) {
      expect(words(html), `the ${variant} menu does not list it`).toContain('Custom domains');
      expect(html, `the ${variant} menu does not link to it`)
        .toContain(`${COMING_SOON_HREF}#domains`);
    }
  });

  it('🔴 it is the ELEVENTH entry — appended, not inserted', () => {
    expect(COMING_SOON_IDS).toEqual([
      'languages', 'services', 'applications', 'docs', 'website',
      'agent', 'identity', 'designations', 'sms', 'affiliate', 'domains',
    ]);
    expect(item().n).toBe('11');
    // Ordinals are derived from position, so appending can never leave a gap.
    expect(COMING_SOON_ITEMS.map((i) => i.n)).toEqual(
      COMING_SOON_ITEMS.map((_, i) => String(i + 1)));
  });

  it('🔴 and it leaves again the moment a custom domain is advertised as live', () => {
    /* The relocation, both ways — the SMS and affiliate shape exactly. The
       surfaces CUSTOM_DOMAIN_MARKETING_ENABLED rewords between them sell a
       custom domain in a feature name, a title, a one-liner, four bullets, the
       category intro, the SEO line and a comparison-table row. Live there and
       unbuilt here would be the same claim in two tenses, so ONE flag decides
       both. Asserted on the SOURCE of the filter; lib/flags.test.ts re-imports
       under a mock and proves the behaviour. */
    expect(CUSTOM_DOMAIN_MARKETING_ENABLED).toBe(false);
    const src = readSrc('content/coming-soon.ts');
    expect(src).toMatch(
      /\.filter\(\(item\) => item\.id !== 'domains' \|\| !CUSTOM_DOMAIN_MARKETING_ENABLED\)/);
    // And the filter runs BEFORE the renumber, or removing it leaves 1..10, 12.
    expect(src.indexOf("item.id !== 'domains'"))
      .toBeLessThan(src.indexOf('n: String(i + 1)'));
  });

  it('names the app constant it mirrors, so the pair is findable from either side', () => {
    // The two repos cannot share code — they share a name and a value, and the
    // only thing keeping them in step is that each says where the other is.
    // (The same contract the-245 holds for SMS_FEATURE_ENABLED.)
    const flags = readSrc('lib/flags.ts');
    expect(flags).toContain('CUSTOM_DOMAIN_ENABLED');
    expect(flags).toContain('src/lib/custom-domain-feature.ts');
    expect(flags).toMatch(/^export const CUSTOM_DOMAIN_MARKETING_ENABLED = false;$/m);
    expect(flags.match(/CUSTOM_DOMAIN_MARKETING_ENABLED\s*=/g)).toHaveLength(1);
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────
   🔴 THE GUARD — no price, no date, no tier, no call to action.              */
describe('2 — the entry carries no price, date, tier or call to action', () => {
  it('🔴 the SHAPE forbids it — SoonItem has nowhere to put a tier, a price or a CTA', () => {
    /* THE SHAPE IS THE GUARD, in the file header's words. `Feature` in
       content/features.ts has `tiers`, and the pricing table has prices; a
       SoonItem has neither field, so this entry cannot express "available on
       Ministry" or "$12/mo" even by accident. Asserted on the interface itself
       rather than on this one object, so a later field cannot open the door. */
    const src = readSrc('content/coming-soon.ts');
    const iface = /export interface SoonItem \{([\s\S]*?)\n\}/.exec(src);
    expect(iface, 'the SoonItem interface is gone').not.toBeNull();
    const fields = [...iface![1].matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]).sort();
    expect(fields).toEqual([
      'considering', 'eyebrow', 'icon', 'id', 'n', 'name', 'navDesc',
      'notThis', 'oneliner', 'ref', 'title', 'today',
    ]);
    for (const forbidden of ['tiers', 'price', 'cta', 'href', 'to', 'plan']) {
      expect(fields, `SoonItem grew a "${forbidden}" field`).not.toContain(forbidden);
    }
    // And this entry really is only those fields — no extra slipped in beside.
    expect(Object.keys(item()).sort()).toEqual(fields);
  });

  it('🔴 no price, and no per-month or per-year figure, anywhere in the entry', () => {
    const text = copy(item());
    expect(text, 'the entry carries a price').not.toMatch(/\$\s?\d/);
    expect(text, 'the entry carries a rate').not.toMatch(/\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i);
    expect(text, 'the entry carries a percentage').not.toMatch(/\d\s?%/);
    // Drawn, not just stored: the card as a visitor reads it.
    expect(blockText, 'a price reached the rendered card').not.toMatch(/\$\s?\d|\d\s?%/);
  });

  it('🔴 no delivery date, and no promise that it is coming', () => {
    const text = copy(item());
    expect(text).not.toMatch(
      /\b(q[1-4]\s*20\d\d|by (january|february|march|april|may|june|july|august|september|october|november|december)|in \d+ (weeks|months)|next (month|quarter|year)|ship(s|ping)? (in|by|this))\b/i);
    expect(text).not.toMatch(/\bwill (ship|launch|be (built|available|released))\b|\bwe promise\b|\bguarantee/i);
    expect(text, 'the entry names a year').not.toMatch(/\b20\d\d\b/);
    expect(blockText, 'a date reached the rendered card').not.toMatch(/\b20\d\d\b/);
  });

  it('🔴 no plan tier is named against the unbuilt capability', () => {
    /* ⚠️ `today` AND `notThis` ARE EXEMPT FROM THIS ONE CHECK, and the exemption
       is the point rather than a hole in it. Both describe what ALREADY SHIPS —
       "your name, logo and colour on the Ministry plan" — so a plan name there
       is a true statement about a LIVE feature, and drawing that line is exactly
       what this page is for. The fields about the unbuilt thing carry none. */
    expect(aboutTheUnbuilt(item()), 'a plan tier is attached to unbuilt work')
      .not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    // And the exemption is genuinely being used, not silently unnecessary —
    // so a future edit that drops the honest half would be visible.
    expect(item().today + item().notThis!, 'the live-branding distinction stopped naming its plan')
      .toMatch(/\bMinistry\b/);
  });

  it('🔴 no call to action, and no availability or "included" claim', () => {
    const text = copy(item());
    expect(text).not.toMatch(/\b(buy|purchase|subscribe|start (your |a )?(free )?trial|upgrade now|get started)\b/i);
    expect(text).not.toMatch(/\bavailable (on|now|from|in)\b|\bavailable to\b/i);
    expect(text).not.toMatch(/\bincluded (in|on|with)\b|\bcomes with your plan\b/i);
    expect(text).not.toMatch(/\badd-?ons?\b/i);
    // "Forever Free" is a real plan here, so the bare word is one careless scan
    // from reading as one.
    expect(text, 'the entry uses the word "free"').not.toMatch(/\bfree\b/i);
  });

  it('🔴 the rendered card offers nothing to press — no control, no link out', () => {
    // A church cannot act on this entry, which is what "not for sale" means in
    // markup rather than in prose.
    expect(blockHtml, 'the card rendered a form control').not.toMatch(/<(button|input|select|textarea|form)\b/i);
    const hrefs = [...blockHtml.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      expect(href, `the card links out to ${href}`).toMatch(/^#|^\/features\/coming-soon#/);
    }
  });

  it('🔴 the contract still REFUSES a priced, dated, tiered or sellable version', () => {
    /* The guard proved by mutation rather than trusted. It is called at module
       scope in content/coming-soon.ts, so a violation fails the PRERENDER — the
       page cannot ship — and it is exported so it can be handed mutated input
       here. A guard nobody has watched fail is a guard nobody knows works. */
    const base = item();
    const one = (patch: Partial<SoonItem>) => [{ ...base, ...patch }];
    const cases: [string, Partial<SoonItem>, RegExp][] = [
      ['a price', { oneliner: 'A domain of your own for $12/mo.' }, /carries a price/],
      ['a rate', { oneliner: 'Point a domain you own, 5 per month.' }, /per-month or per-year/],
      ['a tier', { oneliner: 'A domain you own, on the Ministry plan.' }, /names a plan tier/],
      ['an availability claim', { title: 'Custom domains are available now.' }, /an availability claim/],
      ['a purchase CTA', { navDesc: 'Buy a custom domain today.' }, /a purchase call to action/],
      ['a delivery date', { oneliner: 'Your own domain, shipping in 3 months.' }, /a delivery date/],
      ['a promise', { oneliner: 'Your own domain — this will ship.' }, /a promise that it is coming/],
      ['the word free', { oneliner: 'Point your own domain, free.' }, /the word "free"/],
      ['a missing board card', { ref: 'VERCEL-1' }, /no board reference/],
    ];
    for (const [label, patch, message] of cases) {
      expect(() => comingSoonContract(one(patch)), `the contract accepted ${label}`).toThrow(message);
    }
    // And it passes on the entry as it actually ships.
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
  });

  it('the guard is still ARMED at module scope, so a violation fails the prerender', () => {
    // Not `git show` at assertion time — the source as it sits on disk.
    expect(readSrc('content/coming-soon.ts')).toMatch(/^comingSoonContract\(COMING_SOON_ITEMS\);$/m);
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   🔴 No live feature entry still claims a custom domain.                     */
describe('3 — no live feature entry claims custom domains', () => {
  it('🔴 not in any name, title, one-liner, bullet, intro or SEO line', () => {
    /* THE ENTRY THAT SOLD IT MOST DIRECTLY was `branding`, called "Branding &
       Domain": its title, one-liner, one admin bullet and two member bullets
       each named a domain the church owns, and the category intro, the SEO line
       and the PWA member bullet named it again. All are behind the flag now. */
    const cats = CATEGORIES as Category[];
    const surfaces: [string, string][] = [
      ...cats.flatMap((c) => ([
        [`${c.slug} intro`, c.intro], [`${c.slug} seo`, c.seo],
      ] as [string, string][])),
      ...cats.flatMap((c) => c.features.flatMap((f) => ([
        [`${f.id} name`, f.name], [`${f.id} title`, f.title], [`${f.id} oneliner`, f.oneliner],
        [`${f.id} moment`, f.moment ?? ''],
        ...(f.admin ?? []).map((b, n) => [`${f.id} admin[${n}]`, b] as [string, string]),
        ...(f.member ?? []).map((b, n) => [`${f.id} member[${n}]`, b] as [string, string]),
      ] as [string, string][]))),
    ];
    for (const [where, line] of surfaces) {
      expect(line ?? '', `a live feature surface still claims a custom domain (${where}): "${line}"`)
        .not.toMatch(DOMAIN_CLAIM);
    }
  });

  it('🔴 nor in the mega-menu catalogue, nor in the comparison table', () => {
    for (const group of CATALOG) {
      for (const it of group.items) {
        // The Coming Soon group is where the unbuilt entry legitimately lives.
        if (group.href) continue;
        expect(it.title, `the catalogue sells a custom domain: "${it.title}"`)
          .not.toMatch(DOMAIN_CLAIM);
        expect(it.desc ?? '', `the catalogue blurb sells a custom domain: "${it.desc}"`)
          .not.toMatch(DOMAIN_CLAIM);
      }
    }
    // The comparison table's "Custom Domain" row is withheld entirely: a tick in
    // the top column is the plainest possible claim that paying for that tier
    // buys a custom domain.
    const pricing = readSrc('components/Pricing.tsx');
    expect(pricing).toMatch(/CUSTOM_DOMAIN_MARKETING_ENABLED[\s\S]{0,200}'Custom Domain'/);
    expect(words(desktopMenu), 'the mega-menu still sells a custom domain')
      .not.toMatch(/Custom Branding & Domain/);
  });

  /* 🔴 THE SENTENCES ALLOWED TO SAY IT, and the reason the sweep below needs an
     allowlist at all: a page may DENY a custom domain, and denying it means
     naming it. Each is pinned in full and each is asserted to be PRESENT further
     down, so the allowlist cannot quietly rot into a licence — the same terms
     `INTENTIONALLY_UNADVERTISED` is held to in Pricing.tsx, where the cost of
     being allowed to say "deliberately absent" is that the saying is checked. */
  const DENIALS = [
    'Pointing your own domain at it is on our Coming Soon page with everything else we are not shipping yet.',
  ];

  it('🔴 and not on ANY prerendered page — the whole site, when the build has run', () => {
    /* THE SWEEP THAT FOUND THE ONE NOBODY LISTED. Every surface named in this
       ticket was reworded by hand; this sweep is what caught the sentence that
       was not on anyone's list — the platform-brand positioning band in
       pages/CategoryPage.tsx, which told a visitor their members "visit your
       domain" in the present tense. Nothing in features.ts, catalog.ts, faq.ts
       or legal.ts would have surfaced it, because it is written in a page
       component rather than in content. It is behind the flag now.

       Scoped to <main> on each page: Nav and Footer wrap every route, and the
       Coming Soon page legitimately carries the phrase in its unbuilt entry. */
    const pages = distPages();
    if (!pages.length) return;                       // pre-build run; the checks above cover it
    for (const [file, html] of pages) {
      if (file.includes(path.join('features', 'coming-soon'))) continue;
      const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(html);
      if (!m) continue;
      for (const sentence of words(m[1]).split(/(?<=[.!?])\s+/)) {
        if (DENIALS.includes(sentence)) continue;
        expect(sentence, `${file} still claims a custom domain`).not.toMatch(DOMAIN_CLAIM);
      }
    }
  });

  it('🔴 every allowed sentence is a DENIAL, and is really on the page', () => {
    /* Two halves, and both are needed. A denial that stopped rendering would
       leave the allowlist covering nothing; a denial that had been reworded into
       a claim would still be skipped by the sweep above. */
    for (const sentence of DENIALS) {
      expect(sentence, 'an allowed sentence does not actually deny anything')
        .toMatch(/\bnot shipping\b|\bcannot\b|\bnot yet\b|\bComing Soon\b/i);
      const found = distPages().some(([, html]) => {
        const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(html);
        return m ? words(m[1]).includes(sentence) : false;
      });
      // Only meaningful once the build has run; before that there is no page.
      if (distPages().length) {
        expect(found, `an allowed sentence is on no page any more: "${sentence}"`).toBe(true);
      }
    }
  });

  it('🔴 the branding feature is REWORDED, not withdrawn — the live half still sells', () => {
    /* The distinction that matters most here. `customBranding` and
       `customDomain` are separate plan cells in the app, and only the second is
       off: a church on the top tier still sets its name, logo, icon and colour,
       and those still reach its receipts, certificates and forms. Hiding the
       whole entry would have withdrawn a live, working capability to hide a dead
       one — so the entry stays, keeps its `tiers`, and loses only the domain
       half of each sentence. */
    const branding = (CATEGORIES as Category[])
      .flatMap((c) => c.features).find((f) => f.id === 'branding');
    expect(branding, 'the branding feature was hidden along with the domain').toBeDefined();
    expect(branding!.name).toBe('Branding');
    expect(branding!.tiers, 'the branding entry lost or changed its tiers').toEqual([0, 0, 1]);
    for (const kept of [
      'Ministry name, logo, square icon & one brand colour',
      'Branding carries onto receipts, certificates & forms',
    ]) {
      expect(branding!.admin, `branding lost a live claim: ${kept}`).toContain(kept);
    }
    // Drawn on the page a visitor actually reads.
    expect(words(pageHtmlOf('features/platform-brand')), 'the branding section stopped rendering')
      .toContain('Your name, your logo, your colour.');
  });

  it('🔴 and its anchor still resolves — the reword broke no crosslink', () => {
    // The entry keeps its `branding` id, which is why rewording is safe where
    // hiding would not have been: every `#branding` crosslink and every retired
    // slug still lands.
    const features = readSrc('content/features.ts');
    expect(features).toMatch(/'custom-branding':\s*'\/features\/platform-brand#branding'/);
    expect(features).toMatch(/'custom-branding-domain':\s*'\/features\/platform-brand#branding'/);
    expect(words(desktopMenu)).toContain('Custom Branding');
  });
});

/** One prerendered page's html, or its rendered fallback when there is no build. */
function pageHtmlOf(route: string): string {
  const file = path.join(DIST, route, 'index.html');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  // No build: fall back to the source of truth the page renders from, which is
  // enough for the one claim above (the reworded title is a content string).
  return JSON.stringify((CATEGORIES as Category[]).flatMap((c) => c.features));
}

/* ── 4 ─────────────────────────────────────────────────────────────────────
   🔴 THE SUBDOMAIN IS NOT PART OF THIS.                                      */
describe('4 — the subdomain still ships, and the entry says so', () => {
  it('🔴 the live pages still claim the Harvest subdomain', () => {
    /* EVERY CHURCH IS SERVED ON `<name>.theharvest.app`. That works, it is not
       what THE-280 withdrew, and taking it down alongside the custom domain
       would turn this correction into a NEW false claim — the single most likely
       way to get this ticket wrong. */
    const bullets = (CATEGORIES as Category[])
      .flatMap((c) => c.features).flatMap((f) => [...(f.admin ?? []), ...(f.member ?? [])]);
    expect(bullets.some((b) => /your-church\.theharvest\.app/.test(b)),
      'the subdomain claim was withdrawn along with the custom-domain claim').toBe(true);
    expect(bullets.some((b) => /Your own subdomain/.test(b)),
      'the "your own subdomain" claim is gone').toBe(true);
  });

  it('🔴 the entry draws the line itself, in the words a church reads', () => {
    // `notThis` is the field that exists for exactly this: a hard boundary
    // against a feature that ALREADY ships and could be confused with this one.
    const i = item();
    expect(i.notThis, 'the entry does not distinguish the subdomain').toMatch(/subdomain/i);
    expect(i.notThis).toMatch(/theharvest\.app/);
    expect(i.today, 'the honest half does not say what a church has today')
      .toMatch(/theharvest\.app/);
    // And it is DRAWN, not merely stored.
    expect(mainText).toContain(words(i.notThis!));
  });

  it('🔴 it also says the stored domain is not lost', () => {
    // The app keeps `config.customDomain` and every `domains/{domain}` row; the
    // panel is what came down. A church that already saved one should not read
    // this page and conclude its data was thrown away.
    expect(item().today).toMatch(/already saved is still saved/i);
  });

  it('does not blame the church, and does not hide why', () => {
    // The entry states the cause — it was never switched on behind the scenes —
    // rather than implying the church's DNS was wrong.
    expect(item().today).toMatch(/never switched on|points? nowhere|pointed nowhere/i);
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────
   🔴 No price moved, and all three contracts still throw.                    */
describe('5 — the nine plan prices are unchanged and the contracts still throw', () => {
  const NINE = {
    plus: { monthly: 20, quarterly: 54, yearly: 190 },
    pro: { monthly: 40, quarterly: 108, yearly: 380 },
    max: { monthly: 80, quarterly: 216, yearly: 760 },
  } as const;

  it('all nine prices are exactly what the app charges', () => {
    for (const [planId, terms] of Object.entries(NINE)) {
      const plan = plans.find((p) => p.planId === planId);
      if (plan === undefined) throw new Error(`plan ${planId} vanished from the table`);
      for (const [term, price] of Object.entries(terms)) {
        expect(plan.price[term as keyof Plan['price']], `${planId} ${term}`).toBe(price);
      }
    }
  });

  it('🔴 all THREE cross-repo contracts still throw when the repos disagree', () => {
    /* Proved by mutation, not by reading the source. These throw at MODULE SCOPE
       during `vite-react-ssg build`, so a disagreement fails the prerender and
       the page cannot ship — which is why a red test could never be the only
       thing standing between a wrong price and production. */
    expect(() => planPriceContract(plans)).not.toThrow();
    expect(() => planPriceContract(plans.map((p) =>
      (p.planId === 'pro' ? { ...p, price: { ...p.price, yearly: p.price.yearly + 1 } } : p))))
      .toThrow(/pro/);

    // The add-on contract holds `annual === monthly × ADD_ON_BILLED_MONTHS`;
    // moving the monthly rate alone is what breaks that relation.
    expect(() => addOnPricingContract([...ADD_ONS])).not.toThrow();
    expect(() => addOnPricingContract(ADD_ONS.map((a: AddOn, n) =>
      (n === 0 ? { ...a, monthly: a.monthly + 1 } : a)))).toThrow(/add-on/);

    // The catalogue contract takes the Dodo table as a defaulted argument.
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
    expect(() => dodoAddOnCatalogContract(ADD_ONS, {})).toThrow();
  });

  it('all three are still armed at module scope', () => {
    const src = readSrc('components/Pricing.tsx');
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
    expect(src).toMatch(/^addOnPricingContract\(ADD_ONS\);$/m);
    expect(src).toMatch(/^dodoAddOnCatalogContract\(ADD_ONS\);$/m);
  });

  it('🔴 this change touched no price and no tier column', () => {
    /* THE-280 edits Pricing.tsx in exactly one place — it withholds the "Custom
       Domain" comparison ROW — and that row carries no money. Every plan, every
       price, every add-on and every other row is untouched, which is what keeps
       this ticket clear of the repricing work. */
    const pricing = readSrc('components/Pricing.tsx');
    const flagUses = [...pricing.matchAll(/CUSTOM_DOMAIN_MARKETING_ENABLED/g)];
    // Once in the import, once in the row guard. No third reader.
    expect(flagUses, 'the domain flag reached a second place in Pricing.tsx').toHaveLength(2);
    expect(pricing, 'the flag reached a price').not.toMatch(
      /CUSTOM_DOMAIN_MARKETING_ENABLED[^\n]{0,120}(price|monthly|quarterly|yearly|\$)/i);
    // Custom BRANDING keeps its row, unchanged — it ships.
    expect(pricing).toMatch(/\['Custom Branding', \[false, false, false, T\]\]/);
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────
   The prerendered page count.                                                */
describe('6 — the prerendered page count is unchanged', () => {
  it('blogRoutes() still lists 21 routes', () => {
    /* 🔴 THE-280 ADDS NO PAGE. The custom-domain entry is a BLOCK on the
       existing /features/coming-soon page, exactly as the SMS and affiliate
       entries are — it has an in-page anchor, not a route. The same 21 that
       LegalPage.test.ts and the-278's section 9 both pin. */
    expect(blogRoutes()).toHaveLength(21);
  });

  it.runIf(built)('and the build still emits exactly 21 pages', () => {
    const count = distPages().filter(([f]) => f.endsWith(`index.html`)).length;
    expect(count, `this checkout built ${count} pages, not 21`).toBe(21);
  });

  it('the entry is an anchor on an existing page, not a route of its own', () => {
    expect(item().id).toBe('domains');
    expect(`${COMING_SOON_HREF}#domains`).toBe('/features/coming-soon#domains');
    // Nothing anywhere links to a /features/custom-domains route.
    for (const [file, html] of distPages()) {
      expect(html, `${file} links to a custom-domain route that does not exist`)
        .not.toMatch(/href="\/features\/(custom-)?domains?"/);
    }
  });
});

/* ── 7 ─────────────────────────────────────────────────────────────────────
   The ten entries that were already there are unchanged.                     */
describe('7 — the existing entries are undisturbed', () => {
  it('🔴 nothing was reordered, and nothing was dropped', () => {
    expect(COMING_SOON_IDS.slice(0, 10)).toEqual([
      'languages', 'services', 'applications', 'docs', 'website',
      'agent', 'identity', 'designations', 'sms', 'affiliate',
    ]);
    expect(COMING_SOON_ITEMS.slice(0, 10).map((i) => i.n))
      .toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  });

  it('🔴 the ONE existing entry this ticket edits is `website`, and only its domain claims', () => {
    /* Its `today` claimed, in the PRESENT TENSE, that "what exists is branding —
       your domain, logo and colour", and one `considering` bullet spoke of "the
       domain a church already points at Harvest". Both presuppose that pointing
       your own domain at Harvest works, which is exactly what this ticket
       establishes it never did. Reworded behind the flag, not deleted. */
    const website = COMING_SOON_ITEMS.find((i) => i.id === 'website')!;
    expect(website.ref, 'the website entry was re-pointed at another card').toBe('THE-59');
    expect(copy(website), 'the website entry still claims a working custom domain')
      .not.toMatch(DOMAIN_CLAIM);
    // The half that was always true is untouched.
    expect(website.today).toMatch(/no website builder, no page builder and no template gallery/);
    expect(website.today).toMatch(/your logo and colour on the Ministry plan/);
  });

  it('every entry still renders on the page, and every one still traces to a card', () => {
    for (const i of COMING_SOON_ITEMS) {
      expect(mainText, `"${i.id}" stopped rendering`).toContain(words(i.title));
      expect(mainHtml).toContain(`id="${i.id}"`);
      expect(i.ref, `"${i.id}" has no board reference`).toMatch(/^THE-\d+$/);
    }
  });

  it('🔴 the derived tool count did not move — 27, still a reduce', () => {
    /* ⚠️ THE MEASURABLE DIFFERENCE FROM THE SMS FLAG. THE-245 withdrew a live
       TOOL and took the count 28 → 27. This ticket rewords a tool that stays
       live — "Custom Branding & Domain" becomes "Custom Branding" — so the count
       is unchanged, and "N tools in one platform" still describes what a church
       can use today. */
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
    const catalog = readSrc('components/catalog.ts');
    expect(catalog, 'the tool count was hardcoded').not.toMatch(/CATALOG_TOOL_COUNT\s*=\s*\d+/);
  });

  it('🔴 and the new entry contributes nothing to it', () => {
    const soonGroup = CATALOG.filter((g) => g.href);
    expect(soonGroup).toHaveLength(1);
    const tool = soonGroup[0].items.find((i) => i.title === 'Custom domains');
    expect(tool, 'the entry is missing from the catalogue').toBeDefined();
    expect(tool!.soon, '🔴 the custom-domains entry would be counted as a live tool').toBe(true);
    // By mutation: it WOULD have moved the count without its flag.
    const without = CATALOG.map((g) => (g.href
      ? { ...g, items: g.items.map((it) => (it.title === 'Custom domains' ? { ...it, soon: false } : it)) }
      : g));
    expect(without.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0)).toBe(28);
  });
});
