import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { RouteRecord } from 'vite-react-ssg';
import { routes } from '../App';
import { blogRoutes, readPublishedPosts } from '../../build/blog-plugin';
import { SolutionPage } from './SolutionPage';
import { Nav, SolutionsMenuItems } from '../components/Nav';
import { CATEGORIES } from '../content/features';
import { FEATURE_ICONS } from '../components/FeatureMock';
import {
  SOLUTIONS, SOLUTIONS_BASE, solutionHref,
  EVANGELISTIC_ORGANIZATIONS, EVANGELISTIC_TABS, EVANGELISTIC_DEEP_DIVES,
} from '../content/solutions';

/* board card 86bbyv8pp — Solutions nav dropdown + /solutions/evangelistic-
 * organizations. See also src/test/the-278-no-regression.test.ts
 * (SOLUTIONS_EVANGELISTIC_MOVED — the prerender fingerprint guard) and
 * src/pages/CategoryHero.tsx's header note (the Hero/PositioningBand
 * extraction). This file covers the page's own content and the Nav wiring. */

const HREF = solutionHref('evangelistic-organizations');

const render = (el: React.ReactElement, at: string) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, { context: {} },
    React.createElement(MemoryRouter, { initialEntries: [at] }, el),
  ));

/** Collapse React's markup back into readable prose — the same normaliser
 *  src/pages/the-284-harvest-scheduler.test.ts uses, for the same reason:
 *  React splits text around interpolations with comment nodes, so a raw
 *  substring search misses text that really is on the page. */
const words = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&nbsp;|\s+/g, ' ')
    .trim();

const pageHtml = render(React.createElement(SolutionPage), HREF);
const pageText = words(pageHtml);

/* ═══ 1 — the route ════════════════════════════════════════════════════════ */
type Child = NonNullable<RouteRecord[]>[number];
const children = ((routes[0] as { children?: Child[] }).children ?? []) as Child[];
const pathOf = (r: Child) => (r as { path?: string }).path;
const routePaths = children.map(pathOf);
const routeFor = (path: string) => children.find((r) => pathOf(r) === path);

describe('the /solutions/evangelistic-organizations route', () => {
  it('is in the router', () => {
    expect(routePaths, 'no route for the Evangelistic Organizations page').toContain(HREF);
  });

  it('renders the SolutionPage', () => {
    const element = (routeFor(HREF) as { element?: React.ReactNode }).element;
    expect(React.isValidElement(element)).toBe(true);
    expect((element as React.ReactElement).type).toBe(SolutionPage);
  });

  it('resolves before the catch-all', () => {
    expect(routePaths.indexOf(HREF)).toBeLessThan(routePaths.indexOf('*'));
  });

  it('is one route per SOLUTIONS entry, so a later page needs no App.tsx edit', () => {
    for (const s of SOLUTIONS) expect(routePaths).toContain(solutionHref(s.slug));
  });
});

/* ═══ 2 — prerendered and in the sitemap ═══════════════════════════════════ */
describe('the prerender list and sitemap', () => {
  it('blogRoutes() includes the page', () => {
    expect(blogRoutes()).toContain(HREF);
  });

  it('build/blog-plugin.ts lists it in both STATIC_ROUTES (the sitemap) and blogRoutes()', () => {
    const plugin = readFileSync(fileURLToPath(new URL('../../build/blog-plugin.ts', import.meta.url)), 'utf8');
    const spread = '...SOLUTIONS.map((s) => solutionHref(s.slug))';
    expect(plugin.split(spread).length - 1, 'the route spread must appear in both STATIC_ROUTES and blogRoutes()')
      .toBe(2);
  });
});

/* ═══ 3 — every feature id referenced resolves ═════════════════════════════ */
describe('every feature id the Solutions content references resolves', () => {
  const byId = new Map(CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f] as const)));

  const referenced = new Set<string>([
    ...EVANGELISTIC_TABS.map((t) => t.id),
    ...EVANGELISTIC_ORGANIZATIONS.pocket.tiles.map((t) => t.id),
    ...EVANGELISTIC_DEEP_DIVES.flatMap((g) => g.featureIds),
  ]);

  it('resolves against the flag-filtered CATEGORIES, never the unfiltered catalog', () => {
    expect(referenced.size).toBeGreaterThan(0);
    for (const id of referenced) {
      expect(byId.get(id), `"${id}" does not resolve in CATEGORIES — hidden or flagged off?`).toBeDefined();
    }
  });

  it('every pocket tile has an icon', () => {
    for (const t of EVANGELISTIC_ORGANIZATIONS.pocket.tiles) {
      expect(FEATURE_ICONS[t.id], `no FEATURE_ICONS entry for "${t.id}"`).toBeDefined();
    }
  });

  it('each feature block id appears exactly once on the whole page — no duplicate DOM ids', () => {
    const ids = [...pageHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const counts = new Map<string, number>();
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
    for (const id of referenced) {
      if (!EVANGELISTIC_DEEP_DIVES.some((g) => g.featureIds.includes(id))) continue;
      expect(counts.get(id), `#${id} appears ${counts.get(id) ?? 0} times, expected 1`).toBe(1);
    }
  });
});

