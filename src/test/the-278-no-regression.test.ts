/**
 * THE-278 — the guard half. Its sibling proves Tailwind works; this file proves
 * it changed NOTHING that already existed.
 *
 * 🔴 THE WHOLE RISK OF THE TICKET IS HERE. Adding a utility framework beside 42
 * components already styled by one 400-line stylesheet is where specificity
 * fights start, and the failure mode is silent: a page that shifted by 2px, a
 * heading that lost its serif, a list that lost its bullets. Tailwind's
 * Preflight alone would do all three.
 *
 * So nothing here is judged by eye. Every page the site prerenders is
 * fingerprinted from the BUILT html, and the stylesheet's original 400 lines are
 * pinned by hash as a contiguous region of the file they still live in.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { blogRoutes } from '../../build/blog-plugin';
import { plans, planPriceContract, type Plan } from '../components/Pricing';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

const DIST = path.join(ROOT, 'dist');
const built = existsSync(path.join(DIST, 'index.html'));

/**
 * ⚠️ A win32 CHECKOUT BUILDS A DIFFERENT SITE, and not because of this ticket.
 *
 * `slugFromPath` in src/content/post-core.ts is `path.split('/').pop()`. On
 * POSIX that is the filename; on win32, where `postFiles()` hands it
 * `...\src\content\posts\work-that-outlives-you.md`, there is no '/' to split
 * on, so the slug becomes the whole absolute path. The three post routes then
 * never match, the build emits 18 pages instead of 21, and the blog index
 * renders an empty list.
 *
 * Pre-existing, POSIX-correct and out of scope here — production and CI both
 * build on Linux, where all 21 pages are emitted and correct, which is where
 * the fingerprints below were taken. A comparison that would measure the broken
 * local build rather than this ticket skips; the page count still asserts, so a
 * broken build says so instead of quietly agreeing with itself.
 */
const postPagesBuilt = existsSync(path.join(DIST, 'blog', 'work-that-outlives-you', 'index.html'));
const comparable = built && postPagesBuilt;

