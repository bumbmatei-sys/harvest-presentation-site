import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsSection from './components/StatsSection';
import FeaturesSection from './components/FeaturesSection';
import CTASection from './components/CTASection';
import DonationSection from './components/DonationSection';
import Footer from './components/Footer';

// Lazy load heavy components
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const ContactSupport = lazy(() => import('./components/ContactSupport'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));
const FAQ = lazy(() => import('./components/FAQ'));

const App: React.FC = () => {
 const [currentPage, setCurrentPage] = useState('landing');
 const currentPageRef = useRef(currentPage);

 useEffect(() => {
  currentPageRef.current = currentPage;
 }, [currentPage]);

 const navigateTo = (page: string) => {
  if (page === 'auth' || page === 'home') {
    window.location.href = 'https://theharvest.app';
    return;
  }
  setCurrentPage(page);
  window.scrollTo(0, 0);
 };

 const renderLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-dark">
   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
 );

 if (currentPage === 'privacy-policy') {
  return (
   <div className="min-h-screen flex flex-col font-sans bg-white">
    <Navbar isHome={false} onNavigate={navigateTo} />
    <main className="flex-grow">
     <Suspense fallback={renderLoading()}>
      <PrivacyPolicy onBack={() => navigateTo('landing')} />
     </Suspense>
    </main>
    <Footer onNavigate={navigateTo} />
   </div>
  );
 }

 if (currentPage === 'terms-of-use') {
  return (
   <div className="min-h-screen flex flex-col font-sans bg-white">
    <Navbar isHome={false} onNavigate={navigateTo} />
    <main className="flex-grow">
     <Suspense fallback={renderLoading()}>
      <TermsOfUse onBack={() => navigateTo('landing')} />
     </Suspense>
    </main>
    <Footer onNavigate={navigateTo} />
   </div>
  );
 }

 if (currentPage === 'contact-support') {
  return (
   <div className="min-h-screen flex flex-col font-sans bg-white">
    <Navbar isHome={false} onNavigate={navigateTo} />
    <main className="flex-grow">
     <Suspense fallback={renderLoading()}>
      <ContactSupport onBack={() => navigateTo('landing')} />
     </Suspense>
    </main>
    <Footer onNavigate={navigateTo} />
   </div>
  );
 }

 if (currentPage === 'faq') {
  return (
   <div className="min-h-screen flex flex-col font-sans bg-white">
    <Navbar isHome={false} onNavigate={navigateTo} />
    <main className="flex-grow">
     <Suspense fallback={renderLoading()}>
      <FAQ onBack={() => navigateTo('landing')} />
     </Suspense>
    </main>
    <Footer onNavigate={navigateTo} />
   </div>
  );
 }

 return (
  <div className="min-h-screen flex flex-col font-sans">
   <Navbar isHome={true} onNavigate={navigateTo} />
   <main>
    <Hero onNavigate={navigateTo} />
    <StatsSection />
    <FeaturesSection onNavigate={navigateTo} />
    {/* FutureSection was missing from provided code, omitting it */}
    <CTASection onNavigate={navigateTo} />
    <DonationSection />
   </main>
   <Footer onNavigate={navigateTo} />
  </div>
 );
};

export default App;
