import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SchedulerPage } from './SchedulerPage';
import { ComingSoonPage } from './ComingSoonPage';
import { ComingSoonBlock } from '../components/ComingSoonBlock';
import { FeatureMenuColumns } from '../components/Nav';
import { CATALOG, CATALOG_TOOL_COUNT } from '../components/catalog';
import { blogRoutes } from '../../build/blog-plugin';
import {
  ADD_ONS,
  DODO_ADD_ON_CATALOG,
  dodoAddOnCatalogContract,
  planPriceContract,
  plans,
  type Plan,
} from '../components/Pricing';
import {
  COMING_SOON_HREF, COMING_SOON_ITEMS, IN_PROCESS_LABEL, NOT_BUILT_LABEL, SCHEDULER_HREF,
  SCHEDULER_NAME, comingSoonContract, type SoonItem,
} from '../content/coming-soon';
import {
  AD_NETWORKS, CAPABILITIES, PLATFORMS, POST_OPTIONS, SCHEDULER_NOTICE, SCHEDULER_REF,
  schedulerContract, schedulerCopy,
} from '../content/scheduler';

/* ─── THE-284 — Harvest Scheduler, a page for something that does not exist ───
 *
 * 🔴 THE PAGE WITH THE MOST WAYS TO BE WRONG ON THIS SITE. Every other unbuilt
 * thing gets one block on /features/coming-soon, where the SHAPE of `SoonItem`
 * does most of the guarding: there is nowhere to put a price, a tier or a call
 * to action, so the entry cannot carry one even by accident. This is a whole
 * PAGE, written freehand, about a capability that would be bought from a third
 * party — and it has four separate ways to make a false claim, each of which is
 * a section below:
 *
 *   1. It could NAME THE VENDOR, which would be a claim about a contract that
 *      has not been signed.
 *   2. It could carry a PRICE or a DATE, which is the failure this site has
 *      already had to correct six times.
 *   3. It could list a DESTINATION that is out of scope, which would be a
 *      promise the founder has explicitly refused to make.
 *   4. It could describe the provider's RATES — per-account bands, message
 *      allowances, ad meters — which is Harvest's cost of goods and none of a
 *      church's business.
 *
 * ─── ⚠️ THE VENDOR'S NAME IS NOT SPELLED IN THIS FILE EITHER ──────────────────
 *
 * The precedent is `pages/the-252-affiliate-coming-soon.test.ts`, which forbids
 * naming the unsigned affiliate supplier anywhere under `src/` — an earlier
 * agent tripped it by putting the name in a comment. That suite has to EXEMPT
 * ITSELF from its own sweep, because the name it forbids is written in its own
 * source in order to be searched for.
 *
 * 🔴 THIS ONE GOES ONE STEP FURTHER, and it is a real difference rather than a
 * flourish. The founder's instruction was that the provider appears nowhere —
 * "not in a test" included. So the tokens below are stored base64-encoded and
 * decoded at run time, the plain string appears in no file in this repository,
 * and the sweep therefore needs NO self-exemption: it reads its own source like
 * every other file. Writing the name into this test would fail this test, which
 * is exactly the property the-252 could not have.
 *
 * Founder, verbatim: "Do not say it's <the vendor>. It's harvest scheduler." */

const HERE = fileURLToPath(import.meta.url);
const ROOT = path.join(path.dirname(HERE), '..', '..');
const DIST = path.join(ROOT, 'dist');
const built = fs.existsSync(path.join(DIST, 'index.html'));
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Collapse React's markup back into readable prose. React splits text around
 *  interpolations with comment nodes, so an un-normalised search for a phrase
 *  finds nothing even when the phrase is on the page. */
const words = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|\s+/g, ' ')
    .trim();

/* ⚠️ HelmetProvider IS NOT OPTIONAL, and leaving it out is a green-locally /
   red-in-CI trap ComingSoonPage.test.ts fell into once. Both pages render
   <Seo/>, which is vite-react-ssg's <Head/>, which is react-helmet-async — and
   without a provider its dispatcher throws before a single test in the file
   runs. */
const render = (el: React.ReactElement, at: string) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, { context: {} },
    React.createElement(MemoryRouter, { initialEntries: [at] }, el),
  ));

const pageHtml = render(React.createElement(SchedulerPage), SCHEDULER_HREF);
const pageText = words(pageHtml);
const soonHtml = render(React.createElement(ComingSoonPage), COMING_SOON_HREF);
const soonText = words(soonHtml);

const entry = (): SoonItem => {
  const found = COMING_SOON_ITEMS.find((i) => i.id === 'scheduler');
  expect(found, 'there is no scheduler entry in COMING_SOON_ITEMS').toBeDefined();
  return found!;
};
const entryCopy = (i: SoonItem) =>
  [i.name, i.eyebrow, i.title, i.oneliner, i.today, i.notThis ?? '', i.navDesc, ...i.considering].join(' ');

const blockHtml = render(React.createElement(ComingSoonBlock, { item: entry() }), COMING_SOON_HREF);

const menuHtml = (variant: 'desktop' | 'mobile') =>
  render(React.createElement(FeatureMenuColumns, { variant }), '/');
const desktopMenu = menuHtml('desktop');
const mobileMenu = menuHtml('mobile');

/** Every prerendered page, when the build has run. */
const distPages = (): [string, string][] => {
  if (!built) return [];
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name))
      : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []));
  return walk(DIST).map((f) => [path.relative(DIST, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')]);
};

/**
 * Every text file in the working tree, `node_modules`, `.git` and build output
 * aside — source, config, content, tests and this file included.
 *
 * ⚠️ WIDER THAN the-252's SWEEP ON PURPOSE. That one walks `src/` and matches
 * `.ts|.tsx|.css`, which would miss a vendor name in package.json (an SDK
 * dependency is exactly how one would arrive), in README.md, in vercel.json or
 * in a markdown post. A name in any of those is still a name on a public repo.
 */
const repoFiles = (): string[] => {
  const SKIP = new Set(['node_modules', '.git', 'dist', 'build-output', '.vercel']);
  const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|html|yml|yaml|txt|svg)$/;
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      if (SKIP.has(e.name)) return [];
      const abs = path.join(dir, e.name);
      return e.isDirectory() ? walk(abs) : TEXT.test(e.name) ? [abs] : [];
    });
  return walk(ROOT);
};

/* ── 1 ─────────────────────────────────────────────────────────────────────
   🔴 The vendor is named NOWHERE.                                           */
