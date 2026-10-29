import React from 'react';
import { Hero } from '../components/Hero';
import { Sync } from '../components/Sync';
import { Community } from '../components/Community';
import { Analytics } from '../components/Analytics';
import { Features } from '../components/Features';
import { Replaces } from '../components/Replaces';
import { CHEAPEST_MONTHLY, Pricing, plans } from '../components/Pricing';
import { softwareSchema } from '../lib/structured-data';
import { Affiliate } from '../components/Affiliate';
import { AFFILIATE_PROGRAM_ENABLED } from '../lib/flags';
import { FinalCTA } from '../components/FinalCTA';
import { LeadCaptureBand } from '../components/LeadCaptureForm';
import { Seo } from '../components/Seo';

export function Landing() {
  return (
    <main>
      {/* /pricing renders this same page, so it self-canonicals to / rather than
          competing with the homepage for the same content. */}
      <Seo
        title="The Harvest — From Conversion to Devotion"
        description={`One app for churches, evangelistic organisations and ministries: community, courses, giving, AI and livestream. From $${CHEAPEST_MONTHLY}/mo.`}
        canonical="https://theharvest.site/"
        jsonLd={softwareSchema(plans)}
      />
      <Hero />
      <Sync />
      <Community />
      <Analytics />
      <Features />
      <Replaces />
      <Pricing />
      {AFFILIATE_PROGRAM_ENABLED && <Affiliate />}
      <LeadCaptureBand />
      <FinalCTA />
    </main>
  );
}