/* ═══ 6 — no existing page's rendered output changed ══════════════════════ */
describe('6 — the built pages are byte-identical to the pre-Tailwind build', () => {
  /**
   * Content-hashed asset filenames move because the stylesheet grew, which is
   * the point of the ticket. Everything else in the markup must not move at
   * all, so the hashes are normalised away and nothing else is.
   */
  const normalise = (html: string) =>
    html
      .replace(/-[A-Za-z0-9_-]{6,}\.(css|js|json)/g, '-HASH.$1')
      /* ⚠️ AND the SSG nonce. vite-react-ssg stamps every page with
         `Math.random().toString(36).substring(2, 12)` (see its dist bundle), so
         two builds of byte-identical source disagree here. Comparing it would
         measure the RNG, and the test would fail on a no-op rebuild. */
      .replace(/__VITE_REACT_SSG_HASH__ = '[^']*'/g, "__VITE_REACT_SSG_HASH__ = 'NONCE'");

  /**
   * EVERY prerendered page, captured from a CI build of pristine `main` at
   * 15876ff — before a line of this ticket existed, on the same Linux runner
   * that builds production. Not a sample: all 21, so a moved page has nowhere
   * to hide.
   *
   * ─── 🔴 ONE ENTRY HAS MOVED SINCE, AND ON PURPOSE — THE-281 ────────────────
   *
   * `features/giving-finance/index.html` now carries a sixth section, the
   * Shareable Giving Page feature. THE-281 added it to content/features.ts, so
   * the page it renders on legitimately changed and its fingerprint had to be
   * retaken; `BASELINE_ALL` moved with it, since it is the same 21 pages hashed
   * as one number.
   *
   * ⚠️ THE OTHER TWENTY DID NOT MOVE, and that is the assertion that still
   * matters. This table's job was never "no page may ever change" — a content
   * site whose pages cannot change is a site nobody can edit. Its job is that a
   * change is DELIBERATE and SCOPED: THE-278 proved installing Tailwind moved
   * nothing, and this run proves adding one feature moved exactly the one page
   * that feature is on. A second entry changing in the same commit would have
   * been the bug, and it would still have failed here.
   *
   * Retaken on Linux, from the same `npm run build`, at the commit that added
   * the section.
   */
  const PRE_TAILWIND: Readonly<Record<string, string>> = {
    'blog/category/harvest-vs/index.html': '39f910d46af70402edd9a5ab8be5338cd577ecaf6e3287b44a1013795689b13d',
    'blog/category/inside-harvest/index.html': '8481746c2169c2dbc063f6137f40d99c4df243a441d8902ad1f73b1d6c9d133f',
    'blog/category/rooted/index.html': '5fbc9f2bc14cd54173b67b0bebe7e759ae329f6106e426d18d7acb80f6061231',
    'blog/generosity-without-pressure/index.html': 'af09661bf1f1da1551351b02c0f07195cd45c02c10bbf2c9d7dd6f23c41890e8',
    'blog/index.html': '54fa1b832e5829f4f6b7064277db1970f6189dc386f5072ccf984652d97154cf',
    'blog/planning-center-alternative-small-churches/index.html': '78bdcafc4bcb7e296e67f59a2f3ad65d19b1e0b5d554c5acd5c93d1335d435d5',
    'blog/work-that-outlives-you/index.html': '8ead55954bbeb64c0120af872bdd492f44b23ff47f24a2c879621bed722fa718',
    'contact/index.html': '28ac199c12eb693194b17b66066a237cba78bf208375f331527f3c33e3dec007',
    'faq/index.html': '4c8e02fc232e019dc077f47d6a35e017596ce737f5f6a531f2bb1f3dc67bbfc3',
    'features/ai-automation/index.html': '1bb9a1aeac6668a90abac06167aa6c8ac4bb8f50233aae26081a23c35857e410',
    'features/coming-soon/index.html': '81bae956e72ca69a50ebc3cea88306df5e63818e6ee64b62635eba1a4f41614c',
    'features/community-engagement/index.html': 'fbd2b0a883c5af11db5a498d876e2affb0c5574b67d984ec8f422aaff74ceb4f',
    'features/discipleship-content/index.html': '25170dd7a85ecacdebc18257ac6b3b46334e839ff9cb6dcee006cc2a7484790d',
    'features/giving-finance/index.html': '7e502fcb4984e07bc3cd01671f10eb498ad609671a5f0d2b39f9eeeb03dac3cd',
    'features/index.html': 'efd67e4a5a2e891cd580496ddd78dbac5b4fbcdf550d4557a70fbed2fd3e11a0',
    'features/platform-brand/index.html': '05d5604e150dd512963c76b63159dcbceacf231cde46f598be295ed6da6e261d',
    'index.html': '8e5a076696ccb2927d189fa30ddaabffb374860b2bbb2eded503e20fc2f79101',
    'pricing/index.html': '454c1602e41a0317ac1ffa1db44771be6b4e8ecef243aad1d7237b314b96c2c7',
    'privacy/index.html': 'c85289d0c324e911ca2b6bb353cb01e7bf1ad51bf640f7f44dd689afbf0f7829',
    'refunds/index.html': '05c736525205ec59180e69ed1d9c307e0f2eaedebaed0794cf7f5722f2422b60',
    'terms/index.html': '11959c4b9eee58ccdc856ee585169d6687427d0da7399d60b282f4a318e968b5',
  };

  /**
   * 🔴 THE-280 — the SIX pages that moved since, and the only six.
   *
   * THE-278's claim is "Tailwind changed nothing", and it still holds: every
   * page above is the pre-Tailwind fingerprint, and fifteen of the twenty-one
   * still match it exactly. What moved is what a LATER ticket deliberately
   * changed — recorded here as an explicit delta rather than by overwriting the
   * baseline, so a reader can see at a glance which pages a copy change touched
   * and satisfy themselves that no other page came along for the ride.
   *
   * THE-280 hid custom domains: the feature shipped a panel and was never
   * activated, because the Vercel subscription behind it was never bought, so a
   * church that saved a domain got DNS records pointing nowhere. The app now
   * refuses the write path, and the site had to stop selling what the app
   * refuses. These six pages are exactly the marketing surfaces
   * `CUSTOM_DOMAIN_MARKETING_ENABLED` gates, one for one:
   *
   *   · index            — the "Branding & Domain" caption in the #replaces row
   *   · pricing          — the Custom Domain comparison-table row, withheld
   *   · features/platform-brand — the `branding` entry, reworded not withdrawn
   *   · features/coming-soon    — the new "Custom domains" entry
   *   · faq, terms       — the two answers that named it as a live capability
   *
   * ⚠️ THE PAGE COUNT DID NOT MOVE — still 21, asserted in section 9 and pinned
   * again by LegalPage.test.ts. No page was added or dropped; six changed
   * content.
   *
   * ⚠️ FLIPPING THE FLAG BACK MOVES THESE SIX AGAIN, and this file will need
   * repinning when it happens. That is the standing property of a build
   * fingerprint, not something THE-280 introduced: any copy change moves it.
   */
  const THE_280_MOVED: Readonly<Record<string, string>> = {
    'faq/index.html': '33f593ece1d572f8981dfc0ca141f70c0a4930bf553a8351bcd1da1dc7e3337e',
    'features/coming-soon/index.html': 'ec7702252d9d99660393a1be499f007f6e23706c20813d8c14431966fa4b1c1f',
    'features/platform-brand/index.html': '29156da7546b00db679f260ad28f1c0bac745c72731eefdab9140cc9326c00ce',
    'index.html': '263e63b5ac5f6e4d73964768c2dbab487b336bc8b41d5c99ce0c8edbde0cee4a',
    'pricing/index.html': '4057fa7b8d185e0e864ca70c7dc35e6dd2d6d38b20841c4050ba2385b1fa8b02',
    'terms/index.html': 'f76fa0f81d8fa7a1d5cdbadfb24416ad7cfea843196bc69b9d0cc3a353ac44ac',
  };

  /**
   * 🔴 THE-284 — the ONE page that moved, and the ONE that was added.
   *
   * The Harvest Scheduler went onto the Coming Soon list and got a page of its
   * own, at the founder's direction. Two consequences, and only two:
   *
   *   · features/coming-soon — a twelfth entry, so a twelfth index card and a
   *     twelfth block. This page is the one the entry renders on, so it is the
   *     one page whose content legitimately changed.
   *   · features/harvest-scheduler — the new page. Recorded here rather than
   *     left out, so it is fingerprinted from its first commit like every other
   *     page, and a later edit to it shows up as a move rather than as nothing.
   *
   * ⚠️ AND THE OTHER TWENTY DID NOT MOVE — not the landing page, not the nav on
   * any of them. Adding an entry to `COMING_SOON_ITEMS` also adds an item to
   * `CATALOG`, which is the Features mega-menu on EVERY page; the menu is
   * rendered behind React state that nothing sets during the prerender, so it
   * is not in the built markup and no other page saw the change.
   *
   * 🔴 THIRTEEN PAGES *DID* MOVE IN AN EARLIER DRAFT OF THIS TICKET, and the
   * cause is worth recording because it will recur. The new route was written
   * beside the Coming Soon route, in the middle of the table in src/App.tsx.
   * React-router derives a route's id from its POSITION when none is given, and
   * vite-react-ssg serialises those ids into every page as
   * `window.__staticRouterHydrationData` — so inserting mid-table renumbered
   * every later route and rewrote /contact, /faq, the three policies and all
   * seven blog pages, each by a single digit, with no content change at all.
   * The route is appended above the catch-all instead. See the note in
   * src/App.tsx: add future routes there too.
   */
  const THE_284_MOVED: Readonly<Record<string, string>> = {
    'features/coming-soon/index.html': '333cf879bbaf80f090e9e8a66d42ec7f01b9380dc7e8718586875ff8bd2852f6',
  };
  const THE_284_ADDED: Readonly<Record<string, string>> = {
    'features/harvest-scheduler/index.html': 'a33341141516f3d5279867a0efdcbc0bb42d6a1b5afd6345e61ed7ed37b49975',
  };

  /**
   * 🔴 THE-293 — the ONE page that moved, and nothing was added or dropped.
   *
   * The founder's verdict on the page THE-284 shipped was "the harvest
   * scheduler is horrible. I want for each feature to be presented as the other
   * category pages with a small design." Its six capabilities were six
   * identical grey cards; they are now six `FeatureBlock`s, each with a vignette
   * of its own in components/FeatureMock.tsx — the same component and the same
   * gallery the five live category pages draw from.
   *
   * ⚠️ THE PAGE COUNT DID NOT MOVE, and could not have: no route was added. The
   * note in src/App.tsx about appending above the catch-all is about a route
   * this ticket never needed — THE-284's early draft renumbered thirteen pages
   * by inserting one mid-table, and the reason nothing of the sort appears in
   * this table is that no route was touched at all.
   *
   * 🔴 AND THE FIVE LIVE CATEGORY PAGES DID NOT MOVE EITHER, which is the
   * assertion that was genuinely at risk. Drawing the capabilities through the
   * REAL `FeatureBlock` meant editing a component that /features/ai-automation
   * and its four siblings all render four times each. The new behaviour is
   * behind an `unbuilt` prop that defaults to false, so their markup is
   * byte-identical — and "byte-identical" is this table's word, not a reviewer's
   * impression. A component edit that leaked would show up here as five more
   * entries, and there are none.
   */
  const THE_293_MOVED: Readonly<Record<string, string>> = {
    'features/harvest-scheduler/index.html': '615acfc0897c2a6c8f16a4c81cee2bf2b232c75fb9efd54f6cff4722597034a9',
  };

  const BASELINE: Readonly<Record<string, string>> = {
    ...PRE_TAILWIND, ...THE_280_MOVED, ...THE_284_MOVED, ...THE_284_ADDED, ...THE_293_MOVED,
  };

  /** The same 22 as one number, so an ADDED or DROPPED page is caught too. */
  const BASELINE_ALL = 'b7dc6e6766fbd218fe58a39197c87e71bb272e65410f1822c14b531f917a14d9';

  it('🔴 THE-280 moved exactly six pages, and the other fifteen did not move', () => {
    /* The delta, asserted as a delta. Without this, a future ticket could add a
       seventh override and the suite would still pass — the whole point of
       recording the move separately is that the SIZE of it is checked too.

       ⚠️ "The other fifteen" are measured against THE TABLE ABOVE, not against
       the literal pre-Tailwind build, and the distinction now matters: THE-281
       legitimately retook `features/giving-finance/index.html` in that table when
       it added the Shareable Giving Page section. That page is not THE-280's and
       is expected to sit at THE-281's value — which is exactly what this checks,
       since it is in `untouched` and must equal the table. */
    expect(Object.keys(THE_280_MOVED).sort()).toEqual([
      'faq/index.html', 'features/coming-soon/index.html',
      'features/platform-brand/index.html', 'index.html',
      'pricing/index.html', 'terms/index.html',
    ]);
    for (const page of Object.keys(THE_280_MOVED)) {
      expect(PRE_TAILWIND[page], `${page} is not a page THE-278 fingerprinted`).toBeDefined();
      expect(THE_280_MOVED[page], `${page} is listed as moved but did not move`)
        .not.toBe(PRE_TAILWIND[page]);
    }
    const untouched = Object.keys(PRE_TAILWIND)
      .filter((p) => !(p in THE_280_MOVED) && !(p in THE_284_MOVED));
    expect(untouched).toHaveLength(15);
    for (const page of untouched) {
      expect(BASELINE[page], `${page} drifted off the fingerprint the table records`)
        .toBe(PRE_TAILWIND[page]);
    }
    // 🔴 And THE-281's page is one of the fifteen — this change did not disturb it.
    expect(untouched, 'THE-280 moved the Giving & Finance page, which is not its to move')
      .toContain('features/giving-finance/index.html');
  });

  it('🔴 THE-284 moved exactly one page and added exactly one', () => {
    /* The delta, asserted as a delta — the shape THE-280 established above, and
       for the same reason: without it a later ticket could add a second
       override and the suite would still pass, so the SIZE of the change is
       what is checked, not merely its content.

       ⚠️ THE MOVED PAGE IS THE ONE THE ENTRY RENDERS ON, and nothing else. If a
       second entry ever appears here, that is either a page this ticket had no
       business touching or a route inserted mid-table — see the note above. */
    expect(Object.keys(THE_284_MOVED)).toEqual(['features/coming-soon/index.html']);
    expect(Object.keys(THE_284_ADDED)).toEqual(['features/harvest-scheduler/index.html']);

    // The moved page really moved, and it moved off THE-280's value, not off
    // the pre-Tailwind one it had already left.
    expect(THE_284_MOVED['features/coming-soon/index.html'])
      .not.toBe(THE_280_MOVED['features/coming-soon/index.html']);
    // And the added page is genuinely new — no earlier table ever fingerprinted it.
    for (const page of Object.keys(THE_284_ADDED)) {
      expect(PRE_TAILWIND[page], `${page} is not a new page`).toBeUndefined();
      expect(THE_280_MOVED[page], `${page} is not a new page`).toBeUndefined();
    }

    /* 🔴 AND THE OTHER TWENTY ARE STILL AT THE VALUE THE TABLES ABOVE RECORD.
       Adding a coming-soon entry also adds a mega-menu item, which is chrome on
       every page — this is the assertion that says the menu is not in the
       prerendered markup and no other page came along for the ride. */
    const others = Object.keys(BASELINE)
      .filter((p) => !(p in THE_284_MOVED) && !(p in THE_284_ADDED));
    expect(others).toHaveLength(20);
    for (const page of others) {
      expect(BASELINE[page], `${page} moved, and THE-284 had no business moving it`)
        .toBe(THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }
  });

  it('🔴 THE-293 moved exactly one page, and added and dropped none', () => {
    /* The delta, asserted as a delta — the shape THE-280 and THE-284 both used,
       and the one that actually catches the failure this ticket was most likely
       to cause. Redesigning the scheduler page meant editing FeatureBlock, which
       every live category page renders; if that edit had changed any of them,
       this table would need five more entries and this assertion would say so. */
    expect(Object.keys(THE_293_MOVED)).toEqual(['features/harvest-scheduler/index.html']);

    // It moved off the value THE-284 pinned when it added the page, not off
    // some earlier one — this page has existed for exactly one prior ticket.
    expect(THE_293_MOVED['features/harvest-scheduler/index.html'])
      .not.toBe(THE_284_ADDED['features/harvest-scheduler/index.html']);

    /* 🔴 AND THE FIVE LIVE CATEGORY PAGES ARE STILL AT THEIR RECORDED VALUES.
       Named one by one rather than counted, because "the others did not move" is
       satisfied by a table that quietly lost a row. These five are the pages
       that render FeatureBlock, and they are the specific risk this ticket ran. */
    for (const page of [
      'features/ai-automation/index.html', 'features/community-engagement/index.html',
      'features/discipleship-content/index.html', 'features/giving-finance/index.html',
      'features/platform-brand/index.html',
    ]) {
      expect(BASELINE[page], `${page} renders FeatureBlock and THE-293 moved it`)
        .toBe(THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }

    // Nothing added, nothing dropped: the same 22 keys THE-284 left behind.
    expect(Object.keys(BASELINE)).toHaveLength(22);
    const others = Object.keys(BASELINE).filter((p) => !(p in THE_293_MOVED));
    expect(others).toHaveLength(21);
    for (const page of others) {
      expect(BASELINE[page], `${page} moved, and THE-293 had no business moving it`)
        .toBe(THE_284_MOVED[page] ?? THE_280_MOVED[page] ?? PRE_TAILWIND[page]);
    }
  });

  const pagesInDist = (): string[] => {
    const out: string[] = [];
    (function walk(dir: string) {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) walk(abs);
        else if (e.name === 'index.html') out.push(path.relative(DIST, abs).split(path.sep).join('/'));
      }
    })(DIST);
    return out.sort();
  };

  it.runIf(comparable).each(Object.keys(BASELINE))('%s renders exactly as it did before', (page) => {
    const actual = sha(normalise(read(path.join('dist', page))));
    expect(actual, `${page} moved — Tailwind changed an existing page`).toBe(BASELINE[page]);
  });

  it.runIf(comparable)('and the whole set matches as one number', () => {
    /* The per-page results say WHICH page moved; this says whether the SET
       moved, so an added or dropped page is caught as well as an edited one. */
    const combined = sha(
      pagesInDist().map((r) => `${r}:${sha(normalise(read(path.join('dist', r))))}`).join('\n'),
    );
    expect(combined, 'some prerendered page changed').toBe(BASELINE_ALL);
  });
});