describe('1 — the third-party provider is named nowhere in this repository', () => {
  /* base64, decoded at run time, so the plain strings exist in no file here.
     The first is the provider itself; the second is the reference
     implementation published under its own organisation, which names it just as
     surely; the rest are the alternative recorded on the board card and the
     obvious substitutes a later edit might reach for. Any of them on a page
     under Harvest's name is a claim about who Harvest has contracted with. */
  const ENCODED = [
    'emVybmlv', 'bGF0ZXdpeg==', 'cG9zdGl6', 'YXlyc2hhcmU=', 'aG9vdHN1aXRl',
    'c3Byb3V0IHNvY2lhbA==', 'bWV0cmljb29s', 'cHVibGVy', 'bWl4cG9zdA==',
    'YmxvdGF0bw==', 'YnVmZmVyLmNvbQ==', 'bGF0ZXIuY29t', 'c2VuZGlibGU=',
    'c29jaWFsYmVl',
  ];
  const NAMES = ENCODED.map((e) => Buffer.from(e, 'base64').toString('utf8'));
  const VENDORS = new RegExp(NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

  it('the decoder works, so a green run is not an empty regex', () => {
    /* 🔴 THE TEST THAT KEEPS EVERY ASSERTION BELOW HONEST. A base64 typo would
       decode to rubbish, the sweep would search for rubbish, and the whole
       section would pass while the vendor's name sat on the page. So the regex
       is proved to have teeth on a mutated string first. */
    expect(NAMES).toHaveLength(ENCODED.length);
    for (const n of NAMES) {
      expect(n, 'a token decoded to something unusable').toMatch(/^[a-z][a-z. ]{4,}$/);
      expect(VENDORS.test(`the ${n} api`), `the sweep would not catch "${n}"`).toBe(true);
      expect(VENDORS.test(`// built on ${n.toUpperCase()}`), 'the sweep is case-sensitive').toBe(true);
    }
    expect(VENDORS.test('Harvest Scheduler posts to Instagram')).toBe(false);
  });

  it('🔴 not in the page, not in the entry, not in the mega-menu', () => {
    expect(VENDORS.test(pageText), 'the page names the provider').toBe(false);
    expect(VENDORS.test(pageHtml), 'the page markup names the provider').toBe(false);
    expect(VENDORS.test(entryCopy(entry())), 'the coming-soon entry names the provider').toBe(false);
    expect(VENDORS.test(blockHtml)).toBe(false);
    expect(VENDORS.test(soonHtml)).toBe(false);
    expect(VENDORS.test(desktopMenu)).toBe(false);
    expect(VENDORS.test(mobileMenu)).toBe(false);
  });

  it('🔴 nor in ANY file in the working tree — source, config, content or test', () => {
    /* No self-exemption. This file is swept like every other, which it can be
       precisely because the names are not spelled in it. */
    const offenders = repoFiles()
      .filter((f) => VENDORS.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(ROOT, f));
    expect(offenders, 'a provider name reached the working tree').toEqual([]);
  });

  it('🔴 nor in a FILENAME, and nor in a dependency', () => {
    const named = repoFiles()
      .map((f) => path.relative(ROOT, f))
      .filter((f) => VENDORS.test(f));
    expect(named, 'a provider name reached a path').toEqual([]);

    /* An SDK dependency is the likeliest way the name arrives, and it would
       arrive in two files at once. Both are swept above; this says which. */
    const pkg = JSON.parse(read('package.json')) as Record<string, Record<string, string>>;
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(deps.filter((d) => VENDORS.test(d)), 'a provider SDK was installed').toEqual([]);
    expect(VENDORS.test(read('package-lock.json')), 'the lockfile names the provider').toBe(false);
  });

  it.runIf(built)('nor on any prerendered page', () => {
    for (const [file, html] of distPages()) {
      expect(VENDORS.test(words(html)), `${file} names the provider`).toBe(false);
      expect(VENDORS.test(html), `${file} names the provider in an attribute`).toBe(false);
    }
  });

  it('and the page says the dependency EXISTS without saying whose it is', () => {
    /* ⚠️ THE HONEST HALF. Not naming the provider must not become pretending
       there is not one: the entry says plainly that this would rest on a
       platform Harvest does not run, which is the same shape the `domains`
       entry uses for the hosting it does not pay for. Silence about the
       dependency would be its own false claim. */
    expect(entry().considering.join(' '))
      .toMatch(/rest on a posting platform Harvest does not run/i);
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────
   🔴 No price, no date, no tier, no call to action.                         */
describe('2 — the page and the entry carry no price, date, tier or CTA', () => {
  const surfaces: [string, string][] = [
    ['the page', pageText], ['the entry', entryCopy(entry())], ['the block', words(blockHtml)],
  ];

  it.each(surfaces)('%s carries no price and no per-period figure', (_where, text) => {
    expect(text, 'a price').not.toMatch(/[$£€]\s?\d/);
    expect(text, 'a per-period rate').not.toMatch(/\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i);
    expect(text, 'the word "free"').not.toMatch(/\bfree\b/i);
  });

  it.each(surfaces)('%s carries no date and no promise that it is coming', (_where, text) => {
    expect(text).not.toMatch(/\bq[1-4]\s*20\d\d\b/i);
    expect(text).not.toMatch(/\b20\d\d\b/);
    expect(text).not.toMatch(/\bin \d+ (weeks|months)\b|\bnext (month|quarter|year)\b/i);
    expect(text).not.toMatch(/\bwill (ship|launch|be (built|available|released))\b/i);
    expect(text).not.toMatch(/\bwe promise\b|\bguarantee/i);
  });

  it.each(surfaces)('%s names no plan tier and no add-on', (_where, text) => {
    expect(text).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    expect(text).not.toMatch(/\badd-?ons?\b/i);
    expect(text).not.toMatch(/\bincluded (in|on|with)\b/i);
    expect(text).not.toMatch(/\bavailable (on|now|from|in)\b|\bavailable to\b/i);
  });

  it('🔴 nothing on the page can be clicked towards a purchase', () => {
    expect(pageHtml, 'the page links to pricing').not.toContain('/#pricing');
    expect(pageHtml).not.toContain('/pricing');
    expect(pageText).not.toMatch(/start (your |a )?(free )?trial/i);
    expect(pageText).not.toMatch(/compare plans/i);
    expect(pageText).not.toMatch(/\b(buy|purchase|subscribe|upgrade now|get started|sign up)\b/i);

    // Every destination the page offers, enumerated. Anything new has to be
    // added here deliberately.
    const hrefs = [...new Set([...pageHtml.matchAll(/href="([^"]*)"/g)].map((m) => m[1]))].sort();
    expect(hrefs).toEqual(['/contact', COMING_SOON_HREF].sort());
  });

  it('🔴 and the contract that forbids all of it runs at MODULE SCOPE', () => {
    /* Not `git show` at assertion time — the source as it sits on disk. A red
       test can be skipped; a build that will not produce the file cannot. */
    expect(read('src/content/scheduler.ts')).toMatch(/^schedulerContract\(\);$/m);
    expect(read('src/content/coming-soon.ts')).toMatch(/^comingSoonContract\(COMING_SOON_ITEMS\);$/m);
  });

  it('the contract passes against the shipped copy', () => {
    expect(() => schedulerContract()).not.toThrow();
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
  });

  /* 🔴 AND IT STILL THROWS ON MUTATED INPUT. A guard nobody has watched fail is
     a guard nobody knows works — the reason both contracts are exported as well
     as called. */
  it.each([
    ['a price', 'It would cost $22/mo.', /a price/],
    ['a delivery date', 'Landing in Q1 2027.', /a delivery date/],
    ['a tier', 'Posting would be on the Ministry plan.', /plan tier/],
    ['a purchase CTA', 'Start your free trial of the scheduler.', /call to action|purchase/i],
    ['an add-on', 'It would be sold as an add-on.', /add-?on/i],
    ['the word free', 'The first posts are free.', /free/i],
  ])('throws on %s', (_label, sentence, pattern) => {
    expect(() => schedulerContract(PLATFORMS, AD_NETWORKS, [...schedulerCopy(), sentence]))
      .toThrow(pattern);
  });

  it('and the coming-soon entry could not carry one even if it tried', () => {
    const mutated = COMING_SOON_ITEMS.map((i) =>
      (i.id === 'scheduler' ? { ...i, oneliner: 'Yours for $20/mo.' } : i));
    expect(() => comingSoonContract(mutated)).toThrow(/scheduler.*a price/);
  });
});

/* ── 3 & 4 ─────────────────────────────────────────────────────────────────
   🔴 The destinations that are not offered, and the ones that never will be. */
describe('3 & 4 — no out-of-scope destination is named, by name or by logo', () => {
  /**
   * ⚠️ TWO GROUPS, TWO DIFFERENT REASONS, AND THE PAGE MAY NOT DISTINGUISH THEM.
   *
   *   · PERMANENTLY OUT OF SCOPE — the founder: "these never. Not relevant."
   *   · NOT OFFERED ON COST — two destinations bill per message or per API call
   *     as a straight pass-through. On one of them a post carrying a link runs
   *     roughly thirteen times a plain post, and a church posting sermon links
   *     daily could spend more than the whole feature is worth; the other's
   *     template messages are billed by the platform directly. Both would need
   *     a different pricing model, not more time.
   *
   * 🔴 THE PAGE SAYS NEITHER THING. Naming a platform to explain why it is
   * absent is still naming it, and "not yet" and "never" both read as a
   * schedule to somebody who wanted it. The page carries the nine that ARE
   * offered and one sentence saying the list is a decision — nothing else.
   */
  const NEVER = /\b(linked ?in|reddit|pinterest|telegram|snapchat|discord)\b/i;
  const NEVER_CAPITALISED = /\bSlack\b/;
  /* 🔴 CASE-SENSITIVE ON "Twitter", AND THE REASON IS NOT PEDANTRY.
     `<meta name="twitter:card">` is the standard preview-card meta name and it
     is on every page this site prerenders — an `/i` sweep matches all 22 of
     them and would have to exempt the whole site, which is a sweep that checks
     nothing. Capitalised, it matches the PLATFORM and not the meta name.

     ⚠️ AND THE BARE LETTER IS NOT SWEEPABLE. A one-character name cannot be
     matched without hitting "$X/mo" in the pricing copy and `x / 60` in a
     canvas loop, so the honest limit is: the old name and the compound forms
     are matched here, and the LOGO is matched by slug in the test below. That
     is the leak that actually matters — a mark drawn from `logoUrl('x', …)`
     spells nothing at all. */
  const NOT_OFFERED = /\bTwitter\b|\bX\s*\/\s*Twitter\b|\bX \(Twitter\)|\bX Ads\b/;
  const NOT_OFFERED_CI = /\bwhats\s?app\b/i;
  const OUT_OF_SCOPE_SLUGS = /\b(x|twitter|whatsapp|linkedin|reddit|pinterest|telegram|snapchat|discord|slack)\b/i;

  const surfaces: [string, string][] = [
    ['the page text', pageText],
    ['the page markup', pageHtml],
    ['the entry', entryCopy(entry())],
    ['the block markup', blockHtml],
    ['the scheduler content module', read('src/content/scheduler.ts')],
    ['the scheduler page module', read('src/pages/SchedulerPage.tsx')],
  ];

  it.each(surfaces)('%s names none of the permanently out-of-scope platforms', (_where, text) => {
    expect(text).not.toMatch(NEVER);
    expect(text).not.toMatch(NEVER_CAPITALISED);
  });

  it.each(surfaces)('%s names neither of the two withheld on cost', (_where, text) => {
    expect(text).not.toMatch(NOT_OFFERED);
    expect(text).not.toMatch(NOT_OFFERED_CI);
  });

  it('🔴 nor by LOGO — every mark drawn is one of the nine', () => {
    /* A slug is how a logo would arrive without the name ever being typed:
       `logoUrl('pinterest', …)` draws the mark and spells nothing. */
    for (const d of [...PLATFORMS, ...AD_NETWORKS]) {
      if (d.slug !== null) {
        expect(d.slug, `${d.name} resolves to an out-of-scope mark`).not.toMatch(OUT_OF_SCOPE_SLUGS);
      }
    }
    const marks = [...pageHtml.matchAll(/src="(https:\/\/[^"]+)"/g)].map((m) => m[1]);
    expect(marks.length, 'the page draws no destination marks at all').toBe(PLATFORMS.length + AD_NETWORKS.length);
    for (const src of marks) {
      expect(src).toMatch(/^https:\/\/cdn\.simpleicons\.org\//);
      const slug = src.split('/').pop()!;
      expect(slug, `${src} is an out-of-scope mark`).not.toMatch(OUT_OF_SCOPE_SLUGS);
    }
  });

  it('🔴 and none is described as coming later, which would be the same promise', () => {
    /* The founder's instruction was three things, and this is the third:
       "do not list them, do not show their logos, and do not describe them as
       coming later". A page that says "more platforms soon" has made the
       promise without naming anybody. */
    expect(pageText).not.toMatch(/\bmore (platforms|networks|accounts) (are )?(coming|to follow|later|soon)\b/i);
    expect(pageText).not.toMatch(/\b(for now|to start with|initially|at first|first up)\b/i);
    expect(pageText).not.toMatch(/\bother (platforms|networks)\b/i);
    // What it says instead: the list is a decision that has been taken.
    expect(pageText).toMatch(/This is the list, and it is a decision rather than a starting point/);
  });

  it('nor anywhere else in the working tree, beyond the three files that predate this', () => {
    /* 🔴 A REPO-WIDE SWEEP WITH A PINNED EXEMPTION LIST, rather than a scoped
       one. The three files below mention these platforms for reasons that have
       nothing to do with a scheduler and predate this ticket by months — two
       comments about `og:image` needing an absolute URL to produce a preview
       card, and one about a retired Telegram assistant. They are named here so
       that the exemption is a fact a reader can check rather than a hole: a
       FOURTH file mentioning any of them fails this test. */
    const EXPECTED = [
      'src/content/post-core.ts',      // og:image preview-card comment
      'src/pages/BlogPost.tsx',        // the same comment, at the call site
      'src/components/the-224-ai-assistant-withdrawal.test.ts', // the retired assistant
    ];
    const offenders = repoFiles()
      .filter((f) => f !== HERE)
      .filter((f) => {
        const src = fs.readFileSync(f, 'utf8');
        return NEVER.test(src) || NEVER_CAPITALISED.test(src)
          || NOT_OFFERED.test(src) || NOT_OFFERED_CI.test(src);
      })
      .map((f) => path.relative(ROOT, f).split(path.sep).join('/'))
      .sort();
    expect(offenders).toEqual([...EXPECTED].sort());
  });

  it.runIf(built)('and no prerendered page names one', () => {
    for (const [file, html] of distPages()) {
      const text = words(html);
      expect(text, `${file} names an out-of-scope platform`).not.toMatch(NEVER);
      expect(text, `${file} names an out-of-scope platform`).not.toMatch(NEVER_CAPITALISED);
      expect(text, `${file} names a withheld platform`).not.toMatch(NOT_OFFERED);
      expect(text, `${file} names a withheld platform`).not.toMatch(NOT_OFFERED_CI);
    }
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────
   Exactly the six platforms and the three ad networks.                      */
describe('5 — exactly the six platforms and the three ad networks are listed', () => {
  const SIX = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Threads', 'Bluesky'];
  const THREE = ['Meta Ads', 'Google Ads', 'TikTok Ads'];

  it('the data is the founder\'s list, in order and with nothing beside it', () => {
    expect(PLATFORMS.map((p) => p.name)).toEqual(SIX);
    expect(AD_NETWORKS.map((a) => a.name)).toEqual(THREE);
  });

  it('🔴 and the contract throws on a tenth destination, or on a substitution', () => {
    /* EQUALITY, not `includes` — a subset check would pass a tenth destination
       added beside the nine, which is the only way an out-of-scope platform
       ever reaches this page. */
    expect(() => schedulerContract([...PLATFORMS, { name: 'Somewhere else', slug: null }]))
      .toThrow(/not the six/);
    expect(() => schedulerContract(PLATFORMS.slice(0, 5))).toThrow(/not the six/);
    expect(() => schedulerContract(PLATFORMS, [...AD_NETWORKS, { name: 'Another Ads', slug: null }]))
      .toThrow(/not the three/);
    expect(() => schedulerContract(
      PLATFORMS.map((p) => (p.name === 'Threads' ? { ...p, name: 'Somewhere else' } : p)),
    )).toThrow(/not the six/);
  });

  it('every one of the nine is actually DRAWN, not merely declared', () => {
    /* A claim is not a claim until something draws it — the precedent is PR 55,
       where a pure-function test passed while the JSX seam was mutated. */
    for (const name of [...SIX, ...THREE]) {
      expect(pageText, `"${name}" is not on the page`).toContain(name);
    }
  });

  it('and the page draws no tenth destination chip', () => {
    /* Counted from the marks rather than from the data, so an extra chip
       hand-written into the JSX is caught too. */
    const chips = [...pageHtml.matchAll(/loading="lazy"/g)].length;
    expect(chips).toBe(9);
  });
});

/* ── 6 ─────────────────────────────────────────────────────────────────────
   No API is named, and "webhooks" is said in church language.               */
describe('6 — no API endpoint is named, and the page reads as a church product', () => {
  it('🔴 no endpoint, SDK or developer noun appears anywhere on the page', () => {
    /* ⚠️ A FOUNDER DECISION, RECORDED SO IT IS NOT RE-LITIGATED. The provider's
       Posting, Comments, Messaging, Analytics and Ads endpoints are what
       HARVEST would consume to build this. A church admin never calls one, and
       listing them makes a church product read like a developer product. What
       the page describes is the six things a person in a church office would
       DO. */
    for (const noun of [
      'Posting API', 'Comments API', 'Messaging API', 'Analytics API', 'Ads API',
      'Comment to DM', 'Comment-to-DM',
    ]) {
      expect(pageText, `the page names "${noun}"`).not.toContain(noun);
    }
    expect(pageText).not.toMatch(/\bAPIs?\b/);
    expect(pageText).not.toMatch(/\bendpoints?\b/i);
    expect(pageText).not.toMatch(/\bSDK\b|\bOAuth\b|\bJSON\b|\brate limit\b|\bpayload\b/i);
    expect(entryCopy(entry())).not.toMatch(/\bAPIs?\b|\bendpoints?\b|\bSDK\b/);
  });

  it('🔴 "webhooks" is offered, and said as what a church would SEE', () => {
    /* The capability is on the offered list and is developer language, so it is
       described by its effect rather than by its name. This is the wording, and
       it is asserted rather than left to a reviewer's memory: a later edit that
       reintroduces "webhooks" fails here. */
    const live = CAPABILITIES.find((c) => c.id === 'live');
    expect(live, 'the live-updates capability is gone').toBeDefined();
    expect(live!.name).toBe('Live updates');
    expect(live!.title).toBe('Your dashboard keeps up on its own.');
    expect(live!.body).toMatch(
      /the admin would know at that moment — not the next time a volunteer opens the page and refreshes it/,
    );
    expect(pageText).not.toMatch(/\bweb ?hooks?\b/i);
    expect(pageText).not.toMatch(/\breal-?time events?\b/i);
    // And it is drawn, not merely declared.
    expect(pageText).toContain(live!.title);
  });

  it('the six capabilities are the six that were offered, in church language', () => {
    expect(CAPABILITIES.map((c) => c.id))
      .toEqual(['publishing', 'analytics', 'messaging', 'comments', 'ads', 'live']);
    for (const c of CAPABILITIES) {
      expect(pageText, `"${c.name}" is not drawn`).toContain(c.title);
      expect(pageText, `"${c.name}" has no body`).toContain(c.body);
      for (const b of c.bullets) expect(pageText).toContain(b);
    }
  });

  it('and the per-post settings belong to platforms that are in scope', () => {
    /* TikTok privacy and YouTube titles are the two the founder named, and both
       belong to a platform on the list. An option belonging to one that is NOT
       would name it by implication — which is why these are written by what the
       setting DOES rather than by whose it is. */
    expect(POST_OPTIONS.map((o) => o.id)).toEqual(['privacy', 'titles', 'media', 'queue']);
    for (const o of POST_OPTIONS) {
      expect(pageText, `"${o.title}" is not drawn`).toContain(o.title);
      expect(pageText).toContain(o.body);
    }
    expect(pageText, 'the calendar is not described').toMatch(/month grid|month calendar|A month you can look at/i);
    expect(pageText, 'the queue is not described').toMatch(/queue/i);
    expect(pageText, 'media uploads are not described').toMatch(/uploaded once/i);
  });
});

/* ── 7 ─────────────────────────────────────────────────────────────────────
   No rate, quota or free-tier figure.                                       */
describe('7 — no rate, quota or free-tier figure appears', () => {
  /* Founder: "Do not write rates like first 10000 inbox free. They don't need
     to know that." The provider's per-account bands, its inbox allowance and
     its ad meter are Harvest's cost of goods. ⚠️ The founder circled the Ads
     and Inbox rows on the provider's pricing page — that means OFFER those
     capabilities, which sections 5 and 6 check, not publish their pricing. */
  /* ⚠️ THE COPY, NOT THE MODULE'S SOURCE. The docblock in content/scheduler.ts
     has to be able to NAME what it forbids — "no rates, quotas or free tiers" is
     the instruction, and a sweep that fails on the sentence recording the
     instruction is a sweep that forces the guard to be undocumented. What a
     church reads is swept strictly here; the module's source is held to the
     narrower rule below: it may describe the ban, it may not transcribe a
     figure. */
  const surfaces: [string, string][] = [
    ['the page', pageText],
    ['the entry', entryCopy(entry())],
    ['the copy the module exports', schedulerCopy().join(' ')],
  ];

  it('🔴 and the module that documents the ban transcribes no figure from it', () => {
    const src = read('src/content/scheduler.ts');
    expect(src, 'a price reached the module').not.toMatch(/[$£€]\s?\d/);
    expect(src, 'a "first N" allowance was transcribed').not.toMatch(/\bfirst\s+[\d,]{3,}/i);
    expect(src, 'a per-unit rate was transcribed')
      .not.toMatch(/\b\d[\d,]*\s*(per|each|\/)\s*(account|message|post|ad|month|mo)\b/i);
    expect(src, 'a graduated band was transcribed').not.toMatch(/\b\d+\s*[–-]\s*\d+\b/);
  });

  it.each(surfaces)('%s quotes no allowance and no "first N" figure', (_where, text) => {
    expect(text).not.toMatch(/\bfirst\s+[\d,]+\b/i);
    expect(text).not.toMatch(/\b[\d,]{3,}\s*(messages?|posts?|ads?|accounts?|inbox)\b/i);
    expect(text).not.toMatch(/\bper[- ](account|message|post|ad|call)\b/i);
    expect(text).not.toMatch(/\bunlimited\b/i);
    expect(text).not.toMatch(/\bquota\b|\ballowance\b|\bmetered?\b|\bbilled\b/i);
    expect(text).not.toMatch(/\bfree\b/i);
  });

  it('🔴 and no number that could be read as one reaches the page at all', () => {
    /* The strongest form available: apart from the ordinary words for small
       counts, the rendered page carries no bare figure. A rate cannot hide in
       prose that has no digits in it. */
    const digits = pageText.match(/\d[\d,.]*/g) ?? [];
    expect(digits, `the page prints a figure: ${digits.join(', ')}`).toEqual([]);
  });
});

/* ── 8 ─────────────────────────────────────────────────────────────────────
   The entry, its board card, and the page it links to.                      */
describe('8 — the entry traces to its board card and reaches the page', () => {
  it('the entry exists, is unbuilt, and carries a ref to its card', () => {
    const e = entry();
    expect(e.name).toBe(SCHEDULER_NAME);
    expect(e.name).toBe('Harvest Scheduler');
    /* 🔴 86bbu5q9m — the founder's own card on the Harvest board, at status
       "some day". It is NOT a `THE-` number, and that is a fact about the card
       rather than a lapse here: its `custom_id` is null, so the raw card id is
       the only name it has. Inventing a `THE-` number would have put a
       reference on the site that resolves to nothing. */
    expect(e.ref).toBe('86bbu5q9m');
    expect(e.ref).toBe(SCHEDULER_REF);
    expect(e.ref).toMatch(/^86[a-z0-9]{7}$/);
    expect(e.page).toBe(SCHEDULER_HREF);
  });

  it('🔴 the copy does not imply the work is under way — the card is "some day"', () => {
    /* ⚠️ content/coming-soon.ts's docblock: statuses are the board's own and
       "the copy must not imply otherwise". This card is at "some day", which is
       the coolest state on the board — so the entry gets the same
       "Not built yet · In process" pairing every other entry gets, and nothing
       anywhere says work has begun. */
    /* ⚠️ THE CATEGORY'S OWN NAME IS STRIPPED FIRST. "Coming Soon" is what the
       section is called — it is in the nav, in the eyebrow and on the button
       back to the list — so matching it as an implication would fail on the
       site's own vocabulary. Every other form of "coming soon" still fails. */
    const text = `${entryCopy(entry())} ${pageText}`.split('Coming Soon').join('[category]');
    expect(text).not.toMatch(/\b(we are|we're|currently) (building|working on|developing)\b/i);
    expect(text).not.toMatch(/\b(under|in) (development|construction)\b/i);
    expect(text).not.toMatch(/\b(in progress|being built|work has (begun|started))\b/i);
    expect(text).not.toMatch(/\bcoming (soon|shortly)\b/i);
    expect(text).not.toMatch(/\balmost (there|ready)\b|\bnearly (done|ready)\b/i);
    // The pairing itself, on the page as well as on the block.
    expect(pageText).toContain(NOT_BUILT_LABEL);
    expect(pageText).toContain(IN_PROCESS_LABEL);
    expect(pageText).toContain(SCHEDULER_NOTICE);
  });

  it('it is reachable — on the Coming Soon page, in both mega-menus, and by route', () => {
    expect(soonHtml).toContain('id="scheduler"');
    expect(soonText).toContain(entry().title);
    expect(soonHtml, 'the block does not link to the page').toContain(`href="${SCHEDULER_HREF}"`);
    for (const [where, html] of [['desktop', desktopMenu], ['mobile', mobileMenu]] as const) {
      expect(words(html), `the ${where} menu does not list it`).toContain(SCHEDULER_NAME);
      expect(html, `the ${where} menu does not link to the page`).toContain(`href="${SCHEDULER_HREF}"`);
    }
    expect(blogRoutes(), 'the page would ship as an empty shell').toContain(SCHEDULER_HREF);
  });

  it('🔴 and it is badged SOON, so it never counts as a tool in the platform', () => {
    const soonGroup = CATALOG[0];
    const tool = soonGroup.items.find((i) => i.title === SCHEDULER_NAME);
    expect(tool, 'the entry is missing from the catalogue').toBeDefined();
    expect(tool!.soon, '🔴 it would be counted as a live tool').toBe(true);
    // The derived "N tools in one platform" figure is untouched at 27.
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(soonGroup.items.filter((i) => !i.soon)).toHaveLength(0);
  });

  it('the board card id is never rendered to a visitor', () => {
    expect(pageText, 'a board card id reached the page').not.toMatch(/\b86[a-z0-9]{7}\b/);
    expect(soonText).not.toMatch(/\b86[a-z0-9]{7}\b/);
    expect(pageText).not.toMatch(/THE-\d+/);
    /* Nor a link into the board itself. THE-225 removed the last one and its
       guard (in components/, beside Nav's own tests) forbids naming that board
       tool anywhere in this tree, comments included — so the check here is on
       the URL shape rather than on the product name. */
    expect(pageHtml).not.toMatch(/clickup|app\.[a-z]+\.com\/t\//i);
  });
});

/* ── 9 ─────────────────────────────────────────────────────────────────────
   🔴 The page does not sell a trial.                                        */
describe('9 — the page ends on a note, not on a trial-selling CTA band', () => {
  it('🔴 SiteCTA is not imported, rendered, or reachable from this file', () => {
    /* ComingSoonPage settled this and this page inherits the settlement: the
       band is "Start free trial" and "Compare plans" over a sky ground, both
       pointed at the pricing table. Correct at the end of a page about shipped
       work; false at the end of a page about work that does not exist.
       Asserted against the SOURCE as well as the markup — a component that is
       never imported cannot be rendered back by a later edit without the diff
       showing it. */
    /* ⚠️ COMMENTS STRIPPED FIRST. The header comment in that file explains at
       length WHY the band is absent, and it has to be able to name it to do so
       — the same reason test 7 sweeps the copy rather than the guard's own
       documentation. What is asserted is the code. */
    const code = read('src/pages/SchedulerPage.tsx')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(code, 'SiteCTA was imported or rendered').not.toMatch(/SiteCTA/);
    expect(code, 'the page routes to pricing').not.toMatch(/#pricing/);
    expect(code, 'the page imports the trial CTA label').not.toMatch(/TRIAL_CTA_LABEL/);
    /* And the rendered markup agrees — a component that is never named in the
       code cannot draw the band, but this says so from the other side. */
    expect(pageHtml, 'the trial band was rendered').not.toMatch(/Compare plans|Start free trial/i);
  });

  it('and what it ends on instead is a note, a contact link and the list', () => {
    expect(pageText).toMatch(/Is this the one your church would actually use\?/);
    expect(pageText).toContain('Tell us what you need');
    expect(pageHtml).toContain('href="/contact"');
    expect(pageHtml).toContain(`href="${COMING_SOON_HREF}"`);
    /* 🔴 THE CLOSE RESTATES THE DISCLAIMER. A visitor who has read a page of
       capabilities and reached the bottom is exactly the person most likely to
       have forgotten the first paragraph, so the notice and the status pair are
       both repeated there rather than left in the hero. */
    expect(pageText.slice(pageText.length - 700)).toContain(SCHEDULER_NOTICE);
    expect((pageText.match(new RegExp(NOT_BUILT_LABEL, 'g')) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('the <main> scoping is not a loophole — the site still sells a trial elsewhere', () => {
    /* Passing by deleting the site's sales furniture would be worse than
       failing. The live category pages still carry the band. */
    expect(read('src/components/SiteCTA.tsx')).toMatch(/TRIAL_CTA_LABEL/);
    expect(read('src/pages/CategoryPage.tsx')).toMatch(/<SiteCTA heading=\{cat\.ctaHeading\} \/>/);
  });
});

/* ── 10 ────────────────────────────────────────────────────────────────────
   The page count, and the pages that did not change.                        */
describe('10 — the prerendered page count is 22, and the new page is the only addition', () => {
  const BEFORE = [
    '/', '/pricing', '/features',
    '/features/community-engagement', '/features/discipleship-content',
    '/features/ai-automation', '/features/giving-finance', '/features/platform-brand',
    '/features/coming-soon', '/contact', '/faq', '/terms', '/privacy', '/refunds',
    '/blog', '/blog/category/inside-harvest', '/blog/category/harvest-vs',
    '/blog/category/rooted', '/blog/generosity-without-pressure',
    '/blog/planning-center-alternative-small-churches', '/blog/work-that-outlives-you',
  ];

  it('the list was 21 and is now 22, and the difference is exactly one route', () => {
    const routes = blogRoutes();
    expect(BEFORE).toHaveLength(21);
    expect(routes).toHaveLength(22);
    expect(new Set(routes).size, 'a route is listed twice').toBe(routes.length);
    for (const r of BEFORE) expect(routes, `${r} dropped out of the prerender list`).toContain(r);
    expect(routes.filter((r) => !BEFORE.includes(r))).toEqual([SCHEDULER_HREF]);
  });

  it.runIf(built)('and the build emits 22 files, one per route', () => {
    const pages = distPages().filter(([f]) => f.endsWith('index.html'));
    expect(pages, `this checkout built ${pages.length} pages, not 22`).toHaveLength(22);
    expect(pages.map(([f]) => f)).toContain('features/harvest-scheduler/index.html');
  });

  it.runIf(built)('🔴 and this entry reaches NO other prerendered page', () => {
    /* ⚠️ THE MECHANISM BY WHICH AN EXISTING PAGE COULD HAVE MOVED, checked
       directly rather than only by fingerprint. Adding a coming-soon entry also
       adds an item to CATALOG, which is the Features mega-menu — chrome on
       every page on the site. The menu renders behind React state that nothing
       sets during the prerender, so it is not in the built markup; this is what
       says so, and it is the reason twenty of the twenty-one existing pages are
       byte-identical. The byte-level guard is src/test/the-278-no-regression.
       ts, which records the one page that legitimately moved as an explicit
       delta. */
    const mine = new Set(['features/coming-soon/index.html', 'features/harvest-scheduler/index.html']);
    for (const [file, html] of distPages()) {
      if (mine.has(file)) continue;
      const text = words(html);
      expect(text, `${file} names the entry`).not.toContain(SCHEDULER_NAME);
      expect(text, `${file} carries the entry's nav description`).not.toContain(entry().navDesc);
      expect(html, `${file} links to the new page`).not.toContain(SCHEDULER_HREF);
    }
  });
});

/* ── 11 ────────────────────────────────────────────────────────────────────
   The prices and the add-on catalogue are untouched.                        */
describe('11 — no plan price moved and nothing was added to the add-on catalogue', () => {
  const NINE = {
    plus: { monthly: 20, quarterly: 54, yearly: 190 },
    pro: { monthly: 40, quarterly: 108, yearly: 380 },
    max: { monthly: 80, quarterly: 216, yearly: 760 },
  } as const;

  it('all nine plan prices are exactly what the app charges', () => {
    for (const [planId, terms] of Object.entries(NINE)) {
      const plan = plans.find((p) => p.planId === planId);
      if (plan === undefined) throw new Error(`plan ${planId} vanished from the table`);
      for (const [term, price] of Object.entries(terms)) {
        expect(plan.price[term as keyof Plan['price']], `${planId} ${term}`).toBe(price);
      }
    }
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and the cross-repo contract still THROWS when the two repos disagree', () => {
    const wrong = plans.map((p) =>
      (p.planId === 'pro' ? { ...p, price: { ...p.price, yearly: p.price.yearly + 1 } } : p));
    expect(() => planPriceContract(wrong)).toThrow(/pro/);
  });

  it('🔴 the scheduler was NOT added to the add-on catalogue', () => {
    /* ⚠️ THERE IS NO DODO PRODUCT FOR THIS, and creating one would make it
       purchasable with nothing behind it — the exact defect THE-253 fixed,
       where buying the AI Assistant add-on granted nothing. A price becomes
       possible only once the feature and its Dodo product both exist, and
       neither does. */
    const named = /schedul|social|instagram|tiktok|youtube|facebook|threads|bluesky/i;
    for (const a of ADD_ONS) {
      expect(a.name, `"${a.name}" is an add-on for unbuilt work`).not.toMatch(named);
      expect(a.blurb, `"${a.name}"'s blurb sells unbuilt work`).not.toMatch(named);
    }
    expect(Object.keys(DODO_ADD_ON_CATALOG).filter((k) => named.test(k))).toEqual([]);
    // And the catalogue contract still passes, so nothing unbacked slipped in.
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG)).not.toThrow();
  });
});

/* ── 12 ────────────────────────────────────────────────────────────────────
   No hardcoded colour, and no vendored logo file.                           */
describe('12 — every colour is a token and no logo file was vendored', () => {
  const src = read('src/pages/SchedulerPage.tsx');

  it('🔴 the page declares no hex, rgb or hsl colour of its own', () => {
    /* The ramps live in src/index.css — --gold-*, --navy-*, --sky-*, and the
       three --text-soon greys this page is built from. The site has ONE scope
       and no dark mode, so a literal here is a colour that cannot be retuned
       with the rest of the palette. */
    const hexes = [...src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    /* `#fff` is the one literal the grey pages already use for a card ground,
       in ComingSoonBlock and ComingSoonPage alike. Allowed here for consistency
       with them and for nothing else. */
    expect(hexes.filter((h) => h.toLowerCase() !== '#fff'), `a colour was hardcoded: ${hexes.join(', ')}`).toEqual([]);
    expect(src, 'an rgb() colour was hardcoded').not.toMatch(/\brgb\(/);
    expect(src, 'an hsl() colour was hardcoded').not.toMatch(/\bhsl\(/);
    // The greys it does use are the tokens, read from the stylesheet.
    for (const token of ['--text-soon', '--text-soon-soft', '--text-soon-dark', '--surface-soon']) {
      expect(read('src/index.css'), `${token} is not declared`).toContain(`${token}:`);
    }
  });

  it('🔴 no logo file was added to the repository', () => {
    /* Board card 86bbrgp08: shipping a third party's trademark with no licence,
       on a page under Harvest's name. Every mark this page draws is hotlinked
       through the same resolver the landing page's integrations row already
       uses, and nothing was committed.
     *
     * 🔴 THE ASSET DIRECTORIES ARE PINNED AS A SET, not filtered by name, and
     * the reason is what pinning them turned up. `logos/` and `public/logos/`
     * ALREADY CONTAIN third-party marks that predate this ticket by a long way
     * — instagram.svg, notion.svg, outlook.svg, google-calendar.svg and
     * google-tasks.svg — and not one of them is referenced from `src/` or from
     * `build/`: they are dead files from the design handoff, and
     * instagram.svg is a mark for a platform THIS page lists.
     *
     * ⚠️ THEY ARE NOT THIS TICKET'S TO DELETE, and a name filter would have
     * quietly passed over them while claiming to check exactly this. Pinned as
     * a set, they are visible, they are reported, and — the part that matters
     * here — this ticket demonstrably added none of them. Adding one fails. */
    const listing = (dir: string) => (fs.existsSync(path.join(ROOT, dir))
      ? fs.readdirSync(path.join(ROOT, dir)).sort() : []);
    const PRE_EXISTING = [
      'avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg',
      'google-calendar.svg', 'google-tasks.svg', 'harvest-field.jpg',
      'instagram.svg', 'notion.svg', 'outlook.svg',
    ];
    expect(listing('logos'), 'a file was added to logos/').toEqual(PRE_EXISTING);
    expect(listing('public/logos'), 'a file was added to public/logos/')
      .toEqual([...PRE_EXISTING, 'harvest-mark.png'].sort());
    // And no new image landed under public/features either, where the live
    // category pages keep their screenshots.
    expect(listing('public/features').filter((f) => /instagram|tiktok|youtube|facebook|threads|bluesky|meta|schedul/i.test(f)))
      .toEqual([]);
    expect(src, 'the page references a local image').not.toMatch(/src="\/[^"]*\.(png|svg|webp|jpe?g)"/);
    expect(src, 'logoUrl is not the shared resolver').toMatch(/import \{ logoUrl \} from '\.\.\/components\/Replaces';/);
    // And the resolver still hotlinks rather than reading from disk.
    expect(read('src/components/Replaces.tsx')).toMatch(/https:\/\/cdn\.simpleicons\.org\/\$\{slug\}/);
  });

  it('and no CSS rule was added — index.css is untouched by this ticket', () => {
    /* ⚠️ THE PAGE'S GRIDS ARE `repeat(auto-fit, minmax(…))`, which reflows with
       no media query, precisely so that nothing here had to touch a stylesheet
       whose built output is pinned by hash in the-278's section 6b. */
    expect(src).toMatch(/repeat\(auto-fit, minmax\(268px, 1fr\)\)/);
    expect(src).toMatch(/repeat\(auto-fit, minmax\(240px, 1fr\)\)/);
    expect(read('src/index.css'), 'a rule was added for this page')
      .not.toMatch(/scheduler|destination-chip/i);
  });
});

/* ── 13 ────────────────────────────────────────────────────────────────────
   No horizontal overflow at any measured width.                             */
describe('13 — the page renders at every measured width without overflow', () => {
  /* 🔴 ARITHMETIC, NOT A SCREENSHOT — the idiom this repo already uses in
     components/TermToggle.widths.test.ts and in ComingSoonPage.test.ts. There is
     no DOM and no layout engine in this runner, so nothing here can measure a
     box; what it can do is pin the structural properties that decide whether a
     thing can overflow at all, and compute the room each element gets.

     ⚠️ WIDTH IS NOT MONOTONIC IN VIEWPORT on this site — board card THE-184
     records a 41px overflow found at exactly 1280px, between two passing
     measurements — so every breakpoint is evaluated, not just the extremes. */
  const VIEWPORTS = [380, 768, 1024, 1280, 1440];
  const PAGE_GUTTER = 20;   // `padding: 'clamp(…) 20px'` on every section
  const CONTENT_MAX = 1140; // `maxWidth: 1140` on every wrapper
  const src = read('src/pages/SchedulerPage.tsx');

  const charWidth = (px: number) => px * 0.55;
  /** The longest UNBREAKABLE token, which is what actually decides an overflow
   *  — a multi-word label wraps. */
  const longestWord = (s: string) => Math.max(...s.split(/[\s—/,]+/).map((w) => w.length));

  /** `repeat(auto-fit, minmax(MIN, 1fr))` lays down as many tracks as fit and
   *  wraps the rest, so a track can never be narrower than MIN — and at a
   *  viewport narrower than MIN plus the gutters, it is a single full-width
   *  track rather than an overflow. */
  const trackWidth = (v: number, min: number, gap: number) => {
    const grid = Math.min(CONTENT_MAX, v - PAGE_GUTTER * 2);
    const tracks = Math.max(1, Math.floor((grid + gap) / (min + gap)));
    return (grid - gap * (tracks - 1)) / tracks;
  };

  it('the grids really are auto-fit, so no track can be narrower than its minimum', () => {
    // Guards every calculation below against being derived from a rule that is
    // no longer in the file.
    expect(src).toContain("gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))'");
    expect(src).toContain("gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'");
    // And the one fixed-column grid on the page is the shared collapse class.
    expect(src).toContain('className="fb-grid"');
    const css = read('src/index.css');
    const block = css.slice(css.indexOf('@media (max-width: 900px)'));
    expect(block.slice(0, block.indexOf('\n}')), 'fb-grid no longer collapses at 900px')
      .toContain('.fb-grid');
  });

  it.each(VIEWPORTS)('a capability card fits its longest word at %ipx', (v) => {
    // 268px minimum, clamp gap at its widest (22px), less the card's own
    // clamp padding at its widest (28px a side).
    const room = trackWidth(v, 268, 22) - 28 * 2;
    const widest = Math.max(
      ...CAPABILITIES.flatMap((c) => [c.title, c.name, ...c.bullets].map(longestWord)),
    ) * charWidth(14);
    expect(room, `the widest word (~${widest.toFixed(0)}px) does not fit a ${room.toFixed(0)}px card`)
      .toBeGreaterThan(widest);
  });

  it.each(VIEWPORTS)('a per-post option card fits its longest word at %ipx', (v) => {
    /* ⚠️ THE OPTION GRID SITS INSIDE THE `fb-grid` COLUMN, so above 900px it
       gets the wider half of a two-column split rather than the whole page.
       Measured against that, not against the viewport, which is where a naive
       calculation would have said it fits. */
    const outer = Math.min(CONTENT_MAX, v - PAGE_GUTTER * 2);
    const column = v > 900 ? (outer - 52) * (1.1 / 2) : outer;
    const gap = 18;
    const tracks = Math.max(1, Math.floor((column + gap) / (240 + gap)));
    const room = (column - gap * (tracks - 1)) / tracks - 20 * 2;
    const widest = Math.max(
      ...POST_OPTIONS.flatMap((o) => [o.title, o.body].map(longestWord)),
    ) * charWidth(13.5);
    expect(room, `the widest word (~${widest.toFixed(0)}px) does not fit a ${room.toFixed(0)}px card`)
      .toBeGreaterThan(widest);
  });

  it.each(VIEWPORTS)('the destination chips wrap rather than push the page sideways at %ipx', (v) => {
    /* The chips are a wrapping flex row, so the binding case is the WIDEST
       SINGLE CHIP against the narrowest content box — 340px at 380px, less the
       chip's own 16px-a-side padding and its 18px mark plus 9px gap. */
    const room = Math.min(CONTENT_MAX, v - PAGE_GUTTER * 2) - 16 * 2 - 18 - 9;
    const widest = Math.max(...[...PLATFORMS, ...AD_NETWORKS].map((d) => longestWord(d.name))) * charWidth(14);
    expect(room, `the widest chip (~${widest.toFixed(0)}px) does not fit ${room.toFixed(0)}px`)
      .toBeGreaterThan(widest);
    expect(src, 'the chip row does not wrap').toContain("flexWrap: 'wrap'");
  });

  it('reports the measured capability-card room at every width', () => {
    /* The five figures this change is reported with.
     *
     * ⚠️ 1280px IS THE BINDING CASE, NOT 380px, AND THIS IS WHY EVERY WIDTH IS
     * EVALUATED. Room does not grow with the viewport: at 380 the grid is one
     * full-width track and a card gets 284px, and at 1280 three tracks fit and a
     * card gets 213px. The phone is the roomiest measurement on the page. Board
     * card THE-184 records the same shape — a 41px overflow found at exactly
     * 1280px, between two passing measurements — which is the reason this suite
     * checks five widths rather than the two extremes. */
    expect(Object.fromEntries(VIEWPORTS.map((v) => [v, Math.round(trackWidth(v, 268, 22) - 56)])))
      .toEqual({ 380: 284, 768: 297, 1024: 257, 1280: 213, 1440: 213 });
  });

  it('🔴 nothing on the page declares a fixed width that could exceed the narrowest content box', () => {
    /* The mechanical half. Every container is a `max-width` plus a fluid child;
       a `width:NNNpx` on anything large is how a card starts pushing the page
       sideways. At 380px the narrowest content box is 340px. */
    const fixed = [...pageHtml.matchAll(/(?<!max-|min-)\bwidth:(\d+(?:\.\d+)?)px/g)]
      .map((m) => Number(m[1]))
      .filter((w) => w > 60);
    expect(fixed, `a fixed width over 60px is declared: ${fixed.join(', ')}`).toEqual([]);

    // And every max-width is either the content column or the sketch frame.
    const maxes = [...new Set([...pageHtml.matchAll(/max-width:(\d+)px/g)].map((m) => Number(m[1])))]
      .sort((a, b) => a - b);
    expect(maxes.every((w) => w <= CONTENT_MAX), `a max-width exceeds ${CONTENT_MAX}px: ${maxes.join(', ')}`).toBe(true);
  });

  it('and no section can scroll sideways by construction', () => {
    // No nowrap on anything that carries copy, and no fixed-track grid outside
    // the one that collapses at 900px.
    expect((src.match(/whiteSpace: 'nowrap'/g) ?? []).length, 'a copy element was set to nowrap')
      .toBeLessThanOrEqual(1);
    const fixedGrids = [...src.matchAll(/gridTemplateColumns: '([^']*)'/g)].map((m) => m[1]);
    for (const g of fixedGrids) {
      expect(g === '0.9fr 1.1fr' || g.startsWith('repeat(auto-fit'), `"${g}" cannot reflow`).toBe(true);
    }
  });
});
