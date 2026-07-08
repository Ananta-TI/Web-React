import React, { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";

import MergedShapes from "./MergedShape";
import LocationBadge from "../LocationBadge";
import DotField from "./DotField";

export default function Hero({ isAppLoading }) {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const parallaxRef = useRef(null);
  const dotFieldRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Efek Parallax GSAP untuk LocationBadge dan DotField
  useEffect(() => {
    if (isAppLoading || shouldReduceMotion || !parallaxRef.current || !dotFieldRef.current) {
      return;
    }

    let ctx;
    async function runParallax() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Parallax LocationBadge
        gsap.to(parallaxRef.current, {
          y: -380,
          ease: "none",
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        // Parallax DotField (Bergerak ke atas saat scroll)
        gsap.to(dotFieldRef.current, {
          y: 500,
          ease: "none",
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: 0.1,
          },
        });
      });
    }

    runParallax();
    return () => ctx?.revert();
  }, [isAppLoading, shouldReduceMotion]);

  return (
    <section
      id="home"
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center transition-colors duration-500 touch-pan-y ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* DotField sebagai background dengan efek paralaks */}
      <div ref={dotFieldRef} className="absolute inset-0 z-0">
        <DotField
          dotRadius={2.5}
          dotSpacing={30}
          bulgeStrength={67}
          glowRadius={0}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={200}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom={isDarkMode ? "#ffffff" : "#000000"}
          gradientTo={isDarkMode ? "#ffffff" : "#000000"}
          glowColor={isDarkMode ? "#ffffff" : "#000000"}
        />
      </div>

      {/* Konten Utama */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={!isAppLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="origin-center scale-50 transition-transform duration-500 sm:scale-75 md:scale-90 lg:scale-100">
          <MergedShapes 
            fill={isDarkMode ? "#ffffff" : "#1a1a1a"} 
            startAnimation={!isAppLoading} 
          />
        </div>
      </motion.div>

      {/* Fade bottom gradient */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 z-20 h-40 w-full bg-gradient-to-b from-transparent ${
          isDarkMode ? "to-zinc-900" : "to-[#faf9f9]"
        }`}
      />

      {/* Location Badge dengan efek paralaks */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={!isAppLoading ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
        transition={{
          delay: shouldReduceMotion ? 0 : 0.45,
          duration: shouldReduceMotion ? 0.2 : 0.9,
          type: shouldReduceMotion ? "tween" : "spring",
          damping: 16,
        }}
        className="absolute bottom-[15%] left-0 z-50"
      >
        <div ref={parallaxRef}>
          <LocationBadge isDarkMode={isDarkMode} />
        </div>
      </motion.div>
    </section>
  );
}