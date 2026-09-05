/**
 * THE-301 — two Tailark marketing blocks, adopted onto the site's own ramps.
 *
 * ⚠️ WHAT WAS ADOPTED, AND FROM WHERE. `veil-content-3` and `veil-content-1`,
 * written by `npx shadcn@4.11.0 add @tailark-oss/<name>` from the FREE OSS
 * registry at https://oss.tailark.com/r/{name}.json. That registry carries
 * three themes — Veil, Dusk and Mist — and NOT Quartz: every `quartz-*` name
 * 404s there, and the paid registry at tailark.com/r/*.json answers
 * 401 "Sign in with a plan that includes blocks" for every block. Quartz is
 * behind the Pro tier; Veil is free, and is the one of the three free themes
 * whose heading slot is `font-serif`, which this site already resolves to
 * Fraunces.
 *
 * 🔴 WHERE THEY WENT, AND WHY THOSE TWO SURFACES.
 *
 *   · /features (components/content-3.tsx). The route is a redirect shim and
 *     everything under <Navigate> is the no-JS fallback. It was an <h1>, one
 *     sentence and five unlabelled pills, and it built to 11.34 KiB against
 *     80–128 KiB for every other page on the site — the thinnest surface here
 *     by a factor of seven.
 *   · /contact (components/content-1.tsx). The page was a header band and a
 *     form card and then nothing; a visitor whose question the site has already
 *     answered in public had one route out of it, which was to type it and wait.
 *
 * ⚠️ AND WHAT WAS CONSIDERED AND REJECTED, because "the existing one is better"
 * is the finding, not the failure. The /faq page is native <details>/<summary>
 * so every answer sits in the prerendered HTML behind an honest FAQPage
 * JSON-LD; Tailark's `faqs-*` blocks are an accordion with React state, which
 * would have taken the answers out of the file. The landing page's two
 * genuinely thin elements — the #replaces integrations row and the Features
 * section's tool-count footnote — are both pinned verbatim by earlier tickets'
 * guards (the-257, the-258, Features.test.ts), and moving them would have meant
 * loosening a guard to make room for a block. Test 12 pins those three files by
 * hash so that stays true.
 *
 * 🔴 EVERY DIST ASSERTION READS THE BUILT FILES. A block that renders under
 * `vite` and not under `vite-react-ssg build` is the failure this ticket is
 * most exposed to, and a dev-only success is not a success. Same `it.runIf`
 * idiom as the-278-*.test.ts so `npm test` before a build still runs; CI builds
 * between its two test runs.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { blogRoutes } from '../../build/blog-plugin';
import { plans, planPriceContract } from '../components/Pricing';
import { CATEGORIES, categoryHref } from '../content/features';
import { FAQ_HREF, FAQ_STANDFIRST } from '../content/faq';
import { COMING_SOON_HREF, NOT_BUILT_NOTICE } from '../content/coming-soon';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Read with line endings normalised, so a hash pin cannot be broken by a
 *  checkout's autocrlf setting rather than by an edit. */
const read = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

const DIST = path.join(ROOT, 'dist');
const built = existsSync(path.join(DIST, 'index.html'));
/** Whether the three blog post pages made it into this build — false on win32,
 *  for the pre-existing `slugFromPath` reason set out under section 4. */
const postPagesBuilt = existsSync(path.join(DIST, 'blog', 'work-that-outlives-you', 'index.html'));

/** Every built page, keyed by its POSIX-shaped path.
 *
 *  🔴 `path.sep` IS NORMALISED AWAY, and that is not a nicety. Four existing
 *  suites in this repo compare a `path.join`ed key against a '/'-spelled
 *  literal and fail on win32 for that reason alone; this file will not join
 *  them. */
function distPages(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.name === 'index.html') {
        out.push([path.relative(DIST, abs).split(path.sep).join('/'), readFileSync(abs, 'utf8')]);
      }
    }
  };
  if (built) walk(DIST);
  return out.sort(([a], [b]) => a.localeCompare(b));
}

const PAGES = distPages();
const page = (rel: string) => PAGES.find(([f]) => f === rel)?.[1] ?? '';

