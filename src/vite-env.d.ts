/// <reference types="vite/client" />

/** Published posts, parsed and rendered at build time by build/blog-plugin.ts.
 *  Markdown parsing runs in Node and never reaches the browser bundle. */
declare module 'virtual:blog-content' {
  import type { Post } from './content/post-core';
  export const posts: Post[];
}
