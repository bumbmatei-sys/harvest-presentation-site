import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ComingSoonPage } from './ComingSoonPage';
import { FeatureMenuColumns, Nav } from '../components/Nav';
import { CATALOG, CATALOG_TOOL_COUNT, slugify } from '../components/catalog';
import {
  ADD_ONS,
  ADD_ON_BILLED_MONTHS,
  ADVERTISED_DISCOUNT_PCT,
  DODO_ADD_ON_CATALOG,
  INTENTIONALLY_UNADVERTISED,
  addOnPricingContract,
  dodoAddOnCatalogContract,
  plans,
  type AddOn,
} from '../components/Pricing';
import { CATEGORIES } from '../content/features';
import {
  COMING_SOON_HREF, COMING_SOON_IDS, COMING_SOON_ITEMS, COMING_SOON_NAME,
  IN_PROCESS_LABEL, NOT_BUILT_LABEL, NOT_BUILT_NOTICE, comingSoonContract, type SoonItem,
} from '../content/coming-soon';

/* ─── THE-247 — a Coming Soon category, and the page behind it ────────────────
 *
 * 🔴 THIS IS THE SEVENTH OPPORTUNITY TO SHIP A FALSE CLAIM, and the easiest one
 * to get wrong. Six have already been corrected on this site — a Church
 * directory that did not exist, a $59/mo figure in the nav, a 7-vs-14-day
 * trial, a Docs & Notes comparison row, Notes and Community claimed on every
 * plan, and four add-on prices that disagreed with Dodo. Every one of those was
 * a wrong claim about something REAL. This is a whole page about eight things
 * that are not real, so the only defence is that nothing on it can be read as
 * purchasable.
 *
 * ⚠️ ASSERTED AGAINST RENDERED OUTPUT, and against the prerendered file when
 * the build has run. PR 55 is the precedent: a pure-function test passed while
 * the JSX seam was mutated. A tier badge is not a claim until something draws
 * it, so the claims below read markup.
 *
 * ⚠️ SCOPE. The false-claim assertions are scoped to <main>. Nav and Footer
 * wrap EVERY route — /contact and /terms carry the same "Start free trial"
 * button — so a sitewide sweep here would be asserting that the site has no
 * trial CTA, which is neither true nor wanted. What must be clean is the page:
 * inside <main> there is no price, no tier badge, no purchase link and no
 * /#pricing href at all. Test 6 proves the scoping is not a loophole by
 * checking that the chrome outside <main> really does still carry them. */

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..', '..');
const DIST_PAGE = path.join(ROOT, 'dist', 'features', 'coming-soon', 'index.html');
const built = fs.existsSync(DIST_PAGE);

/* ⚠️ HelmetProvider IS NOT OPTIONAL, and leaving it out is a green-locally /
   red-in-CI trap this suite fell into once. The page renders <Seo/>, which is
   vite-react-ssg's <Head/>, which is react-helmet-async — and without a
   provider its dispatcher throws before a single test in the file runs. It only
   looked fine because an earlier `npm run build` had left dist/ on disk, so the
   fallback render path was never taken. CI runs `npm test` BEFORE
   `npm run build`, so on a clean checkout that path is the ONLY one.
   pages/LegalPage.test.ts wraps its renders the same way. */
const render = (el: React.ReactElement) =>
  renderToStaticMarkup(React.createElement(
    HelmetProvider, null,
    React.createElement(MemoryRouter, { initialEntries: [COMING_SOON_HREF] }, el),
  ));

/** The page as it ships. Post-build this is the real artifact; on a clean
 *  checkout `npm test` runs before `npm run build`, so the same component goes
 *  through the same server renderer vite-react-ssg prerenders with. CI runs the
 *  suite again after the build, so the file itself is read once per commit. */
const pageHtml = built
  ? fs.readFileSync(DIST_PAGE, 'utf8')
  : render(React.createElement(ComingSoonPage));

/** Just the page. Everything outside it is chrome shared with every route. */
const mainHtml = (() => {
  const m = /<main[^>]*>([\s\S]*)<\/main>/.exec(pageHtml);
  expect(m, 'the page rendered no <main>').not.toBeNull();
  return m![1];
})();

/** Markup as a visitor reads it: comments dropped, tags stripped, entities
 *  decoded, whitespace collapsed. ⚠️ React separates adjacent text nodes with
 *  `<!-- -->`, so "$" and "20" arrive apart and only rejoin once the comments
 *  and tags are gone — normalise before matching or every price check is
 *  vacuous. `&amp;` last, or `&amp;lt;` would decode twice. */
const words = (markup: string) => markup
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&#x2F;/g, '/')
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

const mainText = words(mainHtml);
const navHtml = renderToStaticMarkup(
  React.createElement(MemoryRouter, { initialEntries: ['/'] }, React.createElement(Nav)),
);

/* Both Features menus, rendered.
   ⚠️ `renderToStaticMarkup(<Nav/>)` renders the top bar and NOTHING ELSE: the
   desktop grid is behind `mega` state and the accordion behind `mobile`, and
   nothing outside a real click sets either in this DOM-less runner. That is why
   the column list is its own exported component — the same reason
   `MegaMenuFooterLabel` is. Rendering it here is what makes the ordering claim
   an assertion about markup rather than about an array. */
const menuHtml = (variant: 'desktop' | 'mobile') => renderToStaticMarkup(
  React.createElement(MemoryRouter, { initialEntries: ['/'] },
    React.createElement(FeatureMenuColumns, { variant })),
);
const desktopMenu = menuHtml('desktop');
const mobileMenu = menuHtml('mobile');

const SOURCE = `${built ? 'dist/features/coming-soon/index.html' : 'rendered from ComingSoonPage.tsx'}`;

/** The five live category tints, read off the catalogue rather than written
 *  down, so a re-tinted category keeps this honest. */
const LIVE_TINTS = CATALOG.filter((g) => !g.href).map((g) => g.tint);

/* ── 1 ───────────────────────────────────────────────────────────────────── */
describe('the Features nav has six categories', () => {
  it('CATALOG carries six groups — the five live ones and Coming Soon', () => {
    expect(CATALOG).toHaveLength(6);
    expect(CATALOG.map((g) => g.name)).toEqual([
      COMING_SOON_NAME,
      'Community & Engagement',
      'Discipleship & Content',
      'AI & Automation',
      'Giving & Finance',
      'Platform & Brand',
    ]);
  });

  it('and both menus render all six column headers', () => {
    for (const [where, html] of [['desktop', desktopMenu], ['mobile', mobileMenu]] as const) {
      for (const g of CATALOG) {
        expect(words(html), `the ${where} menu does not render the "${g.name}" column`).toContain(g.name);
      }
      // Not vacuous — six headers, not one repeated.
      expect(new Set(CATALOG.map((g) => g.name)).size).toBe(6);
    }
  });
});

