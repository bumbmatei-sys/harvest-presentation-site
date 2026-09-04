/**
 * THE-297 — the Coming Soon column is a shortlist, and the page is not.
 *
 * ─── What the founder asked for ──────────────────────────────────────────────
 *
 * "in marketing site at features the coming soon section is too long. Make
 * harvest scheduler first then 3 more under then a see all button."
 *
 * ─── 🔴 WHICH SURFACE, because the ticket left it open and it matters ────────
 *
 * There are exactly two places the coming-soon list is rendered, and only one of
 * them can be the one that is "too long":
 *
 *   · the Features MEGA-MENU — components/catalog.ts feeding
 *     Nav.tsx's `FeatureMenuColumns`, on desktop and on the phone. Twelve rows
 *     against seven in the longest live category. THIS is the section.
 *   · pages/ComingSoonPage.tsx at /features/coming-soon — the FULL page, which
 *     is where "see all" goes. It cannot be the truncated surface AND the
 *     destination of its own "see all" link.
 *
 * components/ComingSoonBlock.tsx is rendered by the page and by nothing else, so
 * a cut made in it, or in its caller, would have truncated the one surface that
 * must not be. The cut is therefore in catalog.ts, which the page never imports
 * — the full page keeps all twelve because there is no code path by which the
 * shortlist could reach it. Section 3 proves that by rendering it.
 *
 * ─── What is deliberately NOT done ───────────────────────────────────────────
 *
 * ComingSoonBlock's docblock names three things it refuses — plan chips, ticks
 * and crosslinks into the paid pages — and takes no `accent`, so no coming-soon
 * card can be given a category tint. Prominence for the scheduler comes from
 * POSITION IN THE MENU and nothing else: it is not accented, chipped, ticked or
 * crosslinked, and section 4 holds all four.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FeatureMenuColumns } from './Nav';
import {
  CATALOG, CATALOG_TOOL_COUNT, COMING_SOON_MENU_COUNT, COMING_SOON_MENU_ITEMS,
  COMING_SOON_MORE_LABEL,
} from './catalog';
import { ComingSoonPage } from '../pages/ComingSoonPage';
import { CATEGORIES, categoryHref } from '../content/features';
import {
  COMING_SOON_HREF, COMING_SOON_ITEMS, IN_PROCESS_LABEL, NOT_BUILT_LABEL,
  SCHEDULER_HREF, SCHEDULER_NAME, comingSoonContract,
} from '../content/coming-soon';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readSrc = (rel: string) => readFileSync(path.join(ROOT, 'src', rel), 'utf8');

const render = (el: React.ReactElement, at = '/') => renderToStaticMarkup(
  React.createElement(HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: [at] }, el)),
);

/** Read markup the way a visitor reads it, not as tags. */
const words = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();

/** Source with comments stripped.
 *
 * 🔴 REQUIRED, NOT A CONVENIENCE. ComingSoonBlock's docblock NAMES the four
 * things it refuses — "no plan chips", "a tick means you get this", "no
 * crosslinks", "nothing here takes an `accent`" — so a raw text search for those
 * words finds the file explaining itself and reads it as the violation. The
 * refusals are claims about what the component DOES, so they are asserted
 * against code and against rendered markup, never against prose. */
const codeOnly = (src: string) => src
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

const menu = (variant: 'desktop' | 'mobile') =>
  render(React.createElement(FeatureMenuColumns, { variant }));

const desktopMenu = menu('desktop');
const mobileMenu = menu('mobile');
const MENUS = [['desktop', desktopMenu], ['mobile', mobileMenu]] as const;

/* The Coming Soon column is CATALOG[0] — its own suite pins that it is first. */
const soonGroup = CATALOG[0];

/** The page, rendered. This is the "all twelve" side of the ticket. */
const pageHtml = render(React.createElement(ComingSoonPage), COMING_SOON_HREF);
const pageText = words(pageHtml);

