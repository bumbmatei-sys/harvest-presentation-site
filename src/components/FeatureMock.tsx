import React from 'react';

/* Per-feature UI vignettes and icons for the category pages.
   Ported from the Claude Design handoff (FeatureBlock.dc.html) — one entry per
   feature id in content/features.ts. Everything here is decorative: the markup
   is a still life of the product, not a live surface. */

export const FEATURE_ICONS: Record<string, React.ReactElement> = {
  feed: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  groups: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 18v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13A4 4 0 0 1 16 11" />
    </svg>
  ),
  prayer: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-3l-2.5 2.5" />
      <path d="M4 9l3-3 3 3" />
      <path d="M20 15l-4 4-3-1" />
      <path d="M4 9v6l4 4" />
    </svg>
  ),
  map: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  events: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  ),
  checkin: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3M21 14v.01M17 21h4v-4M14 21h.01" />
    </svg>
  ),
  livestream: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  bible: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5V4.5Z" />
      <path d="M12 6v8M9 9h6" />
    </svg>
  ),
  courses: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  ),
  blog: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v5h5M8 13h8M8 17h5" />
    </svg>
  ),
  aiblog: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 4.2L18 8.8l-4.4 1.6L12 15l-1.6-4.6L6 8.8l4.4-1.6L12 3Z" />
      <path d="M18.5 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  ),
  docs: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M8 13h8M8 16h5" />
    </svg>
  ),
  knowledge: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  ),
  aichat: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5A8 8 0 1 1 21 11.5Z" />
      <path d="M12 7.5l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9L12 7.5Z" />
    </svg>
  ),
  newsletter: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  autonewsletter: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
      <path d="m3 7 9 6 9-6" />
      <path d="M18.5 14.5l.85 2.15 2.15.85-2.15.85-.85 2.15-.85-2.15L15.5 17.5l2.15-.85.85-2.15Z" />
    </svg>
  ),
  sms: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </svg>
  ),
  forms: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M9 11h6M9 15h4" />
    </svg>
  ),
  donation: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 6.6a4.5 4.5 0 0 0-7.8-2.1L12 5.5l-1-1a4.5 4.5 0 0 0-7.8 2.1" />
      <path d="M3.2 6.6C2.5 9 4 11.5 12 17c8-5.5 9.5-8 8.8-10.4" />
    </svg>
  ),
  fundraising: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M6 20v-6M12 20V8M18 20v-9" />
      <path d="m4 9 6-4 4 3 6-5" />
    </svg>
  ),
  crm: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M17 9h4M17 13h4M17 17h4" />
    </svg>
  ),
  accounting: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h2M8 15h2M14 11h2M14 15h2M12 11v4" />
    </svg>
  ),
  affiliate: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <path d="M2 7h20v5H2zM12 21V7M12 7H8.5a2.5 2.5 0 0 1 0-5C11 2 12 5 12 7ZM12 7h3.5a2.5 2.5 0 0 0 0-5C13 2 12 5 12 7Z" />
    </svg>
  ),
  webapp: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9S14.5 18.5 12 21c-2.5-2.5-3.5-6-3.5-9S9.5 5.5 12 3Z" />
    </svg>
  ),
  pwa: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M12 6v6m0 0-2.5-2.5M12 12l2.5-2.5" />
      <path d="M10 18h4" />
    </svg>
  ),
  dashboard: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  branding: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a9 9 0 1 0 0 18c1 0 1.7-.8 1.7-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z" />
      <circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  churches: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M10 4h4" />
      <path d="M12 6 5 10v11h14V10l-7-4Z" />
      <path d="M9 21v-4a3 3 0 0 1 6 0v4" />
    </svg>
  ),
  analytics: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14v3M12 9v8M17 5v12" />
    </svg>
  ),
  /* ── THE-293 — the six Harvest Scheduler capabilities ──────────────────────
     Prefixed, because `analytics` above is already taken by the Evangelism
     Analytics vignette on /features/platform-brand. Same geometry as every icon
     in this file: a 24 viewBox, 1.8 stroke, round caps. */
  'scheduler-publishing': (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="m9 14.5 2 2 4-4" />
    </svg>
  ),
  'scheduler-analytics': (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 20v-6M13 20v-10M18 20v-4" />
    </svg>
  ),
  'scheduler-messaging': (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5.5 5h13l2.5 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-7Z" />
    </svg>
  ),
  'scheduler-comments': (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      <path d="M11 10h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3l-3 3v-3h-2a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  'scheduler-ads': (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Z" />
      <path d="M17.5 9a3.5 3.5 0 0 1 0 6" />
      <path d="M7 14v5h3" />
    </svg>
  ),
  'scheduler-live': (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  ),
};

/* The one interactive vignette — clicking a channel or DM swaps the thread,
   exactly as the design's FeatureBlock did. */
type Convo = {
  id: string; kind: 'channel' | 'dm'; name: string; avatar?: string; unread: boolean;
  messages: { from: string; text: string; me: boolean; attach?: string }[];
};

const CONVOS: Convo[] = [
  { id: 'leadership', kind: 'channel', name: 'Leadership', unread: false, messages: [
    { from: 'Pastor James', text: 'Can you follow up with Sarah this week?', me: false, attach: 'Sarah M.' },
    { from: 'You', text: 'On it — calling her this afternoon.', me: true },
  ] },
  { id: 'volunteers', kind: 'channel', name: 'Volunteers', unread: true, messages: [
    { from: 'Maria — Coordinator', text: 'Sunday sign-up sheet is live — 4 slots left.', me: false },
    { from: 'You', text: 'Sharing it to the community feed now.', me: true },
  ] },
  { id: 'worship', kind: 'channel', name: 'Worship', unread: false, messages: [
    { from: 'David R.', text: "Setlist for Sunday is in the Docs tab whenever you're ready.", me: false },
    { from: 'You', text: 'Thanks David 🙌', me: true },
  ] },
  { id: 'dm-sarah', kind: 'dm', name: 'Sarah M.', avatar: '/logos/avatar-3.jpg', unread: false, messages: [
    { from: 'Sarah M.', text: 'Thank you for the call today, Pastor.', me: false },
    { from: 'You', text: "Anytime, Sarah. We're praying with you and your family.", me: true },
    { from: 'Sarah M.', text: '🙏', me: false },
  ] },
  { id: 'dm-david', kind: 'dm', name: 'David R.', avatar: '/logos/avatar-2.jpg', unread: true, messages: [
    { from: 'David R.', text: 'Can I grab the keys for early rehearsal Sunday?', me: false },
    { from: 'You', text: 'Left them at the front desk for you.', me: true },
  ] },
];

const rowStyle = (on: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, borderRadius: 8,
  padding: '7px 8px', cursor: 'pointer', textAlign: 'left', width: '100%',
  border: 'none', fontFamily: 'var(--font-sans)',
  ...(on
    ? { fontWeight: 700, color: '#fff', background: 'var(--navy-900)' }
    : { color: 'var(--earth)', background: 'transparent' }),
});

const railLabel: React.CSSProperties = {
  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--text-muted)', padding: '5px 6px 3px',
};

const unreadDot = <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold-500)', flexShrink: 0 }} />;

