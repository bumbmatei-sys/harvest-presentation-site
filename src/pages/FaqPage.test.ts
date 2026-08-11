import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from 'react-router-dom';
import type { RouteRecord } from 'vite-react-ssg';
import { describe, expect, it } from 'vitest';
import { blogRoutes } from '../../build/blog-plugin';
import { routes } from '../App';
import { Footer } from '../components/Footer';
import { FAQS, FAQ_HREF } from '../content/faq';
import { Answer, FaqPage } from './FaqPage';

/* Wiring: /faq exists, points at the FAQ page, gets prerendered, and is
 * reachable from the footer of every page.
 *
 * The suite is node-only and renders nothing (see vitest.config.ts), so "the
 * route renders" is checked one level up from the DOM, exactly as
 * pages/LegalPage.test.ts does it: the router carries a route at that path whose
 * element is the FaqPage, and the content behind it has answers in it.
 *
 * Keeping this apart from content/faq.test.ts is deliberate: importing App.tsx
 * pulls in FaqPage.tsx, whose module-scope price contract throws on a stale
 * price or a stale plan limit. That failure belongs to this file; the named
 * price test lives in the other one, where it can still be reported by name. */

type Child = NonNullable<RouteRecord[]>[number];

const children = ((routes[0] as { children?: Child[] }).children ?? []) as Child[];
const pathOf = (r: Child) => (r as { path?: string }).path;
const routePaths = children.map(pathOf);
const routeFor = (path: string) => children.find((r) => pathOf(r) === path);

describe('the /faq route', () => {
  it('is in the router', () => {
    expect(routePaths, 'no route for /faq').toContain(FAQ_HREF);
  });

  it('renders the FaqPage', () => {
    const element = (routeFor(FAQ_HREF) as { element?: React.ReactNode }).element;
    expect(React.isValidElement(element)).toBe(true);
    expect((element as React.ReactElement).type).toBe(FaqPage);
  });

  it('has answers behind it', () => {
    expect(FAQS.length).toBeGreaterThan(0);
    for (const faq of FAQS) expect(faq.answer.join('').length).toBeGreaterThan(0);
  });

  it('resolves before the catch-all', () => {
    // `*` renders the Landing page. /faq declared after it would still match —
    // react-router ranks static paths above the splat — but the order here is
    // what a reader checks, so keep it honest.
    expect(routePaths.indexOf(FAQ_HREF)).toBeLessThan(routePaths.indexOf('*'));
  });
});

describe('the prerender list', () => {
  const prerendered = blogRoutes();

  it('includes /faq', () => {
    // The whole value of this page is that a crawler can read it. Shipping it as
    // an empty shell would leave the FAQPage markup in a script tag nobody
    // fetches — see pages/LegalPage.test.ts for the asserted total, now 19.
    expect(prerendered, '/faq would ship as an empty shell').toContain(FAQ_HREF);
  });

  it('lists /faq once', () => {
    expect(prerendered.filter((r) => r === FAQ_HREF)).toHaveLength(1);
  });
});

/* ---------------------------------------------------------------- *
 * Footer.
 * ---------------------------------------------------------------- */

/** Every `to` prop on every <Link> in an element tree. The footer builds its
 *  columns eagerly through `col()`, so the tree returned by Footer() already
 *  contains them — no DOM needed to read the links out of it. */
function linkTargets(node: React.ReactNode, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const child of node) linkTargets(child, found);
    return found;
  }
  if (!React.isValidElement(node)) return found;
  const el = node as React.ReactElement<{ to?: string; children?: React.ReactNode }>;
  if (el.type === Link && typeof el.props.to === 'string') found.push(el.props.to);
  linkTargets(el.props.children, found);
  return found;
}

describe('the footer link', () => {
  const targets = linkTargets(Footer());

  it('points at /faq', () => {
    expect(targets, 'the footer does not link to /faq').toContain(FAQ_HREF);
  });

  it('resolves to a route this router serves', () => {
    // The footer's standing rule: real destinations only, no placeholder hrefs.
    expect(routePaths).toContain(FAQ_HREF);
  });
});

/* ---------------------------------------------------------------- *
 * The accordion, in the static output.
 * ---------------------------------------------------------------- */

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST_FAQ = path.join(here, '..', '..', 'dist', 'faq', 'index.html');
const built = fs.existsSync(DIST_FAQ);

/** The copy comes back out of the HTML escaped, and not identically by both
 *  routes — React writes `ministry&#x27;s`, the built file has `ministry's` —
 *  so the markup is decoded before the answers are looked for in it rather than
 *  the answers being escaped to match. `&amp;` last, or `&amp;lt;` would decode
 *  twice. */
const decodeEntities = (s: string) =>
  s.replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/**
 * The FAQ markup a crawler is served.
 *
 * ⚠️ THIS IS THE POINT OF THE PAGE. /faq is prerendered so that the answers are
 * in the file, and they are behind a `details` rather than a React-held open
 * flag so that collapsing them does not take them back out again. Reading them
 * out of the finished HTML is the only check that actually says so — a source
 * regex would still pass the day somebody swaps in a mount-time accordion.
 *
 * Post-build this is the real artifact, dist/faq/index.html. On a clean
 * checkout `npm test` runs before `npm run build`, so when the file is not
 * there yet the same component is put through the same server renderer
 * vite-react-ssg uses, which is where that file comes from. The assertions and
 * the test count are identical either way, and CI runs the suite a second time
 * after the build so the artifact itself is read at least once per commit.
 */
