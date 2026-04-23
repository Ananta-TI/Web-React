import React, { useEffect, useRef } from "react";

export default function LocationBadge({ isDarkMode }) {
  const globeRef = useRef(null);

  // Palet warna premium
  const shapeFill = isDarkMode ? "#e4e4e7" : "#18181b";
  const textTitle = isDarkMode ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)";
  const textCity = isDarkMode ? "#18181b" : "#ffffff";
  const ringColor = isDarkMode ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.35)";

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    let angle = 0;
    let dir = 1;
    let raf;
    let tid;

    function spin() {
      angle += 0.42 * dir;
      globe.style.transform = `rotateZ(-15deg) rotateX(20deg) rotateY(${angle}deg)`;
      raf = requestAnimationFrame(spin);
    }
    spin();

    function onScroll(delta) {
      dir = delta > 0 ? 1 : -1;
      cancelAnimationFrame(raf);
      angle += dir * 5; 
      globe.style.transform = `rotateZ(-15deg) rotateX(20deg) rotateY(${angle}deg)`;
      clearTimeout(tid);
      tid = setTimeout(spin, 350);
    }

    const handleWheel = (e) => onScroll(e.deltaY);
    let ty = 0;
    const handleTouchStart = (e) => { ty = e.touches[0].clientY; };
    const handleTouchMove = (e) => {
      onScroll(ty - e.touches[0].clientY);
      ty = e.touches[0].clientY;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tid);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Cincin globe disesuaikan untuk globe yang lebih besar (66px)
  const rings = [
    "rotateY(0deg)",
    "rotateY(60deg)",
    "rotateY(120deg)",
    "rotateX(90deg)",
    "rotateX(90deg) translateZ(15px) scale(0.85)", 
    "rotateX(90deg) translateZ(-15px) scale(0.85)",
  ];

  return (
    <div className="relative inline-flex items-center group cursor-none cursor-target drop-shadow-xl">
      
      {/* SVG Custom DIPERBESAR 1.5x
        Width awal 220 -> 330
        Height awal 64 -> 96
        
        Hitungan d path:
        Lengkungan kanan (A48) -> Radius 48 (awalnya 32)
        Titik potong x (188 -> 282)
        Lubang (A33) -> Radius lubang 33 (awalnya 22) -> Diameter globe = 66
        Posisi lubang: y=15 sampai y=81
      */}
      <svg
        width="330"
        height="96"
        viewBox="0 0 330 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-500"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0 L282 0 A48 48 0 0 1 282 96 L0 96 Z M282 15 A33 33 0 0 0 282 81 A33 33 0 0 0 282 15 Z"
          fill={shapeFill}
        />
      </svg>

      {/* Text Overlay - Ukuran Font Diperbesar */}
      <div className="absolute left-8 flex flex-col justify-center pointer-events-none mt-1">
        <span
          style={{ color: textTitle, transition: "color 0.5s ease" }}
          className="text-xs font-bold tracking-[0.25em] uppercase mb-1"
        >
          Located In
        </span>
        <span
          style={{ color: textCity, transition: "color 0.5s ease" }}
          className="text-2xl font-black tracking-wider leading-none"
        >
          Indonesia
        </span>
      </div>

      {/* Digital Ball / 3D Globe - Diperbesar menjadi 66px */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: 48, // Jarak disesuaikan dengan titik potong SVG yang baru (282px)
          top: "50%",
          transform: "translate(50%, -50%)",
          width: 66,
          height: 66,
          perspective: 1200, // Perspektif dijauhkan agar proporsional
        }}
      >
        <div
          ref={globeRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
        >
          {rings.map((transformRule, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `3px solid ${ringColor}`,
                transform: transformRule,
                transition: "transform 0.5s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}