/* ── 2 ───────────────────────────────────────────────────────────────────── */
describe('Coming Soon is first on desktop and first on mobile', () => {
  it('is the first group in the catalogue, which is the leftmost desktop column', () => {
    // The desktop mega-menu maps CATALOG in order into a grid; grid
    // auto-placement puts the first item top-left. The mobile accordion maps
    // the same array into a vertical stack, so one array position decides both.
    expect(CATALOG[0].name).toBe(COMING_SOON_NAME);
  });

  it('🔴 renders before every live category in BOTH menus, read off the markup', () => {
    for (const [where, html] of [['desktop', desktopMenu], ['mobile', mobileMenu]] as const) {
      const soonAt = html.indexOf(COMING_SOON_NAME);
      expect(soonAt, `Coming Soon is not in the ${where} menu at all`).toBeGreaterThanOrEqual(0);
      for (const g of CATALOG.slice(1)) {
        // The catalogue names carry an ampersand, which React escapes.
        const liveAt = html.indexOf(g.name.replace(/&/g, '&amp;'));
        expect(liveAt, `"${g.name}" is missing from the ${where} menu`).toBeGreaterThanOrEqual(0);
        expect(soonAt, `"${g.name}" renders before Coming Soon on ${where}`).toBeLessThan(liveAt);
      }
      // And its eight items lead too, not just its header.
      expect(html.indexOf(COMING_SOON_ITEMS[0].name))
        .toBeLessThan(html.indexOf('Community Feed'));
    }
  });

  it('one array position decides both menus, so they cannot disagree', () => {
    // The structural half: both variants map the same CATALOG in one component.
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Nav.tsx'), 'utf8');
    expect((src.match(/<FeatureMenuColumns/g) ?? []).length).toBe(2);
    expect((src.match(/CATALOG\.map/g) ?? []).length, 'a menu maps CATALOG on its own').toBe(1);
  });

  it('the mega-menu is capped and scrolls, so a sixth column cannot run off a short window', () => {
    /* 🔴 FOUND BY MEASURING THE REAL BROWSER, not by arithmetic. The desktop
       panel had no height cap at all: with six columns it measured 696px tall
       against a 600px window at 1024 wide, and 816px against a 700px window at
       901 wide — where six groups wrap onto two rows — and everything below the
       fold was unreachable. The mobile panel has always capped and scrolled;
       the desktop one now uses the same rule. */
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Nav.tsx'), 'utf8');
    const panel = src.slice(src.indexOf('className="nav-mega"'), src.indexOf('harvestMenuIn', src.indexOf('className="nav-mega"')));
    expect(panel).toContain("maxHeight: 'calc(100vh - 120px)'");
    expect(panel).toContain("overflowY: 'auto'");
  });

  it('the mega-menu grid cannot overflow horizontally, so "first" survives a narrow viewport', () => {
    // 🔴 `repeat(6, 1fr)` would have been the obvious way to add a column and
    // is the wrong one: a bare 1fr track's implicit min-width is `auto`, so it
    // refuses to shrink below its content and pushes the panel wider than the
    // screen instead. See test 13 for the arithmetic.
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Nav.tsx'), 'utf8');
    expect(src).toContain('repeat(auto-fit, minmax(136px, 1fr))');
    expect(src, 'a fixed six-column grid can overflow').not.toContain('repeat(6, 1fr)');
  });
});

/* ── 3 ───────────────────────────────────────────────────────────────────── */
describe('Coming Soon renders in a muted style, distinct from the five live categories', () => {
  it('carries the grey token where the other five carry a colour', () => {
    expect(CATALOG[0].tint).toBe('var(--text-soon)');
    expect(LIVE_TINTS).toEqual([
      'var(--sky-600)', 'var(--green-600)', 'var(--gold-600)', 'var(--gold-700)', 'var(--navy-600)',
    ]);
    expect(LIVE_TINTS, 'the grey is one of the live tints').not.toContain(CATALOG[0].tint);
  });

  it('🔴 no live category tint reaches the page at all', () => {
    // The whole visual argument is "grey, not coloured". One --gold-600 heading
    // would undo it, and a tint can arrive through a copied style block without
    // anyone noticing.
    for (const tint of LIVE_TINTS) {
      expect(mainHtml, `the page paints ${tint}, a live category colour`).not.toContain(tint);
    }
    // Nor the brand gold as a text or background colour. The two occurrences
    // that remain are `--hb-dot` on the shared HBtn component — the 6px dot
    // every button on this site carries, chrome rather than a category tint.
    const brandUses = [...mainHtml.matchAll(/--brand/g)].length;
    const dotUses = [...mainHtml.matchAll(/--hb-dot:var\(--brand\)/g)].length;
    expect(brandUses, 'brand gold is used for something other than the shared button dot')
      .toBe(dotUses);
  });

  it('and the page actually paints the grey — this is not vacuous', () => {
    expect(mainHtml).toContain('var(--text-soon)');
    expect(mainHtml, 'the navy band never uses the on-dark grey').toContain('var(--text-soon-dark)');
  });

  it('the SOON pill is grey, not the sky tint it carried while nothing used it', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Nav.tsx'), 'utf8');
    const pill = src.slice(src.indexOf('const soonPill'), src.indexOf('const linkStyle'));
    expect(pill).toContain('var(--text-soon)');
    expect(pill, 'the SOON pill still uses Community & Engagement\'s sky tint').not.toContain('--sky-');
  });

  it('every item reads "In process", and none of them reads "not started"', () => {
    /* Founder direction. ⚠️ The pairing is deliberate and is what keeps it
       honest: each card carries NOT_BUILT_LABEL and IN_PROCESS_LABEL together,
       in that order, so "In process" never stands alone as a claim that work
       is under way. No date accompanies either. */
    const inProcess = [...mainText.matchAll(new RegExp(IN_PROCESS_LABEL, 'g'))];
    expect(inProcess).toHaveLength(COMING_SOON_ITEMS.length);
    expect(mainText).not.toMatch(/not started/i);
    expect(mainText).not.toMatch(/nothing has been started/i);
    expect(mainText).not.toMatch(/not committed/i);
    // The blunt half is still there, once per item, and still comes first.
    expect(mainText.indexOf(NOT_BUILT_LABEL)).toBeLessThan(mainText.indexOf(IN_PROCESS_LABEL));
  });

  it('every unbuilt item is marked soon and says so in words, not only in colour', () => {
    // Colour alone is not an accessible signal. Each block carries the label in
    // text, so the distinction survives greyscale, a screen reader and a
    // colour-blind reader alike.
    expect(CATALOG[0].items.every((i) => i.soon)).toBe(true);
    const labels = [...mainText.matchAll(new RegExp(NOT_BUILT_LABEL, 'g'))];
    expect(labels).toHaveLength(COMING_SOON_ITEMS.length);
  });
});

