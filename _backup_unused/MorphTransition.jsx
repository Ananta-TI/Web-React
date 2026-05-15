// src/components/Shared/MorphTransition.jsx

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

// Daftarkan plugin GSAP
gsap.registerPlugin(MorphSVGPlugin);

// Definisikan Path SVG
const START_PATH = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
const END_PATH = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

export default function MorphTransition({ onComplete }) {
  const pathRef = useRef(null);
  const containerRef = useRef(null);

useEffect(() => {
  if (!pathRef.current || !containerRef.current) return;

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      if (onComplete) onComplete();
    },
  });

  gsap.set(pathRef.current, { attr: { d: START_PATH } });

  tl.to(pathRef.current, {
    morphSVG: END_PATH,
    duration: 1.0,
    ease: "power2.out"
  });

  // Fade-out dimulai SETELAH morph selesai
  tl.to(containerRef.current, {
    opacity: 0,
    duration: 0.6,
  });

  tl.play();

  return () => tl.kill();
}, [onComplete]);


  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-black pointer-events-none"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          ref={pathRef}
          fill="black"
          className="path"
          d={START_PATH}
        />
      </svg>
    </div>
  );
}