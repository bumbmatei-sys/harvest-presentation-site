import React from 'react';
import { ParallaxLayer } from './ParallaxLayer';

export const Hero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-dark"
    >
      {/* Background field image — parallax layer 1 (slowest) */}
      <ParallaxLayer speed={0.15} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(./logos/harvest-field.jpg)' }}
        />
      </ParallaxLayer>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-warm-dark/82" />

      {/* Grain texture */}
      <div className="absolute inset-0 z-15 grain-overlay" />

      {/* Stat callout — parallax layer 2 (medium speed) */}
      <ParallaxLayer speed={0.25} className="absolute z-20 top-[60%] left-[8%] hidden lg:block">
        <div className="text-gold/30 font-serif text-[120px] font-light leading-none select-none">
          85%
        </div>
      </ParallaxLayer>

      {/* Foreground content — normal scroll */}
      <div className="relative z-30 max-w-[860px] mx-auto px-6 text-center pt-20">
        <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-6">
          The digital foundation for ministries
        </p>
        <h1 className="text-white font-serif font-light text-display text-balance">
          The digital foundation that turns a moment of decision into a{' '}
          <em className="not-italic text-gold font-medium">lifetime of devotion.</em>
        </h1>
        <p className="text-white/60 text-lg max-w-[560px] mx-auto mt-8 leading-relaxed">
          Your own branded ministry platform. AI trained on your teachings, community built for your people, courses designed for growth.
        </p>
        <div className="flex gap-4 justify-center mt-12 flex-wrap">
          <a
            href="https://theharvest.app"
            className="bg-gold text-white px-8 py-4 rounded-lg font-semibold transition-all hover:bg-gold-light hover:-translate-y-0.5"
          >
            Access Harvest
          </a>
          <a
            href="#pricing"
            className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:border-white/60 hover:bg-white/5"
          >
            See Plans
          </a>
        </div>
        <p className="text-white/40 text-sm mt-8 max-w-md mx-auto">
          <span className="text-gold/80 font-semibold">85%</span> of new believers fall away within the first year
        </p>
      </div>
    </section>
  );
};