function GroupsMock() {
  const [selected, setSelected] = React.useState('leadership');
  const active = CONVOS.find((c) => c.id === selected) || CONVOS[0];
  const isChannel = active.kind === 'channel';

  const row = (c: Convo) => {
    const on = c.id === selected;
    return (
      <button key={c.id} type="button" onClick={() => setSelected(c.id)} style={rowStyle(on)}>
        {c.kind === 'channel'
          ? <span style={{ fontWeight: 700, color: on ? 'rgba(255,255,255,0.72)' : 'var(--text-muted)' }}>#</span>
          : <img src={c.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
        <span style={{ flex: 1 }}>{c.name}</span>
        {c.unread && unreadDot}
      </button>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.82fr 1.18fr', gap: 8, height: 300 }}>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: 13, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
        <div style={railLabel}>Channels</div>
        {CONVOS.filter((c) => c.kind === 'channel').map(row)}
        <div style={{ ...railLabel, padding: '9px 6px 3px' }}>Direct messages</div>
        {CONVOS.filter((c) => c.kind === 'dm').map(row)}
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: 13, padding: 10, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 700, color: 'var(--navy-900)', paddingBottom: 8, borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          {isChannel
            ? <span style={{ color: 'var(--text-muted)' }}>#</span>
            : <img src={active.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />}
          <span>{active.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, flex: 1, overflow: 'auto' }}>
          {active.messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '84%', alignSelf: m.me ? 'flex-end' : 'flex-start', alignItems: m.me ? 'flex-end' : 'flex-start' }}>
              {!m.me && isChannel && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy-800)' }}>{m.from}</div>}
              <div style={{ fontSize: 11, lineHeight: 1.4, borderRadius: 10, padding: '6px 9px', ...(m.me ? { background: 'var(--navy-900)', color: '#fff' } : { background: 'var(--stone-100)', color: 'var(--earth)' }) }}>{m.text}</div>
              {m.attach && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 600, color: 'var(--sky-700)', background: 'var(--sky-100)', border: '1px solid var(--sky-200)', borderRadius: 9, padding: '6px 9px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h3M15 12h3M7 16h10" /></svg>
                  Contact · {m.attach}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(45,37,25,0.1)', borderRadius: 9, padding: '7px 10px', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Message {active.name}…</div>
      </div>
    </div>
  );
}

/* ── THE-293 — the six Harvest Scheduler vignettes ──────────────────────────
 *
 * 🔴 THE FOUNDER, VERBATIM: "the harvest scheduler is horrible. I want for each
 * feature to be presented as the other category pages with a small design."
 * Every other unbuilt thing on this site gets one grey wireframe from
 * SoonMock; the scheduler page drew ONE of those and then repeated a plain card
 * six times, so its six capabilities were visually identical to each other and
 * to nothing else. These six are what the other category pages have: a still
 * life of the surface the capability would be, one per capability.
 *
 * ⚠️ SAME IDIOM AS EVERY VIGNETTE ABOVE, DELIBERATELY. White card on the
 * `rgba(45,37,25,0.08)` hairline, sixteen-pixel radius, a header row with a
 * pill, eleven-and-a-half-point labels, colour from the ramps in index.css and
 * nowhere else. Nothing new was invented here — the point of the ticket is that
 * this page stops looking like an exception.
 *
 * ─── 🔴 AND THE THREE THINGS THAT MAKE THEM DIFFERENT ANYWAY ────────────────
 *
 *   · NOT ONE DIGIT IN ANY VISIBLE STRING. The vignettes above are full of
 *     them — 142 decisions, 1,204 members, a payout. Those are a church's own
 *     sample data on pages about shipped work. On this page a figure is a rate
 *     a church could believe, and the founder's instruction on the provider's
 *     meters was "They don't need to know that", so
 *     pages/the-284-harvest-scheduler.test.ts asserts the rendered page carries
 *     no bare figure AT ALL. What an analytics panel would print as a number,
 *     these draw as a bar or a line.
 *   · NO IMAGE, LOCAL OR HOTLINKED. Board card 86bbrgp08: no third-party mark
 *     ships under Harvest's name. The page's nine destination chips are the
 *     only marks on it and they are counted — a tenth `loading="lazy"` fails.
 *     Connected accounts are drawn as unlabelled swatches instead.
 *   · NO PLATFORM IS NAMED IN A VIGNETTE. The nine are named once, in prose, in
 *     the section that exists to say the list is a decision. A name inside a
 *     picture of a screen is a claim about what is already connected. */

const soonCard: React.CSSProperties = {
  background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden',
};
const soonHead: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
  padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)',
};
const soonTitle: React.CSSProperties = { fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' };
const soonLabel: React.CSSProperties = {
  fontSize: '9px', fontWeight: '700', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)',
};
const soonPill = (color: string, background: string): React.CSSProperties => ({
  fontSize: '9.5px', fontWeight: '700', color, background, padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap',
});
const soonRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px' };

/** The accounts a post would go to, as swatches. No mark, no name — see the
 *  third note above. Decorative, so it is hidden from a screen reader: the
 *  block's own prose already says what it stands for. */
const accountSwatches = (n: number, on = n) => (
  <span style={{ display: 'inline-flex', gap: '4px' }} aria-hidden="true">
    {Array.from({ length: n }, (_, i) => (
      <span
        key={i}
        style={{
          width: '18px', height: '18px', borderRadius: '6px', flexShrink: 0,
          background: i < on ? 'var(--navy-900)' : 'var(--stone-200)',
          border: i < on ? 'none' : '1px solid rgba(45,37,25,0.08)',
        }}
      />
    ))}
  </span>
);

/** A labelled progress bar. The figure it would carry lives in the WIDTH, which
 *  is a style attribute rather than text — the whole reason an analytics
 *  vignette is possible on a page that may print no number. */
const soonBar = (label: string, width: string, fill: string) => (
  <div key={label} style={{ ...soonRow, fontSize: '11px' }}>
    <span style={{ flex: '0 0 34%', color: 'var(--navy-800)' }}>{label}</span>
    <span style={{ flex: '1', height: '7px', borderRadius: '999px', background: 'var(--stone-100)', overflow: 'hidden' }}>
      <span style={{ display: 'block', width, height: '100%', background: fill }} />
    </span>
  </div>
);

const MOCKS: Record<string, React.ReactElement> = {
  feed: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <img src="/logos/avatar-1.jpg" alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)' }}>Grace Chapel</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pastor · 2h</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '700', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '3px 8px', borderRadius: '999px' }}>Pinned</span>
        </div>
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--earth)', margin: '11px 0 10px' }}>Baptisms this Sunday — right after both services. Bring a towel and a friend.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
          <div style={{ aspectRatio: '1', borderRadius: '9px', overflow: 'hidden' }}>
            <img src="/features/feed-pic-1.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9px', display: 'block' }} />
          </div>
          <div style={{ aspectRatio: '1', borderRadius: '9px', overflow: 'hidden' }}>
            <img src="/features/feed-pic-2.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9px', display: 'block' }} />
          </div>
          <div style={{ aspectRatio: '1', borderRadius: '9px', overflow: 'hidden' }}>
            <img src="/features/feed-pic-3.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9px', display: 'block' }} />
          </div>
        </div>
        <div style={{ border: '1px solid rgba(45,37,25,0.08)', borderRadius: '11px', padding: '10px 11px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--navy-900)', marginBottom: '8px' }}>Which time for the potluck?</div>
          <div style={{ fontSize: '11px', color: 'var(--earth)', marginBottom: '6px', position: 'relative', background: 'var(--sky-100)', borderRadius: '6px', overflow: 'hidden', padding: '5px 8px' }}>
            <span style={{ position: 'absolute', inset: '0', width: '62%', background: 'var(--sky-200)' }} />
            <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
              <span>After 1st service</span>
              <b>62%</b>
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--earth)', position: 'relative', background: 'var(--stone-200)', borderRadius: '6px', overflow: 'hidden', padding: '5px 8px' }}>
            <span style={{ position: 'absolute', inset: '0', width: '38%', background: 'var(--stone-300)' }} />
            <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
              <span>After 2nd service</span>
              <b>38%</b>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '18px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--gold-600)' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.35-9.5-8.5C1 9 3 6 6 6c1.8 0 3.2 1 4 2 .8-1 2.2-2 4-2 3 0 5 3 3.5 6.5C19 16.65 12 21 12 21Z" /></svg>48</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z" /></svg>12</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M16 6l-4-4-4 4M12 2v13" /></svg>Share</span>
        </div>
      </div>
    </>
  ),
  prayer: (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Prayer wall</span>
        <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--green-700)', background: 'var(--green-100)', padding: '4px 9px', borderRadius: '999px' }}>Auto-clears in 30 days</span>
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '14px', padding: '12px', marginBottom: '8px' }}>
        <p style={{ fontSize: '12.5px', lineHeight: '1.45', color: 'var(--earth)', margin: '0 0 10px' }}>Please pray for my mom's surgery on Thursday. Thank you, church.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Anonymous · 3d</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '700', color: '#fff', background: 'var(--green-600)', padding: '6px 12px', borderRadius: '999px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 14h2a2 2 0 0 0 0-4h-3l-2.5 2.5" /><path d="M4 9l3-3 3 3" /><path d="M20 15l-4 4-3-1" /></svg>Prayed · 14</span>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '14px', padding: '12px', marginBottom: '12px' }}>
        <p style={{ fontSize: '12.5px', lineHeight: '1.45', color: 'var(--earth)', margin: '0 0 10px' }}>Starting a new job Monday — praying for favour and courage.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daniel K. · 5h</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '700', color: 'var(--green-700)', background: 'var(--green-100)', padding: '6px 12px', borderRadius: '999px', border: '1px solid var(--green-200)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 14h2a2 2 0 0 0 0-4h-3l-2.5 2.5" /><path d="M4 9l3-3 3 3" /><path d="M20 15l-4 4-3-1" /></svg>Pray · 9</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '999px', padding: '9px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>Share a prayer request…<span style={{ marginLeft: 'auto', color: 'var(--green-600)', fontWeight: '700' }}>Post</span></div>
    </>
  ),
  map: (
    <>
      <div style={{ position: 'relative', height: '190px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(45,37,25,0.08)' }}>
        <img src="/features/map-shot.webp" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <span style={{ position: 'absolute', left: '46%', top: '52%', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--sky-500)', border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(79,151,214,0.25)', pointerEvents: 'none' }} />
        <svg style={{ position: 'absolute', left: '24%', top: '28%', color: 'var(--gold-600)', pointerEvents: 'none', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }} width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" />
          <circle cx="12" cy="9" r="2.4" fill="#fff" />
        </svg>
        <svg style={{ position: 'absolute', left: '70%', top: '60%', color: 'var(--gold-600)', pointerEvents: 'none', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }} width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" />
          <circle cx="12" cy="9" r="2.4" fill="#fff" />
        </svg>
        <span style={{ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: '600', color: 'var(--navy-900)', background: '#fff', borderRadius: '999px', padding: '5px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', pointerEvents: 'none' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>Locate me</span>
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '14px', padding: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '11px' }}>
        <div style={{ flex: '1' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)' }}>Grace Chapel — Downtown</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-body)', marginTop: '2px' }}>Sun 9:00 & 11:00 · 2.3 mi away</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '11px', background: 'var(--sky-100)', color: 'var(--sky-700)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 20-6-6 6-6M3 14h12a4 4 0 0 0 4-4V4" />
          </svg>
        </span>
      </div>
    </>
  ),
  events: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ height: '96px', position: 'relative', overflow: 'hidden' }}>
          <img src="/features/event-cover.webp" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(180deg,rgba(12,21,38,0.05) 30%,rgba(12,21,38,0.62))', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', left: '12px', bottom: '10px', color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '500', pointerEvents: 'none' }}>Fall Retreat</span>
          <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '10px', fontWeight: '700', color: 'var(--gold-700)', background: '#fff', padding: '3px 8px', borderRadius: '999px', pointerEvents: 'none' }}>Oct 18</span>
        </div>
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(45,37,25,0.06)' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--navy-900)' }}>Adult</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>General admission</div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)' }}>$40</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(45,37,25,0.06)' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--navy-900)' }}>Child</div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Ages 4–12</div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)' }}>$15</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', opacity: '0.55' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--navy-900)' }}>Early Bird</div>
            </div>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--danger,#C4553B)', background: 'rgba(196,85,59,0.1)', padding: '3px 8px', borderRadius: '999px' }}>Waitlist</span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ height: '6px', borderRadius: '999px', background: 'var(--stone-200)', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '70%', height: '100%', background: 'var(--gold-500)' }} />
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '5px' }}>84 / 120 seats confirmed</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', padding: '9px 16px', borderRadius: '999px', flex: '1', textAlign: 'center' }}>Register</span>
            <span style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--stone-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-900)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3M21 21v-4h-4v4h4Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </>
  ),
  checkin: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: '700', color: 'var(--sky-700)', background: 'var(--sky-100)', padding: '4px 10px', borderRadius: '999px', marginBottom: '12px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sky-500)' }} />142 checked in</span>
        <svg width="120" height="120" viewBox="0 0 29 29" shapeRendering="crispEdges" style={{ display: 'block', margin: '0 auto' }}>
          <rect width="29" height="29" fill="#fff" />
          <path fill="var(--navy-900)" d="M0 0h7v1h-7zM8 0h1v1h-1zM11 0h3v1h-3zM16 0h1v1h-1zM18 0h1v1h-1zM22 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM9 1h2v1h-2zM13 1h2v1h-2zM17 1h2v1h-2zM22 1h1v1h-1zM28 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h1v1h-1zM12 2h1v1h-1zM15 2h1v1h-1zM17 2h1v1h-1zM19 2h1v1h-1zM22 2h1v1h-1zM24 2h3v1h-3zM28 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM9 3h1v1h-1zM11 3h2v1h-2zM14 3h4v1h-4zM22 3h1v1h-1zM24 3h3v1h-3zM28 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h2v1h-2zM11 4h1v1h-1zM13 4h1v1h-1zM16 4h3v1h-3zM22 4h1v1h-1zM24 4h3v1h-3zM28 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM8 5h1v1h-1zM10 5h3v1h-3zM15 5h1v1h-1zM18 5h1v1h-1zM22 5h1v1h-1zM28 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM22 6h7v1h-7zM8 7h3v1h-3zM13 7h1v1h-1zM17 7h2v1h-2zM0 8h2v1h-2zM3 8h1v1h-1zM5 8h4v1h-4zM10 8h1v1h-1zM12 8h5v1h-5zM19 8h4v1h-4zM24 8h1v1h-1zM26 8h2v1h-2zM1 9h1v1h-1zM4 9h1v1h-1zM6 9h1v1h-1zM9 9h3v1h-3zM14 9h1v1h-1zM16 9h1v1h-1zM19 9h1v1h-1zM21 9h2v1h-2zM25 9h1v1h-1zM0 10h1v1h-1zM2 10h3v1h-3zM7 10h5v1h-5zM13 10h3v1h-3zM17 10h1v1h-1zM20 10h1v1h-1zM23 10h2v1h-2zM27 10h1v1h-1zM1 11h2v1h-2zM4 11h1v1h-1zM8 11h1v1h-1zM11 11h1v1h-1zM14 11h3v1h-3zM18 11h3v1h-3zM24 11h1v1h-1zM26 11h1v1h-1zM0 12h1v1h-1zM3 12h2v1h-2zM6 12h3v1h-3zM12 12h1v1h-1zM15 12h1v1h-1zM17 12h1v1h-1zM20 12h1v1h-1zM22 12h1v1h-1zM26 12h3v1h-3zM2 13h1v1h-1zM4 13h4v1h-4zM10 13h4v1h-4zM15 13h3v1h-3zM19 13h1v1h-1zM23 13h1v1h-1zM25 13h1v1h-1zM0 14h3v1h-3zM4 14h1v1h-1zM7 14h1v1h-1zM9 14h1v1h-1zM12 14h3v1h-3zM17 14h2v1h-2zM21 14h1v1h-1zM24 14h2v1h-2zM27 14h1v1h-1zM1 15h1v1h-1zM3 15h1v1h-1zM5 15h3v1h-3zM10 15h1v1h-1zM13 15h1v1h-1zM16 15h1v1h-1zM18 15h3v1h-3zM22 15h3v1h-3zM26 15h1v1h-1zM28 15h1v1h-1zM0 16h1v1h-1zM2 16h1v1h-1zM6 16h1v1h-1zM8 16h4v1h-4zM13 16h1v1h-1zM15 16h1v1h-1zM19 16h1v1h-1zM21 16h4v1h-4zM26 16h2v1h-2zM4 17h3v1h-3zM8 17h1v1h-1zM10 17h1v1h-1zM12 17h4v1h-4zM17 17h1v1h-1zM20 17h1v1h-1zM23 17h1v1h-1zM25 17h2v1h-2zM0 18h5v1h-5zM6 18h5v1h-5zM12 18h1v1h-1zM14 18h1v1h-1zM17 18h4v1h-4zM22 18h1v1h-1zM24 18h1v1h-1zM26 18h1v1h-1zM28 18h1v1h-1zM8 19h1v1h-1zM11 19h3v1h-3zM15 19h2v1h-2zM19 19h1v1h-1zM23 19h3v1h-3zM27 19h1v1h-1zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM8 20h3v1h-3zM12 20h3v1h-3zM16 20h1v1h-1zM18 20h1v1h-1zM20 20h1v1h-1zM24 20h1v1h-1zM26 20h3v1h-3zM8 21h2v1h-2zM11 21h1v1h-1zM13 21h1v1h-1zM16 21h5v1h-5zM24 21h1v1h-1zM26 21h1v1h-1zM0 22h7v1h-7zM8 22h1v1h-1zM10 22h1v1h-1zM13 22h3v1h-3zM17 22h1v1h-1zM20 22h1v1h-1zM22 22h1v1h-1zM24 22h5v1h-5zM0 23h1v1h-1zM6 23h1v1h-1zM10 23h3v1h-3zM14 23h1v1h-1zM17 23h1v1h-1zM19 23h2v1h-2zM24 23h1v1h-1zM28 23h1v1h-1zM0 24h1v1h-1zM2 24h3v1h-3zM6 24h1v1h-1zM8 24h1v1h-1zM11 24h1v1h-1zM13 24h1v1h-1zM15 24h4v1h-4zM20 24h1v1h-1zM22 24h4v1h-4zM27 24h1v1h-1zM0 25h1v1h-1zM2 25h3v1h-3zM6 25h1v1h-1zM8 25h2v1h-2zM12 25h1v1h-1zM14 25h1v1h-1zM17 25h3v1h-3zM24 25h1v1h-1zM26 25h1v1h-1zM0 26h1v1h-1zM2 26h3v1h-3zM6 26h1v1h-1zM9 26h4v1h-4zM15 26h1v1h-1zM17 26h1v1h-1zM19 26h1v1h-1zM21 26h1v1h-1zM24 26h1v1h-1zM26 26h3v1h-3zM0 27h1v1h-1zM6 27h1v1h-1zM8 27h1v1h-1zM10 27h2v1h-2zM14 27h5v1h-5zM20 27h1v1h-1zM24 27h1v1h-1zM0 28h7v1h-7zM9 28h3v1h-3zM13 28h1v1h-1zM16 28h4v1h-4zM21 28h1v1h-1zM23 28h1v1h-1zM25 28h1v1h-1zM27 28h1v1h-1z" />
        </svg>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)', marginTop: '12px' }}>Scan to check in</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>No app. No account. Just your name.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '13px' }}>
          <span style={{ flex: '1', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', border: '1px solid rgba(45,37,25,0.12)', borderRadius: '9px', padding: '8px 11px' }}>First name</span>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', background: 'var(--sky-600)', padding: '9px 15px', borderRadius: '9px' }}>Check in</span>
        </div>
      </div>
    </>
  ),
  livestream: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src="/features/livestream-shot.webp" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(180deg,rgba(8,15,29,0.28),rgba(8,15,29,0.5))', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', top: '9px', left: '9px', pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '9.5px', fontWeight: '800', letterSpacing: '0.06em', color: '#fff', background: 'var(--danger,#C4553B)', padding: '3px 8px', borderRadius: '5px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />LIVE</span>
          <span style={{ position: 'absolute', top: '9px', right: '9px', fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.35)', padding: '3px 8px', borderRadius: '999px', pointerEvents: 'none' }}>1,204 watching</span>
          <span style={{ position: 'relative', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '11.5px', fontWeight: '700', color: 'var(--navy-900)', padding: '9px', borderBottom: '2px solid var(--gold-500)' }}>Chat</span>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '11.5px', fontWeight: '600', color: 'var(--text-muted)', padding: '9px' }}>Notes</span>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--earth)' }}><b style={{ color: 'var(--sky-700)' }}>Ruth</b> Watching from Kenya 🙏</div>
          <div style={{ fontSize: '11.5px', color: 'var(--earth)' }}><b style={{ color: 'var(--green-700)' }}>Marcus</b> This word is for me tonight.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--gold-100)', border: '1px solid var(--gold-200)', borderRadius: '11px', padding: '8px 10px', marginTop: '3px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 14h2a2 2 0 0 0 0-4h-3l-2.5 2.5" />
              <path d="M4 9l3-3 3 3" />
              <path d="M20 15l-4 4-3-1" />
            </svg>
            <span style={{ fontSize: '11px', color: 'var(--gold-700)', fontWeight: '600', flex: '1' }}>Submit a prayer request…</span>
          </div>
          <span style={{ alignSelf: 'stretch', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)', background: 'var(--gold-500)', borderRadius: '999px', padding: '8px', marginTop: '3px' }}>Give</span>
        </div>
      </div>
    </>
  ),
  bible: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: '500', color: 'var(--navy-900)' }}>John 3</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: '600', color: 'var(--gold-700)', background: 'var(--gold-100)', border: '1px solid var(--gold-200)', padding: '4px 9px', borderRadius: '999px' }}>BSB<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 9 6 6 6-6" /></svg></span>
        </div>
        <div style={{ padding: '13px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <p style={{ fontSize: '12.5px', lineHeight: '1.55', color: 'var(--earth)', margin: '0' }}><sup style={{ color: 'var(--text-muted)', fontWeight: '700' }}>15</sup> that everyone who believes in Him may have eternal life.</p>
          <p style={{ fontSize: '12.5px', lineHeight: '1.55', color: 'var(--earth)', margin: '0', background: 'var(--gold-100)', borderRadius: '8px', padding: '8px 10px', boxShadow: 'inset 0 0 0 1px var(--gold-200)' }}><sup style={{ color: 'var(--gold-700)', fontWeight: '700' }}>16</sup> For God so loved the world that He gave His one and only Son, that everyone who believes in Him shall not perish but have eternal life.</p>
          <p style={{ fontSize: '12.5px', lineHeight: '1.55', color: 'var(--earth)', margin: '0' }}><sup style={{ color: 'var(--text-muted)', fontWeight: '700' }}>17</sup> For God did not send His Son into the world to condemn the world…</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px', borderTop: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', marginRight: '2px' }}>Highlight</span>
          <span style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--gold-500)', boxShadow: '0 0 0 2px #fff,0 0 0 3px var(--gold-500)' }} />
          <span style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--green-500)' }} />
          <span style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'var(--sky-500)' }} />
          <span style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#D98BB0' }} />
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: '12px', color: 'var(--navy-800)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
              <path d="M16 6l-4-4-4 4M12 2v13" />
            </svg>
          </span>
        </div>
      </div>
    </>
  ),
  courses: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green-700)' }}>Discipleship track</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: '500', color: 'var(--navy-900)', marginTop: '2px' }}>Foundations of Faith</div>
          <div style={{ height: '5px', borderRadius: '999px', background: 'var(--stone-200)', overflow: 'hidden', marginTop: '9px' }}>
            <span style={{ display: 'block', width: '60%', height: '100%', background: 'var(--green-500)' }} />
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '5px' }}>6 of 10 lessons · Level 2</div>
        </div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}><span style={{ width: '17px', height: '17px', borderRadius: '50%', background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}><svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M5 10l3 3 7-7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>Who Is Jesus?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: '600', color: 'var(--navy-900)', background: 'var(--green-100)', border: '1px solid var(--green-200)', borderRadius: '9px', padding: '7px 8px' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2"><path d="M8 5v14l11-7z" /></svg>Grace & Forgiveness<span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '600', color: 'var(--green-700)' }}>14:20</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}><span style={{ width: '17px', height: '17px', borderRadius: '50%', border: '1.5px solid var(--stone-300)', flexShrink: '0' }} />Prayer & the Word<span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: '700', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '2px 6px', borderRadius: '999px' }}>Quiz</span></div>
        </div>
        <div style={{ margin: '2px 13px 13px', background: 'var(--navy-900)', borderRadius: '12px', padding: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#fff', fontSize: '11.5px', fontWeight: '700', marginBottom: '8px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4.2L18 8.8l-4.4 1.6L12 15l-1.6-4.6L6 8.8l4.4-1.6L12 3Z" /></svg>Draft a lesson from a video</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', padding: '7px 9px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
            <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>youtu.be/sunday-sermon…</span>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--navy-900)', background: 'var(--gold-500)', padding: '5px 10px', borderRadius: '7px' }}>Generate</span>
          </div>
        </div>
      </div>
    </>
  ),
  blog: (
    <>
      <div style={{ background: '#eef2f5', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '999px', padding: '7px 12px', boxShadow: '0 1px 3px rgba(45,37,25,0.06)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <span style={{ fontSize: '11.5px', color: 'var(--navy-800)' }}>churches near me</span>
        </div>
        <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', margin: '11px 2px 6px' }}>Top result</div>
        <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: '74px', overflow: 'hidden' }}>
            <img src="/features/blog-cover.webp" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ padding: '11px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <span style={{ fontSize: '9.5px', fontWeight: '700', color: 'var(--sky-700)', background: 'var(--sky-100)', padding: '2px 8px', borderRadius: '999px' }}>Welcome</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>4 min read</span>
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: '500', color: 'var(--sky-800)', lineHeight: '1.2' }}>Looking for a church in Fairview? Start here.</div>
            <div style={{ fontSize: '11px', lineHeight: '1.45', color: 'var(--text-body)', marginTop: '5px' }}>Whether you're new to town or new to faith, here's what a Sunday with our family looks like…</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '9px', paddingTop: '9px', borderTop: '1px solid rgba(45,37,25,0.06)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span style={{ fontSize: '9.5px', color: 'var(--green-700)', fontWeight: '600' }}>SEO title · meta · OpenGraph · schema.org ✓</span>
            </div>
          </div>
        </div>
      </div>
    </>
  ),
  aiblog: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold-700)' }}>Your knowledge base</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--navy-800)', background: 'var(--stone-100)', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '999px', padding: '3px 9px' }}>Sermon · Romans</span>
            <span style={{ fontSize: '10px', color: 'var(--navy-800)', background: 'var(--stone-100)', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '999px', padding: '3px 9px' }}>Teaching notes</span>
            <span style={{ fontSize: '10px', color: 'var(--navy-800)', background: 'var(--stone-100)', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '999px', padding: '3px 9px' }}>+22 more</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '8px', color: 'var(--gold-700)', fontSize: '16px' }}>↓</div>
        <div style={{ margin: '0 13px 13px', background: 'var(--stone-100)', border: '1px solid rgba(45,37,25,0.07)', borderRadius: '12px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: '700', color: '#fff', background: 'var(--gold-600)', padding: '2px 7px', borderRadius: '999px' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3l1.6 4.2L18 8.8l-4.4 1.6L12 15l-1.6-4.6L6 8.8l4.4-1.6L12 3Z" /></svg>AI · from your teaching</span>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: '500', color: 'var(--navy-900)', lineHeight: '1.2' }}>What Grace Really Means: A Study in Romans</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: '1.4' }}>Meta · 148 chars · slug: what-grace-really-means · 6 min read</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '0 13px 13px', fontSize: '11.5px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', borderRadius: '9px', padding: '9px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" /></svg>Generate now</div>
      </div>
    </>
  ),
  docs: (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '0.72fr 1.28fr', gap: '8px', height: '290px' }}>
        <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '13px', padding: '9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '4px 5px' }}>Docs</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--earth)', padding: '6px 5px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>Sermons</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: '#fff', background: 'var(--navy-900)', borderRadius: '7px', padding: '6px 5px', marginLeft: '8px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 4h8l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /></svg>John 3 outline</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--earth)', padding: '6px 5px', marginLeft: '8px' }}>Advent series</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--earth)', padding: '6px 5px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h3l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>Team meetings</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '13px', padding: '11px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: '500', color: 'var(--navy-900)' }}>John 3 outline</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', color: 'var(--green-700)', fontWeight: '600' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)' }} />Saved</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', flex: '1' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--navy-900)' }}>1. Born again (v.3)</div>
            <div style={{ height: '6px', width: '88%', borderRadius: '3px', background: 'var(--stone-100)' }} />
            <div style={{ height: '6px', width: '72%', borderRadius: '3px', background: 'var(--stone-100)' }} />
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--navy-900)', marginTop: '4px' }}>2. So loved the world (v.16)</div>
            <div style={{ height: '6px', width: '80%', borderRadius: '3px', background: 'var(--stone-100)' }} />
            <div style={{ height: '6px', width: '64%', borderRadius: '3px', background: 'var(--stone-100)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#fff', background: 'var(--gold-600)', borderRadius: '9px', padding: '8px', marginTop: '8px' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /></svg>Push to livestream</div>
        </div>
      </div>
    </>
  ),
  knowledge: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>AI Knowledge</div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--navy-800)' }}>
            <span style={{ fontSize: '8.5px', fontWeight: '700', color: 'var(--sky-700)', background: 'var(--sky-100)', padding: '2px 6px', borderRadius: '5px' }}>TXT</span>
            <span style={{ flex: '1' }}>Sunday sermon — Romans</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>42 chunks</span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green-500)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--navy-800)' }}>
            <span style={{ fontSize: '8.5px', fontWeight: '700', color: 'var(--green-700)', background: 'var(--green-100)', padding: '2px 6px', borderRadius: '5px' }}>CSV</span>
            <span style={{ flex: '1' }}>Membership notes</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>12 chunks</span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green-500)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '8.5px', fontWeight: '700', color: 'var(--sky-700)', background: 'var(--sky-100)', padding: '2px 6px', borderRadius: '5px' }}>TXT</span>
            <span style={{ flex: '1' }}>Youth talk — identity</span>
            <span style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--gold-700)' }}>Processing…</span>
          </div>
        </div>
        <div style={{ margin: '2px 13px 0', padding: '11px', background: 'var(--stone-100)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Query use this month</span>
              <span>41%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', background: '#fff', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '41%', height: '100%', background: 'var(--green-500)' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Knowledge capacity</span>
              <span>62% · room to spare</span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', background: '#fff', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '62%', height: '100%', background: 'var(--gold-500)' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '11px 13px 13px', border: '1px dashed rgba(45,37,25,0.2)', borderRadius: '9px', padding: '8px 10px', fontSize: '11px', color: 'var(--text-muted)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>Paste text, or upload .txt / .csv<span style={{ marginLeft: 'auto', fontWeight: '700', color: 'var(--navy-900)' }}>Add</span></div>
      </div>
    </>
  ),
  aichat: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green-500)' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Ask Grace Chapel</span>
        </div>
        <div style={{ padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <div style={{ alignSelf: 'flex-end', maxWidth: '78%', fontSize: '11.5px', lineHeight: '1.4', color: '#fff', background: 'var(--navy-900)', borderRadius: '12px 12px 3px 12px', padding: '8px 11px' }}>What does our church teach about baptism?</div>
          <div style={{ alignSelf: 'flex-start', maxWidth: '82%', fontSize: '11.5px', lineHeight: '1.45', color: 'var(--earth)', background: 'var(--stone-100)', borderRadius: '12px 12px 12px 3px', padding: '8px 11px' }}>We practise believer's baptism by immersion — a public step of obedience after someone puts their faith in Christ.</div>
          <div style={{ marginTop: '2px', border: '1px solid var(--green-200)', background: 'var(--green-100)', borderRadius: '14px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-600)', color: '#fff', flexShrink: '0' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21V9M12 9c0-2.5 1.7-4 4-4 0 2.5-1.7 4-4 4ZM12 9C12 6.5 10.3 5 8 5c0 2.5 1.7 4 4 4Z" />
                </svg>
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--green-700)' }}>Some questions are best taken to God</span>
            </div>
            <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#2f4023', margin: '0 0 8px' }}>You've asked a lot today — and that's good. For this one, try getting quiet, opening Scripture, and praying honestly before you listen.</p>
            <div style={{ fontSize: '10px', color: 'var(--green-700)', fontWeight: '600' }}>John 14:26 · Psalm 46:10 · 1 Kings 19:11–12</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 13px 13px', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '999px', padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>Message…<span style={{ marginLeft: 'auto', display: 'inline-flex', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-600)', color: '#fff', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></div>
      </div>
    </>
  ),
  newsletter: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>New newsletter</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 13px 0' }}>
          <span style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>To</span>
          <span style={{ flex: '1', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '999px', padding: '6px 11px', fontSize: '10.5px', fontWeight: '600', color: 'var(--navy-900)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sky-700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            </svg>
            Your Mailchimp audience
            <span style={{ marginLeft: 'auto', fontSize: '9.5px', fontWeight: '600', color: 'var(--text-muted)' }}>412 subscribers</span>
          </span>
        </div>
        <div style={{ margin: '11px 13px 0', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '12px', padding: '11px' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-700)', marginBottom: '4px' }}>Draft · review before sending</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: '500', color: 'var(--navy-900)', lineHeight: '1.2' }}>This month at Grace: baptisms, youth camp & more</div>
          <div style={{ height: '5px', width: '92%', borderRadius: '3px', background: 'var(--stone-100)', marginTop: '8px' }} />
          <div style={{ height: '5px', width: '78%', borderRadius: '3px', background: 'var(--stone-100)', marginTop: '6px' }} />
          <div style={{ height: '5px', width: '86%', borderRadius: '3px', background: 'var(--stone-100)', marginTop: '6px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '11px 13px 13px' }}>
          <span style={{ flex: '1', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="var(--text-muted)"><circle cx="12" cy="12" r="10" /></svg>via your Mailchimp</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', padding: '8px 15px', borderRadius: '8px' }}>Send</span>
        </div>
      </div>
    </>
  ),
  /* The Ministry-only Instagram generator. Its own vignette, because the one
     above it is the newsletter every Small Team plan already has. */
  autonewsletter: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Generate from Instagram</div>
        <div style={{ margin: '11px 13px 0', border: '1px solid var(--sky-200)', background: 'var(--sky-100)', borderRadius: '12px', padding: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sky-700)" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="var(--sky-700)" />
            </svg>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--navy-900)' }}>Sept 1 – Sept 30</span>
            <span style={{ marginLeft: 'auto', fontSize: '9.5px', fontWeight: '600', color: 'var(--sky-700)' }}>14 posts</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
            {['Baptism Sunday', 'Youth camp', 'Serve day'].map((t) => (
              <span key={t} style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--navy-900)', background: '#fff', border: '1px solid var(--sky-200)', borderRadius: '999px', padding: '4px 8px' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ margin: '9px 13px 0', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '12px', padding: '11px' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold-700)', marginBottom: '4px' }}>AI draft · review before sending</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: '500', color: 'var(--navy-900)', lineHeight: '1.2' }}>This month at Grace: baptisms, youth camp & more</div>
          <div style={{ height: '5px', width: '92%', borderRadius: '3px', background: 'var(--stone-100)', marginTop: '8px' }} />
          <div style={{ height: '5px', width: '78%', borderRadius: '3px', background: 'var(--stone-100)', marginTop: '6px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '11px 13px 13px' }}>
          <span style={{ flex: '1', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="var(--text-muted)"><circle cx="12" cy="12" r="10" /></svg>edit, then send via Mailchimp</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', padding: '8px 15px', borderRadius: '8px' }}>Open draft</span>
        </div>
      </div>
    </>
  ),
  sms: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>New broadcast</div>
        <div style={{ padding: '11px 13px' }}>
          <div style={{ border: '1px solid rgba(45,37,25,0.1)', borderRadius: '10px', padding: '10px', fontSize: '11.5px', lineHeight: '1.45', color: 'var(--earth)' }}>Reminder: baptism Sunday starts at 9am. Bring a towel and a friend! 🌊</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1 segment · 148/160</span>
            <span style={{ fontSize: '10px', color: 'var(--green-700)', fontWeight: '600' }}>312 recipients</span>
          </div>
          <div style={{ display: 'flex', gap: '5px', marginTop: '9px' }}>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#fff', background: 'var(--navy-900)', padding: '5px 10px', borderRadius: '999px' }}>All members</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--navy-800)', border: '1px solid rgba(45,37,25,0.15)', padding: '5px 10px', borderRadius: '999px' }}>Donors</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--navy-800)', border: '1px solid rgba(45,37,25,0.15)', padding: '5px 10px', borderRadius: '999px' }}>Tag…</span>
          </div>
        </div>
        <div style={{ margin: '2px 13px 13px', background: 'var(--green-100)', border: '1px solid var(--green-200)', borderRadius: '12px', padding: '11px' }}>
          <div style={{ fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--green-700)', marginBottom: '5px' }}>Text-to-Give</div>
          <div style={{ fontSize: '12px', color: 'var(--navy-900)' }}>Text <b style={{ color: 'var(--green-700)' }}>GIVE</b> to <b>(555) 019-2842</b> → your giving link, instantly.</div>
        </div>
      </div>
    </>
  ),
  forms: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Connect card</div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Full name</div>
          <div style={{ border: '1px solid rgba(45,37,25,0.12)', borderRadius: '8px', padding: '7px 9px', fontSize: '11.5px', color: 'var(--navy-900)' }}>Sarah Mitchell</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Email</div>
          <div style={{ border: '1px solid rgba(45,37,25,0.12)', borderRadius: '8px', padding: '7px 9px', fontSize: '11.5px', color: 'var(--navy-900)' }}>sarah.m@email.com</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', borderRadius: '8px', padding: '8px', marginTop: '3px' }}>Submit</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-600)', fontSize: '15px' }}>↓</div>
        <div style={{ margin: '0 13px 13px', background: 'var(--gold-100)', border: '1px solid var(--gold-200)', borderRadius: '12px', padding: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logos/avatar-3.jpg" alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Sarah Mitchell</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>New contact · tagged <b style={{ color: 'var(--gold-700)' }}>form</b></div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: '700', color: 'var(--green-700)', background: 'var(--green-100)', padding: '3px 8px', borderRadius: '999px' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6 9 17l-5-5" /></svg>in CRM</span>
        </div>
      </div>
    </>
  ),
  donation: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Partner with us</div>
        <div style={{ padding: '13px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px' }}>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--navy-800)', border: '1px solid rgba(45,37,25,0.12)', borderRadius: '9px', padding: '9px 0' }}>$25</div>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', background: 'var(--gold-500)', borderRadius: '9px', padding: '9px 0', boxShadow: '0 4px 12px rgba(201,150,58,0.35)' }}>$50</div>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--navy-800)', border: '1px solid rgba(45,37,25,0.12)', borderRadius: '9px', padding: '9px 0' }}>$100</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '9px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>One-time gift</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--navy-900)' }}>$50.00</span>
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', borderRadius: '9px', padding: '10px', marginTop: '10px' }}>Give $50</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '11px', background: 'var(--green-100)', border: '1px solid var(--green-200)', borderRadius: '10px', padding: '9px 10px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="1.8">
              <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span style={{ fontSize: '10.5px', lineHeight: '1.4', color: 'var(--green-700)', fontWeight: '600' }}>Lands straight in your church's Stripe account — never ours.</span>
          </div>
        </div>
      </div>
    </>
  ),
  fundraising: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '82px', overflow: 'hidden' }}>
          <img src="/features/campaign-cover.webp" alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(180deg,rgba(12,21,38,0.05) 30%,rgba(12,21,38,0.6))', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', left: '12px', bottom: '9px', color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: '500', pointerEvents: 'none' }}>Building Fund</span>
        </div>
        <div style={{ padding: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--navy-900)' }}>$128,400</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>of $250,000</span>
          </div>
          <div style={{ height: '8px', borderRadius: '999px', background: 'var(--stone-200)', overflow: 'hidden', marginTop: '8px' }}>
            <span style={{ display: 'block', width: '51%', height: '100%', background: 'var(--green-500)' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '11px' }}>
            <div style={{ flex: '1', background: 'var(--stone-100)', borderRadius: '9px', padding: '8px 10px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)' }}>312</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>gifts</div>
            </div>
            <div style={{ flex: '1', background: 'var(--stone-100)', borderRadius: '9px', padding: '8px 10px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)' }}>48</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>pledges tracked</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '9px', fontSize: '10.5px', color: 'var(--text-muted)', borderTop: '1px solid rgba(45,37,25,0.06)', paddingTop: '9px' }}>
            <span>The Okonkwo family · pledged $2,000</span>
            <span style={{ fontWeight: '700', color: 'var(--green-700)' }}>$1,200 paid</span>
          </div>
        </div>
      </div>
    </>
  ),
  crm: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <img src="/logos/avatar-3.jpg" alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)' }}>Sarah Mitchell</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Member since 2021</div>
          </div>
          <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '3px 8px', borderRadius: '999px' }}>Donor & Member</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '11px 13px 0' }}>
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)' }}>$1,240</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>total given</div>
          </div>
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy-900)' }}>12</div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>activities</div>
          </div>
        </div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--earth)' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold-500)' }} />Gave $50 · one-time<span style={{ marginLeft: 'auto', fontSize: '9.5px', color: 'var(--text-muted)' }}>2d</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--earth)' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sky-500)' }} />Registered · Fall Retreat<span style={{ marginLeft: 'auto', fontSize: '9.5px', color: 'var(--text-muted)' }}>1w</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--earth)' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)' }} />Checked in · Sunday<span style={{ marginLeft: 'auto', fontSize: '9.5px', color: 'var(--text-muted)' }}>1w</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 13px 11px', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '9px', padding: '8px 10px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--navy-800)" strokeWidth="1.7" strokeLinejoin="round">
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
            <path d="m3 7 9 6 9-6" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--navy-900)', flex: '1' }}>Email Sarah</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: '700', color: 'var(--green-700)', background: 'var(--green-100)', padding: '3px 8px', borderRadius: '999px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green-500)' }} />Gmail connected</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '0 13px 13px' }}>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '8.5px', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--stone-100)', borderRadius: '6px', padding: '5px 0' }}>New</span>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '8.5px', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--stone-100)', borderRadius: '6px', padding: '5px 0' }}>Connected</span>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '8.5px', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--stone-100)', borderRadius: '6px', padding: '5px 0' }}>Active</span>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '8.5px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', borderRadius: '6px', padding: '5px 0' }}>Giving</span>
          <span style={{ flex: '1', textAlign: 'center', fontSize: '8.5px', fontWeight: '600', color: 'var(--text-muted)', background: 'var(--stone-100)', borderRadius: '6px', padding: '5px 0' }}>Champion</span>
        </div>
      </div>
    </>
  ),
  accounting: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Accounting</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '9.5px', fontWeight: '600', color: 'var(--green-700)', background: 'var(--green-100)', padding: '3px 9px', borderRadius: '999px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)' }} />QuickBooks connected</span>
        </div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ fontFamily: 'var(--font-mono,monospace)', color: 'var(--text-muted)' }}>#1042</span>
            <span style={{ flex: '1', color: 'var(--navy-800)' }}>Donation receipt</span>
            <span style={{ fontWeight: '700', color: 'var(--navy-900)' }}>$50</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: '700', color: 'var(--green-700)' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6 9 17l-5-5" /></svg>Synced</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>#1043</span>
            <span style={{ flex: '1', color: 'var(--navy-800)' }}>Event ticket</span>
            <span style={{ fontWeight: '700', color: 'var(--navy-900)' }}>$40</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: '700', color: 'var(--green-700)' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6 9 17l-5-5" /></svg>Synced</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)' }}>#1044</span>
            <span style={{ flex: '1', color: 'var(--navy-800)' }}>Donation receipt</span>
            <span style={{ fontWeight: '700', color: 'var(--navy-900)' }}>$100</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: '700', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '2px 7px', borderRadius: '999px' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>Retry</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '2px 13px 13px', fontSize: '11px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', borderRadius: '9px', padding: '9px' }}>Sync all receipts</div>
      </div>
    </>
  ),
  affiliate: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Affiliate</span>
          <span style={{ fontSize: '9.5px', fontWeight: '700', color: 'var(--gold-700)', background: 'var(--gold-100)', padding: '3px 9px', borderRadius: '999px' }}>30% · every plan</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '13px' }}>
          <div style={{ flex: '1', background: 'var(--navy-900)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.55)' }}>This month</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', marginTop: '2px' }}>$224</div>
            <div style={{ fontSize: '9px', color: 'var(--gold-400)', marginTop: '1px' }}>pending payout</div>
          </div>
          <div style={{ flex: '1', background: 'var(--stone-100)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Lifetime</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--navy-900)', marginTop: '2px' }}>$3,180</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>earned</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', margin: '0 13px 13px', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '9px', padding: '8px 10px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
            <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
          </svg>
          <span style={{ fontSize: '10.5px', color: 'var(--navy-800)', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>harvest.app/r/grace-chapel</span>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--navy-900)' }}>Copy</span>
        </div>
      </div>
    </>
  ),
  webapp: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: 'var(--stone-100)', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ display: 'flex', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d9534f', opacity: '.5' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f0ad4e', opacity: '.5' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5cb85c', opacity: '.5' }} />
          </span>
          <span style={{ flex: '1', background: '#fff', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '6px', padding: '4px 9px', fontSize: '10.5px', color: 'var(--text-muted)' }}>gracechapel.theharvest.app</span>
        </div>
        <div style={{ padding: '13px' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: '500', color: 'var(--navy-900)', marginBottom: '9px' }}>Home</div>
          <div style={{ background: 'var(--stone-100)', borderRadius: '11px', padding: '11px', marginBottom: '8px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--navy-900)' }}>Baptism Sunday</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Doors open 9am — bring a friend.</div>
          </div>
          <div style={{ background: 'var(--stone-100)', borderRadius: '11px', height: '34px', opacity: '0.6' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '9px 6px', borderTop: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '8px', color: 'var(--sky-700)', fontWeight: '600' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>Home</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '8px', color: 'var(--text-muted)' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5V4.5Z" /></svg>Bible</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '8px', color: 'var(--text-muted)' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-5A8 8 0 1 1 21 11.5Z" /></svg>Chat</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '8px', color: 'var(--text-muted)' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /></svg>Map</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '8px', color: 'var(--text-muted)' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>Profile</span>
        </div>
      </div>
    </>
  ),
  pwa: (
    <>
      <div style={{ background: 'linear-gradient(160deg,#20395f,var(--navy-950))', borderRadius: '22px', padding: '16px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px 10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>Photos</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>Maps</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' }}>
            <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,0.35)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <img src="/logos/harvest-mark.png" alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </span>
            <span style={{ fontSize: '8.5px', color: '#fff', fontWeight: '700' }}>Grace Chapel</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,0.12)' }} />
            <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>Notes</span>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', gap: '11px' }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '11px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <img src="/logos/harvest-mark.png" alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          </span>
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Add Grace Chapel</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>to your home screen · your name, your icon</div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', padding: '7px 13px', borderRadius: '8px' }}>Install</span>
        </div>
      </div>
    </>
  ),
  dashboard: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <img src="/logos/avatar-2.jpg" alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--navy-900)' }}>David R.</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Check-in lead · Eastside</div>
          </div>
        </div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--navy-800)' }}>Check-in & QR codes<span style={{ marginLeft: 'auto', width: '30px', height: '17px', borderRadius: '999px', background: 'var(--green-500)', position: 'relative' }}><span style={{ position: 'absolute', top: '2px', right: '2px', width: '13px', height: '13px', borderRadius: '50%', background: '#fff' }} /></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--navy-800)' }}>Events<span style={{ marginLeft: 'auto', width: '30px', height: '17px', borderRadius: '999px', background: 'var(--green-500)', position: 'relative' }}><span style={{ position: 'absolute', top: '2px', right: '2px', width: '13px', height: '13px', borderRadius: '50%', background: '#fff' }} /></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>CRM & giving records<span style={{ marginLeft: 'auto', width: '30px', height: '17px', borderRadius: '999px', background: 'var(--stone-300)', position: 'relative' }}><span style={{ position: 'absolute', top: '2px', left: '2px', width: '13px', height: '13px', borderRadius: '50%', background: '#fff' }} /></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>Accounting<span style={{ marginLeft: 'auto', width: '30px', height: '17px', borderRadius: '999px', background: 'var(--stone-300)', position: 'relative' }}><span style={{ position: 'absolute', top: '2px', left: '2px', width: '13px', height: '13px', borderRadius: '50%', background: '#fff' }} /></span></div>
        </div>
        <div style={{ margin: '2px 13px 13px', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--stone-100)', borderRadius: '9px', padding: '8px 10px' }}>Sees Eastside registrations only · 23 permissions, per person</div>
      </div>
    </>
  ),
  branding: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)', fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Branding</div>
        <div style={{ padding: '13px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', overflow: 'hidden', flexShrink: '0' }}>
              <img src="/features/brand-icon.webp" alt="" style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '12px', display: 'block' }} />
            </div>
            <div style={{ flex: '1' }}>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Ministry name</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy-900)' }}>Grace Chapel</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#3E6B4F', boxShadow: '0 2px 6px rgba(62,107,79,0.4)' }} />
            <div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Brand colour</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--navy-900)', fontFamily: 'var(--font-mono,monospace)' }}>#3E6B4F</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '9.5px', color: 'var(--green-700)', fontWeight: '600' }}>applied before first paint</span>
          </div>
          <div style={{ borderTop: '1px solid rgba(45,37,25,0.07)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--navy-800)" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9S14.5 18.5 12 21" />
            </svg>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--navy-900)', flex: '1' }}>gracechapel.org</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: '700', color: 'var(--green-700)', background: 'var(--green-100)', padding: '3px 8px', borderRadius: '999px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)' }} />Active</span>
          </div>
        </div>
      </div>
    </>
  ),
  churches: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', borderBottom: '1px solid rgba(45,37,25,0.07)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>Campuses</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>3 locations</span>
        </div>
        <div style={{ padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '11.5px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sky-600)" strokeWidth="1.8">
              <path d="M12 6 5 10v10h14V10l-7-4Z" />
            </svg>
            <div style={{ flex: '1' }}>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>Downtown</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Sun 9:00 & 11:00 · Pastor James</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '11.5px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sky-600)" strokeWidth="1.8">
              <path d="M12 6 5 10v10h14V10l-7-4Z" />
            </svg>
            <div style={{ flex: '1' }}>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>Eastside</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Sun 10:00 · Pastor Amara</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '11.5px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sky-600)" strokeWidth="1.8">
              <path d="M12 6 5 10v10h14V10l-7-4Z" />
            </svg>
            <div style={{ flex: '1' }}>
              <div style={{ fontWeight: '600', color: 'var(--navy-900)' }}>Online</div>
              <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Livestream · Sun 11:00</div>
            </div>
          </div>
        </div>
        <div style={{ margin: '2px 13px 13px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed rgba(45,37,25,0.2)', borderRadius: '9px', padding: '9px 11px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--navy-800)" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span style={{ fontSize: '11px', color: 'var(--navy-800)', fontWeight: '600', flex: '1' }}>Add a campus</span>
          {/* Hidden add-on — see the ⚠️ note on the `churches` feature entry. */}
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--gold-700)' }}>+$20/mo · you confirm first</span>
        </div>
      </div>
    </>
  ),
  analytics: (
    <>
      <div style={{ background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '5px', padding: '11px 13px 0' }}>
          <span style={{ fontSize: '9.5px', fontWeight: '700', color: '#fff', background: 'var(--navy-900)', padding: '3px 9px', borderRadius: '999px' }}>30d</span>
          <span style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--text-muted)', padding: '3px 9px' }}>7d</span>
          <span style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--text-muted)', padding: '3px 9px' }}>3d</span>
        </div>
        <div style={{ margin: '11px 13px', background: 'linear-gradient(135deg,var(--gold-100),#fdf6e8)', border: '1px solid var(--gold-200)', borderRadius: '14px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: '400', color: 'var(--gold-700)', lineHeight: '1' }}>142</div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--navy-900)', marginTop: '5px' }}>said yes to Jesus this month</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '0 13px' }}>
          <div style={{ flex: '1', background: 'var(--stone-100)', borderRadius: '9px', padding: '8px 10px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)' }}>1,204</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>total members</div>
          </div>
          <div style={{ flex: '1', background: 'var(--stone-100)', borderRadius: '9px', padding: '8px 10px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)' }}>18</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>countries</div>
          </div>
        </div>
        <div style={{ padding: '11px 13px 13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ width: '70px', color: 'var(--navy-800)' }}>Kenya</span>
            <span style={{ flex: '1', height: '7px', borderRadius: '999px', background: 'var(--stone-100)', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '82%', height: '100%', background: 'var(--sky-500)' }} />
            </span>
            <span style={{ color: 'var(--text-muted)' }}>312</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ width: '70px', color: 'var(--navy-800)' }}>USA</span>
            <span style={{ flex: '1', height: '7px', borderRadius: '999px', background: 'var(--stone-100)', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '63%', height: '100%', background: 'var(--sky-500)' }} />
            </span>
            <span style={{ color: 'var(--text-muted)' }}>240</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ width: '70px', color: 'var(--navy-800)' }}>Brazil</span>
            <span style={{ flex: '1', height: '7px', borderRadius: '999px', background: 'var(--stone-100)', overflow: 'hidden' }}>
              <span style={{ display: 'block', width: '34%', height: '100%', background: 'var(--sky-500)' }} />
            </span>
            <span style={{ color: 'var(--text-muted)' }}>128</span>
          </div>
        </div>
      </div>
    </>
  ),
  /* 1 · Scheduling and publishing — the composer, mid-write. What a person in a
     church office is actually looking at: one caption, the accounts it goes to,
     the first comment queued behind it, and when it leaves. */
  'scheduler-publishing': (
    <>
      <div style={soonCard}>
        <div style={soonHead}>
          <span style={soonTitle}>New post</span>
          <span style={soonPill('var(--gold-700)', 'var(--gold-100)')}>Queued</span>
        </div>
        <div style={{ padding: '12px 13px' }}>
          <p style={{ fontSize: '12.5px', lineHeight: '1.45', color: 'var(--earth)', margin: '0 0 11px' }}>
            Baptisms this Sunday, straight after both services. Bring a towel and bring a friend.
          </p>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }} aria-hidden="true">
            <span style={{ flex: '1', aspectRatio: '4 / 3', borderRadius: '9px', background: 'var(--stone-200)' }} />
            <span style={{ flex: '1', aspectRatio: '4 / 3', borderRadius: '9px', background: 'var(--stone-100)' }} />
          </div>
          <div style={{ ...soonRow, justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={soonLabel}>Goes to</span>
            {accountSwatches(6, 4)}
          </div>
          <div style={{ border: '1px solid rgba(45,37,25,0.1)', borderRadius: '10px', padding: '8px 10px', marginBottom: '10px' }}>
            <div style={{ ...soonLabel, marginBottom: '4px' }}>First comment</div>
            <div style={{ fontSize: '10.5px', color: 'var(--sky-700)' }}>The link, rather than lost in the caption</div>
          </div>
          <div style={{ ...soonRow, justifyContent: 'space-between' }}>
            <span style={{ ...soonRow, gap: '6px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
              </svg>
              Sunday, before the first service
            </span>
            <span style={soonPill('#fff', 'var(--navy-900)')}>In the queue</span>
          </div>
        </div>
      </div>
    </>
  ),
  /* 2 · Analytics — reach and engagement beside the post that earned them.
     🔴 EVERY FIGURE IS A LENGTH, NOT A LABEL. A reach panel is the single most
     natural place on this page for a number to reappear, and a number here is
     one a church would take as a promise about what a post will do. So the bars
     carry their values in `width` and the follower line is a polyline: the
     shape of the claim without the claim. */
  'scheduler-analytics': (
    <>
      <div style={soonCard}>
        <div style={soonHead}>
          <span style={soonTitle}>Last Sunday's post</span>
          <span style={soonPill('var(--sky-700)', 'var(--sky-100)')}>Every account</span>
        </div>
        <div style={{ padding: '13px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {soonBar('Impressions', '84%', 'var(--sky-500)')}
          {soonBar('Reach', '61%', 'var(--sky-500)')}
          {soonBar('Engagement', '38%', 'var(--gold-500)')}
        </div>
        <div style={{ margin: '0 13px 13px', background: 'var(--stone-100)', borderRadius: '12px', padding: '11px 12px' }}>
          <div style={{ ...soonRow, justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={soonLabel}>Followers</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--green-700)' }}>Climbing</span>
          </div>
          <svg viewBox="0 0 120 30" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '30px' }} aria-hidden="true">
            <polyline points="0,26 20,23 40,24 60,17 80,14 100,9 120,5" fill="none" stroke="var(--green-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </>
  ),
  /* 3 · Messages — the inbox, and a reply going back out as the church rather
     than from whoever happened to have the password. */
  'scheduler-messaging': (
    <>
      <div style={soonCard}>
        <div style={soonHead}>
          <span style={soonTitle}>Messages</span>
          <span style={soonPill('var(--gold-700)', 'var(--gold-100)')}>Waiting</span>
        </div>
        <div style={{ padding: '9px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[
            ['Rachel', 'What time does the morning service start?', true],
            ['Daniel', 'Is there parking anywhere near the hall?', false],
            ['Priya', 'Could I bring my mum along on Sunday?', false],
          ].map(([who, said, unread], i) => (
            <div key={who as string} style={{ ...soonRow, gap: '8px', padding: '7px 8px', borderRadius: '9px', background: i === 0 ? 'var(--stone-100)' : 'transparent' }}>
              <span aria-hidden="true" style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, background: 'var(--stone-200)' }} />
              <span style={{ flex: '1', minWidth: '0' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--navy-900)' }}>{who as string}</span>
                <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{said as string}</span>
              </span>
              {unread ? unreadDot : null}
            </div>
          ))}
        </div>
        <div style={{ margin: '0 13px 13px' }}>
          <div style={{ fontSize: '11px', lineHeight: '1.4', borderRadius: '10px', padding: '7px 9px', background: 'var(--navy-900)', color: '#fff', maxWidth: '84%', marginLeft: 'auto' }}>
            Half past ten, and there is plenty of parking behind the hall.
          </div>
          <div style={{ ...soonRow, gap: '6px', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '9px', padding: '7px 10px', marginTop: '8px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
            Replying as Grace Chapel
          </div>
        </div>
      </div>
    </>
  ),
  /* 4 · Comments and reviews — two tabs on one list, because the difference
     between them is where they were left, not what the office does about them. */
  'scheduler-comments': (
    <>
      <div style={soonCard}>
        <div style={{ display: 'flex', gap: '5px', padding: '11px 13px 0' }}>
          <span style={soonPill('#fff', 'var(--navy-900)')}>Comments</span>
          <span style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--text-muted)', padding: '3px 9px' }}>Reviews</span>
        </div>
        <div style={{ padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <div style={{ border: '1px solid rgba(45,37,25,0.08)', borderRadius: '12px', padding: '10px 11px' }}>
            <div style={{ ...soonRow, gap: '7px', marginBottom: '6px' }}>
              <span aria-hidden="true" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: 'var(--stone-200)' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--navy-900)' }}>Tom</span>
              <span style={{ marginLeft: 'auto', ...soonLabel }}>On the baptism post</span>
            </div>
            <p style={{ fontSize: '11.5px', lineHeight: '1.45', color: 'var(--earth)', margin: '0 0 8px' }}>
              Are visitors welcome, or is it just for members?
            </p>
            <div style={{ ...soonRow, gap: '6px', border: '1px solid rgba(45,37,25,0.1)', borderRadius: '9px', padding: '6px 9px', fontSize: '10.5px', color: 'var(--text-muted)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 17H7A4 4 0 0 1 7 9h10" /><path d="m14 6 3 3-3 3" />
              </svg>
              Reply where it was left
            </div>
          </div>
          <div style={{ background: 'var(--stone-100)', borderRadius: '12px', padding: '10px 11px' }}>
            <div style={{ ...soonRow, gap: '6px', marginBottom: '5px' }}>
              <span style={{ ...soonRow, gap: '2px', color: 'var(--gold-500)' }} aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.6 6.2 6.4.5-4.9 4.2 1.5 6.1L12 16.8 6.4 20l1.5-6.1L3 9.7l6.4-.5L12 3Z" /></svg>
                ))}
              </span>
              <span style={{ ...soonLabel, marginLeft: 'auto' }}>A review of your church</span>
            </div>
            <p style={{ fontSize: '11.5px', lineHeight: '1.45', color: 'var(--earth)', margin: '0' }}>
              Warmest welcome we have had anywhere. Someone found us a seat.
            </p>
          </div>
        </div>
      </div>
    </>
  ),
  /* 5 · Ads — boosting the post that is already working, from the screen it was
     written on.
     ⚠️ NO BUDGET FIELD, AND THAT IS THE POINT OF THE DRAWING. A boost panel
     without an amount looks incomplete until you remember what an amount on
     this page would be: a figure a church has not been quoted, for a feature
     with no price. What it draws instead is the DECISION — which post, who it
     would reach, and where it would run. */
  'scheduler-ads': (
    <>
      <div style={soonCard}>
        <div style={soonHead}>
          <span style={soonTitle}>Boost this post</span>
          <span style={soonPill('var(--text-muted)', 'var(--stone-100)')}>Draft</span>
        </div>
        <div style={{ padding: '12px 13px' }}>
          <div style={{ ...soonRow, gap: '9px', border: '1px solid rgba(45,37,25,0.08)', borderRadius: '11px', padding: '8px 9px', marginBottom: '12px' }}>
            <span aria-hidden="true" style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0, background: 'var(--stone-200)' }} />
            <span style={{ flex: '1', minWidth: '0' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--navy-900)' }}>Easter services</span>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--green-700)' }}>Doing well on its own</span>
            </span>
          </div>
          <div style={{ ...soonLabel, marginBottom: '7px' }}>Who it would reach</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '13px' }}>
            <span style={soonPill('var(--navy-900)', 'var(--gold-100)')}>Near the church</span>
            <span style={soonPill('var(--navy-900)', 'var(--gold-100)')}>Families</span>
            <span style={soonPill('var(--text-muted)', 'var(--stone-100)')}>Students</span>
          </div>
          <div style={{ ...soonRow, justifyContent: 'space-between' }}>
            <span style={soonLabel}>Where it would run</span>
            {accountSwatches(3, 2)}
          </div>
          <div style={{ marginTop: '11px', paddingTop: '10px', borderTop: '1px solid rgba(45,37,25,0.07)', ...soonRow, justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)' }}>
            <span>Or build a campaign instead</span>
            <span aria-hidden="true" style={{ color: 'var(--navy-900)', fontWeight: '700' }}>→</span>
          </div>
        </div>
      </div>
    </>
  ),
  /* 6 · Live updates — the capability the founder's own list calls webhooks.
     ⚠️ THE WORD IS NOWHERE HERE, AND THAT IS THE-284's DECISION KEPT RATHER
     THAN A NEW ONE. A church admin never registers a callback; what a church
     SEES is a screen that already knows. So the vignette is an activity strip:
     a post that went out, a comment that landed, and — the one that matters —
     something that failed saying so at the time rather than on Monday. */
  'scheduler-live': (
    <>
      <div style={soonCard}>
        <div style={soonHead}>
          <span style={soonTitle}>Activity</span>
          <span style={{ ...soonRow, gap: '5px', ...soonPill('var(--green-700)', 'var(--green-100)') }}>
            <span aria-hidden="true" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-500)' }} />
            Keeping up
          </span>
        </div>
        <div style={{ padding: '10px 13px 13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            ['var(--green-700)', 'var(--green-100)', 'Your Sunday post went out', 'just now'],
            ['var(--sky-700)', 'var(--sky-100)', 'A comment arrived on the baptism post', 'moments ago'],
            ['var(--sky-700)', 'var(--sky-100)', 'Someone sent the church a message', 'moments ago'],
          ].map(([fg, bg, what, when]) => (
            <div key={what} style={{ ...soonRow, gap: '8px' }}>
              <span aria-hidden="true" style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: bg, border: `1px solid ${fg}` }} />
              <span style={{ flex: '1', fontSize: '11px', color: 'var(--earth)' }}>{what}</span>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{when}</span>
            </div>
          ))}
          <div style={{ ...soonRow, gap: '8px', background: 'var(--gold-100)', border: '1px solid var(--gold-200)', borderRadius: '10px', padding: '8px 9px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold-700)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <path d="M12 8v5M12 17h.01" /><circle cx="12" cy="12" r="9" />
            </svg>
            <span style={{ flex: '1', fontSize: '11px', color: 'var(--earth)' }}>One post did not send</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--gold-700)' }}>Try again</span>
          </div>
        </div>
      </div>
    </>
  ),
};

export function FeatureMock({ id }: { id: string }) {
  if (id === 'groups') return <GroupsMock />;
  return MOCKS[id] ?? null;
}
