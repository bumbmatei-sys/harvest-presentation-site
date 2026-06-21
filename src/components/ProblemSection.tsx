import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="bg-warm-dark grain-overlay py-32 md:py-48">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-16 items-center">
          {/* The number IS the design */}
          <div className="text-center md:text-left">
            <div className="text-gold font-serif text-stat font-light leading-none">
              85<span className="text-gold/50">%</span>
            </div>
            <p className="text-white/50 text-sm font-semibold tracking-[2px] uppercase mt-4">
              of new believers fall away
            </p>
          </div>

          {/* The explanation */}
          <div>
            <h2 className="text-white font-serif text-3xl md:text-4xl font-light leading-tight mb-6 text-balance">
              Not because the gospel isn't powerful — because the follow-through isn't there.
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Every week hundreds of thousands accept Jesus worldwide, but without a system to nurture that decision, most drift away. The gap between conversion and devotion isn't a spiritual problem. It's a structural one.
            </p>
            <div className="mt-10 pt-10 border-t border-white/10">
              <p className="text-gold font-serif text-xl font-light italic">
                Harvest closes that gap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
