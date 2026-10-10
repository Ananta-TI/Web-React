import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import { TextReveal } from "../components/Shared/TextReveal";
import GithubCard from "../components/GithubCard";
import ExperienceList from "../components/Home/ExperienceList";

import "../index.css";

/* =========================
   LAZY LOAD KOMPONEN BERAT
========================= */
const GithubGraph = lazy(() => import("../components/GithubGraph"));

const AnimatedBeamDemo = lazy(() =>
  import("../components/AnimatedBeamDemo").then((module) => ({
    default: module.AnimatedBeamDemo,
  }))
);

const ScannerChart = lazy(() => import("../layouts/scannerChart.jsx"));

/* =========================
   HOOK: MOUNT SAAT DEKAT VIEWPORT
========================= */
function useLazyMount(rootMargin = "700px") {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || shouldMount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldMount, rootMargin]);

  return [ref, shouldMount];
}

/* =========================
   PLACEHOLDER BIAR LAYOUT STABIL
========================= */
function SectionSkeleton({ height = "h-64", isDarkMode }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${height} rounded-2xl animate-pulse ${
        isDarkMode ? "bg-zinc-800/40" : "bg-zinc-200/60"
      }`}
    />
  );
}

/* =========================
   REVEAL WRAPPER RINGAN
========================= */
function RevealWrapper({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================
   ABOUT PAGE
========================= */
export default function About() {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [delayedDarkMode, setDelayedDarkMode] = useState(isDarkMode);

  const [githubRef, mountGithub] = useLazyMount("700px");
  const [beamRef, mountBeam] = useLazyMount("850px");
  const [chartRef, mountChart] = useLazyMount("950px");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDelayedDarkMode(isDarkMode);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isDarkMode]);

  return (
    <section
      id="about"
      className={`relative w-full min-h-screen overflow-hidden flex-col items-center ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
{/* ================= HERO / INTRO ================= */}

<RevealWrapper>
  <div className="container mx-auto px-4 sm:px-6 lg:px-35">
    {/* TITLE */}
    <h2
      className="
        font-lyrae
        font-bold
        leading-none
      "
      style={{
        marginTop:
          "clamp(24px, 4vw, 40px)",

        fontSize:
          "clamp(2rem, 5vw, 4.5rem)",
      }}
    >
      <DecryptedText
        text="About Me"
        speed={35}
        maxIterations={28}
        sequential
        animateOn="view"
      />
    </h2>

    {/* TEXT */}
    <div
      className="
        relative
        z-10

        w-full
        min-w-0
      "
      style={{
        /*
         * Mobile jangan terlalu naik.
         * Desktop tetap bisa dekat dengan title.
         */
        marginTop:
          "clamp(-38px, -3vw, -16px)",
      }}
    >
      <TextReveal
        isDarkMode={
          delayedDarkMode
        }
        className="
          relative

          w-full
          min-w-0

          font-mono

          text-[14px]
          leading-relaxed

          sm:text-lg

          md:text-xl

          lg:text-2xl

          sm:-mb-10
          lg:-mb-20
        "
        text="Hi there! 👋 I'm **Ananta** **Firdaus**, a **frontend** **developer** with a unique combination of traits: I'm both a **perfectionist** and **lazy**. I always strive for the most **efficient way** to achieve high-quality results. Currently studying **Informatics** **Engineering** at **Politeknik** **Caltex** **Riau**, I have a strong foundation in logical thinking and structured problem-solving. However, my passion lies in crafting elegant and interactive user interfaces, ensuring that every design is not only visually appealing but also intuitive and seamless. Lately, I've been diving deeper into **React.js**, exploring **dynamic** **UI** **development** and **smooth** **animations** to create engaging digital experiences. My goal is to bridge **aesthetics** and **functionality**, making technology feel effortless for users."
      />
    </div>
  </div>
</RevealWrapper>

      {/* ================= EXPERIENCE ================= */}
      <RevealWrapper>
  <div className="container mx-auto px-4 sm:px-6 lg:px-35">
    <h2 className="text-3xl -mb-10 sm:mt-20 md:text-5xl font-lyrae font-bold">
      <DecryptedText
        text="Experience"
        speed={35}
        maxIterations={28}
        sequential
        animateOn="view"
      />
    </h2>

    <div className="mt-15 sm:mt-10">
      <ExperienceList isDarkMode={delayedDarkMode} />
    </div>
  </div>
</RevealWrapper>

{/* ================= GITHUB GRAPH ================= */}
<div
  ref={githubRef}
  className="
    w-full
    min-w-0
    max-w-7xl
    mx-auto

    px-4
    mt-1

    grid
    grid-cols-1
    lg:grid-cols-4

    gap-6

    auto-rows-[minmax(120px,auto)]

    overflow-hidden
  "
>
  {/* ================= GITHUB CARD ================= */}
  <RevealWrapper
    className="
      w-full
      min-w-0
      max-w-full

      lg:col-span-1
    "
  >
    <div
      className="
        w-full
        min-w-0
        max-w-full
      "
    >
      <GithubCard
        username="Ananta-TI"
        isDarkMode={delayedDarkMode}
      />
    </div>
  </RevealWrapper>

  {/* ================= GITHUB GRAPH ================= */}
  <RevealWrapper
    className="
      w-full
      min-w-0
      max-w-full

      lg:col-span-3
    "
  >
    <div
      className="
        w-full
        min-w-0
        max-w-full

        overflow-hidden
      "
    >
      {mountGithub ? (
        <Suspense
          fallback={
            <SectionSkeleton
              height="h-48"
              isDarkMode={delayedDarkMode}
            />
          }
        >
          <div
            className="
              w-full
              min-w-0
              max-w-full
              overflow-hidden
            "
          >
            <GithubGraph
              isDarkMode={delayedDarkMode}
            />
          </div>
        </Suspense>
      ) : (
        <SectionSkeleton
          height="h-48"
          isDarkMode={delayedDarkMode}
        />
      )}
    </div>
  </RevealWrapper>
</div>

      {/* ================= ANIMATED BEAM ================= */}
      <div ref={beamRef} className="dark px-4 sm:px-0 mt-8">
        <RevealWrapper>
          {mountBeam ? (
            <Suspense
              fallback={
                <SectionSkeleton
                  height="h-[600px]"
                  isDarkMode={delayedDarkMode}
                />
              }
            >
              <AnimatedBeamDemo isDarkMode={delayedDarkMode} />
            </Suspense>
          ) : (
            <SectionSkeleton height="h-[600px]" isDarkMode={delayedDarkMode} />
          )}
        </RevealWrapper>
      </div>

      {/* ================= SCANNER CHART ================= */}
      {/* <div
        ref={chartRef}
        className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20"
      >
        <RevealWrapper>
          {mountChart ? (
            <Suspense
              fallback={
                <SectionSkeleton
                  height="h-screen"
                  isDarkMode={delayedDarkMode}
                />
              }
            >
              <ScannerChart isDarkMode={delayedDarkMode} />
            </Suspense>
          ) : (
            <SectionSkeleton height="h-screen" isDarkMode={delayedDarkMode} />
          )}
        </RevealWrapper>
      </div> */}
    </section>
  );
}
