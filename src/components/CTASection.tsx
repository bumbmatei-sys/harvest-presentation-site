"use client";
import React from 'react';

interface CTASectionProps {
 onNavigate?: (page: string) => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onNavigate }) => {
 return (
 <section id="vision" className="bg-[#0b1121] py-32 relative overflow-hidden flex items-center justify-center">
 {/* Atmospheric Glow */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen opacity-50"></div>
 
 {/* Radial gradient mask for scroll fade */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0b1121_80%)] pointer-events-none"></div>
 
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
  <span className="text-primary font-bold tracking-widest uppercase text-xs mb-6 block drop-shadow-md">The Vision</span>
  <h2 className="text-5xl md:text-7xl lg:text-[80px] font-black text-white mb-8 leading-[0.9] tracking-tighter mix-blend-plus-lighter">
  Ready for the <br />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-yellow-600 block mt-2 pb-2">
   Billion Soul Harvest.
  </span>
  </h2>
  
  <p className="text-xl md:text-2xl font-medium text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
  We believe a one-billion soul harvest is coming. For that harvest to last, churches all over the world need to be prepared to receive the millions of converts and bring them to maturity.
  <br/><br/>
  <span className="text-gray-300">We are building the infrastructure to turn moments of decision into lifetimes of devotion.</span>
  </p>

  <button 
  onClick={() => onNavigate && onNavigate('auth')}
  className="relative inline-flex items-center justify-center px-12 h-16 text-lg font-black text-[#0b1121] bg-white rounded-full transition-all hover:scale-105 active:scale-95 group overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)]"
  >
  <span className="absolute inset-0 bg-gradient-to-r from-primary to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
  <span className="relative z-10 flex items-center gap-3">
   Start Your Journey
   <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
  </span>
  </button>
 </div>
 </section>
 );
};

export default CTASection;
