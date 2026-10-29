import React from 'react';
import { StoryCard } from './marketing';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { Kicker, H2, Checklist, softCard } from './shared';

function AnalyticsCard() {
  return (
    <div style={{ ...softCard, padding: 22 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--navy-900)', fontWeight: 500, marginBottom: 4 }}>Growth</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Keep 100% of every gift</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ flex: 1, background: 'var(--gold-100)', borderRadius: 14, padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--gold-700)', fontWeight: 600 }}>This year</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--navy-900)' }}>$182k</div></div>
        <div style={{ flex: 1, background: 'var(--sky-100)', borderRadius: 14, padding: '14px 16px' }}><div style={{ fontSize: 11, color: 'var(--sky-700)', fontWeight: 600 }}>Platform fee</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--navy-900)' }}>0%</div></div>
      </div>
      <svg viewBox="0 0 300 90" style={{ width: '100%', height: 90, display: 'block' }} preserveAspectRatio="none">
        <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="color-mix(in srgb, var(--green-500) 28%, transparent)" /><stop offset="1" stopColor="transparent" /></linearGradient></defs>
        <path d="M0 78 C50 70 70 50 110 46 C150 42 170 30 210 22 C250 14 275 12 300 8 L300 90 L0 90 Z" fill="url(#ag)" />
        <path d="M0 78 C50 70 70 50 110 46 C150 42 170 30 210 22 C250 14 275 12 300 8" fill="none" stroke="var(--green-500)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Analytics() {
  return (
    <section className="marketing-section">
      <div className="fab-container"><Reveal><StoryCard scene="why-2-wheat-sunset" visual={<AnalyticsCard />} reverse>
          <div>
            <Kicker align="left" color="var(--green-600)">Giving</Kicker>
            <H2 align="left" style={{ marginTop: 14 }}>{'Fund the Work.\nKeep Every Gift.'}</H2>
            <Reveal delay={140}>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-body)', lineHeight: 1.6, margin: '18px 0 26px', maxWidth: 480 }}>
                Donations, campaigns and pledges go straight to your own accounts. Harvest takes 0% of every donation.
              </p>
              <Checklist size="md" items={['Donations, campaigns and pledges', 'Giving statements and Giving records', 'One record for every donor and member']} />
              <div style={{ marginTop: 26 }}><HBtn to="/features/giving-finance" variant="dark">See giving</HBtn></div>
            </Reveal>
          </div>
      </StoryCard></Reveal></div>
    </section>
  );
}