/* ── 4 ───────────────────────────────────────────────────────────────────── */
describe('it is legible and distinguishable in all four palettes', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');

  /** Token value straight out of index.css — nothing here hardcodes a hex, so
   *  changing a token changes what is measured. */
  const token = (name: string): string => {
    const m = new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
    expect(m, `--${name} is not defined in index.css`).not.toBeNull();
    return m![1];
  };

  const chan = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
  };
  const contrast = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  /** Lab chroma — how colourful, independent of how light. */
  const chroma = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => chan(parseInt(hex.slice(i, i + 2), 16)));
    const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const fx = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
    const fy = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
    const fz = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
    return Math.hypot(500 * (fx - fy), 200 * (fy - fz));
  };

  /* 🔴 REPORTED DRIFT, PINNED HERE RATHER THAN ONLY IN THE PR.
     The ticket asked for four palettes — "Harvest and Classic x light and
     dark". THIS REPOSITORY HAS NEITHER A CLASSIC PALETTE NOR A DARK MODE.
     There is one `:root`, no `prefers-color-scheme` query, no `data-theme`
     attribute and no theme switcher anywhere in src/, and "Classic" appears
     nowhere in the tree or in any commit. (Board card THE-168 — "Add a third
     theme" — and THE-183 — "Admin Settings has its own theme control" — are
     both `area: App`: the themes are in the member app, not on this site.)

     What this site does have is ONE palette painted on FOUR GROUNDS, with
     tokens paired for the light ones and the dark one exactly as
     --text-muted / --text-muted-dark are. Those four grounds are what is
     measured below, and they are named:

       1. WHITE   #FFFFFF        every card, and the nav's glass panel
       2. CREAM   --cream        the page itself
       3. STONE   --stone-100    sunken panels and the concept-sketch ground
       4. NAVY    --navy-900     the band, where --text-soon-dark takes over

     If a Classic palette or a dark mode ever lands, this block is where the
     fifth through eighth grounds go. */
  const GROUNDS: [string, string][] = [
    ['white (cards, nav glass)', '#FFFFFF'],
    ['cream (--cream, the page)', token('cream')],
    ['stone (--stone-100, sunken)', token('stone-100')],
    ['navy (--navy-900, the band)', token('navy-900')],
  ];

  it('this repository really does have one palette and no dark mode — the premise, checked', () => {
    /* ⚠️ TWO :root BLOCKS SINCE THE-278, AND STILL ONE PALETTE. The second is
       the shadcn token bridge, which spells shadcn's vocabulary as aliases of
       the ramps declared above it and introduces no colour of its own.

       Counting braces was a proxy for the thing that actually matters, so the
       thing itself is asserted instead: every declaration in any :root after
       the first must be a var() alias or a length — never a literal colour. A
       Classic palette or a dark mode could not be written that way, which makes
       this stricter than the count it replaces, not looser. */
    const roots = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(roots.length, 'more than two :root blocks').toBeLessThanOrEqual(2);
    for (const body of roots.slice(1)) {
      const literals = body.match(/:\s*(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\()/g) ?? [];
      expect(literals, 'a :root after the first paints a colour — that is a second palette').toEqual([]);
    }
    expect(css).not.toMatch(/prefers-color-scheme/);
    expect(css).not.toMatch(/data-theme/);
    const srcFiles = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? srcFiles(path.join(dir, e.name))
        : /\.(ts|tsx|css)$/.test(e.name) ? [path.join(dir, e.name)] : []));
    const themed = srcFiles(path.join(ROOT, 'src'))
      .filter((f) => f !== fileURLToPath(import.meta.url))
      .filter((f) => /prefers-color-scheme|data-theme/.test(fs.readFileSync(f, 'utf8')));
    expect(themed.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it('🔴 the grey clears WCAG AA on every ground it is painted on', () => {
    const light = token('text-soon');
    const dark = token('text-soon-dark');
    // Each token belongs to its own ground, the same discipline --text-muted
    // and --text-muted-dark already follow.
    const measured = Object.fromEntries(GROUNDS.map(([name, hex]) => [
      name,
      Number(contrast(name.startsWith('navy') ? dark : light, hex).toFixed(2)),
    ]));
    for (const [name, ratio] of Object.entries(measured)) {
      expect(ratio, `the grey is ${ratio} : 1 on ${name} — below AA`).toBeGreaterThanOrEqual(4.5);
    }
    // The figures the change is reported with.
    expect(measured).toEqual({
      'white (cards, nav glass)': 5.38,
      'cream (--cream, the page)': 5.07,
      'stone (--stone-100, sunken)': 4.66,
      'navy (--navy-900, the band)': 7.17,
    });
  });

  it('would NOT have cleared it with --text-muted, which is why a token was added', () => {
    // The alternative that was rejected, measured rather than asserted. If a
    // later edit "simplifies" the page back onto --text-muted, this fails and
    // says why.
    const muted = token('text-muted');
    for (const [name, hex] of GROUNDS.filter(([n]) => !n.startsWith('navy'))) {
      expect(contrast(muted, hex), `--text-muted would have passed on ${name}`).toBeLessThan(3);
    }
  });

  it('and neither token is legible on the other one\'s ground — so they cannot be swapped', () => {
    expect(contrast(token('text-soon'), token('navy-900'))).toBeLessThan(4.5);
    expect(contrast(token('text-soon-dark'), '#FFFFFF')).toBeLessThan(4.5);
  });

  it('reads as grey next to five colours, by measurement rather than by eye', () => {
    // Distinguishable is not the same as legible. The live tints are 26 to 52
    // chroma; both greys are under 5, which is what makes "not coloured" read
    // as deliberate rather than as a sixth brand colour.
    const liveHexes = ['sky-600', 'green-600', 'gold-600', 'gold-700', 'navy-600'].map(token);
    for (const hex of liveHexes) expect(chroma(hex)).toBeGreaterThan(20);
    expect(chroma(token('text-soon'))).toBeLessThan(5);
    expect(chroma(token('text-soon-dark'))).toBeLessThan(5);
  });
});

/* ── 5 ───────────────────────────────────────────────────────────────────── */
describe('the Coming Soon page lists every named item', () => {
  /** The six the founder named, by the board card each traces to. Written out
   *  so a renamed entry that quietly drops one is a failure here. */
  const FOUNDER_NAMED: [string, string][] = [
    ['Multiple languages', 'THE-123'],
    ['Church service and worship planner', 'THE-122'],
    ['Application processing', 'THE-112'],
    ['Documentation', 'THE-117'],
    ['Website builder', 'THE-59'],
    ['In-app personal AI assistant', 'THE-58'],
  ];

  it('carries all six the founder named, each against its open board card', () => {
    const refs = COMING_SOON_ITEMS.map((i) => i.ref);
    for (const [label, ref] of FOUNDER_NAMED) {
      expect(refs, `"${label}" (${ref}) is missing from the page`).toContain(ref);
    }
  });

  it('plus the two found on the board, and nothing invented', () => {
    // Every entry traces to a real open card. An item with no card would be
    // this page inventing a promise, which is the failure mode it exists to
    // prevent.
    expect(COMING_SOON_ITEMS.map((i) => i.ref)).toEqual([
      'THE-123', 'THE-122', 'THE-112', 'THE-117', 'THE-59', 'THE-58',
      'THE-118', 'THE-98',
      // THE-245 — SMS & Text-to-Give, the ninth and the only RELOCATED one:
      // every entry above describes work that was never built, this one
      // describes work that shipped, was found untested, and was withdrawn from
      // sale before it could be marketed. Its ref is the card that withdrew it,
      // which is the open card that now owns the gap.
      'THE-245',
      // THE-97 — the affiliate programme (THE-252). The SECOND relocated entry,
      // and it traces to the card that owns the gap rather than to the ticket
      // that wrote the copy: THE-97 is the open "decide where payouts originate"
      // card, still Todo, and it is why nobody can be paid a referral share
      // today. Its own terms are asserted in the-252-affiliate-coming-soon.test.ts.
      'THE-97',
      // THE-280 — custom domains, the THIRD relocated entry and the one whose
      // card is its own. The feature shipped a panel and was never activated:
      // the Vercel subscription behind it was never bought, so a church that
      // saved a domain was shown DNS records pointing nowhere. The app hides it
      // behind CUSTOM_DOMAIN_ENABLED in the same change. Its own terms are
      // asserted in the-280-custom-domain-coming-soon.test.ts.
      'THE-280',
    ]);
    // THE-115 (a Play Store / App Store listing) was on this page and was
    // pulled at the founder's direction. It must not drift back in.
    expect(COMING_SOON_ITEMS.map((i) => i.ref)).not.toContain('THE-115');
    expect(mainText).not.toMatch(/play store|app store/i);
    for (const item of COMING_SOON_ITEMS) expect(item.ref).toMatch(/^THE-\d+$/);
  });

  it.each(COMING_SOON_ITEMS.map((i) => [i.name, i] as const))(
    `"%s" renders in full on the page (${SOURCE})`,
    (_name, item) => {
      expect(mainText, 'the name is missing').toContain(item.name);
      expect(mainText, 'the heading is missing').toContain(words(item.title));
      expect(mainText, 'the one-liner is missing').toContain(words(item.oneliner));
      expect(mainText, 'the "Today" paragraph is missing').toContain(words(item.today));
      for (const line of item.considering) expect(mainText).toContain(words(line));
      if (item.notThis) expect(mainText).toContain(words(item.notThis));
      // And it is reachable: the index links to its anchor, and the block has it.
      expect(mainHtml).toContain(`href="${COMING_SOON_HREF}#${item.id}"`);
      expect(mainHtml).toContain(`id="${item.id}"`);
    },
  );

  it('the mega-menu lists the same eight, derived rather than kept twice', () => {
    expect(CATALOG[0].items.map((i) => i.title)).toEqual(COMING_SOON_ITEMS.map((i) => i.name));
    for (const item of CATALOG[0].items) {
      for (const [where, html] of [['desktop', desktopMenu], ['mobile', mobileMenu]] as const) {
        expect(words(html), `the ${where} menu does not list "${item.title}"`).toContain(item.title);
      }
    }
    // And each is badged SOON in the menu itself, not only in the data.
    expect((desktopMenu.match(/SOON/g) ?? []).length).toBe(COMING_SOON_ITEMS.length);
  });

  it('and the page says up front that none of it exists', () => {
    expect(mainText).toContain(words(NOT_BUILT_NOTICE));
  });
});

