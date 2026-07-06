import React from 'react';
import { ParallaxLayer, Reveal } from './effects';
import { TiltIn, SafariFrame, IphoneFrame } from './magic';
import { I } from './icons';
import { Kicker, H2, container, AV, FIELD } from './shared';

function PhoneUI() {
  return (
    <>
      <div style={{ background: 'var(--brand)', padding: '38px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 17 }}>Harvest</span>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
      </div>
      <div style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 11, overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 13, boxShadow: '0 6px 16px rgba(45,37,25,0.05)' }}>
          <div style={{ fontSize: 9.5, color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.1em' }}>DAILY DEVOTIONAL</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14.5, color: 'var(--navy-900)', marginTop: 5 }}>Rooted &amp; grounded in love</div>
          <div style={{ height: 7, background: 'var(--stone-200)', borderRadius: 4, marginTop: 9, width: '90%' }} />
          <div style={{ height: 7, background: 'var(--stone-200)', borderRadius: 4, marginTop: 6, width: '70%' }} />
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <div style={{ flex: 1, background: 'var(--sky-100)', borderRadius: 13, padding: 11 }}><span style={{ color: 'var(--sky-600)' }}>{I.feed({ size: 17 })}</span><div style={{ fontSize: 10.5, color: 'var(--navy-800)', fontWeight: 600, marginTop: 5 }}>Community</div></div>
          <div style={{ flex: 1, background: 'var(--green-100)', borderRadius: 13, padding: 11 }}><span style={{ color: 'var(--green-600)' }}>{I.courses({ size: 17 })}</span><div style={{ fontSize: 10.5, color: 'var(--navy-800)', fontWeight: 600, marginTop: 5 }}>Courses</div></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 12, boxShadow: '0 6px 16px rgba(45,37,25,0.05)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <img src={AV(1)} width={28} height={28} style={{ borderRadius: '50%' }} alt="" />
            <div><div style={{ height: 7, width: 76, background: 'var(--stone-200)', borderRadius: 4 }} /><div style={{ height: 7, width: 48, background: 'var(--stone-200)', borderRadius: 4, marginTop: 5 }} /></div>
            <span style={{ marginLeft: 'auto', color: 'var(--brand)' }}>{I.prayer({ size: 15 })}</span>
          </div>
        </div>
      </div>
      <div style={{ background: '#fff', borderTop: '1px solid var(--stone-200)', padding: '11px 20px 16px', display: 'flex', justifyContent: 'space-around' }}>
        {[I.dashboard, I.feed, I.bible, I.community].map((Ic, i) => <span key={i} style={{ color: i === 0 ? 'var(--brand)' : 'var(--stone-300)' }}>{Ic({ size: 18 })}</span>)}
      </div>
    </>
  );
}

function CoursesMock() {
  const courses = [
    { t: 'Foundations of Faith', lessons: 12, done: 72, tint: 'var(--gold-400)', bg: 'var(--gold-100)' },
    { t: 'Walking in Prayer', lessons: 8, done: 45, tint: 'var(--sky-500)', bg: 'var(--sky-100)' },
    { t: 'Serving Your City', lessons: 10, done: 28, tint: 'var(--green-500)', bg: 'var(--green-100)' },
  ];
  const nav: [string, (p?: { size?: number }) => React.ReactElement, boolean][] = [
    ['Dashboard', I.dashboard, false], ['Community', I.community, false], ['Courses', I.courses, true],
    ['Members', I.crm, false], ['Giving', I.giving, false], ['Bible', I.bible, false],
  ];
  return (
    <div style={{ display: 'flex', minHeight: 380 }}>
      <div style={{ width: 182, background: 'var(--navy-900)', padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }} className="dash-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <img src="/logos/harvest-mark.png" alt="" style={{ height: 24, width: 'auto' }} /><span style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 16 }}>Harvest</span>
        </div>
        {nav.map(([l, ic, on], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 9, background: on ? 'rgba(201,150,58,0.16)' : 'transparent', color: on ? 'var(--gold-400)' : 'rgba(255,255,255,0.55)', fontSize: 12.5, fontWeight: 500 }}>
            {ic({ size: 15 })}<span>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: 'var(--cream)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--navy-900)', fontWeight: 500 }}>Courses</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Discipleship paths for your people</div>
          </div>
          <div style={{ background: 'var(--brand)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '7px 14px', borderRadius: 999 }}>+ New course</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {courses.map((c) => (
            <div key={c.t} style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.06)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ height: 74, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.courses({ size: 26, color: c.tint })}</div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-900)', marginBottom: 4 }}>{c.t}</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 10 }}>{c.lessons} lessons · {c.done}% avg. progress</div>
                <div style={{ height: 6, borderRadius: 4, background: 'var(--stone-100)' }}><div style={{ width: `${c.done}%`, height: '100%', borderRadius: 4, background: c.tint }} /></div>
                <div style={{ display: 'flex', marginTop: 10 }}>{[1, 2, 3].map((n) => <img key={n} src={AV(n)} width={20} height={20} style={{ borderRadius: '50%', border: '2px solid #fff', marginLeft: n > 1 ? -6 : 0 }} alt="" />)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, background: '#fff', border: '1px solid rgba(45,37,25,0.06)', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--brand)' }}>{I.sparkles({ size: 16 })}</span>
          <span style={{ fontSize: 12, color: 'var(--text-body)' }}>AI suggestion: members who finish “Foundations of Faith” are 3× more likely to join a group.</span>
        </div>
      </div>
    </div>
  );
}

export function Sync() {
  const [mode, setMode] = React.useState<'web' | 'mobile'>('mobile');
  const chip = (key: 'web' | 'mobile', label: string) => (
    <button
      key={key}
      onClick={() => setMode(key)}
      style={{
        cursor: 'pointer', border: 'none', fontFamily: 'var(--font-sans)',
        background: mode === key ? 'var(--brand)' : 'rgba(255,255,255,0.92)',
        color: mode === key ? '#fff' : 'var(--navy-900)',
        padding: '11px 24px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
        boxShadow: mode === key ? '0 8px 22px rgba(201,150,58,0.35)' : 'none',
        transition: 'all 250ms var(--ease-out)',
      }}
    >{label}</button>
  );
  return (
    <section id="believers" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <Kicker>Believers · anywhere</Kicker>
          <H2 style={{ marginTop: 14 }}>{'A home for their faith,\nin their pocket'}</H2>
        </div>
        <Reveal delay={100}>
          <div style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', padding: '54px 28px 30px', background: `linear-gradient(180deg, rgba(12,21,38,0.2), rgba(12,21,38,0.6)), url(${FIELD}) center/cover` }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
              {chip('web', 'Web App')}
              {chip('mobile', 'Mobile App (PWA)')}
            </div>
            {mode === 'mobile' ? (
              <ParallaxLayer speed={0.08}>
                <TiltIn maxTilt={10}>
                  <IphoneFrame width={272}><PhoneUI /></IphoneFrame>
                </TiltIn>
              </ParallaxLayer>
            ) : (
              <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <TiltIn maxTilt={8}>
                  <SafariFrame url="yourministry.theharvest.app/courses"><CoursesMock /></SafariFrame>
                </TiltIn>
              </div>
            )}
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500, margin: '30px 0 0', textShadow: '0 1px 8px rgba(12,21,38,0.5)' }}>
              {mode === 'mobile' ? 'Installable on iOS & Android — no app store required.' : 'Optimized for desktop — your full ministry on the big screen.'}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
