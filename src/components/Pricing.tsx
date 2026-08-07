import React from 'react';
import { useAppSignupUrl } from '../lib/ref';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { I } from './icons';
import { Kicker, H2, container, softCard } from './shared';

export interface Plan {
  name: string;
  planId: string; // load-bearing: forwarded to the app via appSignupUrl(planId)
  monthly: number;
  // Platform fee as a DECIMAL fraction, mirroring the app's PLATFORM_FEE_MAP
  // (src/lib/stripe-config.ts). Single source of truth for the marketing site:
  // the pricing cards read from here so the number can never drift. It is flat
  // zero on every plan today — Harvest takes no cut of a donation — which is
  // why there is no per-tier fee row in the comparison table: three identical
  // cells in a differentiation grid earn nothing. Do NOT reintroduce a
  // "retention" field; it was a derived complement of this one, and carrying
  // two numbers for one fact is what let "keeps 100%" outlive a nonzero fee.
  fee: number;
  popular?: boolean;
  blurb: string;
  features: string[];
}

// planId values are the app's `TenantPlan` union — 'plus' | 'pro' | 'max'.
// Anything else here deep-links signup to a plan the app cannot resolve.
export const plans: Plan[] = [
  { name: 'Individual', planId: 'plus', monthly: 49, fee: 0, blurb: 'For solo evangelists and missionaries.', features: ['150 contacts · 2 admins', 'Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses', 'CRM (Donors & Members)', 'Docs & Notes', 'SMS (bring your own Twilio)', 'Donation page & Fundraising'] },
  { name: 'Small Team', planId: 'pro', monthly: 99, fee: 0, blurb: 'For small ministries growing as a team.', features: ['Everything in Individual', '500 contacts · 5 admins', '5 courses', 'Livestream + Live Giving', 'Check-In System (QR)', 'Sermon Notes → Livestream', 'Church Map', 'Newsletter'] },
  { name: 'Ministry', planId: 'max', monthly: 199, fee: 0, popular: true, blurb: 'For established churches going deeper.', features: ['Everything in Small Team', '2,000 contacts · 15 admins', '15 courses', 'Custom Branding & Domain', 'Community Groups & Events', 'Automated SEO Blog & Newsletter', 'Custom Forms → CRM', 'Tax Receipts & Statements', 'Accounting + QuickBooks'] },
];

// Index of the featured plan. The pricing cards read `p.popular` directly, but
// the comparison table used to hard-code column 1 for its gold header and tinted
// column — so moving `popular` between plans silently left the table featuring
// the old one. Derive both from the same flag. -1 (no popular plan) simply means
// no column is highlighted, since no index matches.
const popularIdx = plans.findIndex((p) => p.popular);

const T = true;
type Cell = boolean | string;
// Every row is positional against `plans` — one cell per plan, in plan order.
// A row with the wrong length renders a dropped or misaligned cell silently,
// so the width check below fails the build instead.
const featureMatrix: { grp: string; rows: [string, Cell[]][] }[] = [
  { grp: 'Platform', rows: [
    ['Web App', [T, T, T]],
    ['Mobile App (PWA)', [T, T, T]],
    ['Contacts', ['150', '500', '2,000']],
    ['Admin accounts', ['2', '5', '15']],
    ['Custom Branding', [false, false, T]],
    ['Custom Domain', [false, false, T]],
  ] },
  { grp: 'Community', rows: [
    ['News Feed', [T, T, T]],
    ['Community Feed', [T, T, T]],
    ['Prayer Requests', [T, T, T]],
    ['Community Groups', [false, false, T]],
    ['Event Registration', [false, false, T]],
    ['Church Map', [false, T, T]],
    ['Check-In System (QR)', [false, T, T]],
    ['Livestream + Live Giving', [false, T, T]],
  ] },
  { grp: 'Discipleship & Content', rows: [
    ['Bible', [T, T, T]],
    ['Courses', ['2', '5', '15']],
    ['Blog', [T, T, T]],
    ['Automated SEO Blog Articles', [false, false, T]],
    ['Docs & Notes', [T, T, T]],
    ['Sermon Notes → Livestream', [false, T, T]],
  ] },
  { grp: 'Automation', rows: [
    ['Newsletter', [false, T, T]],
    ['Automated Newsletter', [false, false, T]],
    ['SMS (bring your own Twilio)', [T, T, T]],
    ['Custom Forms → CRM', [false, false, T]],
  ] },
  { grp: 'Giving & Finance', rows: [
    ['Donation Page', [T, T, T]],
    ['Fundraising', [T, T, T]],
    ['CRM (Donors & Members)', [T, T, T]],
    ['Accounting + QuickBooks Sync', [false, false, T]],
    ['Tax Receipts & Giving Statements', [false, false, T]],
  ] },
];

