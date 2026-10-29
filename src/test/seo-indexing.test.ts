import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { describe, expect, it, vi } from 'vitest';
import { blogRoutes, readAllPosts } from '../../build/blog-plugin';
import { llmsTxt, readSeoPage, robotsTxt, sitemapIndexXml, sitemapXml, writeSeoArtifacts } from '../../build/seo';
import { Seo } from '../components/Seo';
import { plans } from '../components/Pricing';
import { SITE_ORIGIN, absoluteImageUrl } from '../content/post-core';
import { FAQS, faqJsonLd } from '../content/faq';
import { softwareSchema } from '../lib/structured-data';

function head(props: React.ComponentProps<typeof Seo>): string {
  const context: { helmet?: HelmetServerState } = {};
  renderToStaticMarkup(React.createElement(HelmetProvider, { context }, React.createElement(Seo, props)));
  const helmet = context.helmet!;
  return `<head>${helmet.title}${helmet.meta}${helmet.link}${helmet.script}</head>`;
}

const metadata = (route = '/') => ({ title: `Title ${route}`, description: `Description & details ${route}`,
  canonical: `${SITE_ORIGIN}${route}` });
const page = (route = '/') => readSeoPage(route, head(metadata(route)))!;
const posts = readAllPosts();
const published = posts.filter((post) => post.status === 'published');

describe('rendered SEO and JSON-LD', () => {
  it('emits complete metadata, safe JSON-LD and the llms describedby link', () => {
    const html = head({ ...metadata(), title: 'Title </script><script>alert(1)</script> & details' });
    const result = readSeoPage('/', html)!;
    expect(result.title).toBe('Title </script><script>alert(1)</script> & details');
    expect(result.description).toBe(metadata().description);
    expect(html).toContain('rel="describedby" href="/llms.txt"');
    expect(html).toContain('\\u003c/script\\u003e');
    expect(result.schemas.map((schema) => schema['@type'])).toEqual(['Organization', 'WebSite', 'WebPage']);
    expect(result.schemas[0].name).toBe('The Harvest');
    expect(result.schemas[2].url).toBe(`${SITE_ORIGIN}/`);
  });

  it('keeps FAQ markup tied to every visible FAQ', () => {
    const result = readSeoPage('/faq', head({ ...metadata('/faq'), jsonLd: faqJsonLd() }))!;
    const schema = result.schemas.find((node) => node['@type'] === 'FAQPage')!;
    expect(schema.mainEntity).toHaveLength(FAQS.length);
    expect(schema.mainEntity.map((entry: any) => entry.name)).toEqual(FAQS.map((faq) => faq.question));
  });

  it('uses actual charged monthly and yearly prices in software offers', () => {
    const result = readSeoPage('/', head({ ...metadata(), jsonLd: softwareSchema(plans) }))!;
    const software = result.schemas.find((node) => node['@type'] === 'SoftwareApplication')!;
    expect(software.offers.map((offer: any) => offer.price)).toEqual(plans.flatMap((plan) => [plan.price.monthly, plan.price.yearly]));
    expect(software.offers.every((offer: any) => offer.priceCurrency === 'USD')).toBe(true);
    expect(software.offers[1].priceSpecification.billingDuration).toBe('P1Y');
  });

  it('fails the build for missing page metadata', () => {
    expect(() => readSeoPage('/broken', '<head><title>Broken</title></head>')).toThrow(/description.*canonical.*og:image/);
  });

  it('excludes noindex, redirect-only, duplicate canonical, 404 and preview pages', () => {
    expect(readSeoPage('/features', head({ ...metadata('/features'), noindex: true }))).toBeUndefined();
    expect(readSeoPage('/pricing', head(metadata('/')))).toBeUndefined();
    for (const route of ['/404', '/500', '/preview', '/drafts/example']) expect(readSeoPage(route, head(metadata(route)))).toBeUndefined();
    expect(() => readSeoPage('/Bad_Slug', head(metadata()))).toThrow(/unclean route/);
  });
});

