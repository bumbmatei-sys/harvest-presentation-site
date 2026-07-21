import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { I, L } from './icons';
import { Kicker, H2, container, AV } from './shared';

function BentoCard({ icon, name, desc, children, span = 1, minH = 300, soon = false }:
  { icon: React.ReactNode; name: string; desc: string; children?: React.ReactNode; span?: number; minH?: number; soon?: boolean }) {
  return (
    <Link to="/features" className="bento" style={{
      gridColumn: `span ${span}`, width: '100%', display: 'flex', flexDirection: 'column',
      textDecoration: 'none', position: 'relative', overflow: 'hidden',
      background: '#fff', border: '1px solid rgba(45,37,25,0.07)', borderRadius: 28,
      boxShadow: '0 20px 50px rgba(45,37,25,0.07)', padding: 28, minHeight: minH, boxSizing: 'border-box',
    }}>
      {soon && <span style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, background: 'var(--sky-100)', color: 'var(--sky-700)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', padding: '4px 9px', borderRadius: 999 }}>SOON</span>}
      {children}
      <div className="bento-body" style={{ marginTop: 'auto', paddingTop: 18 }}>
        <span style={{ display: 'inline-flex', color: 'var(--gold-600)', marginBottom: 10 }}>{icon}</span>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 20, color: 'var(--navy-900)', margin: '0 0 6px' }}>{name}</h3>
        <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-body)', fontSize: 14, lineHeight: 1.55, margin: 0, maxWidth: 520 }}>{desc}</p>
      </div>
      <span className="bento-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, position: 'absolute', bottom: 20, left: 28, fontSize: 13.5, fontWeight: 600, color: 'var(--brand)' }}>
        Learn more <L name="arrow-right" size={14} color="var(--brand)" />
      </span>
    </Link>
  );
}

function MiniChat() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ alignSelf: 'flex-start', background: 'var(--stone-100)', borderRadius: '14px 14px 14px 4px', padding: '9px 13px', fontSize: 12.5, color: 'var(--navy-800)', maxWidth: '85%' }}>What does baptism mean for a new believer?</div>
      <div style={{ alignSelf: 'flex-end', background: 'var(--gold-100)', border: '1px solid rgba(201,150,58,0.25)', borderRadius: '14px 14px 4px 14px', padding: '9px 13px', fontSize: 12.5, color: 'var(--navy-900)', maxWidth: '88%' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--gold-700)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em' }}>{I.sparkles({ size: 11 })} YOUR MINISTRY'S AI</span>
        <div style={{ marginTop: 4 }}>Based on your pastor's teaching series…</div>
      </div>
    </div>
  );
}

function MiniFeed() {
  const posts: [number, string, string][] = [
    [1, 'Sarah', 'shared a prayer request'],
    [2, 'James', 'posted: New event — Sunday Service'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {posts.map(([n, name, text]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--stone-100)', borderRadius: 12, padding: '8px 12px' }}>
          <img src={AV(n)} width={26} height={26} style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} alt="" />
          <span style={{ fontSize: 12, color: 'var(--navy-800)', lineHeight: 1.35 }}><b style={{ color: 'var(--navy-900)' }}>{name}</b> {text}</span>
        </div>
      ))}
    </div>
  );
}

function VerseCard() {
  return (
    <div style={{ background: 'var(--gold-100)', border: '1px solid rgba(201,150,58,0.25)', borderRadius: 14, padding: '13px 15px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, color: 'var(--navy-900)', lineHeight: 1.45, fontStyle: 'italic' }}>"I am the vine; you are the branches."</div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--gold-700)', marginTop: 7 }}>JOHN 15:5</div>
    </div>
  );
}

export function Features() {
  const chip = (bg: string, tint: string, ic: (p?: { size?: number }) => React.ReactElement) => (
    <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, color: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic({ size: 22 })}</div>
  );
  return (
    <section id="features" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Kicker>Features</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Built for ministries,\npowered by simplicity'}</H2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="bento-grid">
          <Reveal style={{ display: 'flex' }}>
            <BentoCard icon={I.ai({ size: 24 })} name="AI Knowledge Base" minH={320}
              desc="Trained on your teachings — members get answers in your ministry's voice.">
              <div style={{ flex: 1, paddingTop: 6 }}>{chip('var(--gold-100)', 'var(--gold-600)', I.ai)}<div style={{ marginTop: 16 }}><MiniChat /></div></div>
            </BentoCard>
          </Reveal>
          <Reveal style={{ display: 'flex' }}>
            <BentoCard icon={I.feed({ size: 24 })} name="Community in realtime" minH={320}
              desc="Feeds, prayer, events and groups — a private space that belongs to you.">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <MiniFeed />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex' }}>{[1, 2, 3].map((n) => <img key={n} src={AV(n)} width={34} height={34} style={{ borderRadius: '50%', border: '2.5px solid #fff', marginLeft: n > 1 ? -10 : 0 }} alt="" />)}</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--sky-100)', color: 'var(--sky-700)', fontSize: 11.5, fontWeight: 600, padding: '6px 12px', borderRadius: 999 }}>{I.prayer({ size: 13 })} 12 praying now</span>
                </div>
              </div>
            </BentoCard>
          </Reveal>
          <Reveal delay={80} style={{ display: 'flex' }}>
            <BentoCard icon={I.bible({ size: 24 })} name="Bible & Courses" minH={320}
              desc="Reading plans and structured discipleship paths with progress tracking.">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <VerseCard />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 7 }}><span>Foundations of Faith</span><span style={{ color: 'var(--green-600)' }}>72%</span></div>
                  <div style={{ height: 8, borderRadius: 5, background: 'var(--stone-100)' }}><div style={{ width: '72%', height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, var(--green-400), var(--green-600))' }} /></div>
                </div>
              </div>
            </BentoCard>
          </Reveal>
          <Reveal delay={160} style={{ display: 'flex' }}>
            <BentoCard icon={I.giving({ size: 24 })} name="Giving & Analytics" minH={320}
              desc="Branded giving, fundraising, receipts — and up to 100% retention.">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--navy-900)', fontWeight: 500 }}>$12,480</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>this month</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--green-600)' }}>↑ 18%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>
                  {[38, 52, 44, 66, 58, 78, 92].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 4, background: i === 6 ? 'var(--brand)' : 'rgba(201,150,58,0.25)' }} />)}
                </div>
              </div>
            </BentoCard>
          </Reveal>
        </div>
        <Reveal delay={120} style={{ textAlign: 'center', marginTop: 40 }}>
          <HBtn to="/features" variant="dark" size="lg">See all features</HBtn>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>30 tools across community, discipleship, giving and AI</p>
        </Reveal>
      </div>
    </section>
  );
}