/* ═══ 6b — and the site's own CSS survives in the built stylesheet ════════ */
describe('6b — the hand-written stylesheet still ships, outside Tailwind\'s layers', () => {
  const distCssPath = () => {
    const dir = path.join(DIST, 'assets');
    const f = readdirSync(dir).find((n) => n.endsWith('.css'));
    return f ? path.join(dir, f) : null;
  };
  const hasCss = built && distCssPath() !== null;
  const css = hasCss ? readFileSync(distCssPath()!, 'utf8') : '';

  /** Everything Tailwind contributes lives in a layer; removing them leaves
   *  exactly the site's own rules. Brace-matched so nesting is safe. */
  const unlayered = (() => {
    let out = '';
    for (let i = 0; i < css.length;) {
      const m = /^@layer\s+[a-zA-Z, ]+\{/.exec(css.slice(i));
      if (!m) { out += css[i]; i++; continue; }
      let depth = 0, j = i + m[0].length - 1;
      for (; j < css.length; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') { depth--; if (depth === 0) { j++; break; } }
      }
      i = j;
    }
    return out;
  })();

  /** Every class the 42 components actually spell. */
  const SITE_CLASSES = [
    'hbtn', 'hb-main', 'hb-dot', 'hb-label', 'hb-alt', 'hmarq', 'hmarq-track',
    'bento', 'bento-body', 'bento-cta', 'nav-hamburger', 'replaces-row',
    'blog-thumb', 'blog-body', 'blog-table-wrap', 'blog-figure', 'blog-img-frame',
    'faq-summary', 'faq-chevron', 'faq-item', 'feat-index-card', 'soon-index-card',
  ];

  it.runIf(hasCss)('Tailwind\'s output is layered and the site\'s rules are not', () => {
    expect(css).toMatch(/@layer\s+theme/);
    expect(css).toMatch(/@layer\s+utilities/);
    /* Unlayered rules beat layered ones at equal specificity, which is the
       whole reason no hand-written rule lost an argument. */
    expect(unlayered).toMatch(/\.blog-body/);
    expect(unlayered).toMatch(/:root\s*\{/);
  });

  it.runIf(hasCss).each(SITE_CLASSES)('.%s still has its own rule', (cls) => {
    expect(unlayered, `.${cls} vanished from the built stylesheet`).toContain(`.${cls}`);
  });

  it.runIf(hasCss)('the tokens the whole site reads still hold Harvest\'s values', () => {
    /* Tailwind's theme declares --font-sans, --font-serif, --radius-*, --shadow-*,
       --ease-* and --leading-* too. If its defaults had won, these would be
       system stacks and the site would have silently lost its typography. */
    expect(unlayered).toMatch(/--font-serif:\s*"?Fraunces/i);
    expect(unlayered).toMatch(/--font-sans:\s*"?Inter/i);
    expect(unlayered.toLowerCase()).toContain('--gold-500:#c9963a');
    expect(unlayered).toMatch(/--radius-lg:\s*12px/);
    expect(unlayered).toMatch(/--ease-out:\s*cubic-bezier\(\.22,\s*1,\s*\.36,\s*1\)/);
  });

  it.runIf(hasCss)('🔴 Preflight is NOT in the bundle', () => {
    /* The single change that would have moved every page: Tailwind's reset
       flattens headings to font-size:inherit, unstyles lists, and makes images
       block. None of its signatures may appear. */
    expect(css).not.toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-size:\s*inherit/);
    expect(css).not.toMatch(/abbr:where\(\[title\]\)/);
    expect(css).not.toMatch(/img,\s*svg,\s*video,\s*canvas/);
    expect(css).not.toMatch(/ol,\s*ul,\s*menu\s*\{[^}]*list-style:\s*none/);
  });

  it.runIf(hasCss)('🔴 the site\'s own CSS is pinned in the BUILT stylesheet, declaration for declaration', () => {
    /* The page fingerprints above cannot see this: changing `.blog-thumb` from
       148px to 149px moves no markup, and the asset filename is normalised
       away. Only a pin on the emitted CSS catches an edit to an existing rule
       in the built output rather than in the source.
       Pinned post-Tailwind on purpose — the pre-Tailwind bytes were minified by
       a different engine (postcss+esbuild, now Lightning CSS), so the two are
       not byte-comparable. Equivalence with the pre-Tailwind build is
       established by test 7: the source region is unmodified. */
    const banner = /^\/\*![^*]*\*\//;
    expect(sha(unlayered.replace(banner, '').trim())).toBe(
      'b2bf9da491ce9fa3dd43e84ac10d1dd6120ce0332675c25fb90ecb20997c8aaf',
    );
  });

  it.runIf(hasCss)('the media queries the responsive rules live in are still there', () => {
    for (const q of ['1080px', '900px', '560px', '640px']) {
      expect(unlayered, `the ${q} breakpoint is gone`).toContain(q);
    }
    expect(unlayered).toContain('prefers-reduced-motion');
  });
});

/* ═══ 7 — no existing rule in index.css was modified ══════════════════════ */
describe('7 — index.css\'s original 400 lines are untouched', () => {
  /* The stylesheet at 15876ff, byte for byte. */
  const ORIGINAL_SHA = '59cf429368d78c8fbecea0ee27ad20423fafd66e98e98a06646dca60729b0d18';
  const END_OF_PREPEND = '/* ── THE-278 ends here; everything below is the original stylesheet ── */\n';
  const START_OF_APPEND = '/* ── THE-278: shadcn plain tokens, appended below the original ── */\n';

  const css = read('src/index.css');

  it('the ticket added a block above and a block below, and nothing in between', () => {
    expect(css, 'the prepend marker is missing').toContain(END_OF_PREPEND);
    expect(css, 'the append marker is missing').toContain(START_OF_APPEND);
    expect(css.indexOf(END_OF_PREPEND)).toBeLessThan(css.indexOf(START_OF_APPEND));
  });

  it('🔴 the original stylesheet survives as one contiguous, unmodified region', () => {
    const from = css.indexOf(END_OF_PREPEND) + END_OF_PREPEND.length;
    const to = css.indexOf(START_OF_APPEND);
    expect(sha(css.slice(from, to)), 'an existing rule in index.css was modified').toBe(ORIGINAL_SHA);
  });

  it('and the declarations the site already had still resolve to what they did', () => {
    /* A spot check in the language a reader thinks in, so a hash mismatch is not
       the only signal. */
    for (const [name, value] of [
      ['--gold-500', '#C9963A'], ['--navy-900', '#0C1526'], ['--cream', '#FAF8F5'],
      ['--radius-lg', '12px'], ['--text-soon', '#6D6A66'],
    ] as const) {
      expect(css).toMatch(new RegExp(`${name}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;`));
    }
    /* --font-sans and --font-serif are the two the whole site reads (37 and 70
       call sites). Tailwind's theme declares both names; these must still be
       Harvest's. */
    expect(css).toMatch(/--font-serif:\s*"Fraunces"/);
    expect(css).toMatch(/--font-sans:\s*"Inter"/);
  });
});

/* ═══ 8 — the cross-repo price contract ══════════════════════════════════ */
describe('8 — the nine plan prices are unchanged and the contract still has teeth', () => {
  const NINE = {
    plus: { monthly: 20, quarterly: 54, yearly: 190 },
    pro: { monthly: 40, quarterly: 108, yearly: 380 },
    max: { monthly: 80, quarterly: 216, yearly: 760 },
  } as const;

  it('all nine prices are exactly what the app charges', () => {
    for (const [planId, terms] of Object.entries(NINE)) {
      const plan = plans.find((p) => p.planId === planId);
      if (plan === undefined) throw new Error(`plan ${planId} vanished from the table`);
      for (const [term, price] of Object.entries(terms)) {
        expect(plan.price[term as keyof Plan['price']], `${planId} ${term}`).toBe(price);
      }
    }
  });

  it('the contract passes against the shipped table', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and still THROWS when the two repos disagree — a contract nobody has seen fail is not a contract', () => {
    const wrong = plans.map((p) =>
      p.planId === 'pro' ? { ...p, price: { ...p.price, yearly: p.price.yearly + 1 } } : p,
    );
    expect(() => planPriceContract(wrong)).toThrow(/pro/);
  });

  it('it throws at MODULE SCOPE, which is what fails the prerender', () => {
    /* Not `git show` at assertion time — the source as it sits on disk. */
    const src = read('src/components/Pricing.tsx');
    expect(src).toMatch(/^planPriceContract\(plans\);$/m);
  });
});

/* ═══ 9 — the prerendered page count ═════════════════════════════════════ */
describe('9 — the prerender list and the built page count are unchanged', () => {
  it('blogRoutes() lists 22 routes', () => {
    /* The same number LegalPage.test.ts pins. Asserted again here because
       THE-278 was the ticket that could have moved it, by changing what the
       build does rather than what the route table says — and that claim still
       holds: the one route added since is THE-284's Harvest Scheduler page,
       which is a route in the table, not a change to the build. */
    expect(blogRoutes()).toHaveLength(22);
  });

  it.runIf(built)('and the build emits all 22 of them', () => {
    /* The list and the build agree: 22 routes in, 22 pages out.
       ⚠️ ON A win32 CHECKOUT THIS FAILS AT 19, and the failure is correct —
       that build really is missing the three blog posts, for the slugFromPath
       reason noted at the top of this file. Asserted rather than skipped so a
       broken local build is visible instead of self-consistent. */
    const count = (function walk(dir: string): number {
      let n = 0;
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, e.name);
        if (e.isDirectory()) n += walk(abs);
        else if (e.name === 'index.html') n += 1;
      }
      return n;
    })(DIST);
    expect(count, `this checkout built ${count} pages, not 22`).toBe(22);
  });
});

