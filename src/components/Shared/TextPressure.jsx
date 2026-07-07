import { useEffect, useRef, useState, useMemo, useCallback, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

// --- HELPER FUNCTIONS ---
const dist = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance, maxDist, minVal, maxVal) => {
  if (maxDist === 0) return minVal;
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// --- MAIN COMPONENT ---
const TextPressure = ({
  text = 'CODE & DESIGN',
  fontFamily = 'Roboto Flex',
  fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',

  width = true,
  weight = true,
  italic = true,
  alpha = false,

  flex = true,
  stroke = false,
  scale = false,

  strokeWidth = 2,
  className = '',
  minFontSize = 24
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundColor = isDarkMode ? "#18181B" : "#faf9f9"; 
  const strokeColor = isDarkMode ? '#00FF00' : '#FF0000';

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const spansRef = useRef([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split('');

  useEffect(() => {
    const linkId = 'google-font-roboto-flex';
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }, [fontUrl]);

  useEffect(() => {
    const handleMouseMove = e => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const handleTouchMove = e => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (containerRef.current) {
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    // 🛠️ FIX 1: Dinamis Multiplier Font Size
    // Kalau layar sempit (HP < 768px), pengali kita besarin (0.8) supaya huruf diamnya 
    // gak terlalu memakan tempat. Sehingga saat membesar, teks gak tumpah ke luar layar.
    // Di Desktop (> 768px) tetap pakai 0.6 karena ruangnya cukup.
    const sizeMultiplier = containerW < 768 ? 0.8 : 0.6;
    let newFontSize = containerW / (chars.length * sizeMultiplier);
    newFontSize = Math.max(newFontSize, minFontSize);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();

      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(setSize, 100);
    debouncedSetSize();
    window.addEventListener('resize', debouncedSetSize);
    return () => window.removeEventListener('resize', debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId;
    const animate = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current && containerRef.current) {
        const { width: containerW } = containerRef.current.getBoundingClientRect();
        
        // 🛠️ FIX 2: Dinamis Effect Radius
        // Radius 800 terlalu besar buat HP. Kita potong jadi 300 khusus layar mobile.
        const effectRadius = containerW < 768 ? 300 : 800; 

        spansRef.current.forEach(span => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2
          };

          const d = dist(mouseRef.current, charCenter);

          const getAttr = (distance, minVal, maxVal) => {
            if (distance >= effectRadius) return minVal;
            const progress = 1 - (distance / effectRadius); 
            return minVal + (maxVal - minVal) * progress;
          };

          const wdth = width ? Math.floor(getAttr(d, 80, 151)) : 100;
          const wght = weight ? Math.floor(getAttr(d, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, 0, 1).toFixed(2) : 0;
          const alphaVal = alpha ? getAttr(d, 0, 1).toFixed(2) : 1;

          span.style.opacity = alphaVal;
          span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
        });
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, [width, weight, italic, alpha]);

  const styleElement = useMemo(() => {
    return (
      <style>{`
        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>
    );
  }, [textColor, strokeColor, strokeWidth]);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ backgroundColor: backgroundColor, transition: 'background-color 0.3s ease' }} 
    >
      {styleElement}
      <h1
        ref={titleRef}
        className={`text-pressure-title ${
          flex ? 'flex justify-between' : ''
        } ${stroke ? 'stroke' : ''} uppercase text-center`}
        style={{
          fontFamily,
          fontSize: `${fontSize}px`, 
          lineHeight,
          width: '100%', 
          whiteSpace: 'nowrap', 
          transform: `scale(1, ${scaleY})`,
          transformOrigin: 'center top',
          margin: 0,
          fontWeight: 100,
          color: stroke ? undefined : textColor,
          transition: 'color 0.5s ease',
          backgroundColor: 'transparent',
        }}
      >
        {chars.map((char, i) => (
          <span 
            key={i} 
            ref={el => (spansRef.current[i] = el)} 
            data-char={char} 
            className="inline-block"
            style={{ backgroundColor: 'transparent' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;