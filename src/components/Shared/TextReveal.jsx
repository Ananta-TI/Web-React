"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext"; // Sesuaikan path context kamu

export const TextReveal = ({ text, className }) => {
  const targetRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: false };
  
  // Menggunakan offset standar agar efek scroll terasa natural
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"], 
  });

  const words = text.split(" ");
  let isHighlighting = false;

  return (
    <div
      ref={targetRef}
      // Menambahkan min-h agar ada ruang scroll yang cukup
      className={`${className} relative w-full flex my-[70px] justify-center transition-colors duration-500  items-center`}
    >
      <div className="max-w-7xl py-10">
        <p className="flex flex-wrap font-bold transition-colors duration-500">
          {words.map((word, i) => {
            // Logika deteksi **
            const startHighlight = word.startsWith("**");
            const endHighlight = word.endsWith("**") || word.includes("**");
            
            if (startHighlight) isHighlighting = true;

            const cleanWord = word.replace(/\*\*/g, "");
            const currentHighlightStatus = isHighlighting;

            if (endHighlight) isHighlighting = false;

            // Menghitung range animasi per kata
            const step = 1 / words.length;
            const start = i * step;
            const end = start + step;
            
         
            const adjustedStart = 0.1 + (start * 0.5);
            const adjustedEnd = 0.1 + (end * 0.5);

            return (
              <Word 
                key={i} 
                progress={scrollYProgress} 
                range={[adjustedStart, adjustedEnd]}
                isHighlighted={currentHighlightStatus}
                isDarkMode={isDarkMode}
              >
                {cleanWord}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

const Word = ({ children, progress, range, isHighlighted, isDarkMode }) => {
  // 1. Ini adalah animasi opacity untuk kata BIASA (dari redup ke terang)
  const dynamicOpacity = useTransform(progress, range, [0.1, 1]);

  const colorClass = isHighlighted
    ? isDarkMode ? " dark:text-[#c1ff72]" : "text-[#f50a0a]"
    : isDarkMode 
      ? "text-white" 
      : "text-gray-900";

  // 3. LOGIKA KUNCI: Tentukan opacity final.
  // Jika kata ini adalah highlight, PAKSA opacity menjadi 1 (selalu menyala).
  // Jika bukan highlight, gunakan nilai dari animasi scroll (dynamicOpacity).
  const finalOpacity = isHighlighted ? 1 : dynamicOpacity;

  return (
    // mx-1 untuk spasi antar kata
    <span className="relative mx-[3px] lg:mx-[5px] inline-block my-1">
      <motion.span
        style={{ opacity: finalOpacity }} // Gunakan opacity yang sudah ditentukan di atas
        className={`transition-colors duration-500 ${colorClass}`}
      >
        {children}
      </motion.span>
    </span>
  );
};
