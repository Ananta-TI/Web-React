import React, { useState, useEffect, useRef, useCallback } from 'react';

const ScrollIndicator = ({ 
  orientation = 'auto', // 'vertical', 'horizontal', or 'auto'
  showThumb = true,
  showTooltip = true,
  showPercentages = true 
}) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  
  // Determine orientation based on screen size if set to 'auto'
  const actualOrientation = orientation === 'auto' 
    ? (isMobile ? 'horizontal' : 'vertical')
    : orientation;
  
  const isVertical = actualOrientation === 'vertical';

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create scale markers
  const createMarkers = () => {
    const markers = [];
    for (let i = 0; i <= 100; i += 2) {
      const isMajor = i % 10 === 0;
      markers.push({
        percentage: i,
        isMajor,
        showPercentage: isMajor && showPercentages
      });
    }
    return markers;
  };

  const markers = createMarkers();

  // Check if page is scrollable
  const isScrollable = useCallback(() => {
    return document.documentElement.scrollHeight > window.innerHeight;
  }, []);

  // Update scroll percentage
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
    
    // Hide when at very top or very bottom
    if (clampedPercentage <= 1 || clampedPercentage >= 99) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [isScrollable]);

  // Scroll to percentage
  const scrollToPercentage = useCallback((percentage) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (percentage / 100) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: 'auto' });
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!isDragging || !trackRef.current) return;

    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    
    let percentage;
    if (isVertical) {
      const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      const relativeY = y - rect.top;
      percentage = (relativeY / rect.height) * 100;
    } else {
      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const relativeX = x - rect.left;
      percentage = (relativeX / rect.width) * 100;
    }

    percentage = Math.min(100, Math.max(0, percentage));
    scrollToPercentage(percentage);
  }, [isDragging, isVertical, scrollToPercentage]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click on track
  const handleTrackClick = useCallback((e) => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    
    let percentage;
    if (isVertical) {
      const y = e.clientY;
      const relativeY = y - rect.top;
      percentage = (relativeY / rect.height) * 100;
    } else {
      const x = e.clientX;
      const relativeX = x - rect.left;
      percentage = (relativeX / rect.width) * 100;
    }

    percentage = Math.min(100, Math.max(0, percentage));
    scrollToPercentage(percentage);
  }, [isVertical, scrollToPercentage]);

  // Throttle function using requestAnimationFrame
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
    const handleScroll = throttle(updateScroll);
    const handleResize = () => {
      updateScroll();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initial update
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScroll]);

  // Add drag event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handleDragMove(e);
      const handleEnd = () => handleDragEnd();

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isScrollable()) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[20] transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      } ${
        isVertical 
          ? 'w-10 h-[50vh] top-1/2 left-5 -translate-y-1/2' 
          : ' w-[90%] max-w-[600px] bottom-5 left-1/2 -translate-x-1/2 md:w-full md:max-w-[600px]'
      }`}
    >
      <div 
        ref={trackRef}
        className={`relative bg-[rgb(70,70,70)] cursor-pointer ${isVertical ? 'w-px h-full' : 'h-px w-full'}`}
        onClick={handleTrackClick}
      >
        {/* Progress Bar */}
        <div 
          className={`absolute top-0 left-0 bg-[rgb(200,200,200)] pointer-events-none ${
            isVertical ? 'w-full' : 'h-full'
          }`}
          style={isVertical ? { height: `${scrollPercentage}%` } : { width: `${scrollPercentage}%` }}
        />
        
        {/* Thumb */}
        {showThumb && (
          <div 
            className={`absolute w-2 h-2 bg-[rgb(70,70,70)] rounded-full cursor-grab cursor-target z-10 ${
              isDragging ? 'cursor-grabbing scale-125' : ''
            } ${
              isVertical ? 'left-1/2 -translate-x-1/2 -translate-y-1/2' : 'top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
            style={isVertical ? { top: `${scrollPercentage}%` } : { left: `${scrollPercentage}%` }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          />
        )}
        
        {/* Tooltip */}
        {showTooltip && isVertical && (
          <div 
            className={`absolute bg-[rgb(200,200,200)] text-[rgb(60,60,60)] text-sm rounded px-3 py-2 text-center font-mono z-10 pointer-events-none left-full ml-2.5 -translate-y-1/2`}
            style={{ top: `${scrollPercentage}%` }}
          >
            {Math.round(scrollPercentage)}%
            <div 
              className={`absolute w-2 h-2 bg-[rgb(200,200,200)] top-1/2 left-[-0.25rem] -translate-y-1/2 rotate-45`}
            />
          </div>
        )}
      </div>
      
      {/* Scale */}
      <div className={`${isVertical ? 'absolute w-10 h-[calc(100%-2px)] top-0 left-px' : 'relative w-full h-10 mb-2.5'}`}>
        {markers.map((marker, index) => {
          const isFilled = marker.percentage < scrollPercentage || (marker.percentage === 100 && scrollPercentage >= 99);
          const isVisible = (marker.percentage === 0 && scrollPercentage > 0) || marker.percentage < scrollPercentage || (marker.percentage === 100 && scrollPercentage >= 99);
          
          return (
            <React.Fragment key={index}>
              {/* Marker Line */}
              <div
                className={`absolute transition-all duration-300 ease-out ${
                  isFilled ? 'bg-[rgb(200,200,200)]' : 'bg-[rgb(70,70,70)]'
                } ${
                  isVertical 
                    ? 'h-px left-0' 
                    : 'w-px top-0 -translate-x-1/2'
                }`}
                style={
                  isVertical 
                    ? { 
                        top: `${marker.percentage}%`,
                        width: isFilled ? (marker.isMajor ? '40px' : '30px') : (marker.isMajor ? '15px' : '10px')
                      }
                    : { 
                        left: `${marker.percentage}%`,
                        height: isFilled ? (marker.isMajor ? '20px' : '10px') : (marker.isMajor ? '14px' : '10px')
                      }
                }
              />
              
              {/* Percentage Label */}
              {marker.showPercentage && isVertical && (
                <div
                  className={`absolute bg-[rgb(60,60,60)] text-[rgb(200,200,200)] px-1.5 py-0.5 rounded text-xs font-mono transition-all duration-300 ease-out ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  } -translate-y-1/2`}
                  style={{ left: '45px', top: `${marker.percentage}%` }}
                >
                  {marker.percentage}%
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollIndicator;