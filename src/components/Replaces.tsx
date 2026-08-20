import React from 'react';
import { Reveal } from './effects';
import { Kicker, H2, container, softCard, Mark } from './shared';
import { plans, formatMonthlyHeadline } from './Pricing';

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

// This row compares against the top plan (the tier that matches the competitor
// stack below) at its YEARLY price, expressed per month — read from the same
// stored price table as Pricing.tsx through the shared `formatMonthlyHeadline`
// helper, so the two can't drift apart.
//
// ⚠️ The headline figure here is a per-month EQUIVALENT rather than a charged
// amount, because it sits in a column of competitor per-month costs and a yearly
// total would not be comparable to what it stands beside. The charged total is
// therefore printed directly under it — "billed annually ($1,329/yr)" — so the
// comparison stays readable without leaving any doubt about what is taken.
//
// 🔴 THE-196 MADE THIS THE HOUSE STYLE RATHER THAN AN EXCEPTION. This row used
// to be the one place on the site that led with a per-month figure; the pricing
// cards now do the same thing for the same reason, through the same helper. The
// row is therefore NOT redundant — it is the only per-month figure that sits
// beside competitor costs, which is what makes the comparison legible — and it
// is no longer inconsistent with the cards. Nothing here needed reshaping, only
// the shared rounding (it reads $110.75 rather than $111) and a legible size on
// the line beneath.
//
// Keyed on planId, not on the display name: the name is marketing copy and has
// already been reassigned once ("Community" was retired and "Ministry" moved
// down onto this same planId), whereas planId is the app's TenantPlan union.
// Throwing beats the `!` this used to carry, which turned a renamed tier into a
// runtime crash during the prerender instead of a build-time error.
const foundTopPlan = plans.find((p) => p.planId === 'max');
if (!foundTopPlan) throw new Error("Replaces: no plan with planId 'max' to price against.");
const topPlan = foundTopPlan;
const topPlanAnnual = formatMonthlyHeadline(topPlan.price.yearly, 'yearly');

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
              <div className="replaces-tools" style={{ color: 'var(--text-muted)', fontSize: 13 }}>9 subscriptions to manage</div>
              <div className="replaces-cost" style={{ color: 'var(--navy-900)', fontWeight: 700 }}>$864–1,994/mo</div>
            </div>
            <div className="replaces-row" style={{ background: 'var(--navy-900)' }}>
              <div className="replaces-cat"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Mark h={24} /><span style={{ color: '#fff', fontWeight: 700 }}>Harvest</span></span></div>
              <div className="replaces-tools" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Everything above — in one platform ({topPlan.name} plan)</div>
              <div className="replaces-cost">
                <span style={{ color: 'var(--gold-400)', fontWeight: 800, fontSize: 18 }}>{topPlanAnnual}</span><span style={{ color: 'rgba(201,150,58,0.6)', fontSize: 13 }}>/mo</span>
                {/* The charged total, named.
                    ⚠️ THE-196 RAISED THIS LINE. It was 10.5px at
                    rgba(255,255,255,0.45) — under the 11px floor, and the
                    quietest ink on the panel was carrying the only figure that
                    says what is actually taken. Now 11.5px at 0.75, which is
                    10.53:1 on the navy row. */}
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11.5, fontWeight: 600, marginTop: 2 }}>{`billed annually ($${topPlan.price.yearly.toLocaleString()}/yr)`}</div>
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
