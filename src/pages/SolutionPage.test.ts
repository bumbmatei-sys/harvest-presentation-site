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
import { FEATURE_ICONS, MOCKS } from '../components/FeatureMock';
import {
  SOLUTIONS, SOLUTIONS_BASE, solutionHref, SOLUTION_PAGES, type SolutionPageContent,
  EVANGELISTIC_ORGANIZATIONS, CHURCHES,
} from '../content/solutions';

/* board card 86bbyv8pp — Solutions nav dropdown, /solutions/evangelistic-
 * organizations, and (part two of the same card) /solutions/churches. See
 * also src/test/the-278-no-regression.test.ts (SOLUTIONS_EVANGELISTIC_MOVED
 * and SOLUTIONS_CHURCHES_MOVED — the prerender fingerprint guards) and
 * src/pages/CategoryHero.tsx's header note (the Hero/PositioningBand
 * extraction). This file covers every solution page's own content plus the
 * Nav wiring shared by all of them.
 *
 * ⚠️ DATA-DRIVEN, LIKE THE PAGE IT TESTS. SolutionPage.tsx no longer hardcodes
 * the Evangelistic Organizations content — it reads `SOLUTION_PAGES[slug]` —
 * so most of this file's checks run once per entry in `SOLUTIONS` rather than
 * being written out twice. Where a check is genuinely page-specific (exact
 * tab order, exact deep-dive feature ids, the approved copy), it stays a
 * literal expectation per page rather than being derived from the very
 * content it is meant to catch a typo in. */

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

type Child = NonNullable<RouteRecord[]>[number];
const children = ((routes[0] as { children?: Child[] }).children ?? []) as Child[];
const pathOf = (r: Child) => (r as { path?: string }).path;
const routePaths = children.map(pathOf);
const routeFor = (path: string) => children.find((r) => pathOf(r) === path);

const FEATURES_BY_ID = new Map(CATEGORIES.flatMap((c) => c.features.map((f) => [f.id, f] as const)));

/** One page's fixture: its content, its rendered markup, and the exact tab /
 *  deep-dive shape the ticket approved for it — asserted literally so a typo
 *  in content/solutions.ts fails here rather than being re-derived away. */
interface PageFixture {
  slug: string;
  content: SolutionPageContent;
  tabLabels: readonly string[];
  tabIds: readonly string[];
  deepDiveFeatureIds: readonly (readonly string[])[];
  resourceSlugs: readonly string[];
  exactStrings: readonly string[];
}

const EVANGELISTIC_FIXTURE: PageFixture = {
  slug: 'evangelistic-organizations',
  content: EVANGELISTIC_ORGANIZATIONS,
  tabLabels: ['Giving', 'Fundraising', 'Pledges', 'Analytics', 'CRM', 'Blog', 'Feed', 'Courses'],
  tabIds: ['donation', 'fundraising', 'pledges', 'analytics', 'crm', 'blog', 'feed', 'courses'],
  deepDiveFeatureIds: [
    ['donation', 'sharegiving', 'fundraising', 'pledges'],
    ['analytics', 'forms', 'crm'],
    ['blog', 'feed'],
    ['courses', 'bible', 'prayer'],
  ],
  resourceSlugs: [
    'work-that-outlives-you',
    'generosity-without-pressure',
    'year-end-giving-statements-what-to-include',
  ],
  exactStrings: [
    EVANGELISTIC_ORGANIZATIONS.hero.eyebrow,
    'Every decision counted.',
    'Every one followed up.',
    EVANGELISTIC_ORGANIZATIONS.hero.intro,
    'See pricing',
    EVANGELISTIC_ORGANIZATIONS.hero.audience,
  ],
};

const CHURCHES_FIXTURE: PageFixture = {
  slug: 'churches',
  content: CHURCHES,
  tabLabels: ['Giving', 'Feed', 'Check-in', 'Groups', 'Services', 'Livestream', 'Events', 'CRM'],
  tabIds: ['donation', 'feed', 'checkin', 'groups', 'services', 'livestream', 'events', 'crm'],
  deepDiveFeatureIds: [
    ['donation', 'sharegiving', 'fundraising', 'pledges'],
    ['services', 'checkin', 'livestream', 'events'],
    ['feed', 'groups', 'prayer'],
    ['crm', 'dashboard', 'forms'],
    ['courses', 'bible', 'docs'],
  ],
  resourceSlugs: [
    'generosity-without-pressure',
    'year-end-giving-statements-what-to-include',
  ],
  exactStrings: [
    CHURCHES.hero.eyebrow,
    CHURCHES.hero.headline,
    CHURCHES.hero.intro,
    'See pricing',
    CHURCHES.hero.audience,
  ],
};

