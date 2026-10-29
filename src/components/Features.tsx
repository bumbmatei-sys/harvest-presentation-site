import React from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from './effects';
import { I } from './icons';
import { AV } from './shared';
import { CATALOG_TOOL_COUNT } from './catalog';

function MiniPost() {
  return (
    <div style={{ background: 'var(--stone-100)', borderRadius: 14, padding: 16, fontSize: 12.5, color: 'var(--navy-800)' }}>
      <div>Join us this week.</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>{['Facebook', 'Instagram', 'Threads'].map((channel) => <span key={channel} style={{ background: 'white', borderRadius: 999, padding: '4px 8px' }}>{channel}</span>)}</div>
      <div style={{ marginTop: 12, fontWeight: 700 }}>Scheduled · Sun 9:00 AM</div>
    </div>
  );
}

function MiniChat() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ alignSelf: 'flex-start', background: 'var(--stone-100)', borderRadius: '14px 14px 14px 4px', padding: '9px 13px', fontSize: 12.5, color: 'var(--navy-800)', maxWidth: '85%' }}>Summarise what we've taught on baptism this year.</div>
      <div style={{ alignSelf: 'flex-end', background: 'var(--gold-100)', border: '1px solid rgba(201,150,58,0.25)', borderRadius: '14px 14px 4px 14px', padding: '9px 13px', fontSize: 12.5, color: 'var(--navy-900)', maxWidth: '88%' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--gold-700)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em' }}>{I.sparkles({ size: 11 })} PREVIEW · COMING SOON</span>
        <div style={{ marginTop: 4 }}>Three sermons and one lesson cover it…</div>
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

const scenes = ['/scenes/feature-1-wheat-closeup.webp', '/scenes/feature-2-wheat-dusk.webp', '/scenes/feature-3-wheat-night-sky.webp', '/scenes/why-1-wheat-meadow-day.webp', '/scenes/why-2-wheat-sunset.webp'];

function Photo({ scene, children, soon = false }: { scene: string; children: React.ReactNode; soon?: boolean }) {
  return <div className="fab-photo"><img className="fab-photo-image" src={scene} alt="" />{soon && <span className="fab-soon">Coming soon</span>}<div className="fab-glass">{children}</div></div>;
}

export function Features() {
  return (
    <section id="features" className="fab-section">
      <div className="fab-container">
        <Reveal><div className="fab-header"><div><span className="fab-pill">Features</span><h2>Everything You Need to<br /><span>Disciple and Grow</span></h2></div><p>{`${CATALOG_TOOL_COUNT} tools across community, discipleship, giving and AI`}</p></div></Reveal>
        <div className="fab-feature-cards">
          <Reveal><Link className="fab-feature-link" to="/features/harvest-scheduler"><Photo scene={scenes[0]}><MiniPost /></Photo><h3>Social Scheduler</h3><p>Write once, schedule to Facebook, Instagram and Threads. Included on Ministry.</p></Link></Reveal>
          <Reveal delay={80}><Link className="fab-feature-link" to="/features/community-engagement#feed"><Photo scene={scenes[1]}><MiniFeed /><div className="fab-mini-prayer"><div className="fab-avatars">{[1, 2, 3].map((n) => <img key={n} src={AV(n)} width={34} height={34} alt="" />)}</div>{I.prayer({ size: 13 })} 12 praying now</div></Photo><h3>Community</h3><p>Feed, prayer, groups and events your people open every day.</p></Link></Reveal>
          <Reveal delay={160}><Link className="fab-feature-link" to="/features/discipleship-content#bible"><Photo scene={scenes[2]}><VerseCard /><div className="fab-progress"><span>Foundations of Faith</span><span>72%</span></div><div className="fab-progress-track"><div /></div></Photo><h3>Bible &amp; Courses</h3><p>The full Bible, plus courses with progress tracking.</p></Link></Reveal>
        </div>
        <div className="fab-splits">
          <Reveal><div className="fab-split"><Photo scene={scenes[3]}><div className="fab-chart-heading"><span>$12,480</span><small>this month</small><b>↑ 18%</b></div><div className="fab-chart">{[38, 52, 44, 66, 58, 78, 92].map((h, i) => <div key={i} style={{ height: `${h}%` }} />)}</div></Photo><div className="fab-split-copy"><h3>Giving</h3><p>Donation pages, campaigns and pledges, with a 0% fee on donations.</p><Link className="fab-button" to="/features/giving-finance#donation">Learn more</Link></div></div></Reveal>
          <Reveal><div className="fab-split fab-split-reverse"><Photo scene={scenes[4]} soon><MiniChat /></Photo><div className="fab-split-copy"><span className="fab-coming-pill">Coming soon</span><h3>AI Assistant</h3><p>Coming soon for the plan owner: 300 messages a month planned on Church, 5,000 on Ministry.</p><Link className="fab-button" to="/features/ai-automation#assistant">Learn more</Link></div></div></Reveal>
        </div>
      </div>
    </section>
  );
}
