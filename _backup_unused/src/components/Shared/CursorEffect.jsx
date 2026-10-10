import { useState, useEffect, useRef, useContext } from 'react';
import { ThemeContext } from "../../context/ThemeContext";

export default function CursorParticles({
  particleCount = 16,
  size = 8,
  lightColor = '#ffffff',
  darkColor = '#000000',
  hoverColor = '#ff0000',
  particleTrail = 12,
  speed = 0.25,
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [particles, setParticles] = useState(
    Array(particleCount).fill({ x: -100, y: -100, opacity: 0, size: size })
  );
  const [isHoveringText, setIsHoveringText] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.tagName === 'P' || e.target.tagName === 'SPAN' || e.target.classList.contains('cursor-hover')) {
        setIsHoveringText(true);
      }
    };
    const handleMouseOut = (e) => {
      if (e.target.tagName === 'P' || e.target.tagName === 'SPAN' || e.target.classList.contains('cursor-hover')) {
        setIsHoveringText(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const animateParticles = () => {
      setParticles((prevParticles) => {
        return prevParticles.map((particle, index) => {
          const delayFactor = index / particleTrail;
          return {
            x: particle.x + (position.x - particle.x) * speed * (1 - delayFactor),
            y: particle.y + (position.y - particle.y) * speed * (1 - delayFactor),
            opacity: 1 - delayFactor,
            size: size * (1 - delayFactor * 0.5),
            rotate: (particle.rotate || 0) + 5,
          };
        });
      });
      animationRef.current = requestAnimationFrame(animateParticles);
    };

    animationRef.current = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animationRef.current);
  }, [position]);

  const glowColor = isHoveringText ? hoverColor : isDarkMode ? lightColor : darkColor;

  return (
    <>
      {particles.map((particle, index) => (
        <div
          key={index}
          className="fixed top-0 left-0 pointer-events-none"
          style={{
            transform: `translate(${particle.x - particle.size / 2}px, ${particle.y - particle.size / 2}px) rotate(${particle.rotate}deg)`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: glowColor,
            borderRadius: '50%',
            opacity: particle.opacity,
            filter: `blur(${(1 - particle.opacity) * 8}px)`,
            boxShadow: `0 0 ${particle.size * 2}px ${glowColor}, 0 0 ${particle.size * 3}px ${glowColor}`,
            transition: 'transform 0.1s linear',
          }}
        />
      ))}
    </>
  );
}
