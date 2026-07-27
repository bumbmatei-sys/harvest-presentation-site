import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Type-only import: augments Vite's UserConfig with `ssgOptions`.
import type {} from 'vite-react-ssg';

export default defineConfig({
  plugins: [react()],
  // Absolute base. A relative base ('./') resolves assets against the current URL
  // depth, which happens to work for a flat SPA but breaks nested prerendered
  // routes (e.g. /blog/some-post/) where the HTML lives one directory deeper.
  base: '/',
  ssgOptions: {
    // /features → dist/features/index.html rather than dist/features.html, so the
    // file layout matches the URL structure at any depth.
    dirStyle: 'nested',
    // The router's `*` catch-all must not be crawled into a literal path — list
    // the real pages explicitly instead.
    includedRoutes: () => ['/', '/pricing', '/features', '/contact'],
  },
});
