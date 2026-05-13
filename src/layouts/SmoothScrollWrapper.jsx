import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

function shouldDisableLenis() {
  if (typeof window === "undefined") return true;

  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return isTouchDevice || reduceMotion;
}

export default function SmoothScrollWrapper({ children }) {
  const location = useLocation();
  const lenisRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (shouldDisableLenis()) {
      document.documentElement.style.scrollBehavior = "smooth";
      return;
    }

    const lenis = new Lenis({
      lerp: 0.06,
wheelMultiplier: 0.85,
      touchMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    const raf = (time) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    document.documentElement.classList.add("lenis");
    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      lenis.destroy();
      lenisRef.current = null;

      if (window.lenis === lenis) {
        delete window.lenis;
      }

      document.documentElement.classList.remove("lenis");
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(0, {
        immediate: true,
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return <>{children}</>;
}