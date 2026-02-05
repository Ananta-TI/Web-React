import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ThemeContext } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const ScrollIndicator = ({ tickDensity = 2 }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  
  const isScrollable = useCallback(() => {
    return document.documentElement.scrollHeight > window.innerHeight;
  }, []);

  // Deteksi Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateScroll = useCallback(() => {
    if (!isScrollable()) {
      setScrollPercentage(0);
      setIsVisible(false);
      return;
    }

    const scrollPos = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = (scrollPos / maxScroll) * 100;
    const clampedPercentage = Math.min(100, Math.max(0, percentage));
    
    setScrollPercentage(clampedPercentage);
    
    // Auto-hide logika (opsional, bisa dihapus jika ingin selalu tampil)
    if (clampedPercentage <= 1 || clampedPercentage >= 99) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
      setShouldRender(true);
    }
  }, [isScrollable]);

  const scrollToPercentage = useCallback((percentage) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (percentage / 100) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: isDragging ? 'auto' : 'smooth' });
  }, [isDragging]);

  // FIX: Selalu ambil posisi Horizontal (X axis) karena desain baru horizontal semua
  const getPos = useCallback((e) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;

    // Hitung berdasarkan lebar (Horizontal)
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    const percentage = getPos(e);
    scrollToPercentage(Math.min(100, Math.max(0, percentage)));
  }, [getPos, scrollToPercentage]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault(); 
    const percentage = getPos(e);
    scrollToPercentage(Math.min(100, Math.max(0, percentage)));
  }, [isDragging, getPos, scrollToPercentage]);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const handleTrackClick = useCallback((e) => {
    const percentage = getPos(e);
    scrollToPercentage(Math.min(100, Math.max(0, percentage)));
  }, [getPos, scrollToPercentage]);

  const handleMouseMove = useCallback((e) => {
    const percentage = getPos(e);
    setHoverPosition(Math.min(100, Math.max(0, percentage)));
  }, [getPos]);

  // Throttle Scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    updateScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [updateScroll]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (!isVisible && shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  if (!isScrollable() && !shouldRender) return null;

  const tickMarks = [];
  for (let i = 0; i <= 100; i += tickDensity) tickMarks.push(i);

  // --- MODIFIKASI POSISI ---
  const positionClasses = isMobile 
    ? 'bottom-6 left-1/2 -translate-x-1/2 w-[90vw] h-10' // Mobile: Tengah Bawah
    : 'bottom-8 right-8 w-70 h-8'; // Desktop: Kanan Bawah Horizontal

  // Desktop sekarang HORIZONTAL juga
  const isVertical = false; 

  return (
    <AnimatePresence>
      {isScrollable() && shouldRender && (
        <motion.div
          ref={containerRef}
          className={`fixed z-[40] ${positionClasses}`}
          // Animasi muncul dari bawah
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.95,
            y: isVisible ? 0 : 20,
            transition: { duration: 0.4, ease: "easeOut" }
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          {/* Tampilan Frame */}
          <div className={`relative w-full h-full overflow-hidden ${isDarkMode ? 'bg-[#dad5d0]' : 'bg-[#2f2e2d]'} rounded-md shadow-xl border ${isDarkMode ? 'border-zinc-400' : 'border-zinc-700'}`}>
            <div
              ref={trackRef}
              className={`absolute inset-2 cursor-pointer ${isDarkMode ? 'bg-[#e5e0db]' : 'bg-[#3a3938]'} rounded-sm`}
              onClick={handleTrackClick}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Tick Marks (Horizontal) */}
              <div className="absolute inset-0 flex justify-between px-1">
                {tickMarks.map((tick) => (
                  <div 
                    key={tick}
                    className={`${isDarkMode ? 'bg-black' : 'bg-white'} ${
                      tick % 10 === 0 ? 'opacity-80 h-full' : tick % 5 === 0 ? 'opacity-40 h-2/3 self-center' : 'opacity-20 h-1/2 self-center'
                    } w-px`}
                  />
                ))}
              </div>

              {/* Hover Line */}
              {isHovering && !isDragging && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 transition-all duration-150"
                  style={{ left: `${hoverPosition}%` }}
                />
              )}

              {/* Scroll Line & Knob */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
                style={{ left: `${scrollPercentage}%` }}
              >
                <div 
                  className={`absolute w-3 h-3 -top-1.5 -left-1.5 bg-red-600 rounded-full shadow-md border border-white/20 ${
                    isDragging ? 'scale-125 cursor-grabbing ring-2 ring-red-400' : 'cursor-grab hover:scale-110'
                  }`} 
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                />
              </div>
            </div>
          </div>

          {/* Label Persentase (Pindah ke ATAS bar agar tidak tertutup karena di bottom screen) */}
          <div 
            className={`absolute -top-8 text-sm font-bold font-mono ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'} bg-transparent backdrop-blur-sm px-2 rounded`}
            style={{ 
              left: `${scrollPercentage}%`, 
              transform: 'translateX(-50%)',
              transition: 'left  linear' // Agar angka bergerak smooth mengikuti knob
            }}
          >
            {Math.round(scrollPercentage)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollIndicator;