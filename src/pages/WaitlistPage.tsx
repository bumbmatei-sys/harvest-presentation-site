import React from 'react';
import { PageHeader } from '../components/marketing';
import { Seo } from '../components/Seo';
import { Reveal } from '../components/effects';

import { LeadCaptureForm, WAITLIST_LEAD_COPY } from '../components/LeadCaptureForm';

/* /waitlist — Alternate A microcopy (early interest / waitlist tone).
   Shares LeadCaptureForm with the homepage band. Posts to /api/waitlist →
   product_updates. Not a church newsletter surface. */

export function WaitlistPage() {
  return (
    <main className="marketing-page marketing-form-page">
      <Seo
        title="Join the Harvest waitlist"
        description="Product news from Harvest when new features open. Never member email."
        canonical="https://theharvest.site/waitlist"
      />
      <PageHeader eyebrow="Early interest" title="Hear It First" description="Product news from Harvest when new features open. Never member email." />

      <section className="fab-container marketing-page-content">
        <Reveal y={24} className="marketing-form-wrap">
          <LeadCaptureForm
            source="waitlist"
            copy={WAITLIST_LEAD_COPY}
            idPrefix="waitlist"
          />
        </Reveal>
      </section>
    </main>
  );
}