const FIXTURES: readonly PageFixture[] = [EVANGELISTIC_FIXTURE, CHURCHES_FIXTURE];

/* ═══ 0 — content/solutions.ts wiring: every SOLUTIONS slug has a page, and
 * every SOLUTION_PAGES entry has a SOLUTIONS listing ════════════════════ */
describe('SOLUTIONS and SOLUTION_PAGES agree', () => {
  it('every SOLUTIONS slug has a SOLUTION_PAGES entry', () => {
    for (const s of SOLUTIONS) {
      expect(SOLUTION_PAGES[s.slug], `no SOLUTION_PAGES entry for "${s.slug}"`).toBeDefined();
      expect(SOLUTION_PAGES[s.slug].slug).toBe(s.slug);
    }
  });

  it('every SOLUTION_PAGES entry has a SOLUTIONS listing', () => {
    const slugs = new Set(SOLUTIONS.map((s) => s.slug));
    for (const slug of Object.keys(SOLUTION_PAGES)) {
      expect(slugs.has(slug), `SOLUTION_PAGES["${slug}"] has no SOLUTIONS entry`).toBe(true);
    }
  });

  it('SOLUTIONS_BASE and solutionHref agree', () => {
    expect(SOLUTIONS_BASE).toBe('/solutions');
    expect(solutionHref('evangelistic-organizations')).toBe('/solutions/evangelistic-organizations');
    expect(solutionHref('churches')).toBe('/solutions/churches');
  });

  it('every SOLUTIONS entry has a non-empty name and description', () => {
    for (const s of SOLUTIONS) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
    }
  });
});

