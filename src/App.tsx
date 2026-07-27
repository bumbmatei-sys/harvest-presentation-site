import React from 'react';
import { Outlet } from 'react-router-dom';
import type { RouteRecord } from 'vite-react-ssg';
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress, ProgressiveBlur } from './components/magic';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { ScrollManager } from './components/ScrollManager';
import { Landing } from './pages/Landing';
import { FeaturesPage } from './pages/FeaturesPage';
import { ContactPage } from './pages/ContactPage';
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
      { path: '/features', element: <FeaturesPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/blog', element: <BlogIndex /> },
      // Ahead of /blog/:slug for readability — react-router already ranks the
      // static "category" segment above the dynamic one.
      { path: '/blog/category/:key', element: <BlogCategory /> },
      { path: '/blog/:slug', element: <BlogPost /> },
      { path: '*', element: <Landing /> },
    ],
  },
];