/** 🔴 THE TWO PAGES THIS TICKET IS ALLOWED TO MOVE, named rather than counted. */
const TOUCHED = ['contact/index.html', 'features/index.html'] as const;

/** The class signature the CLI's markup carries after re-tokenisation. Used as
 *  the leak detector: it appears on a page if and only if a block renders on
 *  it, and it is a string no hand-written component on this site contains. */
const BLOCK_MARK = 'bg-background @container';

const SRC_3 = read('src/components/content-3.tsx');
const SRC_1 = read('src/components/content-1.tsx');

/** Source with comments stripped.
 *
 *  ⚠️ COMMENTS FIRST, ALWAYS. The header of each adopted block QUOTES the
 *  Tailark classes it replaced — `grid-cols-2`, `text-muted-foreground`,
 *  `border-t` — because that is how the rewrite is documented. Asserting
 *  against the raw file would fail on its own explanation of why it passes,
 *  the same trap `src/pages/the-284-harvest-scheduler.test.ts` records. */
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CODE_3 = strip(SRC_3);
const CODE_1 = strip(SRC_1);

/* ═══ 1 — the blocks render in the PRERENDERED output ═════════════════════ */
describe('1 — each adopted block renders in the prerendered output', () => {
  it.runIf(built)('veil-content-3 is in the built /features page, not only in dev', () => {
    const html = page('features/index.html');
    expect(html, 'the built /features page is missing').not.toBe('');
    expect(html, 'the block did not survive the prerender').toContain(BLOCK_MARK);
    expect(html).toContain('py-[var(--section-y)]');
    /* The heading the block supplies, as the page's h1. */
    expect(html).toMatch(/<h1 class="[^"]*font-serif[^"]*">Features<\/h1>/);
  });

  it.runIf(built)('veil-content-1 is in the built /contact page, not only in dev', () => {
    const html = page('contact/index.html');
    expect(html, 'the built /contact page is missing').not.toBe('');
    expect(html, 'the block did not survive the prerender').toContain(BLOCK_MARK);
    expect(html).toContain('py-[var(--section-y-tight)]');
    expect(html).toContain('Or find it without asking');
  });

  it.runIf(built)('🔴 and the utilities they need are in the BUILT stylesheet', () => {
    /* THE-263's lesson, restated: markup carrying a class a stylesheet never
       minted paints nothing, and looks correct in the file either way. Each of
       these is a rule a browser would actually apply. */
    const cssDir = path.join(DIST, 'assets');
    const css = readdirSync(cssDir)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(path.join(cssDir, f), 'utf8'))
      .join('\n');
    expect(css).toMatch(/\.text-\\\[var\\\(--navy-900\\\)\\\]\{color:var\(--navy-900\)/);
    expect(css).toMatch(/\.text-\\\[var\\\(--text-body\\\)\\\]\{color:var\(--text-body\)/);
    expect(css).toMatch(/\.border-\\\[var\\\(--border-light\\\)\\\]\{border-color:var\(--border-light\)/);
    expect(css).toMatch(/\.py-\\\[var\\\(--section-y\\\)\\\]\{padding-block:var\(--section-y\)/);
    expect(css).toMatch(/\.min-h-\\\[44px\\\]\{min-height:44px/);
    expect(css).toMatch(/\.\\@container\{container-type:inline-size/);
    /* 🔴 `border-t` alone is a WIDTH, not a border: preflight is deliberately
       not imported, so the style comes from an @property initial value. If that
       is absent the rules above colour a border nothing draws. */
    expect(css).toMatch(/@property --tw-border-style\{[^}]*initial-value:solid/);
    /* And font-serif has to reach Fraunces, not Tailwind's generic stack —
       which it does because :root is unlayered and @layer theme is not. */
    expect(css).toMatch(/\.font-serif\{font-family:var\(--font-serif\)/);
    expect(css).toMatch(/--font-serif:"Fraunces"/);
  });
});

/* ═══ 2 — the replaced sections render their new content ══════════════════ */
describe('2 — the sections that were replaced render their new content', () => {
  it.runIf(built)('/features lists all five categories with the catalogue\'s own copy', () => {
    const html = page('features/index.html');
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(5);
    for (const c of CATEGORIES) {
      expect(html, `${c.slug} lost its name`).toContain(c.name.replace(/&/g, '&amp;'));
      expect(html, `${c.slug} lost its link`).toContain(`href="${categoryHref(c.slug)}"`);
      /* The description is the catalogue's `seo` line, not a second hand-typed
         one — checked on a distinctive fragment so an entity-escaped quote in
         the middle of a sentence cannot fail it. */
      const fragment = c.seo.split(/[—,]/)[0].trim().slice(0, 40).replace(/&/g, '&amp;');
      expect(html, `${c.slug} lost its description`).toContain(fragment);
    }
    expect(html).toContain('Every tool now lives on its own page.');
  });

  it.runIf(built)('and the five pills it replaced are gone', () => {
    const html = page('features/index.html');
    /* The old fallback drew each category as a rounded pill with an inline
       border. If that markup is still in the file, the block was added beside
       the thing it replaces rather than in place of it. */
    expect(html).not.toContain('border-radius:999px;padding:10px 18px');
    expect(read('src/pages/FeaturesRedirect.tsx')).not.toMatch(/borderRadius: 999/);
  });

  it.runIf(built)('/contact carries the three routes, with the copy their own files own', () => {
    const html = page('contact/index.html');
    for (const href of [FAQ_HREF, categoryHref(CATEGORIES[0].slug), COMING_SOON_HREF]) {
      expect(html, `the band lost ${href}`).toContain(`href="${href}"`);
    }
    expect(html).toContain(FAQ_STANDFIRST.slice(0, 48));
    expect(html).toContain(NOT_BUILT_NOTICE.slice(0, 48));
  });

  it('🔴 neither block writes a sentence of its own', () => {
    /* Every string the two blocks render is either a prop or read out of a
       content module. The only literals left in either file are class names and
       the arrow. This is what stops a marketing block becoming a place where a
       claim nobody signed off appears. */
    for (const [name, src] of [['content-3', SRC_3], ['content-1', SRC_1]] as const) {
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(code, `${name} still ships Tailark's placeholder copy`)
        .not.toMatch(/Create Content with AI Assistance|Generate Ideas|Improve Writing|Design Layouts/);
      expect(code, `${name} names a price`).not.toMatch(/\$\d/);
    }
  });
});

/* ═══ 3 — no page this ticket did not touch changed ═══════════════════════ */
describe('3 — no page outside the two named ones carries a block', () => {
  it.runIf(built)('🔴 exactly contact/index.html and features/index.html, named not counted', () => {
    const carrying = PAGES.filter(([, html]) => html.includes(BLOCK_MARK)).map(([f]) => f);
    expect(carrying).toEqual([...TOUCHED]);
  });

  it.runIf(built)('and no other page mentions either block\'s copy', () => {
    const others = PAGES.filter(([f]) => !TOUCHED.includes(f as (typeof TOUCHED)[number]));
    expect(others.length, 'the build emitted nothing but the two touched pages').toBeGreaterThan(10);
    for (const [file, html] of others) {
      expect(html, `${file} leaked the /contact band`).not.toContain('Or find it without asking');
      expect(html, `${file} leaked a block class`).not.toContain('py-[var(--section-y-tight)]');
    }
  });

  it('the only page components this ticket edited are the two it names', () => {
    /* Read off the source rather than off a diff — a component pulled into a
       third page would show as a third importer. */
    const importers = readdirSync(path.join(ROOT, 'src', 'pages'))
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => /from '\.\.\/components\/content-[13]'/.test(read(`src/pages/${f}`)));
    expect(importers.sort()).toEqual(['ContactPage.tsx', 'FeaturesRedirect.tsx']);
  });
});

/* ═══ 4 — the page count did not move ════════════════════════════════════ */
describe('4 — the prerendered page count is unchanged', () => {
  it('blogRoutes() still lists 22 routes — this ticket adds no route', () => {
    expect(blogRoutes()).toHaveLength(22);
  });

  it('and App.tsx gained no route', () => {
    const app = read('src/App.tsx');
    expect(app).not.toMatch(/content-1|content-3/);
  });

  it.runIf(built && postPagesBuilt)('the build emits one page per route', () => {
    expect(PAGES).toHaveLength(22);
  });

  it.runIf(built)('and the nineteen non-post pages are there on any platform', () => {
    /* ⚠️ A win32 CHECKOUT BUILDS 19, NOT 22, and not because of this ticket:
       `slugFromPath` in content/post-core.ts splits on '/' only, so on Windows
       the three blog post slugs become absolute paths and those three routes
       never render. Documented at length at the head of
       the-278-no-regression.test.ts, which skips its own fingerprint
       comparison for the same reason.

       🔴 SO THE ASSERTION THAT RUNS EVERYWHERE IS THE ONE THIS TICKET COULD
       ACTUALLY BREAK. The three missing pages are blog posts; nothing here
       touches the blog. Nineteen holds on Linux and on Windows, and it still
       catches a page this ticket added or dropped — which was the point. */
    const nonPosts = PAGES.filter(([f]) => !/^blog\/[^/]+\/index\.html$/.test(f) || f.startsWith('blog/category/'));
    expect(nonPosts.map(([f]) => f)).toHaveLength(19);
    expect(nonPosts.map(([f]) => f)).toContain('features/index.html');
    expect(nonPosts.map(([f]) => f)).toContain('contact/index.html');
  });
});

/* ═══ 5 — the nine prices, and a contract with teeth ═════════════════════ */
describe('5 — the nine plan prices are unchanged and the contract still bites', () => {
  /** Three plans × three terms. Pinned as literals HERE — the one place in the
   *  repo where writing a price down is the point rather than the hazard. */
  const NINE: Readonly<Record<string, Record<string, number>>> = {
    plus: { monthly: 20, quarterly: 54, yearly: 190 },
    pro: { monthly: 40, quarterly: 108, yearly: 380 },
    max: { monthly: 80, quarterly: 216, yearly: 760 },
  };

  it('all nine are exactly what they were', () => {
    expect(plans).toHaveLength(3);
    for (const p of plans) {
      expect(NINE[p.planId], `${p.planId} is not a plan this ticket saw`).toBeDefined();
      for (const term of ['monthly', 'quarterly', 'yearly'] as const) {
        expect(p.price[term], `${p.name} ${term} moved`).toBe(NINE[p.planId][term]);
      }
    }
  });

  it('the cross-repo contract passes against the shipped table', () => {
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and still THROWS when the two repos disagree', () => {
    const wrong = plans.map((p) =>
      p.planId === 'max' ? { ...p, price: { ...p.price, yearly: p.price.yearly + 1 } } : p,
    );
    expect(() => planPriceContract(wrong)).toThrow(/max/);
  });

  it('it still throws at MODULE SCOPE, which is what fails the prerender', () => {
    /* Not `git show` at assertion time — the source as it sits on disk. */
    expect(read('src/components/Pricing.tsx')).toMatch(/^planPriceContract\(plans\);$/m);
  });
});

/* ═══ 6, 7, 11, 12 — what this ticket must not have touched ══════════════ */
describe('6, 7, 11 & 12 — the files this ticket is forbidden to move', () => {
  /**
   * Hashes taken on `main` at 7516c07, before a line of this ticket existed,
   * with line endings normalised so the pin measures an edit rather than a
   * checkout setting.
   *
   * 🔴 THE PRICING SECTION IS THE FIRST ENTRY AND THE REASON THE LIST EXISTS.
   * `Pricing.tsx` holds nine prices under a contract that throws at module
   * scope if this repo and the app disagree on any of them; a pricing block
   * carrying literals would have failed the build, and that is the guard
   * working rather than a bug. This ticket did not go near it.
   */
  const PINNED: Readonly<Record<string, string>> = {
    /* 6 — no pricing section was touched.
       🔵 REPINNED AT THE-306, and ONLY the two comments that quoted the tool
       count. THE-306 found that catalog.ts said "the count is unchanged at 28"
       while the mega-menu footer rendered "27 tools in one platform" — the
       figure had been 27 since THE-245 and three prose comments still said 28,
       two of them in THIS file. Correcting them here rather than leaving them
       is the whole point of that half of the ticket; leaving them would have
       replaced one stale pair with another, since adding the Shareable Giving
       Page row moves the flag's pair from 28/27 to 29/28.
       ⚠️ NOT ONE PRICE, CELL, ROW OR ADD-ON MOVED — the previous hash was
       d0d574f0…, and `planPriceContract` still throws at module scope if this
       repo and the app disagree on any of the nine, which is the guard that
       makes a claim about this file's prices checkable rather than asserted.

       🔵 REPINNED AGAIN AT THE-314, and again NOT ONE PRICE MOVED — the same
       module-scope contract still stands behind that claim, and it would have
       failed the prerender rather than this test if one had. What moved is the
       SMS line and the SMS comparison row: both were withheld behind
       SMS_MARKETING_ENABLED, and turning it on brought them back RENAMED (no
       carrier, because Harvest resells) and ON A DIFFERENT TIER (Ministry only,
       because that is where the app sells it). The previous hash was
       f0aee586…. */
    'src/components/Pricing.tsx': '1d0b9ba876b70593f46949ef71dc998de0ae7c3e963a206b10bc8090e619e24c',
    // 7 — the CLI did not overwrite button or card. It writes theme-scoped ui
    // components (`mist-card` → src/components/ui/card.tsx) for any block that
    // pulls one, which is why both adopted blocks were chosen from the 28 in
    // that registry with NO registryDependencies at all.
    'src/components/ui/button.tsx': 'cb8a46be8807c595cb84e8f803abd765edd7c86a01b2ab3a31de8b40cef6a659',
    'src/components/ui/card.tsx': '668cb8872aa8a8d6887790eb1d1cfdbe1593ca2861da0e1e0c0811f6641ddde4',
    // 11 — the build and deploy configuration.
    'vercel.json': 'b7c29796ec5df5d87332d573d130ea805956078bd5d3753cef537b2ac73a87be',
    'vite.config.ts': '709677152f5cb12c9f081bbe900643f4f6529d604c749037d16bf7c23de4af66',
    'build/blog-plugin.ts': '9dbc3c6194c838c6f33e7dc36dcf72fe8682ff93266238ca73f097253b51be36',
    // 12 — 🔴 THE THREE GUARDS THAT SAID NO. Each pins a landing-page element a
    // block would have improved: Features.test.ts the tool-count footnote,
    // the-257 and the-258 the #replaces integrations row. Loosening one of them
    // to make room is the failure mode this ticket had, and these are what make
    // it visible in the diff rather than in the reviewer's memory.
    //
    // 🔵 ALL THREE REPINNED AT THE-314, and none of them loosened — which is the
    // distinction this list exists to make visible, so it is spelled out:
    //   · Features.test.ts asserted the rendered footer never contains "29
    //     tools" — a proxy for "the count is not a stale literal" that worked
    //     only while 29 was WRONG. THE-314 made 29 the true derived count, so
    //     that assertion would now fail on a correct render and pass on a
    //     hardcoded one. It was rewritten to assert the thing it always meant:
    //     the SOURCE carries no literal count. STRICTER, not looser.
    //   · the-257 and the-258 both asserted Twilio was IN the integrations row.
    //     Harvest resells now, so a church connects no carrier — the row's whole
    //     subject is services a church connects itself. Both now assert its
    //     ABSENCE, name and favicon, which is a new guard rather than a dropped
    //     one. the-257 additionally gained the SMS entry it used to forbid,
    //     because THE-257's own coverage guard demanded it once the feature went
    //     live.
    // Previous hashes: 3d6717dd…, 4f7af228…, c342d76e….
    'src/components/Features.test.ts': 'dfb2140eb6850979bbbc349d47f4fca644eafc956f14bf6684f847c57ab914b3',
    'src/components/the-257-competitor-table-retired.test.ts':
      '15d2a39990ab2412c816f2e32cc1ed3335a5d80e5910b2afa56831fd9278708b',
    'src/components/the-258-platform-brand-complete.test.ts':
      'a3a5a9df43047764e9f6cd215be1ce9bc1097aa2f30f99192bd0f552e5ba6067',
  };

  for (const [file, hash] of Object.entries(PINNED)) {
    it(`${file} is byte-identical`, () => {
      expect(sha(read(file)), `${file} moved`).toBe(hash);
    });
  }

  it('and the prerender configuration still says what it said', () => {
    /* Spelled out as well as hashed: a hash says "something changed", these say
       what would have been lost. */
    const cfg = read('vite.config.ts');
    expect(cfg).toMatch(/dirStyle:\s*'nested'/);
    expect(cfg).toMatch(/base:\s*'\/'/);
    expect(cfg).toMatch(/blogPlugin/);
  });
});

/* ═══ 8 — every colour is a site ramp token ══════════════════════════════ */
describe('8 — no colour is hardcoded; every colour is a site ramp token', () => {
  const CSS = read('src/index.css');

  /** The ramps and semantic aliases index.css declares. A colour reference is
   *  only allowed if it names one of these. */
  const declared = new Set(
    [...CSS.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
  );

  for (const [name, src] of [['content-3.tsx', SRC_3], ['content-1.tsx', SRC_1]] as const) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    it(`${name} writes no literal colour`, () => {
      expect(code, 'a hex literal').not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(code, 'an rgb()/hsl() literal').not.toMatch(/\b(rgba?|hsla?|oklch|color-mix)\s*\(/);
      expect(code, 'a CSS named colour').not.toMatch(/\b(white|black|silver|gray|grey|red|blue|green|gold)\b\s*['"]?\s*[;,}]/);
    });

    it(`${name} uses no Tailwind palette colour`, () => {
      /* 🔴 THE OTHER HALF OF "no hardcoded colour". `text-zinc-500` is not a
         literal, but it is Tailwind's palette rather than Harvest's, and it is
         exactly what a copied block ships. */
      expect(code).not.toMatch(
        /\b(bg|text|border|ring|fill|stroke|from|via|to|shadow|outline|decoration|divide|accent|caret)-(slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
      );
      /* And no bare black/white utilities, with or without an opacity step —
         Tailark's own blocks ship `bg-black/10` and `shadow-black/50`. */
      expect(code).not.toMatch(/\b(bg|text|border|ring|shadow|fill|stroke)-(black|white)(\/\d+)?\b/);
    });

    it(`${name} names only tokens index.css declares`, () => {
      const used = [...code.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
      expect(used.length, 'the block references no token at all').toBeGreaterThan(0);
      for (const token of used) {
        expect(declared.has(token), `${token} is not declared in src/index.css`).toBe(true);
      }
    });
  }

  it('🔴 and it is the SITE ramps, not the shadcn bridge, that carry the ink', () => {
    /* THE-278 bridges --muted-foreground to --text-soon and --foreground to
       --text-heading. Tailark's blocks reach for both. --text-soon is the
       reserved "not built yet" ink that ComingSoonBlock, SoonMock and the
       unbuilt FeatureBlock variant share, and --text-heading is not the ink
       this site sets headings in; both were rewritten, and this is what stops
       them coming back on the next edit. */
    for (const src of [SRC_3, SRC_1]) {
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(code).not.toMatch(/\btext-muted-foreground\b/);
      expect(code).not.toMatch(/\btext-foreground\b/);
      expect(code).toMatch(/text-\[var\(--navy-900\)\]/);
      expect(code).toMatch(/text-\[var\(--text-body\)\]/);
    }
    /* `border-t` with no colour paints at currentColor, because preflight is
       deliberately not imported. Every border in the blocks names a ramp. */
    expect(SRC_3).toMatch(/border-t border-\[var\(--border-light\)\]/);
  });
});

/* ═══ 9 — no logo was vendored ═══════════════════════════════════════════ */
describe('9 — no logo file was vendored', () => {
  it('🔴 the CLI wrote no third-party brand mark anywhere in the tree', () => {
    /* ⚠️ THIS IS WHY THERE IS NO INTEGRATIONS OR LOGO-CLOUD BLOCK IN THIS
       TICKET. Every one of Tailark's `integrations-*` and `logo-cloud-*`
       blocks pulls `@tailark-oss/core-<brand>` registry items, and each of
       those writes a third-party logo into src/components/ui/svgs/*.tsx.
       Board card 86bbrgp08 — quoted in the header of components/Replaces.tsx —
       already settled that this repo commits no third-party logo file, which
       is why `logoUrl` hotlinks instead. Both adopted blocks have NO
       registryDependencies at all, so nothing of the sort was written. */
    expect(existsSync(path.join(ROOT, 'src', 'components', 'ui', 'svgs'))).toBe(false);
    const ui = readdirSync(path.join(ROOT, 'src', 'components', 'ui'));
    expect(ui.sort()).toEqual(['button.tsx', 'card.tsx']);
  });

  it('and neither block references an image at all', () => {
    for (const [name, src] of [['content-3', SRC_3], ['content-1', SRC_1]] as const) {
      expect(strip(src), `${name} embeds an image`).not.toMatch(/<img|next\/image|\.svg|\.png|\.webp|cdn\.simpleicons/);
    }
  });

  it('the two dead logo directories from the design handoff gained nothing', () => {
    /* They already hold unused files; this ticket adds none. Counted rather
       than listed, because what matters is that the number did not grow. */
    const pub = readdirSync(path.join(ROOT, 'public', 'logos'));
    expect(pub.length, 'a file was added to public/logos').toBe(10);
  });
});

/* ═══ 10 — targets and overflow ══════════════════════════════════════════ */
describe('10 — every tappable target is ≥44px, at every measured width', () => {
  /**
   * Measured in a real browser against the BUILT files, at 380 / 768 / 1024 /
   * 1280 / 1440, with `document.documentElement.scrollWidth -
   * clientWidth === 0` at all five:
   *
   *   /features   380 → 1 column, 332px wide, 141px tall
   *               768 / 1024 / 1280 / 1440 → 3 columns, 192px wide, 221–241px tall
   *   /contact    380 → 1 column, 332px wide, 132px tall
   *               768 … 1440 → 2 columns, 348px wide, 132px tall
   *
   * What is asserted here is the property those numbers come from, since a
   * vitest run has no layout engine: the target is the whole cell, and the
   * cell carries an explicit floor.
   */
  it('the tappable thing is the whole cell, not a line of text inside it', () => {
    for (const [name, src] of [['content-3', SRC_3], ['content-1', SRC_1]] as const) {
      const links = [...src.matchAll(/<Link\b[\s\S]*?className="([^"]*)"/g)].map((m) => m[1]);
      expect(links.length, `${name} renders no Link`).toBeGreaterThan(0);
      for (const cls of links) {
        expect(cls, `${name}: a Link with no 44px floor`).toContain('min-h-[44px]');
        expect(cls, `${name}: a Link that is not a block-level box`).toMatch(/\bflex\b/);
      }
    }
  });

  it('🔴 the grids start at ONE column, so 380px is never two', () => {
    /* Tailark ships `grid-cols-2` with no smaller step; at 380px that is a
       154px column under a 15-character measure. content-3 starts at one and
       reaches Tailark's two at @md; content-1 is a single column until @2xl. */
    expect(CODE_3).toMatch(/grid-cols-1/);
    expect(CODE_3).toMatch(/@md:grid-cols-2/);
    expect(CODE_1).toMatch(/@2xl:grid-cols-2/);
    for (const [name, code] of [['content-3', CODE_3], ['content-1', CODE_1]] as const) {
      expect(code, `${name}: an unconditional two-column grid is back`)
        .not.toMatch(/(?<![@\w:-])grid-cols-2\b/);
    }
  });

  it('nothing in either block can be wider than its container', () => {
    /* No fixed widths and no min-widths: the two ways a block overflows a
       380px viewport. Heights are fine; widths are not. */
    for (const [name, src] of [['content-3', SRC_3], ['content-1', SRC_1]] as const) {
      expect(strip(src), `${name} pins a width`).not.toMatch(/\bw-\[\d/);
      expect(strip(src), `${name} pins a min-width`).not.toMatch(/\bmin-w-/);
    }
  });
});
