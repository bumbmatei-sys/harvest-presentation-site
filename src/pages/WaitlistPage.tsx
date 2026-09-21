import React from 'react';
import { Seo } from '../components/Seo';
import { Clouds, Reveal } from '../components/effects';
import { Particles, AnimatedText } from '../components/magic';
import { Kicker, container, SKY } from '../components/shared';
import { LeadCaptureForm, WAITLIST_LEAD_COPY } from '../components/LeadCaptureForm';

/* /waitlist — Alternate A microcopy (early interest / waitlist tone).
   Shares LeadCaptureForm with the homepage band. Posts to /api/waitlist →
   product_updates. Not a church newsletter surface. */

export function WaitlistPage() {
  return (
    <main>
      <Seo
        title="Join the Harvest waitlist"
        description="Be first to hear when new Harvest plans and features open — product news only, not member email."
        canonical="https://theharvest.site/waitlist"
      />
      <section style={{ position: 'relative', background: SKY, paddingTop: 150, paddingBottom: 90, overflow: 'hidden' }}>
        <Clouds dense />
        <Particles quantity={40} />
        <div style={{ ...container, position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Reveal y={14}><Kicker>Early interest</Kicker></Reveal>
          <AnimatedText
            as="h1"
            text={WAITLIST_LEAD_COPY.headline}
            startOnView={false}
            delay={100}
            stagger={80}
            y={20}
            duration={760}
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 500,
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1.05, letterSpacing: '-0.03em',
              color: 'var(--navy-900)', margin: '20px auto 0', maxWidth: 720,
            }}
          />
          <Reveal delay={360} y={16}>
            <p style={{
              fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 520,
              margin: '18px auto 0', lineHeight: 1.6, opacity: 0.85,
            }}>
              {WAITLIST_LEAD_COPY.subcopy}
            </p>
          </Reveal>
        </div>
      </section>

      <section style={{ background: 'var(--cream)', padding: '0 20px var(--section-y-tight)', position: 'relative', zIndex: 2 }}>
        <Reveal y={24} style={{ maxWidth: 560, margin: '-20px auto 0' }}>
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
