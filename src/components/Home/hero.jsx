import React, { useContext, lazy, Suspense, useMemo, useEffect, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion"; 
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MergedShapes from "./MergedShape";
import LocationBadge from '../LocationBadge';

// Daftarkan plugin GSAP
gsap.registerPlugin(ScrollTrigger);

const Particles = lazy(() => import("./particles"));

export default function Hero({ isAppLoading }) {
  const { isDarkMode } = useContext(ThemeContext);
  const shapeColor = isDarkMode ? "#ffffff" : "#1a1a1a";
  
  // Ref untuk efek parallax GSAP
  const parallaxRef = useRef(null);

  const particleThemeColors = useMemo(() => {
    return isDarkMode 
      ? ["#ffffff", "#f0f0f0", "#e0e0e0"] 
      : ["#1a1a1a", "#333333", "#4d4d4d"]; 
  }, [isDarkMode]);

  // --- LOGIKA PARALLAX GSAP (Super Ringan & Sinkron dengan GSAP Smooth Scroll) ---
  useEffect(() => {
    if (isAppLoading || !parallaxRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(parallaxRef.current, {
        y: -350, // Jarak parallax ke atas
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom top",
          scrub: 1.2, // Nilai scrub memberikan efek spring/momentum yang smooth
        }
      });
    });

    return () => ctx.revert(); // Bersihkan animasi saat unmount
  }, [isAppLoading]);

  return (
    <section
      id="home"
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-4 touch-pan-y overflow-hidden ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      <Suspense fallback={null}>
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleColors={particleThemeColors} 
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={120}
          sizeRandomness={5.2}
          cameraDistance={25}
          className="absolute inset-0 z-0 w-full h-full"
        />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={!isAppLoading ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="scale-50 sm:scale-75 md:scale-90 lg:scale-100 origin-center transition-transform duration-500">
          <MergedShapes fill={shapeColor} startAnimation={!isAppLoading} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={!isAppLoading ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="mt-12"
        >
        </motion.div>
      </motion.div>

      {/* Gradien Bawah */}
      <div
        className={`absolute bottom-0 left-0 w-full h-40 z-20 pointer-events-none bg-gradient-to-b from-transparent ${
          isDarkMode ? "to-zinc-900" : "to-[#faf9f9]"
        }`}
      />

      {/* Wrapper Entrance Animasi */}
      <motion.div
        initial={{ opacity: 0, x: -100 }} 
        animate={!isAppLoading ? { opacity: 1, x: 0 } : { opacity: 0 }}
        transition={{ delay: 3.2, duration: 1.2, type: "spring", damping: 14 }}
        className="absolute left-0 bottom-[15%] z-50"
      >
        {/* Wrapper Parallax Scroll GSAP (Dipisah agar tidak bentrok dengan Framer) */}
        <div ref={parallaxRef}>
          <LocationBadge isDarkMode={isDarkMode} />
        </div>
      </motion.div>       
    </section>
  );
}