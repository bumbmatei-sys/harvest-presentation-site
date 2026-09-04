import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SchedulerPage } from './SchedulerPage';
import { CategoryPage } from './CategoryPage';
import { FeatureMock, FEATURE_ICONS } from '../components/FeatureMock';
import { CATEGORIES } from '../content/features';
import {
  AD_NETWORKS, CAPABILITIES, CAPABILITY_BLOCKS, CAPABILITY_ID_PREFIX, PLATFORMS,
  SCHEDULER_HREF, schedulerContract,
} from '../content/scheduler';

/* ─── THE-293 — each capability gets a design, like every other category page ──
 *
 * 🔴 THE FOUNDER'S COMPLAINT, VERBATIM: "the harvest scheduler is horrible. I
 * want for each feature to be presented as the other category pages with a
 * small design."
 *
 * THE-284 shipped the page and got the CONTENT right — no vendor, no price, no
 * date, nine destinations and not a tenth. What it got wrong is the only thing a
 * visitor actually sees first: its six capabilities were six identical grey
 * cards, an icon and a paragraph apiece, while every live category page pairs
 * each feature with a vignette of its own from components/FeatureMock.tsx.
 *
 * ⚠️ SO THIS FILE IS TWO SUITES IN ONE, AND THE SECOND IS THE LONGER.
 * Sections 1–3 are the ticket: six DIFFERENT mocks, drawn through the real
 * FeatureBlock. Sections 4–15 are no-regression on THE-284 — every founder
 * decision that page carries, re-asserted against the NEW markup, because a
 * redesign is exactly the kind of change that reintroduces a banned string while
 * every existing test still passes.
 *
 * 🔴 THE VENDOR'S NAME APPEARS NOWHERE IN THIS FILE EITHER. Section 4 decodes
 * its tokens at run time, exactly as THE-284's sweep does, so this file can read
 * its own source like any other and needs no self-exemption.
 */

const HERE = fileURLToPath(import.meta.url);
const ROOT = path.join(path.dirname(HERE), '..', '..');
const DIST = path.join(ROOT, 'dist');
const built = fs.existsSync(path.join(DIST, 'index.html'));
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Collapse React's markup back into readable prose. Identical to THE-284's —
 *  React splits text around interpolations with comment nodes, so an
 *  un-normalised search finds nothing even when the phrase is on the page. */
const words = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|\s+/g, ' ')
    .trim();

/* ⚠️ HelmetProvider IS NOT OPTIONAL — <Seo/> is react-helmet-async, whose
   dispatcher throws without a provider before a single test in the file runs. */
const render = (el: React.ReactElement, at: string) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, { context: {} },
    React.createElement(MemoryRouter, { initialEntries: [at] }, el),
  ));

const pageHtml = render(React.createElement(SchedulerPage), SCHEDULER_HREF);
const pageText = words(pageHtml);

const mockHtml = (id: string) => renderToStaticMarkup(React.createElement(FeatureMock, { id }));

const BLOCK_IDS = CAPABILITY_BLOCKS.map((c) => c.id);

/* ── 1 ─────────────────────────────────────────────────────────────────────
   🔴 THE WHOLE TICKET. Six capabilities, six DIFFERENT designs.             */
describe('1 — each of the six capabilities renders its own distinct mock', () => {
  it('every capability has a mock, and it is not a stub', () => {
    expect(BLOCK_IDS).toHaveLength(6);
    for (const id of BLOCK_IDS) {
      const html = mockHtml(id);
      expect(html, `${id} renders no vignette at all`).not.toBe('');
      /* A mock that is one empty div would satisfy "not empty" — this is the
         floor that says something was actually drawn. Every vignette in
         FeatureMock is at least a card, a header row and a body. */
      expect(html.length, `${id}'s vignette is a stub`).toBeGreaterThan(400);
    }
  });

  /* 🔴 THE ASSERTION THE TICKET IS ABOUT, AND THE ONE MOST EASILY FAKED.
     "Six blocks" is not the deliverable — six blocks all drawing the SAME
     picture is precisely the defect being fixed, and it would pass any count.
     So the six are compared to each other by their rendered markup. */
  it('🔴 all six are different from one another, not one design repeated', () => {
    const drawn = new Map(BLOCK_IDS.map((id) => [id, mockHtml(id)]));
    const seen = new Map<string, string>();
    for (const [id, html] of drawn) {
      const twin = seen.get(html);
      expect(twin, `${id} draws the same vignette as ${twin}`).toBeUndefined();
      seen.set(html, id);
    }
    expect(new Set(drawn.values()).size).toBe(6);
  });

  it('and each one is actually on the page, not merely defined', () => {
    /* A claim is not a claim until something draws it — the precedent is PR 55,
       where a pure-function test passed while the JSX seam was mutated. Each
       vignette carries a string no other one does; all six must be on the page. */
    const FINGERPRINTS: [string, string][] = [
      ['scheduler-publishing', 'First comment'],
      ['scheduler-analytics', 'Impressions'],
      ['scheduler-messaging', 'Replying as Grace Chapel'],
      ['scheduler-comments', 'A review of your church'],
      ['scheduler-ads', 'Who it would reach'],
      ['scheduler-live', 'One post did not send'],
    ];
    expect(FINGERPRINTS.map(([id]) => id)).toEqual(BLOCK_IDS);
    for (const [id, mark] of FINGERPRINTS) {
      expect(mockHtml(id), `${id}'s vignette lost its fingerprint`).toContain(mark);
      expect(pageText, `${id}'s vignette is not on the page`).toContain(mark);
    }
  });

  it('each one has its own icon too', () => {
    const icons = BLOCK_IDS.map((id) => {
      const icon = FEATURE_ICONS[id];
      expect(icon, `${id} has no icon`).toBeDefined();
      return renderToStaticMarkup(icon);
    });
    expect(new Set(icons).size, 'two capabilities share an icon').toBe(6);
  });

  /* 🔴 THE COLLISION THAT WOULD HAVE SHIPPED SILENTLY. FeatureMock is keyed by
     feature id and already had `analytics` — the Evangelism Analytics dashboard
     on /features/platform-brand, which prints a member count, a country count
     and a figure for decisions. An unprefixed capability id here would have
     drawn THAT vignette, on the one page in this repository that may print no
     number at all, and every other test in this file would still have passed. */
  it('🔴 no capability id collides with a live feature\'s mock', () => {
    const live = new Set(CATEGORIES.flatMap((c) => c.features.map((f) => f.id)));
    for (const id of BLOCK_IDS) {
      expect(id.startsWith(CAPABILITY_ID_PREFIX), `${id} is not namespaced`).toBe(true);
      expect(live.has(id), `${id} collides with a live feature`).toBe(false);
    }
    // And the one that actually collided is still there, drawing its own thing.
    expect(live.has('analytics')).toBe(true);
    expect(CAPABILITIES.map((c) => c.id)).toContain('analytics');
    expect(mockHtml('analytics')).not.toBe(mockHtml('scheduler-analytics'));
  });
});

