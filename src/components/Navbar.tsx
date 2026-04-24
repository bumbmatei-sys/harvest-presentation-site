"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
 isHome?: boolean;
 onNavigate?: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isHome = true, onNavigate }) => {
 const [scrolled, setScrolled] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

 useEffect(() => {
 const handleScroll = () => {
 setScrolled(window.scrollY > 50);
 };
 window.addEventListener('scroll', handleScroll);
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
 e.preventDefault();
 setMobileMenuOpen(false);

 if (!isHome && onNavigate) {
 onNavigate('landing');
 return;
 }

 const element = document.getElementById(id);
 if (element) {
 const headerOffset = 100;
 const elementPosition = element.getBoundingClientRect().top;
 let offsetPosition = elementPosition + window.pageYOffset - headerOffset;

 if (id === 'partner') {
 offsetPosition += headerOffset + (window.innerHeight * 0.1);
 }
 
 window.scrollTo({
 top: offsetPosition,
 behavior: "smooth"
 });
 }
 };

 const handleLogoClick = (e: React.MouseEvent) => {
 e.preventDefault();
 setMobileMenuOpen(false);
 if (!isHome && onNavigate) {
 onNavigate('landing');
 } else {
 window.scrollTo({
 top: 0,
 behavior: 'smooth'
 });
 }
 };

 const handleMobileLinkClick = (e: React.MouseEvent, page: string) => {
 e.preventDefault();
 setMobileMenuOpen(false);
 if (onNavigate) {
 onNavigate(page);
 }
 };

 return (
 <header className="fixed top-0 left-0 w-full z-50 transition-all duration-500 pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
 <div className={`mx-auto max-w-6xl transition-all duration-500 pointer-events-auto ${scrolled ? 'bg-[#0b1121]/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full py-3 px-6' : 'bg-transparent py-4 border-transparent'}`}>
 <div className="flex items-center justify-between">
 <a href="#" onClick={handleLogoClick} className="flex items-center gap-3 group cursor-pointer">
 <div className="relative w-10 h-10 flexItems justify-center">
 <div className="absolute inset-0 bg-primary/20 rounded-full blur group-hover:bg-primary/40 transition-colors duration-500"></div>
 <img 
 src="https://raw.githubusercontent.com/bumbmatei-sys/pictures/main/doar%20spic.png" 
 alt="Harvest Logo" 
 className="relative h-8 w-auto ml-[12px] mt-[3px] group-hover:scale-110 transition-transform duration-500 z-10" 
 referrerPolicy="no-referrer"
 />
 </div>
 <span className="text-white text-xl font-bold tracking-tight">Harvest</span>
 </a>
 
 {/* Desktop Navigation */}
 <nav className="hidden md:flex items-center gap-8">
 <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors cursor-pointer" href="#challenge" onClick={(e) => scrollToSection(e, 'challenge')}>The Challenge</a>
 <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors cursor-pointer" href="#core" onClick={(e) => scrollToSection(e, 'core')}>Features</a>
 <a className="text-gray-300 hover:text-white text-sm font-medium transition-colors cursor-pointer" href="#vision" onClick={(e) => scrollToSection(e, 'vision')}>The Vision</a>
 <a 
 className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-black text-[#0b1121] bg-gradient-to-br from-yellow-300 via-[#cca02a] to-yellow-600 transition-all duration-200 hover:brightness-110 rounded-full group shadow-[0_0_20px_rgba(212,175,55,0.7)] hover:shadow-[0_0_30px_rgba(212,175,55,1)] hover:scale-105"
 href="#partner"
 onClick={(e) => scrollToSection(e, 'partner')}
 >
 <span className="relative">Donate</span>
 </a>
 </nav>

 {/* Mobile Menu Button */}
 <button 
 className="md:hidden text-white p-2 focus:outline-none bg-white/5 rounded-full backdrop-blur-md border border-white/10"
 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
 aria-label="Toggle menu"
 >
 <span className="material-symbols-outlined text-2xl block">{mobileMenuOpen ? 'close' : 'menu'}</span>
 </button>
 </div>
 </div>

 {/* Mobile Menu Overlay */}
 <AnimatePresence>
 {mobileMenuOpen && (
 <motion.div 
 initial={{ opacity: 0, y: -20, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -20, scale: 0.95 }}
 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
 className="md:hidden absolute top-full left-4 right-4 mt-2 bg-[#0b1121]/95 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden pointer-events-auto"
 >
 <nav className="flex flex-col pt-6 pb-8 space-y-2 px-4">
 {['challenge', 'core', 'vision'].map((item) => (
 <a 
 key={item}
 className="text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 px-6 py-4 rounded-xl transition-all" 
 href={`#${item}`}
 onClick={(e) => scrollToSection(e, item)}
 >
 {item.charAt(0).toUpperCase() + item.slice(1)}
 </a>
 ))}
 <div className="h-[1px] bg-white/10 my-2 mx-6"></div>
 <a 
 className="text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 px-6 py-4 rounded-xl transition-all" 
 href="#"
 onClick={(e) => handleMobileLinkClick(e, 'contact-support')}
 >
 Contact Us
 </a>
 <a 
 className="mt-4 mx-4 bg-gradient-to-r from-primary to-yellow-500 text-[#0b1121] py-4 rounded-2xl text-center font-bold text-lg shadow-lg shadow-primary/20"
 href="#partner"
 onClick={(e) => scrollToSection(e, 'partner')}
 >
 Partner with Us
 </a>
 </nav>
 </motion.div>
 )}
 </AnimatePresence>
 </header>
 );
};

export default Navbar;