/* ── 6 ───────────────────────────────────────────────────────────────────── */
describe('no coming-soon item carries a price, a tier badge or a purchase call to action', () => {
  it('🔴 no price of any kind appears on the page', () => {
    // Normalised first: React splits "$" from "20" with a comment node, so an
    // un-normalised search for /\$\d/ would pass on a page quoting a price.
    expect(mainText).not.toMatch(/\$\s?\d/);
    expect(mainText).not.toMatch(/\b\d+\s*(\/|per\s)\s*(mo|month|yr|year)\b/i);
    expect(mainText).not.toMatch(/\bfree\b/i);
  });

  it('🔴 no tier badge, and no "Available on" row', () => {
    // FeatureBlock's plan-chip row is headed "Available on". Its absence is the
    // structural difference between a live feature card and this one.
    expect(mainText).not.toMatch(/Available on/i);
    // A tier name may appear ONLY where the copy describes something that
    // already ships — see test 7, which pins exactly where and why.
    const chipRow = /<div style="display:flex;flex-wrap:wrap;gap:8px">/;
    expect(mainHtml.match(chipRow), 'a plan-chip row is rendered').toBeNull();
    expect(mainHtml, 'a dashed "not on this plan" chip is rendered').not.toContain('1px dashed rgba(45,37,25,0.18)');
  });

  it('🔴 nothing on the page can be clicked towards a purchase', () => {
    expect(mainHtml, 'the page links to pricing').not.toContain('/#pricing');
    expect(mainHtml).not.toContain('/pricing');
    expect(mainText).not.toMatch(/start (your |a )?(free )?trial/i);
    expect(mainText).not.toMatch(/compare plans/i);
    expect(mainText).not.toMatch(/\b(buy|purchase|subscribe|upgrade now|get started|sign up)\b/i);
    // Every destination the page offers, enumerated. Anything new has to be
    // added here deliberately.
    const hrefs = [...new Set([...mainHtml.matchAll(/href="([^"]*)"/g)].map((m) => m[1]))].sort();
    const expected = [
      '/contact',
      ...CATEGORIES.map((c) => `/features/${c.slug}`),
      ...COMING_SOON_IDS.map((id) => `${COMING_SOON_HREF}#${id}`),
    ].sort();
    expect(hrefs).toEqual(expected);
  });

  it('the <main> scoping is not a loophole — the site still has a trial CTA elsewhere', () => {
    /* 🔴 THE ASSERTION THAT KEEPS THE THREE ABOVE HONEST. Scoping to <main>
       would be a way to pass by deleting the site's nav rather than by writing
       a clean page. The trial CTA and the pricing link are still there — in the
       chrome that wraps EVERY route, /contact and /terms included — so the
       cleanliness above is a property of this PAGE, not of a stripped render.

       ⚠️ Which markup carries that proof depends on how the page was obtained.
       The prerendered file is the whole document, chrome and all. The fallback
       renders <ComingSoonPage/> alone — there is no Layout around it — so the
       chrome is checked on the nav itself, which owns the CTA either way. */
    if (built) {
      const outside = pageHtml.replace(mainHtml, '');
      expect(outside, 'the nav/footer trial CTA vanished — this test is now vacuous')
        .toMatch(/Start free trial/);
      expect(outside).toContain('/#pricing');
    } else {
      expect(navHtml, 'the nav lost its trial CTA — this test is now vacuous')
        .toMatch(/Start free trial/);
      expect(navHtml).toContain('/#pricing');
    }
  });

  it('🔴 the content contract throws on every way this page could become a claim — by mutation', () => {
    /* N mutations, N distinct named failures. The guard is armed at MODULE
       SCOPE in content/coming-soon.ts, so each of these would fail
       `vite-react-ssg build` and stop the page shipping — not merely turn a
       test red. Handing it mutated input is the only way to watch it fire. */
    const base = COMING_SOON_ITEMS[0];
    const withCopy = (patch: Partial<SoonItem>): SoonItem[] => [{ ...base, ...patch }];

    // The real list passes — otherwise every case below is vacuous.
    expect(() => comingSoonContract(COMING_SOON_ITEMS)).not.toThrow();

    const cases: [string, Partial<SoonItem>, RegExp][] = [
      ['a price', { oneliner: 'A fund selector, yours for $12 a month.' }, /carries a price/],
      ['a monthly figure', { navDesc: 'Costs 12/mo once it lands.' }, /per-month or per-year figure/],
      ['an "included in" claim', { today: 'Already included in the Ministry plan.' }, /included in a plan/],
      ['an availability claim', { title: 'Available on every plan today.' }, /an availability claim/],
      ['an add-on', { navDesc: 'Ships as a paid add-on.' }, /an add-on/],
      ['a seat', { oneliner: 'One additional seat per reviewer.' }, /a seat/],
      ['a purchase CTA', { title: 'Subscribe to reserve your place.' }, /purchase call to action/],
      ['the word "free"', { navDesc: 'Free for every church.' }, /the word "free"/],
      ['a delivery date', { oneliner: 'Landing in Q3 2027.' }, /a delivery date/],
      ['a promise it will ship', { title: 'This will ship to every church.' }, /a promise that it is coming/],
      ['a tier on unbuilt work', { eyebrow: 'Coming to Ministry' }, /names a plan tier against unbuilt work/],
      ['a "not started" phrasing', { navDesc: 'Not started, and no date.' }, /a "not started" phrasing/],
      ['an "uncommitted" hedge', { title: 'Considered but not committed.' }, /an "uncommitted" hedge/],
      ['an entry with no board card', { ref: 'invented' }, /no board reference/],
    ];

    for (const [label, patch, message] of cases) {
      expect(() => comingSoonContract(withCopy(patch)), `the contract accepted ${label}`)
        .toThrow(message);
    }

    // Duplicate anchors, which is a list-level rather than an item-level fault.
    expect(() => comingSoonContract([base, { ...base, name: 'Other' }]))
      .toThrow(/ids must be unique/);

    // 🔴 AND THE EXEMPTION IS NOT A HOLE. `today` and `notThis` may name a plan,
    // because they describe what already ships — but they are still held to
    // every other pattern.
    expect(() => comingSoonContract(withCopy({ today: 'Branding sits on the Ministry plan.' })))
      .not.toThrow();
    expect(() => comingSoonContract(withCopy({ today: 'Branding costs $9 a month.' })))
      .toThrow(/carries a price/);
  });

  it('SoonItem has nowhere to put a price or a tier — the shape is the guard', () => {
    // 🔴 THE STRUCTURAL HALF. content/features.ts's `Feature` has `tiers`, and
    // FeatureBlock draws chips from it. `SoonItem` has no such field, so a
    // coming-soon entry cannot express a plan claim even by accident.
    const src = fs.readFileSync(path.join(ROOT, 'src/content/coming-soon.ts'), 'utf8');
    const iface = src.slice(src.indexOf('export interface SoonItem'), src.indexOf('export const COMING_SOON_SLUG'));
    for (const field of ['tiers', 'price', 'monthly', 'annual', 'planIds', 'cta']) {
      expect(iface, `SoonItem has a "${field}" field`).not.toMatch(new RegExp(`\\b${field}\\??:`));
    }
    for (const item of COMING_SOON_ITEMS) {
      expect(Object.keys(item)).not.toContain('tiers');
    }
  });
});

/* ── 7 ───────────────────────────────────────────────────────────────────── */
describe('no coming-soon item is described as included in any plan', () => {
  it('🔴 nothing unbuilt is attached to a tier', () => {
    expect(mainText).not.toMatch(/\bincluded (in|on|with)\b/i);
    expect(mainText).not.toMatch(/\bcomes with your plan\b/i);
    expect(mainText).not.toMatch(/\bon (every|all) plans?\b/i);
    expect(mainText).not.toMatch(/\byour plan includes\b/i);
  });

  it('a tier name appears only where the sentence is about something that SHIPS', () => {
    /* ⚠️ NOT A BLANKET BAN, and the distinction matters. Two sentences on this
       page name a plan, and both are true statements about LIVE features:

         · website.today  — "branding … on the Ministry plan", the thing that
           exists instead of the website builder that does not.
         · agent.notThis  — "AI Chat … is part of the Small Team and Ministry
           plans", which is the whole point of test 8.

       Banning the words outright would have forced both sentences to be vaguer,
       and vaguer is the direction this page must never go. What is banned is a
       tier attached to UNBUILT work — enforced field by field at module scope
       in content/coming-soon.ts, and re-derived here from the rendered page. */
    const TIERS = /\b(Individual|Small Team|Ministry|Forever Free)\b/g;
    const allowed = COMING_SOON_ITEMS.flatMap((i) => [i.today, i.notThis ?? '']).join(' ');

    for (const item of COMING_SOON_ITEMS) {
      const unbuiltCopy = [item.name, item.eyebrow, item.title, item.oneliner, ...item.considering];
      for (const text of unbuiltCopy) {
        expect(text.match(TIERS), `"${item.id}" names a plan against unbuilt work: "${text}"`).toBeNull();
      }
    }

    // Every tier mention on the rendered page traces back to a `today` or a
    // `notThis` — nothing else may introduce one.
    const onPage = mainText.match(TIERS) ?? [];
    expect(onPage.length, 'the exemption is vacuous — no tier is named at all').toBeGreaterThan(0);
    for (const name of new Set(onPage)) {
      expect(allowed, `"${name}" is on the page but in neither a "Today" nor a "Not to be confused with"`)
        .toContain(name);
    }
  });

  it('the page renders no check marks, which would read as "you get this"', () => {
    // FeatureBlock leads every capability line with a gold tick. The
    // considering list leads with a dashed grey square instead.
    expect(mainHtml, 'a tick is drawn on an unbuilt feature').not.toContain('M5 10l3 3 7-7');
    expect(mainHtml).not.toContain('lucide-check');
  });

  it('and every item says what a church has TODAY, so the gap is named', () => {
    for (const item of COMING_SOON_ITEMS) {
      expect(item.today.length, `"${item.id}" has no "Today" paragraph`).toBeGreaterThan(60);
      expect(mainText).toContain(words(item.today));
    }
    expect(mainText).toContain('Today');
  });
});

/* ── 8 ───────────────────────────────────────────────────────────────────── */
describe('the in-app AI assistant copy does not describe the shipping member assistant', () => {
  const agent = COMING_SOON_ITEMS.find((i) => i.id === 'agent')!;
  const agentCopy = [agent.name, agent.eyebrow, agent.title, agent.oneliner, agent.navDesc, ...agent.considering].join(' ');

  it('the shipping assistant is still described, now as the add-on it is', () => {
    /* ⚠️ NOT VACUOUS, AND THE POINT OF IT IS UNCHANGED. `aiChat` is real and
       ships; this test exists so the unbuilt admin agent below cannot be read as
       that shipping feature.
       WAS `[0, 1, 1]` — false for Individual, true for Small Team and Ministry,
       which was the app's matrix and which THE-224 turned this distinction on.
       🔴 IT IS `[0, 0, 0]` NOW (THE-253): no plan includes the chat, because it
       is sold as the AI Assistant add-on. The feature is no less shipped — what
       moved is which column it is bought in, and the add-on card on the pricing
       page is where it is named. */
    const aiChat = CATEGORIES.flatMap((c) => c.features).find((f) => f.id === 'aichat');
    expect(aiChat, 'the shipping AI Chat feature entry is gone').toBeDefined();
    expect(aiChat!.tiers).toEqual([0, 0, 0]);
    expect(aiChat!.tiersNote, 'nothing says where the chat comes from').toMatch(/AI Assistant add-on/i);
    expect(CATALOG.flatMap((g) => g.items).map((i) => i.title)).toContain('AI Chat');
    // 🔴 AND IT IS SOLD ON THE PRICING PAGE, which is the surface that may name
    // a price. This page still may not — asserted in describe 10 below.
    expect(ADD_ONS.map((a) => a.name)).toContain('AI Assistant');
  });

  it('🔴 the unbuilt one is for ADMINS and it ACTS — the two things the shipping one is not', () => {
    // The shipping assistant is member-facing and answers questions from the
    // church's own teaching. If the coming-soon copy could be read as that, a
    // church on Small Team would think it was being sold what it already has —
    // which is exactly the confusion THE-224 withdrew a $20 card over.
    expect(agentCopy).toMatch(/\badmin/i);
    expect(agentCopy).toMatch(/\bact(s|ing)?\b/i);
    expect(agent.title).toMatch(/does the work, not one that answers questions/i);
    expect(agent.eyebrow).toMatch(/running the church/i);
  });

  it('🔴 it never claims the member-facing behaviour that already ships', () => {
    const memberish: [string, RegExp][] = [
      ['answering members', /answers? (your )?(members|congregation|people)/i],
      ['a member-facing assistant', /\bfor (your )?members\b/i],
      ['answering from your teaching', /from your own teaching/i],
      ['a contextual member assistant', /contextual assistant/i],
      ["the ministry's voice", /ministry'?s voice/i],
    ];
    for (const [label, re] of memberish) {
      expect(re.test(agentCopy), `the unbuilt agent copy claims ${label}`).toBe(false);
    }
  });

  it('and it draws the line explicitly, in the page a visitor actually reads', () => {
    // The strongest guard is not the absence of a phrase but the presence of
    // the correction. `notThis` renders under "Not to be confused with".
    expect(agent.notThis).toBeDefined();
    expect(agent.notThis!).toMatch(/not AI Chat/i);
    expect(agent.notThis!).toMatch(/already ships/i);
    expect(agent.notThis!).toMatch(/for your members/i);
    expect(agent.notThis!).toMatch(/does not exist/i);
    expect(mainText).toContain('Not to be confused with');
    expect(mainText).toContain(words(agent.notThis!));
  });

  it('the two are named differently, so neither reads as the other', () => {
    const liveTitles = CATALOG.filter((g) => !g.href).flatMap((g) => g.items).map((i) => i.title);
    expect(liveTitles).toContain('AI Chat');
    expect(liveTitles).not.toContain(agent.name);
    expect(agent.name).toBe('In-app AI agent for admins');
  });
});

/* ── 9 ───────────────────────────────────────────────────────────────────── */
describe('the tool count is derived, and the unbuilt entries never touch it', () => {
  it('🔴 CATALOG_TOOL_COUNT is 27, and still a reduce over CATALOG', () => {
    // The figure is a claim about what EXISTS, quoted to visitors as "N tools
    // in one platform". Nine unbuilt features must not move it.
    //
    // 🔴 28 → 27 AT THE-245, and the direction is the point. The count moved
    // because a LIVE tool was withdrawn — SMS Automation left the catalogue
    // when the feature was hidden — not because a coming-soon entry started
    // counting. The entry that replaced it is `soon` and adds nothing back,
    // which is exactly what the next test proves. Advertising 28 tools with
    // only 27 usable would be the same class of false claim as a stale price.
    expect(CATALOG_TOOL_COUNT).toBe(27);
    expect(CATALOG_TOOL_COUNT).toBe(
      CATALOG.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0),
    );
  });

  it('the unbuilt entries contribute nothing to it', () => {
    const live = CATALOG.filter((g) => !g.href).reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0);
    expect(live).toBe(27);
    // 9 + THE-252's affiliate entry + THE-280's custom-domains entry.
    expect(CATALOG[0].items).toHaveLength(11);
    expect(CATALOG[0].items.filter((i) => !i.soon)).toHaveLength(0);
  });

  it('🔴 and it WOULD have moved if a single entry lost its soon flag — by mutation', () => {
    // The tripwire, proved rather than asserted. Without `soon`, the count runs
    // to 38 and the site starts advertising eleven tools it does not have —
    // three of which, SMS, the affiliate programme and custom domains, it would
    // be advertising for the second time, in the tense it already withdrew them
    // from.
    const unflagged = CATALOG.map((g, i) =>
      (i === 0 ? { ...g, items: g.items.map((it) => ({ ...it, soon: false })) } : g));
    const wrong = unflagged.reduce((n, g) => n + g.items.filter((i) => !i.soon).length, 0);
    expect(wrong).toBe(38);
    expect(wrong).not.toBe(CATALOG_TOOL_COUNT);

    // And one entry alone is enough to break it.
    const oneLost = CATALOG.map((g, i) =>
      (i === 0 ? { ...g, items: g.items.map((it, j) => (j === 0 ? { ...it, soon: false } : it)) } : g));
    expect(oneLost.reduce((n, g) => n + g.items.filter((x) => !x.soon).length, 0)).toBe(28);
  });

  it('the nav still quotes the derived figure', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Nav.tsx'), 'utf8');
    expect(src).toContain('CATALOG_TOOL_COUNT');
    expect(words(navHtml)).not.toMatch(/\b37 tools\b/);
    expect(words(desktopMenu)).not.toMatch(/\b\d+ tools\b/);
  });
});

