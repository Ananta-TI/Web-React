// src/components/SmoothScroll.jsx
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const SmoothScroll = ({ children }) => {
  const location = useLocation();
  const isScrolling = useRef(false);

  useEffect(() => {
    // Scroll ke top saat route berubah
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    // Custom smooth scroll untuk anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      
      if (!target) return;
      
      const href = target.getAttribute('href');
      
      // Hanya handle anchor links
      if (!href || !href.startsWith('#')) return;
      
      e.preventDefault();
      
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      
      if (element) {
        const offset = 80; // Offset untuk fixed header
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;