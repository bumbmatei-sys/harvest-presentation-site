import type { Post } from '../content/post-core';

/* Test-only stand-in for `virtual:blog-content`.
 *
 * The real module is produced by build/blog-plugin.ts during a Vite build, so
 * anything importing it — content/posts.ts, and therefore App.tsx — cannot be
 * imported by the test runner, which has no Vite plugin pipeline (see the note
 * in vitest.config.ts about keeping the two configs apart).
 *
 * An empty list is the right stub: the only test that reaches App.tsx checks the
 * route table, and the blog routes there are static paths and one `:slug`
 * pattern. No test asserts on post content through this module — the blog's own
 * data is covered by parsing the markdown directly. */
export const posts: Post[] = [];
