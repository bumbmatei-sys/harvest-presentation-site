import matter from 'gray-matter';
import { Marked, Renderer } from 'marked';
import { CATEGORY_KEYS, isCategoryKey } from '../src/content/categories';
import { isRemote, slugFromPath, type ImageSizes, type Post } from '../src/content/post-core';

/* Markdown → Post. Build-time only.
   `gray-matter` reaches for Node's `Buffer` and throws in a browser, so this
   module must never be imported from src/ — the plugin runs it in Node and
   hands the finished objects to the app through a virtual module. */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* YAML parses a bare `2026-08-04` into a Date, but a quoted one stays a string.
   Normalise both to `YYYY-MM-DD` so posts render identically either way. */
function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.trim().slice(0, 10);
  return '';
}

function requireString(value: unknown, field: string, file: string): string {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!s) throw new Error(`[blog] ${file}: frontmatter is missing required field "${field}".`);
  return s;
}

const baseRenderer = new Renderer();

/** A renderer bound to this build's measured image sizes. */
function rendererFor(sizes: ImageSizes) {
  return {
    image({ href, title, text }: { href: string; title?: string | null; text: string }): string {
      const meta = isRemote(href) ? undefined : sizes[href];
      const attrs = [
        `src="${escapeHtml(href)}"`,
        `alt="${escapeHtml(text || '')}"`,
        // Body images are below the fold by definition — the cover is the LCP
        // element and is rendered by the component, never through here.
        'loading="lazy"',
        'decoding="async"',
      ];
      if (meta) attrs.push(`width="${meta.width}"`, `height="${meta.height}"`);
      const img = `<img ${attrs.join(' ')}>`;
      // Unmeasurable (remote, or a local file that isn't on disk) — reserve the
      // space with an aspect-ratio box so the page doesn't reflow on load.
      const body = meta ? img : `<span class="blog-img-frame">${img}</span>`;
      return title
        ? `<figure class="blog-figure">${body}<figcaption>${escapeHtml(title)}</figcaption></figure>`
        : body;
    },

    // A paragraph holding nothing but an image would wrap a <figure> in a <p>,
    // which browsers silently un-nest. Emit the figure on its own instead.
    paragraph(this: Renderer, token: { tokens: { type: string }[] }): string {
      const inner = this.parser.parseInline(token.tokens as never);
      if (token.tokens.length === 1 && token.tokens[0].type === 'image') return inner;
      return `<p>${inner}</p>\n`;
    },

    // Tables scroll inside their own box so a wide one never scrolls the page.
    table(this: Renderer, token: never): string {
      return `<div class="blog-table-wrap">${baseRenderer.table.call(this, token)}</div>`;
    },
  };
}

export function renderMarkdown(body: string, sizes: ImageSizes): string {
  // A local instance rather than the global `marked`: `use()` extends the
  // default renderer (passing `renderer` as an option would replace it whole),
  // and keeping it local avoids leaking these overrides into any other caller.
  const md = new Marked({ async: false, gfm: true });
  md.use({ renderer: rendererFor(sizes) as never });
  return md.parse(body) as string;
}

/** Frontmatter-only status check. */
export function isDraftSource(raw: string): boolean {
  return matter(raw).data?.status === 'draft';
}

/**
 * Parse one markdown file into a Post. Throws with the offending filename on
 * anything malformed — the build should fail loudly rather than quietly ship a
 * post with no description or an image with no alt text.
 */
export function parsePost(path: string, raw: string, sizes: ImageSizes = {}): Post {
  const file = path.split('/').pop() ?? path;
  const slug = slugFromPath(path);
  const { data, content } = matter(raw);

  const category = requireString(data.category, 'category', file);
  if (!isCategoryKey(category)) {
    throw new Error(
      `[blog] ${file}: unknown category "${category}". Expected one of: ${CATEGORY_KEYS.join(', ')}.`
    );
  }

  const status = requireString(data.status, 'status', file);
  if (status !== 'draft' && status !== 'published') {
    throw new Error(`[blog] ${file}: status must be "draft" or "published", got "${status}".`);
  }

  const publishDate = toIsoDate(data.publish_date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) {
    throw new Error(`[blog] ${file}: publish_date must be a YYYY-MM-DD date.`);
  }

  const cover = typeof data.cover === 'string' ? data.cover.trim() : undefined;
  const coverAlt = typeof data.cover_alt === 'string' ? data.cover_alt.trim() : '';
  // Missing alt text on a hero image is an accessibility and SEO regression that
  // nobody notices for months. Fail the build instead.
  if (cover && !coverAlt) {
    throw new Error(`[blog] ${file}: "cover" is set but "cover_alt" is missing. Every cover image needs alt text.`);
  }

  return {
    slug,
    title: requireString(data.title, 'title', file),
    category,
    status,
    publishDate,
    updated: toIsoDate(data.updated) || publishDate,
    description: requireString(data.description, 'description', file),
    readingTime: requireString(data.reading_time, 'reading_time', file),
    cover,
    coverAlt: cover ? coverAlt : undefined,
    coverSize: cover && !isRemote(cover) ? sizes[cover] : undefined,
    html: renderMarkdown(content, sizes),
  };
}
