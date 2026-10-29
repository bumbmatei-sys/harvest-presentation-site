import { pathToFileURL } from 'node:url';

const ORIGIN = 'https://theharvest.site';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10_000;

export function validateKey(key) {
  if (!key || !/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    throw new Error('Set INDEXNOW_KEY to 8–128 letters, numbers or hyphens. Build and deploy its verification file first.');
  }
  return key;
}

function siteUrl(value) {
  const url = new URL(value, ORIGIN);
  if (url.origin !== ORIGIN || url.username || url.password || url.hash || url.search) {
    throw new Error(`Only canonical ${ORIGIN} URLs without query strings or fragments are accepted.`);
  }
  return url.href;
}

function locations(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
}

/** Fetch only same-origin sitemaps. A visited set also handles nested indexes. */
export async function collectSitemapUrls(fetcher = fetch) {
  const pending = [`${ORIGIN}/sitemap-index.xml`];
  const visited = new Set();
  const urls = new Set();
  while (pending.length) {
    const sitemap = siteUrl(pending.shift());
    if (visited.has(sitemap)) continue;
    visited.add(sitemap);
    if (visited.size > 1000) throw new Error('Too many nested sitemaps.');
    const response = await fetcher(sitemap, { signal: AbortSignal.timeout(20_000), redirect: 'error' });
    if (!response.ok) throw new Error(`Sitemap request failed: HTTP ${response.status}`);
    const xml = await response.text();
    if (/<sitemapindex\b/.test(xml)) pending.push(...locations(xml).map(siteUrl));
    else if (/<urlset\b/.test(xml)) for (const url of locations(xml)) urls.add(siteUrl(url));
    else throw new Error(`Not a sitemap: ${sitemap}`);
  }
  if (!urls.size) throw new Error('The live sitemap contains no URLs.');
  return [...urls];
}

export async function submitIndexNow(args = [], { key = process.env.INDEXNOW_KEY, fetcher = fetch } = {}) {
  validateKey(key);
  const urlList = args.length ? [...new Set(args.map(siteUrl))] : await collectSitemapUrls(fetcher);
  // IndexNow accepts at most 10,000 URLs per POST. Do not retry automatically.
  for (let start = 0; start < urlList.length; start += MAX_URLS) {
    const response = await fetcher(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20_000),
      redirect: 'error',
      body: JSON.stringify({ host: new URL(ORIGIN).host, key, keyLocation: `${ORIGIN}/${key}.txt`,
        urlList: urlList.slice(start, start + MAX_URLS) }),
    });
    if (!response.ok) throw new Error(`IndexNow submission failed: HTTP ${response.status}`);
  }
  return urlList.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  submitIndexNow(process.argv.slice(2))
    .then((count) => console.info(`Submitted ${count} URLs to IndexNow.`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