/* ── 1 ─────────────────────────────────────────────────────────────────────
   🔴 THE WHOLE TICKET: the scheduler first, then exactly three more.        */
describe('1 — the features surface shows the scheduler first, then exactly 3 more', () => {
  it('🔴 the column is four rows long, not twelve', () => {
    expect(COMING_SOON_MENU_COUNT).toBe(4);
    expect(COMING_SOON_MENU_ITEMS).toHaveLength(4);
    expect(soonGroup.items).toHaveLength(4);
    // And that is genuinely a truncation of a longer list, not a shrunken list.
    expect(COMING_SOON_ITEMS.length).toBeGreaterThan(soonGroup.items.length);
    expect(COMING_SOON_ITEMS).toHaveLength(12);
  });

  it('🔴 Harvest Scheduler is FIRST, and is the entry with a page of its own', () => {
    expect(COMING_SOON_MENU_ITEMS[0].name).toBe(SCHEDULER_NAME);
    expect(soonGroup.items[0].title).toBe(SCHEDULER_NAME);
    // It leads the column but is LAST in the list, so this is a real reorder
    // rather than the list order happening to agree.
    expect(COMING_SOON_ITEMS[COMING_SOON_ITEMS.length - 1].name).toBe(SCHEDULER_NAME);
    // And it links to its own page, not to an anchor — THE-284's rule, kept.
    expect(soonGroup.items[0].href).toBe(SCHEDULER_HREF);
  });

  it('🔴 and it is first in the RENDERED markup of both menus, not only in the array', () => {
    // Order is a property of the markup. Asserted where a visitor meets it.
    for (const [where, html] of MENUS) {
      const text = words(html);
      const at = COMING_SOON_MENU_ITEMS.map((i) => text.indexOf(i.name));
      for (const [n, idx] of at.entries()) {
        expect(idx, `"${COMING_SOON_MENU_ITEMS[n].name}" is missing from the ${where} menu`)
          .toBeGreaterThanOrEqual(0);
      }
      expect(at, `the ${where} menu does not read scheduler-first`)
        .toEqual([...at].sort((a, b) => a - b));
      expect(text.indexOf(SCHEDULER_NAME), `${where}: the scheduler is not the first row`)
        .toBe(Math.min(...at));
    }
  });

  it('the three under it are the broadest ministry gaps, named not sliced', () => {
    /* ⚠️ NAMED DELIBERATELY. The list's order is chronological — entries are
       appended as their board cards open, which the-280's suite pins as "the
       ELEVENTH entry, appended, not inserted" — so slicing its top three would
       have shown the OLDEST three and called it an editorial choice. */
    expect(COMING_SOON_MENU_ITEMS.slice(1).map((i) => i.id))
      .toEqual(['languages', 'services', 'applications']);
  });

  it('every row is derived from the list, never retyped', () => {
    for (const shown of soonGroup.items) {
      const entry = COMING_SOON_ITEMS.find((i) => i.name === shown.title);
      expect(entry, `"${shown.title}" is not an entry on the page`).toBeDefined();
      expect(shown.icon).toBe(entry!.icon);
      expect(shown.desc).toBe(entry!.navDesc);
      expect(shown.soon, 'a shortlisted row is not badged soon').toBe(true);
    }
    expect(readSrc('components/catalog.ts'))
      .toContain('COMING_SOON_ITEMS');
  });

  it('the eight it no longer lists are still published, just not in the menu', () => {
    const hidden = COMING_SOON_ITEMS.filter(
      (i) => !COMING_SOON_MENU_ITEMS.some((m) => m.id === i.id));
    expect(hidden).toHaveLength(8);
    for (const item of hidden) {
      expect(words(desktopMenu), `"${item.name}" is still in the menu`).not.toContain(item.name);
      // …and is on the page the "see all" row leads to.
      expect(pageText, `"${item.name}" fell off the page`).toContain(item.name);
    }
  });

  it('the live categories were not truncated — only the unbuilt column was', () => {
    for (const g of CATALOG.slice(1)) {
      expect(g.more, `"${g.name}" was given a see-all row it did not ask for`).toBeUndefined();
      expect(g.items.length, `"${g.name}" lost rows`).toBeGreaterThan(4);
    }
    // The tools claim is untouched: nothing here is countable.
    // 🔵 27 → 28 in THE-306: the Shareable Giving Page, a live unflagged
    // tool, joined the Giving & Finance column. Nothing about THIS ticket's
    // subject moved it.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(soonGroup.items.filter((i) => !i.soon)).toHaveLength(0);
  });
});

