import React from 'react';
import { Reveal } from './effects';
import { Kicker, H2, container, softCard, Mark } from './shared';

/* What Harvest replaces — same competitor set + monthly costs as the existing
   site. Rendered on a light card, so logos use full-colour Simple Icons (or a
   Google favicon fallback) rather than the dark-bg white variants. */

interface Row { c: string; tools: [string, string | null][]; cost: string; }

const rows: Row[] = [
  { c: 'Website / Blog', tools: [['WordPress', 'wordpress'], ['The Church Co', null]], cost: '39–99' },
  { c: 'Community', tools: [['Skool', null]], cost: '99' },
  { c: 'Notes / Docs', tools: [['Notion', 'notion']], cost: '10–20' },
  { c: 'Church App + Livestream', tools: [['Subsplash', null], ['Pushpay', null]], cost: '300–500' },
  { c: 'Events + Check-in', tools: [['Planning Center', null]], cost: '99–199' },
  { c: 'Newsletter', tools: [['Mailchimp', 'mailchimp']], cost: '50–100' },
  { c: 'CRM', tools: [['HubSpot', 'hubspot']], cost: '200–800' },
  { c: 'Accounting', tools: [['QuickBooks', 'quickbooks']], cost: '50–80' },
  { c: 'SMS', tools: [['Twilio', null]], cost: '50–150' },
  { c: 'Forms', tools: [['Typeform', 'typeform']], cost: '29–59' },
  { c: 'Scheduling', tools: [['Calendly', 'calendly']], cost: '12–20' },
  { c: 'Courses / LMS', tools: [['Teachable', null]], cost: '39–119' },
  { c: 'Online Giving', tools: [['Tithe.ly', null], ['Donorbox', null]], cost: '49–99' },
];

const logoUrl = (slug: string | null, name: string) =>
  slug
    ? `https://cdn.simpleicons.org/${slug}`
    : `https://www.google.com/s2/favicons?domain=${name.toLowerCase().replace(/[^a-z]/g, '')}.com&sz=64`;

export function Replaces() {
  return (
    <section id="replaces" style={{ background: 'var(--cream)', padding: 'var(--section-y-tight) 0' }}>
      <div style={{ ...container, maxWidth: 920 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Kicker>All-in-one</Kicker>
          <H2 style={{ marginTop: 14 }}>{'Replaces a dozen tools,\nfor less than one'}</H2>
        </div>
        <Reveal delay={80}>
          <div style={{ ...softCard, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5 }}>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.c} style={{ borderTop: i ? '1px solid rgba(45,37,25,0.06)' : 'none' }}>
                    <td style={{ padding: '14px 22px', color: 'var(--navy-900)', fontWeight: 600, width: '32%' }}>{r.c}</td>
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
                        {r.tools.map(([n, s]) => (
                          <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <img src={logoUrl(s, n)} width={18} height={18} alt="" loading="lazy" style={{ objectFit: 'contain', borderRadius: 4 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span style={{ color: 'var(--text-body)' }}>{n}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 22px', textAlign: 'right', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>${r.cost}/mo</td>
                  </tr>
                ))}
                <tr style={{ background: 'rgba(45,37,25,0.04)', borderTop: '1px solid rgba(45,37,25,0.1)' }}>
                  <td style={{ padding: '16px 22px', color: 'var(--navy-900)', fontWeight: 700 }}>Total, billed separately</td>
                  <td style={{ padding: '16px 22px', color: 'var(--text-muted)', fontSize: 13 }}>13 subscriptions to manage</td>
                  <td style={{ padding: '16px 22px', textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--navy-900)', fontWeight: 700 }}>$1,026–2,344/mo</td>
                </tr>
                <tr style={{ background: 'var(--navy-900)' }}>
                  <td style={{ padding: '18px 22px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Mark h={24} /><span style={{ color: '#fff', fontWeight: 700 }}>Harvest</span></span></td>
                  <td style={{ padding: '18px 22px', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Everything above — in one platform</td>
                  <td style={{ padding: '18px 22px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--gold-400)', fontWeight: 800, fontSize: 18 }}>$383</span><span style={{ color: 'rgba(201,150,58,0.6)', fontSize: 13 }}>/mo</span>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10.5, marginTop: 2 }}>billed annually</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
