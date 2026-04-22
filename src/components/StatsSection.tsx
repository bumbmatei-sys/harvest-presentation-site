"use client";
import React from 'react';

const StatsSection: React.FC = () => {
 return (
 <section id="challenge" className="bg-[#0b1121] py-24 sm:py-32 relative z-20">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
  <div>
   <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">The Challenge</span>
   <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight mb-8">
    The Harvest is Plentiful, <span className="text-[#cca02a]">but...</span>
   </h2>
  </div>
  <div className="text-lg text-gray-400 leading-relaxed space-y-6 lg:border-l border-white/10 lg:pl-10 font-medium">
   <p>
    Every single week, hundreds of thousands of people across the world accept Jesus as their Savior. The Kingdom is expanding at an unprecedented rate.
   </p>
   <p>
    But with this amazing growth comes a vital question: <strong className="text-white">"What is the retention percentage?"</strong> How many grow to maturity to fulfill the Great Commandment?
   </p>
   <p>
    The Harvest App was created to bridge the gap between the altar call and a lifetime of walking with Jesus.
   </p>
  </div>
 </div>

 <div className="grid md:grid-cols-3 gap-6">
  {/* Stat Card 1 */}
  <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
   <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors"></div>
   <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#0b1121]/50">
     <span className="material-symbols-outlined text-primary text-sm">trending_down</span>
    </div>
    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Retention Rate</span>
   </div>
   <p className="text-6xl font-black text-white mb-4 tracking-tighter">15<span className="text-3xl text-primary">%</span></p>
   <p className="text-gray-400 text-sm leading-relaxed">Average retention of new believers that remain in church after receiving Jesus worldwide.</p>
  </div>

  {/* Stat Card 2 */}
  <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
   <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
   <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#0b1121]/50">
     <span className="material-symbols-outlined text-blue-400 text-sm">group_add</span>
    </div>
    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">New Believers</span>
   </div>
   <p className="text-6xl font-black text-white mb-4 tracking-tighter">1B<span className="text-3xl text-blue-400">+</span></p>
   <p className="text-gray-400 text-sm leading-relaxed">Projected souls to be saved in the coming decade needing immediate discipleship guidance.</p>
  </div>

  {/* Stat Card 3 */}
  <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
   <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 blur-3xl rounded-full"></div>
   <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#0b1121]/50">
     <span className="material-symbols-outlined text-green-400 text-sm">language</span>
    </div>
    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Global Reach</span>
   </div>
   <p className="text-6xl font-black text-white mb-4 tracking-tighter">190</p>
   <p className="text-gray-400 text-sm leading-relaxed">Countries requiring localized, beautifully accessible daily discipleship tools.</p>
  </div>
 </div>
 </div>
 </section>
 );
};

export default StatsSection;
