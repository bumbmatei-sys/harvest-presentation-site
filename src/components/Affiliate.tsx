import React from 'react';
import { Reveal } from './effects';
import { L } from './icons';
import { Kicker, H2, container, softCard } from './shared';

const steps = [
  { icon: 'share-2', title: 'Share your link', desc: 'Get a unique referral link when you join. Share it with ministries in your network.' },
  { icon: 'user-check', title: 'They subscribe', desc: 'When someone signs up through your link, the connection is tracked automatically.' },
  { icon: 'trending-up', title: 'You earn monthly', desc: 'Earn 15% recurring commission for as long as they stay — ongoing income.' },
];

export function Affiliate() {
  return (
    <section id="affiliate" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0', scrollMarginTop: 100 }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Kicker color="var(--brand)">Affiliate program</Kicker>
          <H2 style={{ marginTop: 14 }}>Earn while you grow the kingdom</H2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="feat-three">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div style={{ ...softCard, padding: 28, height: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', marginBottom: 18 }}><L name={s.icon} size={22} color="var(--brand)" /></div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 19, color: 'var(--navy-900)', margin: '0 0 8px' }}>{s.title}</h4>
                <p style={{ color: 'var(--text-body)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ maxWidth: 460, margin: '32px auto 0' }}>
          <div style={{ ...softCard, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14.5, color: 'var(--navy-900)', fontWeight: 500, marginBottom: 6 }}>Flat rate, every plan</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--brand)' }}>15% / month</div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>Recurring for as long as they stay subscribed. If they cancel, commission stops.</p>
        </Reveal>
      </div>
    </section>
  );
}
