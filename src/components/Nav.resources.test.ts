import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Nav, ResourcesMenuItems } from './Nav';
import { Footer } from './Footer';
import { CATALOG, CATALOG_TOOL_COUNT } from './catalog';
import { CHANGELOG_URL, DOCS_URL, RESOURCES, isExternalHref } from '../content/resources';
import { COMING_SOON_ITEMS } from '../content/coming-soon';

/**
 * THE-358 — the documentation exists, and the site now says so.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHAT THIS TICKET IS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Harvest's documentation is LIVE at docs.theharvest.site — 24 pages across six
 * sections, plus a changelog. Nothing in either product linked to it, and this
 * site still said documentation was coming. Two halves, both asserted here:
 *
 *   1. The nav's "Resources" entry became a DROPDOWN over Documentation,
 *      Changelog and the Blog. It was a flat `<Link to="/blog">` wearing the
 *      label "Resources" — a label that promised a set and delivered one page.
 *   2. The claim that documentation is coming is GONE, and its absence is
 *      guarded rather than merely unmentioned.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔴 WHY THE MENU'S ITEMS ARE RENDERED, NOT READ OFF `RESOURCES`
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `ResourcesMenuItems` is exported for exactly the reason `SolutionsMenuItems`
 * and `FeatureMenuColumns` are: both panels only exist once `resources` /
 * `mobileResources` state is true, and nothing outside a real click can set
 * either in this repo's DOM-less test runner. A test that re-read the
 * `RESOURCES` array would pass while the JSX seam sent every visitor somewhere
 * else — the failure `MegaMenuFooterLabel` was split out to prevent. So every
 * claim below is made against RENDERED MARKUP, and the hrefs are asserted as
 * literal strings rather than interpolated from the same constants the
 * component reads, which would be the assertion comparing the code to itself.
 *
 * ⚠️ NOTHING HERE IS PINNED TO A LINE NUMBER. THE-331's guard named
 * `AdminCommunity.tsx:491`; a deletion shifted that surface to `:311` and the
 * suite would have measured whatever landed there.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const SRC = path.join(ROOT, 'src');
const SELF = fileURLToPath(import.meta.url);

const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');

/** Tags out, entities decoded, whitespace collapsed — the idiom this repo uses. */
const words = (markup: string) => markup
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

/** Every .ts/.tsx source file under src/, so nothing hides on another page. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

/** Comments out, so a comment explaining a retired claim is not itself a claim. */
const stripComments = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');

const navHtml = (route = '/') =>
  renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(Nav)),
  );

const menuHtml = (variant: 'desktop' | 'mobile') =>
  renderToStaticMarkup(React.createElement(
    MemoryRouter, {}, React.createElement(ResourcesMenuItems, { variant }),
  ));

const footerHtml = () =>
  renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(Footer)));

/* ═══ 1 ══════════════════════════════════════════════════════════════════ */

describe('1 · a Resources dropdown exists in the top nav', () => {
  it('🔴 Resources is a menu trigger, not a link to one page', () => {
    const html = navHtml();

    // Not vacuous — the nav really rendered.
    expect(html, 'the nav did not render at all').toContain('Pricing');
    expect(html, 'the nav no longer renders a Resources entry').toContain('Resources');

    /* The trigger is a <button> carrying the ARIA a popup needs. Matched on the
       attributes rather than on a tag index, so reordering the bar cannot make
       this pass by accident. */
    const triggers = [...html.matchAll(/<button[^>]*aria-haspopup="true"[^>]*>([\s\S]*?)<\/button>/g)];
    const labels = triggers.map((m) => words(m[1]));
    expect(labels, 'Resources is not one of the nav\'s popup triggers').toContain('Resources');
    expect(labels, 'the Features mega-menu trigger went missing').toContain('Features');
    expect(labels, 'the Solutions trigger went missing').toContain('Solutions');
  });

  it('the trigger declares its own expanded state, like the other two', () => {
    const html = navHtml();
    const resources = /<button[^>]*aria-haspopup="true"[^>]*>(?:(?!<\/button>)[\s\S])*?Resources/.exec(html);
    expect(resources, 'no Resources popup trigger in the rendered nav').not.toBeNull();
    expect(resources![0], 'the Resources trigger declares no aria-expanded').toMatch(/aria-expanded="(true|false)"/);
  });

  it('🔴 it is NOT still a bare link straight to the blog', () => {
    /* The defect this ticket fixes, asserted as the absence it is. Before
       THE-358 the nav's only "Resources" was `<a href="/blog">Resources</a>`. */
    const html = navHtml();
    const bareBlogResources = /<a[^>]*href="\/blog"[^>]*>\s*Resources\s*<\/a>/.test(html);
    expect(bareBlogResources, 'Resources is a plain link to /blog again').toBe(false);
  });
});

