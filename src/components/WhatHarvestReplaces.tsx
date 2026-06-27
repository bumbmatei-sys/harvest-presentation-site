import React from 'react';

const tools: { tool: string; does: string; cost: string }[] = [
  { tool: "Subsplash / Church Online", does: "Church app + livestream", cost: "$300–500/mo" },
  { tool: "Planning Center", does: "Events + check-in", cost: "$99–199/mo" },
  { tool: "Mailchimp", does: "Newsletter + email", cost: "$50–100/mo" },
  { tool: "HubSpot / Salesforce", does: "CRM", cost: "$200–800/mo" },
  { tool: "QuickBooks", does: "Accounting", cost: "$50–80/mo" },
  { tool: "Twilio", does: "SMS", cost: "$50–150/mo" },
  { tool: "The Church Co", does: "Website", cost: "$39–99/mo" },
  { tool: "Typeform", does: "Custom forms", cost: "$29–59/mo" },
];

export const WhatHarvestReplaces: React.FC = () => {
  return (
    <section id="replaces" className="py-24 md:py-32" style={{ backgroundColor: '#1e2330' }}>
      <div className="max-w-[900px] mx-auto px-6">
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
                <th className="text-left py-4 px-5 text-white/50 font-medium">Tool</th>
                <th className="text-left py-4 px-5 text-white/50 font-medium hidden sm:table-cell">What it does</th>
                <th className="text-right py-4 px-5 text-white/50 font-medium">Monthly cost</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.tool} className="border-b border-white/5">
                  <td className="py-3.5 px-5 text-white">{t.tool}</td>
                  <td className="py-3.5 px-5 text-white/60 hidden sm:table-cell">{t.does}</td>
                  <td className="py-3.5 px-5 text-white/80 text-right whitespace-nowrap">{t.cost}</td>
                </tr>
              ))}
              <tr className="border-b border-white/10 bg-white/5">
                <td className="py-4 px-5 text-white font-semibold">Total</td>
                <td className="py-4 px-5 hidden sm:table-cell" />
                <td className="py-4 px-5 text-white font-semibold text-right whitespace-nowrap">$817–1,987/mo</td>
              </tr>
              <tr style={{ backgroundColor: 'rgba(184,150,46,0.15)' }}>
                <td className="py-4 px-5 text-gold font-semibold">Harvest Ministry</td>
                <td className="py-4 px-5 text-white/70 hidden sm:table-cell">Everything above</td>
                <td className="py-4 px-5 text-gold font-bold text-right whitespace-nowrap">$479/mo</td>
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