describe('sitemaps, robots and llms.txt', () => {
  const routes = blogRoutes();
  const pages = routes.filter((route) => !['/pricing', '/features'].includes(route)).map((route) =>
    readSeoPage(route, head({ ...metadata(route), ...(route === '/faq' ? { jsonLd: faqJsonLd() } : {}) }))!);

  it('lists every canonical prerendered route and published post exactly once', () => {
    const xml = sitemapXml(pages, posts);
    const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locations).toEqual(pages.map((entry) => entry.url));
    expect(new Set(locations).size).toBe(locations.length);
    for (const post of published) expect(locations).toContain(`${SITE_ORIGIN}/blog/${post.slug}`);
    for (const post of posts.filter((post) => post.status === 'draft')) {
      expect(xml).not.toContain(post.slug);
      expect(llmsTxt(pages, posts)).not.toContain(post.title);
      expect(routes).not.toContain(`/blog/${post.slug}`);
    }
    expect(locations).not.toContain(`${SITE_ORIGIN}/features`);
    expect(locations).not.toContain(`${SITE_ORIGIN}/pricing`);
    expect(xml).not.toContain('hreflang');
    expect(xml).toContain('href="/sitemap.xsl"');
    expect(sitemapIndexXml()).toContain(`<loc>${SITE_ORIGIN}/sitemap.xml</loc>`);
    expect(sitemapIndexXml()).toContain('href="/sitemap.xsl"');
    const xsl = fs.readFileSync('public/sitemap.xsl', 'utf8');
    expect(xsl).toContain('s:sitemapindex/s:sitemap');
    expect(xsl).toContain('s:urlset/s:url');
  });

  it('uses the latest modification even if an older publication was updated last', () => {
    const data = published.slice(0, 2).map((post, index) => ({ ...post, updated: index ? '2026-10-29' : '2026-10-01' }));
    expect(sitemapXml([page('/blog')], data)).toContain('<lastmod>2026-10-29</lastmod>');
  });

  it('generates the requested explicit crawler groups and wildcard signals', () => {
    const robots = robotsTxt();
    for (const bot of ['Googlebot', 'GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot']) {
      expect(robots).toContain(`User-agent: ${bot}\nAllow: /\n`);
    }
    expect(robots).toContain('User-agent: *\nContent-signal: search=yes, ai-train=yes\nAllow: /');
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap-index.xml`);
    expect(robots).not.toContain('Disallow:');
  });

  it('includes the homepage, every page metadata record, FAQs and article excerpts', () => {
    const text = llmsTxt(pages, posts);
    expect(text).toContain(`# ${metadata().title}\n\n> ${metadata().description}`);
    for (const entry of pages) {
      expect(text).toContain(entry.title);
      expect(text).toContain(entry.description);
      expect(text).toContain(`URL: ${entry.url}`);
    }
    for (const faq of FAQS) expect(text).toContain(faq.question);
    for (const post of published) {
      expect(text).toContain(`### ${post.title}`);
      expect(text).toContain(post.description);
    }
    expect(text).not.toMatch(/<\/?(?:p|h[1-6]|a|script)\b/);
  });

  it('writes only into output and creates a verification file only with a valid key', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'harvest-seo-'));
    try {
      fs.writeFileSync(path.join(dir, 'index.html'), head(metadata()));
      writeSeoArtifacts(dir, ['/'], [], '');
      expect(fs.readdirSync(dir).sort()).toEqual(['index.html', 'llms.txt', 'robots.txt', 'sitemap-index.xml', 'sitemap.xml']);
      writeSeoArtifacts(dir, ['/'], [], 'test-key-12345678');
      expect(fs.readFileSync(path.join(dir, 'test-key-12345678.txt'), 'utf8')).toBe('test-key-12345678');
      expect(() => writeSeoArtifacts(dir, ['/'], [], '../invalid')).toThrow(/INDEXNOW_KEY/);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('IndexNow (mocked requests only)', () => {
  // Keep the executable as native JS; its imports must never execute the CLI.
  const scriptPath = '../../scripts/indexnow.mjs';
  it('reads an index, deduplicates child sitemap URLs and submits the exact payload', async () => {
    const { submitIndexNow } = await import(scriptPath);
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => `<sitemapindex><sitemap><loc>${SITE_ORIGIN}/sitemap.xml</loc></sitemap></sitemapindex>` })
      .mockResolvedValueOnce({ ok: true, text: async () => `<urlset><url><loc>${SITE_ORIGIN}/</loc></url><url><loc>${SITE_ORIGIN}/faq</loc></url><url><loc>${SITE_ORIGIN}/faq</loc></url></urlset>` })
      .mockResolvedValueOnce({ ok: true, status: 202 });
    expect(await submitIndexNow([], { key: 'test-key-12345678', fetcher })).toBe(2);
    expect(fetcher.mock.calls[0][0]).toBe(`${SITE_ORIGIN}/sitemap-index.xml`);
    const [endpoint, request] = fetcher.mock.calls[2];
    expect(endpoint).toBe('https://api.indexnow.org/indexnow');
    expect(request.method).toBe('POST');
    expect(JSON.parse(request.body)).toEqual({ host: 'theharvest.site', key: 'test-key-12345678',
      keyLocation: `${SITE_ORIGIN}/test-key-12345678.txt`, urlList: [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/faq`] });
  });

  it('submits explicit URLs without fetching a sitemap and fails before networking on bad inputs', async () => {
    const { submitIndexNow } = await import(scriptPath);
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    await expect(submitIndexNow(['/faq', `${SITE_ORIGIN}/faq`], { key: 'test-key-12345678', fetcher })).resolves.toBe(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    fetcher.mockClear();
    for (const args of [['https://other.example/'], ['/faq?preview=1'], ['/faq#section']]) {
      await expect(submitIndexNow(args, { key: 'test-key-12345678', fetcher })).rejects.toThrow(/canonical/);
    }
    await expect(submitIndexNow([], { key: '', fetcher })).rejects.toThrow(/INDEXNOW_KEY/);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('reports sitemap and submission failures', async () => {
    const { submitIndexNow } = await import(scriptPath);
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    await expect(submitIndexNow([], { key: 'test-key-12345678', fetcher })).rejects.toThrow(/HTTP 403/);
    await expect(submitIndexNow(['/'], { key: 'test-key-12345678', fetcher })).rejects.toThrow(/HTTP 403/);
  });
});

const built = fs.existsSync('dist/index.html');
describe.runIf(built)('actual prerendered artifacts', () => {
  it('contains all canonical pages, structured data and published Articles', () => {
    const routes = blogRoutes();
    const pages = routes.map((route) => readSeoPage(route, fs.readFileSync(path.join('dist', route, 'index.html'), 'utf8')))
      .filter((entry) => !!entry).sort((a, b) => a.url.localeCompare(b.url));
    const xml = fs.readFileSync('dist/sitemap.xml', 'utf8');
    expect([...xml.matchAll(/<loc>/g)]).toHaveLength(pages.length);
    expect(fs.readFileSync('dist/robots.txt', 'utf8')).toBe(robotsTxt());
    expect(fs.readFileSync('dist/llms.txt', 'utf8')).toBe(llmsTxt(pages, posts));
    expect(fs.readFileSync('dist/sitemap-index.xml', 'utf8')).toBe(sitemapIndexXml());
    expect(fs.readFileSync('dist/sitemap.xsl', 'utf8')).toContain('<xsl:stylesheet');
    for (const entry of pages) {
      expect(xml).toContain(`<loc>${entry.url}</loc>`);
      expect(entry.schemas.map((node) => node['@type'])).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage']));
    }
    for (const post of published) {
      const entry = pages.find((candidate) => candidate.route === `/blog/${post.slug}`)!;
      const article = entry.schemas.find((node) => node['@type'] === 'Article')!;
      expect(article.headline).toBe(post.title);
      expect(article.datePublished).toBe(post.publishDate);
      expect(article.dateModified).toBe(post.updated);
      expect(article.author.name).toBe('The Harvest');
      expect(article.image).toBe(absoluteImageUrl(post.cover));
    }
  });
});