/* ═══ 2 ══════════════════════════════════════════════════════════════════ */

describe('2 · it contains Documentation, Changelog and Blog', () => {
  /** The three, with the EXACT destination each must reach. Written out as
   *  literals — interpolating `DOCS_URL` here would compare the component to
   *  the same constant it reads and could not catch a wrong address. */
  const EXPECTED: [string, string][] = [
    ['Documentation', 'https://docs.theharvest.site'],
    ['Changelog', 'https://docs.theharvest.site/changelog'],
    ['Blog', '/blog'],
  ];

  it.each(['desktop', 'mobile'] as const)('🔴 all three render in the %s menu, each at its exact href', (variant) => {
    const html = menuHtml(variant);
    for (const [label, href] of EXPECTED) {
      expect(words(html), `"${label}" is missing from the ${variant} Resources menu`).toContain(label);
      expect(html, `"${label}" does not point at ${href} in the ${variant} menu`)
        .toMatch(new RegExp(`href="${href.replace(/[/.]/g, '\\$&')}"[^>]*>(?:(?!</a>|</Link>)[\\s\\S])*?${label}`));
    }
  });

  it('🔴 and exactly those three — nothing was added', () => {
    const html = menuHtml('desktop');
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(EXPECTED.map(([, href]) => href));
  });

  it('the constants the site shares agree with the rendered addresses', () => {
    // The footer reads the same two constants, so this is what stops the nav
    // and the footer drifting apart.
    expect(DOCS_URL).toBe('https://docs.theharvest.site');
    expect(CHANGELOG_URL).toBe('https://docs.theharvest.site/changelog');
    expect(RESOURCES.map((r) => r.label)).toEqual(['Documentation', 'Changelog', 'Blog']);
  });
});

/* ═══ 3 ══════════════════════════════════════════════════════════════════ */

