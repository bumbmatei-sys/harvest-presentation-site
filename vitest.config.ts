import { defineConfig } from 'vitest/config';

/* Test-runner config, deliberately SEPARATE from vite.config.ts.
 *
 * Vitest reads vite.config.ts when no vitest config exists, which would run the
 * blog plugin and the vite-react-ssg options on every test run. Keeping the two
 * files apart means the build config is untouched by the test setup: `npm run
 * build` still resolves vite.config.ts and nothing else, so adding a runner
 * cannot move the prerendered page count.
 *
 * No plugins are needed. Nothing here renders a component — the tests import
 * data and pure functions — and esbuild reads `jsx: react-jsx` straight out of
 * tsconfig.json, so the .tsx modules that export plan data still compile. */
export default defineConfig({
  test: {
    // No jsdom / happy-dom. `lib/ref.ts` touches `window` and `sessionStorage`,
    // but it reads two properties off each, which a stub covers — see
    // src/lib/ref.test.ts. A DOM implementation would be a large dependency
    // tree bought for nothing.
    environment: 'node',
    // Co-located with the source they cover. `.test.ts` only: a `.test.tsx`
    // would mean a rendered component, which this suite does not do.
    include: ['src/**/*.test.ts'],
  },
});
