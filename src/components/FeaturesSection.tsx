"use client";
import React from 'react';

interface FeaturesSectionProps {
 onNavigate?: (page: string) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
 return (
 <section id="core" className="bg-[#0b1121] py-24 sm:py-32 relative border-t border-white/5">
 <div className="absolute inset-0 bg-gradient-to-b from-[#0b1121] via-[#0b1121]/95 to-[#0b1121] pointer-events-none"></div>
 
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
  <div className="text-center max-w-3xl mx-auto mb-20">
  <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">The Platform</span>
  <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
   Everything they need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">grow.</span>
  </h2>
  <p className="text-lg md:text-xl text-gray-400 font-medium">
   A meticulously crafted digital ecosystem designed to turn new believers into fully devoted disciples.
  </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
  {/* Big Feature 1 - Daily Discipleship (Spans 8 columns) */}
  <div className="md:col-span-8 bg-[#11172A] border border-white/10 rounded-[32px] overflow-hidden group shadow-2xl relative min-h-[400px] flex flex-col justify-end p-8 sm:p-12">
   <div className="absolute inset-0 bg-gradient-to-t from-[#11172A] via-[#11172A]/80 to-transparent z-10 pointer-events-none"></div>
   <div className="absolute top-0 right-0 w-2/3 h-full mix-blend-screen opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-bl from-primary/30 to-transparent blur-[80px]"></div>
   </div>
   
   {/* Mockup visual representation completely pulled out of opacity/blend divs */}
   <div className="absolute right-0 top-10 translate-x-1/4 rounded-[24px] border border-white/20 border-r-0 w-[300px] h-[400px] bg-[#1e293b]/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(212,175,55,0.3)] rotate-12 flex flex-col p-5 gap-4 transition-transform duration-700 group-hover:rotate-6 z-20">
    <div className="w-full h-40 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
     <span className="material-symbols-outlined text-5xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">play_circle</span>
    </div>
    <div className="w-3/4 h-5 bg-white/20 rounded-md mt-2"></div>
    <div className="w-1/2 h-4 bg-white/10 rounded-md"></div>
   </div>

   <div className="relative z-20 max-w-lg">
   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/5 backdrop-blur-md">
    <span className="material-symbols-outlined text-primary">menu_book</span>
   </div>
   <h3 className="text-3xl font-bold text-white mb-4">The 40-Day Journey</h3>
   <p className="text-gray-400 text-lg leading-relaxed mb-6">
    Short, highly engaging daily video lessons covering the foundational tenets of the Christian faith. From salvation to spiritual warfare, baptism to finding a local church.
   </p>
   <button onClick={() => onNavigate && onNavigate('auth')} className="text-primary font-bold hover:text-white transition-colors text-sm flex items-center gap-1 group/btn">
    Explore Curriculum <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
   </button>
   </div>
  </div>

  {/* Feature 2 - Local Map (Spans 4 columns) */}
  <div className="md:col-span-4 bg-[#11172A] border border-white/10 rounded-[32px] overflow-hidden group shadow-2xl relative min-h-[400px] flex flex-col justify-end p-8 sm:p-10">
   <div className="absolute inset-0 bg-gradient-to-t from-[#11172A] via-[#11172A]/80 to-transparent z-10 pointer-events-none"></div>
   <div className="absolute top-0 left-0 w-full h-1/2 mix-blend-screen opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-b from-blue-500/30 to-transparent blur-[60px]"></div>
   </div>
   
   {/* Mockup visual */}
   <div className="absolute left-1/2 -translate-x-1/2 top-10 w-36 h-36 bg-blue-500/30 rounded-full border border-blue-400/50 flex items-center justify-center backdrop-blur-2xl group-hover:scale-110 transition-transform duration-500 shadow-[0_0_50px_rgba(59,130,246,0.4)] z-20">
    <span className="material-symbols-outlined text-6xl text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">my_location</span>
   </div>

   <div className="relative z-30">
   <h3 className="text-2xl font-bold text-white mb-3">Church Locator</h3>
   <p className="text-gray-400 leading-relaxed mb-4">
    An integrated global map directing new believers to sound, gospel-preaching local churches in their exact area.
   </p>
   <span className="text-blue-400 font-bold text-sm flex items-center gap-1">
    Community focused
   </span>
   </div>
  </div>

  {/* Feature 3 - AI Chat (Spans 4 columns) */}
  <div className="md:col-span-4 bg-[#11172A] border border-white/10 rounded-[32px] overflow-hidden group shadow-2xl relative min-h-[400px] flex flex-col justify-end p-8 sm:p-10">
   <div className="absolute inset-0 bg-gradient-to-t from-[#11172A] via-[#11172A]/80 to-transparent z-10 pointer-events-none"></div>
   <div className="absolute top-0 left-0 w-full h-1/2 mix-blend-screen opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-b from-purple-500/30 to-transparent blur-[60px]"></div>
   </div>
   
   {/* Mockup */}
   <div className="absolute left-6 top-10 w-[120%] h-36 bg-[#1e293b]/95 rounded-2xl border border-white/30 backdrop-blur-2xl p-6 flex flex-col gap-4 group-hover:translate-x-3 transition-transform duration-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] z-20 border-r-0">
    <div className="flex items-center gap-4">
     <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
      <span className="material-symbols-outlined text-sm text-purple-400">smart_toy</span>
     </div>
     <div className="w-32 h-3.5 bg-white/30 rounded-full"></div>
    </div>
    <div className="w-4/5 h-3 bg-white/20 rounded-full ml-14"></div>
    <div className="w-1/2 h-3 bg-white/20 rounded-full ml-14"></div>
   </div>

   <div className="relative z-30">
   <h3 className="text-2xl font-bold text-white mb-3">24/7 AI Counselor</h3>
   <p className="text-gray-400 leading-relaxed mb-4">
    Trained strictly on scripture to answer hard questions, provide prayer, and guide believers through struggles.
   </p>
   <button onClick={() => onNavigate && onNavigate('auth')} className="text-purple-400 font-bold hover:text-white transition-colors text-sm flex items-center gap-1 group/btn">
    Try Harvest AI <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
   </button>
   </div>
  </div>

  {/* Feature 4 - Multi-Language (Spans 8 columns) */}
  <div className="md:col-span-8 bg-[#11172A] border border-white/10 rounded-[32px] overflow-hidden group shadow-2xl relative min-h-[400px] flex flex-col justify-end p-8 sm:p-12">
   <div className="absolute inset-0 bg-gradient-to-t from-[#11172A] via-[#11172A]/80 to-transparent z-10 pointer-events-none"></div>
   <div className="absolute top-0 right-0 w-1/2 h-full mix-blend-screen opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none">
    <div className="w-full h-full bg-gradient-to-bl from-green-500/30 to-transparent blur-[80px]"></div>
   </div>
   <div className="absolute top-1/2 right-10 md:right-20 -translate-y-1/2 text-[120px] md:text-[150px] font-black text-white/20 select-none -rotate-12 transition-all duration-700 group-hover:rotate-0 group-hover:text-white/40 z-20 drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-b from-white/60 to-white/10">190+</div>

   <div className="relative z-30 max-w-lg">
   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/5 backdrop-blur-md">
    <span className="material-symbols-outlined text-green-400">translate</span>
   </div>
   <h3 className="text-3xl font-bold text-white mb-4">Native Languages</h3>
   <p className="text-gray-400 text-lg leading-relaxed">
    The Great Commission commands us to reach all nations. Our platform is built to dynamically translate to the user's native tongue, ensuring the Gospel is understood deeply and personally.
   </p>
   </div>
  </div>

  </div>
 </div>
 </section>
 );
};

export default FeaturesSection;
