import React from 'react';
import { appSignupUrl } from '../lib/ref';
import { Clouds, Reveal } from './effects';
import { Particles, AnimatedText, HBtn, TiltIn, SafariFrame } from './magic';
import { I } from './icons';
import { Mark, container, SKY } from './shared';

function DashboardMock() {
  const stat = (icon: (p?: { size?: number }) => React.ReactElement, label: string, val: string, tint: string) => (
    <div style={{ flex: 1, background: '#fff', border: '1px solid rgba(45,37,25,0.06)', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tint }}>{icon({ size: 16 })}<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span></div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, color: 'var(--navy-900)', marginTop: 6 }}>{val}</div>
    </div>
  );
  const bars = [42, 58, 38, 66, 50, 74, 60, 82, 70];
  const items: [string, (p?: { size?: number }) => React.ReactElement, boolean][] = [
    ['Dashboard', I.dashboard, true], ['Community', I.community, false], ['Courses', I.courses, false],
    ['Members', I.crm, false], ['Giving', I.giving, false], ['Bible', I.bible, false],
  ];
  return (
    <div style={{ display: 'flex', minHeight: 380 }}>
      <div style={{ width: 182, background: 'var(--navy-900)', padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }} className="dash-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Mark h={24} /><span style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 16 }}>Harvest</span>
        </div>
        {items.map(([l, ic, on], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, background: on ? 'rgba(201,150,58,0.16)' : 'transparent', color: on ? 'var(--gold-400)' : 'rgba(255,255,255,0.55)', fontSize: 12.5, fontWeight: 500 }}>
            {ic({ size: 15 })}<span>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: 'var(--cream)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--navy-900)', fontWeight: 500 }}>Overview</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Your ministry at a glance</div>
          </div>
          <div style={{ background: 'var(--brand)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '7px 14px', borderRadius: 999 }}>New devotional</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {stat(I.community, 'Members', '2,480', 'var(--sky-600)')}
          {stat(I.analytics, 'Retention', '100%', 'var(--brand)')}
          {stat(I.courses, 'Active', '640', 'var(--green-600)')}
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.06)', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>Engagement this month</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 5, background: i === bars.length - 1 ? 'var(--brand)' : 'rgba(79,151,214,0.35)' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" style={{ position: 'relative', background: SKY, paddingTop: 150, paddingBottom: 90, overflow: 'hidden' }}>
      <Clouds dense />
      <Particles quantity={55} />
      <div style={{ ...container, position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Reveal y={14}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.9)', padding: '6px 14px 6px 8px', borderRadius: 999, boxShadow: '0 4px 14px rgba(45,37,25,0.06)' }}>
            <span style={{ background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 9px', borderRadius: 999 }}>NEW</span>
            <span style={{ fontSize: 13, color: 'var(--navy-800)', fontWeight: 500 }}>The digital foundation for ministries</span>
          </div>
        </Reveal>
        <AnimatedText
          as="h1"
          text={'Run your ministry\nlike never before'}
          startOnView={false}
          delay={220}
          stagger={90}
          y={22}
          duration={800}
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 500,
            fontSize: 'clamp(2.6rem, 6.2vw, 5rem)', lineHeight: 1.02, letterSpacing: '-0.03em',
            color: 'var(--navy-900)', margin: '26px auto 0', maxWidth: 900,
          }}
        />
        <Reveal delay={520} y={18}>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--navy-700)', maxWidth: 560, margin: '22px auto 0', lineHeight: 1.6, opacity: 0.85 }}>
            One branded platform for community, courses, giving and AI — turning a moment of decision into a lifetime of devotion.
          </p>
        </Reveal>
        <Reveal delay={680} y={18}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <HBtn href={appSignupUrl()} size="lg" variant="gold">Access Harvest</HBtn>
            <HBtn href="#pricing" size="lg" variant="light">See pricing</HBtn>
          </div>
        </Reveal>
      </div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '56px auto 0', padding: '0 28px' }}>
        <Reveal delay={820} y={54}>
          <TiltIn>
            <SafariFrame url="theharvest.app">
              <DashboardMock />
            </SafariFrame>
          </TiltIn>
        </Reveal>
      </div>
    </section>
  );
}