/* ═══ 10 — the build configuration is untouched ══════════════════════════ */
describe('10 — vercel.json, vite.config.ts and the blog plugin are byte-identical', () => {
  /* ⚠️ THE BLOG PLUGIN'S HASH MOVED AT THE-284, AND ONLY ITS HASH.
   *
   * `blogRoutes()` and `STATIC_ROUTES` are the prerender list and the sitemap,
   * and a new page has to be in both — there is no way to add a route without
   * editing this file, so a pin that could never be repinned would be a pin
   * against ever adding a page. What the pin is really holding is that the
   * PLUGIN was not changed: not the parser, not the image measurement, not the
   * watch graph, not the virtual module. That claim is checked in its own right
   * two tests below, against the source rather than against a hash.
   *
   * 🔴 vercel.json AND vite.config.ts DID NOT MOVE, and those are the two that
   * matter most here. `base: '/'` is absolute deliberately — a relative base
   * breaks nested prerendered routes — and `ssgOptions.dirStyle` still nests.
   * A new page needed neither touched.
   */
  it.each([
    ['vercel.json', 'b7c29796ec5df5d87332d573d130ea805956078bd5d3753cef537b2ac73a87be'],
    ['vite.config.ts', '709677152f5cb12c9f081bbe900643f4f6529d604c749037d16bf7c23de4af66'],
    ['build/blog-plugin.ts', '9dbc3c6194c838c6f33e7dc36dcf72fe8682ff93266238ca73f097253b51be36'],
  ])('%s is unchanged', (file, hash) => {
    expect(sha(readFileSync(path.join(ROOT, file))), `${file} was modified`).toBe(hash);
  });

  it('🔴 the blog plugin changed only its route list — the plugin itself is untouched', () => {
    /* What the hash above used to say on its own. Spelled out against the
       source so that repinning it for a new route cannot quietly cover an edit
       to the machinery: the parser, the image measurement, the sitemap shape,
       the virtual module and the watch graph are all still exactly as they
       were, and the diff at THE-284 is three lines of route list. */
    const plugin = read('build/blog-plugin.ts');
    expect(plugin).toMatch(/export function blogPlugin\(\): Plugin \{/);
    expect(plugin).toMatch(/const VIRTUAL_ID = 'virtual:blog-content';/);
    expect(plugin).toMatch(/const SIZE_WARN_BYTES = 400 \* 1024;/);
    expect(plugin).toMatch(/fs\.writeFileSync\(SITEMAP_FILE, sitemapXml\(posts\), 'utf8'\);/);
    expect(plugin).toMatch(/for \(const file of postFiles\(\)\) this\.addWatchFile\(file\);/);
    expect(plugin).toMatch(/\.\.\.readPublishedPosts\(\)\.map\(\(p\) => `\/blog\/\$\{p\.slug\}`\),/);
    /* And the new route is DERIVED from the content module, not typed as a
       literal here — the same property every other route in the list has, so
       the path cannot drift between the router and the prerender list. */
    expect(plugin).toMatch(/import \{ COMING_SOON_HREF, SCHEDULER_HREF \} from '\.\.\/src\/content\/coming-soon';/);
    expect(plugin, 'a route path was typed as a literal').not.toContain("'/features/harvest-scheduler'");
  });

  it('base is still absolute, and ssgOptions still nests', () => {
    /* Spelled out as well as hashed: the hash says "something moved", these say
       which promise broke. A relative base breaks nested prerendered routes. */
    const vite = read('vite.config.ts');
    expect(vite).toMatch(/base:\s*'\/'/);
    expect(vite).toMatch(/dirStyle:\s*'nested'/);
  });
});
