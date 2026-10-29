import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, type Post } from '../src/content/post-core';

export interface SeoPage {
  route: string;
  url: string;
  title: string;
  description: string;
  image: string;
  schemas: Record<string, any>[];
}

const xml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// SSG emits quoted HTML attributes. Decode only after parsing their boundaries.
export function decodeHtml(text: string): string {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (raw, entity: string) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()] ?? raw;
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : raw;
  });
}

function attributes(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map((match) => [match[1].toLowerCase(), decodeHtml(match[2] ?? match[3])]));
}

/** Read the final head, so llms.txt and the sitemap cannot drift from the pages.
 * Noncanonical aliases (currently /pricing), noindex forwarders, error pages,
 * and preview routes never become indexing entries. */
export function readSeoPage(route: string, html: string): SeoPage | undefined {
  if (/(?:^|\/)(?:404|500|preview|drafts?)(?:\/|$)/.test(route)) return;
  if (!/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/.test(route)) {
    throw new Error(`[seo] unclean route: ${route}`);
  }
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const tags = [...head.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map((match) => attributes(match[0]));
  const meta = (name: string) => tags.find((tag) => tag.name === name || tag.property === name)?.content ?? '';
  if (/\bnoindex\b/i.test(meta('robots'))) return;
  const url = tags.find((tag) => tag.rel === 'canonical')?.href ?? '';
  if (url && url !== `${SITE_ORIGIN}${route}`) return;
  const title = decodeHtml(head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();
  const description = meta('description');
  const image = meta('og:image');
  const required = { title, description, canonical: url, 'og:image': image,
    'og:title': meta('og:title'), 'og:description': meta('og:description'), 'og:url': meta('og:url'),
    'og:type': meta('og:type'), 'twitter:card': meta('twitter:card'), 'twitter:title': meta('twitter:title'),
    'twitter:description': meta('twitter:description'), 'twitter:image': meta('twitter:image') };
  const missing = Object.entries(required).filter(([, value]) => !value.trim()).map(([name]) => name);
  if (missing.length) throw new Error(`[seo] ${route} is missing ${missing.join(', ')}`);
  if (!/^https:\/\//.test(image) || !/^https:\/\//.test(meta('twitter:image'))) {
    throw new Error(`[seo] ${route} needs absolute social image URLs`);
  }
  const schemas = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attributes(match[1]).type === 'application/ld+json')
    .flatMap((match) => { const data = JSON.parse(match[2]); return data['@graph'] ?? [data]; });
  return { route, url, title, description, image, schemas };
}

const preamble = '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';

export function sitemapXml(pages: SeoPage[], posts: Post[]): string {
  const published = posts.filter((post) => post.status === 'published');
  const urls = pages.map((page) => {
    // Use the newest actual modification, not the newest publication date.
    const relevant = published.filter((post) => page.route === '/blog'
      || page.route === `/blog/${post.slug}` || page.route === `/blog/category/${post.category}`);
    const lastmod = relevant.map((post) => post.updated).sort().slice(-1)[0];
    return `  <url><loc>${xml(page.url)}</loc>${lastmod ? `<lastmod>${xml(lastmod)}</lastmod>` : ''}</url>`;
  });
  return `${preamble}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  return `${preamble}<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_ORIGIN}/sitemap.xml</loc></sitemap>\n</sitemapindex>\n`;
}

export function robotsTxt(): string {
  const bots = ['Googlebot', 'GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot'];
  return `${bots.map((bot) => `User-agent: ${bot}\nAllow: /\n`).join('\n')}\nUser-agent: *\nContent-signal: search=yes, ai-train=yes\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap-index.xml\n`;
}

function plainText(html: string): string {
  return decodeHtml(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' '))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
}

export function llmsTxt(pages: SeoPage[], posts: Post[]): string {
  const home = pages.find((page) => page.route === '/');
  if (!home) throw new Error('[seo] missing homepage');
  const sections = [`# ${home.title}\n\n> ${home.description}`, '## Pages'];
  for (const page of pages) sections.push(`### ${page.title}\n\n${page.description}\n\nURL: ${page.url}`);
  const faqs = pages.flatMap((page) => page.schemas.filter((schema) => schema['@type'] === 'FAQPage')
    .flatMap((schema) => (schema.mainEntity ?? []).map((faq: any) =>
      `### ${plainText(faq.name)}\n\n${plainText(faq.acceptedAnswer.text)}\n\nSource: ${page.url}`)));
  if (faqs.length) sections.push('## Frequently asked questions', ...faqs);
  const urls = new Set(pages.map((page) => page.url));
  const articles = posts.filter((post) => post.status === 'published' && urls.has(`${SITE_ORIGIN}/blog/${post.slug}`));
  if (articles.length) sections.push('## Blog excerpts', ...articles.map((post) => {
    const excerpt = plainText(post.html).slice(0, 600).replace(/\s+\S*$/, '');
    return `### ${post.title}\n\n${post.description}\n\n${excerpt}…\n\nURL: ${SITE_ORIGIN}/blog/${post.slug}`;
  }));
  return `${sections.join('\n\n')}\n`;
}

/** Runs only after SSG has written every HTML file. Never submits URLs. */
export function writeSeoArtifacts(outDir: string, routes: string[], posts: Post[], key = process.env.INDEXNOW_KEY): void {
  if (key && !/^[A-Za-z0-9-]{8,128}$/.test(key)) throw new Error('[seo] INDEXNOW_KEY must be 8–128 letters, numbers or hyphens');
  const pages = routes.map((route) => readSeoPage(route, fs.readFileSync(path.join(outDir, route, 'index.html'), 'utf8')))
    .filter((page): page is SeoPage => !!page).sort((a, b) => a.url.localeCompare(b.url));
  for (const field of ['url', 'title', 'description'] as const) {
    const seen = new Set<string>();
    for (const page of pages) {
      if (seen.has(page[field])) throw new Error(`[seo] duplicate ${field}: ${page[field]}`);
      seen.add(page[field]);
    }
  }
  const files = { 'sitemap.xml': sitemapXml(pages, posts), 'sitemap-index.xml': sitemapIndexXml(),
    'robots.txt': robotsTxt(), 'llms.txt': llmsTxt(pages, posts), ...(key ? { [`${key}.txt`]: key } : {}) };
  for (const [file, content] of Object.entries(files)) fs.writeFileSync(path.join(outDir, file), content, 'utf8');
  console.info(`[seo] Audited ${pages.length} canonical pages; wrote sitemap index, sitemap, robots.txt and llms.txt${key ? ' plus IndexNow verification file' : ''}.`);
}
