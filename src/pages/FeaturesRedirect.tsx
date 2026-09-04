import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { ContentSection, categoryItem } from '../components/content-3';
import { CATEGORIES, LEGACY_ANCHORS, categoryHref } from '../content/features';

/* /features used to be a single page listing every tool. It is now five category
   pages, so this route only forwards: an old deep link like /features#groups
   lands on the section that feature moved to, and a bare /features goes to the
   first category. Kept as a route (rather than a host redirect) because the
   fragment never reaches the server — the mapping has to happen in the browser.

   The rendered body is the no-JS fallback: a plain list of the five pages.

   🔴 THE-301 — THE FALLBACK IS NOW A TAILARK BLOCK, and the reason is that it
   was the thinnest thing on the site. It was an <h1>, one sentence, and five
   unlabelled pills; it built to 11.34 KiB against 80–128 KiB for every other
   page, and the reader it exists for — no JavaScript, or a crawler following
   the noindex,follow — got five names and nothing to choose between them. The
   block is `veil-content-3`, re-tokenised onto this site's ramps; the whole of
   why, and what each of Tailark's four colour references became, is in the head
   of components/content-3.tsx.

   ⚠️ THE REDIRECT IS UNTOUCHED. <Navigate> still runs first and still forwards
   on the same LEGACY_ANCHORS mapping, the Head block still says
   noindex,follow, and the canonical still points at the first category. Only
   what renders underneath changed — and it changed from five links to the same
   five links with the catalogue's own description under each. */

export function FeaturesRedirect() {
  const { hash } = useLocation();
  const key = hash ? decodeURIComponent(hash.slice(1)) : '';
  const target = LEGACY_ANCHORS[key] || categoryHref(CATEGORIES[0].slug);

  return (
    <main>
      <Head>
        <title>Features — Harvest</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`https://theharvest.site${categoryHref(CATEGORIES[0].slug)}`} />
      </Head>
      <Navigate to={target} replace />
      {/* Clears the fixed nav. The block sets its own vertical rhythm from
          --section-y; what it cannot know is that 110px of this page is behind
          a fixed header. */}
      <div style={{ background: 'var(--cream)', paddingTop: 'clamp(112px, 13vw, 150px)' }}>
        <ContentSection
          headingAs="h1"
          heading="Features"
          standfirst="Every tool now lives on its own page."
          items={CATEGORIES.map(categoryItem)}
        />
      </div>
    </main>
  );
}