/* ── 10 ──────────────────────────────────────────────────────────────────── */
describe('the AI Assistant add-on is sold on the pricing page and nowhere near this one', () => {
  it('the declaration THE-224 left behind is gone, because the card is back', () => {
    /* WAS '🔴 the declaration THE-224 left behind is untouched':
       `INTENTIONALLY_UNADVERTISED` equals `['AI Assistant']` with a reason
       naming `aiChat` or Small Team. THE-253 restored the card — the app now
       grants what it sells and no plan includes it — so the omission is over
       and the constant is empty. The product is still fully described in the
       catalogue, which never depended on the declaration. */
    expect(Object.keys(INTENTIONALLY_UNADVERTISED)).toEqual([]);
    expect(DODO_ADD_ON_CATALOG['AI Assistant']).toBeDefined();
    expect(ADD_ONS.map((a) => a.name)).toContain('AI Assistant');
  });

  it('🔴 the add-on catalogue contract still throws on a live product nobody advertises', () => {
    /* 🔴 THE CAMPUS FAILURE, and the check this ticket could have weakened.
       It used to be exercised by handing the contract an EMPTY omission list
       while a card was missing. Empty is now the real state and passes, so the
       failure is provoked by dropping a card instead — and it is armed for all
       five, where before one was excused. */
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {})).not.toThrow();
    expect(() => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== 'AI Assistant')))
      .toThrow(/Dodo sells the add-on "AI Assistant"/);
    expect(() => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== 'Campus')))
      .toThrow(/Dodo sells the add-on "Campus"/);
  });

  it('🔴 the withdrawn card is not sold anywhere on the new page', () => {
    // The card's sentence was "Turns on the AI assistant for every member of
    // your congregation … one purchase for the whole plan, not billed per
    // person". None of it, and no seat vocabulary, may reappear here.
    expect(mainText).not.toMatch(/turns on the AI assistant/i);
    expect(mainText).not.toMatch(/not billed per person/i);
    expect(mainText).not.toMatch(/one purchase for the whole plan/i);
    expect(mainText).not.toMatch(/assistant seat/i);
    expect(mainText).not.toMatch(/\bAI Assistant\b/);
    expect(mainText).not.toMatch(/\badd-?on/i);
  });

  it('and a stray DECLARATION now collides with the card, which is the same guard', () => {
    /* WAS 'a restore attempt still collides with the declaration' — adding an AI
       Assistant row while the declaration stood. THE-253 performed exactly that
       restore, so the row is real and the declaration is the synthetic half now.
       The contradiction the contract refuses is the same one, from either side:
       a product cannot be advertised and declared unadvertised at once. */
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG, {
      'AI Assistant': 'left behind after the card came back',
    })).toThrow(/at the same time/);
    // A duplicate row is a different defect and still fails by its own name.
    const doubled: AddOn[] = [
      { name: 'AI Assistant', monthly: 20, annual: 240, blurb: 'x', planIds: ['max'] },
      ...ADD_ONS,
    ];
    expect(() => dodoAddOnCatalogContract(doubled)).toThrow(/AI Assistant/);
  });

  it('the coming-soon agent is not an add-on and is not in any add-on table', () => {
    const agent = COMING_SOON_ITEMS.find((i) => i.id === 'agent')!;
    expect(ADD_ONS.map((a) => a.name)).not.toContain(agent.name);
    expect(Object.keys(DODO_ADD_ON_CATALOG)).not.toContain(agent.name);
  });
});

