/**
 * THE-306 — the Shareable Giving Page gets an illustration, and a place in the menu.
 *
 * ─── What the founder asked for, verbatim ────────────────────────────────────
 *
 * On the live page: "is horrible."
 * On what to draw:  "i want to see in that shareable design the donation form
 *                    and put the logo of the shareable links one next to the
 *                    other under it in circles."
 * With a screenshot of the open mega-menu: "this feature doesnt appear in the
 *                    feature section in top header bar."
 *
 * ─── The two defects, which are one feature half-shipped ─────────────────────
 *
 * THE-281 added `sharegiving` to content/features.ts with good copy and stopped
 * there. Two things every OTHER feature on the five live category pages has
 * were never added:
 *
 *   · an entry in components/FeatureMock.tsx — both the vignette AND the
 *     `FEATURE_ICONS` badge. `FeatureBlock` renders its frame regardless, so the
 *     section drew a titled grey box around nothing, next to five neighbours
 *     each carrying a still life of the product.
 *   · a row in components/catalog.ts — the mega-menu's model. A live, unflagged,
 *     paid feature with its own section was unreachable from the navigation.
 *
 * ─── 🔴 AND A THIRD THING, WHICH THE TICKET FOUND RATHER THAN CAUSED ─────────
 *
 * catalog.ts said "The count is unchanged at 28" while the menu footer rendered
 * "27 tools in one platform". Both had been true: the figure was 28 until
 * THE-245 withdrew SMS Automation and took it to 27, and that comment was never
 * retaken. Section 3 pins the derived figure, the comment and every assertion
 * against each other so the three cannot drift apart again.
 *
 * ─── 🔴 WHAT THIS TICKET DELIBERATELY DID NOT FIX ───────────────────────────
 *
 * The feature's member bullet says "Opens with no login, on any phone", and
 * that is currently FALSE: the shared URL is `https://<tenant>.theharvest.app/
 * ?giving=1`, the authenticated app root, which bounces to sign-in. THE-303 is
 * fixing it in the app repo. Section 7 asserts the claim is STILL THERE,
 * unedited, so that this ticket cannot be read as having quietly resolved it and
 * so a reader arriving at that bullet is sent to THE-303 rather than to nobody.
 * If THE-303 concludes the page must stay members-only, the rewording is a
 * separate site ticket with the founder's decision behind it.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CATALOG, CATALOG_TOOL_COUNT, slugify } from './catalog';
import { FEATURE_ICONS, FeatureMock, SHARE_GIVING_PROVIDERS } from './FeatureMock';
import { CATEGORIES, LEGACY_ANCHORS } from '../content/features';
import { itemHref } from './Nav';

const SHARE_ID = 'sharegiving';
const SHARE_TITLE = 'Shareable Giving Page';
const GIVING = 'Giving & Finance';

const src = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const mockHtml = (id: string) =>
  renderToStaticMarkup(React.createElement(FeatureMock, { id }));

const share = CATEGORIES
  .flatMap((c) => c.features)
  .find((f) => f.id === SHARE_ID)!;

const givingGroup = CATALOG.find((g) => g.name === GIVING)!;

// ═════════════════════════════════════════════════════════════════════════════
// 1 · the vignette exists at all
// ═════════════════════════════════════════════════════════════════════════════
describe('1 — the sharegiving feature renders a real vignette, not a placeholder', () => {
  it('🔴 FeatureMock returns markup for it, where it returned nothing', () => {
    /* `FeatureMock` is `MOCKS[id] ?? null`. Before this ticket that was null and
       FeatureBlock drew its frame — the tab, the name, the "Harvest" label —
       around an empty stone-100 panel. THAT is what "is horrible" was pointing
       at, and an empty string here is exactly that state. */
    const html = mockHtml(SHARE_ID);
    expect(html, 'FeatureMock has no entry for sharegiving — the placeholder is back').not.toBe('');
    // Not a token entry either: every other giving vignette is a card of real
    // depth, so hold this one to the shortest of them.
    expect(html.length).toBeGreaterThan(mockHtml('donation').length * 0.75);
  });

  it('🔴 and the icon badge is filled — the other half of the empty box', () => {
    /* `FeatureBlock` reads `FEATURE_ICONS[feature.id]` for the 42px rounded
       badge beside the eyebrow. With no entry it rendered an accent-coloured
       square with nothing in it, on every one of this section's viewports. */
    expect(FEATURE_ICONS[SHARE_ID], 'sharegiving has no FEATURE_ICONS entry').toBeDefined();
    const icon = renderToStaticMarkup(FEATURE_ICONS[SHARE_ID]);
    expect(icon).toMatch(/^<svg/);
    expect(icon).toContain('<path');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2 · the mega-menu
// ═════════════════════════════════════════════════════════════════════════════
describe('2 — sharegiving appears in the Features mega-menu, under GIVING & FINANCE', () => {
  it('🔴 the row exists, in that column and no other', () => {
    const inGiving = givingGroup.items.filter((i) => i.title === SHARE_TITLE);
    expect(inGiving, `"${SHARE_TITLE}" is missing from the ${GIVING} column`).toHaveLength(1);

    // And nowhere else — a feature listed twice is a menu that contradicts itself.
    const everywhere = CATALOG.flatMap((g) => g.items).filter((i) => i.title === SHARE_TITLE);
    expect(everywhere).toHaveLength(1);
  });

  it('🔴 it is a LIVE tool, not a Coming Soon row', () => {
    /* The whole defect was that a shipped, paid feature was unreachable. Adding
       it back as `soon: true` would make it reachable and simultaneously tell
       every visitor it is not built — and would keep it out of the count, which
       is the claim it is entitled to be in. */
    const row = givingGroup.items.find((i) => i.title === SHARE_TITLE)!;
    expect(row.soon).toBeFalsy();
    expect(row.desc.length).toBeGreaterThan(30);
  });

  it('🔴 the row LANDS on the feature, rather than silently on the fallback', () => {
    /* `itemHref` is `it.href ?? featurePath(slugify(it.title))`, and
       `featureHref` falls back to the FIRST category page for an unmapped slug.
       So a row with no LEGACY_ANCHOR_TARGETS entry does not fail — it quietly
       sends every visitor who clicks it to /features/community-engagement. That
       is a worse defect than the missing row, because it looks like it works. */
    const row = givingGroup.items.find((i) => i.title === SHARE_TITLE)!;
    const slug = slugify(row.title);
    expect(slug).toBe('shareable-giving-page');
    expect(LEGACY_ANCHORS[slug], `${slug} is unmapped — the row falls back silently`).toBe(
      '/features/giving-finance#sharegiving');
    expect(itemHref(row)).toBe('/features/giving-finance#sharegiving');
    // …and the anchor it names is a section that actually renders.
    const giving = CATEGORIES.find((c) => c.slug === 'giving-finance')!;
    expect(giving.features.map((f) => f.id)).toContain(SHARE_ID);
  });

  it('the icon resolves to a real glyph rather than the silent Circle fallback', () => {
    /* icons.tsx: `NAME_MAP[name] ?? Circle`. An unregistered name ships a blank
       dot and nothing complains — the trap THE-284's icons already carry a note
       about. This asserts the name is registered, not merely spelled. */
    const row = givingGroup.items.find((i) => i.title === SHARE_TITLE)!;
    expect(row.icon).toBe('share');
    expect(src('./icons.tsx')).toMatch(/^\s+share: Share,$/m);
    expect(src('./icons.tsx')).toMatch(/\bShare,\n\s*type LucideIcon,/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3 · 🔴 the count, its comment and its assertions
// ═════════════════════════════════════════════════════════════════════════════
describe('3 — the derived tool count, its comment and its assertion all agree', () => {
  it('🔴 the figure is 28, and is still DERIVED rather than written down', () => {
    // 🔵 29 since THE-314 turned SMS back on. It was 28 while the SMS tool was
    // withheld, and 27 before THE-306 added the Shareable Giving Page.
    expect(CATALOG_TOOL_COUNT).toBe(29);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((it) => !it.soon).length, 0),
    );
  });

  it('🔴 adding this row is exactly what moved it, by exactly one', () => {
    /* The delta, asserted as a delta — so a future ticket that adds a second
       tool in the same commit cannot hide inside this one's expected move.
       🔵 The absolute was 27 → 28; THE-314 turned SMS back on and it is 28 → 29.
       The DELTA is what this test is about and it has not moved. */
    const without = CATALOG.reduce(
      (n, g) => n + g.items.filter((it) => !it.soon && it.title !== SHARE_TITLE).length, 0);
    expect(without).toBe(28);
    expect(CATALOG_TOOL_COUNT - without).toBe(1);
  });

  it('🔴 catalog.ts no longer says one number while the menu renders another', () => {
    /* The defect this section is named for. The comment said 28 and the footer
       said 27 — for long enough that a reader could reasonably have trusted
       either. Both stale absolutes in that file are gone: the count is quoted
       once, as the derived figure, and the SMS note now names a DIRECTION. */
    const catalog = src('./catalog.ts');
    expect(catalog).toContain('🔴 THE COUNT IS 28, AND THIS LINE SAID 28 WHILE THE MENU RENDERED 27');
    expect(catalog).not.toContain('The count is unchanged at 28');
    expect(catalog).not.toContain('so withdrawing this tool takes it from 28 to 27');
    // The rendered footer is derived from the same constant, so it cannot drift.
    expect(src('./Nav.tsx')).toContain('${CATALOG_TOOL_COUNT} tools in one platform');
  });

  it('🔴 every suite that pins the figure was moved with it — all sixteen', () => {
    /* ⚠️ THE TICKET SAID "an assertion pins this count somewhere". There were
       NINETEEN, across sixteen files — eighteen written as
       `CATALOG_TOOL_COUNT).toBe(n)` and one more pair in lib/flags.test.ts that
       compares an OFF/ON surface instead. Six others derive from the figure
       arithmetically (`27 + items.length` mutation tripwires). Leaving any one
       stale would have left the count, the comment and the assertion telling
       three different stories, which is the state this ticket found.

       🔴 DISCOVERED BY SCANNING, NOT BY LISTING, and the file list is derived
       here for the same reason: a hand-written list is exactly what let the
       first three go stale. The COUNT is pinned alongside it, so a file that
       quietly DROPS its count assertion fails this as loudly as one that leaves
       it at 27 — a bare scan would shrink silently and still pass. */
    const dir = fileURLToPath(new URL('..', import.meta.url));
    const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name))
        : e.name.endsWith('.test.ts') ? [join(d, e.name)] : []));

    const pinning = walk(dir)
      .map((f) => [f, readFileSync(f, 'utf8')] as const)
      .filter(([, body]) => /CATALOG_TOOL_COUNT\)\.toBe\(/.test(body));

    // 🔵 SEVENTEEN SINCE THE-314, which added its own suite and pinned the
    // figure there too. The count is pinned alongside the value for the reason
    // the note above gives: a suite that quietly DROPS its assertion has to fail
    // as loudly as one that leaves it stale.
    expect(pinning.length, 'a suite gained or lost its tool-count assertion').toBe(17);
    for (const [f, body] of pinning) {
      expect(body, `${f} still pins the old count`).not.toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(27\)/);
      expect(body, `${f} still pins the pre-THE-314 count`)
        .not.toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(28\)/);
      expect(body, `${f} pins something other than the derived figure`)
        .toMatch(/CATALOG_TOOL_COUNT\)\.toBe\(29\)/);
    }

    /* The two flag suites assert a PAIR rather than the constant, so the scan
       above cannot see them — they are the one place the SMS delta of exactly
       one is still measured, and both halves had to move together. */
    const flags = src('../lib/flags.test.ts');
    // ⚠️ The two halves swapped which one is the SHIPPED figure when THE-314
    // turned SMS back on: `OFF` is a synthetic all-flags-false state, so the
    // live product is now the SMS-on side at 29. The numbers are unchanged.
    expect(flags).toContain("expect(off.toolCount, 'the count with SMS withheld').toBe(28)");
    expect(flags).toContain("expect(smsOnly.toolCount, 'the shipped count, with SMS live').toBe(29)");
    expect(flags).not.toMatch(/toolCount(?:, '[^']*')?\)\.toBe\(27\)/);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4 · the founder's spec
// ═════════════════════════════════════════════════════════════════════════════
describe('4 — the vignette shows a donation form and the provider circles beneath it', () => {
  const html = mockHtml(SHARE_ID);

  it('🔴 a donation form: preset amounts, one of them selected, and a give button', () => {
    expect(html).toContain('$30');
    expect(html).toContain('$60');
    expect(html).toContain('$150');
    expect(html).toContain('Give $60 by card');
    // The selected chip is the one on the gold ground — the `donation` idiom.
    expect(html).toContain('background:var(--gold-500)');
  });

  it('🔴 the providers are drawn as CIRCLES', () => {
    const circles = html.match(/border-radius:50%/g) ?? [];
    expect(circles.length).toBe(SHARE_GIVING_PROVIDERS.length);
    // Circular means equal width and height, not merely a rounded corner.
    for (const p of SHARE_GIVING_PROVIDERS) expect(html).toContain(p.name);
    expect(html).toMatch(/width:30px;height:30px;border-radius:50%/);
  });

  it('🔴 the circles sit BENEATH the form, side by side', () => {
    // Order in the markup is order on the page: the form's button comes first.
    const formAt = html.indexOf('Give $60 by card');
    const circlesAt = html.indexOf('repeat(6, 1fr)');
    expect(formAt).toBeGreaterThan(-1);
    expect(circlesAt).toBeGreaterThan(-1);
    expect(circlesAt, 'the circles are not beneath the form').toBeGreaterThan(formAt);
    // "one next to the other" — one grid row of six, not a stack.
    expect(html).toContain('grid-template-columns:repeat(6, 1fr)');
  });

  it('a QR is NOT drawn, and that is a decision rather than an omission', () => {
    /* The ticket left it optional and the founder asked for the form and the
       circles. `checkin` above already draws the full-size QR on this site, so a
       second one would make two vignettes look alike to fix a ticket about a
       vignette that looks like nothing. The capability is named in the header's
       share pills instead, where the feature's three admin bullets are. */
    expect(html).toContain('QR');
    expect(html).toContain('Share');
    expect(html).toContain('Copy');
    // No QR MATRIX — the `checkin` mock's crisp-edges module grid.
    expect(html).not.toContain('shapeRendering');
    expect(html).not.toContain('crispEdges');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5 · 🔴 exactly the providers this site already claims
// ═════════════════════════════════════════════════════════════════════════════
describe('5 — exactly the providers this site already claims are shown', () => {
  it('🔴 the six, and not a seventh', () => {
    expect(SHARE_GIVING_PROVIDERS.map((p) => p.name)).toEqual([
      'PayPal', 'Cash App', 'Venmo', 'Zelle', 'Revolut', 'Wise',
    ]);
  });

  it('🔴 every one of them is a rail content/features.ts already names', () => {
    /* The rule is "do not add a provider the app does not support", and the only
       evidence this repo has for what the app supports is what it already says.
       Five are in the rendered member bullet; Zelle is in the block comment on
       the `sharegiving` entry that records the full list the page carries. Both
       are in this file, so both are checked against it. */
    const featuresSrc = src('../content/features.ts');
    expect(featuresSrc).toContain(
      "carries the church's OWN payment links (PayPal, Cash App, Venmo,\n           Zelle, Revolut, Wise)");
    for (const p of SHARE_GIVING_PROVIDERS) {
      expect(featuresSrc, `"${p.name}" is drawn but this site never claims it`).toContain(p.name);
    }
  });

  it('🔴 the five in the rendered bullet are a subset of the six drawn', () => {
    /* The picture and the prose sit in the same block, so the picture may not
       name a rail the bullet contradicts. It may name one MORE than the bullet
       samples — the bullet is prose with an "or" in it — but not one fewer and
       not a different one. */
    const drawn = new Set(SHARE_GIVING_PROVIDERS.map((p) => p.name));
    for (const named of ['PayPal', 'Cash App', 'Venmo', 'Revolut', 'Wise']) {
      expect(share.member.join(' ')).toContain(named);
      expect(drawn, `the bullet names ${named} and the picture does not`).toContain(named);
    }
  });

  it('no rail from the ADJACENT feature leaks in — this page is not Stripe', () => {
    /* `donation` above is the Stripe giving page; this is the surface carrying
       the church's own direct accounts, which Stripe is not in at all. Naming
       Stripe (or the site's own processor) in these circles would merge two
       features the file's own comment keeps apart on purpose. */
    const html = mockHtml(SHARE_ID);
    for (const forbidden of ['Stripe', 'Dodo', 'Apple Pay', 'Google Pay']) {
      expect(html, `${forbidden} is not one of this page's rails`).not.toContain(forbidden);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6 · 🔴 the marks — per provider
// ═════════════════════════════════════════════════════════════════════════════
describe('6 — each mark is unmodified and within its clear-space', () => {
  /**
   * 🔴 SATISFIED BY SHIPPING NO MARK AT ALL, which is the ticket's own named
   * outcome for a provider whose terms cannot be met: "use a neutral fallback
   * for that one rather than a mangled mark." It fired for all six.
   *
   * A mark may only ship here if it came from that provider's OWN brand-assets
   * page.
   *
   * 🔴 AND THE REASON IS NOT THE ONE THE-306 WROTE. THE-306 ran in a sandbox
   * that refused all six providers' domains and concluded the marks could not
   * be FETCHED. THE-307 re-ran it with open egress: all six hosts answer, and
   * the marks still cannot ship, because four providers' published terms
   * prohibit this use outright (Zelle — written permission required, personal
   * non-commercial licence only; Wise — "any use not specifically permitted is
   * strictly prohibited"; Revolut — no grant published at all; PayPal — the
   * self-serve route is a merchant-acceptance licence Harvest has no claim to,
   * and the press kit is editorial), Cash App publishes no usage terms to rely
   * on, and Venmo permits only its WORDMARK, which with its mandated
   * clear-space (half the logo height, a quarter minimum) does not fit a 30px
   * circle. A logo redrawn from recollection is exactly the mangled mark the
   * rule forbids, on a money surface, under a church's name.
   *
   * ⚠️ SO THESE ASSERTIONS ARE THE INVERSE OF WHAT THEY WOULD BE WITH ARTWORK.
   * "Unmodified" and "within clear-space" are properties of a mark, and there is
   * no mark: the circle carries the provider's initial set in this site's own
   * type, with the name in words beneath it. Naming a service you interoperate
   * with is nominative use and needs no licence; a letter in Harvest's own
   * typeface is Harvest's own drawing, so no clear-space, minimum-size or
   * do-not-modify rule attaches to it. There is nothing to crop.
   *
   * 🔴 A FOLLOW-UP CANNOT SIMPLY VENDOR THE SIX. THE-307 attempted precisely
   * that and was stopped by the terms above, not by the network. These three
   * assertions become replaceable only for a provider that has granted written
   * permission — and then only for that one.
   */
  const html = mockHtml(SHARE_ID);

  it('🔴 no third-party artwork ships in the vignette — no image, local or hotlinked', () => {
    expect(html).not.toContain('<img');
    expect(html).not.toContain('background-image');
    expect(html).not.toContain('url(');
    // And no inline glyph pretending to be one: the only <svg> in this file's
    // sharegiving entry would be a redrawn mark, and there is none.
    expect(html).not.toContain('<svg');
  });

  it('🔴 each circle carries a monogram in the site\'s own type, and its own name in words', () => {
    for (const p of SHARE_GIVING_PROVIDERS) {
      expect(p.monogram).toHaveLength(1);
      expect(p.monogram).toBe(p.name[0]);
      expect(html).toContain(`>${p.monogram}</span>`);
      expect(html).toContain(`>${p.name}</span>`);
    }
    // Six distinct initials, so no two circles are indistinguishable.
    expect(new Set(SHARE_GIVING_PROVIDERS.map((p) => p.monogram)).size).toBe(6);
  });

  it('🔴 the reason is recorded in the file, not just in a pull request', () => {
    /* A future reader looking at six grey circles will reasonably assume they
       are a placeholder somebody forgot. The docblock is what tells them it is a
       decision, names every provider's terms, and says what would actually
       unblock it. */
    const mock = src('./FeatureMock.tsx');
    expect(mock).toContain('THE SIX CIRCLES CARRY MONOGRAMS, NOT MARKS');
    for (const host of ['paypal.com', 'cash.app', 'venmo.com',
                        'zellepay.com', 'revolut.com', 'wise.com']) {
      expect(mock, `${host} is not named in the record`).toContain(host);
    }
  });

  it('🔴 the record is the LICENSING one, and cannot silently revert to "blocked"', () => {
    /* THE-307's whole product is this paragraph. If a later hand restores
       THE-306's fetch-failure story, somebody will re-run the fetch, find the
       hosts answer, and ship six marks nobody is licensed to ship. So the file
       must state that egress was NOT the blocker, and must carry a per-provider
       terms reason — one line each, for all six. */
    const mock = src('./FeatureMock.tsx');
    expect(mock).toContain('THE-306 RECORDED THE WRONG REASON');
    expect(mock).toContain('The blocker was never the network');
    expect(mock).toContain('DO NOT RE-OPEN THIS AS A FETCHING PROBLEM');

    /* The stale claim itself must be gone: THE-306 asserted all six answer 403
       to CONNECT, and they do not. */
    expect(mock).not.toContain('403 to CONNECT');

    /* One reason per provider, each naming the term that actually blocks it. */
    for (const [provider, term] of [
      ['PayPal', 'MERCHANT payment-button builder'],
      ['Cash App', 'is a PRESS resources page and publishes'],
      ['Venmo', 'reserved for the Venmo social identity'],
      ['Zelle', 'express permission by Network Operator in writing'],
      ['Revolut', 'we own all the intellectual property'],
      ['Wise', 'Any use not specifically permitted is strictly'],
    ] as const) {
      expect(mock, `${provider}'s blocking term is not recorded`).toContain(term);
    }

    /* And the route out is written permission, not a second fetch attempt. */
    expect(mock).toContain('WRITTEN PERMISSION');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7 · 🔴 features.ts is untouched, and the false claim is STILL THERE
// ═════════════════════════════════════════════════════════════════════════════
describe("7 — features.ts's copy, bullets and tier chips are byte-identical", () => {
  it('🔴 every field THE-281 wrote is exactly what it wrote', () => {
    /* A picture may not become a licence to adjust the words beside it. The
       AVAILABLE ON chips in particular are a tier claim, and tier claims are the
       class of thing this site has had corrected six times. */
    expect(share.name).toBe('Shareable Giving Page');
    expect(share.n).toBe('2');
    expect(share.tiers).toEqual([1, 1, 1]);
    expect(share.tiersNote).toBeUndefined();
    expect(share.accent).toBe('var(--gold-600)');
    expect(share.accentBg).toBe('var(--gold-100)');
    expect(share.eyebrow).toBe('Sunday morning, from the platform');
    expect(share.title).toBe('Put your giving page on the screen, in one tap.');
    expect(share.oneliner).toBe(
      'Share the page that carries every way your church takes a gift — as a link, a native share sheet, or a QR code big enough to read from the back row.');
    expect(share.moment).toBe(
      'The offering is announced and nobody knows the link. One tap puts a QR on the screen at the front of the room — and the page behind it already lists every account your church actually uses.');
    expect(share.admin).toEqual([
      'Share to any app from your phone’s own share sheet',
      'Copy the page and every payment link in one press',
      'A downloadable QR code for the screen, a flyer or a bulletin',
      'Every link is re-checked against its provider before it is shared',
    ]);
    expect(share.member).toEqual([
      'One page with every way to give, however they prefer',
      'Opens with no login, on any phone',
      'Taps straight through to PayPal, Cash App, Venmo, Revolut or Wise',
      'Scan the QR from a seat and give before the song ends',
    ]);
    expect(share.crosslinks).toEqual([
      { label: 'Donation Page', href: '/features/giving-finance#donation' },
      { label: 'Fundraising', href: '/features/giving-finance#fundraising' },
    ]);
  });

  it('🔴 "Opens with no login" is STILL THERE — false, unedited, and THE-303\'s', () => {
    /* 🔴 THE CLAIM IS CURRENTLY FALSE. The shared URL is
       `https://<tenant>.theharvest.app/?giving=1` — the authenticated app root —
       so it bounces to sign-in. THE-303 is fixing that in the app repo.
       ⚠️ THIS TICKET MUST NOT SILENTLY EDIT IT. If THE-303 concludes the page
       must stay members-only, the rewording is a separate site ticket with the
       founder's decision behind it; and if THE-303 lands, the claim becomes true
       and nothing here needs to change. Either way, an illustration ticket is
       not where a capability claim gets quietly withdrawn.
       This assertion exists so the bullet cannot be edited as a side effect of
       drawing a picture, and so the next reader of this file is told the claim
       is known-false rather than discovering it on the live site. */
    expect(share.member).toContain('Opens with no login, on any phone');
    // And the vignette does not restate it — a picture asserting the same false
    // thing would double the claim without doubling the evidence.
    expect(mockHtml(SHARE_ID)).not.toMatch(/no login/i);
  });

  it('the only line THE-306 added to content/features.ts is a routing entry', () => {
    /* The menu row resolves through `slugify(title)`, so the anchor table had to
       gain a row or every click fell back to the wrong page. That table is
       routing, not copy: no visible string on any page comes from it. */
    const featuresSrc = src('../content/features.ts');
    expect(featuresSrc).toContain(
      "'shareable-giving-page': '/features/giving-finance#sharegiving',");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 8 · the idiom, named against the mock it was modelled on
// ═════════════════════════════════════════════════════════════════════════════
describe('8 — the vignette matches FeatureMock\'s existing idiom', () => {
  const html = mockHtml(SHARE_ID);
  const donation = mockHtml('donation');

  it('🔴 modelled on `donation` — the section directly above it, on the same page', () => {
    /* Named, because "matches the idiom" is otherwise a matter of opinion. These
       are the five structural properties `donation` has, asserted against BOTH
       so the pair cannot drift apart without this failing. */
    for (const [what, needle] of [
      ['the white card', 'background:#fff'],
      ['the hairline', 'border:1px solid rgba(45,37,25,0.08)'],
      ['the 16px radius', 'border-radius:16px'],
      ['the header row', 'padding:11px 13px'],
      ['the 13px body', 'padding:13px'],
    ] as const) {
      expect(donation, `donation lost ${what} — retake this test against it`).toContain(needle);
      expect(html, `the sharegiving vignette is missing ${what}`).toContain(needle);
    }
  });

  it('the shared form furniture is the same shape, at different figures', () => {
    /* Same three-column amount row and same 9px-radius chips, so the two read as
       one product — but not the same NUMBERS, because two adjacent vignettes
       showing an identical picture would be its own kind of "horrible". */
    for (const needle of ['grid-template-columns:1fr 1fr 1fr', 'border-radius:9px']) {
      expect(donation).toContain(needle);
      expect(html).toContain(needle);
    }
    expect(donation).toContain('$50.00');
    expect(html).not.toContain('$50.00');
  });

  it('🔴 nothing was installed to draw it — hand-built markup, like every other mock', () => {
    /* Only `button` and `card` are installed here, and a vignette that needed a
       third would have been a stop-and-report. This one is spans and divs. */
    const mock = src('./FeatureMock.tsx');
    const imports = mock.match(/^import .*$/gm) ?? [];
    expect(imports).toEqual(["import React from 'react';"]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 9 · colour
// ═════════════════════════════════════════════════════════════════════════════
describe('9 — no colour is hardcoded except the provider brand colours', () => {
  it('🔴 …and there are none, so no colour is hardcoded at all', () => {
    /* A provider's brand colour inside its own circle WOULD have been legitimate
       — it is DATA identifying a third party, not a token, on the same footing
       as the app's `tint`/`ink`. The exemption goes unused: a hex value is a
       brand asset like any other. THE-307 found exactly one of the six published
       officially — Venmo's light-ground blue, in the same kit whose mark
       Venmo does not license here (section 6) — so taking the colour while
       dropping the mark asserts the identity with none of the terms attached.
       The other five are published nowhere this site may read. Six colours,
       five unverified, would assert six brand identities as confidently as six
       wrong glyphs. The circles use the ramps instead. */
    const html = mockHtml(SHARE_ID);
    const hexes = (html.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((h) => h.toLowerCase());
    /* `#fff` is the card ground every vignette in this file uses literally, and
       the `donation` button's white label — the file's own idiom, not a colour
       decision this ticket took. Everything else must be a var() or an
       rgba() hairline. */
    expect(new Set(hexes)).toEqual(new Set(['#fff']));

    // Every colour that is not the white ground names a ramp in index.css.
    const ramps = (html.match(/var\(--[a-z0-9-]+\)/g) ?? []);
    expect(ramps.length).toBeGreaterThan(5);
    for (const r of ramps) {
      expect(r, `${r} is not one of the site's ramps`).toMatch(
        /^var\(--(gold|navy|sky|green|stone|cream|text|brand|surface)[a-z0-9-]*\)$/);
    }
  });

  it('the provider list carries no colour field at all, so none can creep in', () => {
    for (const p of SHARE_GIVING_PROVIDERS) {
      expect(Object.keys(p).sort()).toEqual(['monogram', 'name']);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 10 · 380px
// ═════════════════════════════════════════════════════════════════════════════
describe('10 — the circles do not overflow at 380px', () => {
  /**
   * Measured rather than eyeballed, by walking the real box model down from the
   * viewport through the components that wrap this mock:
   *
   *   viewport                                      380
   *   FeatureBlock  padding: 0 20px               − 40  = 340
   *   the card      padding: clamp(26px, 3.5vw…)  − 52  = 288   (3.5vw = 13.3 → 26)
   *   the vignette  padding: 15px 16px 18px       − 32  = 256
   *   the mock card padding: 13px                 − 26  = 230
   *
   * 230px for six columns and five 4px gaps.
   */
  const AVAILABLE = 380 - 40 - 52 - 32 - 26;
  const GAP = 4;
  const CIRCLE = 30;

  it('🔴 six circles fit one row at 380px, with the gaps', () => {
    expect(AVAILABLE).toBe(230);
    const column = (AVAILABLE - GAP * 5) / 6;
    expect(column).toBeCloseTo(35, 0);
    expect(column, 'the 30px circle no longer fits its column at 380px')
      .toBeGreaterThanOrEqual(CIRCLE);
  });

  it('🔴 and cannot overflow at ANY width, because the columns are fractional', () => {
    /* `repeat(6, 1fr)` has no intrinsic width to overflow with: the columns
       divide whatever the container has. The circle is the one fixed dimension,
       and the name below is `min-width:0` with `overflow-wrap:break-word`, so a
       long label wraps INSIDE its column rather than widening the grid. That is
       what keeps the page body from ever scrolling sideways. */
    const html = mockHtml(SHARE_ID);
    expect(html).toContain('grid-template-columns:repeat(6, 1fr)');
    expect(html).toContain('overflow-wrap:break-word');
    expect(html).toContain('min-width:0');
    // No fixed width on the row or the cells, which is the only way this grid
    // could be made to overflow.
    expect(html).not.toMatch(/grid-template-columns:repeat\(6,\s*\d+px\)/);
    expect(html).not.toMatch(/min-width:\s*[1-9]/);
  });

  it('the measurements above are taken from the real wrappers, not assumed', () => {
    const block = src('./FeatureBlock.tsx');
    expect(block).toContain("padding: '0 20px 26px'");
    expect(block).toContain("padding: 'clamp(26px, 3.5vw, 52px)'");
    expect(block).toContain("padding: '15px 16px 18px'");
    expect(mockHtml(SHARE_ID)).toContain('padding:13px');
    // 3.5vw at 380px is 13.3px, so the clamp sits at its 26px floor.
    expect(380 * 0.035).toBeLessThan(26);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 11 · the build config
// ═════════════════════════════════════════════════════════════════════════════
describe('11 — vite.config.ts, ssgOptions and the blog plugin are byte-identical', () => {
  it('🔴 neither file was touched — this ticket adds a picture', () => {
    /* `base: '/'` is absolute deliberately, and `ssgOptions` and the blog plugin
       are what produce the 22 pages the fingerprint table pins. Hashed rather
       than grepped so a whitespace edit fails too. */
    expect(sha(src('../../vite.config.ts')))
      .toBe('709677152f5cb12c9f081bbe900643f4f6529d604c749037d16bf7c23de4af66');
    expect(sha(src('../../build/blog-plugin.ts')))
      .toBe('9dbc3c6194c838c6f33e7dc36dcf72fe8682ff93266238ca73f097253b51be36');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 12 · the page count
// ═════════════════════════════════════════════════════════════════════════════
describe('12 — the prerendered page count is unchanged', () => {
  it('🔴 a vignette and a menu row add no ROUTE', () => {
    /* The feature was already a section on an existing category page; this
       ticket draws it and links to it. `LegalPage.test.ts` asserts the 22 itself
       against the real route table — this says WHY it must not have moved, and
       `the-278-no-regression.test.ts` proves only the giving page's built HTML
       changed. */
    expect(CATEGORIES).toHaveLength(5);
    expect(CATEGORIES.map((c) => c.slug)).toEqual([
      'community-engagement', 'discipleship-content', 'ai-automation',
      'giving-finance', 'platform-brand',
    ]);
    // The menu row is an in-page anchor on a page that already exists.
    expect(itemHref(givingGroup.items.find((i) => i.title === SHARE_TITLE)!))
      .toMatch(/^\/features\/giving-finance#/);
  });
});
