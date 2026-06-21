import React from 'react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="bg-warm-dark grain-overlay py-32 md:py-48 text-center">
      <div className="max-w-[700px] mx-auto px-6">
        {/* Wheat stalk logo */}
        <div className="mb-8 flex justify-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9963A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
            <path d="M24 44 C24 44 24 8 24 8 M24 8 C18 14 14 12 18 6 M24 8 C30 14 34 12 30 6 M24 16 C16 22 12 20 16 14 M24 16 C32 22 36 20 32 14 M24 24 C16 30 12 28 16 22 M24 24 C32 30 36 28 32 22 M24 32 C18 38 14 36 18 30 M24 32 C30 38 34 36 30 30" />
          </svg>
        </div>
        <h2 className="text-white font-serif text-4xl md:text-5xl font-light text-balance mb-6">
          From conversion to devotion.
        </h2>
        <p className="text-white/50 text-lg leading-relaxed mb-12 max-w-[480px] mx-auto">
          Start your ministry platform today. Your community is waiting.
        </p>
        <a
          href="https://theharvest.app"
          className="inline-flex items-center gap-2 bg-gold text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all hover:bg-gold-light hover:-translate-y-0.5"
        >
          Access Harvest
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-earth py-12 border-t border-white/5">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-white font-serif text-lg">Harvest<span className="text-gold">.</span></span>
            <span className="text-white/30 text-sm">From Conversion to Devotion</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="https://theharvest.app" className="text-white/40 hover:text-gold transition-colors">App</a>
            <a href="#pricing" className="text-white/40 hover:text-gold transition-colors">Pricing</a>
            <a href="#features" className="text-white/40 hover:text-gold transition-colors">Features</a>
            <a href="https://theharvest.app" className="text-white/40 hover:text-gold transition-colors">Get Started</a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} Harvest. Built for ministries, by ministries.
          </p>
        </div>
      </div>
    </footer>
  );
};