/* Widths are only checkable at runtime — `Cell[]` cannot express "exactly as
   long as `plans`". Throwing here surfaces during the prerender, which is a
   build failure, rather than shipping a table whose cells have quietly slid
   one column left. */
for (const sec of featureMatrix) {
  for (const [label, vals] of sec.rows) {
    if (vals.length !== plans.length) {
      throw new Error(`Pricing comparison row "${label}" has ${vals.length} cells, expected ${plans.length}.`);
    }
  }
}
// Derived, so a rename or reorder in `plans` can't desync the table header from
// the cards — the matrix rows above are positional and assume this exact order.
const planNames = plans.map((p) => p.name);

function ComparisonTable() {
  const cell = (v: Cell) => {
    if (v === true) return <span style={{ display: 'inline-flex', color: 'var(--brand)' }}>{I.check({ size: 16 })}</span>;
    if (v === false) return <span style={{ color: 'var(--stone-300)' }}>—</span>;
    if (v === 'soon') return <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky-600)' }}>soon</span>;
    return <span style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: 13.5 }}>{v}</span>;
  };
  return (
    <div style={{ ...softCard, overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--navy-900)' }}>
              <th style={{ textAlign: 'left', padding: '16px 22px', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Feature</th>
              {planNames.map((n, i) => (
                <th key={n} style={{ textAlign: 'center', padding: '16px 12px', color: i === popularIdx ? 'var(--gold-400)' : '#fff', fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, minWidth: 92 }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureMatrix.map((sec) => (
              <React.Fragment key={sec.grp}>
                <tr>
                  <td colSpan={plans.length + 1} style={{ padding: '18px 22px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>{sec.grp}</td>
                </tr>
                {sec.rows.map(([label, vals], ri) => (
                  <tr key={label} style={{ borderTop: '1px solid rgba(45,37,25,0.06)', background: ri % 2 ? 'rgba(45,37,25,0.015)' : 'transparent' }}>
                    <td style={{ padding: '13px 22px', color: 'var(--text-body)', fontSize: 13.5 }}>{label}</td>
                    {vals.map((v, ci) => <td key={ci} style={{ textAlign: 'center', padding: '13px 12px', background: ci === popularIdx ? 'rgba(201,150,58,0.05)' : 'transparent' }}>{cell(v)}</td>)}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* The plan CTA is the affiliate hand-off. Its own component so the signup URL —
   which depends on sessionStorage and therefore cannot be resolved at build
   time — can be read through a hook rather than inline in the plan map.

   Load-bearing while the affiliate programme is unadvertised: a ?ref= link
   already in circulation still lands here, and this is what carries the stored
   ref across to signup so the referral is still attributed. Hiding the
   programme's marketing surfaces must not touch this path. */
function PlanCta({ planId, variant }: { planId: string; variant: 'gold' | 'light' }) {
  return <HBtn href={useAppSignupUrl(planId)} variant={variant} block>Start free trial</HBtn>;
}

export function Pricing() {
  const [annual, setAnnual] = React.useState(true);
  const [showTable, setShowTable] = React.useState(false);
  // Stripe charges monthly × 10 for annual (pay 10 months, get 12) — a 16.7%
  // discount, not a round 20%. Do not "simplify" this back to m * 0.8.
  const price = (m: number) => (annual ? Math.round(m * 10 / 12) : m);
  return (
    <section id="pricing" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={container}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Kicker>Pricing</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Simple plans\nfor serious ministry'}</H2>
        </div>
        <Reveal delay={80} style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid rgba(45,37,25,0.08)', borderRadius: 999, padding: 4, boxShadow: '0 6px 16px rgba(45,37,25,0.05)' }}>
            {([['Annual', true], ['Monthly', false]] as [string, boolean][]).map(([l, v]) => (
              <button key={l} onClick={() => setAnnual(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, padding: '9px 22px', borderRadius: 999, background: annual === v ? 'var(--navy-900)' : 'transparent', color: annual === v ? '#fff' : 'var(--text-body)', transition: 'all 200ms' }}>
                {l}{v ? <span style={{ color: annual === v ? 'var(--gold-400)' : 'var(--brand)', marginLeft: 6, fontSize: 11 }}>-17%</span> : null}
              </button>
            ))}
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: 18, alignItems: 'stretch' }} className="pricing-grid">
          {plans.map((p, i) => {
            const pop = p.popular;
            return (
              <Reveal key={p.name} delay={i * 70} style={{ display: 'flex' }}>
                <div style={{
                  width: '100%', display: 'flex', flexDirection: 'column',
                  background: pop ? 'var(--navy-900)' : '#fff',
                  border: pop ? '1px solid var(--navy-900)' : '1px solid rgba(45,37,25,0.08)',
                  borderRadius: 24, padding: 24, boxShadow: pop ? '0 30px 60px rgba(12,21,38,0.28)' : '0 12px 30px rgba(45,37,25,0.05)',
                  position: 'relative',
                }}>
                  {pop && <span style={{ position: 'absolute', top: 18, right: 18, background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 999 }}>RECOMMENDED</span>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: pop ? 'var(--gold-400)' : 'var(--brand)' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 4px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 500, color: pop ? '#fff' : 'var(--navy-900)' }}>${price(p.monthly)}</span>
                    <span style={{ fontSize: 13, color: pop ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: pop ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', minHeight: 34, lineHeight: 1.4 }}>{p.blurb}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', padding: '10px 12px', borderRadius: 12, background: pop ? 'rgba(255,255,255,0.06)' : 'var(--gold-100)' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: pop ? 'var(--gold-400)' : 'var(--brand)', fontWeight: 500 }}>{p.fee * 100}%</span>
                    <span style={{ fontSize: 11, color: pop ? 'rgba(255,255,255,0.6)' : 'var(--text-body)', lineHeight: 1.2 }}>Platform fee — Harvest<br />takes nothing from a gift</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ display: 'inline-flex', color: pop ? 'var(--gold-400)' : 'var(--brand)', flexShrink: 0, marginTop: 1 }}>{I.check({ size: 15 })}</span>
                        <span style={{ fontSize: 12.5, color: pop ? 'rgba(255,255,255,0.82)' : 'var(--text-body)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <PlanCta planId={p.planId} variant={pop ? 'gold' : 'light'} />
                </div>
              </Reveal>
            );
          })}
        </div>
        {/* Full comparison */}
        <Reveal delay={80} style={{ textAlign: 'center', marginTop: 44 }}>
          <button onClick={() => setShowTable((s) => !s)} style={{ cursor: 'pointer', border: '1px solid rgba(45,37,25,0.12)', background: '#fff', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--navy-900)', padding: '11px 24px', borderRadius: 999, boxShadow: '0 6px 16px rgba(45,37,25,0.05)' }}>
            {showTable ? 'Hide full comparison ↑' : 'Compare all plans ↓'}
          </button>
        </Reveal>
        {showTable && <div style={{ marginTop: 24 }}><ComparisonTable /></div>}
      </div>
    </section>
  );
}
