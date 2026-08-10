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
import { FeaturesRedirect } from './pages/FeaturesRedirect';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { CATEGORIES, categoryHref } from './content/features';
import { LEGAL_DOCS, legalHref } from './content/legal';
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
      { path: '/contact', element: <ContactPage /> },
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
      { path: '*', element: <Landing /> },
    ],
  },
];
