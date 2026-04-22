"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const DonationSection: React.FC = () => {
 const [amount, setAmount] = useState<number | string>(50);
 const [frequency, setFrequency] = useState<'once' | 'monthly'>('monthly');
 const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('apple');
 const [showThankYou, setShowThankYou] = useState(false);

 const handleAmountChange = (val: number | string) => {
 setAmount(val);
 };

 const handleDonate = () => {
 setShowThankYou(true);
 setTimeout(() => {
 setShowThankYou(false);
 }, 4000);
 };

 return (
 <section id="partner" className="bg-[#0b1121] py-24 sm:py-32 relative overflow-hidden">
 {/* Background glow */}
 <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
 <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
 
 {/* Thank You Popup */}
 <AnimatePresence>
 {showThankYou && (
 <motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md"
 >
  <motion.div 
  initial={{ scale: 0.9, y: 20 }}
  animate={{ scale: 1, y: 0 }}
  exit={{ scale: 0.9, y: 20 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="bg-[#11172A] border border-white/10 rounded-[32px] p-8 max-w-sm w-full shadow-[0_0_100px_rgba(212,175,55,0.2)] text-center relative overflow-hidden"
  >
  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-yellow-300"></div>
  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
  <span className="material-symbols-outlined text-green-400 text-4xl">volunteer_activism</span>
  </div>
  <h3 className="text-3xl font-black text-white mb-3">Thank You</h3>
  <p className="text-gray-400 mb-8 leading-relaxed">
  Your generosity is helping equip the global church. Thank you for sowing into the harvest.
  </p>
  <button 
  onClick={() => setShowThankYou(false)}
  className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-colors border border-white/10"
  >
  Close
  </button>
  </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
 
 <div className="flex-1 space-y-8 pt-4">
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-[#D4AF37] uppercase backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
 <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
 Partner With Us
 </div>
 
 <div className="space-y-6">
 <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tighter">
 Sow into the <br/>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-yellow-600">Harvest.</span>
 </h2>
 <p className="text-xl sm:text-2xl text-gray-300 font-medium leading-relaxed max-w-xl">
 The Gospel is free, and we believe this discipleship journey should be too.
 </p>
 </div>

 <div className="space-y-6 text-gray-400 leading-relaxed text-lg border-l-2 border-white/10 pl-6">
 <p>
 We have made a firm commitment: no new believer should ever have to pay to learn about Jesus. The entire platform is completely free for the user. We want there to be zero barriers between a soul and their Savior.
 </p>
 <p>
 However, building high-level technology, training advanced AI, and maintaining global servers requires significant resources.
 </p>
 <p className="text-gray-200 font-semibold">
 When you give, you aren&apos;t just paying for software. You are sponsoring the discipleship of a new believer. You are ensuring that when a hand goes up, a digital safety net is there to catch them.
 </p>
 <p className="italic text-primary/80">
 Help us keep this tool free for the billion-soul harvest.
 </p>
 </div>
 </div>

 <div id="donate-form" className="w-full lg:w-[480px] shrink-0 lg:mt-16">
 <div className="bg-[#11172A] rounded-[32px] p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
 
 <div className="grid grid-cols-2 bg-[#0b1121] rounded-2xl p-1.5 mb-8 border border-white/5 relative">
 {/* Interactive Background Pill for Frequency */}
 <motion.div 
  layoutId="frequency-tab"
  className="absolute top-1.5 bottom-1.5 bg-[#1e293b] rounded-xl border border-white/10 shadow-lg"
  initial={false}
  animate={{ 
  left: frequency === 'once' ? "6px" : "calc(50% + 3px)", 
  width: "calc(50% - 9px)" 
  }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
 />
 <button 
  onClick={() => setFrequency('once')}
  className={`relative z-10 py-3 text-sm font-bold transition-colors duration-200 ${frequency === 'once' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
 >
  One-Time
 </button>
 <button 
  onClick={() => setFrequency('monthly')}
  className={`relative z-10 py-3 text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 ${frequency === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
 >
  Monthly
  <span className={`material-symbols-outlined text-base leading-none transition-colors ${frequency === 'monthly' ? 'text-primary' : 'text-gray-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
 </button>
 </div>

 <div className="mb-8">
 <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 block ml-1">Select Amount</label>
 <div className="grid grid-cols-3 gap-3 mb-3">
  {[25, 50, 100].map((val) => (
  <button
  key={val}
  onClick={() => handleAmountChange(val)}
  className={`py-4 rounded-2xl text-2xl font-bold transition-all duration-200 ${amount === val ? 'bg-primary text-[#0b1121] shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5 hover:border-white/10'}`}
  >
  ${val}
  </button>
  ))}
 </div>
 
 <div className="relative group/input">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-primary transition-colors">$</span>
  <input
  type="number"
  placeholder="Custom Amount"
  value={typeof amount === 'string' || ![25, 50, 100].includes(amount as number) ? amount : ''}
  onChange={(e) => handleAmountChange(e.target.value)}
  className="w-full py-4 pl-8 pr-4 rounded-2xl text-lg font-bold border bg-white/5 border-white/5 text-white placeholder-gray-600 focus:outline-none focus:bg-[#1e293b] focus:border-primary/50 transition-all duration-200"
  />
 </div>
 </div>

 <div className="mb-8">
 <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 block ml-1">Payment Method</label>
 <div className="space-y-3">
  
  <div className="grid grid-cols-2 gap-3">
  <div 
  onClick={() => setPaymentMethod('apple')}
  className={`flex items-center justify-center gap-2 bg-black border p-4 rounded-2xl cursor-pointer transition-all duration-200 ${paymentMethod === 'apple' ? 'border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-primary' : 'border-white/10 hover:border-white/20'}`}
  >
  <span className="material-symbols-outlined text-white text-xl">apple</span>
  <span className="font-bold text-white text-sm">Pay</span>
  </div>

  <div 
  onClick={() => setPaymentMethod('google')}
  className={`flex items-center justify-center gap-2 bg-white border p-4 rounded-2xl cursor-pointer transition-all duration-200 ${paymentMethod === 'google' ? 'border-primary shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-2 ring-primary ring-offset-2 ring-offset-[#11172A]' : 'border-transparent hover:border-gray-200'}`}
  >
  <span className="font-bold text-[#0b1121] text-sm">G Pay</span>
  </div>
  </div>

  <div 
  onClick={() => setPaymentMethod('card')}
  className={`bg-white/5 border p-5 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden ${paymentMethod === 'card' ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-white/20'}`}
  >
  <div className="flex items-center justify-between relative z-10">
  <div className="flex items-center gap-4">
  <span className={`material-symbols-outlined ${paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'}`}>credit_card</span>
  <span className="text-white font-bold text-sm">Credit / Debit Card</span>
  </div>
  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${paymentMethod === 'card' ? 'border-primary' : 'border-gray-600'}`}>
  {paymentMethod === 'card' && <motion.div layoutId="payment-dot" className="w-2.5 h-2.5 rounded-full bg-primary"></motion.div>}
  </div>
  </div>
  
  <AnimatePresence>
  {paymentMethod === 'card' && (
  <motion.div 
   initial={{ height: 0, opacity: 0 }}
   animate={{ height: "auto", opacity: 1 }}
   exit={{ height: 0, opacity: 0 }}
   className="overflow-hidden"
  >
   <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
   <div className="relative">
   <input 
   type="text" 
   placeholder="Card Number" 
   className="w-full bg-[#0b1121] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
   />
   </div>
   <div className="grid grid-cols-2 gap-3">
   <input 
   type="text" 
   placeholder="MM/YY" 
   className="w-full bg-[#0b1121] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
   />
   <input 
   type="text" 
   placeholder="CVC" 
   className="w-full bg-[#0b1121] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-colors"
   />
   </div>
   </div>
  </motion.div>
  )}
  </AnimatePresence>
  </div>

 </div>
 </div>

 <button 
 onClick={handleDonate}
 className="w-full bg-white hover:bg-gray-100 text-[#0b1121] py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
 >
 <span className="absolute inset-0 bg-gradient-to-r from-primary to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
 <span className="relative z-10 flex items-center gap-3">
  Complete Donation {amount ? `of $${amount}` : ''}
  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
 </span>
 </button>

 <div className="mt-6 text-center flex items-center justify-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
 <span className="material-symbols-outlined text-xs">lock</span>
 Secure SSL Encryption
 </div>

 </div>
 </div>
 </div>
 
 <div className="mt-20 lg:mt-32 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
 <div>
 <div className="text-4xl lg:text-5xl font-black text-white mb-2">$0</div>
 <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Cost to Believers</div>
 </div>
 <div>
 <div className="text-4xl lg:text-5xl font-black text-white mb-2">100%</div>
 <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Donor Funded</div>
 </div>
 <div>
 <div className="text-4xl lg:text-5xl font-black text-white mb-2">501(c)(3)</div>
 <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Tax Deductible</div>
 </div>
 <div>
 <div className="text-4xl lg:text-5xl font-black text-white mb-2">Global</div>
 <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Kingdom Impact</div>
 </div>
 </div>

 </div>
 </section>
 );
};

export default DonationSection;
