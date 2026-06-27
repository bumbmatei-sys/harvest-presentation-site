import React from 'react';

// Real brand marks are loaded from a CDN at runtime — no local asset wrangling.
// simple-icons covers the mainstream SaaS tools; Clearbit's logo API fills in the
// church-specific brands that simple-icons doesn't carry. Both are fetched in the
// visitor's browser, and every logo keeps a visible text label + onError fallback
// so the grid still reads correctly if an image ever 404s.
const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const cb = (domain: string) => `https://logo.clearbit.com/${domain}`;

type Brand = { name: string; src: string };

const BRANDS: Record<string, Brand> = {
  // simple-icons
  wordpress: { name: 'WordPress', src: si('wordpress') },
  notion: { name: 'Notion', src: si('notion') },
  mailchimp: { name: 'Mailchimp', src: si('mailchimp') },
  hubspot: { name: 'HubSpot', src: si('hubspot') },
  quickbooks: { name: 'QuickBooks', src: si('quickbooks') },
  twilio: { name: 'Twilio', src: si('twilio') },
  typeform: { name: 'Typeform', src: si('typeform') },
  calendly: { name: 'Calendly', src: si('calendly') },
  // Clearbit fallback (not in simple-icons)
  thechurchco: { name: 'The Church Co', src: cb('thechurchco.com') },
  skool: { name: 'Skool', src: cb('skool.com') },
  subsplash: { name: 'Subsplash', src: cb('subsplash.com') },
  pushpay: { name: 'Pushpay', src: cb('pushpay.com') },
  planningcenter: { name: 'Planning Center', src: cb('planningcenter.com') },
};

type Row = { category: string; brands: Brand[]; cost: string };

const rows: Row[] = [
  { category: 'Website / Blog', brands: [BRANDS.wordpress, BRANDS.thechurchco], cost: '$39–99' },
  { category: 'Community', brands: [BRANDS.skool], cost: '$99' },
  { category: 'Notes / Docs', brands: [BRANDS.notion], cost: '$10–20' },
  { category: 'Church App + Livestream', brands: [BRANDS.subsplash, BRANDS.pushpay], cost: '$300–500' },
  { category: 'Events + Check-in', brands: [BRANDS.planningcenter], cost: '$99–199' },
  { category: 'Newsletter / Email', brands: [BRANDS.mailchimp], cost: '$50–100' },
  { category: 'CRM', brands: [BRANDS.hubspot], cost: '$200–800' },
  { category: 'Accounting', brands: [BRANDS.quickbooks], cost: '$50–80' },
  { category: 'SMS', brands: [BRANDS.twilio], cost: '$50–150' },
  { category: 'Forms', brands: [BRANDS.typeform], cost: '$29–59' },
  { category: 'Scheduling', brands: [BRANDS.calendly], cost: '$12–20' },
];

// One brand mark: greyscale/white by default on the dark background, full brand
// color on hover. The name is always rendered as a label (and as alt text) so the
// row degrades gracefully into plain text if the logo image fails to load.
const BrandLogo: React.FC<Brand> = ({ name, src }) => {
  const [failed, setFailed] = React.useState(false);
  return (
    <span className="inline-flex items-center gap-2" title={name}>
      {!failed && (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-6 w-auto max-w-[110px] object-contain opacity-70 grayscale brightness-0 invert transition duration-200 hover:opacity-100 hover:grayscale-0 hover:brightness-100 hover:invert-0"
        />
      )}
      <span className={`text-xs whitespace-nowrap ${failed ? 'text-white/80' : 'text-white/55'}`}>
        {name}
      </span>
    </span>
  );
};

export const WhatHarvestReplaces: React.FC = () => {
  return (
    <section id="replaces" className="py-24 md:py-32" style={{ backgroundColor: '#1e2330' }}>
      <div className="max-w-[960px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">What Harvest Replaces</p>
          <h2 className="text-white font-serif text-3xl md:text-4xl font-light text-balance">
            Harvest Ministry replaces all of these
          </h2>
          <p className="text-white/60 text-lg mt-4 max-w-[560px] mx-auto">
            For less than any one of them alone.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-4 px-4 md:px-5 text-white/50 font-medium">Category</th>
                <th className="text-left py-4 px-4 md:px-5 text-white/50 font-medium">Replaces</th>
                <th className="text-right py-4 px-4 md:px-5 text-white/50 font-medium whitespace-nowrap">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.category} className="border-b border-white/5">
                  <td className="py-4 px-4 md:px-5 text-white align-middle">{r.category}</td>
                  <td className="py-4 px-4 md:px-5 align-middle">
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {r.brands.map((b) => (
                        <BrandLogo key={b.name} {...b} />
                      ))}
                    </span>
                  </td>
                  <td className="py-4 px-4 md:px-5 text-white/80 text-right whitespace-nowrap align-middle">{r.cost}</td>
                </tr>
              ))}
              <tr className="border-b border-white/10 bg-white/5">
                <td className="py-4 px-4 md:px-5 text-white font-semibold">Total</td>
                <td className="py-4 px-4 md:px-5" />
                <td className="py-4 px-4 md:px-5 text-white font-semibold text-right whitespace-nowrap">$900–2,000+/mo</td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(201,150,58,0.15)' }}>
                <td className="py-4 px-4 md:px-5 text-gold font-semibold">Harvest Ministry</td>
                <td className="py-4 px-4 md:px-5 text-white/70">Everything above</td>
                <td className="py-4 px-4 md:px-5 text-gold font-bold text-right whitespace-nowrap">$479/mo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-white/70 font-serif text-xl mt-10 italic">
          One platform. One price. Built for the church.
        </p>
      </div>
    </section>
  );
};

export default WhatHarvestReplaces;