/* ── 11 ──────────────────────────────────────────────────────────────────── */
describe('no price changed and both contracts still throw', () => {
  it('the nine plan prices are exactly what they were', () => {
    expect(plans.map((p) => p.price.monthly)).toEqual([20, 40, 80]);
    expect(plans.map((p) => p.price.quarterly)).toEqual([54, 108, 216]);
    expect(plans.map((p) => p.price.yearly)).toEqual([190, 380, 760]);
    expect(ADVERTISED_DISCOUNT_PCT).toEqual({ quarterly: 10, yearly: 20 });
    expect(plans.every((p) => p.fee === 0)).toBe(true);
  });

  it('all five add-on prices are exactly what they were, the RESTORED one included', () => {
    expect(Object.fromEntries(
      Object.entries(DODO_ADD_ON_CATALOG).map(([n, p]) => [n, [p.monthlyCents, p.annualCents]]),
    )).toEqual({
      'AI Assistant': [2000, 24000],
      'Admin seat': [1000, 12000],
      Campus: [1200, 14400],
      'Contacts +500': [1500, 18000],
      'Unlimited contacts': [4000, 48000],
    });
    // ⚠️ FIVE ROWS NOW. The AI Assistant returned in THE-253 at the same
    // $20/$240 the catalogue above has always pinned — a restore, not a
    // reprice, exactly as its withdrawal was a removal and not one.
    expect(ADD_ONS.map((a) => [a.name, a.monthly, a.annual])).toEqual([
      ['AI Assistant', 20, 240],
      ['Admin seat', 10, 120],
      ['Campus', 12, 144],
      ['Contacts +500', 15, 180],
      ['Unlimited contacts', 40, 480],
    ]);
    expect(ADD_ON_BILLED_MONTHS).toBe(12);
  });

  it('🔴 both contracts still throw — proved by mutation, not by reading the source', () => {
    // The real tables pass.
    expect(() => dodoAddOnCatalogContract(ADD_ONS)).not.toThrow();
    expect(() => addOnPricingContract(ADD_ONS)).not.toThrow();

    // Four distinct named failures.
    const wrongPrice = ADD_ONS.map((a) => (a.name === 'Admin seat' ? { ...a, monthly: 11, annual: 132 } : a));
    expect(() => dodoAddOnCatalogContract(wrongPrice)).toThrow(/Admin seat/);

    const unbacked: AddOn[] = [...ADD_ONS, { name: 'Invented', monthly: 5, annual: 60, blurb: 'x', planIds: ['max'] }];
    expect(() => dodoAddOnCatalogContract(unbacked)).toThrow(/no entry in DODO_ADD_ON_CATALOG/);

    expect(() => dodoAddOnCatalogContract(ADD_ONS.filter((a) => a.name !== 'Campus')))
      .toThrow(/Dodo sells the add-on "Campus"/);

    const discounted: AddOn = { ...ADD_ONS[0], annual: Math.round(ADD_ONS[0].annual * 0.7) };
    expect(() => addOnPricingContract([discounted])).toThrow(/NOT discounted/);
  });

  it('the guards are still armed at module scope, so they fail the prerender', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/components/Pricing.tsx'), 'utf8');
    expect(src).toMatch(/^addOnPricingContract\(ADD_ONS\);$/m);
    expect(src).toMatch(/^dodoAddOnCatalogContract\(ADD_ONS\);$/m);
  });

  it('and this change did not touch Pricing.tsx at all', () => {
    // W4 owns that file this cycle. Asserted as a property of the tree rather
    // than of a diff: the page imports nothing from it, directly or for a type.
    const page = fs.readFileSync(path.join(ROOT, 'src/pages/ComingSoonPage.tsx'), 'utf8');
    const content = fs.readFileSync(path.join(ROOT, 'src/content/coming-soon.ts'), 'utf8');
    const block = fs.readFileSync(path.join(ROOT, 'src/components/ComingSoonBlock.tsx'), 'utf8');
    for (const [name, src] of [['the page', page], ['the content', content], ['the block', block]] as const) {
      expect(src, `${name} imports from Pricing.tsx`).not.toMatch(/from '.*Pricing'/);
    }
  });
});

