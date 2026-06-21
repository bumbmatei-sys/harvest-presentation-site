import React from 'react';
import { ParallaxLayer } from './ParallaxLayer';

const believerFeatures = [
  'Read the full Bible with reading plans',
  'Chat with AI trained on your ministry\'s teachings',
  'Join community discussions and prayer requests',
  'Take courses and track your spiritual growth',
  'Receive personalized devotionals and content',
  'Access everything from your phone — it\'s a PWA',
];

export const BelieversSection: React.FC = () => {
  return (
    <section id="believers" className="bg-light-gold py-24 md:py-36 overflow-hidden">
      <div className="max-w-[1140px] mx-auto px-6">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-16 items-center">
          {/* Text */}
          <div>
            <p className="text-gold text-xs font-semibold tracking-[3px] uppercase mb-4">
              For Believers
            </p>
            <h2 className="text-warm-dark font-serif text-4xl md:text-5xl font-light mb-6 text-balance">
              A home for their faith journey
            </h2>
            <p className="text-warm-brown text-lg leading-relaxed mb-8">
              Members get a beautiful, simple app — no clutter, no ads, no noise. Just their ministry, their community, and tools to grow.
            </p>
            <ul className="space-y-4 mb-10">
              {believerFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-warm-brown font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://theharvest.app"
              className="inline-flex items-center gap-2 text-gold font-semibold hover:text-gold-dark transition-colors"
            >
              Open the app
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Phone mockup with parallax depth */}
          <ParallaxLayer speed={0.12}>
            <div className="relative mx-auto" style={{ maxWidth: '300px' }}>
              <div className="bg-warm-dark rounded-[2.5rem] p-3 shadow-2xl border-4 border-earth/40">
                <div className="bg-cream rounded-[2rem] overflow-hidden h-[580px] flex flex-col">
                  {/* Mock app header */}
                  <div className="bg-gold px-5 py-4 flex items-center justify-between">
                    <span className="text-white font-serif text-lg">Harvest</span>
                    <div className="w-7 h-7 rounded-full bg-white/20" />
                  </div>
                  {/* Mock content */}
                  <div className="flex-1 p-5 space-y-4">
                    <div className="h-3 bg-stone rounded-full w-3/4" />
                    <div className="h-3 bg-stone rounded-full w-full" />
                    <div className="h-3 bg-stone rounded-full w-5/6" />
                    <div className="h-32 bg-light-gold rounded-xl mt-4 flex items-center justify-center">
                      <span className="text-gold/40 text-xs">Daily Devotional</span>
                    </div>
                    <div className="h-3 bg-stone rounded-full w-2/3" />
                    <div className="h-3 bg-stone rounded-full w-4/5" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-8 w-8 rounded-full bg-gold/20" />
                      <div className="h-8 w-8 rounded-full bg-earth/20" />
                      <div className="h-8 w-8 rounded-full bg-warm-brown/20" />
                    </div>
                  </div>
                  {/* Mock bottom nav */}
                  <div className="bg-cream border-t border-stone px-5 py-3 flex justify-around">
                    {['◆', '☰', '✉', '♡'].map((icon, idx) => (
                      <span key={idx} className={`text-lg ${idx === 0 ? 'text-gold' : 'text-stone'}`}>
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 bg-gold/10 rounded-[3rem] -z-10 blur-2xl" />
            </div>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
};
