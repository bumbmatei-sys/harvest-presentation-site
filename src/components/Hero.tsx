"use client";
import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
 onNavigate?: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
 const scrollToPartner = (e: React.MouseEvent) => {
 e.preventDefault();
 const element = document.getElementById('partner');
 if (element) {
 const headerOffset = 100;
 window.scrollTo({
 top: element.getBoundingClientRect().top + window.pageYOffset - headerOffset,
 behavior: "smooth"
 });
 }
 };
 
 const containerVariants = {
  hidden: { opacity: 0 },
  show: {
   opacity: 1,
   transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
 };

 const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 70, damping: 20 } }
 };

 return (
 <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden bg-[#0b1121]">
 {/* Background Image & Orbs */}
 <div className="absolute inset-0 z-0">
 <img 
 src="https://raw.githubusercontent.com/bumbmatei-sys/pictures/main/No_people_just_2k_202512231746.jpeg" 
 alt="Harvest Background" 
 className="w-full h-full object-cover scale-105 opacity-40 blur-[2px]"
 referrerPolicy="no-referrer"
 />
 <div className="absolute inset-0 bg-gradient-to-b from-[#0b1121]/90 via-[#0b1121]/60 to-[#0b1121]"></div>
 
 {/* Cinematic Glows */}
 <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] md:w-[60vw] h-[60vh] bg-primary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-60"></div>
 </div>
 
 <motion.div 
 variants={containerVariants}
 initial="hidden"
 animate="show"
 className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center mt-8 md:mt-20"
 >
 {/* Badge */}
 <motion.div variants={itemVariants} className="mb-6 mb-8">
  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-[#D4AF37] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
   <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
   The Next Generation
  </span>
 </motion.div>

 {/* Headline */}
 <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl lg:text-[100px] font-black text-white leading-[0.9] tracking-tighter max-w-5xl">
 From Conversion to <br className="hidden md:block" />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-yellow-600 block mt-2 pb-2">
  Spiritual Maturity.
 </span>
 </motion.h1>
 
 {/* Subtext */}
 <motion.p variants={itemVariants} className="mt-8 text-lg md:text-2xl text-[#ffffff] leading-relaxed max-w-2xl font-medium mx-auto">
 Providing the digital foundation for the global harvest. We don't just count decisions, we build disciples.
 </motion.p>
 
 {/* CTA Buttons */}
 <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mt-12 items-center justify-center w-full">
 <a 
 href="https://harvest-agent.vercel.app"
 className="relative flex items-center justify-center gap-3 bg-white text-[#0b1121] h-14 md:h-16 px-10 rounded-full font-black text-lg transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto overflow-hidden group no-underline"
 >
 <span className="absolute inset-0 bg-gradient-to-r from-primary to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
 <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
  Start Growing Today
  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
 </span>
 </a>
 
 <button 
 onClick={scrollToPartner}
 className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md text-white h-14 md:h-16 px-10 rounded-full font-bold text-lg transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105 w-full sm:w-auto"
 >
 <span>Partner with Us</span>
 </button>
 </motion.div>

 {/* Floating Logo */}
 <motion.div 
 variants={itemVariants}
 animate={{ y: [0, -15, 0] }}
 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
 className="relative flex justify-center w-full z-20 mt-24 pb-8"
 >
 <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full w-[200px] h-[200px] left-1/2 -translate-x-1/2 opacity-30 pointer-events-none"></div>
 <img 
 src="https://raw.githubusercontent.com/bumbmatei-sys/pictures/main/doar%20spic.png"
 alt="Harvest Spic Logo"
 className="w-[180px] md:w-[240px] h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] z-10"
 referrerPolicy="no-referrer"
 />
 </motion.div>
 </motion.div>
 
 </section>
 );
};

export default Hero;
