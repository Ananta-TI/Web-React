import React, {
  useContext,
  lazy,
  Suspense,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";

import MergedShapes from "./MergedShape";
import LocationBadge from "../LocationBadge";
// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollTrigger);

const Particles = lazy(() => import("./particles"));

function useIdleMount(enabled, delay = 700) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setMounted(false);
      return;
    }

    let timeoutId;
    let idleId;

    const mount = () => setMounted(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(mount, {
        timeout: delay + 1000,
      });
    } else {
      timeoutId = window.setTimeout(mount, delay);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled, delay]);

  return mounted;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");

    const handleChange = () => {
      setIsDesktop(media.matches);
    };

    handleChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  return isDesktop;
}

export default function Hero({ isAppLoading }) {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const parallaxRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();

  const shapeColor = isDarkMode ? "#ffffff" : "#1a1a1a";

const canLoadParticles = !isAppLoading && !shouldReduceMotion && isDesktop;
  const shouldRenderParticles = useIdleMount(canLoadParticles, 800);

  const particleThemeColors = useMemo(() => {
    return isDarkMode
      ? ["#ffffff", "#f0f0f0", "#e0e0e0"]
      : ["#1a1a1a", "#333333", "#4d4d4d"];
  }, [isDarkMode]);

  const particleConfig = useMemo(() => {
    if (isDesktop) {
      return {
        particleCount: 130,
        particleSpread: 10,
        speed: 0.08,
        particleHoverFactor: 1.2,
        particleBaseSize: 95,
        sizeRandomness: 4,
        cameraDistance: 25,
        moveParticlesOnHover: true,
      };
    }

    return {
      particleCount: 55,
      particleSpread: 8,
      speed: 0.045,
      particleHoverFactor: 0,
      particleBaseSize: 70,
      sizeRandomness: 2.5,
      cameraDistance: 28,
      moveParticlesOnHover: false,
    };
  }, [isDesktop]);

useEffect(() => {
  if (
    isAppLoading ||
    !isDesktop ||
    !parallaxRef.current ||
    shouldReduceMotion
  ) {
    return;
  }

  let ctx;
  let cancelled = false;

  async function runParallax() {
    const gsapModule = await import("gsap");
    const scrollTriggerModule = await import("gsap/ScrollTrigger");

    if (cancelled || !parallaxRef.current) return;

    const gsap = gsapModule.gsap;
    const ScrollTrigger = scrollTriggerModule.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);

    ctx = gsap.context(() => {
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
    });
  }

  runParallax();

  return () => {
    cancelled = true;
    ctx?.revert();
  };
}, [isAppLoading, isDesktop, shouldReduceMotion]);

  return (
    <section
      id="home"
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-4 touch-pan-y overflow-hidden ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {shouldRenderParticles && (
        <Suspense fallback={null}>
          <Particles
            particleCount={particleConfig.particleCount}
            particleSpread={particleConfig.particleSpread}
            speed={particleConfig.speed}
            particleColors={particleThemeColors}
            moveParticlesOnHover={particleConfig.moveParticlesOnHover}
            particleHoverFactor={particleConfig.particleHoverFactor}
            alphaParticles={true}
            particleBaseSize={particleConfig.particleBaseSize}
            sizeRandomness={particleConfig.sizeRandomness}
            cameraDistance={particleConfig.cameraDistance}
            className="absolute inset-0 z-0 w-full h-full"
          />
        </Suspense>
      )}

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={!isAppLoading ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="scale-50 sm:scale-75 md:scale-90 lg:scale-100 origin-center transition-transform duration-500">
          <MergedShapes fill={shapeColor} startAnimation={!isAppLoading} />
        </div>
      </motion.div>

      <div
        className={`absolute bottom-0 left-0 w-full h-40 z-20 pointer-events-none bg-gradient-to-b from-transparent ${
          isDarkMode ? "to-zinc-900" : "to-[#faf9f9]"
        }`}
      />

      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={!isAppLoading ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
        transition={{
          delay: shouldReduceMotion ? 0 : 0.45,
          duration: shouldReduceMotion ? 0.2 : 0.9,
          type: shouldReduceMotion ? "tween" : "spring",
          damping: 16,
        }}
        className="absolute left-0 bottom-[15%] z-50"
      >
        <div ref={parallaxRef}>
          <LocationBadge isDarkMode={isDarkMode} />
        </div>
      </motion.div>
    </section>
  );
}