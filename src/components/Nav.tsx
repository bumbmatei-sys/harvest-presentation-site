import React, { useState, useEffect } from 'react';
import { appSignupUrl } from '../lib/ref';

export const Nav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream/95 backdrop-blur-md border-b border-stone/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1140px] mx-auto px-6 flex items-center justify-between h-16">
        <a href="#hero" className={`text-xl font-bold tracking-tight ${scrolled ? 'text-warm-dark' : 'text-white'}`}>
          Harvest<span className="text-gold">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {['Pillars', 'Features', 'Pricing', 'Believers'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm font-medium transition-colors ${
                scrolled ? 'text-warm-brown hover:text-gold' : 'text-white/70 hover:text-white'
              }`}
            >
              {item}
            </a>
          ))}
          <a
            href={appSignupUrl()}
            className="bg-gold text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:bg-gold-light hover:-translate-y-0.5"
          >
            Access Harvest
          </a>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={scrolled ? '#1A1612' : '#fff'} strokeWidth="2">
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-cream border-t border-stone/60 px-6 py-4 flex flex-col gap-4">
          {['Pillars', 'Features', 'Pricing', 'Believers'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-warm-brown font-medium hover:text-gold"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
          <a
            href={appSignupUrl()}
            className="bg-gold text-white px-6 py-2.5 rounded-lg text-sm font-semibold text-center"
          >
            Access Harvest
          </a>
        </div>
      )}
    </nav>
  );
};
