import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import type { Plugin } from 'vite';
import { CATEGORIES } from '../src/content/categories';
import { CATEGORIES as FEATURE_CATEGORIES, categoryHref } from '../src/content/features';
import { LEGAL_DOCS, legalHref } from '../src/content/legal';
import { FAQ_HREF } from '../src/content/faq';
import { COMING_SOON_HREF, SCHEDULER_HREF } from '../src/content/coming-soon';
import { SOLUTIONS, solutionHref } from '../src/content/solutions';
import { byNewest, type ImageSizes, type Post } from '../src/content/post-core';
import { parsePost } from './parse-post';

/* Build-time half of the blog. Everything Node-only lives here:

   - reads and parses src/content/posts/*.md with gray-matter + marked
   - measures every image under public/blog so each <img> can carry width and
     height and the page does not reflow as images load
   - warns about oversized images and broken image references
   - derives the prerender route list from the content directory
   - supplies published content and prerender routes to the SEO post-build hook

   The finished posts reach the app through the `virtual:blog-content` module.
   They are handed over already parsed on purpose: gray-matter reaches for
   Node's `Buffer`, so bundling it for the browser throws on load and takes the
   whole app down with it. Shipping the parsed result also keeps the raw text of
   unpublished drafts out of the JS bundle, where anyone could read it. */

const VIRTUAL_ID = 'virtual:blog-content';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, 'src', 'content', 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BLOG_ASSET_DIR = path.join(PUBLIC_DIR, 'blog');

const IMAGE_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif', '.gif']);
const SIZE_WARN_BYTES = 400 * 1024;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function postFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => path.join(POSTS_DIR, f));
}

/** Measure every image under public/blog, keyed by the public path a markdown
 *  file would reference it by. Warns rather than fails on heavy or unreadable
 *  files — a slow image should not block a deploy. */
export function measureBlogImages(warn: (msg: string) => void = console.warn): ImageSizes {
  const sizes: ImageSizes = {};
  for (const file of walk(BLOG_ASSET_DIR)) {
    if (!IMAGE_EXT.has(path.extname(file).toLowerCase())) continue;
    const publicPath = `/${path.relative(PUBLIC_DIR, file).split(path.sep).join('/')}`;
    const bytes = fs.statSync(file).size;
    if (bytes > SIZE_WARN_BYTES) {
      warn(`[blog] ${publicPath} is ${Math.round(bytes / 1024)}KB — aim for under 400KB (WebP, ~1600px wide).`);
    }
    try {
      const { width, height } = imageSize(fs.readFileSync(file));
      if (width && height) sizes[publicPath] = { width, height, bytes };
      else warn(`[blog] could not read the dimensions of ${publicPath}.`);
    } catch {
      warn(`[blog] could not read the dimensions of ${publicPath}.`);
    }
  }
  return sizes;
}

/** Every post on disk, drafts included, so a malformed draft fails the build
 *  today rather than on the day someone publishes it. */
export function readAllPosts(sizes: ImageSizes = {}): Post[] {
  return postFiles()
    .map((file) => parsePost(file, fs.readFileSync(file, 'utf8'), sizes))
    .sort(byNewest);
}

export function readPublishedPosts(sizes: ImageSizes = {}): Post[] {
  return readAllPosts(sizes).filter((p) => p.status === 'published');
}

/** Routes to prerender: the fixed marketing and policy pages plus every blog
 *  route, derived from the content directory so a new .md file — or a new legal
 *  document — needs no config change. */
export function blogRoutes(): string[] {
  return [
    '/',
    '/pricing',
    '/features',
    ...FEATURE_CATEGORIES.map((c) => categoryHref(c.slug)),
    COMING_SOON_HREF,
    SCHEDULER_HREF,
    ...SOLUTIONS.map((s) => solutionHref(s.slug)),
    '/contact',
    '/waitlist',
    FAQ_HREF,
    ...LEGAL_DOCS.map((d) => legalHref(d.slug)),
    '/blog',
    ...CATEGORIES.map((c) => `/blog/category/${c.key}`),
    ...readPublishedPosts().map((p) => `/blog/${p.slug}`),
  ];
}

export function blogPlugin(): Plugin {
  let module = 'export const posts = [];';

  const rebuild = (warn: (msg: string) => void) => {
    const sizes = measureBlogImages(warn);
    const posts = readAllPosts(sizes).filter((p) => p.status === 'published');

    // A local image that isn't on disk renders as a broken image with no
    // reserved space. Surface it rather than letting it ship silently.
    for (const post of posts) {
      const referenced = [...post.html.matchAll(/<img [^>]*src="(\/[^"]+)"/g)].map((m) => m[1]);
      if (post.cover?.startsWith('/')) referenced.push(post.cover);
      for (const src of referenced) {
        if (!sizes[src]) warn(`[blog] ${post.slug}.md references ${src}, which is not a readable image under public/.`);
      }
    }

    module = `export const posts = ${JSON.stringify(posts)};`;
    return posts;
  };

  return {
    name: 'harvest-blog',

    buildStart() {
      rebuild((msg) => this.warn(msg));
      // Keep the content directory in the watch graph so `vite dev` reacts to a
      // new or edited post even though nothing imports the .md files directly.
      for (const file of postFiles()) this.addWatchFile(file);
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null;
    },

    load(id) {
      return id === RESOLVED_VIRTUAL_ID ? module : null;
    },

    // Editing or adding a post in dev re-reads the content directory and
    // reloads the page.
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(POSTS_DIR) && !file.startsWith(BLOG_ASSET_DIR)) return;
      rebuild((msg) => server.config.logger.warn(msg));
      const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