/* ── 12 ──────────────────────────────────────────────────────────────────── */
describe('no board link was reintroduced', () => {
  /* ⚠️ THE NEEDLE IS ASSEMBLED FROM FRAGMENTS ON PURPOSE, and this is not
     cleverness for its own sake. THE-225 left a sweep in the Nav suite next
     door that reads EVERY .ts/.tsx file under src/ except itself and fails if
     any of them so much as spells the retired nav label or the board host it
     pointed at. Writing either one out here — even inside a comment explaining
     why — puts this file on that suite's offender list, which is precisely
     what happened on the first run of this test. Assembling them at runtime
     keeps that guard green while this one still asserts the real thing. */
  const RETIRED_LABEL = ['Road', 'map'].join('');
  const RETIRED_HOST = ['tre', 'llo'].join('');
  const retired = new RegExp(`${RETIRED_LABEL}|${RETIRED_HOST}`, 'i');

  it('🔴 the new page does not bring the retired nav link back', () => {
    // THE-225 removed it from the desktop row and the hamburger alike because
    // it pointed at a public board. A page of unbuilt work is the obvious place
    // for it to creep back in.
    expect(retired.test(mainText), 'the retired board link is back on the page').toBe(false);
    expect(retired.test(pageHtml), 'the retired board link is back in the chrome').toBe(false);
  });

  it('and no source file this change touched mentions it', () => {
    const touched = [
      'src/pages/ComingSoonPage.tsx',
      'src/components/ComingSoonBlock.tsx',
      'src/components/SoonMock.tsx',
      'src/content/coming-soon.ts',
      'src/components/catalog.ts',
      'src/components/Nav.tsx',
      'src/App.tsx',
      'src/index.css',
    ];
    const offenders = touched.filter((f) => retired.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('the nav still renders no link to it, on this route or any other', () => {
    expect(retired.test(words(navHtml))).toBe(false);
    expect(retired.test(words(desktopMenu))).toBe(false);
    expect(retired.test(words(mobileMenu))).toBe(false);
  });

  it('the board reference on each item is a card id, not a link to a board', () => {
    // Items trace to THE-nnn so a reviewer can find the card. That is a
    // reference in a data field, and it is deliberately NOT rendered as a
    // clickable destination — nothing on the page should send a church to an
    // internal board.
    for (const item of COMING_SOON_ITEMS) {
      expect(item.ref).toMatch(/^THE-\d+$/);
      expect(mainHtml, `${item.ref} is rendered as a link`).not.toContain(`>${item.ref}<`);
    }
    expect(mainText).not.toMatch(/THE-\d+/);
  });
});

/* ── 13 ──────────────────────────────────────────────────────────────────── */
describe('the page renders at every measured width without overflow', () => {
  /* 🔴 ARITHMETIC, NOT A SCREENSHOT — the idiom this repo already uses in
     components/TermToggle.widths.test.ts. There is no DOM and no layout engine
     in this runner (see vitest.config.ts), so nothing here can measure a box.
     What it can do is pin the structural properties that decide whether a thing
     can overflow at all, and compute the room each element gets from them.

     ⚠️ WIDTH IS NOT MONOTONIC IN VIEWPORT on this site — board card THE-184
     records a 41px overflow found at exactly 1280px, between two passing
     measurements — so every breakpoint is evaluated, not just the extremes. */
  const VIEWPORTS = [380, 768, 1024, 1280, 1440];

  /** Page section padding: `padding: '8px 20px 4px'` on the index band and
   *  `'0 20px'` on each card. */
  const PAGE_GUTTER = 20;
  /** `maxWidth: 1140` on the index grid and on every card. */
  const CONTENT_MAX = 1140;

  /* A 11.5px semibold label sets at roughly 0.55em per character — deliberately
     generous, as in the TermToggle suite: the point is headroom, not a text
     metric this runner cannot produce. */
  const charWidth = (px: number) => px * 0.55;
  /** The longest UNBREAKABLE token, which is what actually decides an overflow —
   *  a multi-word label wraps. */
  const longestWord = (s: string) => Math.max(...s.split(/[\s—/,]+/).map((w) => w.length));

  /** `.soon-index` columns at a viewport, from the media queries in index.css. */
  const indexColumns = (v: number) => (v <= 560 ? 2 : v <= 900 ? 3 : v <= 1080 ? 4 : 5);

  const indexCardRoom = (v: number) => {
    const grid = Math.min(CONTENT_MAX, v - PAGE_GUTTER * 2);
    const col = (grid - 10 * (indexColumns(v) - 1)) / indexColumns(v);
    return col - 8 * 2; // the card's own `padding: '16px 8px'`
  };

  it('the media queries this arithmetic reads really are in index.css', () => {
    // Guards every calculation below against being derived from a rule that no
    // longer exists.
    const css = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');
    for (const [max, cols] of [[1080, 4], [900, 3], [560, 2]] as const) {
      const from = css.indexOf(`@media (max-width: ${max}px)`);
      expect(from, `no @media (max-width: ${max}px) block`).toBeGreaterThan(0);
      // To the block's closing brace — the rules inside it end with `}` too, so
      // slicing at the FIRST one would stop before the second declaration.
      const block = css.slice(from, css.indexOf('\n}', from));
      expect(block, `no .soon-index rule at ${max}px`)
        .toContain(`.soon-index { grid-template-columns: repeat(${cols}, 1fr)`);
    }
  });

  it.each(VIEWPORTS)('the jump-to index fits its longest label at %ipx', (v) => {
    const room = indexCardRoom(v);
    const widest = Math.max(...COMING_SOON_ITEMS.map((i) => longestWord(i.name))) * charWidth(11.5);
    expect(room, `the widest label (~${widest.toFixed(0)}px) does not fit a ${room.toFixed(0)}px card`)
      .toBeGreaterThan(widest);
  });

  it('reports the measured index-card room at every width', () => {
    // The five figures this change is reported with. 380px is the binding case.
    expect(Object.fromEntries(VIEWPORTS.map((v) => [v, Math.round(indexCardRoom(v))])))
      .toEqual({ 380: 149, 768: 220, 1024: 223, 1280: 204, 1440: 204 });
  });

  it.each(VIEWPORTS.filter((v) => v > 900))('the mega-menu column fits its longest label at %ipx', (v) => {
    /* The menu only renders above 900px — `.nav-links` is `display: none`
       below it — so 901 is its binding case rather than 380. `auto-fit` with
       `minmax(136px, 1fr)` lays down as many tracks as fit and wraps the rest,
       so the column can never be narrower than 136px by construction. */
    const panel = Math.min(1180, v - 40) - 30 * 2; // width: min(1180px, 100vw - 40px), padding 30
    const tracks = Math.max(1, Math.floor((panel + 18) / (136 + 18)));
    const col = (panel - 18 * (tracks - 1)) / tracks;
    expect(col, 'a track fell below its 136px minimum').toBeGreaterThanOrEqual(136);
    const room = col - 15 - 8; // icon 15px + 8px gap
    const widest = Math.max(...CATALOG.flatMap((g) => g.items.map((i) => longestWord(i.title)))) * charWidth(13);
    expect(room, `the widest menu label (~${widest.toFixed(0)}px) does not fit a ${col.toFixed(0)}px column`)
      .toBeGreaterThan(widest);
  });

  it('the narrowest width the mega-menu ever renders at still fits — 901px', () => {
    const panel = Math.min(1180, 901 - 40) - 60;
    const tracks = Math.floor((panel + 18) / 154);
    const col = (panel - 18 * (tracks - 1)) / tracks;
    expect(tracks).toBe(5);           // wraps to a second row rather than squeezing
    expect(Math.round(col)).toBe(146);
    const widest = Math.max(...CATALOG.flatMap((g) => g.items.map((i) => longestWord(i.title)))) * charWidth(13);
    expect(col - 23).toBeGreaterThan(widest);
  });

  it('🔴 nothing on the page declares a fixed width that could exceed the narrowest content box', () => {
    /* The mechanical half. Every container is a `max-width` plus a fluid child;
       a `width:NNNpx` on anything large is how a card starts pushing the page
       sideways. At 380px the narrowest content box is 340px, and the card's own
       clamp padding takes it to 288px. */
    // ⚠️ The lookbehind matters: `max-width:1140px` contains `width:1140px`,
    // and without it this fired on every legitimate max-width on the page.
    const fixed = [...mainHtml.matchAll(/(?<!max-|min-)\bwidth:(\d+(?:\.\d+)?)px/g)]
      .map((m) => Number(m[1]))
      .filter((w) => w > 60);
    expect(fixed, `a fixed width over 60px is declared: ${fixed.join(', ')}`).toEqual([]);

    // And every max-width is either the content column or the sketch frame.
    const maxes = [...new Set([...mainHtml.matchAll(/max-width:(\d+)px/g)].map((m) => Number(m[1])))].sort((a, b) => a - b);
    expect(maxes.every((w) => w <= CONTENT_MAX), `a max-width exceeds ${CONTENT_MAX}px: ${maxes.join(', ')}`).toBe(true);
  });

  it('the card collapses to one column below 900px, so the sketch never shares a 380px row', () => {
    const css = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');
    const block = css.slice(css.indexOf('@media (max-width: 900px)'));
    expect(block.slice(0, block.indexOf('\n}'))).toContain('.fb-grid');
    // The block reuses `fb-grid`/`fb-caps` precisely so that rule applies to it
    // too — one collapse rule, not a second one that can drift.
    const src = fs.readFileSync(path.join(ROOT, 'src/components/ComingSoonBlock.tsx'), 'utf8');
    expect(src).toContain('className="fb-grid"');
    expect(src).toContain('className="fb-caps"');
  });

  it('the concept-sketch caption wraps rather than forcing the frame wider', () => {
    // At 380px the frame has ~256px of room; a nowrap caption beside the
    // longest item name needed ~257.5px. Wrapping cannot overflow.
    const src = fs.readFileSync(path.join(ROOT, 'src/components/ComingSoonBlock.tsx'), 'utf8');
    const at = src.indexOf('Concept sketch');
    const header = src.slice(src.lastIndexOf('<div style={{ display:', at), at + 60);
    expect(header).toContain("flexWrap: 'wrap'");
    expect(header, 'the caption is nowrap and can push the frame wider').not.toContain("whiteSpace: 'nowrap'");
  });
});