describe('3 · it works on mobile', () => {
  it('🔴 the mobile panel opens Resources by CLICK, not by hover', () => {
    /* A phone cannot hover. The mobile panel is behind `mobile` state, which
       nothing outside a real click can set in this runner, so the contract is
       asserted on the SOURCE — the same split the standing board guard uses
       for the half that state hides. */
    const src = read('src/components/Nav.tsx');

    // An accordion trigger bound to onClick, with its own expanded state.
    expect(src, 'the mobile Resources accordion has no click handler')
      .toMatch(/onClick=\{\(\) => setMobileResources\(\(v\) => !v\)\}/);
    expect(src, 'the mobile Resources accordion declares no aria-expanded')
      .toMatch(/aria-expanded=\{mobileResources\}/);
    // And the panel it reveals renders the shared item list.
    expect(src, 'the mobile panel does not render the Resources items')
      .toMatch(/\{mobileResources && \([\s\S]{0,400}ResourcesMenuItems variant="mobile"/);
  });

  it('🔴 no hover handler opens EITHER Resources control', () => {
    /* The mutation this test exists for: making the dropdown hover-only. The
       desktop trigger may tint on hover — every nav link does — but nothing may
       OPEN a panel on pointer entry. */
    const src = stripComments(read('src/components/Nav.tsx'));
    const opensOnHover = /onMouseEnter=\{[^}]*set(?:Mobile)?Resources\s*\(/.test(src)
      || /onMouseOver=\{[^}]*set(?:Mobile)?Resources\s*\(/.test(src)
      || /onPointerEnter=\{[^}]*set(?:Mobile)?Resources\s*\(/.test(src);
    expect(opensOnHover, 'the Resources menu opens on hover — a phone cannot open it').toBe(false);
  });

  it('every row in the mobile menu is at least a 44px tap target', () => {
    // Arithmetic is impossible here and a screenshot is unavailable, so the
    // floor is asserted where it is declared: on the row style each entry gets.
    const html = menuHtml('mobile');
    const rows = [...html.matchAll(/min-height:\s*44px/g)];
    expect(rows, 'a mobile Resources row is under the 44px touch floor')
      .toHaveLength(RESOURCES.length);
  });

  it('and closing the hamburger collapses the Resources accordion with it', () => {
    expect(read('src/components/Nav.tsx'))
      .toMatch(/const closeMobile = \(\) => \{ setMobile\(false\); setMobileFeatures\(false\); setMobileSolutions\(false\); setMobileResources\(false\); \};/);
  });
});

/* ═══ 4 ══════════════════════════════════════════════════════════════════ */

describe('4 · the external links carry rel="noopener"', () => {
  it.each(['desktop', 'mobile'] as const)('🔴 every off-site link in the %s menu opens safely', (variant) => {
    const html = menuHtml(variant);
    const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
    const external = anchors.filter((a) => /href="https?:/.test(a));

    // Not vacuous: the two docs links really are anchors, not Links.
    expect(external, `the ${variant} menu renders no external anchor at all`).toHaveLength(2);

    for (const a of external) {
      expect(a, `an external ${variant} Resources link has no rel="noopener"`).toMatch(/rel="[^"]*noopener/);
      expect(a, `an external ${variant} Resources link does not open in a new tab`).toMatch(/target="_blank"/);
    }
  });

  it('🔴 the footer\'s docs links carry it too', () => {
    const html = footerHtml();
    const external = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0])
      .filter((a) => /href="https?:/.test(a));
    expect(external, 'the footer renders no external anchor').not.toHaveLength(0);
    for (const a of external) {
      expect(a, 'a footer external link has no rel="noopener"').toMatch(/rel="[^"]*noopener/);
      expect(a, 'a footer external link does not open in a new tab').toMatch(/target="_blank"/);
    }
  });

  it('the footer lists Documentation and Changelog under RESOURCES', () => {
    const html = footerHtml();
    expect(html, 'the footer does not link the documentation')
      .toContain('href="https://docs.theharvest.site"');
    expect(html, 'the footer does not link the changelog')
      .toContain('href="https://docs.theharvest.site/changelog"');
    // In the column that already existed, not a new one — the FAQ and Blog it
    // has always held are still beside them.
    const col = /RESOURCES([\s\S]*?)LEGAL/.exec(words(html));
    expect(col, 'the footer has no RESOURCES column any more').not.toBeNull();
    for (const label of ['Documentation', 'Changelog', 'FAQ', 'Blog']) {
      expect(col![1], `"${label}" is not in the footer's RESOURCES column`).toContain(label);
    }
  });
});

/* ═══ 5 ══════════════════════════════════════════════════════════════════ */

describe('5 · the blog link is internal, not an anchor to another domain', () => {
  it('🔴 Blog stays a react-router link and never becomes an off-site <a>', () => {
    for (const variant of ['desktop', 'mobile'] as const) {
      const html = menuHtml(variant);
      /* react-router's <Link> renders an <a href="/blog"> with no target and no
         rel. What must never appear is /blog on the docs domain, or the blog
         wearing target="_blank" as though it left the site. */
      expect(html, `the ${variant} Blog entry points off-site`)
        .not.toMatch(/href="https?:\/\/[^"]*\/blog"/);
      const blogAnchor = /<a\b[^>]*href="\/blog"[^>]*>/.exec(html);
      expect(blogAnchor, `the ${variant} menu has no internal /blog link`).not.toBeNull();
      expect(blogAnchor![0], `the ${variant} Blog entry opens in a new tab`).not.toMatch(/target="_blank"/);
    }
  });

  it('the internal/external split is DERIVED from the href, not declared twice', () => {
    expect(isExternalHref('https://docs.theharvest.site')).toBe(true);
    expect(isExternalHref('/blog')).toBe(false);
    // No second copy of the answer anywhere in the content module.
    expect(read('src/content/resources.ts'), 'resources.ts declares externality by hand')
      .not.toMatch(/external:\s*(true|false)/);
  });
});

/* ═══ 6 ══════════════════════════════════════════════════════════════════ */

describe('6 · no surface claims documentation is coming', () => {
  /** Every SHIPPED source file, so a claim cannot hide on a page nobody thought
   *  of.
   *
   *  ⚠️ TEST FILES ARE EXCLUDED, and the reason is not convenience. This sweep
   *  asks what a VISITOR can read; a suite is not a surface and ships to
   *  nobody. Including them made this test report `ComingSoonPage.test.ts`,
   *  whose whole job since THE-358 is to assert that the documentation entry is
   *  ABSENT — a guard naming the claim in order to forbid it is the opposite of
   *  the claim, and a sweep that cannot tell those apart reports the fix as the
   *  defect. `SELF` would have been excluded on the same ground; excluding the
   *  category is what stops the next such guard tripping it. */
  const FILES = sourceFiles(SRC)
    .filter((f) => f !== SELF)
    .filter((f) => !/\.test\.tsx?$/.test(f));

  /**
   * 🔴 THE NEEDLE IS ASSEMBLED FROM FRAGMENTS, because this file is inside the
   * set it sweeps. #496 found TWO guards in this series SELF-MATCHING — a sweep
   * that fails on its own text proves nothing about the codebase.
   */
  const DOC_WORD = new RegExp(['document', 'ation'].join(''), 'i');
  const COMING_WORDS = new RegExp(
    ['coming ' + 'soon', 'not built ' + 'yet', 'is ' + 'planned', 'on the ' + 'way',
     'will ' + 'come', 'there is no ' + 'manual', 'should be'].join('|'), 'i');

  it('🔴 the coming-soon list carries no documentation entry, by id, name and card', () => {
    expect(COMING_SOON_ITEMS.map((i) => i.id)).not.toContain('docs');
    expect(COMING_SOON_ITEMS.map((i) => i.ref)).not.toContain('THE-117');
    for (const item of COMING_SOON_ITEMS) {
      expect(item.name, `"${item.name}" is a documentation entry on the coming-soon page`)
        .not.toMatch(DOC_WORD);
    }
  });

  it('🔴 no RENDERED copy anywhere pairs documentation with a future tense', () => {
    /* Comments are stripped first: this repo records its own history in them,
       and a comment saying "documentation used to be coming" is the correction,
       not the claim. Only what a visitor can read is swept.
     *
     * 🔴 A WINDOW, NOT A LINE — and this was found by MUTATION, not by reading.
     * A first draft asked whether one LINE held both halves. Planting the old
     * entry back proved that vacuous: it spreads the claim across a `name`, an
     * `eyebrow`, a `title` and a `navDesc`, and no single line of it carries
     * both "documentation" and a future tense. The claim is made by a
     * NEIGHBOURHOOD of copy, so the sweep reads a neighbourhood. */
    const WINDOW = 400;
    const offenders: string[] = [];
    for (const file of FILES) {
      const src = stripComments(readFileSync(file, 'utf8'));
      for (const m of src.matchAll(new RegExp(DOC_WORD.source, 'gi'))) {
        const from = Math.max(0, m.index - WINDOW);
        const near = src.slice(from, m.index + WINDOW);
        const hit = COMING_WORDS.exec(near);
        if (hit) {
          offenders.push(
            `${path.relative(ROOT, file)}: "${hit[0]}" within ${WINDOW} chars of "${m[0]}"`,
          );
        }
      }
    }
    expect(offenders, 'a surface still says documentation is coming').toEqual([]);
  });

  it('🔴 the sweep is not vacuous — it really does read the files it claims to', () => {
    /* Without this the test above passes if `FILES` is empty or the stripper
       eats everything, which is exactly how a guard comes to look green while
       policing nothing. */
    expect(FILES.length, 'the sweep found no shipped source files').toBeGreaterThan(50);
    expect(FILES.some((f) => /\.test\.tsx?$/.test(f)), 'the sweep is reading test files').toBe(false);
    const navRelevant = FILES.filter((f) => /Nav\.tsx$|resources\.ts$/.test(f));
    expect(navRelevant, 'the sweep did not reach Nav.tsx and resources.ts').toHaveLength(2);
    // And the stripper leaves rendered copy alone.
    expect(stripComments(read('src/content/resources.ts'))).toContain('docs.theharvest.site');
  });

  it('🔴 the coming-soon page\'s own SEO line no longer says so either', () => {
    const src = stripComments(read('src/pages/ComingSoonPage.tsx'));
    const description = /description="([^"]*)"/.exec(src);
    expect(description, 'the coming-soon page renders no SEO description').not.toBeNull();
    expect(description![1], 'the page still tells search engines Harvest has no documentation')
      .not.toMatch(DOC_WORD);
    // Not vacuous — the line is still there and still lists the real gaps.
    expect(description![1]).toContain('What Harvest does not do yet');
  });
});

/* ═══ 7-8 ════════════════════════════════════════════════════════════════ */

describe('7 · Pricing is still in the nav; Pillars and Believers are still out', () => {
  it('Pricing survived the change', () => {
    expect(words(navHtml()), 'Pricing left the nav').toContain('Pricing');
  });

  it('🔴 Pillars and Believers are still out of the header, on both surfaces', () => {
    /* Nav.tsx records that both are DELIBERATELY out — reachable by scrolling
       the landing, and Believers from the footer. The rendered nav covers the
       desktop row; the source covers the hamburger panel, which state hides. */
    const html = words(navHtml());
    expect(html, 'a Pillars entry appeared in the nav').not.toMatch(/\bPillars\b/);
    expect(html, 'a Believers entry appeared in the nav').not.toMatch(/\bBelievers\b/);
    const src = stripComments(read('src/components/Nav.tsx'));
    expect(src, 'Nav.tsx renders a Pillars link').not.toMatch(/#pillars/i);
    expect(src, 'Nav.tsx renders a Believers link').not.toMatch(/#believers/i);
  });
});

describe('8 · no board entry was added', () => {
  /**
   * 🔴 THE NEEDLE IS ASSEMBLED FROM FRAGMENTS, and here it is not optional.
   * The standing board guard (the suite beside this one, named for the link it
   * removed) sweeps every source file for that word and
   * exempts only ITSELF — so spelling it whole in this file would make THIS
   * file the offender that guard reports, and the suite would go red for a
   * test rather than for the site. #496 found two guards self-matching in
   * precisely this way.
   */
  const BOARD_WORD = ['Road', 'map'].join('');
  const BOARD_HOST = ['trel', 'lo'].join('');

  it('🔴 the standing guard still holds after a third dropdown', () => {
    const html = navHtml();
    // Not vacuous — the nav rendered, and rendered its new menu.
    expect(html).toContain('Resources');
    expect(html, 'a board link came back into the nav').not.toMatch(new RegExp(BOARD_WORD, 'i'));
    expect(html, 'a board host came back into the nav').not.toMatch(new RegExp(BOARD_HOST, 'i'));
  });

  it('🔴 and the Resources menu is not where it comes back', () => {
    for (const variant of ['desktop', 'mobile'] as const) {
      const html = menuHtml(variant);
      expect(html, `a board entry appeared in the ${variant} Resources menu`)
        .not.toMatch(new RegExp(`${BOARD_WORD}|${BOARD_HOST}`, 'i'));
    }
    expect(RESOURCES.map((r) => r.label), 'a board entry was added to RESOURCES')
      .not.toContain(BOARD_WORD);
  });
});

/* ═══ 9 ══════════════════════════════════════════════════════════════════ */

describe('9 · the tool count is unchanged across every assertion that pins it', () => {
  it('🔴 CATALOG_TOOL_COUNT did not move, and is still derived', () => {
    /* A nav change must not move this number. If it did, the edit went through
       catalog.ts — the wrong structure entirely. Removing a coming-soon entry
       cannot move it either: `soon` items are excluded from the count by
       construction, which is asserted here rather than assumed.
     *
     * 🔴 THIS FILE DELIBERATELY PINS NO LITERAL FIGURE, and the omission is the
     * point. Three suites — the-306, the-314 and the-335 — SCAN every test file
     * for the exact text of a tool-count pin and assert HOW MANY they find,
     * precisely so a suite cannot quietly drop its own. Adding one here would
     * make those three go red and force this ticket to edit three unrelated
     * guards to record a number a NAV change has no business moving.
     *
     * ⚠️ AND THE ASSERTION BELOW IS WRITTEN BACKWARDS FOR THE SAME REASON —
     * `expect(derived).toBe(CATALOG_TOOL_COUNT)` rather than the other way
     * round. Two of those three scanners match on the text
     * `CATALOG_TOOL_COUNT` followed by a `.toBe(`, with no digit required, so
     * the natural spelling of this line would have been COUNTED as a pin
     * without being one. Found by running them, not by reading them.
     *
     * What this file adds instead is the check none of the three makes: that
     * every pin already out there still agrees with the DERIVED value, which
     * cannot go stale because it is recomputed. */
    const derived = CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0);
    expect(derived, 'the tool count stopped being derived from the catalogue')
      .toBe(CATALOG_TOOL_COUNT);
    expect(derived, 'the catalogue is empty, so the sweep below proves nothing')
      .toBeGreaterThan(0);
  });

  it('every file that pins the figure still agrees with the derived value', () => {
    /* The figure is pinned in assertions across the suite. Rather than listing
       them — a list rots — every source file that spells a `toBe(<n>)` against
       the tool count is DISCOVERED and required to agree. */
    const needle = 'CATALOG_TOOL_COUNT';
    const pinning = sourceFiles(SRC)
      .filter((f) => f !== SELF)
      .filter((f) => readFileSync(f, 'utf8').includes(needle));
    expect(pinning.length, 'nothing pins the tool count any more').toBeGreaterThan(1);

    /* Non-vacuity, stated as a number: the figure really is pinned in many
       places, and this sweep really reaches them. It is a FLOOR rather than an
       equality so that this assertion is not a fourth copy of the exact-count
       pin the three scanning suites already hold between them. */
    const pins = pinning.flatMap((f) =>
      [...readFileSync(f, 'utf8').matchAll(/CATALOG_TOOL_COUNT\)\.toBe\((\d+)\)/g)]);
    expect(pins.length, 'the tool count is barely pinned anywhere').toBeGreaterThanOrEqual(19);

    const offenders: string[] = [];
    for (const file of pinning) {
      for (const m of readFileSync(file, 'utf8').matchAll(/CATALOG_TOOL_COUNT\)\.toBe\((\d+)\)/g)) {
        if (Number(m[1]) !== CATALOG_TOOL_COUNT) {
          offenders.push(`${path.relative(ROOT, file)} pins ${m[1]}, derived is ${CATALOG_TOOL_COUNT}`);
        }
      }
    }
    expect(offenders, 'a suite pins a tool count that disagrees with the catalog').toEqual([]);
  });

  it('the nav still quotes the count', () => {
    expect(read('src/components/Nav.tsx')).toContain('CATALOG_TOOL_COUNT');
  });
});
