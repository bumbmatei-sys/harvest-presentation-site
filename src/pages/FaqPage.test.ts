import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { Link } from 'react-router-dom';
import type { RouteRecord } from 'vite-react-ssg';
import { describe, expect, it } from 'vitest';
import { blogRoutes } from '../../build/blog-plugin';
import { routes } from '../App';
import { Footer } from '../components/Footer';
import { FAQS, FAQ_HREF } from '../content/faq';
import { FaqPage } from './FaqPage';

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