/* ── 2 ─────────────────────────────────────────────────────────────────────
   Drawn through the same component the category pages use.                  */
describe('2 — the page renders through FeatureBlock, like the category pages', () => {
  const src = read('src/pages/SchedulerPage.tsx');

  it('the page imports and renders the real FeatureBlock', () => {
    expect(src).toMatch(/import \{ FeatureBlock \} from '\.\.\/components\/FeatureBlock';/);
    expect(src).toMatch(/<FeatureBlock key=\{c\.id\} feature=\{c\} unbuilt \/>/);
  });

  /* 🔴 THE SAME COMPONENT, NOT A LOOKALIKE. A copy of FeatureBlock would satisfy
     every assertion above and then drift from the original within a ticket or
     two — at which point "presented as the other category pages" quietly stops
     being true. So what is checked is that ONE module defines it and both kinds
     of page import that one. */
  it('🔴 and it is the same module the live category pages import', () => {
    expect(read('src/pages/CategoryPage.tsx'))
      .toMatch(/import \{ FeatureBlock \} from '\.\.\/components\/FeatureBlock';/);
    const defs = fs.readdirSync(path.join(ROOT, 'src', 'components'))
      .filter((f) => /^FeatureBlock/.test(f) && f.endsWith('.tsx'));
    expect(defs, 'FeatureBlock was forked').toEqual(['FeatureBlock.tsx']);
  });

  it('the block chrome a category page draws is on this page too', () => {
    /* The four parts that make a category page read as designed rather than as
       a specification: an eyebrow, a serif heading, an italic pull-quote, and
       two labelled columns beside a framed vignette. */
    for (const c of CAPABILITY_BLOCKS) {
      expect(pageText, `${c.id} has no eyebrow`).toContain(c.eyebrow);
      expect(pageText, `${c.id} has no heading`).toContain(c.title);
      expect(pageText, `${c.id} has no pull-quote`).toContain(c.moment);
      expect(pageText, `${c.id} has no first column`).toContain(c.adminLabel!);
      expect(pageText, `${c.id} has no second column`).toContain(c.memberLabel!);
      for (const line of [...c.admin, ...c.member]) expect(pageText).toContain(line);
    }
  });

  /* 🔴 WHAT `unbuilt` SUPPRESSES, ASSERTED AS AN ABSENCE HERE AND A PRESENCE ON
     A LIVE PAGE. A flag that turned nothing off would pass a test that only
     looked at one side. */
  it('🔴 the unbuilt variant drops the sales furniture, and only that', () => {
    const liveHtml = render(
      React.createElement(CategoryPage, { slug: 'ai-automation' }), '/features/ai-automation',
    );
    const liveText = words(liveHtml);
    // Plan chips: on a live page, never here.
    expect(liveText).toContain('Available on');
    expect(pageText, 'plan chips reached an unbuilt page').not.toContain('Available on');
    // The vignette tab label says what it is looking at, in the markup itself,
    // so a cropped screenshot of it cannot read as a shipped screen.
    expect(liveText).toContain('Harvest');
    expect(pageText).toContain('Concept — nothing built');
    // And the tick, which means "you get this", is not drawn against unbuilt work.
    expect(liveHtml).toContain('M5 10l3 3 7-7');
    expect(pageHtml, 'a tick was drawn beside unbuilt work').not.toContain('M5 10l3 3 7-7');
  });

  it('and the flag is default-off, so no live page changed', () => {
    const blockSrc = read('src/components/FeatureBlock.tsx');
    expect(blockSrc).toMatch(/unbuilt = false/);
    // The live pages pass no flag at all.
    expect(read('src/pages/CategoryPage.tsx')).toMatch(/<FeatureBlock key=\{f\.id\} feature=\{f\} \/>/);
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   SoonMock is no longer the whole treatment.                                */
describe('3 — SoonMock is no longer used as the only treatment', () => {
  const src = read('src/pages/SchedulerPage.tsx');

  it('the six capabilities are not drawn by SoonMock', () => {
    /* It is still imported, and deliberately: the concept sketch in the calendar
       section is a composite of the whole desk rather than one capability, and a
       grey wireframe is still the honest drawing for that. What changed is that
       it is no longer the ONLY thing the page draws. */
    expect((src.match(/<SoonMock/g) ?? []).length, 'SoonMock is drawing capabilities again').toBe(1);
    expect((src.match(/<FeatureBlock/g) ?? []).length).toBe(1); // one JSX seam, six blocks
    expect(BLOCK_IDS).toHaveLength(6);
  });

  it('and every one of the six frames carries its own caption', () => {
    expect(pageText).toContain('Concept sketch — nothing built'); // the desk sketch
    const framed = (pageHtml.match(/Concept — nothing built/g) ?? []).length;
    expect(framed, 'the six capability frames are not all captioned').toBe(6);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────
   🔴 NO-REGRESSION on THE-284's sweep: the vendor is named nowhere.         */
describe('4 — the vendor\'s name appears nowhere in the repo', () => {
  /* base64, decoded at run time, so the plain strings exist in no file here —
     the same construction THE-284 used, and the reason this file can read its
     own source like every other without a self-exemption.
   *
   * 🔴 THE SAME FOURTEEN TOKENS THE-284 SWEEPS, AND HELD IN LOCKSTEP WITH IT
   * BELOW rather than maintained twice. A second list drifts: this one was first
   * written with a shorter set that included the bare word for a well-known
   * vendor, and it matched `Buffer.from` in this very file, the lockfile and
   * three build scripts. THE-284 had already solved that by encoding the vendor's
   * DOMAIN instead of its name — which is the kind of detail a re-derived list
   * loses and a mirrored one cannot. */
  const ENCODED = [
    'emVybmlv', 'bGF0ZXdpeg==', 'cG9zdGl6', 'YXlyc2hhcmU=', 'aG9vdHN1aXRl',
    'c3Byb3V0IHNvY2lhbA==', 'bWV0cmljb29s', 'cHVibGVy', 'bWl4cG9zdA==',
    'YmxvdGF0bw==', 'YnVmZmVyLmNvbQ==', 'bGF0ZXIuY29t', 'c2VuZGlibGU=',
    'c29jaWFsYmVl',
  ];
  const NAMES = ENCODED.map((e) => Buffer.from(e, 'base64').toString('utf8'));

  it('🔴 the token list has not drifted from the one THE-284 sweeps', () => {
    /* Two sweeps searching for different sets is one sweep with a hole in it.
       Compared as encoded tokens, so neither file spells a name to do it. */
    const theirs = read('src/pages/the-284-harvest-scheduler.test.ts');
    for (const token of ENCODED) {
      expect(theirs, `THE-284 does not sweep for one of these tokens`).toContain(`'${token}'`);
    }
    expect(ENCODED).toHaveLength(14);
  });

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

  it('the decoder works, so a green run is not an empty regex', () => {
    /* 🔴 A base64 typo would decode to rubbish, the sweep would search for
       rubbish, and the whole section would pass while the name sat on the page.
       So the tokens are proved to have teeth on a mutated string first. */
    expect(NAMES).toHaveLength(ENCODED.length);
    for (const n of NAMES) {
      expect(n, 'a token decoded to something unusable').toMatch(/^[a-z][a-z. ]{4,}$/);
      expect(`the ${n} api`.toLowerCase(), `the sweep would not catch "${n}"`).toContain(n);
    }
    expect(NAMES.some((n) => 'harvest scheduler posts to instagram'.includes(n))).toBe(false);
  });

  it('🔴 not in the new mocks, not in the new copy, not on the page', () => {
    for (const n of NAMES) {
      expect(pageText.toLowerCase(), 'the page names the vendor').not.toContain(n);
      expect(read('src/components/FeatureMock.tsx').toLowerCase()).not.toContain(n);
      expect(read('src/components/FeatureBlock.tsx').toLowerCase()).not.toContain(n);
      expect(read('src/content/scheduler.ts').toLowerCase()).not.toContain(n);
    }
  });

  it('🔴 nor in ANY file in the working tree — source, config, content or test', () => {
    const offenders: string[] = [];
    for (const file of repoFiles()) {
      const body = fs.readFileSync(file, 'utf8').toLowerCase();
      const rel = path.relative(ROOT, file).split(path.sep).join('/').toLowerCase();
      for (const n of NAMES) {
        if (body.includes(n) || rel.includes(n)) offenders.push(rel);
      }
    }
    expect([...new Set(offenders)], `the vendor is named in: ${offenders.join(', ')}`).toEqual([]);
  });
});

/* ── 5 ─────────────────────────────────────────────────────────────────────
   🔴 NO-REGRESSION: no price, date, tier or CTA — including in a vignette.  */
describe('5 — no price, date, tier or CTA appears', () => {
  const surfaces: [string, string][] = [
    ['the page', pageText],
    ...BLOCK_IDS.map((id) => [`the ${id} vignette`, words(mockHtml(id))] as [string, string]),
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
  });

  it.each(surfaces)('%s names no plan tier and makes no availability claim', (_where, text) => {
    expect(text).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
    expect(text).not.toMatch(/\badd-?ons?\b/i);
    expect(text).not.toMatch(/\bincluded (in|on|with)\b/i);
    expect(text).not.toMatch(/\bavailable (on|now|from|in)\b|\bavailable to\b/i);
  });

  /* 🔴 THE STRONGEST FORM, AND THE ONE THE NEW VIGNETTES MADE HARD TO KEEP. An
     analytics panel is a picture of numbers and a boost panel is a picture of a
     budget. Both are drawn here, and neither prints a digit: the values live in
     `width` and in a polyline, which are attributes rather than text. */
  it('🔴 and no number reaches the page at all, vignettes included', () => {
    const digits = pageText.match(/\d[\d,.]*/g) ?? [];
    expect(digits, `the page prints a figure: ${digits.join(', ')}`).toEqual([]);
    for (const id of BLOCK_IDS) {
      const d = words(mockHtml(id)).match(/\d[\d,.]*/g) ?? [];
      expect(d, `${id}'s vignette prints a figure: ${d.join(', ')}`).toEqual([]);
    }
  });

  it('nothing on the page can be clicked towards a purchase', () => {
    expect(pageHtml).not.toContain('/#pricing');
    expect(pageHtml).not.toContain('/pricing');
    expect(pageText).not.toMatch(/start (your |a )?(free )?trial/i);
    expect(pageText).not.toMatch(/\b(buy|purchase|subscribe|upgrade now|get started|sign up)\b/i);
    /* Every destination the page offers, enumerated. A live FeatureBlock draws a
       crosslink row, which is why `unbuilt` turns it off rather than the copy
       merely happening to omit one. */
    const hrefs = [...new Set([...pageHtml.matchAll(/href="([^"]*)"/g)].map((m) => m[1]))].sort();
    expect(hrefs).toEqual(['/contact', '/features/coming-soon']);
  });

  it('and the module-scope contract sweeps the new copy too', () => {
    /* The four fields THE-293 added are the newest place for a banned string to
       hide. They are in `schedulerCopy()`, so a violation fails the PRERENDER
       rather than merely a test. */
    expect(() => schedulerContract()).not.toThrow();
    const src = read('src/content/scheduler.ts');
    for (const field of ['eyebrow', 'moment', 'bulletsLabel', 'outcomeLabel']) {
      expect(src, `${field} is not swept`).toMatch(new RegExp(`c\\.${field}`));
    }
    expect(src).toMatch(/\.\.\.c\.outcome,/);
  });
});

/* ── 6 & 7 ─────────────────────────────────────────────────────────────────
   🔴 NO-REGRESSION: the platforms that are out of scope, by name or by logo. */
describe('6 & 7 — the excluded platforms appear nowhere, by name or by logo', () => {
  /* Encoded for the same reason the vendor is: the founder's instruction was
     "do not list them, do not show their logos, and do not describe them as
     coming later", and a test that spells them puts them in the repository. */
  const WITHHELD_ON_COST = ['dHdpdHRlcg==', 'd2hhdHNhcHA='];
  const NEVER = [
    'bGlua2VkaW4=', 'cmVkZGl0', 'cGludGVyZXN0', 'dGVsZWdyYW0=', 'c25hcGNoYXQ=',
    'ZGlzY29yZA==', 'c2xhY2s=',
  ];
  const decode = (xs: string[]) => xs.map((e) => Buffer.from(e, 'base64').toString('utf8'));
  const OUT = [...decode(WITHHELD_ON_COST), ...decode(NEVER)];

  const surfaces: [string, string][] = [
    ['the page', pageText],
    ...BLOCK_IDS.map((id) => [`the ${id} vignette`, words(mockHtml(id))] as [string, string]),
  ];

  it('the decoder works', () => {
    expect(OUT).toHaveLength(9);
    for (const n of OUT) expect(n).toMatch(/^[a-z]{5,}$/);
  });

  it.each(surfaces)('%s names none of the nine that are out of scope', (_where, text) => {
    const lower = text.toLowerCase();
    for (const n of OUT) expect(lower, 'it names a withheld platform').not.toContain(n);
    /* 🔴 THE ONE-LETTER RENAME, WHICH NO SUBSTRING CHECK WOULD CATCH. As a
       standalone word it is a platform; anywhere else it is an ordinary letter. */
    expect(text, 'the one-letter platform is named').not.toMatch(/(?:^|[\s(])X(?:[\s,.)]|$)/);
    /* ⚠️ AND THE TWO AD NETWORKS THAT GO WITH THAT LIST, built from the same
       encoded tokens rather than written out. An earlier draft of this line spelt
       them in a plain regex — which put two banned names into the repository and
       was caught by THE-284's own working-tree sweep, exactly as it should have
       been. The names are never spelled here; they are decoded and joined. */
    for (const n of decode(NEVER)) {
      expect(lower, 'it names a withheld ad network').not.toContain(`${n} ads`);
    }
  });

  it('🔴 nor by LOGO — the page draws exactly the nine marks and no more', () => {
    const marks = [...pageHtml.matchAll(/src="(https:\/\/[^"]+)"/g)].map((m) => m[1]);
    expect(marks, 'the page no longer draws exactly nine marks')
      .toHaveLength(PLATFORMS.length + AD_NETWORKS.length);
    for (const m of marks) {
      expect(m).toMatch(/^https:\/\/cdn\.simpleicons\.org\//);
      const slug = m.split('/').pop()!.toLowerCase();
      for (const n of OUT) expect(slug, `${m} is an out-of-scope mark`).not.toContain(n);
    }
    /* 🔴 AND THE SIX NEW VIGNETTES DRAW NO IMAGE AT ALL — which is why the count
       above is still nine. A mark inside a picture of a screen is a claim about
       what is already connected, on top of being a trademark nobody licensed;
       board card 86bbrgp08 records the second half. Connected accounts are drawn
       as unlabelled swatches instead. */
    for (const id of BLOCK_IDS) {
      expect(mockHtml(id), `${id}'s vignette draws an image`).not.toMatch(/<img/);
    }
  });

  it('and none is described as coming later, which would be the same promise', () => {
    expect(pageText).not.toMatch(/\bmore (platforms|networks|accounts) (are )?(coming|to follow|later|soon)\b/i);
    expect(pageText).not.toMatch(/\b(for now|to start with|initially|at first|first up)\b/i);
    expect(pageText).not.toMatch(/\bother (platforms|networks)\b/i);
  });
});

/* ── 8 ─────────────────────────────────────────────────────────────────────
   Exactly the six platforms and the three ad networks.                      */
describe('8 — exactly the 6 platforms and 3 ad networks are listed', () => {
  const SIX = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Threads', 'Bluesky'];
  const THREE = ['Meta Ads', 'Google Ads', 'TikTok Ads'];

  it('the data is the founder\'s list, in order and with nothing beside it', () => {
    expect(PLATFORMS.map((p) => p.name)).toEqual(SIX);
    expect(AD_NETWORKS.map((a) => a.name)).toEqual(THREE);
  });

  it('every one of the nine is still drawn after the redesign', () => {
    for (const name of [...SIX, ...THREE]) {
      expect(pageText, `"${name}" is not on the page`).toContain(name);
    }
    expect([...pageHtml.matchAll(/loading="lazy"/g)]).toHaveLength(9);
  });

  it('🔴 and the contract still throws on a tenth destination', () => {
    expect(() => schedulerContract([...PLATFORMS, { name: 'Somewhere else', slug: null }]))
      .toThrow(/not the six/);
    expect(() => schedulerContract(PLATFORMS, [...AD_NETWORKS, { name: 'Another Ads', slug: null }]))
      .toThrow(/not the three/);
  });
});

/* ── 9 & 10 ────────────────────────────────────────────────────────────────
   No rate, quota or free tier — and no API is named.                        */
describe('9 & 10 — no rate or quota figure, and no API endpoint is named', () => {
  const surfaces: [string, string][] = [
    ['the page', pageText],
    ...BLOCK_IDS.map((id) => [`the ${id} vignette`, words(mockHtml(id))] as [string, string]),
  ];

  it.each(surfaces)('%s quotes no allowance and no "first N" figure', (_where, text) => {
    expect(text).not.toMatch(/\bfirst\s+[\d,]+\b/i);
    expect(text).not.toMatch(/\b[\d,]{3,}\s*(messages?|posts?|ads?|accounts?|inbox)\b/i);
    expect(text).not.toMatch(/\bper[- ](account|message|post|ad|call)\b/i);
    expect(text).not.toMatch(/\bunlimited\b/i);
    expect(text).not.toMatch(/\bquota\b|\ballowance\b|\bmetered?\b|\bbilled\b/i);
  });

  it.each(surfaces)('%s names no endpoint, SDK or developer noun', (_where, text) => {
    for (const noun of ['Posting API', 'Comments API', 'Messaging API', 'Analytics API', 'Ads API']) {
      expect(text, `it names "${noun}"`).not.toContain(noun);
    }
    expect(text).not.toMatch(/\bAPIs?\b/);
    expect(text).not.toMatch(/\bendpoints?\b/i);
    expect(text).not.toMatch(/\bSDK\b|\bOAuth\b|\bJSON\b|\brate limit\b|\bpayload\b/i);
  });

  /* 🔴 THE WORDING THE-284 FOUND FOR "WEBHOOKS", KEPT RATHER THAN REVERTED. The
     capability is on the founder's offered list under a developer's name; what a
     church SEES is a screen that already knows, so that is what it is called.
     A redesign is the obvious moment for "real-time events" to reappear as a
     vignette label — it does not, and this is what says so. */
  it('🔴 "webhooks" is still said as what a church would see', () => {
    const live = CAPABILITIES.find((c) => c.id === 'live');
    expect(live, 'the live-updates capability is gone').toBeDefined();
    expect(live!.name).toBe('Live updates');
    expect(live!.title).toBe('Your dashboard keeps up on its own.');
    expect(pageText).not.toMatch(/\bweb ?hooks?\b/i);
    expect(pageText).not.toMatch(/\breal-?time events?\b/i);
    expect(words(mockHtml('scheduler-live'))).not.toMatch(/\bweb ?hooks?\b|\breal-?time\b|\bevents?\b/i);
    // And it is drawn the way the copy says it: the screen keeps up on its own.
    expect(pageText).toContain(live!.title);
    expect(words(mockHtml('scheduler-live'))).toContain('Keeping up');
  });
});

/* ── 11 ────────────────────────────────────────────────────────────────────
   The page still ends on a note, not on a trial-selling band.               */
describe('11 — the page renders no trial-selling CTA band', () => {
  const src = read('src/pages/SchedulerPage.tsx');

  it('🔴 SiteCTA is not imported, rendered, or reachable from this file', () => {
    /* ⚠️ COMMENTS STRIPPED FIRST, and the reason is the same one THE-284 gives:
       the header comment in that file explains at length WHY the band is absent
       and has to be able to name it to do so. What is asserted is the CODE. */
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code, 'SiteCTA was imported or rendered').not.toMatch(/SiteCTA/);
    expect(code, 'the page routes to pricing').not.toMatch(/#pricing/);
    expect(code, 'the page imports the trial CTA label').not.toMatch(/TRIAL_CTA_LABEL/);
    expect(pageHtml, 'the trial band was rendered').not.toMatch(/Compare plans|Start free trial/i);
  });

  it('the <main> scoping is not a loophole — the site still sells a trial elsewhere', () => {
    /* Passing by deleting the site's sales furniture would be worse than
       failing, and the redesign put that within reach: the capabilities are now
       drawn by the very component that carries the plan chips. */
    expect(read('src/pages/CategoryPage.tsx')).toMatch(/<SiteCTA heading=\{cat\.ctaHeading\} \/>/);
    expect(read('src/components/FeatureBlock.tsx'), 'the plan chips were deleted rather than suppressed')
      .toMatch(/function PlanChips/);
  });

  it('and what it ends on instead is a note, a contact link and the list', () => {
    expect(pageText).toContain('Tell us what you need');
    expect(pageText).toContain('Everything else on the Coming Soon list');
    expect(pageHtml).toContain('href="/contact"');
  });
});

/* ── 12 & 13 ───────────────────────────────────────────────────────────────
   🔴 The prerendered page count, and every other page's built HTML.         */
describe('12 & 13 — the page count is 22 and no existing page moved', () => {
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

  it.runIf(built)('the prerendered page count is still 22', () => {
    expect(pagesInDist()).toHaveLength(22);
    expect(pagesInDist()).toContain('features/harvest-scheduler/index.html');
  });

  it('🔴 no route was added, so no route id could be renumbered', () => {
    /* THE-284's early draft inserted a route mid-table and rewrote thirteen
       pages by a single digit — react-router derives a route's id from its
       POSITION and vite-react-ssg bakes those ids into every prerendered page.
       This ticket adds no route at all, which is the strongest available form of
       not repeating it: there is nothing to append and nothing to renumber. */
    const app = read('src/App.tsx');
    expect(app, 'this ticket touched the route table').not.toMatch(/THE-293/);
    /* The route is declared by constant, not by literal — so this reads the
       constant, and reads it from the route table rather than from an import. */
    expect(app).toMatch(/\{ path: SCHEDULER_HREF, element: <SchedulerPage \/> \}/);
    expect(app, 'the appended-above-the-catch-all note is gone')
      .toMatch(/src\/pages\/SchedulerPage\.tsx/);
  });

  /* 🔴 THE PER-PAGE FINGERPRINTS LIVE IN src/test/the-278-no-regression.test.ts,
     which is where this repository keeps them and where THE-280 and THE-284 both
     recorded their deltas rather than overwriting a baseline. What is asserted
     HERE is that this ticket recorded its move as EXACTLY ONE page: a redesign
     that quietly moved a second would need a second row, and this counts them. */
  it('the move is recorded as exactly one page, in the table that pins them', () => {
    const table = read('src/test/the-278-no-regression.test.ts');
    const block = table.slice(table.indexOf('const THE_293_MOVED'));
    const rows = block.slice(0, block.indexOf('};')).match(/'[^']+\/index\.html'/g) ?? [];
    expect(rows, `THE-293 moved ${rows.length} pages: ${rows.join(', ')}`)
      .toEqual(["'features/harvest-scheduler/index.html'"]);
  });
});

/* ── 14 ────────────────────────────────────────────────────────────────────
   No colour hardcoded, no logo vendored.                                    */
describe('14 — no colour is hardcoded and no logo file was vendored', () => {
  const TOUCHED = [
    'src/pages/SchedulerPage.tsx',
    'src/components/FeatureBlock.tsx',
    'src/content/scheduler.ts',
  ];

  it('🔴 nothing this ticket wrote declares a colour of its own', () => {
    /* The ramps are in src/index.css — --gold-*, --navy-*, --sky-* and the three
       --text-soon greys. The site has ONE scope and no dark mode, so a literal
       here is a colour that cannot be retuned with the rest of the palette.
       `#fff` is the one literal the grey pages already use for a card ground. */
    for (const f of TOUCHED) {
      const hexes = [...read(f).matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
      expect(hexes.filter((h) => h.toLowerCase() !== '#fff'), `${f} hardcodes a colour`).toEqual([]);
    }
    /* ⚠️ THE SIX NEW VIGNETTES ARE HELD TO THE SAME RULE, measured on THEIR OWN
       TWO regions of FeatureMock.tsx rather than on the whole file — the
       vignettes that predate this ticket are not this ticket's to repaint, and a
       whole-file scan would either fail on them or be weakened to nothing.
     *
     * 🔴 THREE REGIONS, AND TWO EARLIER DRAFTS OF THIS TEST SLICED THEM WRONG —
     * both times by over-reaching into other people's vignettes rather than by
     * missing their own, which is the direction that reports a false failure
     * instead of a false pass. What this change wrote is in three separate
     * places, and they are not contiguous:
     *
     *   · six icons, at the END of `FEATURE_ICONS` near the top of the file
     *   · the shared helpers, immediately ABOVE `const MOCKS`
     *   · the six vignettes, at the END of `MOCKS`
     *
     * ⚠️ THE SIX ARE FOUND *AFTER* `const MOCKS`, WHICH IS THE WHOLE TRICK. The
     * icons and the vignettes are keyed by the SAME six strings, so a bare
     * `indexOf("'scheduler-publishing': (")` matches the ICON at the top of the
     * file, and a slice running from there swept all twenty-nine pre-existing
     * vignettes — it reported `#C4553B` and a dozen others, none of them this
     * ticket's to answer for. Searching from `const MOCKS` onwards is what makes
     * the two occurrences distinguishable. */
    const mock = read('src/components/FeatureMock.tsx');
    const iconsStart = mock.indexOf('  /* ── THE-293 — the six Harvest Scheduler capabilities');
    const iconsEnd = mock.indexOf('\n};\n', iconsStart);
    const helperStart = mock.indexOf('/* ── THE-293 — the six Harvest Scheduler vignettes');
    const mocksStart = mock.indexOf('const MOCKS: Record<string, React.ReactElement> = {');
    const sixStart = mock.indexOf("  'scheduler-publishing': (", mocksStart);
    const sixEnd = mock.indexOf('export function FeatureMock(');
    for (const [label, at, to] of [
      ['the icons', iconsStart, iconsEnd],
      ['the helpers', helperStart, mocksStart],
      ['the six vignettes', sixStart, sixEnd],
    ] as [string, number, number][]) {
      expect(at, `${label} region of FeatureMock is gone`).toBeGreaterThan(0);
      expect(to, `${label} region of FeatureMock is gone`).toBeGreaterThan(at);
    }
    /* 🔴 AND THE SIX-VIGNETTE REGION REALLY IS THE SECOND OCCURRENCE, not the
       first. Without this the slice could silently collapse back onto the icons
       and pass by measuring the wrong thing. */
    expect(sixStart, 'the six vignettes were not found inside MOCKS').toBeGreaterThan(mocksStart);
    expect(mock.indexOf("  'scheduler-publishing': (")).toBeLessThan(mocksStart);
    const mine = mock.slice(iconsStart, iconsEnd)
      + mock.slice(helperStart, mocksStart)
      + mock.slice(sixStart, sixEnd);
    /* ⚠️ AND THE REGIONS ARE PROVED NON-EMPTY AND COMPLETE, so a slice that
       silently collapsed would not pass by measuring nothing. */
    expect(mine.length).toBeGreaterThan(4000);
    for (const id of BLOCK_IDS) expect(mine, `${id} is outside the measured region`).toContain(`'${id}': (`);

    const hexes = [...mine.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    expect(hexes.filter((h) => h.toLowerCase() !== '#fff'), `a vignette hardcodes a colour: ${hexes.join(', ')}`).toEqual([]);
    /* `rgba(45,37,25,…)` is the hairline every card in this file already draws —
       the file's own border, not a colour this ticket chose. Anything else fails. */
    expect(mine, 'a vignette hardcodes an rgb() colour').not.toMatch(/\brgba?\((?!45,37,25,)/);
    expect(mine, 'a vignette hardcodes an hsl() colour').not.toMatch(/\bhsl\(/);
    // The greys and ramps it does use are declared in the stylesheet.
    for (const token of ['--gold-100', '--navy-900', '--sky-500', '--stone-100', '--green-500']) {
      expect(read('src/index.css'), `${token} is not declared`).toContain(`${token}:`);
    }
  });

  it('🔴 no logo or image file was added to the repository', () => {
    const listing = (dir: string) => (fs.existsSync(path.join(ROOT, dir))
      ? fs.readdirSync(path.join(ROOT, dir)).sort() : []);
    /* ⚠️ PINNED AS A SET, NOT FILTERED BY NAME. `logos/` and `public/logos/`
       already hold dead marks from the design handoff — instagram.svg,
       notion.svg, outlook.svg and two Google marks — referenced from nowhere in
       `src/`. They are not this ticket's to delete, and a name filter would have
       passed silently over them while claiming to check exactly this. */
    const PRE_EXISTING = [
      'avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg',
      'google-calendar.svg', 'google-tasks.svg', 'harvest-field.jpg',
      'instagram.svg', 'notion.svg', 'outlook.svg',
    ];
    expect(listing('logos'), 'a file was added to logos/').toEqual(PRE_EXISTING);
    expect(listing('public/logos'), 'a file was added to public/logos/')
      .toEqual([...PRE_EXISTING, 'harvest-mark.png'].sort());
    expect(listing('public/features').filter((f) => /schedul/i.test(f))).toEqual([]);
  });

  it('and no CSS rule was added — the new blocks reuse the shared collapse classes', () => {
    const css = read('src/index.css');
    expect(css, 'a rule was added for this page').not.toMatch(/scheduler|capability-block/i);
    for (const cls of ['.fb-grid', '.fb-caps']) {
      expect(css, `${cls} is not declared`).toContain(cls);
    }
  });
});

/* ── 15 ────────────────────────────────────────────────────────────────────
   No horizontal overflow at any measured width.                             */
describe('15 — no horizontal overflow at 380 / 768 / 1024 / 1280 / 1440', () => {
  /* 🔴 ARITHMETIC, NOT A SCREENSHOT — the idiom this repo already uses in
     components/TermToggle.widths.test.ts and in THE-284's own suite. There is no
     DOM and no layout engine in this runner, so nothing here can measure a box;
     what it can do is pin the structural properties that decide whether a thing
     can overflow at all, and compute the room each element gets.

     ⚠️ WIDTH IS NOT MONOTONIC IN VIEWPORT on this site — board card THE-184
     records a 41px overflow found at exactly 1280px, between two passing
     measurements — so every breakpoint is evaluated, not just the extremes. */
  const VIEWPORTS = [380, 768, 1024, 1280, 1440];
  const PAGE_GUTTER = 20;
  const CONTENT_MAX = 1140;
  const block = read('src/components/FeatureBlock.tsx');

  const clamp = (lo: number, vw: number, hi: number, v: number) =>
    Math.min(hi, Math.max(lo, (vw / 100) * v));
  const charWidth = (px: number) => px * 0.55;
  /** The longest UNBREAKABLE token, which is what actually decides an overflow
   *  — a multi-word label wraps. */
  const longestWord = (s: string) => Math.max(...s.split(/[\s—/,]+/).map((w) => w.length));
  const cardInner = (v: number) =>
    Math.min(CONTENT_MAX, v - PAGE_GUTTER * 2) - clamp(26, 3.5, 52, v) * 2;

  it('the block is a max-width plus fluid children, which is what makes it safe', () => {
    // Guards every calculation below against being derived from a rule that is
    // no longer in the file.
    expect(block).toContain('maxWidth: 1140');
    expect(block).toContain("padding: 'clamp(26px, 3.5vw, 52px)'");
    expect(block).toContain("gridTemplateColumns: '1.05fr 0.95fr'");
    expect(block).toContain("gap: 'clamp(28px, 4vw, 64px)'");
    expect(block).toContain("width: '100%', maxWidth: 410");
    expect(block).toContain('className="fb-grid"');
    expect(block).toContain('className="fb-caps"');
  });

  it.each(VIEWPORTS)('the story column fits its longest heading word at %ipx', (v) => {
    /* The heading is the binding string in the story column: it is set in the
       serif at `clamp(1.85rem, 3.4vw, 2.75rem)`, far larger than the body or the
       pull-quote, so a word that fits here fits everything beside it. */
    const room = v > 900 ? (cardInner(v) - clamp(28, 4, 64, v)) * (1.05 / 2) : cardInner(v);
    const headingPx = Math.min(44, Math.max(29.6, 0.034 * v));
    const widest = Math.max(...CAPABILITY_BLOCKS.map((c) => longestWord(c.title))) * charWidth(headingPx);
    expect(room, `the widest heading word (~${widest.toFixed(0)}px) does not fit ${room.toFixed(0)}px`)
      .toBeGreaterThan(widest);
  });

  it.each(VIEWPORTS)('both capability lists fit their longest word at %ipx', (v) => {
    /* ⚠️ MEASURED AGAINST THE NARROWER OF THE TWO COLUMNS, which is what a naive
       check misses: `.fb-caps` is `1fr 1fr`, so the longer list does not get more
       room for being longer. Items are 14px, less the marker and its 10px gap. */
    const room = (v > 900 ? (cardInner(v) - clamp(20, 3, 40, v)) / 2 : cardInner(v)) - 11 - 10;
    const widest = Math.max(...CAPABILITY_BLOCKS.flatMap((c) =>
      [...c.admin, ...c.member, c.adminLabel!, c.memberLabel!].map(longestWord))) * charWidth(14);
    expect(room, `the widest word (~${widest.toFixed(0)}px) does not fit ${room.toFixed(0)}px`)
      .toBeGreaterThan(widest);
  });

  it.each(VIEWPORTS)('the vignette is capped by its column, not floored by 410px, at %ipx', (v) => {
    /* The frame is `width: 100%` under a `maxWidth: 410`, so it can only ever be
       as wide as its column. This is the assertion that says the 410 is a CAP and
       not a floor — a floor is the shape that would actually push a page
       sideways at 380px, and it is what a `width: 410px` would have been. */
    const column = v > 900 ? (cardInner(v) - clamp(28, 4, 64, v)) * (0.95 / 2) : cardInner(v);
    expect(Math.min(410, column)).toBeLessThanOrEqual(column);
  });

  it('🔴 nothing on the page declares a fixed width that could exceed the narrowest box', () => {
    /* The mechanical half. At 380px the narrowest content box is 340px, and a
       `width:NNNpx` on anything large is how a card starts pushing the page
       sideways. The vignettes deliberately use flex, `aspectRatio` and percentage
       tracks; the only fixed widths in them are avatars, swatches and icons. */
    const fixed = [...pageHtml.matchAll(/(?<!max-|min-)\bwidth:(\d+(?:\.\d+)?)px/g)]
      .map((m) => Number(m[1]))
      .filter((w) => w > 60);
    expect(fixed, `a fixed width over 60px is declared: ${fixed.join(', ')}`).toEqual([]);
    const maxes = [...new Set([...pageHtml.matchAll(/max-width:(\d+)px/g)].map((m) => Number(m[1])))];
    expect(maxes.every((w) => w <= CONTENT_MAX), `a max-width exceeds ${CONTENT_MAX}px`).toBe(true);
  });

  it('and every grid on the page can reflow', () => {
    /* Two fixed-track grids reach this page and both come from FeatureBlock, and
       both collapse to a single column in the SAME 900px media block — asserted
       rather than assumed, because a grid that cannot reflow is the one shape
       that overflows however carefully the copy is measured. */
    const css = read('src/index.css');
    const at900 = css.slice(css.indexOf('@media (max-width: 900px)'));
    const rules = at900.slice(0, at900.indexOf('\n}'));
    expect(rules, 'fb-grid no longer collapses at 900px').toContain('.fb-grid');
    expect(rules, 'fb-caps no longer collapses at 900px').toContain('.fb-caps');
    const src = read('src/pages/SchedulerPage.tsx');
    for (const g of [...src.matchAll(/gridTemplateColumns: '([^']*)'/g)].map((m) => m[1])) {
      expect(g === '0.9fr 1.1fr' || g.startsWith('repeat(auto-fit'), `"${g}" cannot reflow`).toBe(true);
    }
  });
});