for (const fixture of FIXTURES) {
  const { slug, content: c, tabLabels, tabIds, deepDiveFeatureIds, resourceSlugs, exactStrings } = fixture;
  const HREF = solutionHref(slug);
  const pageHtml = render(React.createElement(SolutionPage, { slug }), HREF);
  const pageText = words(pageHtml);

  describe(`/solutions/${slug}`, () => {
    /* ═══ 1 — the route ══════════════════════════════════════════════════ */
    describe('the route', () => {
      it('is in the router', () => {
        expect(routePaths, `no route for ${HREF}`).toContain(HREF);
      });

      it('renders the SolutionPage', () => {
        const element = (routeFor(HREF) as { element?: React.ReactNode }).element;
        expect(React.isValidElement(element)).toBe(true);
        expect((element as React.ReactElement).type).toBe(SolutionPage);
        expect((element as React.ReactElement).props).toEqual({ slug });
      });

      it('resolves before the catch-all', () => {
        expect(routePaths.indexOf(HREF)).toBeLessThan(routePaths.indexOf('*'));
      });
    });

    /* ═══ 2 — prerendered and in the sitemap ═══════════════════════════════ */
    describe('the prerender list and sitemap', () => {
      it('blogRoutes() includes the page', () => {
        expect(blogRoutes()).toContain(HREF);
      });
    });

    /* ═══ 3 — every feature id referenced resolves, and no duplicate DOM ids ═ */
    describe('every feature id this page references resolves', () => {
      const referenced = new Set<string>([
        ...tabIds,
        ...c.pocket.tiles.map((t) => t.id),
        ...deepDiveFeatureIds.flat(),
      ]);

      it('resolves against the flag-filtered CATEGORIES, never the unfiltered catalog', () => {
        expect(referenced.size).toBeGreaterThan(0);
        for (const id of referenced) {
          expect(FEATURES_BY_ID.get(id), `"${id}" does not resolve in CATEGORIES — hidden or flagged off?`).toBeDefined();
        }
      });

      it('every pocket tile has an icon', () => {
        for (const t of c.pocket.tiles) {
          expect(FEATURE_ICONS[t.id], `no FEATURE_ICONS entry for "${t.id}"`).toBeDefined();
        }
      });

      it('each deep-dive feature block id appears exactly once on the page — no duplicate DOM ids', () => {
        const ids = [...pageHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
        const counts = new Map<string, number>();
        for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
        for (const id of deepDiveFeatureIds.flat()) {
          expect(counts.get(id), `#${id} appears ${counts.get(id) ?? 0} times, expected 1`).toBe(1);
        }
      });
    });

    /* ═══ 4 — approved copy, verbatim ═══════════════════════════════════════ */
    describe('every approved copy string appears exactly as written', () => {
      const EXACT_STRINGS = [
        ...exactStrings,
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

      it('the tab labels and ids are the approved set, in order', () => {
        expect(c.oneApp.tabs.map((t) => t.label)).toEqual([...tabLabels]);
        expect(c.oneApp.tabs.map((t) => t.id)).toEqual([...tabIds]);
      });

      it('the deep-dive groups carry the approved feature ids, in order', () => {
        expect(c.deepDives.map((g) => g.featureIds)).toEqual(deepDiveFeatureIds.map((ids) => [...ids]));
      });

      it('the SEO title, description and canonical are set', () => {
        expect(c.seo.canonical).toBe(`https://theharvest.site${HREF}`);
        // <Seo/> is vite-react-ssg's <Head/>, i.e. react-helmet-async — it writes
        // into the Helmet context rather than inline into the returned markup, so
        // the title/canonical are read off the context the same way the app's own
        // SSR entry does, not off `pageHtml`.
        const helmetContext: { helmet?: import('react-helmet-async').HelmetServerState } = {};
        renderToStaticMarkup(React.createElement(
          HelmetProvider, { context: helmetContext },
          React.createElement(MemoryRouter, { initialEntries: [HREF] }, React.createElement(SolutionPage, { slug })),
        ));
        const helmet = helmetContext.helmet!;
        expect(helmet.title.toString()).toContain(c.seo.title);
        expect(helmet.link.toString()).toContain(`href="${c.seo.canonical}"`);
      });

      it('every trial/pricing CTA on the page goes to /#pricing — no plan is named', () => {
        expect(c.hero.secondary.to).toBe('/#pricing');
        expect(pageHtml.match(/href="\/#pricing"/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
      });
    });

    /* ═══ 5 — the aichat tile carries no plan chip and no price ════════════ */
    describe('the aichat pocket tile (when present) makes no plan or price claim', () => {
      const tile = c.pocket.tiles.find((t) => t.id === 'aichat');

      it.runIf(!!tile)('its own copy never says "add-on" or names a price', () => {
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
        const pocketFn = source.slice(source.indexOf('function Pocket('), source.indexOf('// ---------- Deep dives'));
        expect(pocketFn).not.toMatch(/PlanChips|Available on/);
      });
    });

    /* ═══ 6 — tabs: a11y wiring and SSR content ═════════════════════════════ */
    describe('the "One app" tabs', () => {
      it('role=tablist, role=tab and role=tabpanel are all present', () => {
        expect(pageHtml).toContain('role="tablist"');
        expect(pageHtml).toContain('role="tab"');
        expect(pageHtml).toContain('role="tabpanel"');
      });

      it('exactly one tab is aria-selected, and it is the first', () => {
        const selectedTrue = (pageHtml.match(/role="tab"[^>]*aria-selected="true"/g) ?? []).length;
        expect(selectedTrue).toBe(1);
        const firstTabId = `solutions-tab-${c.oneApp.tabs[0].id}`;
        expect(pageHtml).toMatch(new RegExp(`id="${firstTabId}"[^>]*aria-selected="true"`));
      });

      it('every tab button is keyboard-reachable — aria-controls pairs it with its panel, and only the active tab is in the default tab order', () => {
        for (const t of c.oneApp.tabs) {
          const tabId = `solutions-tab-${t.id}`;
          const panelId = `solutions-panel-${t.id}`;
          expect(pageHtml).toContain(`id="${tabId}"`);
          expect(pageHtml).toContain(`id="${panelId}"`);
          expect(pageHtml).toMatch(new RegExp(`id="${tabId}"[^>]*aria-controls="${panelId}"`));
        }
        // Roving tabindex: the active tab is reachable by Tab, the rest only by
        // the arrow keys the panel's onKeyDown handler wires up.
        expect((pageHtml.match(/role="tab"[^>]*tabindex="0"/g) ?? []).length).toBe(1);
        expect((pageHtml.match(/role="tab"[^>]*tabindex="-1"/g) ?? []).length).toBe(c.oneApp.tabs.length - 1);
      });

      it('the first tab\'s panel is present in the prerendered HTML, with its feature\'s oneliner', () => {
        const first = c.oneApp.tabs[0];
        const feature = FEATURES_BY_ID.get(first.id);
        expect(feature).toBeDefined();
        const panelId = `solutions-panel-${first.id}`;
        const panelMatch = pageHtml.match(new RegExp(`id="${panelId}"[\\s\\S]*?(?=id="solutions-panel-)`));
        expect(panelMatch, 'first tab panel not found').toBeTruthy();
        expect(words(panelMatch![0])).toContain(feature!.oneliner);
      });

      it('a non-active panel is hidden in the prerendered HTML', () => {
        const last = c.oneApp.tabs[c.oneApp.tabs.length - 1];
        const panelId = `solutions-panel-${last.id}`;
        expect(pageHtml).toMatch(new RegExp(`id="${panelId}"[^>]*hidden=""`));
      });

      it('no tab id\'s FeatureMock renders null — every mock the tab list references actually draws something', () => {
        // OneAppTabs only calls <FeatureMock id={t.id}/> when `MOCKS[t.id]` is
        // truthy or `t.id === 'groups'` (FeatureMock's own special case for
        // GroupsMock — see the header note on that gate in SolutionPage.tsx).
        // Checked against the real MOCKS export rather than the rendered
        // markup, which can't distinguish "no mock" from "a mock that happens
        // to render nothing visible".
        for (const t of c.oneApp.tabs) {
          const hasMock = !!MOCKS[t.id] || t.id === 'groups';
          expect(hasMock, `FeatureMock has no entry for tab "${t.id}" — it would render an empty panel`).toBe(true);
        }
      });
    });

    /* ═══ 7 — Resources: the approved slugs, published ═════════════════════
     *
     * ⚠️ READ FROM THE MARKDOWN ON DISK, NOT `content/posts.ts`. That module
     * reads `virtual:blog-content`, which only exists inside a Vite build —
     * the test runner aliases it to an empty stub (see vitest.config.ts), so
     * `POSTS` is always `[]` here and `SolutionPage`'s own render of the
     * Resources section is therefore also empty in `pageHtml`.
     * `readPublishedPosts()` from build/blog-plugin.ts parses the same .md
     * files directly, the same way content/parse-post.test.ts does, so this
     * is a real check rather than one that would pass with the section
     * silently gutted. */
    describe('the Resources section', () => {
      const posts = readPublishedPosts();

      it('names exactly the approved slugs', () => {
        expect(c.resources.slugs).toEqual(resourceSlugs);
      });

      it('every one of them exists on disk and is published', () => {
        for (const s of c.resources.slugs) {
          const post = posts.find((p) => p.slug === s);
          expect(post, `"${s}" is missing or not published`).toBeDefined();
        }
      });

      const DIST = fileURLToPath(new URL('../../dist', import.meta.url));
      const built = existsSync(path.join(DIST, 'index.html'));
      const builtSlugParts = slug.split('/');

      it.runIf(built)('every one of them renders on the built page, by title', () => {
        const html = readFileSync(path.join(DIST, 'solutions', ...builtSlugParts, 'index.html'), 'utf8');
        for (const s of c.resources.slugs) {
          const post = posts.find((p) => p.slug === s)!;
          expect(html, `"${post.title}" is missing from the built Resources section`).toContain(post.title);
        }
      });
    });

    /* ═══ 8 — no invented capability: prices, plans, percentages, competitors ═
     *
     * ⚠️ SCOPED TO THIS PAGE'S OWN AUTHORED COPY — content/solutions.ts — NOT
     * to `pageText`, the full rendered page. Deep dives render the exact same
     * `FeatureBlock`/`FeatureMock` every /features/* category page already
     * does, unmodified per the spec: its plan-availability chips print
     * "Individual", "Small Team" and "Ministry" for every feature that carries
     * tiers, and its vignettes are UI mockups with realistic sample data
     * ("$50", "$1,240") — both are sitewide chrome no other category page's
     * tests forbid either. The founder's "no plan is named in page copy" is
     * about what THIS ticket writes, not about turning off chrome the rest of
     * the site relies on; scoping this guard to the copy this ticket owns is
     * what makes it a meaningful check rather than a false failure against a
     * component nobody asked to change. */
    describe('the page\'s own authored copy makes no capability claim it cannot back', () => {
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
        /* ⚠️ CHURCHES' founder note says "hundreds of dollars every month" —
           prose about the cost of the OLD stack of tools it replaces, not a
           price Harvest charges. Allowed by matching that exact sentence and
           stripping only it before the `$\d` check runs, per the ticket:
           "Allow it by exact sentence, not by loosening the $ rule." Any other
           dollar figure anywhere else in this page's own copy still fails. */
        const HUNDREDS_OF_DOLLARS_SENTENCE = "shouldn't have to pay hundreds of dollars every month across a stack of subscriptions just to run";
        const scrubbed = OWN_COPY.includes(HUNDREDS_OF_DOLLARS_SENTENCE)
          ? OWN_COPY.split(HUNDREDS_OF_DOLLARS_SENTENCE).join('')
          : OWN_COPY;
        if (slug === 'churches') {
          expect(OWN_COPY, 'the allowlisted sentence must actually be present to be worth allowlisting')
            .toContain(HUNDREDS_OF_DOLLARS_SENTENCE);
        }
        expect(scrubbed).not.toMatch(/\$\d/);
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

      it('the numbers/tiles section carries no digit or invented metric', () => {
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
  });
}

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
  it('desktop: one menuitem per SOLUTIONS entry, IN SOLUTIONS ORDER, each with its name and description', () => {
    const html = renderToStaticMarkup(React.createElement(
      MemoryRouter, {}, React.createElement(SolutionsMenuItems, { variant: 'desktop' }),
    ));
    for (const s of SOLUTIONS) {
      expect(html).toContain(s.name);
      expect(html).toContain(s.description);
      expect(html).toContain(`href="${solutionHref(s.slug)}"`);
    }
    const order = SOLUTIONS.map((s) => html.indexOf(`href="${solutionHref(s.slug)}"`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect((html.match(/role="menuitem"/g) ?? []).length).toBe(SOLUTIONS.length);
  });

  it('mobile: the same entries, IN SOLUTIONS ORDER, no role=menuitem (matches the Features accordion\'s own variant split)', () => {
    const html = renderToStaticMarkup(React.createElement(
      MemoryRouter, {}, React.createElement(SolutionsMenuItems, { variant: 'mobile' }),
    ));
    for (const s of SOLUTIONS) {
      expect(html).toContain(s.name);
      expect(html).toContain(s.description);
    }
    const order = SOLUTIONS.map((s) => html.indexOf(`href="${solutionHref(s.slug)}"`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
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

/* ═══ 10 — one route per SOLUTIONS entry ═══════════════════════════════════ */
describe('one route per SOLUTIONS entry, so a later page needs no App.tsx edit', () => {
  it('every SOLUTIONS slug has a route, before the catch-all', () => {
    for (const s of SOLUTIONS) {
      const href = solutionHref(s.slug);
      expect(routePaths, `no route for ${href}`).toContain(href);
      expect(routePaths.indexOf(href)).toBeLessThan(routePaths.indexOf('*'));
    }
  });
});

/* ═══ 11 — the groups tab renders GroupsMock, not an empty panel ═══════════
 *
 * `FeatureMock` special-cases `id === 'groups'` to draw the same GroupsMock
 * component /features/community-engagement uses (see FeatureMock.tsx), but
 * OneAppTabs in SolutionPage.tsx only calls FeatureMock at all when it can
 * see content for the tab's id. `groups` carries no MOCKS['groups'] entry —
 * only the special case does — so this is checked directly rather than
 * assumed: Churches' groups tab panel must contain a channel GroupsMock
 * actually draws ("Leadership"), not render empty. */
describe('the groups tab (Churches) renders GroupsMock', () => {
  it('the groups panel contains GroupsMock\'s own content', () => {
    const html = render(React.createElement(SolutionPage, { slug: 'churches' }), solutionHref('churches'));
    const panelMatch = html.match(/id="solutions-panel-groups"[\s\S]*?(?=id="solutions-panel-|$)/);
    expect(panelMatch, 'groups panel not found').toBeTruthy();
    expect(words(panelMatch![0])).toContain('Leadership');
  });
});

/* ═══ 12 — the services mock (Churches) ═════════════════════════════════════
 *
 * Source of truth: the `services` (Service Planning) entry in
 * content/features.ts. Only fields that entry names as real: durations
 * becoming clock times, a person assigned per item, and an accept / decline /
 * no-answer-yet state per person. */
describe('the services tab (Churches) mock', () => {
  const html = render(React.createElement(SolutionPage, { slug: 'churches' }), solutionHref('churches'));
  const panelMatch = html.match(/id="solutions-panel-services"[\s\S]*?(?=id="solutions-panel-|$)/);
  const panelText = words(panelMatch![0]);

  it('the panel is present and carries an order-of-service item with a clock time', () => {
    expect(panelMatch, 'services panel not found').toBeTruthy();
    expect(panelText).toMatch(/\d{1,2}:\d{2}/);
  });

  it('shows a person assigned to an item', () => {
    expect(panelText).toContain('David R.');
  });

  it('shows all three answer states: accepted, waiting, and declined', () => {
    expect(panelText).toContain('Accepted');
    expect(panelText).toContain('Waiting');
    expect(panelText).toContain('Declined');
  });

  it('claims nothing service-plan.ts names as deliberately absent', () => {
    const forbidden = [/CCLI/i, /chord chart/i, /rehearsal/i, /blockout/i, /song library/i];
    for (const re of forbidden) expect(panelText).not.toMatch(re);
  });
});
