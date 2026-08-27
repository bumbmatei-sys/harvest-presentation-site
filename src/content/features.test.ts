import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_BY_SLUG, LEGACY_ANCHORS, categoryHref, featureHref } from './features';
import { CATALOG, slugify } from '../components/catalog';
import { columnHref, itemHref } from '../components/Nav';
import { COMING_SOON_HREF, COMING_SOON_IDS, COMING_SOON_NAME } from './coming-soon';

/* LEGACY_ANCHORS is the redirect table for every retired /features#<slug> URL —
 * indexed links, the Nav mega-menu, and anything a church has bookmarked. A
 * target that names a section which no longer exists does not 404: the page
 * loads and silently fails to scroll, which is invisible to everyone except the
 * visitor. Nothing at build time checks that the right-hand side is real. */

const live = (slug: string) => CATEGORY_BY_SLUG[slug];
const parse = (href: string) => {
  const m = /^\/features\/([a-z0-9-]+)(?:#([a-z0-9-]+))?$/.exec(href);
  return m ? { slug: m[1], fragment: m[2] } : null;
};

describe('LEGACY_ANCHORS targets', () => {
  const entries = Object.entries(LEGACY_ANCHORS);

  it('is not empty', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s → %s resolves to a real category page', (_slug, href) => {
    const parsed = parse(href);
    expect(parsed, `"${href}" is not a /features/<category>[#<feature>] path`).not.toBeNull();
    expect(live(parsed!.slug), `no category page /features/${parsed!.slug}`).toBeDefined();
  });

  it.each(entries.filter(([, href]) => href.includes('#')))(
    '%s → %s names a section that renders on that page',
    (_slug, href) => {
      const { slug, fragment } = parse(href)!;
      const ids = live(slug).features.map((f) => f.id);
      expect(ids, `#${fragment} is not a live section on /features/${slug}`).toContain(fragment);
    },
  );
});

describe('the mega-menu reaches every feature it lists', () => {
  const fallback = categoryHref(CATEGORIES[0].slug);

  /* THE-247 split the menu's items in two, so this describes both halves rather
     than one rule that no longer fits either.

     The FIVE LIVE groups still resolve through LEGACY_ANCHORS — the table that
     maps a retired /features#<slug> URL onto the category page and section that
     feature moved to.

     The COMING SOON group cannot and must not. LEGACY_ANCHORS is a redirect
     table for URLs that were once live and are indexed; an unbuilt feature has
     no retired URL, and giving it an entry would point an indexed slug at a
     page describing something that does not exist. Its entries carry an
     explicit `href` instead.

     ⚠️ WHAT DOES NOT CHANGE is the property this suite existed for: every
     single menu item must reach a real destination and never the silent
     fallback. `itemHref` and `columnHref` are imported from Nav.tsx rather than
     rebuilt here, so this asserts the resolver the menu actually renders. */
  const live = CATALOG.filter((g) => !g.href);
  const soon = CATALOG.filter((g) => g.href);

  it('is split into exactly the five live groups and the one unbuilt one', () => {
    // Guards every `it.each` below against silently running on an empty list.
    expect(live).toHaveLength(5);
    expect(soon.map((g) => g.name)).toEqual([COMING_SOON_NAME]);
    expect(CATALOG.flatMap((g) => g.items).length).toBeGreaterThan(30);
  });

  it.each(live.flatMap((g) => g.items.map((i) => i.title)))(
    '"%s" has a mapped destination, not the fallback',
    (title) => {
      // `featureHref` falls back to the first category page for an unmapped
      // slug, so a renamed catalog item does not break the link — it quietly
      // sends every visitor to Community & Engagement instead.
      expect(LEGACY_ANCHORS[slugify(title)], `no LEGACY_ANCHORS entry for "${slugify(title)}"`).toBeDefined();
      expect(featureHref(slugify(title))).not.toBe(fallback);
    },
  );

  it.each(CATALOG.flatMap((g) => g.items.map((i) => [i.title, i] as const)))(
    '"%s" resolves through the menu\'s own resolver, never to the fallback',
    (_title, item) => {
      expect(itemHref(item)).not.toBe(fallback);
    },
  );

  it.each(CATALOG.map((g) => [g.name, g] as const))(
    'the "%s" column header opens a real page',
    (_name, group) => {
      const href = columnHref(group);
      expect(href.startsWith('/features/'), `"${href}" is not a feature page`).toBe(true);
      const slug = href.slice('/features/'.length).split('#')[0];
      expect(
        slug === COMING_SOON_HREF.slice('/features/'.length) || !!CATEGORY_BY_SLUG[slug],
        `no page at /features/${slug}`,
      ).toBe(true);
    },
  );

  it.each(soon.flatMap((g) => g.items.map((i) => [i.title, i] as const)))(
    '"%s" is an unbuilt item: marked soon, and anchored on the Coming Soon page',
    (_title, item) => {
      // 🔴 `soon` is what keeps it out of CATALOG_TOOL_COUNT. An entry that
      // lost the flag would start being counted as a tool in the platform.
      expect(item.soon).toBe(true);
      expect(item.href).toBeDefined();
      const [path, fragment] = item.href!.split('#');
      expect(path).toBe(COMING_SOON_HREF);
      expect(COMING_SOON_IDS, `#${fragment} is not a section on the page`).toContain(fragment);
      // And it is NOT in the redirect table — see the note above.
      expect(LEGACY_ANCHORS[slugify(item.title)]).toBeUndefined();
    },
  );
});

describe('feature ids', () => {
  it('are unique across all category pages', () => {
    // Ids are in-page anchors and the key LEGACY_ANCHORS resolves against; a
    // duplicate makes one of the two unreachable.
    const ids = CATEGORIES.flatMap((c) => c.features.map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('leave every category page with at least one section', () => {
    for (const c of CATEGORIES) expect(c.features.length).toBeGreaterThan(0);
  });
});
