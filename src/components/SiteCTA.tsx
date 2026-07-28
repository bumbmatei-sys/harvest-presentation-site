import React from 'react';
import { Clouds, Reveal } from './effects';
import { HBtn } from './magic';
import { Mark, H2, container, SKY } from './shared';

/* Closing CTA for the category pages — the design handoff's SiteCTA component.
   Same sky band and buttons as the landing's FinalCTA, with a per-page heading. */

export function SiteCTA({
  heading,
  tagline = 'From conversion to devotion.',
  primaryLabel = 'Start your FREE 7-day trial',
}: { heading: string; tagline?: string; primaryLabel?: string }) {
  return (
    <section style={{ position: 'relative', background: SKY, padding: 'clamp(64px, 9vw, 116px) 0', textAlign: 'center', overflow: 'hidden' }}>
      <Clouds dense />
      <div style={{ ...container, position: 'relative', zIndex: 2, maxWidth: 720 }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}><Mark h={60} /></div>
        </Reveal>
        <H2 style={{ fontSize: 'clamp(2.2rem, 4.6vw, 3.6rem)' }}>{heading}</H2>
        <Reveal delay={160}>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: '1.25rem', color: 'var(--gold-700)', margin: '16px auto 32px' }}>{tagline}</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
            <HBtn to="/#pricing" size="lg" variant="gold">{primaryLabel}</HBtn>
            <HBtn to="/#pricing" size="lg" variant="light">Compare plans</HBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
