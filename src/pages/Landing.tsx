import React from 'react';
import { Hero } from '../components/Hero';
import { Sync } from '../components/Sync';
import { Community } from '../components/Community';
import { Analytics } from '../components/Analytics';
import { Features } from '../components/Features';
import { Replaces } from '../components/Replaces';
import { Pricing } from '../components/Pricing';
import { Affiliate } from '../components/Affiliate';
import { AFFILIATE_PROGRAM_ENABLED } from '../lib/flags';
import { FinalCTA } from '../components/FinalCTA';
import { Seo } from '../components/Seo';

export function Landing() {
  return (
    <main>
      {/* /pricing renders this same page, so it self-canonicals to / rather than
          competing with the homepage for the same content. */}
      <Seo
        title="Harvest — From Conversion to Devotion"
        description="Ministry platform for churches — AI, CRM, SMS, Livestream, Check-In, and more. From $49/mo."
        canonical="https://theharvest.site/"
      />
      <Hero />
      <Sync />
      <Community />
      <Analytics />
      <Features />
      <Replaces />
      <Pricing />
      {AFFILIATE_PROGRAM_ENABLED && <Affiliate />}
      <FinalCTA />
    </main>
  );
}
