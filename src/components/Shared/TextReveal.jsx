"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export const TextReveal = ({ text, className }) => {
  const targetRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: false };
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 55%", "end 60%"],
  });

  const words = text.split(" ");

  return (
    <div
      ref={targetRef}
      className={`${className} relative w-full flex mb-[70px] justify-center transition-colors duration-500`}
    >
      <div className="py-16  max-w-7xl">
      <p
  className={`flex flex-wrap font-bold transition-colors duration-500 ${
    isDarkMode ? "text-white " : "text-gray-900"
  }`}
>

          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span className="relative mx-0.5 lg:mx-1 inline-block">
      <motion.span
        style={{ opacity }}
        className="transition-colors duration-500"
      >
        {children}
      </motion.span>
    </span>
  );
};
