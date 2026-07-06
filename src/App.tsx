import React, { useEffect } from 'react';
import { ScrollProgress, ProgressiveBlur } from './components/magic';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Sync } from './components/Sync';
import { Community } from './components/Community';
import { Analytics } from './components/Analytics';
import { Features } from './components/Features';
import { Replaces } from './components/Replaces';
import { Pricing } from './components/Pricing';
import { Affiliate } from './components/Affiliate';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  // The affiliate link path is /pricing (served the SPA via a Vercel rewrite).
  // Scroll the pricing section into view when arriving on that path.
  useEffect(() => {
    if (window.location.pathname === '/pricing') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Sync />
        <Community />
        <Analytics />
        <Features />
        <Replaces />
        <Pricing />
        <Affiliate />
        <FinalCTA />
      </main>
      <Footer />
      <ProgressiveBlur />
    </>
  );
};

export default App;
