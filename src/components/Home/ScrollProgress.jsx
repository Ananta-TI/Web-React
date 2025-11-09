import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { ThemeContext } from "../../context/ThemeContext";

const ScrollIndicator = ({ 
  orientation = 'vertical',
  showThumb = true,
  showTooltip = true,
  showPercentages = true 
}) => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const containerRef = useRef(null);
  const isVertical = orientation === 'vertical';

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
      return;
    }

    const scrollPos = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = (scrollPos / maxScroll) * 100;
    setScrollPercentage(Math.min(100, Math.max(0, percentage)));
  }, [isScrollable]);

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

  if (!isScrollable()) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`fixed z-[1000] ${
        isVertical 
          ? 'w-10 h-[50vh] top-1/2 left-5 -translate-y-1/2' 
          : 'w-full max-w-[600px] top-[60px] left-1/2 -translate-x-1/2'
      }`}
    >
      <div className={`relative bg-[rgb(70,70,70)] ${isVertical ? 'w-px h-full' : 'h-px w-full'}`}>
        {/* Progress Bar */}
        <div 
          className={`absolute top-0 left-0 bg-[rgb(200,200,200)] ${
            isVertical ? 'w-full' : 'h-full'
          }`}
          style={isVertical ? { height: `${scrollPercentage}%` } : { width: `${scrollPercentage}%` }}
        />
        
        {/* Thumb */}
        {showThumb && (
          <div 
            className={`absolute w-2 h-2 bg-[rgb(70,70,70)] rounded-full cursor-pointer z-10 ${
              isVertical ? 'left-1/2 -translate-x-1/2 -translate-y-1/2' : 'top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
            style={isVertical ? { top: `${scrollPercentage}%` } : { left: `${scrollPercentage}%` }}
          />
        )}
        
        {/* Tooltip */}
        {showTooltip && (
          <div 
            className={`absolute bg-[rgb(200,200,200)] text-[rgb(60,60,60)] text-sm rounded px-3 py-2 text-center font-mono z-10 ${
              isVertical 
                ? 'left-full ml-2.5 -translate-y-1/2' 
                : 'bottom-[-3.5rem] -translate-x-1/2'
            }`}
            style={isVertical ? { top: `${scrollPercentage}%` } : { left: `${scrollPercentage}%` }}
          >
            {Math.round(scrollPercentage)}%
            <div 
              className={`absolute w-2 h-2 bg-[rgb(200,200,200)] ${
                isVertical 
                  ? 'top-1/2 left-[-0.25rem] -translate-y-1/2 rotate-45' 
                  : 'top-[-0.25rem] left-1/2 -translate-x-1/2 rotate-45'
              }`}
            />
          </div>
        )}
      </div>
      
      {/* Scale */}
      <div className={`${isVertical ? 'absolute w-10 h-[calc(100%-2px)] top-0 left-px' : 'relative w-full h-10 mt-2.5'}`}>
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
                    : 'w-px bottom-0 -translate-x-1/2'
                }`}
                style={
                  isVertical 
                    ? { 
                        top: `${marker.percentage}%`,
                        width: isFilled ? (marker.isMajor ? '40px' : '30px') : (marker.isMajor ? '15px' : '10px')
                      }
                    : { 
                        left: `${marker.percentage}%`,
                        height: isFilled ? (marker.isMajor ? '40px' : '30px') : (marker.isMajor ? '14px' : '10px')
                      }
                }
              />
              
              {/* Percentage Label */}
              {marker.showPercentage && (
                <div
                  className={`absolute bg-[rgb(60,60,60)] text-[rgb(200,200,200)] px-1.5 py-0.5 rounded text-xs font-mono transition-all duration-300 ease-out ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  } ${
                    isVertical ? '-translate-y-1/2' : '-translate-x-1/2'
                  }`}
                  style={
                    isVertical 
                      ? { left: '45px', top: `${marker.percentage}%` }
                      : { top: '-25px', left: `${marker.percentage}%` }
                  }
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