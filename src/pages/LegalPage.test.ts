import React from 'react';
import { Link } from 'react-router-dom';
import type { RouteRecord } from 'vite-react-ssg';
import { describe, expect, it } from 'vitest';
import { blogRoutes } from '../../build/blog-plugin';
import { routes } from '../App';
import { Footer } from '../components/Footer';
import { LEGAL_DOCS, legalHref, legalLinks } from '../content/legal';
import { LegalPage } from './LegalPage';

/* Wiring: the three policy routes exist, point at the right page, get
 * prerendered, and are reachable from the footer of every page.
 *
 * The suite is node-only and renders nothing (see vitest.config.ts), so "the
 * route renders" is checked one level up from the DOM: the router carries a
 * route at that path whose element is a LegalPage for that document, and the
 * document behind it has prose in it. What the browser does with that element is
 * the same thing it does with /contact, which has shipped for months.
 *
 * Keeping this apart from content/legal.test.ts is deliberate: importing App.tsx
 * pulls in LegalPage.tsx, whose module-scope price contract throws on a stale
 * price. That failure belongs to this file; the named price test lives in the
 * other one, where it can still be reported by name. */

type Child = NonNullable<RouteRecord[]>[number];

const children = ((routes[0] as { children?: Child[] }).children ?? []) as Child[];
const pathOf = (r: Child) => (r as { path?: string }).path;
const routePaths = children.map(pathOf);
const routeFor = (path: string) => children.find((r) => pathOf(r) === path);

const docs = LEGAL_DOCS.map((d) => [d.slug, d] as const);

describe('the policy routes', () => {
  it.each(docs)('/%s is in the router', (slug) => {
    expect(routePaths, `no route for /${slug}`).toContain(legalHref(slug));
  });

  it.each(docs)('/%s renders the LegalPage for that document', (slug) => {
    const route = routeFor(legalHref(slug))!;
    const element = (route as { element?: React.ReactNode }).element;
    expect(React.isValidElement(element)).toBe(true);
    const el = element as React.ReactElement<{ slug: string }>;
    expect(el.type).toBe(LegalPage);
    // A copy-paste that pointed /privacy at the Terms would render a page that
    // looks perfectly fine and says the wrong thing.
    expect(el.props.slug).toBe(slug);
  });

  it.each(docs)('/%s has a document with prose behind it', (_slug, doc) => {
    expect(doc.sections.length).toBeGreaterThan(0);
    expect(doc.title.length).toBeGreaterThan(0);
  });

  it('resolves before the catch-all', () => {
    // `*` renders the Landing page. A legal path declared after it would still
    // match — react-router ranks static paths above the splat — but the order
    // here is what a reader checks, so keep it honest.
    const splat = routePaths.indexOf('*');
    for (const doc of LEGAL_DOCS) {
      expect(routePaths.indexOf(legalHref(doc.slug))).toBeLessThan(splat);
    }
  });
});

describe('the prerender list', () => {
  const prerendered = blogRoutes();

  it.each(docs)('includes /%s', (slug) => {
    expect(prerendered, `/${slug} would ship as an empty shell`).toContain(legalHref(slug));
  });

  it('prerenders 19 pages', () => {
    // 15 before the policies, 18 with them, 19 with /faq. The number is asserted
    // rather than derived so that a route silently dropping out of the list is a
    // failure here rather than a page that quietly stops being crawlable.
    expect(prerendered).toHaveLength(19);
    expect(new Set(prerendered).size).toBe(prerendered.length);
  });

  it('prerenders every route the router declares, catch-all and dynamic aside', () => {
    const declared = routePaths.filter((p): p is string => !!p && !p.includes(':') && p !== '*');
    for (const path of declared) {
      expect(prerendered, `${path} is a route but is not prerendered`).toContain(path);
    }
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

describe('the footer legal column', () => {
  const targets = linkTargets(Footer());

  it('lists all three policies', () => {
    for (const doc of LEGAL_DOCS) {
      expect(targets, `the footer does not link to /${doc.slug}`).toContain(legalHref(doc.slug));
    }
  });

  it('labels them, without repeating a label', () => {
    const labels = legalLinks().map(([label]) => label);
    expect(labels).toHaveLength(LEGAL_DOCS.length);
    for (const label of labels) expect(label.length).toBeGreaterThan(0);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('links only to destinations that resolve', () => {
    // The footer's standing rule: real destinations only, no placeholder hrefs.
    // Every internal target must be a route this router serves.
    for (const target of targets) {
      const path = target.split('#')[0] || '/';
      const matched = routePaths.some((p) => p === path || (p && p.includes(':') && path.startsWith(p.split(':')[0])));
      expect(matched, `the footer links to ${target}, which no route serves`).toBe(true);
    }
  });
});
