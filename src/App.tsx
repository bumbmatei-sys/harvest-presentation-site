import React from 'react';
import { Outlet } from 'react-router-dom';
import type { RouteRecord } from 'vite-react-ssg';
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress, ProgressiveBlur } from './components/magic';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { ScrollManager } from './components/ScrollManager';
import { Landing } from './pages/Landing';
import { CategoryPage } from './pages/CategoryPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { SchedulerPage } from './pages/SchedulerPage';
import { FeaturesRedirect } from './pages/FeaturesRedirect';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { FaqPage } from './pages/FaqPage';
import { CATEGORIES, categoryHref } from './content/features';
import { COMING_SOON_HREF, SCHEDULER_HREF } from './content/coming-soon';
import { LEGAL_DOCS, legalHref } from './content/legal';
import { FAQ_HREF } from './content/faq';
import { BlogIndex } from './pages/BlogIndex';
import { BlogCategory } from './pages/BlogCategory';
import { BlogPost } from './pages/BlogPost';

// Shared app shell — fixed nav + footer + global scroll/blur chrome wrap every route.
// Analytics and ScrollManager both render null; they live here so they stay mounted
// on every route now that the router is supplied by vite-react-ssg.
function Layout() {
  return (
    <>
      <Analytics />
      <ScrollManager />
      <ScrollProgress />
      <Nav />
      <Outlet />
      <Footer />
      <ProgressiveBlur />
    </>
  );
}

export const routes: RouteRecord[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      // Affiliate deep-link path; ScrollManager scrolls to #pricing.
      { path: '/pricing', element: <Landing /> },
      // One page per feature category. /features itself is now only a forwarder
      // for the retired single page and its anchors (see FeaturesRedirect).
      { path: '/features', element: <FeaturesRedirect /> },
      ...CATEGORIES.map((c) => ({
        path: categoryHref(c.slug),
        element: <CategoryPage slug={c.slug} />,
      })),
      // The sixth category, and the only one that is not a CategoryPage: its
      // content is not in CATEGORIES because a `Feature` carries `tiers` and an
      // unbuilt item has no tier to carry. See src/pages/ComingSoonPage.tsx.
      { path: COMING_SOON_HREF, element: <ComingSoonPage /> },
      { path: '/contact', element: <ContactPage /> },
      // The buyer's FAQ. Its own route rather than a landing anchor: the value
      // is the indexed page and its FAQPage markup, which needs a URL.
      { path: FAQ_HREF, element: <FaqPage /> },
      // /terms, /privacy and /refunds. Derived from the document list for the
      // same reason the category pages are: the footer column, the prerender
      // list and the sitemap all read that list too, so a route cannot exist
      // without a page or ship without being prerendered.
      ...LEGAL_DOCS.map((d) => ({
        path: legalHref(d.slug),
        element: <LegalPage slug={d.slug} />,
      })),
      { path: '/blog', element: <BlogIndex /> },
      // Ahead of /blog/:slug for readability — react-router already ranks the
      // static "category" segment above the dynamic one.
      { path: '/blog/category/:key', element: <BlogCategory /> },
      { path: '/blog/:slug', element: <BlogPost /> },
      /* THE-284 — the one Coming Soon entry with a page of its own. Not a
         CategoryPage: a `Feature` carries `tiers` and this has no tier, and
         CategoryPage's hero and close both sell a trial. See the header comment
         in src/pages/SchedulerPage.tsx.

         🔴 APPENDED HERE RATHER THAN BESIDE COMING_SOON_HREF, WHERE IT READS
         BETTER, AND THE REASON IS NOT COSMETIC. React-router derives a route's
         id from its POSITION when none is given — `0-9`, `0-10` — and
         vite-react-ssg serialises those ids into every prerendered page as
         `window.__staticRouterHydrationData`. Inserting a route mid-table
         therefore renumbers every route after it and rewrites the markup of
         thirteen pages this ticket does not touch: /contact, /faq, the three
         policies and all seven blog pages each changed by a single digit.
         Appending leaves every existing id alone, so the only prerendered
         pages that move are the ones whose CONTENT actually moved. The
         catch-all below is renumbered and nothing is prerendered through it.

         ⚠️ SO ADD FUTURE ROUTES HERE TOO, above the catch-all. A route added
         in the middle is not wrong — it is a thirteen-page diff that hides the
         one page that really changed, which is the whole thing
         src/test/the-278-no-regression.test.ts exists to keep visible. */
      { path: SCHEDULER_HREF, element: <SchedulerPage /> },
      { path: '*', element: <Landing /> },
    ],
  },
];
