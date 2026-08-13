import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/* Test-runner config, deliberately SEPARATE from vite.config.ts.
 *
 * Vitest reads vite.config.ts when no vitest config exists, which would run the
 * blog plugin and the vite-react-ssg options on every test run. Keeping the two
 * files apart means the build config is untouched by the test setup: `npm run
 * build` still resolves vite.config.ts and nothing else, so adding a runner
 * cannot move the prerendered page count.
 *
 * No plugins are needed. esbuild reads `jsx: react-jsx` straight out of
 * tsconfig.json, so the .tsx modules that export plan data still compile.
 *
 * Mostly the tests import data and pure functions. The exception is the pricing
 * card, which is server-rendered with `renderToStaticMarkup` — the same render
 * the site is prerendered with, needing no DOM and no new dependency — because
 * the price a card prints and the billing term its button sells are two facts
 * that only ever have to agree in the rendered markup. See Pricing.test.ts. */
export default defineConfig({
  resolve: {
    // `virtual:blog-content` only exists inside a Vite build, where the blog
    // plugin serves it. Aliasing it to an empty stub is what lets a test import
    // App.tsx and read the real route table — without it the import fails on
    // content/posts.ts, and the routes could only be asserted by re-declaring
    // them in the test, which would assert nothing.
    alias: {
      'virtual:blog-content': fileURLToPath(new URL('./src/test/blog-content-stub.ts', import.meta.url)),
    },
  },
  test: {
    // No jsdom / happy-dom. `lib/ref.ts` touches `window` and `sessionStorage`,
    // but it reads two properties off each, which a stub covers — see
    // src/lib/ref.test.ts. A DOM implementation would be a large dependency
    // tree bought for nothing.
    environment: 'node',
    // Co-located with the source they cover. `.test.ts` only — the one test
    // that renders does so through `React.createElement`, so no file here needs
    // JSX of its own.
    include: ['src/**/*.test.ts'],
  },
});
