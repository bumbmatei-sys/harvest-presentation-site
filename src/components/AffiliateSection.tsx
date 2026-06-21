import React from 'react';

const steps = [
  {
    num: "01",
    title: "Share Your Link",
    desc: "Get a unique referral link when you join Harvest. Share it with other ministries, churches, and evangelists in your network.",
  },
  {
    num: "02",
    title: "They Subscribe",
    desc: "When someone signs up through your link and subscribes to any paid plan, the connection is tracked automatically.",
  },
  {
    num: "03",
    title: "You Earn Monthly",
    desc: "Earn 10% recurring commission for as long as they stay subscribed. Not a one-time payout — monthly, ongoing income.",
  },
];

export const AffiliateSection: React.FC = () => {
  return (
    <section className="bg-earth grain-overlay py-24 md:py-36">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">
            Affiliate Program
          </p>
          <h2 className="text-white font-serif text-4xl md:text-5xl font-light text-balance">
            <span className="text-gold">10% recurring</span> commission
          </h2>
          <p className="text-white/40 text-lg mt-6 max-w-[500px] mx-auto">
            Partner with us and earn ongoing income for every ministry you refer.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-[900px] mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-px bg-gradient-to-r from-gold/30 to-transparent" />
              )}
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-gold/40 flex items-center justify-center mb-6">
                  <span className="text-gold font-serif text-xl">{step.num}</span>
                </div>
                <h3 className="text-white font-serif text-xl font-medium mb-3">
                  {step.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
