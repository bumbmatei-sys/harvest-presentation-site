import React from 'react';
import { Reveal } from './effects';
import { Kicker, H2, container, softCard, Mark } from './shared';
import { plans } from './Pricing';

/* What Harvest replaces — same competitor set + monthly costs as the existing
   site. Rendered on a light card, so logos use full-colour Simple Icons (or a
   Google favicon fallback) rather than the dark-bg white variants. */

interface Row { c: string; tools: [string, string | null, string?][]; cost: string; }

const rows: Row[] = [
  { c: 'Website / Blog', tools: [['WordPress', 'wordpress'], ['The Church Co', null]], cost: '39–99' },
  { c: 'Community', tools: [['Skool', null]], cost: '99' },
  { c: 'Notes / Docs', tools: [['Notion', 'notion']], cost: '10–20' },
  { c: 'Church App + Livestream', tools: [['Subsplash', null], ['Pushpay', null]], cost: '300–500' },
  { c: 'Events + Check-in', tools: [['Planning Center Check-Ins', null, 'planningcenter']], cost: '99–199' },
  { c: 'CRM', tools: [['HubSpot', 'hubspot']], cost: '200–800' },
  { c: 'Forms', tools: [['Typeform', 'typeform']], cost: '29–59' },
  { c: 'Scheduling', tools: [['Calendly', 'calendly']], cost: '12–20' },
  { c: 'Courses / LMS', tools: [['Teachable', null]], cost: '39–119' },
  { c: 'Online Giving', tools: [['Tithe.ly', null], ['Donorbox', null]], cost: '49–99' },
];

// Third-party services Harvest connects to (does NOT replace). Add future
// newsletter/email backends (Wix, etc.) here as they ship.
const integrations: [string, string | null][] = [
  ['QuickBooks', 'quickbooks'],
  ['Twilio', null],
  ['Mailchimp', 'mailchimp'],
];

const logoUrl = (slug: string | null, name: string, domain?: string) =>
  slug
    ? `https://cdn.simpleicons.org/${slug}`
    : `https://www.google.com/s2/favicons?domain=${domain ?? name.toLowerCase().replace(/[^a-z]/g, '')}.com&sz=64`;

// This row compares against the Community plan (the tier that matches the
// competitor stack below) at its annual price — derived from the same plan
// data as Pricing.tsx (monthly × 10 ÷ 12) so the two can't drift apart.
const communityMonthly = plans.find((p) => p.name === 'Community')!.monthly;
const communityAnnual = Math.round(communityMonthly * 10 / 12);

export function Replaces() {
  return (
    <section id="replaces" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={{ ...container, maxWidth: 920 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Kicker>All-in-one</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Replaces a dozen tools,\nfor less than one'}</H2>
        </div>
        <Reveal delay={80}>
          {/* Rendered as CSS-grid rows (not a <table>) so it stacks to cards on
              phones with every price fully visible — see .replaces-row in index.css. */}
          <div style={{ ...softCard, overflow: 'hidden', padding: 0, fontSize: 14.5 }}>
            {rows.map((r) => (
              <div key={r.c} className="replaces-row">
                <div className="replaces-cat" style={{ color: 'var(--navy-900)', fontWeight: 600 }}>{r.c}</div>
                <div className="replaces-tools">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
                    {r.tools.map(([n, s, d]) => (
                      <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <img src={logoUrl(s, n, d)} width={18} height={18} alt="" loading="lazy" style={{ objectFit: 'contain', borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span style={{ color: 'var(--text-body)' }}>{n}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="replaces-cost" style={{ color: 'var(--text-muted)' }}>${r.cost}/mo</div>
              </div>
            ))}
            <div className="replaces-row" style={{ background: 'rgba(45,37,25,0.04)', borderTop: '1px solid rgba(45,37,25,0.1)' }}>
              <div className="replaces-cat" style={{ color: 'var(--navy-900)', fontWeight: 700 }}>Total, billed separately</div>
              <div className="replaces-tools" style={{ color: 'var(--text-muted)', fontSize: 13 }}>10 subscriptions to manage</div>
              <div className="replaces-cost" style={{ color: 'var(--navy-900)', fontWeight: 700 }}>$876–2,014/mo</div>
            </div>
            <div className="replaces-row" style={{ background: 'var(--navy-900)' }}>
              <div className="replaces-cat"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Mark h={24} /><span style={{ color: '#fff', fontWeight: 700 }}>Harvest</span></span></div>
              <div className="replaces-tools" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Everything above — in one platform (Community plan)</div>
              <div className="replaces-cost">
                <span style={{ color: 'var(--gold-400)', fontWeight: 800, fontSize: 18 }}>${communityAnnual}</span><span style={{ color: 'rgba(201,150,58,0.6)', fontSize: 13 }}>/mo</span>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5, marginTop: 2 }}>billed annually</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4px 4px' }}>
            <span style={{ marginRight: 6 }}>Plus integrates with your newsletter &amp; tools —</span>
            {integrations.map(([n, s]) => (
              <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 8px', color: 'var(--text-body)' }}>
                <img src={logoUrl(s, n)} width={16} height={16} alt="" loading="lazy" style={{ objectFit: 'contain', borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {n}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
