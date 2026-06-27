import React from 'react';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { PillarsSection } from './components/PillarsSection';
import { FeaturesSection } from './components/FeaturesSection';
import { BelieversSection } from './components/BelieversSection';
import { PricingSection } from './components/PricingSection';
import { WhatHarvestReplaces } from './components/WhatHarvestReplaces';
import { AffiliateSection } from './components/AffiliateSection';
import { AiAssistantProductCard } from './components/AiAssistantProductCard';
import { FinalCTA, Footer } from './components/FinalCTA';

const App: React.FC = () => {
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
        <AiAssistantProductCard />
        <AffiliateSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default App;
