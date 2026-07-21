import React from 'react';
import { appSignupUrl } from '../lib/ref';
import { Reveal } from './effects';
import { HBtn } from './magic';
import { I } from './icons';
import { Kicker, H2, container, softCard, SKY } from './shared';
import { FeeCalculator } from './FeeCalculator';

/* Standalone AI Assistant add-on checkout — links straight to the active Stripe
   Payment Link ($200/mo) so checkout is self-contained. Preserved verbatim from
   the pre-redesign site; the design pointed this at the app, which would drop the
   dedicated Stripe flow. */
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/dRm6oAbK09Gc0HAdWc0Ba00';

/** Flip to true to relaunch the AI Assistant add-on (price + Stripe CTA). */
const AI_ASSISTANT_LIVE = false;

export interface Plan {
  name: string;
  planId: string; // load-bearing: forwarded to the app via appSignupUrl(planId)
  monthly: number;
  // Platform fee as a DECIMAL fraction, mirroring the app's PLATFORM_FEE_MAP
  // (src/lib/stripe-config.ts). Single source of truth for the marketing site:
  // the pricing cards, the comparison table, and the savings calculator all read
  // from here so the numbers can never drift. retention = 100 − fee × 100.
  fee: number;
  retention: number;
  popular?: boolean;
  blurb: string;
  features: string[];
}

export const plans: Plan[] = [
  { name: 'Individual', planId: 'plus', monthly: 59, fee: 0.05, retention: 95, blurb: 'For solo evangelists and missionaries.', features: ['Mobile App (PWA)', 'Blog & News Feed', 'Bible', '2 courses', '1 admin', 'Donation page'] },
  { name: 'Small Team', planId: 'pro', monthly: 119, fee: 0.05, retention: 95, popular: true, blurb: 'For small ministries growing as a team.', features: ['Everything in Individual', '5 courses · 5 admins', 'AI Chat & Knowledge Base', 'Newsletter', 'Church Map', 'Community Feed'] },
  { name: 'Community', planId: 'max', monthly: 299, fee: 0.025, retention: 97.5, blurb: 'For established churches going deeper.', features: ['Everything in Small Team', 'CRM (Donors & Members)', 'Livestream + Check-in', 'Tax Receipts & Statements', 'Custom Forms → CRM', 'Unlimited courses · 10 admins'] },
  { name: 'Ministry', planId: 'ultra', monthly: 479, fee: 0, retention: 100, blurb: 'The complete platform for large teams.', features: ['Everything in Community', 'Unlimited Churches', 'Unlimited admins · Custom domain', 'Community Groups', 'SMS Automation', 'Accounting + QuickBooks'] },
];

