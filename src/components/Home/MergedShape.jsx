import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from "../../context/ThemeContext";

const MergedShape = ({
  startAnimation = false,
  style: containerStyle,
  ...props
}) => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  const fill = isDarkMode ? "#ffffff" : "#1a1a1a";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // State posisi lokal logo (mengikuti kemiringan 35 derajat)
  const [localOffset, setLocalOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartMouseRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (isMobile) return;
    setIsDragging(true);
    // Simpan titik awal pointer dan offset lokal saat mulai drag
    dragStartMouseRef.current = { 
      x: e.clientX - localOffset.x, 
      y: e.clientY - localOffset.y 
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isMobile) return;

    // 1. Hitung perubahan delta murni dari gerakan layar (screen space)
    const deltaXScreen = e.clientX - dragStartMouseRef.current.x;
    const deltaYScreen = e.clientY - dragStartMouseRef.current.y;

    // 2. Terapkan Matriks Transformasi Rotasi Berlawanan (-35 derajat) 
    // untuk memetakan koordinat layar ke koordinat lokal elemen yang miring 35 derajat.
    // cos(35°) ≈ 0.8191, sin(35°) ≈ 0.5736
    const cosTheta = 0.8191;
    const sinTheta = 0.5736;

    const localX = cosTheta * deltaXScreen + sinTheta * deltaYScreen;
    const localY = -sinTheta * deltaXScreen + cosTheta * deltaYScreen;

    setLocalOffset({ x: localX, y: localY });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    // Efek membal kembali ke posisi semula (0,0) secara mulus
    setLocalOffset({ x: 0, y: 0 });
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const drawables = [
    { type: 'div', left: 0, top: 20, width: 60, height: 280, borderRadius: "32px", dir: "bt" }, 
    { type: 'svg', left: 60, top: 38, viewBox: "0 0 32 32", path: "M 0 0 C 0 23.872 5.76 32 32 32 H 0 Z" },
    { type: 'div', left: 60, top: 70, width: 80, height: 50, dir: "lr" }, 
    { type: 'svg', left: 60, top: 120, viewBox: "0 -32 32 32", path: "M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 140, top: 70, width: 60, height: 230, borderRadius: "0 32px 32px 32px", dir: "tb" },
    { type: 'svg', left: 108, top: 120, viewBox: "-32 -32 32 32", path: "M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" },
    { type: 'div', left: 70, top: 0, width: 330, height: 50, borderRadius: "32px", dir: "lr" },
    { type: 'div', left: 220, top: 50, width: 60, height: 280, borderRadius: "0 0 32px 32px", dir: "tb" },
    { type: 'svg', left: 188, top: 50, viewBox: "-32 -32 32 32", path: "M 0 0 C 0 -23.872 -5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 300, top: 70, width: 60, height: 230, borderRadius: "32px 0 32px 32px", dir: "bt" },
    { type: 'svg', left: 280, top: 50, viewBox: "0 -32 32 32", path: "M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 360, top: 70, width: 80, height: 60, dir: "lr" },
    { type: 'svg', left: 360, top: 130, viewBox: "0 -32 32 32", path: "M 0 0 C 0 -23.872 5.76 -32 32 -32 H 0 Z" },
    { type: 'div', left: 440, top: 70, width: 60, height: 230, borderRadius: "0 32px 32px 32px", dir: "tb" },
    { type: 'svg', left: 408, top: 130, viewBox: "-32 -32 32 32", path: "M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" },
    { type: 'div', left: 370, top: 180, width: 60, height: 60, borderRadius: "32px", dir: "scale" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, 
        transition: { delayChildren: 1, staggerChildren: 0.12 }
     }
  };

  const getVariants = (dir) => {
    switch (dir) {
      case "bt": return { hidden: { scaleY: 0, originY: 1 }, visible: { scaleY: 1 } };
      case "tb": return { hidden: { scaleY: 0, originY: 0 }, visible: { scaleY: 1 } };
      case "lr": return { hidden: { scaleX: 0, originX: 0 }, visible: { scaleX: 1 } };
      case "scale": return { hidden: { scale: 0 }, visible: { scale: 1 } };
      default: return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={startAnimation ? "visible" : "hidden"}
      style={{ position: "relative", width: 500, height: 330, ...containerStyle }}
      {...props}
    >
      {drawables.map((item, i) => (
        item.type === 'div' ? (
          <motion.div
            key={i}
            variants={getVariants(item.dir)}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute", backgroundColor: fill, left: item.left, top: item.top,
              width: item.width, height: item.height, borderRadius: item.borderRadius,
            }}
          />
        ) : (
          <motion.svg
            key={i}
            variants={getVariants('opacity')}
            style={{ position: "absolute", left: item.left, top: item.top, width: 32, height: 32 }}
            viewBox={item.viewBox}
          >
            <motion.path d={item.path} fill={fill} style={{ transition: 'fill 0.5s ease' }} />
          </motion.svg>
        )
      ))}

      {/* Wrapper Utama Badge Ex-Immortal (Rotasi Tetap Miring 35deg) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 35 }}
        animate={startAnimation ? { opacity: 1, scale: 1, rotate: 35 } : { opacity: 0, scale: 0.5, rotate: 35 }}
        transition={{
          delay: 3.4,
          duration: 0.7,
          type: "spring",
          bounce: 0.6
        }}
        style={{
          position: "absolute",
          top: -30,       
          right: -85, 
          zIndex: 50,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Teks "EX" */}
          <span style={{
            fontSize: "36px", 
            fontWeight: "bold",
            fontStyle: "italic",
            fontFamily: "'spirit', sans-serif", 
            letterSpacing: "2px",
            background: isDarkMode 
              ? "linear-gradient(180deg, #E9D5FF 0%, #ffffff 50%, #ffffff 100%)" 
              : "none",
            color: isDarkMode ? "transparent" : "#000000", 
            WebkitBackgroundClip: isDarkMode ? "text" : "initial",
            WebkitTextFillColor: isDarkMode ? "transparent" : "#000000",
            WebkitTextStroke: isDarkMode ? "1px rgba(233, 213, 255, 0.4)" : "none", 
            transform: "translateY(-8px) rotate(-6deg)", 
            marginRight: "-4px", 
            zIndex: 2,
            pointerEvents: "none",
          }}>
            EX
          </span>

          {/* Gambar Logo Immortal dengan Kalkulasi Matriks Geser Lokal */}
          <motion.div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            animate={{ x: localOffset.x, y: localOffset.y }}
            transition={{ type: isDragging ? "tween" : "spring", stiffness: 300, damping: 20 }}
            whileHover={!isMobile ? { scale: 1.08 } : {}}
            whileTap={{ scale: 1.15 }}
            style={{
              zIndex: 1,
              cursor: isMobile ? "default" : "grab",
              touchAction: "none",
              display: "inline-block",
            }}
          >
            <img
              src="/img/immortal.png"
              alt="Immortal Logo"
              draggable={false}
              style={{
                width: 90, 
                userSelect: "none",
                filter: isDarkMode ? "none" : "none",
                transition: "filter 0.3s ease",
                display: "block",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MergedShape;