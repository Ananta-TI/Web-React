// src/components/Chatbot/AlienIcon.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const AlienIcon = ({
  size = 24,
  className = "",
  alienColor, // This will now be overridden by theme context
  hatColor = "#4C1D95",
  starColor = "#FCD34D",
}) => {
  const { theme, isDarkMode } = useContext(ThemeContext);
  const [isBlinking, setIsBlinking] = useState(false);
  const [leftEyePosition, setLeftEyePosition] = useState({ x: 0, y: 0 });
  const [rightEyePosition, setRightEyePosition] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!svgRef.current || !leftEyeRef.current || !rightEyeRef.current)
        return;

      const svgRect = svgRef.current.getBoundingClientRect();
      const svgCenterX = svgRect.left + svgRect.width / 2;
      const svgCenterY = svgRect.top + svgRect.height / 2;

      const mouseX = e.clientX - svgCenterX;
      const mouseY = e.clientY - svgCenterY;

      const moveFactor = 0.05;
      const maxMove = 3;

      const moveX = Math.max(-maxMove, Math.min(maxMove, mouseX * moveFactor));
      const moveY = Math.max(-maxMove, Math.min(maxMove, mouseY * moveFactor));

      setLeftEyePosition({ x: moveX, y: moveY });
      setRightEyePosition({ x: moveX, y: moveY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Use theme color for alien, fallback to prop if theme doesn't have the expected structure
  // Also use dark mode to determine the default color if needed
  const alienThemeColor = theme?.primary || theme?.textColor || alienColor || (isDarkMode ? "#ffffff" : "#000000");

  // Eye colors based on dark mode
  // In dark mode (black background), eyes will be white with black pupils
  // In light mode (white background), eyes will be black with white pupils
  const eyeWhiteColor = isDarkMode ? "#ffffff" : "#000000";
  const pupilColor = isDarkMode ? "#000000" : "#ffffff";

  return (
    <svg
      ref={svgRef}
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 122.88 119.35"
      width={size}
      height={size}
      className={className}
    >
      <title>chatbot</title>
      <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z" 
        fill={alienThemeColor} />
      
      {/* Left Eye */}
      <g id="left-eye">
        {/* Eye white - now changes based on theme */}
        <ellipse cx="40" cy="56" rx="8" ry="10" fill={eyeWhiteColor} />
        {/* Eye pupil - now changes based on theme */}
        <ellipse 
          ref={leftEyeRef}
          cx={40 + leftEyePosition.x} 
          cy={56 + leftEyePosition.y} 
          rx="4" 
          ry="5" 
          fill={pupilColor} 
          style={{ transition: 'all 0.1s ease-out' }}
        />
        {/* Eyelid for blinking */}
        <rect 
          x="32" 
          y="46" 
          width="16" 
          height={isBlinking ? "10" : "0"} 
          fill={alienThemeColor}
          style={{ transition: 'height 0.1s' }}
        />
      </g>
      
      {/* Right Eye */}
      <g id="right-eye">
        {/* Eye white - now changes based on theme */}
        <ellipse cx="82" cy="56" rx="8" ry="10" fill={eyeWhiteColor} />
        {/* Eye pupil - now changes based on theme */}
        <ellipse 
          ref={rightEyeRef}
          cx={82 + rightEyePosition.x} 
          cy={56 + rightEyePosition.y} 
          rx="4" 
          ry="5" 
          fill={pupilColor} 
          style={{ transition: 'all 0.1s ease-out' }}
        />
        {/* Eyelid for blinking */}
        <rect 
          x="74" 
          y="46" 
          width="16" 
          height={isBlinking ? "10" : "0"} 
          fill={alienThemeColor}
          style={{ transition: 'height 0.1s' }}
        />
      </g>
    </svg>
  );
};

export default AlienIcon;