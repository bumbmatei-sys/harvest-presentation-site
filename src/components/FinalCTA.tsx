import React from 'react';
import { appSignupUrl } from '../lib/ref';
import { Clouds, Reveal } from './effects';
import { HBtn } from './magic';
import { Mark, H2, container, SKY } from './shared';

export function FinalCTA() {
  return (
    <section style={{ position: 'relative', background: SKY, padding: 'var(--section-y) 0', textAlign: 'center', overflow: 'hidden' }}>
      <Clouds dense />
      <div style={{ ...container, position: 'relative', zIndex: 2, maxWidth: 720 }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}><Mark h={62} /></div>
        </Reveal>
        <H2 style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Ready to get started?</H2>
        <Reveal delay={160}>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', margin: '18px auto 32px', maxWidth: 460, opacity: 0.85 }}>Start your ministry platform today — your community is waiting.</p>
          <HBtn href={appSignupUrl()} size="lg" variant="gold">Access Harvest</HBtn>
        </Reveal>
      </div>
    </section>
  );
}
