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

type Flags = {
  AFFILIATE_PROGRAM_ENABLED: boolean;
  MULTI_CAMPUS_ENABLED: boolean;
  SMS_MARKETING_ENABLED: boolean;
};

/** Re-import the flag-dependent modules with the flags forced to `flags`.
 *  `resetModules` is what makes the second load re-run their module scope. */
async function surfacesWith(flags: Flags) {
  vi.resetModules();
  vi.doMock('./flags', () => flags);
  const { CATALOG, CATALOG_TOOL_COUNT } = await import('../components/catalog');
  const { CATEGORIES, LEGACY_ANCHORS } = await import('../content/features');
  const { COMING_SOON_ITEMS } = await import('../content/coming-soon');
  const cats = CATEGORIES as Category[];
  return {
    titles: (CATALOG as CatalogGroup[]).flatMap((g) => g.items.map((i) => i.title)),
    featureIds: cats.flatMap((c) => c.features.map((f) => f.id)),
    crosslinkHrefs: cats.flatMap((c) =>
      c.features.flatMap((f) => (f.crosslinks ?? []).map((cl) => cl.href))),
    ordinalsByCategory: cats.map((c) => c.features.map((f) => f.n)),
    LEGACY_ANCHORS: LEGACY_ANCHORS as Record<string, string>,
    // THE-245 additions — the Coming Soon side of the relocation, the derived
    // count, and the category prose that names features by hand.
    toolCount: CATALOG_TOOL_COUNT as number,
    soonIds: COMING_SOON_ITEMS.map((i) => i.id),
    soonOrdinals: COMING_SOON_ITEMS.map((i) => i.n),
    categoryProse: cats.flatMap((c) => [c.intro, c.seo]),
    adminBullets: cats.flatMap((c) => c.features.flatMap((f) => f.admin ?? [])),
  };
}

const OFF: Flags = { AFFILIATE_PROGRAM_ENABLED: false, MULTI_CAMPUS_ENABLED: false, SMS_MARKETING_ENABLED: false };
const ON: Flags = { AFFILIATE_PROGRAM_ENABLED: true, MULTI_CAMPUS_ENABLED: true, SMS_MARKETING_ENABLED: true };

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
   tool entry, and moves CATALOG_TOOL_COUNT off its derived 27.

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

/* ─────────────────────────────────────────────────────────────────────────────
 * THE-245 — SMS_MARKETING_ENABLED
 *
 * 🔴 THE ONLY FLAG ON THIS SITE THAT RELOCATES RATHER THAN HIDES. SMS is
 * currently SOLD, so withdrawing it quietly would leave a gap where a
 * capability used to be advertised. Instead the entry moves to Coming Soon,
 * where the shape forbids a price, a tier and a call to action.
 *
 * That makes the ON direction unusually load-bearing: flipping the flag must
 * not only bring the live surfaces back, it must TAKE THE COMING SOON ENTRY
 * AWAY. Live and "coming soon" at once is the same claim in two tenses, and it
 * is the failure this pair of tests exists to prevent.
 * ───────────────────────────────────────────────────────────────────────────── */
