import React from 'react';
import { appSignupUrl } from '../lib/ref';
import { ParallaxLayer, Reveal } from './effects';
import { HBtn } from './magic';
import { Kicker, H2, Checklist, container, softCard } from './shared';

function AnalyticsCard() {
  return (
    <div style={{ ...softCard, padding: 22 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--navy-900)', fontWeight: 500, marginBottom: 4 }}>Growth</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Donation retention climbs with every tier</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, background: 'var(--gold-100)', borderRadius: 14, padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--gold-700)', fontWeight: 600 }}>This year</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--navy-900)' }}>$182k</div></div>
        <div style={{ flex: 1, background: 'var(--sky-100)', borderRadius: 14, padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--sky-700)', fontWeight: 600 }}>Retention</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--navy-900)' }}>100%</div></div>
      </div>
      <svg viewBox="0 0 300 90" style={{ width: '100%', height: 90, display: 'block' }} preserveAspectRatio="none">
        <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(110,142,82,0.28)" /><stop offset="1" stopColor="rgba(110,142,82,0)" /></linearGradient></defs>
        <path d="M0 78 C50 70 70 50 110 46 C150 42 170 30 210 22 C250 14 275 12 300 8 L300 90 L0 90 Z" fill="url(#ag)" />
        <path d="M0 78 C50 70 70 50 110 46 C150 42 170 30 210 22 C250 14 275 12 300 8" fill="none" stroke="var(--green-500)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Analytics() {
  return (
    <section style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="split-grid">
          <div>
            <Kicker align="left" color="var(--green-600)">Financial management</Kicker>
            <H2 align="left" style={{ marginTop: 14 }}>See real discipleship happen</H2>
            <Reveal delay={140}>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-body)', lineHeight: 1.6, margin: '18px 0 26px', maxWidth: 480 }}>
                Giving, courses and engagement in one place. Track growth, measure discipleship, and keep more of every gift — retention climbs from 90% to 100%.
              </p>
              <Checklist size="md" items={['Donations, fundraising & tax receipts', 'Course progress & engagement analytics', 'CRM for donors and members']} />
              <div style={{ marginTop: 26 }}><HBtn href={appSignupUrl()} variant="dark">See the dashboard</HBtn></div>
            </Reveal>
          </div>
          <ParallaxLayer speed={0.06} style={{ order: 2 }}><Reveal delay={100}><AnalyticsCard /></Reveal></ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
