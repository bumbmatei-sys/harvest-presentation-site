import { afterEach, describe, expect, it, vi } from 'vitest';
import { AFFILIATE_PROGRAM_ENABLED, MULTI_CAMPUS_ENABLED } from './flags';
import { CATALOG, type CatalogGroup } from '../components/catalog';
import { CATEGORIES, type Category } from '../content/features';

/* Reversibility is the whole point of a flag. Both of these hide a surface for
 * something the product does not currently sell, and both are meant to be a
 * one-line change back. Nothing verified that: `false` was checked by an agent
 * looking at the rendered page, and `true` was never checked at all, so a
 * surface could rot behind the flag and only be discovered on the day it was
 * needed. These tests load the modules under both settings.
 *
 * The assertions are on DATA — catalog entries, feature ids, resolved hrefs —
 * not on markup. */

type Flags = { AFFILIATE_PROGRAM_ENABLED: boolean; MULTI_CAMPUS_ENABLED: boolean };

/** Re-import the flag-dependent modules with the flags forced to `flags`.
 *  `resetModules` is what makes the second load re-run their module scope. */
async function surfacesWith(flags: Flags) {
  vi.resetModules();
  vi.doMock('./flags', () => flags);
  const { CATALOG } = await import('../components/catalog');
  const { CATEGORIES, LEGACY_ANCHORS } = await import('../content/features');
  return {
    titles: (CATALOG as CatalogGroup[]).flatMap((g) => g.items.map((i) => i.title)),
    featureIds: (CATEGORIES as Category[]).flatMap((c) => c.features.map((f) => f.id)),
    crosslinkHrefs: (CATEGORIES as Category[]).flatMap((c) =>
      c.features.flatMap((f) => (f.crosslinks ?? []).map((cl) => cl.href))),
    ordinalsByCategory: (CATEGORIES as Category[]).map((c) => c.features.map((f) => f.n)),
    LEGACY_ANCHORS: LEGACY_ANCHORS as Record<string, string>,
  };
}

const OFF: Flags = { AFFILIATE_PROGRAM_ENABLED: false, MULTI_CAMPUS_ENABLED: false };
const ON: Flags = { AFFILIATE_PROGRAM_ENABLED: true, MULTI_CAMPUS_ENABLED: true };

afterEach(() => { vi.doUnmock('./flags'); vi.resetModules(); });

describe('AFFILIATE_PROGRAM_ENABLED', () => {
  it('false hides the mega-menu item and the feature section', async () => {
    const s = await surfacesWith(OFF);
    expect(s.titles).not.toContain('Affiliate Program');
    expect(s.featureIds).not.toContain('affiliate');
  });

  it('true restores both', async () => {
    const s = await surfacesWith(ON);
    expect(s.titles).toContain('Affiliate Program');
    expect(s.featureIds).toContain('affiliate');
  });

  it('false strips the #affiliate fragment off indexed legacy links', async () => {
    const s = await surfacesWith(OFF);
    // The slugs stay mapped — they are indexed and must land somewhere — but
    // with the section not rendering they arrive at the top of the page rather
    // than on a dead anchor.
    expect(s.LEGACY_ANCHORS['affiliate-program']).toBe('/features/giving-finance');
    expect(s.LEGACY_ANCHORS['lifetime-affiliate']).toBe('/features/giving-finance');
  });

  it('true points the legacy links back at the section', async () => {
    const s = await surfacesWith(ON);
    expect(s.LEGACY_ANCHORS['affiliate-program']).toBe('/features/giving-finance#affiliate');
    expect(s.LEGACY_ANCHORS['lifetime-affiliate']).toBe('/features/giving-finance#affiliate');
  });

  it('false leaves no crosslink pointing at the hidden section', async () => {
    const s = await surfacesWith(OFF);
    expect(s.crosslinkHrefs.filter((h) => h.endsWith('#affiliate'))).toEqual([]);
  });
});

