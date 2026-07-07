import React from 'react';
import { Hero } from '../components/Hero';
import { Sync } from '../components/Sync';
import { Community } from '../components/Community';
import { Analytics } from '../components/Analytics';
import { Features } from '../components/Features';
import { Replaces } from '../components/Replaces';
import { Pricing } from '../components/Pricing';
import { Affiliate } from '../components/Affiliate';
import { FinalCTA } from '../components/FinalCTA';
import { useMeta } from '../lib/meta';

export function Landing() {
  useMeta({
    title: 'Harvest — From Conversion to Devotion',
    description: 'Ministry platform for churches — AI, CRM, SMS, Livestream, Check-In, and more. From $59/mo.',
    url: 'https://theharvest.site/',
  });
  return (
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
  );
}
