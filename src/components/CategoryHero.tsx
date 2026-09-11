import React from 'react';
import { Reveal } from './effects';
import { AnimatedText, HBtn } from './magic';

/* Shared hero + navy positioning band — extracted out of pages/CategoryPage.tsx
   (THE-Solutions-Evangelistic-Organizations, board card 86bbyv8pp) so the new
   /solutions/evangelistic-organizations page can reuse the exact same look
   without duplicating the markup.

   ⚠️ THE FIVE CATEGORY PAGES MUST RENDER BYTE-IDENTICAL AFTER THIS MOVE. `Hero`
   below is the same JSX CategoryPage.tsx used to define inline, generalised
   from `cat: Category` to plain props — CategoryPage passes the very same
   values it always did, so nothing in the five prerendered pages changes.
   src/test/the-278-no-regression.test.ts pins all five and is the proof. */

export const grainOverlay: React.CSSProperties = {
  position: 'absolute', inset: 0, backgroundImage: 'var(--grain-url)', backgroundSize: '200px',
  opacity: 0.06, mixBlendMode: 'overlay', pointerEvents: 'none',
};

export interface HeroCta { label: string; to: string }

export function Hero({
  dark, heroBg, headWidth, eyebrowColor, eyebrow, headline, introWidth, intro, secondary, audience,
}: {
  dark?: boolean;
  heroBg: string;
  headWidth: number;
  eyebrowColor: string;
  eyebrow: string;
  /** Newlines are rendered as line breaks. */
  headline: string;
  introWidth: number;
  intro: string;
  secondary: HeroCta;
  /** Optional line under the buttons — the Solutions page's audience line. */
  audience?: string;
}) {
  return (
    <section
      style={{
        position: 'relative', background: heroBg, overflow: 'hidden',
        paddingLeft: 24, paddingRight: 24,
        paddingTop: dark ? 'clamp(148px, calc(8vw + 84px), 188px)' : 'clamp(144px, calc(7vw + 84px), 180px)',
        paddingBottom: dark ? 'clamp(72px, 9vw, 110px)' : 'clamp(40px, 5vw, 64px)',
      }}
    >
      {dark && <div style={{ ...grainOverlay, opacity: 0.07 }} />}
      {dark && (
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 520, height: 420, background: 'radial-gradient(circle, rgba(229,182,92,0.22), transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      )}
      <div style={{ position: 'relative', maxWidth: headWidth, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={14}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: eyebrowColor }}>{eyebrow}</span>
        </Reveal>
        <AnimatedText
          as="h1"
          text={headline}
          startOnView={false}
          delay={120}
          stagger={80}
          y={20}
          duration={780}
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.04, letterSpacing: '-0.025em', color: dark ? '#fff' : 'var(--navy-900)',
            margin: '18px 0 0', textWrap: 'balance',
          } as React.CSSProperties}
        />
        <Reveal delay={420} y={16}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.02rem, 1.5vw, 1.2rem)', lineHeight: 1.6, color: dark ? 'rgba(255,255,255,0.72)' : 'var(--text-body)', margin: '20px auto 0', maxWidth: introWidth }}>{intro}</p>
        </Reveal>
        <Reveal delay={560} y={16}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
            <HBtn to="/#pricing" size="lg" variant={dark ? 'gold' : 'dark'}>Start free trial</HBtn>
            <HBtn to={secondary.to} size="lg" variant="light">{secondary.label}</HBtn>
          </div>
        </Reveal>
        {audience && (
          <Reveal delay={640} y={12}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, color: dark ? 'rgba(255,255,255,0.58)' : 'var(--text-muted)', margin: '18px 0 0' }}>{audience}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function PositioningBand({ kicker, kickerColor, heading, body }:
  { kicker: string; kickerColor: string; heading: string; body: string }) {
  return (
    <section style={{ position: 'relative', background: 'var(--navy-900)', padding: 'clamp(52px, 6vw, 80px) 24px', overflow: 'hidden' }}>
      <div style={grainOverlay} />
      <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
        <Reveal y={16}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: kickerColor }}>{kicker}</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', lineHeight: 1.12, letterSpacing: '-0.02em', color: '#fff', margin: '14px 0 0', textWrap: 'balance' } as React.CSSProperties}>{heading}</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1rem, 1.4vw, 1.12rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.66)', margin: '18px auto 0', maxWidth: 600 }}>{body}</p>
        </Reveal>
      </div>
    </section>
  );
}
