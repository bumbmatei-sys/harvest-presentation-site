import React, { useEffect } from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { PillarsSection } from './components/PillarsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { BelieversSection } from './components/BelieversSection';
import { PricingSection } from './components/PricingSection';
import { WhatHarvestReplaces } from './components/WhatHarvestReplaces';
import { AffiliateSection } from './components/AffiliateSection';
import { FinalCTA, Footer } from './components/FinalCTA';

const App: React.FC = () => {
  // The affiliate link lands on /pricing (served by the SPA via a Vercel
  // rewrite) — scroll the pricing section into view on arrival.
  useEffect(() => {
    if (window.location.pathname === '/pricing') {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="bg-cream">
      <Nav />
      <main>
        <Hero />
        <ProblemSection />
        <PillarsSection />
        <FeaturesSection />
        <BelieversSection />
        <WhatHarvestReplaces />
        <PricingSection />
        <AffiliateSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
