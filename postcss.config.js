// Tailwind v4 ships its PostCSS plugin in a package of its own; the
// `tailwindcss` package is no longer a PostCSS plugin at all.
//
// ⚠️ `autoprefixer` is deliberately gone rather than merely unused, and the
// same call was made in the app repo. v4 runs the output through Lightning CSS,
// which does the vendor prefixing against the project's browserslist; leaving
// autoprefixer in the chain would re-prefix already-prefixed declarations, and
// the v4 upgrade guide's own instruction is to remove it.
//
// MEASURED on this repo rather than assumed: against the pre-Tailwind build,
// dropping autoprefixer costs exactly three declarations across the whole
// stylesheet — `-o-object-fit` twice and `-moz-column-gap` once. Both target
// browsers (Opera ≤12, Firefox ≤51) that predate every browser in the site's
// support range, and neither has a rendering effect in any engine shipping
// today. Nothing else in the 400 hand-written lines changes.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