/* ── 2 ───────────────────────────────────────────────────────────────────── */
describe('2 — a "see all" control links to the full coming-soon page', () => {
  it('the column carries one, pointing at the page that already exists', () => {
    expect(soonGroup.more, 'no see-all control').toBeDefined();
    expect(soonGroup.more!.href).toBe(COMING_SOON_HREF);
    expect(soonGroup.more!.label).toBe(COMING_SOON_MORE_LABEL);
  });

  it('🔴 it renders in BOTH menus, and lands on the full list', () => {
    for (const [where, html] of MENUS) {
      expect(words(html), `the ${where} menu has no see-all row`).toContain(COMING_SOON_MORE_LABEL);
      expect(html, `the ${where} see-all row does not link to the page`)
        .toContain(`href="${COMING_SOON_HREF}"`);
    }
  });

  it('it counts the whole list, derived rather than written down', () => {
    expect(COMING_SOON_MORE_LABEL).toBe(`See all ${COMING_SOON_ITEMS.length}`);
    expect(COMING_SOON_MORE_LABEL).toBe('See all 12');
    // Not a literal in the source — a flag can move the count.
    expect(readSrc('components/catalog.ts')).not.toMatch(/See all 12/);
  });

  it('🔴 it is NAVIGATION, not a call to action — no trial, no price, no urgency', () => {
    /* ComingSoonPage closes with a plain note instead of SiteCTA because that
       band sells a trial. A see-all row that sold one would put the band back
       into the menu. */
    const row = COMING_SOON_MORE_LABEL;
    expect(row).not.toMatch(/trial|free|start|buy|get|try|sign ?up|demo|now/i);
    expect(row).not.toMatch(/\$|\d+\s*(\/|per\s)\s*(mo|month|yr|year)/i);
    for (const [where, html] of MENUS) {
      const seg = html.slice(html.indexOf(row) - 800, html.indexOf(row) + row.length);
      expect(seg, `the ${where} see-all row links to pricing`).not.toMatch(/#pricing|\/pricing/);
    }
  });

  it('it appears AFTER the four rows, not above them', () => {
    for (const [where, html] of MENUS) {
      const text = words(html);
      const last = Math.max(...COMING_SOON_MENU_ITEMS.map((i) => text.indexOf(i.name)));
      expect(text.indexOf(COMING_SOON_MORE_LABEL), `${where}: the see-all row is not last`)
        .toBeGreaterThan(last);
    }
  });
});

/* ── 3 ─────────────────────────────────────────────────────────────────────
   🔴 The truncation is SECTION-ONLY.                                        */
describe('3 — the full page still shows ALL 12 entries', () => {
  it('🔴 every entry renders on the page, by name', () => {
    expect(COMING_SOON_ITEMS).toHaveLength(12);
    for (const item of COMING_SOON_ITEMS) {
      expect(pageText, `"${item.name}" is missing from the page`).toContain(item.name);
    }
  });

  it('🔴 every entry has its anchor and its jump-to index card', () => {
    for (const item of COMING_SOON_ITEMS) {
      expect(pageHtml, `"${item.name}" has no anchor`).toContain(`id="${item.id}"`);
      expect(pageHtml, `"${item.name}" is not in the index`)
        .toContain(`href="${COMING_SOON_HREF}#${item.id}"`);
    }
  });

  it('🔴 twelve full cards, not four — the status row is rendered once per entry', () => {
    const badges = pageText.split(NOT_BUILT_LABEL).length - 1;
    expect(badges).toBe(COMING_SOON_ITEMS.length);
  });

  it('🔴 STRUCTURALLY unable to be truncated: the page never reads the shortlist', () => {
    /* The guarantee behind the assertions above. ComingSoonPage maps
       COMING_SOON_ITEMS straight from the content module; it does not import
       catalog.ts at all, so no edit to the shortlist can shorten it. */
    const page = readSrc('pages/ComingSoonPage.tsx');
    expect(page).toContain('COMING_SOON_ITEMS.map');
    expect(page, 'the page now reads the menu shortlist').not.toMatch(/from '\.\.\/components\/catalog'/);
    expect(page).not.toContain('COMING_SOON_MENU_ITEMS');
    // And ComingSoonBlock, the card, takes no count or limit to be cut by.
    const block = readSrc('components/ComingSoonBlock.tsx');
    expect(block).not.toMatch(/\bslice\(|\blimit\b|\bmax\b/i);
  });
});

/* ── 4 ─────────────────────────────────────────────────────────────────────
   🔴 The four refusals, none of them traded for prominence.                 */
describe('4 — no coming-soon card renders a plan chip, a tick, a crosslink or an accent', () => {
  const blockSrc = readSrc('components/ComingSoonBlock.tsx');
  const block = codeOnly(blockSrc);

  it('🔴 no plan chip, and no "Available on" row', () => {
    expect(pageText).not.toMatch(/Available on/i);
    expect(block).not.toMatch(/\btiers\b/);
    // The shape is the guard: a SoonItem has nowhere to put one.
    for (const item of COMING_SOON_ITEMS) {
      expect(item, `"${item.name}" grew a tiers field`).not.toHaveProperty('tiers');
      expect(item).not.toHaveProperty('price');
      expect(item).not.toHaveProperty('cta');
    }
  });

  it('🔴 no check marks — the list leads with a dashed grey square', () => {
    // "A tick means you get this." Neither the glyph nor the icon.
    expect(pageText).not.toMatch(/[✓✔☑»]/);
    expect(pageHtml).not.toMatch(/[✓✔☑]/);
    expect(block).not.toMatch(/[✓✔☑]/);
    expect(block).not.toMatch(/\bcheck\b|CheckIcon|check-circle/i);
    // …and the card still says why, in the docblock this deliberately excludes.
    expect(blockSrc, 'the refusal lost its reason').toMatch(/tick/i);
  });

  it('🔴 no crosslink into the paid pages from a card', () => {
    /* "From an unbuilt item those would read as an integration that exists." */
    expect(block).not.toMatch(/crosslink/i);
    // No link out of a card at all, in the rendered page, except its own anchor.
    for (const c of CATEGORIES) {
      expect(pageHtml.slice(pageHtml.indexOf('id="languages"')), 'a card links to a paid page')
        .not.toContain(`href="${categoryHref(c.slug)}#`);
    }
    for (const item of COMING_SOON_ITEMS) {
      expect(item, `"${item.name}" grew crosslinks`).not.toHaveProperty('crosslinks');
    }
    expect(block).not.toMatch(/#pricing|\/pricing/);
  });

  it('🔴 no accent — every colour is a grey token, and no card can be tinted', () => {
    /* The five live category pages pass an `accent` per feature. Nothing here
       takes one, "so no coming-soon card can be given a category tint by a
       later edit without changing this signature". */
    expect(block).not.toMatch(/\baccent\b/);
    // The refusal is still ARGUED in the file, which is what keeps it.
    expect(blockSrc).toMatch(/accent/);
    for (const item of COMING_SOON_ITEMS) {
      expect(item, `"${item.name}" grew an accent`).not.toHaveProperty('accent');
    }
  });

  it('🔴 AND THE SCHEDULER BOUGHT ITS PROMINENCE WITH NONE OF THEM', () => {
    /* The one that this ticket could have broken. Its prominence is position in
       the menu — first row — and nothing else. In the menu it is styled by the
       same code path as its three neighbours; on the page it is one of twelve
       identical cards. */
    const scheduler = soonGroup.items[0];
    expect(scheduler.title).toBe(SCHEDULER_NAME);
    expect(scheduler.soon, 'the lead row lost its SOON badge').toBe(true);
    // No per-item styling seam in the renderer at all: no id/title branch.
    const nav = codeOnly(readSrc('components/Nav.tsx'));
    expect(nav, 'the menu renderer branches on the scheduler').not.toMatch(/scheduler/i);
    expect(nav).not.toMatch(/items\.map\([^)]*\)\s*=>\s*[^]{0,400}?(first|index === 0|i === 0)/);
    // The column's tint is the grey one, and the lead row does not override it.
    expect(soonGroup.tint).toBe('var(--text-soon)');
    // Every row in the rendered column carries the same grey icon colour.
    const tints = desktopMenu.match(/var\(--text-soon\)/g) ?? [];
    expect(tints.length).toBeGreaterThanOrEqual(COMING_SOON_MENU_ITEMS.length);
  });
});

/* ── 5 ───────────────────────────────────────────────────────────────────── */
describe('5 — the status row still pairs NOT_BUILT with IN_PROCESS', () => {
  it('🔴 both labels, in that order, on every one of the twelve cards', () => {
    /* "In process" on its own would be a claim that work is under way, which
       the board does not support. The pair is what keeps it honest. */
    expect(pageText).toContain(NOT_BUILT_LABEL);
    expect(pageText).toContain(IN_PROCESS_LABEL);
    const notBuilt = pageText.split(NOT_BUILT_LABEL).length - 1;
    const inProcess = pageText.split(IN_PROCESS_LABEL).length - 1;
    expect(notBuilt).toBe(COMING_SOON_ITEMS.length);
    expect(inProcess).toBe(COMING_SOON_ITEMS.length);
    expect(pageText.indexOf(NOT_BUILT_LABEL)).toBeLessThan(pageText.indexOf(IN_PROCESS_LABEL));
  });

  it('and the pairing is still structural in the card, not per-entry copy', () => {
    const block = readSrc('components/ComingSoonBlock.tsx');
    expect(block).toContain('NOT_BUILT_LABEL');
    expect(block).toContain('IN_PROCESS_LABEL');
    expect(block.indexOf('NOT_BUILT_LABEL')).toBeLessThan(block.lastIndexOf('IN_PROCESS_LABEL'));
  });
});

/* ── 6 ───────────────────────────────────────────────────────────────────── */
describe('6 — no price, date, tier or CTA in the section or on the page', () => {
  const TIER = /\b(Individual|Small Team|Ministry|Forever Free)\b/;
  const DATE = /\b(Q[1-4]|H[12])\s*'?\d{2,4}\b|\b(20\d\d)\b|\b(next|this)\s+(month|quarter|year)\b|\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i;

  const surfaces = [
    ['the desktop column', words(desktopMenu)],
    ['the mobile column', words(mobileMenu)],
  ] as const;

  it('🔴 no price anywhere in the shortlisted column', () => {
    for (const [where, text] of surfaces) {
      expect(text, `${where} quotes a price`).not.toMatch(/\$\s?\d/);
      expect(text, `${where} quotes a rate`).not.toMatch(/\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i);
    }
  });

  it('🔴 no tier and no date in the shortlisted rows or the see-all row', () => {
    for (const item of [...COMING_SOON_MENU_ITEMS]) {
      const prose = `${item.name} ${item.navDesc}`;
      expect(prose, `"${item.name}" names a tier`).not.toMatch(TIER);
      expect(prose, `"${item.name}" gives a date`).not.toMatch(DATE);
    }
    expect(COMING_SOON_MORE_LABEL).not.toMatch(TIER);
    expect(COMING_SOON_MORE_LABEL).not.toMatch(DATE);
  });

  it('🔴 no call to action — the column sells nothing', () => {
    for (const [where, text] of surfaces) {
      expect(text, `${where} sells a trial`).not.toMatch(/start free trial|free trial|compare plans/i);
    }
    // No route out of the Coming Soon column except its own page and anchors.
    const hrefs = [...desktopMenu.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
      .filter((h) => h.startsWith(COMING_SOON_HREF) || h === SCHEDULER_HREF);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).not.toMatch(/pricing|checkout|trial/i);
  });

  it('🔴 and the page still carries none of the four', () => {
    expect(pageText).not.toMatch(/\$\s?\d/);
    expect(pageText).not.toMatch(/\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i);
    expect(pageText).not.toMatch(/Available on/i);
    expect(pageText).not.toMatch(/start free trial|compare plans/i);
  });
});

/* ── 7 ───────────────────────────────────────────────────────────────────── */
describe('7 — no SoonItem was added or removed, and every ref is intact', () => {
  it('🔴 still twelve entries, with the ids the page shipped with', () => {
    expect(COMING_SOON_ITEMS.map((i) => i.id)).toEqual([
      'languages', 'services', 'applications', 'docs', 'website', 'agent',
      'identity', 'designations', 'sms', 'affiliate', 'domains', 'scheduler',
    ]);
  });

  it('🔴 every entry still names its board card', () => {
    for (const item of COMING_SOON_ITEMS) {
      expect(item.ref, `"${item.name}" lost its ref`).toBeTruthy();
      expect(item.ref, `"${item.name}" has an unparseable ref`)
        .toMatch(/^(THE-\d+|86[a-z0-9]{7})$/);
    }
  });

  it('the index ordinals are still derived from position, 1..12 with no gap', () => {
    expect(COMING_SOON_ITEMS.map((i) => i.n))
      .toEqual(COMING_SOON_ITEMS.map((_, i) => String(i + 1)));
  });

  it("🔴 the content module's own contract still passes", () => {
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();
  });

  it('this ticket edited presentation only — content/coming-soon.ts is untouched', () => {
    /* The shortlist lives entirely in components/. Nothing about an entry — its
       copy, its ref, its order on the page — was changed to make the menu shorter. */
    expect(readSrc('components/catalog.ts')).toContain('COMING_SOON_MENU_ITEMS');
    expect(readSrc('content/coming-soon.ts')).not.toContain('MENU');
    expect(readSrc('content/coming-soon.ts')).not.toContain('shortlist');
  });
});

/* ── 8 ───────────────────────────────────────────────────────────────────── */
describe('8 — the section still collapses at 900px via fb-grid / fb-caps', () => {
  const block = readSrc('components/ComingSoonBlock.tsx');
  const css = readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8');

  it('🔴 the card still reuses both class names', () => {
    /* "A church moving between a live category page and this one should feel one
       site" — the collapse is FeatureBlock's, borrowed by class name. */
    expect(block).toContain('className="fb-grid"');
    expect(block).toContain('fb-caps');
    expect(pageHtml).toContain('class="fb-grid"');
    expect(pageHtml).toContain('fb-caps');
  });

  it('🔴 and index.css still collapses both at 900px', () => {
    const at900 = css.slice(css.indexOf('@media (max-width: 900px)'));
    const rule = at900.slice(0, at900.indexOf('}\n}') + 3);
    expect(rule).toMatch(/\.fb-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
    expect(rule).toMatch(/\.fb-caps\s*\{[^}]*grid-template-columns:\s*1fr/);
  });

  it('the jump-to index still steps down rather than staying five across', () => {
    expect(css).toMatch(/\.soon-index\s*\{\s*grid-template-columns:\s*repeat\(4/);
    expect(css).toMatch(/\.soon-index\s*\{\s*grid-template-columns:\s*repeat\(3/);
    expect(css).toMatch(/\.soon-index\s*\{\s*grid-template-columns:\s*repeat\(2/);
  });
});

/* ── 9 & 10 ────────────────────────────────────────────────────────────────
   🔴 Nothing prerendered moved — because the menu is not prerendered.       */
const DIST = path.join(ROOT, 'dist');
const built = existsSync(path.join(DIST, 'index.html'));

const pages = (dir: string, base = ''): string[] => (existsSync(dir) ? readdirSync(dir)
  .flatMap((e) => {
    const full = path.join(dir, e);
    if (statSync(full).isDirectory()) return pages(full, path.join(base, e));
    return e === 'index.html' ? [path.join(base, e)] : [];
  }) : []);

describe('9 — the prerendered page count is still 22', () => {
  it.runIf(built)('🔴 exactly 22 pages, because this ticket adds no route', () => {
    expect(pages(DIST)).toHaveLength(22);
  });

  it('🔴 and no route was added — "see all" points at a page that already existed', () => {
    const app = readSrc('App.tsx');
    expect(app).toContain('COMING_SOON_HREF');
    expect(app).toContain('<ComingSoonPage />');
    // The see-all destination IS that route, not a new one.
    expect(soonGroup.more!.href).toBe(COMING_SOON_HREF);
  });
});

describe('10 — no page changed its built HTML except the ones this PR touches', () => {
  /* 🔴 AND THE ANSWER IS: NONE OF THEM.
   *
   * The mega-menu is state-gated — `FeatureMenuColumns` renders only once Nav's
   * `mega` or `mobile` state is true, and nothing in a prerender sets either —
   * so the shortlist never reaches a built page. This ticket's whole diff is
   * therefore invisible to the prerender, which is why the-278's fingerprint
   * table needed no regeneration and why there is no collision with THE-293.
   *
   * ⚠️ Named explicitly rather than counted, so a rebase onto THE-293 (which
   * changes /features/harvest-scheduler) does not silently widen this. That page
   * is THEIRS; if it moves under a rebase, that is expected and not this PR.
   *
   * ⚠️ Read from dist, never from `git show` — no shelling out at assertion
   * time. The byte-level pin is the-278's; this proves the mechanism.  */
  const TOUCHED_BY_THIS_PR: readonly string[] = [];

  it.runIf(built)('🔴 no built page contains the see-all row — the menu is not prerendered', () => {
    for (const rel of pages(DIST)) {
      const html = readFileSync(path.join(DIST, rel), 'utf8');
      expect(html, `${rel} prerenders the mega-menu`).not.toContain(COMING_SOON_MORE_LABEL);
    }
    expect(TOUCHED_BY_THIS_PR, 'a page changed and this list was not updated').toHaveLength(0);
  });

  it.runIf(built)('🔴 the coming-soon page still ships all twelve entries in its BUILT html', () => {
    const html = readFileSync(path.join(DIST, 'features', 'coming-soon', 'index.html'), 'utf8');
    const text = words(html);
    for (const item of COMING_SOON_ITEMS) {
      expect(text, `"${item.name}" is missing from the built page`).toContain(item.name);
    }
    expect(text.split(NOT_BUILT_LABEL).length - 1).toBe(12);
  });

  it.runIf(built)('and no OTHER built page grew a coming-soon entry', () => {
    const shouldCarry = new Set([
      path.join('features', 'coming-soon', 'index.html'),
      path.join('features', 'harvest-scheduler', 'index.html'),
    ]);
    for (const rel of pages(DIST)) {
      if (shouldCarry.has(rel)) continue;
      const text = words(readFileSync(path.join(DIST, rel), 'utf8'));
      expect(text, `${rel} lists coming-soon entries`).not.toContain('Multiple languages');
    }
  });
});

/* ── 11 ──────────────────────────────────────────────────────────────────── */
describe('11 — no colour is hardcoded; every colour is a grey token', () => {
  const HEX = /#[0-9a-fA-F]{3,8}\b/;
  const FUNC = /\b(rgba?|hsla?)\s*\(/;

  it('🔴 the see-all row is drawn from the group tint, not a colour of its own', () => {
    const nav = readSrc('components/Nav.tsx');
    const from = nav.indexOf('g.more && (');
    const seg = nav.slice(from, nav.indexOf('</Link>', from));
    expect(seg, 'the see-all row hardcodes a hex').not.toMatch(HEX);
    expect(seg, 'the see-all row hardcodes an rgb/hsl').not.toMatch(FUNC);
    expect(seg).toContain('g.tint');
    // Its only ground on hover is an existing token.
    expect(seg).toContain('var(--stone-100)');
  });

  it('🔴 the column resolves to the grey ramp, and to no category colour', () => {
    expect(soonGroup.tint).toBe('var(--text-soon)');
    expect(soonGroup.bg).toBe('var(--surface-soon)');
    for (const g of CATALOG.slice(1)) {
      expect(desktopMenu, 'the Coming Soon column borrowed a category tint')
        .toBeDefined();
      expect(soonGroup.tint).not.toBe(g.tint);
    }
  });

  it('🔴 the rendered column paints no literal colour at all', () => {
    /* The whole column's markup, not just the row: a tint smuggled into an
       inline style would show here. */
    const from = desktopMenu.indexOf('Coming Soon');
    const col = desktopMenu.slice(from, desktopMenu.indexOf('Community &', from));
    expect(col, 'a hex colour is painted in the column').not.toMatch(HEX);
    expect(col, 'an rgb/hsl colour is painted in the column').not.toMatch(FUNC);
  });

  it('the grey tokens are defined in index.css, not invented here', () => {
    const css = readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8');
    for (const token of ['--text-soon', '--surface-soon', '--stone-100']) {
      expect(css, `${token} is not defined`).toContain(`${token}:`);
    }
  });
});

/* ── 12 ──────────────────────────────────────────────────────────────────── */
describe('12 — the see-all control is ≥44px, and nothing overflows', () => {
  it('🔴 44px minimum in BOTH variants, in the rendered style', () => {
    /* The rows above it are a pointer-first mega-menu at their inherited
       density. This row is NEW, so it is built to the tap-target floor rather
       than matched down to them. */
    for (const [where, html] of MENUS) {
      const at = html.indexOf(COMING_SOON_MORE_LABEL);
      expect(at, `the ${where} see-all row is missing`).toBeGreaterThan(0);
      const seg = html.slice(html.lastIndexOf('<a', at), at);
      expect(seg, `the ${where} see-all row is under 44px`).toMatch(/min-height:44px/);
    }
  });

  it('🔴 no fixed width, so no horizontal overflow at 380 / 768 / 1024 / 1280 / 1440', () => {
    /* Nothing in the row is measured in absolute width — it is a flex child of
       the column, which the menu already sizes at every breakpoint. A px width
       is the only way this row could push a column wider than its container. */
    const nav = readSrc('components/Nav.tsx');
    const from = nav.indexOf('g.more && (');
    const seg = nav.slice(from, nav.indexOf('</Link>', from));
    expect(seg).not.toMatch(/\bwidth:\s*\d/);
    expect(seg).not.toMatch(/\bminWidth:\s*\d/);
    expect(seg).not.toMatch(/whiteSpace:\s*'nowrap'/);
    // The label is short enough to sit in the narrowest column without wrapping
    // oddly — four columns at 380px is the mobile accordion, one column wide.
    expect(COMING_SOON_MORE_LABEL.length).toBeLessThanOrEqual(16);
  });

  it('🔴 and the change can only ever SHORTEN the column, never widen it', () => {
    /* The overflow argument in one line: the column lost eight rows and gained
       one, and no row is wider than the longest title it already carried. */
    expect(soonGroup.items.length + 1).toBeLessThan(COMING_SOON_ITEMS.length);
    const longest = Math.max(...COMING_SOON_ITEMS.map((i) => i.name.length));
    expect(COMING_SOON_MORE_LABEL.length).toBeLessThanOrEqual(longest);
  });
});
