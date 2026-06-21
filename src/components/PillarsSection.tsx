import React from 'react';
import { ParallaxLayer } from './ParallaxLayer';

const pillars = [
  {
    title: "Build Your Community",
    desc: "A private space for your people — feeds, events, prayer requests, and real connection. Not a Facebook group. Not a forum. A community that belongs to your ministry.",
    accent: "gold",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="24" cy="18" r="6" />
        <circle cx="12" cy="24" r="4" opacity="0.6" />
        <circle cx="36" cy="24" r="4" opacity="0.6" />
        <path d="M24 28c-6 0-12 4-12 10M24 28c6 0 12 4 12 10M12 30c-4 1-8 4-8 8M36 30c4 1 8 4 8 8" />
      </svg>
    ),
  },
  {
    title: "Grow Your Ministry",
    desc: "Courses, blogs, and teaching tools designed to move people from curiosity to commitment. Track growth, measure engagement, and see real discipleship happen.",
    accent: "earth",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 36l8-12 8 6 16-20" />
        <path d="M30 10h6v6" />
        <path d="M6 42h36" opacity="0.4" />
      </svg>
    ),
  },
  {
    title: "Technology That Serves",
    desc: "Your data. Your code. Your brand. Not rented space on someone else\u2019s platform. White-labeled, customizable, and yours — the way ministry technology should be.",
    accent: "warm",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="8" width="32" height="32" rx="4" />
        <path d="M8 20h32M20 8v32" opacity="0.5" />
        <circle cx="14" cy="14" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Full Bible Integration",
    desc: "The complete Bible built into your platform. Reading plans, verse sharing, and AI-powered study tools that connect scripture to every part of your ministry.",
    accent: "gold",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 10c-4-2-12-2-16 0v28c4-2 12-2 16 0 4-2 12-2 16 0V10c-4-2-12-2-16 0z" />
        <path d="M24 10v28" opacity="0.5" />
      </svg>
    ),
  },
];

export const PillarsSection: React.FC = () => {
  return (
    <section id="pillars" className="bg-cream py-24 md:py-36">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">What Harvest Does</p>
          <h2 className="text-warm-dark font-serif text-4xl md:text-5xl font-light text-balance">
            Four pillars, one platform
          </h2>
        </div>

        <div className="space-y-24 md:space-y-32">
          {pillars.map((pillar, i) => {
            const isReversed = i % 2 === 1;
            return (
              <div
                key={pillar.title}
                className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center ${
                  isReversed ? "md:[direction:rtl]" : ""
                }`}
              >
                {/* Visual side */}
                <ParallaxLayer
                  speed={0.08}
                  className="[direction:ltr]"
                >
                  <div
                    className={`aspect-[4/3] rounded-2xl flex items-center justify-center p-12 ${
                      pillar.accent === "gold"
                        ? "bg-light-gold"
                        : pillar.accent === "earth"
                        ? "bg-earth"
                        : pillar.accent === "warm"
                        ? "bg-stone"
                        : "bg-light-gold"
                    }`}
                  >
                    <div
                      className={`w-32 h-32 ${
                        pillar.accent === "earth" ? "text-gold/40" : "text-gold/60"
                      }`}
                    >
                      {pillar.icon}
                    </div>
                  </div>
                </ParallaxLayer>

                {/* Text side */}
                <div className="[direction:ltr]">
                  <p className="text-gold text-sm font-semibold tracking-[2px] uppercase mb-3">
                    0{i + 1}
                  </p>
                  <h3 className="text-warm-dark font-serif text-3xl md:text-4xl font-light mb-5 leading-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-warm-brown text-lg leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
