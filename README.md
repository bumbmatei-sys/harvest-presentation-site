<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/240291f1-0209-42a5-b1e6-55d05d8c2bc5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## SEO and indexing

`npm run build` prerenders the routes from `blogRoutes()` and then runs the
`ssgOptions.onFinished` hook in `build/seo.ts`. The hook reads each final HTML
head, checks titles, descriptions, canonical URLs and social metadata, and writes
`dist/sitemap-index.xml`, `dist/sitemap.xml`, `dist/robots.txt` and `dist/llms.txt`.
`public/sitemap.xsl` styles both sitemap documents in browsers that support XSLT.
`llms.txt` includes page metadata, visible FAQ answers and published article
excerpts. Drafts, error/preview paths, noindex pages and noncanonical aliases are
excluded. `/pricing` renders the homepage and canonicals to `/`; `/features`
forwards to category pages and carries `noindex`. The site is English only, so
there are no hreflang alternates.

`Seo` emits Open Graph, social cards, a canonical, a describedby link to
`/llms.txt` and JSON-LD for Organization, WebSite and WebPage. Blog posts add
Article, `/faq` adds FAQPage, and the homepage pricing section (also rendered at
`/pricing`) adds SoftwareApplication offers from the real plan records. The HTML
describedby link is present; a real HTTP `Link: </llms.txt>; rel="describedby"`
header requires host configuration and is listed in `SEO-RESULT.md` for Matei.

### IndexNow (manual, opt-in)

Choose an IndexNow key of 8–128 letters, numbers or hyphens. Set `INDEXNOW_KEY`
in the build environment, then build and deploy through the normal release
process. The post-build hook creates `dist/<key>.txt` containing exactly the key
only when that variable is set. No key is stored under `public/` or committed.
Check that `https://theharvest.site/<key>.txt` serves the key before submitting.
Keep the same value in the environment where you run the submission script.

- `npm run indexnow` reads the **live** sitemap index and all child sitemaps,
  then POSTs every discovered canonical URL to IndexNow in batches of 10,000.
- `npm run indexnow -- /blog/example-post https://theharvest.site/faq` submits
  only the explicit URLs. Paths and absolute URLs must belong to the live site
  and have no query strings or fragments.

Submission is never part of builds, tests or deployment hooks. Missing/invalid
keys fail before any network request. Tests use mocked fetch calls only.

Validate with `npx tsc --noEmit`,
`npx vitest run src/test/seo-indexing.test.ts src/test/the-278-no-regression.test.ts src/test/the-278-tailwind-shadcn.test.ts`,
and `npm run build`. Run the tests again after building to exercise dist checks.