const faqMarkup = built
  // The FAQPage JSON-LD carries every answer too, and it is emitted into this
  // same file. Left in, it would satisfy every assertion below on its own and
  // the tests would pass with the whole visible accordion deleted.
  ? fs.readFileSync(DIST_FAQ, 'utf8').replace(/<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/g, '')
  : FAQS.map((faq, i) => renderToStaticMarkup(React.createElement(Answer, { faq, first: i === 0 }))).join('');

const faqText = decodeEntities(faqMarkup);

describe(`the answers in the prerendered HTML (${built ? 'dist/faq/index.html' : 'rendered from FaqPage.tsx'})`, () => {
  it.each(FAQS.map((f) => [f.id, f] as const))(
    '%s is in the static output, question and every paragraph of it',
    (id, faq) => {
      expect(faqText, `"${faq.question}" is not in the prerendered HTML`)
        .toContain(faq.question);
      for (const para of faq.answer) {
        expect(faqText, `an answer paragraph of "${id}" is not in the prerendered HTML`)
          .toContain(para);
      }
    },
  );

  it('collapses all 12 on load, and ships none of them open', () => {
    // `open` is the whole difference between "collapsed" and "expanded", and it
    // is one keystroke to add. Every answer arrives shut; the reader opens one.
    const tags = [...faqMarkup.matchAll(/<details\b[^>]*>/g)].map((m) => m[0]);
    expect(tags, 'the answers are not in <details> elements').toHaveLength(FAQS.length);
    expect(FAQS).toHaveLength(12);
    for (const tag of tags) {
      expect(/(?:^|\s)open(?:=|\s|\/|>)/.test(tag), `${tag} ships expanded`).toBe(false);
    }
  });

  it('gives every question its own summary to click', () => {
    expect([...faqMarkup.matchAll(/<summary\b/g)]).toHaveLength(FAQS.length);
  });

  it('keeps the anchor a support reply can link to', () => {
    for (const faq of FAQS) {
      expect(faqMarkup, `/faq#${faq.id} no longer resolves to anything`)
        .toMatch(new RegExp(`<details\\b[^>]*\\bid="${faq.id}"`));
    }
  });
});

/* ---------------------------------------------------------------- *
 * The disclosure is the browser's, not React's.
 * ---------------------------------------------------------------- */

describe('the FAQ accordion', () => {
  const source = fs.readFileSync(path.join(here, 'FaqPage.tsx'), 'utf8');

  it('holds no open/closed state and binds no handler', () => {
    // A useState accordion would render the answers only after hydration, which
    // is exactly the output the prerender exists to avoid — and it would have to
    // rebuild the keyboard operation, the expanded announcement and find-in-page
    // that `details` gives for nothing. If this ever needs to change, the test
    // above is the one that has to keep passing.
    expect(source, 'the disclosure state moved into React').not.toMatch(/useState|useReducer/);
    expect(source, 'the summary took a click handler').not.toMatch(/onClick|onToggle/);
    expect(source, 'aria-expanded is the element\'s job, not this file\'s').not.toMatch(/aria-expanded/);
  });

  it('hides the browser default marker instead of leaving two', () => {
    const css = fs.readFileSync(path.join(here, '..', 'index.css'), 'utf8');
    expect(css).toMatch(/\.faq-summary\s*\{[^}]*list-style:\s*none/);
    expect(css).toMatch(/\.faq-summary::-webkit-details-marker\s*\{\s*display:\s*none/);
  });
});

/* ---------------------------------------------------------------- *
 * Narrow viewports.
 * ---------------------------------------------------------------- */

describe('the FAQ page at 390px', () => {
  const source = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'FaqPage.tsx'),
    'utf8',
  );

  /* No DOM here, so this is a source check rather than a layout measurement:
     the page is one fluid column of prose, and the only ways it could push a
     390px viewport sideways are a fixed pixel width, a nowrap run, or a long
     unbreakable token like "your-church.theharvest.app" setting the column's
     minimum width. Each is checkable in the source, and each is what actually
     went wrong the last time a page overflowed. The comparison table on the
     pricing page is the counter-example: it sets minWidth 640 deliberately and
     scrolls inside its own container — this page has no such element. */

  it('sets no fixed width — every width declared is a maximum', () => {
    const widths = [...source.matchAll(/([A-Za-z]*[Ww]idth):\s*(\d+)/g)];
    for (const [, prop] of widths) {
      expect(prop, `${prop} is a fixed dimension; a 390px viewport cannot honour it`).toBe('maxWidth');
    }
  });

  it('never suppresses wrapping', () => {
    expect(source).not.toMatch(/whiteSpace:\s*'nowrap'/);
    expect(source).not.toMatch(/overflowX/);
  });

  it('breaks long unbreakable tokens in the prose', () => {
    // theharvest.app and your-church.theharvest.app both appear in the answers.
    expect(source).toMatch(/overflowWrap:\s*'anywhere'/);
  });
});
