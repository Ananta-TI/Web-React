// src/components/Chatbot/AlienIcon.jsx
import React, { useState, useEffect, useRef } from 'react';

const AlienIcon = ({ size = 24, className = "", alienColor = "#68D391", hatColor = "#4C1D95", starColor = "#FCD34D" }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [leftEyePosition, setLeftEyePosition] = useState({ x: 0, y: 0 });
  const [rightEyePosition, setRightEyePosition] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!svgRef.current || !leftEyeRef.current || !rightEyeRef.current) return;

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

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* --- Layer 1: Topi Penyihir --- */}
      {/* Brim topi (lingkaran bawah) */}
      <ellipse
        cx="50"
        cy="55"
        rx="32"
        ry="7"
        fill={hatColor}
        stroke="black"
        strokeWidth="1.5"
      />
      {/* Badan topi (kerucut) */}
      <polygon
        points="50,15 20,55 80,55"
        fill={hatColor}
        stroke="black"
        strokeWidth="1.5"
      />
      {/* Bintang hiasan */}
      <path
        d="M 35,30 l 1.5,4.5 h 4.5 l -3.5,2.5 l 1.5,4.5 l -3.5,-2.5 l -3.5,2.5 l 1.5,-4.5 l -3.5,-2.5 h 4.5 z"
        fill={starColor}
      />
      <path
        d="M 65,35 l 1,3 h 3 l -2.5,1.5 l 1,3 l -2.5,-1.5 l -2.5,1.5 l 1,-3 l -2.5,-1.5 h 3 z"
        fill={starColor}
      />

      {/* --- Layer 2: Kepala Alien --- */}
      <path
        d="M 30 55 L 70 55 L 75 85 L 25 85 Z"
        fill={alienColor}
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Antena */}
      <path d="M 40 55 L 38 48 M 60 55 L 62 48" stroke="black" strokeWidth="2" strokeLinecap="round" />

      {/* --- Layer 3: Mata dan Detail --- */}
      {/* Mata Kiri */}
      <g
        ref={leftEyeRef}
        transform={`translate(40, 68) translate(${leftEyePosition.x}, ${leftEyePosition.y})`}
        style={{ transition: 'transform 0.1s ease-out' }}
      >
        {isBlinking ? (
          <line x1="-7" y1="0" x2="7" y2="0" stroke="black" strokeWidth="2" />
        ) : (
          <ellipse cx="0" cy="0" rx="7" ry="10" fill="black" />
        )}
      </g>

      {/* Mata Kanan */}
      <g
        ref={rightEyeRef}
        transform={`translate(60, 68) translate(${rightEyePosition.x}, ${rightEyePosition.y})`}
        style={{ transition: 'transform 0.1s ease-out' }}
      >
        {isBlinking ? (
          <line x1="-7" y1="0" x2="7" y2="0" stroke="black" strokeWidth="2" />
        ) : (
          <ellipse cx="0" cy="0" rx="7" ry="10" fill="black" />
        )}
      </g>

      {/* Mulut (senyum) */}
      <path
        d="M 42 78 Q 50 82 58 78"
        stroke="black"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AlienIcon;