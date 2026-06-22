import React from 'react';

const plans = [
  {
    name: "Individual",
    price: "$59",
    period: "/month",
    retention: 90,
    desc: "For independent evangelists and solo ministers.",
    features: [
      "Blog",
      "News Feed",
      "Bible",
      "2 courses",
      "1 admin",
      "Subdomain",
      "10% lifetime affiliate",
      "Donation page",
      "Prayer requests",
    ],
  },
  {
    name: "Small Team",
    price: "$99",
    period: "/month",
    retention: 95,
    desc: "For small ministries ready to grow as a team.",
    features: [
      "Everything in Individual",
      "5 Courses",
      "5 admins",
      "AI Chat",
      "AI Knowledge Base",
      "Newsletter",
      "Church Map",
      "Fundraising (soon)",
    ],
  },
  {
    name: "Community",
    price: "$199",
    period: "/month",
    retention: 100,
    desc: "For established churches ready to go deeper.",
    features: [
      "Everything in Small Team",
      "Unlimited admins",
      "Unlimited courses",
      "Custom Branding",
      "15% lifetime affiliate",
      "Automated Newsletter",
      "Automated devotional (soon)",
      "Event registration (soon)",
      "Docs (soon)",
    ],
    popular: true,
  },
  {
    name: "Ministry",
    price: "$399",
    period: "/month",
    retention: 100,
    desc: "For large ministries with full-time teams.",
    features: [
      "Everything in Community",
      "1 Personal AI Assistant",
      "Automated Blog Articles (soon)",
      "CRM for Donors & Members (soon)",
      "Accounting Tools (soon)",
      "Community Groups (soon)",
    ],
  },
  {
    name: "Organization",
    price: "Custom",
    period: "",
    retention: 100,
    desc: "For networks, denominations, and large organizations.",
    features: [
      "Everything in Ministry",
      "Unlimited AI assistants",
      "Unlimited churches",
      "Tax receipt generation (soon)",
      "20% lifetime affiliate",
    ],
  },
];

type CellValue = boolean | string;

const tableRows: { feature: string; values: CellValue[] }[] = [
  { feature: "Blog", values: [true, true, true, true, true] },
  { feature: "News Feed", values: [true, true, true, true, true] },
  { feature: "Bible", values: [true, true, true, true, true] },
  { feature: "Prayer Requests", values: [true, true, true, true, true] },
  { feature: "Donation Page", values: [true, true, true, true, true] },
  { feature: "AI Chat", values: [false, true, true, true, true] },
  { feature: "AI Knowledge Base", values: [false, true, true, true, true] },
  { feature: "Courses", values: ["2", "5", "∞", "∞", "∞"] },
  { feature: "Admin Accounts", values: ["1", "5", "∞", "∞", "∞"] },
  { feature: "Church Map", values: [false, true, true, true, true] },
  { feature: "Newsletter", values: [false, true, true, true, true] },
  { feature: "Custom Branding", values: [false, false, true, true, true] },
  { feature: "AI Assistant", values: [false, false, false, "1", "∞"] },
  { feature: "Unlimited Churches", values: [false, false, false, false, true] },
  { feature: "Lifetime Affiliate", values: ["10%", "10%", "15%", "15%", "20%"] },
  { feature: "Donation Retention", values: ["90%", "95%", "100%", "100%", "100%"] },
  // Coming soon
  { feature: "Fundraising", values: [false, "soon", "soon", "soon", "soon"] },
  { feature: "Automated Devotional", values: [false, false, "soon", "soon", "soon"] },
  { feature: "Event Registration", values: [false, false, "soon", "soon", "soon"] },
  { feature: "Docs", values: [false, false, "soon", "soon", "soon"] },
  { feature: "Automated Blog Articles", values: [false, false, false, "soon", "soon"] },
  { feature: "CRM (Donors & Members)", values: [false, false, false, "soon", "soon"] },
  { feature: "Accounting Tools", values: [false, false, false, "soon", "soon"] },
  { feature: "Community Groups", values: [false, false, false, "soon", "soon"] },
  { feature: "Tax Receipt Generation", values: [false, false, false, false, "soon"] },
];

const soonRowStart = 16;

export const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="bg-cream py-24 md:py-36">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">Pricing</p>
          <h2 className="text-warm-dark font-serif text-4xl md:text-5xl font-light text-balance">
            Plans that grow with you
          </h2>
          <p className="text-warm-brown text-lg mt-6 max-w-[600px] mx-auto">
            The more you grow, the more you keep. Donation retention climbs with every tier — from 90% to 100%.
          </p>
        </div>

        {/* Retention progression bar */}
        <div className="mb-16 max-w-[800px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-warm-brown tracking-wider uppercase">Donation Retention</span>
            <span className="text-xs text-warm-brown/60">Grows with plan</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-stone">
            <div className="bg-gold/50 flex-1" />
            <div className="bg-gold/65 flex-1" />
            <div className="bg-gold flex-1" />
            <div className="bg-gold flex-1" />
            <div className="bg-gold flex-1" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-warm-brown/60">
            <span>90%</span>
            <span>95%</span>
            <span>100%</span>
            <span>100%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border transition-all ${
                plan.popular
                  ? "border-gold bg-white shadow-lg md:-translate-y-2"
                  : "border-stone bg-white/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Retention percentage */}
              <div className="text-center mb-6">
                <div className="text-gold font-serif text-4xl font-light">
                  {plan.retention}<span className="text-gold/50 text-2xl">%</span>
                </div>
                <p className="text-[10px] text-warm-brown/60 tracking-wider uppercase mt-1">
                  Donation Retention
                </p>
              </div>

              <h3 className="text-warm-dark font-serif text-xl font-medium text-center mb-1">
                {plan.name}
              </h3>
              <p className="text-warm-brown/70 text-xs text-center mb-4 leading-relaxed">
                {plan.desc}
              </p>

              <div className="text-center mb-6">
                <span className="text-warm-dark font-serif text-3xl font-medium">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-warm-brown/60 text-sm">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-warm-brown">
                    <svg className="w-3.5 h-3.5 text-gold flex-shrink-0 mt-0.5" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="https://theharvest.app"
                className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-gold text-white hover:bg-gold-light"
                    : "border border-gold text-gold hover:bg-gold hover:text-white"
                }`}
              >
                {plan.name === "Organization" ? "Contact Us" : "Get Started"}
              </a>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <details className="mt-16 max-w-[900px] mx-auto">
          <summary className="cursor-pointer text-center text-gold font-semibold text-sm hover:text-gold-dark transition-colors">
            Compare all features →
          </summary>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone">
                  <th className="text-left py-3 text-warm-brown font-medium">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} className="text-center py-3 text-warm-dark font-serif font-medium">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <React.Fragment key={row.feature}>
                    {idx === soonRowStart && (
                      <tr>
                        <td colSpan={6} className="pt-5 pb-2 px-0">
                          <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-500">Coming Soon</span>
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-stone/50">
                      <td className="py-3 text-warm-brown">{row.feature}</td>
                      {row.values.map((val, i) => (
                        <td key={i} className="text-center py-3">
                          {typeof val === "boolean" ? (
                            val ? (
                              <span className="text-gold">✓</span>
                            ) : (
                              <span className="text-stone">—</span>
                            )
                          ) : val === "soon" ? (
                            <span className="text-amber-500 text-xs font-semibold">Soon</span>
                          ) : (
                            <span className="text-warm-dark font-medium">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
};
