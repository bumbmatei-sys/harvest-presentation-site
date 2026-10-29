import React from 'react';
import { StoryCard } from './marketing';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { I } from './icons';
import { Kicker, H2, Checklist, softCard, AV } from './shared';

function CommunityCard() {
  const rows: [string, string, string, (p?: { size?: number; color?: string }) => React.ReactElement][] = [
    ['Prayer for the Nations', 'var(--sky-500)', 'Prayer', I.prayer],
    ['Foundations group', 'var(--gold-500)', 'Community', I.community],
    ['Foundations course', 'var(--green-500)', 'Course', I.courses],
    ['Sunday livestream', 'var(--sky-500)', 'Event', I.livestream],
  ];
  return (
    <div style={{ ...softCard, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--navy-900)', fontWeight: 500 }}>Community</div>
        <div style={{ display: 'flex', gap: 6 }}>{['All', 'Prayer', 'Groups'].map((t, i) => <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 999, background: i === 0 ? 'var(--secondary)' : 'var(--stone-100)', color: i === 0 ? 'var(--foreground)' : 'var(--text-body)' }}>{t}</span>)}</div>
      </div>
      {rows.map(([label, color, tag, ic], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: color, opacity: 0.92, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic({ size: 18, color: 'var(--foreground)' })}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy-900)' }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tag} · updated today</div>
          </div>
          <div style={{ display: 'flex' }}>{[1, 2, 3].map((n) => <img key={n} src={AV(n)} width={22} height={22} style={{ borderRadius: '50%', border: '2px solid var(--foreground)', marginLeft: -7 }} alt="" />)}</div>
        </div>
      ))}
    </div>
  );
}

export function Community() {
  return (
    <section id="pillars" className="marketing-section">
      <div className="fab-container"><Reveal><StoryCard scene="why-1-wheat-meadow-day" visual={<CommunityCard />}>
          <div>
            <Kicker align="left" color="var(--sky-600)">Community</Kicker>
            <H2 align="left" style={{ marginTop: 14 }}>Keep Every Believer Close</H2>
            <Reveal delay={140}>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-body)', lineHeight: 1.6, margin: '18px 0 26px', maxWidth: 480 }}>
                A feed, a prayer wall, groups and events in a private space you own. No algorithm decides who sees your post.
              </p>
              <Checklist size="md" items={['Feed and prayer wall', 'Groups, events and livestream', 'Your people, on your own platform']} />
              <div style={{ marginTop: 26 }}><HBtn to="/features/community-engagement#feed" variant="dark">Explore community</HBtn></div>
            </Reveal>
          </div>
      </StoryCard></Reveal></div>
    </section>
  );
}
