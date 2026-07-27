import type { CategoryKey } from './categories';

/* Types and browser-safe helpers for blog content.
   Deliberately dependency-free: `gray-matter` is a Node library (it reaches for
   `Buffer`, which does not exist in a browser), so parsing lives in
   build/parse-post.ts and runs only at build time. Anything imported by a React
   component belongs in this file; anything that parses markdown does not. */

export const SITE_ORIGIN = 'https://theharvest.site';
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/logos/harvest-field.jpg`;

export type PostStatus = 'draft' | 'published';

export interface ImageMeta {
  width: number;
  height: number;
  bytes: number;
}

/** Public-path → intrinsic size, e.g. `/blog/my-post/cover.webp`. */
export type ImageSizes = Record<string, ImageMeta>;

export interface Post {
  slug: string;
  title: string;
  category: CategoryKey;
  status: PostStatus;
  /** `YYYY-MM-DD`. */
  publishDate: string;
  /** `YYYY-MM-DD`; falls back to publishDate. */
  updated: string;
  description: string;
  readingTime: string;
  /** Absolute path under /public, or a remote https URL. */
  cover?: string;
  coverAlt?: string;
  /** Intrinsic size of a local cover, when it could be measured at build time. */
  coverSize?: ImageMeta;
  /** Rendered markdown body. */
  html: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** `2026-08-04` → `August 4, 2026`.
 *  Deliberately string-based: `new Date(...).toLocaleDateString()` resolves in
 *  the runtime's timezone, so a UTC-midnight date renders as the previous day
 *  west of Greenwich — which would differ between the prerender and the
 *  browser and break hydration. */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

export function isRemote(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/** Local cover paths become absolute for og:image; remote ones pass through.
 *  A relative og:image silently produces no preview card on Twitter, LinkedIn
 *  or WhatsApp. */
export function absoluteImageUrl(src: string | undefined): string {
  if (!src) return DEFAULT_SOCIAL_IMAGE;
  return isRemote(src) ? src : `${SITE_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}

export function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.md$/, '');
}

/** Newest first, with the slug as a stable tiebreak for same-day posts. */
export function byNewest(a: Post, b: Post): number {
  return b.publishDate.localeCompare(a.publishDate) || a.slug.localeCompare(b.slug);
}
