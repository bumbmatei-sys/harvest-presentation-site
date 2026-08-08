import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_BY_SLUG, LEGACY_ANCHORS, categoryHref, featureHref } from './features';
import { CATALOG, slugify } from '../components/catalog';

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
  const items = CATALOG.flatMap((g) => g.items.map((i) => i.title));
  const fallback = categoryHref(CATEGORIES[0].slug);

  it.each(items)('"%s" has a mapped destination, not the fallback', (title) => {
    // `featureHref` falls back to the first category page for an unmapped slug,
    // so a renamed catalog item does not break the link — it quietly sends
    // every visitor to Community & Engagement instead. Only this catches it.
    expect(LEGACY_ANCHORS[slugify(title)], `no LEGACY_ANCHORS entry for "${slugify(title)}"`).toBeDefined();
    expect(featureHref(slugify(title))).not.toBe(fallback);
  });
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
