import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { ThemeContext } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion"; // <<=== Tambahan

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
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      const relativeY = y - rect.top;
      let percentage = (relativeY / rect.height) * 100;
      scrollToPercentage(Math.min(100, Math.max(0, percentage)));
    }
  }, [scrollToPercentage]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const relativeY = y - rect.top;
    let percentage = (relativeY / rect.height) * 100;
    window.scrollTo({
      top: (Math.min(100, Math.max(0, percentage)) / 100) * 
      (document.documentElement.scrollHeight - window.innerHeight),
      behavior: 'auto'
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  const handleTrackClick = useCallback((e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    scrollToPercentage(Math.min(100, Math.max(0, (relativeY / rect.height) * 100)));
  }, [scrollToPercentage]);

  const handleMouseMove = useCallback((e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    setHoverPosition(Math.min(100, Math.max(0, (relativeY / rect.height) * 100)));
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const throttle = (callback) => {
    let ticking = false;
    return (...args) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          callback(...args);
          ticking = false;
        });
        ticking = true;
      }
    };
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = throttle(updateScroll);
    const handleResize = () => updateScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    updateScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScroll]);

  useEffect(() => {
    if (isDragging) {
      const move = (e) => handleDragMove(e);
      const end = () => handleDragEnd();
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move);
      window.addEventListener('touchend', end);
      return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', end);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('touchend', end);
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

  const positionClasses = isMobile 
    ? 'bottom-4 left-1/2 -translate-x-1/2 w-[90vw] h-8' 
    : 'left-8 top-1/2 -translate-y-1/2 h-[40vh] w-8';

  const isVertical = !isMobile;

  return (
    <AnimatePresence>
      {isScrollable() && shouldRender && (
        <motion.div
          ref={containerRef}
          className={`fixed z-[60] ${positionClasses}`}
          initial={{ opacity: 0, scale: 0.8, x: isVertical ? -30 : 0, y: isVertical ? 0 : 30 }}
          animate={{ 
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.9,
            x: isVisible ? 0 : (isVertical ? -20 : 0),
            y: isVisible ? 0 : (isVertical ? 0 : 20),
            transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }
          }}
          exit={{ opacity: 0, scale: 0.85, x: isVertical ? -20 : 0, y: isVertical ? 0 : 20, transition: { duration: 0.35 } }}
        >

          <div className={`relative w-full h-full overflow-hidden ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-md shadow-lg border ${isDarkMode ? 'border-zinc-700' : 'border-zinc-800'}`}>
            <div
              ref={trackRef}
              className={`absolute inset-2 cursor-pointer ${isDarkMode ? 'bg-white' : 'bg-zinc-900'} rounded-sm`}
              onClick={handleTrackClick}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className={`absolute inset-0 ${isVertical ? 'flex flex-col justify-between py-1' : 'flex justify-between px-1'}`}>
                {tickMarks.map((tick) => {
                  const isMajor = tick % 10 === 0;
                  const isMedium = tick % 5 === 0 && !isMajor;
                  return (
                    <div 
                      key={tick}
                      className={`${isDarkMode ? 'bg-black' : 'bg-white'} ${
                        isMajor ? 'opacity-100' : isMedium ? 'opacity-30' : 'opacity-40'
                      } ${isVertical ? 'w-full h-px' : 'h-full w-px'}`}
                    />
                  );
                })}
              </div>

              {isHovering && !isDragging && (
                <div 
                  className={`absolute ${isVertical ? 'left-0 right-0 h-0.5 bg-red-500' : 'top-0 bottom-0 w-0.5 bg-red-500'} transition-all duration-150`}
                  style={isVertical ? { top: `${hoverPosition}%` } : { left: `${hoverPosition}%` }}
                />
              )}

              <div 
                className={`absolute ${isVertical ? 'left-0 right-0 h-0.5' : 'top-0 bottom-0 w-0.5'} bg-red-500`}
                style={isVertical ? { top: `${scrollPercentage}%` } : { left: `${scrollPercentage}%` }}
              >
                <div 
                  className={`absolute ${isVertical ? 'w-2 h-2 -left-1 -top-1' : 'w-2 h-2 -top-1 -left-1'} bg-red-500 rounded-full ${
                    isDragging ? 'scale-125 cursor-grabbing' : 'cursor-grab hover:scale-110'
                  }`} 
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                />
              </div>
            </div>
          </div>

          <div 
            className={`absolute text-sm font-mono ${
              isDarkMode ? 'text-white' : 'text-black'
            }`}
            style={isVertical ? { top: `${scrollPercentage}%`, right: "-2.5rem" } : { left: `${scrollPercentage}%`, top: "2rem" }}
          >
            {Math.round(scrollPercentage)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollIndicator;
