import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it } from 'vitest';
import { SchedulerPage } from './SchedulerPage';
import { CAPABILITIES, SCHEDULER_HREF } from '../content/scheduler';
import { CATALOG } from '../components/catalog';
import { routes } from '../App';
import { blogRoutes } from '../../build/blog-plugin';
import { TRIAL_CTA_LABEL } from '../content/legal';
import { ADD_ONS, DODO_ADD_ON_CATALOG, dodoAddOnCatalogContract, plans, planPriceContract, type Plan } from '../components/Pricing';

describe('live social scheduler', () => {
  const html = renderToStaticMarkup(React.createElement(HelmetProvider, null, React.createElement(MemoryRouter, null, React.createElement(SchedulerPage))));
  it('renders the four approved capabilities and their qualifiers', () => {
    expect(CAPABILITIES).toHaveLength(4);
    for (const capability of CAPABILITIES) {
      expect(html).toContain(capability.title);
      expect(html).toContain(capability.body);
    }
    expect(html).toContain('Included on the Ministry plan.');
    expect(html).toContain('Image and video upload are coming soon.');
    expect(html).not.toMatch(/analytics|inbox|boost|approvals|AI captions/i);
  });
  it('offers the standard trial and is available through the menu and route', () => {
    expect(html).toContain(TRIAL_CTA_LABEL);
    expect(html).toContain('href="/#pricing"');
    const item = CATALOG.find((g) => g.name === 'Community & Engagement')!.items.find((i) => i.title === 'Social Scheduler');
    expect(item).toMatchObject({ href: SCHEDULER_HREF, desc: 'Write once, schedule to Facebook, Instagram, TikTok and Threads. Included on Ministry.' });
    expect(routes[0].children!.map((route) => route.path)).toContain(SCHEDULER_HREF);
    expect(blogRoutes()).toContain(SCHEDULER_HREF);
    expect(blogRoutes()).not.toContain('/features/coming-soon');
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
    expect(config.redirects).toContainEqual({ source: '/features/coming-soon', destination: '/features', permanent: true });
    for (const [, page] of distPages()) expect(page).not.toContain('href="/features/coming-soon');
    if (built) {
      // SEO indexing writes the audited sitemap after SSG finishes.
      const sitemap = read('dist/sitemap.xml');
      expect(sitemap).toContain(`https://theharvest.site${SCHEDULER_HREF}</loc>`);
      expect(sitemap).not.toContain('/features/coming-soon');
    }
  });
});

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.join(ROOT, 'dist');
const built = fs.existsSync(path.join(DIST, 'index.html'));
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const words = (html: string) => html.replace(/<[^>]+>/g, ' ');
/** Every prerendered page, when the build has run. */
const distPages = (): [string, string][] => {
  if (!built) return [];
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name))
      : e.name.endsWith('.html') ? [path.join(dir, e.name)] : []));
  return walk(DIST).map((f) => [path.relative(DIST, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')]);
};

/**
 * Every text file in the working tree, `node_modules`, `.git` and build output
 * aside — source, config, content, tests and this file included.
 *
 * ⚠️ WIDER THAN the-252's SWEEP ON PURPOSE. That one walks `src/` and matches
 * `.ts|.tsx|.css`, which would miss a vendor name in package.json (an SDK
 * dependency is exactly how one would arrive), in README.md, in vercel.json or
 * in a markdown post. A name in any of those is still a name on a public repo.
 */
const repoFiles = (): string[] => {
  const SKIP = new Set(['node_modules', '.git', 'dist', 'build-output', '.vercel']);
  const TEXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|html|yml|yaml|txt|svg)$/;
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      if (SKIP.has(e.name)) return [];
      const abs = path.join(dir, e.name);
      return e.isDirectory() ? walk(abs) : TEXT.test(e.name) ? [abs] : [];
    });
  return walk(ROOT);
};

/* ── 1 ─────────────────────────────────────────────────────────────────────
   🔴 The vendor is named NOWHERE.                                           */
describe('1 — the third-party provider is named nowhere in this repository', () => {
  /* base64, decoded at run time, so the plain strings exist in no file here.
     The first is the provider itself; the second is the reference
     implementation published under its own organisation, which names it just as
     surely; the rest are the alternative recorded on the board card and the
     obvious substitutes a later edit might reach for. Any of them on a page
     under Harvest's name is a claim about who Harvest has contracted with. */
  const ENCODED = [
    'emVybmlv', 'bGF0ZXdpeg==', 'cG9zdGl6', 'YXlyc2hhcmU=', 'aG9vdHN1aXRl',
    'c3Byb3V0IHNvY2lhbA==', 'bWV0cmljb29s', 'cHVibGVy', 'bWl4cG9zdA==',
    'YmxvdGF0bw==', 'YnVmZmVyLmNvbQ==', 'bGF0ZXIuY29t', 'c2VuZGlibGU=',
    'c29jaWFsYmVl',
  ];
  const NAMES = ENCODED.map((e) => Buffer.from(e, 'base64').toString('utf8'));
  const VENDORS = new RegExp(NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

  it('the decoder works, so a green run is not an empty regex', () => {
    /* 🔴 THE TEST THAT KEEPS EVERY ASSERTION BELOW HONEST. A base64 typo would
       decode to rubbish, the sweep would search for rubbish, and the whole
       section would pass while the vendor's name sat on the page. So the regex
       is proved to have teeth on a mutated string first. */
    expect(NAMES).toHaveLength(ENCODED.length);
    for (const n of NAMES) {
      expect(n, 'a token decoded to something unusable').toMatch(/^[a-z][a-z. ]{4,}$/);
      expect(VENDORS.test(`the ${n} api`), `the sweep would not catch "${n}"`).toBe(true);
      expect(VENDORS.test(`// built on ${n.toUpperCase()}`), 'the sweep is case-sensitive').toBe(true);
    }
    expect(VENDORS.test('Harvest Scheduler posts to Instagram')).toBe(false);
  });

  it('🔴 nor in ANY file in the working tree — source, config, content or test', () => {
    /* No self-exemption. This file is swept like every other, which it can be
       precisely because the names are not spelled in it. */
    const offenders = repoFiles()
      .filter((f) => VENDORS.test(fs.readFileSync(f, 'utf8')))
      .map((f) => path.relative(ROOT, f));
    expect(offenders, 'a provider name reached the working tree').toEqual([]);
  });

  it('🔴 nor in a FILENAME, and nor in a dependency', () => {
    const named = repoFiles()
      .map((f) => path.relative(ROOT, f))
      .filter((f) => VENDORS.test(f));
    expect(named, 'a provider name reached a path').toEqual([]);

    /* An SDK dependency is the likeliest way the name arrives, and it would
       arrive in two files at once. Both are swept above; this says which. */
    const pkg = JSON.parse(read('package.json')) as Record<string, Record<string, string>>;
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(deps.filter((d) => VENDORS.test(d)), 'a provider SDK was installed').toEqual([]);
    expect(VENDORS.test(read('package-lock.json')), 'the lockfile names the provider').toBe(false);
  });

  it.runIf(built)('nor on any prerendered page', () => {
    for (const [file, html] of distPages()) {
      expect(VENDORS.test(words(html)), `${file} names the provider`).toBe(false);
      expect(VENDORS.test(html), `${file} names the provider in an attribute`).toBe(false);
    }
  });

});

describe('11 — no plan price moved and nothing was added to the add-on catalogue', () => {
  const NINE = {
    plus: { monthly: 30, yearly: 300 },

    // ⚠️ Moved by THE-343 (Ministry $80 → $60) and back by THE-372 ($80, with
    // the quarter and year at $216 / $752). plus and pro are enumerated
    // above so a reprice that reached past its brief still fails here.
    max: { monthly: 90, yearly: 900 },
  } as const;

  it('all six plan prices are exactly what the app charges', () => {
    for (const [planId, terms] of Object.entries(NINE)) {
      const plan = plans.find((p) => p.planId === planId);
      if (plan === undefined) throw new Error(`plan ${planId} vanished from the table`);
      for (const [term, price] of Object.entries(terms)) {
        expect(plan.price[term as keyof Plan['price']], `${planId} ${term}`).toBe(price);
      }
    }
    expect(() => planPriceContract(plans)).not.toThrow();
  });

  it('🔴 and the cross-repo contract still THROWS when the two repos disagree', () => {
    const wrong = plans.map((p) =>
      (p.planId === 'max' ? { ...p, price: { ...p.price, yearly: p.price.yearly + 1 } } : p));
    expect(() => planPriceContract(wrong)).toThrow(/max/);
  });

  it('🔴 the scheduler was NOT added to the add-on catalogue', () => {
    /* ⚠️ THERE IS NO DODO PRODUCT FOR THIS, and creating one would make it
       purchasable with nothing behind it — the exact defect THE-253 fixed,
       where buying the AI Assistant add-on granted nothing. A price becomes
       possible only once the feature and its Dodo product both exist, and
       neither does. */
    const named = /schedul|social|instagram|tiktok|youtube|facebook|threads|bluesky/i;
    for (const a of ADD_ONS) {
      expect(a.name, `"${a.name}" is a scheduler add-on`).not.toMatch(named);
      expect(a.blurb, `"${a.name}"'s blurb sells a scheduler add-on`).not.toMatch(named);
    }
    expect(Object.keys(DODO_ADD_ON_CATALOG).filter((k) => named.test(k))).toEqual([]);
    // And the catalogue contract still passes, so nothing unbacked slipped in.
    expect(() => dodoAddOnCatalogContract(ADD_ONS, DODO_ADD_ON_CATALOG)).not.toThrow();
  });
});


describe('scheduler page presentation', () => {
  const source = read('src/pages/SchedulerPage.tsx');
  it('uses the site colour tokens and no local logo assets', () => {
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgb\(|\bhsl\(/);
    expect(source).not.toMatch(/src="\/[^"]*\.(png|svg|webp|jpe?g)"/);
    const listing = (dir: string) => fs.existsSync(path.join(ROOT, dir)) ? fs.readdirSync(path.join(ROOT, dir)).sort() : [];
    const existing = ['avatar-1.jpg', 'avatar-2.jpg', 'avatar-3.jpg', 'google-calendar.svg', 'google-tasks.svg', 'harvest-field.jpg', 'instagram.svg', 'notion.svg', 'outlook.svg'];
    expect(listing('logos')).toEqual(existing);
    expect(listing('public/logos')).toEqual([...existing, 'harvest-mark.png'].sort());
    expect(listing('public/features').filter((f) => /instagram|tiktok|youtube|facebook|threads|bluesky|meta|schedul/i.test(f))).toEqual([]);
  });
  it('uses scoped presentation CSS and does not expose API implementation details', () => {
    // The all-pages presentation rebuild now styles this page explicitly.
    expect(read('src/index.css')).toContain('.marketing-scheduler');
    expect(read('src/index.css')).not.toMatch(/destination-chip/i);
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(source).not.toMatch(/webhook|endpoint|SDK|OAuth/i);
  });
});
