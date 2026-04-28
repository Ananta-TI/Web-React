"use client";

import { useRef, useContext, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThemeContext } from "../../context/ThemeContext"; 

gsap.registerPlugin(ScrollTrigger);

export const TextReveal = ({ text, className }) => {
  const containerRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: false };

  const words = text.split(" ");
  let isHighlighting = false;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ambil semua elemen kata yang *bukan* kata yang di-highlight
      const revealWords = gsap.utils.toArray('.reveal-word');
      
      gsap.fromTo(revealWords, 
        { opacity: 0.1 },
        {
          opacity: 1,
          stagger: 0.05, // Efek gelombang berurutan
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 30%",
            end: "bottom 70%",
            scrub: 1, // Smooth scrub
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${className} relative w-full flex my-[70px] justify-center transition-colors duration-500 items-center`}
    >
      <div className="max-w-7xl py-10">
        <p className="flex flex-wrap font-bold transition-colors duration-500">
          {words.map((word, i) => {
            const startHighlight = word.startsWith("**");
            const endHighlight = word.endsWith("**") || word.includes("**");
            
            if (startHighlight) isHighlighting = true;
            const cleanWord = word.replace(/\*\*/g, "");
            const currentHighlightStatus = isHighlighting;
            if (endHighlight) isHighlighting = false;

            // Jika Highlight, warna merah/hijau menyala (opacity 1)
            // Jika bukan, gunakan kelas 'reveal-word' untuk dikontrol GSAP
            const colorClass = currentHighlightStatus
              ? isDarkMode ? "dark:text-[#c1ff72]" : "text-[#f50a0a]"
              : isDarkMode ? "text-white reveal-word" : "text-gray-900 reveal-word";

            return (
              <span key={i} className="relative mx-[3px] lg:mx-[5px] inline-block my-1">
                <span 
                  className={`transition-colors duration-500 ${colorClass}`}
                  // Set opacity bawaan: terang untuk highlight, redup untuk kata biasa
                  style={{ opacity: currentHighlightStatus ? 1 : 0.1 }}
                >
                  {cleanWord}
                </span>
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};