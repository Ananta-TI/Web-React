import React, { useContext, useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import { TextReveal } from "../components/Shared/TextReveal";
import GithubCard from "../components/GithubCard";
import ExperienceList from "../components/Home/ExperienceList";

import "../index.css";

// ─── LAZY LOAD KOMPONEN BERAT ──────────────────────────────────────────────
const GithubGraph      = lazy(() => import("../components/GithubGraph"));
const AnimatedBeamDemo = lazy(() => import("../components/AnimatedBeamDemo").then(m => ({ default: m.AnimatedBeamDemo })));
const ScannerChart     = lazy(() => import("./scannerChart.jsx"));

// ─── HOOK: Trigger Load JS Sekali Saja ──────────────────────────
function useLazyMount(rootMargin = "200px") {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldMount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          observer.disconnect(); 
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldMount, rootMargin]);

  return [ref, shouldMount];
}

// ─── PLACEHOLDER ─────────────────────────────────
function SectionSkeleton({ height = "h-64", isDarkMode }) {
  return (
    <div
      className={`w-full ${height} rounded-2xl animate-pulse ${
        isDarkMode ? "bg-zinc-800/40" : "bg-zinc-200/60"
      }`}
    />
  );
}

// ─── KOMPONEN ANIMASI MUNCUL/HILANG (SCROLL REVEAL) ──────────────────────
// once: false membuat animasi dijalankan ulang setiap kali masuk layar
const RevealWrapper = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.15 }} // 0.15 berarti animasi mulai saat 15% elemen terlihat
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} // Efek easing smooth khas Apple
      className={className}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [delayedDarkMode, setDelayedDarkMode] = useState(isDarkMode);

  useEffect(() => {
    const timer = setTimeout(() => setDelayedDarkMode(isDarkMode), 700);
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  const [githubRef, mountGithub]   = useLazyMount("150px");
  const [beamRef,   mountBeam]     = useLazyMount("150px");
  const [chartRef,  mountChart]    = useLazyMount("150px");

  const memoizedContent = useMemo(() => {
    return (
      <>
        {/* ── Hero / Intro ──────────────────────────────────────────────── */}
        <RevealWrapper className="mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
          <h2 className="text-3xl sm:text-4xl mt-6 sm:mt-10 px-4 sm:px-8 md:px-20 lg:px-60 md:text-7xl font-lyrae font-bold">
            <DecryptedText
              text="About Me"
              speed={100}
              maxIterations={105}
              sequential
              animateOn="view"
            />
          </h2>

          <div className="relative z-10">
            <TextReveal
              isDarkMode={delayedDarkMode}
              className="relative lg:-mb-25 -mt-7 sm:-mb-10 sm:text-lg md:text-2xl leading-relaxed font-mono px-2 sm:px-4 md:px-0"
              text="Hi there! 👋 I'm **Ananta** **Firdaus**, a **frontend** **developer** with a unique combination of traits—I'm both a **perfectionist** **and** **lazy**. I always strive for the most **efficient way** to achieve high-quality results. Currently studying **Informatics** **Engineering** at **Politeknik** **Caltex** **Riau**, I have a strong foundation in logical thinking and structured problem-solving. However, my passion lies in crafting elegant and interactive user interfaces, ensuring that every design is not only visually appealing but also intuitive and seamless. Lately, I've been diving deeper into **React.js**, exploring **dynamic** **UI **development** and **smooth **animations** to create engaging digital experiences. My goal is to bridge **aesthetics** and **functionality**, making technology feel effortless for users."
            />
          </div>
        </RevealWrapper>

        {/* ── Experience ────────────────────────────────────────────────── */}
        <RevealWrapper>
          <h2 className="text-3xl -mb-10 sm:mt-20 px-4 sm:px-8 md:px-20 lg:px-80 md:text-5xl font-lyrae font-bold">
            <DecryptedText
              text="Experience"
              speed={100}
              maxIterations={105}
              sequential
              animateOn="view"
            />
          </h2>

          <div className="mt-15 sm:mt-10 px-4 sm:px-6 md:px-12 lg:px-80">
            <ExperienceList isDarkMode={delayedDarkMode} />
          </div>
        </RevealWrapper>

        {/* ── Github Graph ──────────────────────────────────── */}
        <div ref={githubRef} className="w-full max-w-7xl mx-auto px-4 mt-1 grid gap-6 grid-cols-1 lg:grid-cols-4 auto-rows-[minmax(120px,auto)]">
          <RevealWrapper className="lg:col-span-1">
            <GithubCard username="Ananta-TI" isDarkMode={delayedDarkMode} />
          </RevealWrapper>
          
          <RevealWrapper className="lg:col-span-3">
            {mountGithub ? (
              <Suspense fallback={<SectionSkeleton height="h-48" isDarkMode={delayedDarkMode} />}>
                <GithubGraph isDarkMode={delayedDarkMode} />
              </Suspense>
            ) : (
              <SectionSkeleton height="h-48" isDarkMode={delayedDarkMode} />
            )}
          </RevealWrapper>
        </div>

        {/* ── Animated Beam ────────────────────────────────── */}
        <div ref={beamRef} className="dark px-4 sm:px-0">
          <RevealWrapper>
            {mountBeam ? (
              <Suspense fallback={<SectionSkeleton height="h-[600px]" isDarkMode={delayedDarkMode} />}>
                <AnimatedBeamDemo isDarkMode={delayedDarkMode} />
              </Suspense>
            ) : (
              <SectionSkeleton height="h-[600px]" isDarkMode={delayedDarkMode} />
            )}
          </RevealWrapper>
        </div>

        {/* ── Scanner Chart ────────────────────────────────── */}
        <div ref={chartRef} className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20">
          <RevealWrapper>
            {mountChart ? (
              <Suspense fallback={<SectionSkeleton height="h-screen" isDarkMode={delayedDarkMode} />}>
                <ScannerChart isDarkMode={delayedDarkMode} />
              </Suspense>
            ) : (
              <SectionSkeleton height="h-screen" isDarkMode={delayedDarkMode} />
            )}
          </RevealWrapper>
        </div>
      </>
    );
  }, [delayedDarkMode, githubRef, mountGithub, beamRef, mountBeam, chartRef, mountChart]);

  return (
    <section
      id="about"
      className={`relative w-full min-h-screen overflow-hidden flex-col items-center ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {memoizedContent}
    </section>
  );
};

export default About;