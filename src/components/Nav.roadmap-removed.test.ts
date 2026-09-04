import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Nav } from './Nav';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';

/**
 * THE-225 — the Roadmap link is gone from the marketing site.
 *
 * It was the fourth item in the top nav — Features, Pricing, Resources,
 * Roadmap — and it pointed at a public Trello board. It appeared TWICE in
 * Nav.tsx: once in the desktop link row and once in the hamburger menu, each a
 * separate `<a>`, so removing one and shipping the other would have left it
 * live on every phone. Both are gone, and both halves are asserted here from
 * RENDERED MARKUP rather than from the source, since a nav that still renders
 * the link from some other branch is the failure that matters.
 *
 * The same link lived in the app's member Profile and is removed there in the
 * same change.
 *
 * 🔴 `CATALOG_TOOL_COUNT` MUST NOT MOVE BY ACCIDENT. It is 28 and it is DERIVED — a reduce
 * over `CATALOG` excluding `soon` items — and the nav imports it for the
 * mega-menu footer. If removing a nav link changed that number, the edit went
 * through `catalog.ts`, which is the wrong structure entirely; the last block
 * here is that tripwire.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const SRC = path.join(ROOT, 'src');
const SELF = fileURLToPath(import.meta.url);

/** The nav as it ships, on a route with no active state. */
const navHtml = (route = '/') =>
  renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(Nav)),
  );

/** Every .ts/.tsx source file under src/, so nothing hides on another page. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

describe('no Roadmap link renders on the site', () => {
  it('🔴 the top nav renders no Roadmap link', () => {
    const html = navHtml();

    // Not vacuous — the nav really rendered its other links.
    expect(html, 'the nav did not render at all').toContain('Pricing');
    expect(html, 'the nav did not render at all').toContain('Resources');

    expect(html, 'a Roadmap link survived in the nav').not.toContain('Roadmap');
    expect(html, 'a Trello link survived in the nav').not.toContain('trello');
  });

  it('renders no Roadmap link on a blog route either', () => {
    // `onBlog` is the only branch in the nav that changes what it draws.
    const html = navHtml('/blog');
    expect(html).not.toContain('Roadmap');
    expect(html).not.toContain('trello');
  });

  it('the desktop row AND the hamburger menu are both clean', () => {
    // The link existed twice. `renderToStaticMarkup` renders both containers —
    // the mobile panel is behind `mobile` state, so the source is swept as well
    // as the markup, which is what catches the half that state hides.
    const src = readFileSync(path.join(SRC, 'components/Nav.tsx'), 'utf8');
    expect(src, 'Nav.tsx still spells the board URL').not.toContain('trello');
    expect(src, 'Nav.tsx still renders a Roadmap label').not.toContain('Roadmap');
  });

  it('nothing else on the site links to the board — footer, blog, FAQ, catalog', () => {
    const offenders = sourceFiles(SRC)
      .filter((f) => f !== SELF)
      .filter((file) => /trello|Roadmap/i.test(readFileSync(file, 'utf8')));
    expect(offenders.map((f) => path.relative(ROOT, f)), 'a Roadmap reference survived')
      .toEqual([]);
  });
});

describe('the tool count is unchanged at its derived value', () => {
  it('🔴 CATALOG_TOOL_COUNT is 28, and still derived from CATALOG', () => {
    // 28 → 27 at THE-245: the SMS Automation tool left the live catalogue with
    // the feature, and the Coming Soon entry that replaced it is `soon`, so it
    // adds nothing back. The figure is quoted to visitors as "N tools in one
    // platform" — a tool a church cannot use is not one of them. Derived is the
    // property that matters and it is asserted below, not the literal.
    // 🔵 27 → 28 at THE-306, which added the Shareable Giving Page — a live, unflagged tool that shipped in THE-281 with no mega-menu row at all.
    expect(CATALOG_TOOL_COUNT).toBe(28);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
  });

  it('the nav still quotes that count', () => {
    // The count reaches the page through Nav's mega-menu footer. Removing a nav
    // link must not have taken the claim with it.
    const src = readFileSync(path.join(SRC, 'components/Nav.tsx'), 'utf8');
    expect(src).toContain('CATALOG_TOOL_COUNT');
  });
});
