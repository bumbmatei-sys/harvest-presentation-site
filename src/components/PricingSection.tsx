"use client";
import React from 'react';

interface PricingSectionProps {
  onNavigate?: (page: string) => void;
}

const plans = [
  {
    name: 'Starter',
    price: '$100',
    period: '/mo',
    description: 'Everything you need to start discipling your congregation online.',
    features: {
      subdomain: true,
      customDomain: false,
      churches: '1',
      courses: '5',
      admins: '2',
      blog: false,
      aiChat: false,
      aiKnowledge: false,
      map: false,
      rebranding: false,
    },
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$250',
    period: '/mo',
    description: 'Advanced tools for growing churches that want more control.',
    features: {
      subdomain: true,
      customDomain: false,
      churches: '1',
      courses: 'Unlimited',
      admins: '5',
      blog: true,
      aiChat: true,
      aiKnowledge: true,
      map: false,
      rebranding: false,
    },
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Ultra',
    price: '$500',
    period: '/mo',
    description: 'Full white-label experience with your own domain and branding.',
    features: {
      subdomain: true,
      customDomain: true,
      churches: '1',
      courses: 'Unlimited',
      admins: 'Unlimited',
      blog: true,
      aiChat: true,
      aiKnowledge: true,
      map: false,
      rebranding: true,
    },
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Unlimited scale for multi-campus churches and organizations.',
    features: {
      subdomain: true,
      customDomain: true,
      churches: 'Unlimited',
      courses: 'Unlimited',
      admins: 'Unlimited',
      blog: true,
      aiChat: true,
      aiKnowledge: true,
      map: true,
      rebranding: true,
    },
    cta: 'Contact Us',
    popular: false,
  },
];

const featureRows = [
  { key: 'subdomain', label: 'Subdomain', icon: 'language' },
  { key: 'customDomain', label: 'Custom domain', icon: 'domain' },
  { key: 'churches', label: 'Churches', icon: 'church' },
  { key: 'courses', label: 'Courses', icon: 'menu_book' },
  { key: 'admins', label: 'Admin accounts', icon: 'group' },
  { key: 'blog', label: 'Blog', icon: 'article' },
  { key: 'aiChat', label: 'AI Chat', icon: 'smart_toy' },
  { key: 'aiKnowledge', label: 'AI Knowledge Base', icon: 'psychology' },
  { key: 'map', label: 'Church map directory', icon: 'map' },
  { key: 'rebranding', label: 'Full rebranding', icon: 'palette' },
];

const Check = () => (
  <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
);

const Cross = () => (
  <span className="material-symbols-outlined text-gray-300 text-xl">cancel</span>
);

const PricingSection: React.FC<PricingSectionProps> = ({ onNavigate }) => {
  return (
    <section id="plans" className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">For Ministries</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-6">
            Your Ministry. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">Your Platform.</span>
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            Get your own isolated instance with your own feed, courses, and community. Empower your congregation with purpose-built discipleship tools.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                plan.popular
                  ? 'border-primary bg-gradient-to-b from-yellow-50/50 to-white shadow-xl shadow-primary/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 font-medium">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{plan.description}</p>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => onNavigate && onNavigate(plan.cta === 'Contact Us' ? 'contact-support' : 'auth')}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-yellow-600 shadow-lg shadow-primary/20'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare all features</h3>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 w-1/3">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="py-4 px-4 text-center">
                      <div className="font-bold text-gray-900">{plan.name}</div>
                      <div className="text-gray-500 font-medium text-xs mt-0.5">
                        {plan.price}{plan.period}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row, i) => (
                  <tr key={row.key} className={i < featureRows.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="py-3.5 px-6 text-gray-700 font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-lg">{row.icon}</span>
                      {row.label}
                    </td>
                    {plans.map((plan) => {
                      const value = plan.features[row.key as keyof typeof plan.features];
                      return (
                        <td key={plan.name} className="py-3.5 px-4 text-center">
                          {typeof value === 'boolean' ? (
                            value ? <Check /> : <Cross />
                          ) : (
                            <span className="font-semibold text-gray-900">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
