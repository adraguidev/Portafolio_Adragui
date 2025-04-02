import { useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import WorkSection from '@/components/home/WorkSection';
import CVSection from '@/components/home/CVSection';
import ArticlesSection from '@/components/home/ArticlesSection';
import ContactSection from '@/components/home/ContactSection';
import { WEBSITE_TITLE } from '@/lib/constants';

const Home = () => {
  // Set page title
  useEffect(() => {
    document.title = WEBSITE_TITLE;
  }, []);

  // Handle hash navigation scroll with offset
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            const yOffset = -80; // Navbar height plus a little extra
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 0);
      }
    };

    // Handle initial load with hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <main className="pt-16">
      <HeroSection />
      <CVSection />
      <WorkSection />
      <ArticlesSection />
      <ContactSection />
    </main>
  );
};

export default Home;