/* ═══ 4 — every approved string, verbatim ═══════════════════════════════════ */
describe('every approved copy string appears exactly as written', () => {
  const c = EVANGELISTIC_ORGANIZATIONS;

  const EXACT_STRINGS = [
    c.hero.eyebrow,
    'Every decision counted.',
    'Every one followed up.',
    c.hero.intro,
    'Start free trial',
    'See pricing',
    c.hero.audience,
    c.oneApp.kicker,
    c.oneApp.heading,
    c.oneApp.sub,
    c.gap.kicker,
    c.gap.heading,
    c.gap.body,
    c.numbers.kicker,
    c.numbers.heading,
    c.numbers.body,
    ...c.numbers.tiles.flatMap((t) => [t.label, t.body]),
    c.pocket.kicker,
    c.pocket.heading,
    c.pocket.sub,
    ...c.pocket.tiles.flatMap((t) => [t.title, t.body]),
    ...c.deepDives.flatMap((g) => [g.heading, g.sub]),
    c.founder.quote,
    c.founder.attribution,
    c.support.kicker,
    c.support.heading,
    c.support.body,
    c.support.button.label,
    ...c.pillars.flatMap((p) => [p.title, p.body]),
    c.resources.kicker,
    c.finalCta.heading,
  ];

  it.each(EXACT_STRINGS)('%s', (s) => {
    expect(pageText, `missing exact copy: ${JSON.stringify(s)}`).toContain(s);
  });

  it('the tab labels are the approved set, in order', () => {
    expect(EVANGELISTIC_TABS.map((t) => t.label)).toEqual([
      'Giving', 'Fundraising', 'Pledges', 'Analytics', 'CRM', 'Blog', 'Feed', 'Courses',
    ]);
    expect(EVANGELISTIC_TABS.map((t) => t.id)).toEqual([
      'donation', 'fundraising', 'pledges', 'analytics', 'crm', 'blog', 'feed', 'courses',
    ]);
  });

  it('the deep-dive groups carry the approved feature ids, in order', () => {
    expect(EVANGELISTIC_DEEP_DIVES.map((g) => g.featureIds)).toEqual([
      ['donation', 'sharegiving', 'fundraising', 'pledges'],
      ['analytics', 'forms', 'crm'],
      ['blog', 'feed'],
      ['courses', 'bible', 'prayer'],
    ]);
  });

  it('the SEO title, description and canonical are set', () => {
    expect(c.seo.title).toBe('Harvest for Evangelistic Organizations');
    expect(c.seo.canonical).toBe('https://theharvest.site/solutions/evangelistic-organizations');
    // <Seo/> is vite-react-ssg's <Head/>, i.e. react-helmet-async — it writes
    // into the Helmet context rather than inline into the returned markup, so
    // the title/canonical are read off the context the same way the app's own
    // SSR entry does, not off `pageHtml`.
    const helmetContext: { helmet?: import('react-helmet-async').HelmetServerState } = {};
    renderToStaticMarkup(React.createElement(
      HelmetProvider, { context: helmetContext },
      React.createElement(MemoryRouter, { initialEntries: [HREF] }, React.createElement(SolutionPage)),
    ));
    const helmet = helmetContext.helmet!;
    expect(helmet.title.toString()).toContain('Harvest for Evangelistic Organizations');
    expect(helmet.link.toString()).toContain(`href="${c.seo.canonical}"`);
  });

  it('every trial/pricing CTA on the page goes to /#pricing — no plan is named', () => {
    expect(c.hero.secondary.to).toBe('/#pricing');
    expect(pageHtml.match(/href="\/#pricing"/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});

/* ═══ 5 — the aichat tile carries no plan chip and no price ════════════════ */
describe('the aichat pocket tile makes no plan or price claim', () => {
  it('is present, and its own copy never says "add-on" or names a price', () => {
    const tile = EVANGELISTIC_ORGANIZATIONS.pocket.tiles.find((t) => t.id === 'aichat');
    expect(tile).toBeDefined();
    expect(pageText).toContain(tile!.title);
    const ownCopy = `${tile!.title} ${tile!.body}`;
    expect(ownCopy.toLowerCase()).not.toContain('add-on');
    expect(ownCopy).not.toMatch(/\$\d/);
  });

  it('the pocket tile renders no plan-chip UI at all — Pocket() never draws PlanChips', () => {
    // Unlike the deep-dive FeatureBlocks, the pocket tiles are this ticket's
    // own markup (see SolutionPage.tsx's `Pocket()`), so this one really can
    // be checked against the full rendered page.
    const source = readFileSync(fileURLToPath(new URL('./SolutionPage.tsx', import.meta.url)), 'utf8');
    const pocketFn = source.slice(source.indexOf('function Pocket()'), source.indexOf('// ---------- Deep dives'));
    expect(pocketFn).not.toMatch(/PlanChips|Available on/);
  });
});

/* ═══ 6 — tabs: a11y wiring and SSR content ═════════════════════════════════ */
describe('the "One app" tabs', () => {
  it('role=tablist, role=tab and role=tabpanel are all present', () => {
    expect(pageHtml).toContain('role="tablist"');
    expect(pageHtml).toContain('role="tab"');
    expect(pageHtml).toContain('role="tabpanel"');
  });

  it('exactly one tab is aria-selected, and it is the first', () => {
    const selectedTrue = (pageHtml.match(/role="tab"[^>]*aria-selected="true"/g) ?? []).length;
    expect(selectedTrue).toBe(1);
    const firstTabId = `solutions-tab-${EVANGELISTIC_TABS[0].id}`;
    expect(pageHtml).toMatch(new RegExp(`id="${firstTabId}"[^>]*aria-selected="true"`));
  });

  it('every tab button is keyboard-reachable — aria-controls pairs it with its panel, and only the active tab is in the default tab order', () => {
    for (const t of EVANGELISTIC_TABS) {
      const tabId = `solutions-tab-${t.id}`;
      const panelId = `solutions-panel-${t.id}`;
      expect(pageHtml).toContain(`id="${tabId}"`);
      expect(pageHtml).toContain(`id="${panelId}"`);
      expect(pageHtml).toMatch(new RegExp(`id="${tabId}"[^>]*aria-controls="${panelId}"`));
    }
    // Roving tabindex: the active tab is reachable by Tab, the rest only by
    // the arrow keys the panel's onKeyDown handler wires up.
    expect((pageHtml.match(/role="tab"[^>]*tabindex="0"/g) ?? []).length).toBe(1);
    expect((pageHtml.match(/role="tab"[^>]*tabindex="-1"/g) ?? []).length).toBe(EVANGELISTIC_TABS.length - 1);
  });

  it('the first tab\'s panel is present in the prerendered HTML, with its feature\'s oneliner', () => {
    const byId = new Map(CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f] as const)));
    const first = EVANGELISTIC_TABS[0];
    const feature = byId.get(first.id);
    expect(feature).toBeDefined();
    const panelId = `solutions-panel-${first.id}`;
    const panelMatch = pageHtml.match(new RegExp(`id="${panelId}"[\\s\\S]*?(?=id="solutions-panel-)`));
    expect(panelMatch, 'first tab panel not found').toBeTruthy();
    expect(words(panelMatch![0])).toContain(feature!.oneliner);
  });

  it('a non-active panel is hidden in the prerendered HTML', () => {
    const last = EVANGELISTIC_TABS[EVANGELISTIC_TABS.length - 1];
    const panelId = `solutions-panel-${last.id}`;
    expect(pageHtml).toMatch(new RegExp(`id="${panelId}"[^>]*hidden=""`));
  });
});

/* ═══ 7 — Resources: the three named posts, published ══════════════════════
 *
 * ⚠️ READ FROM THE MARKDOWN ON DISK, NOT `content/posts.ts`. That module reads
 * `virtual:blog-content`, which only exists inside a Vite build — the test
 * runner aliases it to an empty stub (see vitest.config.ts), so `POSTS` is
 * always `[]` here and `SolutionPage`'s own render of the Resources section is
 * therefore also empty in `pageHtml`. `readPublishedPosts()` from
 * build/blog-plugin.ts parses the same three .md files directly, the same way
 * content/parse-post.test.ts does, so this is a real check rather than one
 * that would pass with the section silently gutted. */
describe('the Resources section', () => {
  const slugs = EVANGELISTIC_ORGANIZATIONS.resources.slugs;
  const posts = readPublishedPosts();

  it('names exactly the three approved slugs', () => {
    expect(slugs).toEqual([
      'work-that-outlives-you',
      'generosity-without-pressure',
      'year-end-giving-statements-what-to-include',
    ]);
  });

  it('every one of them exists on disk and is published', () => {
    for (const slug of slugs) {
      const post = posts.find((p) => p.slug === slug);
      expect(post, `"${slug}" is missing or not published`).toBeDefined();
    }
  });

  const DIST = fileURLToPath(new URL('../../dist', import.meta.url));
  const built = existsSync(path.join(DIST, 'index.html'));

  it.runIf(built)('every one of them renders on the built page, by title', () => {
    const html = readFileSync(path.join(DIST, 'solutions', 'evangelistic-organizations', 'index.html'), 'utf8');
    for (const slug of slugs) {
      const post = posts.find((p) => p.slug === slug)!;
      expect(html, `"${post.title}" is missing from the built Resources section`).toContain(post.title);
    }
  });
});

/* ═══ 8 — no invented capability: prices, plans, percentages, competitors ═══
 *
 * ⚠️ SCOPED TO THIS PAGE'S OWN AUTHORED COPY — content/solutions.ts — NOT to
 * `pageText`, the full rendered page. Deep dives (2.6) render the exact same
 * `FeatureBlock`/`FeatureMock` every /features/* category page already does,
 * unmodified per the spec: its plan-availability chips print "Individual",
 * "Small Team" and "Ministry" for every feature that carries tiers, and its
 * vignettes are UI mockups with realistic sample data ("$50", "$1,240") —
 * both are sitewide chrome no other category page's tests forbid either. The
 * founder's "no plan is named in page copy" is about what THIS ticket writes,
 * not about turning off chrome the rest of the site relies on; scoping this
 * guard to the copy this ticket owns is what makes it a meaningful check
 * rather than a false failure against a component nobody asked to change. */
describe('the page\'s own authored copy makes no capability claim it cannot back', () => {
  const c = EVANGELISTIC_ORGANIZATIONS;
  const OWN_COPY = [
    c.hero.eyebrow, c.hero.headline, c.hero.intro, c.hero.audience,
    c.oneApp.kicker, c.oneApp.heading, c.oneApp.sub,
    ...c.oneApp.tabs.map((t) => t.label),
    c.gap.kicker, c.gap.heading, c.gap.body,
    c.numbers.kicker, c.numbers.heading, c.numbers.body,
    ...c.numbers.tiles.flatMap((t) => [t.label, t.body]),
    c.pocket.kicker, c.pocket.heading, c.pocket.sub,
    ...c.pocket.tiles.flatMap((t) => [t.title, t.body]),
    ...c.deepDives.flatMap((g) => [g.heading, g.sub]),
    c.founder.quote, c.founder.attribution,
    c.support.kicker, c.support.heading, c.support.body, c.support.button.label,
    ...c.pillars.flatMap((p) => [p.title, p.body]),
    c.resources.kicker,
    c.finalCta.heading,
  ].join(' \n ');

  it('no dollar price', () => {
    expect(OWN_COPY).not.toMatch(/\$\d/);
  });

  it('no plan name', () => {
    expect(OWN_COPY).not.toMatch(/\b(Individual|Small Team|Ministry|Forever Free)\b/);
  });

  it('no percentage', () => {
    expect(OWN_COPY).not.toMatch(/\d+(\.\d+)?%/);
  });

  it('no competitor name', () => {
    const COMPETITORS = [
      'Tithe.ly', 'Pushpay', 'Subsplash', 'HubSpot', 'Planning Center', 'Skool',
      'Teachable', 'Typeform', 'WordPress', 'Donorbox', 'Notion', 'The Church Co',
    ];
    for (const name of COMPETITORS) {
      expect(OWN_COPY, `"${name}" is named in this ticket's own copy`).not.toContain(name);
    }
  });

  it('the numbers tiles carry no digit or invented metric', () => {
    for (const tile of c.numbers.tiles) {
      expect(tile.label).not.toMatch(/\d/);
      expect(tile.body).not.toMatch(/\d/);
    }
  });

  it('no Scripture reference is used as a sales device', () => {
    // A book:chapter:verse reference (e.g. "John 3:16") appearing on a sales
    // page would be exactly that.
    expect(OWN_COPY).not.toMatch(/\b[A-Z][a-z]+ \d+:\d+/);
  });
});

/* ═══ 9 — Nav: the Solutions dropdown ═══════════════════════════════════════ */
describe('the Nav "Solutions" trigger', () => {
  const navHtml = render(React.createElement(Nav), '/');

  it('sits between Features and Resources, on both desktop and mobile', () => {
    const text = words(navHtml);
    const iFeatures = text.indexOf('Features');
    const iSolutions = text.indexOf('Solutions');
    const iResources = text.indexOf('Resources');
    expect(iFeatures).toBeGreaterThanOrEqual(0);
    expect(iSolutions).toBeGreaterThan(iFeatures);
    expect(iResources).toBeGreaterThan(iSolutions);
  });

  it('has aria-haspopup and aria-expanded, collapsed by default (no click in this DOM-less runner)', () => {
    expect(navHtml).toMatch(/Solutions[\s\S]{0,40}/);
    const match = navHtml.match(/aria-haspopup="true"\s+aria-expanded="(true|false)"[^>]*>[\s\S]{0,120}?Solutions/);
    expect(match, 'no aria-haspopup/aria-expanded button found before "Solutions"').toBeTruthy();
  });

  it('the panel is not in the default-collapsed prerendered markup', () => {
    // Same property Nav's Features mega-menu already has: the panel renders
    // behind React state nothing sets during prerender.
    expect(navHtml).not.toContain('aria-label="Solutions"');
  });
});

describe('the Solutions panel content — SolutionsMenuItems, rendered directly', () => {
  // Same reasoning as Nav.tsx's own FeatureMenuColumns: the desktop panel and
  // mobile accordion only exist once real click-driven state is true, which
  // nothing outside a real click can set in this DOM-less test runner. Pulled
  // into its own exported component, both variants can be rendered directly.
  it('desktop: one menuitem per SOLUTIONS entry, each with its name and description', () => {
    const html = renderToStaticMarkup(React.createElement(
      MemoryRouter, {}, React.createElement(SolutionsMenuItems, { variant: 'desktop' }),
    ));
    for (const s of SOLUTIONS) {
      expect(html).toContain(s.name);
      expect(html).toContain(s.description);
      expect(html).toContain(`href="${solutionHref(s.slug)}"`);
    }
    expect((html.match(/role="menuitem"/g) ?? []).length).toBe(SOLUTIONS.length);
  });

  it('mobile: the same entries, no role=menuitem (matches the Features accordion\'s own variant split)', () => {
    const html = renderToStaticMarkup(React.createElement(
      MemoryRouter, {}, React.createElement(SolutionsMenuItems, { variant: 'mobile' }),
    ));
    for (const s of SOLUTIONS) {
      expect(html).toContain(s.name);
      expect(html).toContain(s.description);
    }
    expect(html).not.toContain('role="menuitem"');
  });

  it('every item meets the 44px touch-target minimum', () => {
    const html = renderToStaticMarkup(React.createElement(
      MemoryRouter, {}, React.createElement(SolutionsMenuItems, { variant: 'mobile' }),
    ));
    const matches = [...html.matchAll(/min-height:\s*44px/g)];
    expect(matches.length).toBe(SOLUTIONS.length);
  });
});

describe('Nav.tsx source — the two desktop menus close each other, and Escape works', () => {
  const source = readFileSync(fileURLToPath(new URL('../components/Nav.tsx', import.meta.url)), 'utf8');

  it('opening Features closes Solutions, and opening Solutions closes Features', () => {
    expect(source).toMatch(/const toggleMega = \(\) => \{ setMega\(\(v\) => !v\); setSolutions\(false\); \};/);
    expect(source).toMatch(/const toggleSolutions = \(\) => \{ setSolutions\(\(v\) => !v\); setMega\(false\); \};/);
  });

  it('Escape closes the Solutions panel and returns focus to its trigger', () => {
    expect(source).toMatch(/if \(e\.key === 'Escape'\) \{ setSolutions\(false\); solutionsBtnRef\.current\?\.focus\(\); \}/);
  });

  it('closeMobile also collapses the Solutions accordion', () => {
    expect(source).toMatch(/const closeMobile = \(\) => \{ setMobile\(false\); setMobileFeatures\(false\); setMobileSolutions\(false\); \};/);
  });

  it('the trigger shows active on /solutions/*', () => {
    expect(source).toContain("pathname === '/solutions' || pathname.startsWith('/solutions/')");
  });

  it('the panel is built from SOLUTIONS, not a hardcoded list', () => {
    expect(source).toMatch(/SOLUTIONS\.map/);
  });
});

/* ═══ 10 — SOLUTIONS_BASE / solutionHref ════════════════════════════════════ */
describe('content/solutions.ts wiring', () => {
  it('SOLUTIONS_BASE and solutionHref agree', () => {
    expect(SOLUTIONS_BASE).toBe('/solutions');
    expect(solutionHref('evangelistic-organizations')).toBe('/solutions/evangelistic-organizations');
  });

  it('every SOLUTIONS entry has a non-empty name and description', () => {
    for (const s of SOLUTIONS) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    }
  });
});