describe('MULTI_CAMPUS_ENABLED', () => {
  it('false hides the mega-menu item and the feature section', async () => {
    const s = await surfacesWith(OFF);
    expect(s.titles).not.toContain('Multi-Campus');
    expect(s.featureIds).not.toContain('churches');
  });

  it('true restores both', async () => {
    const s = await surfacesWith(ON);
    expect(s.titles).toContain('Multi-Campus');
    expect(s.featureIds).toContain('churches');
  });

  it('false strips the #churches fragment off indexed legacy links', async () => {
    const s = await surfacesWith(OFF);
    expect(s.LEGACY_ANCHORS['multi-campus']).toBe('/features/platform-brand');
    expect(s.LEGACY_ANCHORS['unlimited-churches']).toBe('/features/platform-brand');
  });

  it('true points the legacy links back at the section', async () => {
    const s = await surfacesWith(ON);
    expect(s.LEGACY_ANCHORS['multi-campus']).toBe('/features/platform-brand#churches');
    expect(s.LEGACY_ANCHORS['unlimited-churches']).toBe('/features/platform-brand#churches');
  });

  it('false leaves no crosslink pointing at the hidden section', async () => {
    const s = await surfacesWith(OFF);
    expect(s.crosslinkHrefs.filter((h) => h.endsWith('#churches'))).toEqual([]);
  });
});

/* Everything above mocks the flags, so it verifies both settings work and is
   silent about which one ships. That silence is the gap: flipping a flag is a
   one-line edit with no diff anywhere near the surfaces it reveals.
   MULTI_CAMPUS in particular gates the multi-campus FEATURE marketing. Since
   THE-223 that is no longer the same thing as the Campus add-on, which is live
   in Dodo and IS advertised, on the pricing page where a buyable capacity
   belongs. Flipping this flag publishes a feature-page section and a catalogue
   tool entry, and moves CATALOG_TOOL_COUNT off its derived 28.

   So the shipped values are pinned. This is a tripwire, not a change-detector:
   these literals are the same idiom as EXPECTED_ANNUAL_MONTHLY in Pricing.tsx —
   deliberately duplicated so a one-sided change stops here and has to be stated
   out loud. Turning a programme on is a real decision; make it in this file too,
   in the same commit, and the assertions below tell you what it just published. */
describe('the values this site actually ships', () => {
  it('leaves the affiliate programme unadvertised', () => {
    expect(AFFILIATE_PROGRAM_ENABLED).toBe(false);
    expect((CATALOG as CatalogGroup[]).flatMap((g) => g.items.map((i) => i.title)))
      .not.toContain('Affiliate Program');
  });

  it('leaves the multi-campus feature section and tool entry unpublished', () => {
    // ⚠️ NOT "unadvertised" any more, and the distinction is the THE-223 one:
    // the Campus ADD-ON is advertised in Pricing.tsx's ADD_ONS at its live Dodo
    // price. What these assertions hold shut is the feature-page treatment and
    // the tool-catalogue entry, which are a separate decision.
    expect(MULTI_CAMPUS_ENABLED).toBe(false);
    expect((CATALOG as CatalogGroup[]).flatMap((g) => g.items.map((i) => i.title)))
      .not.toContain('Multi-Campus');
    expect((CATEGORIES as Category[]).flatMap((c) => c.features.map((f) => f.id)))
      .not.toContain('churches');
  });
});

describe('hiding a feature renumbers the page index', () => {
  // Hiding #5 must not leave a page numbered 1,2,3,4,6.
  it.each([['hidden', OFF], ['shown', ON]] as const)('ordinals stay contiguous with sections %s', async (_label, flags) => {
    const s = await surfacesWith(flags);
    for (const ordinals of s.ordinalsByCategory) {
      expect(ordinals).toEqual(ordinals.map((_, i) => String(i + 1)));
    }
  });
});
