import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ScrollProgress, ProgressiveBlur } from './components/magic';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { ScrollManager } from './components/ScrollManager';
import { Landing } from './pages/Landing';
import { FeaturesPage } from './pages/FeaturesPage';
import { ContactPage } from './pages/ContactPage';

// Shared app shell — fixed nav + footer + global scroll/blur chrome wrap every route.
function Layout() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <Outlet />
      <Footer />
      <ProgressiveBlur />
    </>
  );
}

const App: React.FC = () => (
  <BrowserRouter>
    <Analytics />
    <ScrollManager />
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        {/* Affiliate deep-link path (Vercel rewrites /pricing → index.html); ScrollManager scrolls to #pricing. */}
        <Route path="/pricing" element={<Landing />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Landing />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
