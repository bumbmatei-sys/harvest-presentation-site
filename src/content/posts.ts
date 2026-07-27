import { posts } from 'virtual:blog-content';
import type { Post } from './post-core';
import type { CategoryKey } from './categories';

/* Posts are markdown files in ./posts, read and rendered at build time by
   build/blog-plugin.ts and handed over through a virtual module. Adding a .md
   file is the whole publishing workflow — nothing here is hardcoded, so a new
   post needs no code change.

   Parsing deliberately does not happen here: gray-matter is a Node library and
   throws in a browser, and shipping raw markdown would also put the text of
   unpublished drafts into the JS bundle where anyone could read it. Only
   published posts, already rendered, cross this line. */

export const POSTS: readonly Post[] = posts;

export const POST_SLUGS: readonly string[] = POSTS.map((p) => p.slug);

export function postBySlug(slug: string | undefined): Post | undefined {
  return slug ? POSTS.find((p) => p.slug === slug) : undefined;
}

export function postsByCategory(key: string): Post[] {
  return POSTS.filter((p) => p.category === key);
}

/** Categories that actually have a published post behind them. */
export function usedCategories(): CategoryKey[] {
  return [...new Set(POSTS.map((p) => p.category))];
}

/** Up to `limit` other posts from the same category, newest first. */
export function relatedPosts(post: Post, limit = 3): Post[] {
  return POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, limit);
}

export type { Post };
