import React from 'react';
import { L } from './icons';
import { AV } from './shared';

/* Mini UI vignettes shown at the top of each /features card.
   Ported from the Claude Design handoff (ui_kits/website/features-page.jsx).
   Decorative only — built from design tokens + Lucide, no data wiring. */

const white: React.CSSProperties = {
  background: '#fff', borderRadius: 10, padding: 10, boxShadow: '0 4px 12px rgba(45,37,25,0.07)',
};

const ln = (w: string, c = 'var(--stone-200)', h = 7, mt = 0) => (
  <div style={{ height: h, borderRadius: 4, background: c, width: w, marginTop: mt }} />
);

const chip = (bg: string, color: string, children: React.ReactNode) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg, color, fontSize: 10, fontWeight: 700, padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{children}</span>
);

const avs = (n = 3, s = 20) => (
  <div style={{ display: 'flex' }}>
    {[1, 2, 3].slice(0, n).map((i) => (
      <img key={i} src={AV(i)} width={s} height={s} style={{ borderRadius: '50%', border: '2px solid #fff', marginLeft: i > 1 ? -6 : 0 }} alt="" />
    ))}
  </div>
);

type Vignette = (tint: string, bg: string) => React.ReactNode;

const VIGNETTES: Record<string, Vignette> = {
  post: () => (
    <div style={white}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>{avs(1, 22)}<div style={{ flex: 1 }}>{ln('55%')}</div></div>
      {ln('92%')}{ln('70%', 'var(--stone-200)', 7, 5)}
      <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>{chip('var(--sky-100)', 'var(--sky-700)', <>♥ 24</>)}{chip('var(--stone-100)', 'var(--warm-brown)', '8 replies')}</div>
    </div>
  ),
  avatars: (tint, bg) => (
    <div style={{ ...white, display: 'flex', alignItems: 'center', gap: 10 }}>
      {avs(3, 30)}<div style={{ flex: 1 }}>{ln('70%')}{ln('45%', 'var(--stone-200)', 7, 5)}</div>{chip(bg, tint, '+24')}
    </div>
  ),
  prayer: () => (
    <div style={white}>
      {ln('80%')}{ln('55%', 'var(--stone-200)', 7, 5)}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        {chip('var(--sky-100)', 'var(--sky-700)', <><L name="heart-handshake" size={11} color="var(--sky-700)" /> 12 praying</>)}{avs(3, 18)}
      </div>
    </div>
  ),
  map: () => (
    <div style={{ ...white, position: 'relative', height: 66, backgroundImage: 'linear-gradient(rgba(79,151,214,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(79,151,214,0.12) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      {([[18, 12], [56, 34], [78, 10]] as [number, number][]).map(([x, y], i) => (
        <span key={i} style={{ position: 'absolute', left: `${x}%`, top: y }}><L name="map-pin" size={16} color={i === 1 ? 'var(--brand)' : 'var(--sky-500)'} /></span>
      ))}
    </div>
  ),
  calendar: (tint, bg) => (
    <div style={white}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>{ln('35%')}{chip(bg, tint, 'RSVP 48')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {[...Array(14)].map((_, i) => <div key={i} style={{ height: 9, borderRadius: 3, background: i === 9 ? 'var(--brand)' : 'var(--stone-100)' }} />)}
      </div>
    </div>
  ),
  qr: () => (
    <div style={{ ...white, display: 'flex', alignItems: 'center', gap: 12 }}>
      <L name="qr-code" size={40} color="var(--navy-800)" /><div style={{ flex: 1 }}>{ln('70%')}{ln('45%', 'var(--stone-200)', 7, 5)}</div>
      {chip('var(--green-100)', 'var(--green-600)', <><L name="check" size={11} color="var(--green-600)" /> In</>)}
    </div>
  ),
  live: () => (
    <div style={{ background: 'var(--navy-900)', borderRadius: 10, padding: 12, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {chip('#C4553B', '#fff', '● LIVE')}{chip('rgba(255,255,255,0.12)', '#fff', <><L name="hand-heart" size={11} color="#fff" /> $1,240</>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <L name="play" size={16} color="var(--gold-400)" />
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.15)' }}><div style={{ width: '62%', height: '100%', borderRadius: 3, background: 'var(--gold-400)' }} /></div>
      </div>
    </div>
  ),
  verse: (tint, bg) => (
    <div style={white}>
      {ln('90%')}{ln('96%', 'var(--stone-200)', 7, 5)}
      <div style={{ height: 7, borderRadius: 4, background: 'rgba(201,150,58,0.35)', width: '78%', marginTop: 5 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>{chip(bg, tint, 'John 15:5')}{chip('var(--stone-100)', 'var(--warm-brown)', 'Day 12 of 30')}</div>
    </div>
  ),
  progress: (tint) => (
    <div style={white}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--navy-800)', marginBottom: 7 }}><span>Foundations of Faith</span><span style={{ color: tint }}>72%</span></div>
      <div style={{ height: 7, borderRadius: 4, background: 'var(--stone-100)' }}><div style={{ width: '72%', height: '100%', borderRadius: 4, background: tint }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}><span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>12 lessons</span>{avs(3, 18)}</div>
    </div>
  ),
  article: () => (
    <div style={white}>
      <div style={{ height: 9, borderRadius: 4, background: 'var(--navy-800)', width: '62%', marginBottom: 7 }} />
      {ln('95%')}{ln('88%', 'var(--stone-200)', 7, 5)}{ln('40%', 'var(--stone-200)', 7, 5)}
    </div>
  ),
  aidoc: (tint, bg) => (
    <div style={{ ...white, position: 'relative' }}>
      <span style={{ position: 'absolute', top: 8, right: 8 }}>{chip(bg, tint, <><L name="sparkles" size={11} color={tint} /> AI draft</>)}</span>
      <div style={{ height: 9, borderRadius: 4, background: 'var(--navy-800)', width: '52%', marginBottom: 7 }} />{ln('90%')}{ln('72%', 'var(--stone-200)', 7, 5)}
    </div>
  ),
  files: (tint) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[['Sermon notes — Sunday', 'file-text'], ['Volunteer handbook', 'file-text']].map(([t, ic]) => (
        <div key={t} style={{ ...white, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <L name={ic} size={14} color={tint} /><span style={{ fontSize: 11.5, color: 'var(--navy-800)', fontWeight: 500 }}>{t}</span>
        </div>
      ))}
    </div>
  ),
  sunrise: () => (
    <div style={{ borderRadius: 10, padding: 12, background: 'linear-gradient(180deg, #bcdaf1, #F5EDE0)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <L name="sun" size={22} color="var(--gold-500)" />
      <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--navy-900)' }}>Morning devotional</div><div style={{ fontSize: 10, color: 'var(--navy-700)' }}>Delivered 6:00 AM · automatic</div></div>
    </div>
  ),
  chat: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ alignSelf: 'flex-start', background: '#fff', borderRadius: '12px 12px 12px 4px', padding: '7px 11px', fontSize: 11, color: 'var(--navy-800)', boxShadow: '0 3px 10px rgba(45,37,25,0.06)' }}>What does grace mean?</div>
      <div style={{ alignSelf: 'flex-end', background: 'var(--gold-100)', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '12px 12px 4px 12px', padding: '7px 11px', fontSize: 11, color: 'var(--navy-900)' }}>From your pastor's series…</div>
    </div>
  ),
  chatinput: (tint) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ alignSelf: 'flex-end', background: 'var(--gold-100)', borderRadius: '12px 12px 4px 12px', padding: '7px 11px', fontSize: 11, color: 'var(--navy-900)' }}>Here's a verse for tonight's study ✨</div>
      <div style={{ ...white, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ flex: 1 }}>{ln('60%', 'var(--stone-100)')}</div><L name="send" size={14} color={tint} /></div>
    </div>
  ),
  email: (tint) => (
    <div style={{ ...white, display: 'flex', alignItems: 'center', gap: 10 }}>
      <L name="mail" size={20} color={tint} /><div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--navy-800)' }}>This week at Harvest</div>{ln('55%', 'var(--stone-200)', 6, 4)}</div>{chip('var(--green-100)', 'var(--green-600)', 'Sent ✓')}
    </div>
  ),
  sms: (tint, bg) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ alignSelf: 'flex-start', background: '#fff', borderRadius: '12px 12px 12px 4px', padding: '7px 11px', fontSize: 11, color: 'var(--navy-800)', boxShadow: '0 3px 10px rgba(45,37,25,0.06)' }}>See you Sunday at 10! 🌾</div>
      <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 5, alignItems: 'center' }}>{chip(bg, tint, 'Automated')}{chip('var(--stone-100)', 'var(--warm-brown)', 'Twilio')}</div>
    </div>
  ),
  form: (tint, bg) => (
    <div style={white}>
      {ln('40%', 'var(--stone-100)', 9)}{ln('100%', 'var(--stone-100)', 14, 5)}{ln('100%', 'var(--stone-100)', 14, 5)}
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{chip(bg, tint, '→ CRM pipeline')}<span style={{ background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>Submit</span></div>
    </div>
  ),
  amounts: () => (
    <div style={{ ...white, display: 'flex', gap: 8, justifyContent: 'center' }}>
      {['$25', '$50', '$100'].map((a, i) => <span key={a} style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, background: i === 1 ? 'var(--brand)' : 'var(--stone-100)', color: i === 1 ? '#fff' : 'var(--navy-800)' }}>{a}</span>)}
    </div>
  ),
  goal: (tint, bg) => (
    <div style={white}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: 'var(--navy-800)', marginBottom: 7 }}><span>New roof fund</span><span style={{ color: tint }}>$6.8k / $10k</span></div>
      <div style={{ height: 8, borderRadius: 5, background: 'var(--stone-100)' }}><div style={{ width: '68%', height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, var(--gold-400), var(--gold-600))' }} /></div>
      <div style={{ marginTop: 8 }}>{chip(bg, tint, '132 givers')}</div>
    </div>
  ),
  contacts: (tint, bg) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {([[1, 'Donor · monthly'], [2, 'Member · group leader']] as [number, string][]).map(([n, tag]) => (
        <div key={tag} style={{ ...white, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={AV(n)} width={22} height={22} style={{ borderRadius: '50%' }} alt="" /><div style={{ flex: 1 }}>{ln('55%', 'var(--stone-200)', 6)}</div>{chip(bg, tint, tag)}
        </div>
      ))}
    </div>
  ),
  ledger: () => (
    <div style={white}>
      {([['Tithes & offerings', '$4,210'], ['Missions fund', '$1,180'], ['QuickBooks sync', '✓']] as [string, string][]).map(([l, v], i) => (
        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: i ? '1px dashed rgba(45,37,25,0.1)' : 'none', fontSize: 11 }}>
          <span style={{ color: 'var(--text-body)' }}>{l}</span><span style={{ fontWeight: 700, color: i === 2 ? 'var(--green-600)' : 'var(--navy-900)' }}>{v}</span>
        </div>
      ))}
    </div>
  ),
  receipt: () => (
    <div style={{ ...white, textAlign: 'center' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 700 }}>TAX RECEIPT · 2026</div>
      <div style={{ borderTop: '1px dashed rgba(45,37,25,0.18)', margin: '8px 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}><span style={{ color: 'var(--text-body)' }}>Annual giving</span><span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>$2,400</span></div>
    </div>
  ),
  affiliate: (tint, bg) => (
    <div style={{ ...white, display: 'flex', alignItems: 'center', gap: 10 }}>
      <L name="link" size={16} color={tint} /><span style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>theharvest.app/?ref=you</span>{chip(bg, tint, 'earns 15%/mo')}
    </div>
  ),
  browser: () => (
    <div style={{ ...white, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', background: 'var(--stone-100)' }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />)}
        <div style={{ flex: 1, height: 10, borderRadius: 5, background: '#fff', margin: '0 6px' }} />
      </div>
      <div style={{ padding: 10 }}>{ln('60%')}{ln('85%', 'var(--stone-200)', 7, 5)}</div>
    </div>
  ),
  install: () => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 64, borderRadius: 14, border: '2.5px solid var(--navy-800)', padding: '14px 8px 10px', textAlign: 'center', background: '#fff', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)', width: 18, height: 4, borderRadius: 3, background: 'var(--navy-800)' }} />
        <L name="arrow-down-to-line" size={18} color="var(--brand)" /><div style={{ fontSize: 8.5, fontWeight: 700, color: 'var(--navy-800)', marginTop: 4 }}>Install</div>
      </div>
    </div>
  ),
  stats: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {([['Members', '2,480'], ['Retention', '100%'], ['Active', '640']] as [string, string][]).map(([l, v]) => (
        <div key={l} style={{ ...white, flex: 1, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{l}</div><div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--navy-900)' }}>{v}</div>
        </div>
      ))}
    </div>
  ),
  swatches: (tint, bg) => (
    <div style={{ ...white, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>{['var(--brand)', 'var(--navy-800)', 'var(--sky-500)', 'var(--green-500)'].map((c) => <span key={c} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(45,37,25,0.15)' }} />)}</div>
      <div style={{ flex: 1 }}>{ln('70%')}</div>{chip(bg, tint, 'yourministry.org')}
    </div>
  ),
  churches: (tint) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {['Grace Chapel — Bucharest', 'City Light — Cluj'].map((t) => (
        <div key={t} style={{ ...white, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <L name="church" size={14} color={tint} /><span style={{ fontSize: 11.5, color: 'var(--navy-800)', fontWeight: 500, flex: 1 }}>{t}</span>{chip('var(--green-100)', 'var(--green-600)', 'live')}
        </div>
      ))}
    </div>
  ),
  chart: () => (
    <div style={{ ...white, display: 'flex', alignItems: 'flex-end', gap: 5, height: 62 }}>
      {[35, 55, 42, 68, 58, 82, 95].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: i === 6 ? 'var(--brand)' : 'rgba(79,151,214,0.3)' }} />)}
    </div>
  ),
};

/** Known preview kinds — used by FeaturesPage to decide bespoke vs. fallback. */
export const PREVIEW_KINDS = new Set(Object.keys(VIGNETTES));

export function FeaturePreview({ kind, tint, bg }: { kind?: string; tint: string; bg: string }) {
  const render = kind ? VIGNETTES[kind] : undefined;
  if (!render) return null;
  return (
    <div style={{ borderRadius: 16, background: bg, padding: 12, marginBottom: 18, minHeight: 96, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {render(tint, bg)}
    </div>
  );
}