describe('SMS_MARKETING_ENABLED', () => {
  it('false hides the mega-menu tool and the feature section', async () => {
    const s = await surfacesWith(OFF);
    expect(s.titles).not.toContain('SMS Automation');
    expect(s.featureIds).not.toContain('sms');
  });

  it('true restores both', async () => {
    const s = await surfacesWith(ON);
    expect(s.titles).toContain('SMS Automation');
    expect(s.featureIds).toContain('sms');
  });

  it('🔴 false ADDS the Coming Soon entry, and true takes it away again', async () => {
    // The relocation, both ways. This is the assertion that keeps the site from
    // promising SMS twice.
    expect((await surfacesWith(OFF)).soonIds).toContain('sms');
    expect((await surfacesWith(ON)).soonIds).not.toContain('sms');
  });

  it('the Coming Soon index is renumbered either way — never 1,2,…,8,10', async () => {
    for (const flags of [OFF, ON]) {
      const s = await surfacesWith(flags);
      expect(s.soonOrdinals).toEqual(s.soonIds.map((_, i) => String(i + 1)));
    }
  });

  it('🔴 moves the derived tool count by exactly one, and only downward', async () => {
    // ⚠️ SMS ISOLATED. `ON` flips all three flags and the other two each add a
    // tool of their own, so comparing OFF with ON would measure three changes
    // and call the total SMS's. This pair differs in one boolean.
    const off = await surfacesWith(OFF);
    const smsOnly = await surfacesWith({ ...OFF, SMS_MARKETING_ENABLED: true });
    expect(off.toolCount, 'the shipped count').toBe(27);
    expect(smsOnly.toolCount, 'the count before SMS was withdrawn').toBe(28);
    // The Coming Soon entry contributes nothing in either direction — that is
    // what makes 27 an honest count rather than a hidden 28.
    expect(smsOnly.toolCount - off.toolCount).toBe(1);
    expect(smsOnly.soonIds).not.toContain('sms');
    expect(off.soonIds).toContain('sms');
  });

  it('false strips the #sms fragment off the indexed legacy links', async () => {
    // Same treatment as the affiliate pair: the slugs stay mapped because they
    // are indexed and must land somewhere, and with the section not rendering
    // they arrive at the top of the page rather than on a dead anchor.
    //
    // ⚠️ NOT re-pointed at the Coming Soon entry. THE-247 made "a coming-soon
    // item is never a redirect target" a rule and asserted it twice; SMS is the
    // first entry with both a retired URL and a coming-soon home, so it is the
    // first case where that rule costs a good landing. Flagged in the PR rather
    // than fixed by bending the invariant.
    const s = await surfacesWith(OFF);
    expect(s.LEGACY_ANCHORS['sms-automation']).toBe('/features/ai-automation');
    expect(s.LEGACY_ANCHORS['sms-text-to-give']).toBe('/features/ai-automation');
  });

  it('true points the indexed SMS slugs back at the live section', async () => {
    const s = await surfacesWith(ON);
    expect(s.LEGACY_ANCHORS['sms-automation']).toBe('/features/ai-automation#sms');
    expect(s.LEGACY_ANCHORS['sms-text-to-give']).toBe('/features/ai-automation#sms');
  });

  it('false leaves no crosslink pointing at the hidden section', async () => {
    // 🔴 Three of the four sat on GIVING pages, and one was labelled
    // "Text-to-Give". A dead anchor there is worse than a missing link.
    const s = await surfacesWith(OFF);
    expect(s.crosslinkHrefs.filter((h) => h.endsWith('#sms'))).toEqual([]);
  });

  it('true restores those crosslinks', async () => {
    const s = await surfacesWith(ON);
    expect(s.crosslinkHrefs.filter((h) => h.endsWith('#sms')).length).toBeGreaterThan(0);
  });

  it('false takes SMS out of the category prose and the CRM bullet too', async () => {
    // A hidden section with the blurb above it still naming SMS is the same
    // claim, one paragraph higher up.
    const s = await surfacesWith(OFF);
    for (const line of s.categoryProse) {
      expect(line, `category prose still names SMS: "${line}"`).not.toMatch(/\bSMS\b/);
    }
    for (const bullet of s.adminBullets) {
      expect(bullet, `a feature bullet still names SMS: "${bullet}"`).not.toMatch(/\bSMS\b/);
    }
  });

  it('true puts that copy back', async () => {
    const s = await surfacesWith(ON);
    expect(s.categoryProse.some((l) => /\bSMS\b/.test(l))).toBe(true);
    expect(s.adminBullets.some((b) => /Tags that drive SMS broadcast targeting/.test(b))).toBe(true);
  });
});