const T = true;
type Cell = boolean | string;
const featureMatrix: { grp: string; rows: [string, Cell[]][] }[] = [
  { grp: 'Platform', rows: [
    ['Web App', [T, T, T, T]],
    ['Mobile App (PWA)', [T, T, T, T]],
    ['Admin accounts', ['1', '5', '10', '∞']],
    ['Custom Branding', [false, false, T, T]],
    ['Custom Domain', [false, false, false, T]],
    ['Unlimited Churches ($10/mo each — first free)', [false, false, false, T]],
  ] },
  { grp: 'Community', rows: [
    ['News Feed', [T, T, T, T]],
    ['Community Feed', [T, T, T, T]],
    ['Prayer Requests', [T, T, T, T]],
    ['Community Groups', [false, false, false, T]],
    ['Event Registration', [false, false, T, T]],
    ['Church Map', [false, T, T, T]],
    ['Check-In System (QR)', [false, false, T, T]],
    ['Livestream + Live Giving', [false, false, T, T]],
  ] },
  { grp: 'Discipleship & Content', rows: [
    ['Bible', [T, T, T, T]],
    ['Courses', ['2', '5', '∞', '∞']],
    ['Blog', [T, T, T, T]],
    ['Automated SEO Blog Articles', [false, false, T, T]],
    ['Docs & Notes', [false, false, T, T]],
    ['Sermon Notes → Livestream', [false, false, T, T]],
    ['Automated Devotional', [false, false, 'soon', 'soon']],
  ] },
  { grp: 'AI & Automation', rows: [
    ['AI Chat', [false, T, T, T]],
    ['AI Knowledge Base', [false, T, T, T]],
    ['Personal AI Assistant (Telegram)', [false, false, false, 'soon']],
    ['Newsletter', [false, T, T, T]],
    ['Automated Newsletter', [false, false, T, T]],
    ['SMS Automation (Twilio)', [false, false, false, T]],
    ['Custom Forms → CRM', [false, false, T, T]],
  ] },
  { grp: 'Giving & Finance', rows: [
    ['Donation Page', [T, T, T, T]],
    ['Fundraising', [T, T, T, T]],
    ['CRM (Donors & Members)', [false, false, T, T]],
    ['Accounting + QuickBooks Sync', [false, false, false, T]],
    ['Tax Receipts & Giving Statements', [false, false, T, T]],
    ['Donation Retention', plans.map((p) => `${p.retention}%`)],
    ['Lifetime Affiliate', ['15%', '15%', '15%', '15%']],
  ] },
];
const planNames = ['Individual', 'Small Team', 'Community', 'Ministry'];

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
                <th key={n} style={{ textAlign: 'center', padding: '16px 12px', color: i === 1 ? 'var(--gold-400)' : '#fff', fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 500, minWidth: 92 }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureMatrix.map((sec) => (
              <React.Fragment key={sec.grp}>
                <tr>
                  <td colSpan={5} style={{ padding: '18px 22px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)' }}>{sec.grp}</td>
                </tr>
                {sec.rows.map(([label, vals], ri) => (
                  <tr key={label} style={{ borderTop: '1px solid rgba(45,37,25,0.06)', background: ri % 2 ? 'rgba(45,37,25,0.015)' : 'transparent' }}>
                    <td style={{ padding: '13px 22px', color: 'var(--text-body)', fontSize: 13.5 }}>{label}</td>
                    {vals.map((v, ci) => <td key={ci} style={{ textAlign: 'center', padding: '13px 12px', background: ci === 1 ? 'rgba(201,150,58,0.05)' : 'transparent' }}>{cell(v)}</td>)}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, alignItems: 'stretch' }} className="pricing-grid">
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
                  {pop && <span style={{ position: 'absolute', top: 18, right: 18, background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 999 }}>POPULAR</span>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: pop ? 'var(--gold-400)' : 'var(--brand)' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 4px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 500, color: pop ? '#fff' : 'var(--navy-900)' }}>${price(p.monthly)}</span>
                    <span style={{ fontSize: 13, color: pop ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: pop ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', minHeight: 34, lineHeight: 1.4 }}>{p.blurb}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', padding: '10px 12px', borderRadius: 12, background: pop ? 'rgba(255,255,255,0.06)' : 'var(--gold-100)' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: pop ? 'var(--gold-400)' : 'var(--brand)', fontWeight: 500 }}>{p.retention}%</span>
                    <span style={{ fontSize: 11, color: pop ? 'rgba(255,255,255,0.6)' : 'var(--text-body)', lineHeight: 1.2 }}>Donation<br />retention</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
                    {p.features.map((f) => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ display: 'inline-flex', color: pop ? 'var(--gold-400)' : 'var(--brand)', flexShrink: 0, marginTop: 1 }}>{I.check({ size: 15 })}</span>
                        <span style={{ fontSize: 12.5, color: pop ? 'rgba(255,255,255,0.82)' : 'var(--text-body)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <HBtn href={appSignupUrl(p.planId)} variant={pop ? 'gold' : 'light'} block>Start free trial</HBtn>
                </div>
              </Reveal>
            );
          })}
        </div>
        {/* Savings calculator — reads fees from the shared `plans` constant */}
        <FeeCalculator plans={plans} />
        {/* AI add-on — dedicated Stripe checkout */}
        <Reveal delay={80}>
          <div style={{ marginTop: 20, borderRadius: 24, background: SKY, border: '1px solid rgba(255,255,255,0.7)', padding: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', overflow: 'hidden', position: 'relative' }}>
            <div style={{ flex: 1, minWidth: 260, position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ background: 'var(--navy-900)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 999 }}>ADD-ON</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 22, color: 'var(--navy-900)', margin: 0 }}>AI Assistant</h3>
              </div>
              <p style={{ color: 'var(--navy-700)', fontSize: 14.5, lineHeight: 1.55, margin: 0, maxWidth: 520, opacity: 0.85 }}>Connect 900+ apps to schedule, automate and superboost your ministry. <b style={{ color: 'var(--brand)' }}>Included free on Ministry.</b></p>
            </div>
            <div style={{ textAlign: 'right', position: 'relative', zIndex: 2 }}>
              {AI_ASSISTANT_LIVE ? (
                <>
                  <div style={{ marginBottom: 12 }}><span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: 'var(--navy-900)' }}>$200</span><span style={{ color: 'var(--navy-700)', fontSize: 14 }}>/mo</span></div>
                  <HBtn href={STRIPE_PAYMENT_LINK} variant="dark">Add the Assistant</HBtn>
                  <p style={{ marginTop: 8, fontSize: 11, color: 'var(--navy-700)', opacity: 0.7 }}>Secure checkout via Stripe · cancel anytime</p>
                </>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--sky-100)', color: 'var(--sky-700)', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', padding: '10px 18px', borderRadius: 999 }}>Coming soon</span>
              )}
            </div>
          </div>
        </Reveal>
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
