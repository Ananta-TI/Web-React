import React, {
  useContext,
  useEffect,
  useRef,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import { ThemeContext } from "../../context/ThemeContext";

import MergedShapes from "./MergedShape";
import LocationBadge from "../LocationBadge";
import KineticGrid from "./KineticGrid";

export default function Hero({
  isAppLoading,
}) {
  const theme =
    useContext(ThemeContext);

  const isDarkMode =
    theme?.isDarkMode ?? true;

  const parallaxRef =
    useRef(null);

  const shouldReduceMotion =
    useReducedMotion();

  // ───────────────────────────────────────────────────────────────────────────
  // GSAP PARALLAX
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      isAppLoading ||
      shouldReduceMotion ||
      !parallaxRef.current
    ) {
      return;
    }

    let ctx;

    async function runParallax() {
      const { gsap } =
        await import("gsap");

      const { ScrollTrigger } =
        await import(
          "gsap/ScrollTrigger"
        );

      gsap.registerPlugin(
        ScrollTrigger
      );

      ctx = gsap.context(() => {
        // Location Badge Parallax
        gsap.to(
          parallaxRef.current,
          {
            y: -380,

            ease: "none",

            scrollTrigger: {
              trigger: "#home",

              start: "top top",

              end: "bottom top",

              scrub: 0.8,
            },
          }
        );
      });
    }

    runParallax();

    return () => {
      ctx?.revert();
    };
  }, [
    isAppLoading,
    shouldReduceMotion,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <section
      id="home"
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center transition-colors duration-500 touch-pan-y ${
        isDarkMode
          ? "bg-zinc-900 text-white"
          : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* KINETIC GRID BACKGROUND */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={
          !isAppLoading
            ? {
                opacity: 1,
              }
            : {
                opacity: 0,
              }
        }
        transition={{
          duration:
            shouldReduceMotion
              ? 0.2
              : 1.2,

          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <KineticGrid
          isDarkMode={
            isDarkMode
          }
        />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SUBTLE CENTER GLOW */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div
        className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ${
          isDarkMode
            ? "bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.025),transparent_45%)]"
            : "bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0.018),transparent_45%)]"
        }`}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={
          !isAppLoading
            ? {
                opacity: 1,
                y: 0,
              }
            : {
                opacity: 0,
                y: 18,
              }
        }
        transition={{
          duration:
            shouldReduceMotion
              ? 0.2
              : 0.8,

          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="origin-center scale-50 transition-transform duration-500 sm:scale-75 md:scale-90 lg:scale-100">
          <MergedShapes
            fill={
              isDarkMode
                ? "#ffffff"
                : "#1a1a1a"
            }
            startAnimation={
              !isAppLoading
            }
          />
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* BOTTOM FADE */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div
        className={`pointer-events-none absolute bottom-0 left-0 z-20 h-40 w-full bg-gradient-to-b from-transparent transition-colors duration-500 ${
          isDarkMode
            ? "to-zinc-900"
            : "to-[#faf9f9]"
        }`}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* LOCATION BADGE */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <motion.div
        initial={{
          opacity: 0,
          x: -80,
        }}
        animate={
          !isAppLoading
            ? {
                opacity: 1,
                x: 0,
              }
            : {
                opacity: 0,
                x: -80,
              }
        }
        transition={{
          delay:
            shouldReduceMotion
              ? 0
              : 0.45,

          duration:
            shouldReduceMotion
              ? 0.2
              : 0.9,

          type:
            shouldReduceMotion
              ? "tween"
              : "spring",

          damping: 16,
        }}
        className="absolute bottom-[15%] left-0 z-50"
      >
        <div ref={parallaxRef}>
          <LocationBadge
            isDarkMode={
              isDarkMode
            }
          />
        </div>
      </motion.div>
    </section>
  );
}