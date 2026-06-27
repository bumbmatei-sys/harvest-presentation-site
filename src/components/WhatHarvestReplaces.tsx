import React from 'react';

interface ToolRow {
  category: string;
  tools: { name: string; logoUrl: string }[];
  cost: string;
}

const rows: ToolRow[] = [
  {
    category: 'Website / Blog',
    tools: [
      { name: 'WordPress', logoUrl: 'https://cdn.simpleicons.org/wordpress' },
      // Not on Simple Icons; Clearbit and the direct favicon were unreliable —
      // Google's favicon service always returns an image.
      { name: 'The Church Co', logoUrl: 'https://www.google.com/s2/favicons?domain=thechurchco.com&sz=64' },
    ],
    cost: '$39–99/mo',
  },
  {
    category: 'Community',
    tools: [
      { name: 'Skool', logoUrl: 'https://www.skool.com/favicon.ico' },
    ],
    cost: '$99/mo',
  },
  {
    category: 'Notes / Docs',
    tools: [
      // White variant so the (otherwise black) Notion mark is visible on the dark bg.
      { name: 'Notion', logoUrl: 'https://cdn.simpleicons.org/notion/ffffff' },
    ],
    cost: '$10–20/mo',
  },
  {
    category: 'Church App + Livestream',
    tools: [
      // Direct favicon failed — Google's favicon service is reliable.
      { name: 'Subsplash', logoUrl: 'https://www.google.com/s2/favicons?domain=subsplash.com&sz=64' },
      { name: 'Pushpay', logoUrl: 'https://pushpay.com/favicon.ico' },
    ],
    cost: '$300–500/mo',
  },
  {
    category: 'Events + Check-in',
    tools: [
      { name: 'Planning Center', logoUrl: 'https://www.planningcenter.com/favicon.ico' },
    ],
    cost: '$99–199/mo',
  },
  {
    category: 'Newsletter / Email',
    tools: [
      { name: 'Mailchimp', logoUrl: 'https://cdn.simpleicons.org/mailchimp' },
    ],
    cost: '$50–100/mo',
  },
  {
    category: 'CRM',
    tools: [
      { name: 'HubSpot', logoUrl: 'https://cdn.simpleicons.org/hubspot' },
    ],
    cost: '$200–800/mo',
  },
  {
    category: 'Accounting',
    tools: [
      { name: 'QuickBooks', logoUrl: 'https://cdn.simpleicons.org/quickbooks' },
    ],
    cost: '$50–80/mo',
  },
  {
    category: 'SMS',
    tools: [
      // White variant so the mark reads on the dark bg.
      { name: 'Twilio', logoUrl: 'https://cdn.simpleicons.org/twilio/ffffff' },
    ],
    cost: '$50–150/mo',
  },
  {
    category: 'Forms',
    tools: [
      // White variant so the Typeform mark reads on the dark bg.
      { name: 'Typeform', logoUrl: 'https://cdn.simpleicons.org/typeform/ffffff' },
    ],
    cost: '$29–59/mo',
  },
  {
    category: 'Scheduling',
    tools: [
      { name: 'Calendly', logoUrl: 'https://cdn.simpleicons.org/calendly' },
    ],
    cost: '$12–20/mo',
  },
  {
    category: 'Courses / LMS',
    tools: [
      // On Simple Icons after all — crisper than the favicon.
      { name: 'Teachable', logoUrl: 'https://cdn.simpleicons.org/teachable' },
    ],
    cost: '$39–119/mo',
  },
  {
    category: 'Online Giving',
    tools: [
      { name: 'Tithe.ly', logoUrl: 'https://tithe.ly/favicon.ico' },
      { name: 'Donorbox', logoUrl: 'https://donorbox.org/favicon.ico' },
    ],
    cost: '$49–99/mo',
  },
];

const LogoChip: React.FC<{ tool: ToolRow['tools'][number] }> = ({ tool }) => (
  <span className="inline-flex items-center gap-1.5">
    <img
      src={tool.logoUrl}
      alt={tool.name}
      width={20}
      height={20}
      loading="lazy"
      className="w-5 h-5 object-contain rounded-sm flex-shrink-0"
      // NO filter, NO grayscale — render at full natural color
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <span className="text-white/80 text-sm">{tool.name}</span>
  </span>
);

export const WhatHarvestReplaces: React.FC = () => {
  return (
    <section id="replaces" className="py-24 md:py-32" style={{ backgroundColor: '#1e2330' }}>
      <div className="max-w-[900px] mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">
            What Harvest Replaces
          </p>
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
                <th className="text-left py-4 px-5 text-white/50 font-medium">Category</th>
                <th className="text-left py-4 px-5 text-white/50 font-medium">Replaces</th>
                <th className="text-right py-4 px-5 text-white/50 font-medium">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.category} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 text-white/70 text-sm font-medium align-top pt-4">
                    {row.category}
                  </td>
                  <td className="py-3.5 px-5 align-top pt-4">
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {row.tools.map((tool) => (
                        <LogoChip key={tool.name} tool={tool} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-white/80 text-right whitespace-nowrap align-top pt-4">
                    {row.cost}
                  </td>
                </tr>
              ))}

              {/* Total row — keep the middle cell present (empty) on all breakpoints so the
                  cost stays in the third column, aligned under Monthly with the rows above. */}
              <tr className="border-b border-white/10 bg-white/5">
                <td className="py-4 px-5 text-white font-semibold" colSpan={1}>Total</td>
                <td className="py-4 px-5" />
                <td className="py-4 px-5 text-white font-semibold text-right whitespace-nowrap">
                  $1,026–2,344/mo
                </td>
              </tr>

              {/* Harvest row — middle cell stays present for column alignment; its label is
                  hidden on mobile (as before) so it never crowds the narrow layout. */}
              <tr style={{ backgroundColor: 'rgba(184,150,46,0.12)' }}>
                <td className="py-4 px-5" colSpan={1}>
                  <span className="text-gold font-bold text-base">Harvest Ministry</span>
                </td>
                <td className="py-4 px-5 text-white/60 text-sm">
                  <span className="hidden sm:inline">Everything above — in one platform</span>
                </td>
                <td className="py-4 px-5 text-right whitespace-nowrap">
                  <span className="text-gold font-black text-lg">$479</span>
                  <span className="text-gold/60 text-sm">/mo</span>
                </td>
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
