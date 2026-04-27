"use client";

import React, { forwardRef, useRef, useContext } from "react";
import { cn } from "../lib/utils";
import { AnimatedBeam } from "./AnimatedBeam";
// @ts-ignore
import { ThemeContext } from "@/context/ThemeContext";

type ThemeContextType = {
  isDarkMode?: boolean;
};

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-16 sm:size-22 items-center justify-center p-3",
        className
      )}
    >
      {children}
    </div>
  );
});

export function AnimatedBeamDemo() {
  const themeCtx = useContext(ThemeContext) as ThemeContextType;
  const isDarkMode = themeCtx?.isDarkMode ?? true;
  const containerRef = useRef<HTMLDivElement>(null);

  // Kiri
  const div8Ref = useRef<HTMLDivElement>(null); // GSAP
  const div1Ref = useRef<HTMLDivElement>(null); // HTML
  const div2Ref = useRef<HTMLDivElement>(null); // JS
  const div3Ref = useRef<HTMLDivElement>(null); // Tailwind

  // Tengah
  const div4Ref = useRef<HTMLDivElement>(null); // Skills

  // Kanan
  const div9Ref = useRef<HTMLDivElement>(null); // Framer Motion
  const div5Ref = useRef<HTMLDivElement>(null); // CSS
  const div6Ref = useRef<HTMLDivElement>(null); // React
  const div7Ref = useRef<HTMLDivElement>(null); // Laravel

  return (
    <div
      className="relative flex h-[600px] w-full items-center justify-center overflow-hidden px-4 sm:px-10"
      ref={containerRef}
    >
      {/* max-w diganti ke 7xl agar sejajar dengan section atas/bawah */}
      <div className="flex size-full max-h-[500px] max-w-7xl flex-col items-stretch justify-between gap-6 md:gap-10">
        
        {/* Row 1 */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div8Ref}>
            <Icons.gsap isDarkMode={isDarkMode} />
          </Circle>
          <Circle ref={div9Ref}>
            <Icons.framerMotion isDarkMode={isDarkMode} />
          </Circle>
        </div>

        {/* Row 2 */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Icons.html isDarkMode={isDarkMode} />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.css isDarkMode={isDarkMode} />
          </Circle>
        </div>

        {/* Row 3 (Center) */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Icons.js isDarkMode={isDarkMode} />
          </Circle>
          
          <Circle
            ref={div4Ref}
            className={`cursor-target rounded-2xl w-[140px] h-[70px] sm:w-[280px] sm:h-[120px] transition-all duration-300 
            ${isDarkMode ? "bg-zinc-800" : "bg-zinc-200 "}`}
          >
            <span
              className={`whitespace-pre-wrap bg-clip-text text-center text-3xl sm:text-6xl md:text-8xl font-semibold font-lyrae leading-tight text-transparent ${
                isDarkMode
                  ? "bg-gradient-to-b from-zinc-100 to-zinc-900"
                  : "bg-gradient-to-b from-zinc-800 to-zinc-100"
              }`}
            >
              Skills
            </span>
          </Circle>

          <Circle ref={div6Ref}>
            <Icons.react isDarkMode={isDarkMode} />
          </Circle>
        </div>

        {/* Row 4 */}
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Icons.tailwind isDarkMode={isDarkMode} />
          </Circle>
          <Circle ref={div7Ref}>
            <Icons.laravel isDarkMode={isDarkMode} />
          </Circle>
        </div>
      </div>

      {/* Beams Kiri */}
      <AnimatedBeam containerRef={containerRef} fromRef={div8Ref} toRef={div4Ref} curvature={-30} endYOffset={-20} />
      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div4Ref} curvature={-15} endYOffset={-10} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div4Ref} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div4Ref} curvature={15} endYOffset={10} />

      {/* Beams Kanan */}
      <AnimatedBeam containerRef={containerRef} fromRef={div9Ref} toRef={div4Ref} curvature={-30} endYOffset={-20} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div4Ref} curvature={-15} endYOffset={-10} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div4Ref} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={div7Ref} toRef={div4Ref} curvature={15} endYOffset={10} reverse />
    </div>
  );
}

const Icons = {
  js: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#ffA828" : "#000"} viewBox="0 0 24 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#ffA828]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"></path>
    </svg>
  ),
  html: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#E34C26" : "#000"} viewBox="0 0 24 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#E34C26]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 18.1778L16.6192 16.9222L17.2434 10.1444H9.02648L8.82219 7.88889H17.4477L17.6747 5.67778H6.32535L6.96091 12.3556H14.7806L14.5195 15.2222L12 15.8889L9.48045 15.2222L9.32156 13.3778H7.0517L7.38083 16.9222L12 18.1778ZM3 2H21L19.377 20L12 22L4.62295 20L3 2Z"></path>
    </svg>
  ),
  tailwind: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#05DBE9" : "#000"} viewBox="0 0 24 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#05DBE9]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9996 4.85999C8.82628 4.85999 6.84294 6.44665 6.04961 9.61999C7.23961 8.03332 8.62794 7.43832 10.2146 7.83499C11.12 8.06109 11.7666 8.71757 12.4835 9.44545C13.6507 10.6295 15.0004 12 17.9496 12C21.1229 12 23.1063 10.4133 23.8996 7.23998C22.7096 8.82665 21.3213 9.42165 19.7346 9.02499C18.8292 8.79889 18.1827 8.1424 17.4657 7.41452C16.2995 6.23047 14.9498 4.85999 11.9996 4.85999ZM6.04961 12C2.87628 12 0.892943 13.5867 0.0996094 16.76C1.28961 15.1733 2.67794 14.5783 4.26461 14.975C5.17 15.2011 5.81657 15.8576 6.53354 16.5855C7.70073 17.7695 9.05039 19.14 11.9996 19.14C15.1729 19.14 17.1563 17.5533 17.9496 14.38C16.7596 15.9667 15.3713 16.5617 13.7846 16.165C12.8792 15.9389 12.2326 15.2824 11.5157 14.5545C10.3495 13.3705 8.99982 12 6.04961 12Z"></path>
    </svg>
  ),
  css: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#33B3F1" : "#000"} viewBox="0 0 24 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#33B3F1]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"></path>
    </svg>
  ),
  react: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#61DBFB" : "#000"} viewBox="0 0 24 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#61DBFB]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M14.448 16.2394C13.8809 17.0412 13.2933 17.7714 12.7015 18.4146C14.3738 20.0375 15.9291 20.7975 16.792 20.2993C17.6549 19.8011 17.7744 18.0742 17.2051 15.8145C16.3521 16.0054 15.426 16.1492 14.448 16.2394ZM13.138 16.3265C12.7641 16.342 12.3845 16.3499 12.0003 16.3499C11.6161 16.3499 11.2365 16.342 10.8627 16.3265C11.2394 16.8188 11.6208 17.2749 12.0003 17.6905C12.3798 17.2749 12.7612 16.8188 13.138 16.3265ZM18.1787 8.43278C20.8434 9.19718 22.5837 10.4672 22.5837 11.9999C22.5837 13.5325 20.8434 14.8026 18.1787 15.567C18.8491 18.2569 18.6193 20.399 17.292 21.1653C15.9647 21.9316 13.9947 21.0595 12.0003 19.134C10.006 21.0595 8.03596 21.9316 6.70866 21.1653C5.38136 20.399 5.15158 18.2569 5.82195 15.567C3.15724 14.8026 1.41699 13.5325 1.41699 11.9999C1.41699 10.4672 3.15724 9.19718 5.82195 8.43278C5.15158 5.74288 5.38136 3.60075 6.70866 2.83443C8.03596 2.06811 10.006 2.94019 12.0003 4.86569C13.9947 2.94019 15.9647 2.06811 17.292 2.83443C18.6193 3.60075 18.8491 5.74288 18.1787 8.43278ZM17.2051 8.18527C17.7744 5.92558 17.6549 4.19865 16.792 3.70046C15.9291 3.20226 14.3738 3.96221 12.7015 5.58509C13.2933 6.2283 13.8809 6.95849 14.448 7.76031C15.426 7.85054 16.3521 7.99432 17.2051 8.18527ZM6.79554 15.8145C6.22624 18.0742 6.34577 19.8011 7.20866 20.2993C8.07155 20.7975 9.62688 20.0375 11.2992 18.4146C10.7073 17.7714 10.1197 17.0412 9.55262 16.2394C8.57467 16.1492 7.6485 16.0054 6.79554 15.8145ZM10.8627 7.67324C11.2365 7.65776 11.6161 7.64987 12.0003 7.64987C12.3845 7.64987 12.7641 7.65776 13.138 7.67324C12.7612 7.18096 12.3798 6.7248 12.0003 6.30922C11.6208 6.7248 11.2394 7.18096 10.8627 7.67324ZM9.55262 7.76031C10.1197 6.95849 10.7073 6.2283 11.2992 5.58509C9.62688 3.96221 8.07155 3.20226 7.20866 3.70046C6.34577 4.19865 6.22624 5.92558 6.79554 8.18527C7.6485 7.99432 8.57467 7.85054 9.55262 7.76031ZM13.8939 15.2797C14.2395 14.7728 14.5772 14.2366 14.9015 13.6749C15.2258 13.1131 15.5213 12.5526 15.7875 11.9999C15.5213 11.4471 15.2258 10.8866 14.9015 10.3249C14.5772 9.76311 14.2395 9.22694 13.8939 8.72005C13.2821 8.6742 12.649 8.64987 12.0003 8.64987C11.3517 8.64987 10.7185 8.6742 10.1067 8.72005C9.76112 9.22694 9.42347 9.76311 9.09914 10.3249C8.77481 10.8866 8.4793 11.4471 8.21312 11.9999C8.4793 12.5526 8.77481 13.1131 9.09914 13.6749C9.42347 14.2366 9.76112 14.7728 10.1067 15.2797C10.7185 15.3255 11.3517 15.3499 12.0003 15.3499C12.649 15.3499 13.2821 15.3255 13.8939 15.2797ZM15.1785 15.1484C15.7932 15.0683 16.3789 14.9661 16.9286 14.8452C16.7584 14.3087 16.5541 13.7504 16.3161 13.178C16.1426 13.5095 15.9596 13.8421 15.7675 14.1749C15.5754 14.5076 15.3788 14.8324 15.1785 15.1484ZM8.82218 8.85133C8.20747 8.93147 7.62174 9.03367 7.07208 9.15454C7.24223 9.691 7.44659 10.2494 7.68454 10.8218C7.85806 10.4903 8.04101 10.1576 8.23311 9.82487C8.42522 9.49212 8.62185 9.16736 8.82218 8.85133ZM7.07208 14.8452C7.62174 14.9661 8.20747 15.0683 8.82218 15.1484C8.62185 14.8324 8.42522 14.5076 8.23311 14.1749C8.04101 13.8421 7.85806 13.5095 7.68454 13.178C7.44659 13.7504 7.24223 14.3087 7.07208 14.8452ZM6.09439 14.6C6.35551 13.7659 6.69407 12.8919 7.10491 11.9999C6.69407 11.1078 6.35551 10.2339 6.09439 9.39969C3.85279 10.0365 2.41699 11.0035 2.41699 11.9999C2.41699 12.9962 3.85279 13.9632 6.09439 14.6ZM16.9286 9.15454C16.3789 9.03367 15.7932 8.93147 15.1785 8.85133C15.3788 9.16736 15.5754 9.49212 15.7675 9.82487C15.9596 10.1576 16.1426 10.4903 16.3161 10.8218C16.5541 10.2494 16.7584 9.691 16.9286 9.15454ZM17.9063 9.39969C17.6451 10.2339 17.3066 11.1078 16.8957 11.9999C17.3066 12.8919 17.6451 13.7659 17.9063 14.6C20.1479 13.9632 21.5837 12.9962 21.5837 11.9999C21.5837 11.0035 20.1479 10.0365 17.9063 9.39969ZM12.0003 13.879C10.9625 13.879 10.1212 13.0377 10.1212 11.9999C10.1212 10.962 10.9625 10.1207 12.0003 10.1207C13.0382 10.1207 13.8795 10.962 13.8795 11.9999C13.8795 13.0377 13.0382 13.879 12.0003 13.879Z"></path>
    </svg>
  ),
  laravel: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#F55247" : "#000"} viewBox="0 0 34 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#F55247]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M13.143 23.585l10.46-5.97-4.752-2.736-10.453 6.019zM24.084 11.374l-4.757-2.736v5.417l4.758 2.737zM24.559 5.078l-4.756 2.736 4.756 2.736 4.755-2.737zM9.911 18.928l2.76-1.589v-11.934l-4.758 2.738v11.934zM7.437 1.846l-4.756 2.737 4.756 2.737 4.753-2.737zM2.204 5.406v18.452l10.464 6.022v-5.471l-5.472-3.096l-0.051-0.039l-0.044-0.034l-0.039-0.049l-0.035-0.045l-0.024-0.055l-0.022-0.051l-0.010-0.070l-0.008-0.051v-12.759l-2.757-1.59zM24.085 23.857v-5.422l-10.464 5.974v5.47zM29.789 14.055v-5.417l-4.756 2.737v5.417zM30.725 7.69c0.011 0.038 0.018 0.081 0.018 0.126v6.513c-0 0.176-0.095 0.329-0.237 0.411l-5.468 3.149v6.241c-0 0.175-0.095 0.328-0.236 0.411l-11.416 6.57c-0.024 0.013-0.052 0.025-0.081 0.033l-0.030 0.013c-0.036 0.011-0.078 0.017-0.121 0.017s-0.085-0.006-0.125-0.018l-0.039-0.016l-0.082-0.033l-11.413-6.57c-0.144-0.084-0.239-0.237-0.239-0.412v-19.548c0-0.044 0.007-0.087 0.019-0.127l0.018-0.040c0.009-0.029 0.019-0.053 0.030-0.076l0.029-0.042l0.042-0.057l0.047-0.034c0.018-0.015 0.034-0.030 0.052-0.043h0.001l5.708-3.285c0.068-0.040 0.15-0.064 0.237-0.064s0.169 0.024 0.239 0.065l5.71 3.285c0.019 0.013 0.035 0.027 0.051 0.042l0.048 0.034c0.016 0.018 0.025 0.038 0.042 0.057l0.031 0.041l0.029 0.069l0.016 0.040c0.011 0.035 0.018 0.076 0.018 0.118v12.208l4.756-2.737v-6.241c0-0.043 0.006-0.085 0.017-0.125l0.016-0.040c0.010-0.030 0.020-0.054 0.032-0.078l0.032-0.042l0.042-0.054l0.045-0.035l0.052-0.040h0.001l5.708-3.286c0.068-0.040 0.15-0.064 0.237-0.064s0.169 0.024 0.239 0.065l5.708 3.286c0.020 0.013 0.034 0.027 0.053 0.039l0.046 0.035l0.043 0.056l0.030 0.040l0.030 0.073l0.019 0.039z" />
    </svg>
  ),
  gsap: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#88CE02" : "#000"} viewBox="0 0 80 35" className={`h-10 w-24 sm:w-30 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#88CE02]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M23.81 14.013v.013l-1.075 4.665c-.058.264-.322.458-.626.458H20.81a.218.218 0 0 0-.208.155c-1.198 4.064-2.82 6.858-4.962 8.535-1.822 1.428-4.068 2.093-7.069 2.093-2.696 0-4.514-.867-6.056-2.578C.478 25.09-.364 21.388.146 16.926 1.065 8.549 5.41.096 13.776.096c2.545-.023 4.543.762 5.933 2.33 1.47 1.657 2.216 4.154 2.22 7.421a.55.55 0 0 1-.549.536h-6.13a.42.42 0 0 1-.407-.41c-.05-2.259-.72-3.36-2.052-3.36-2.35 0-3.736 3.19-4.471 4.959-1.027 2.47-1.55 5.152-1.447 7.824.049 1.244.249 2.994 1.43 3.718 1.047.643 2.541.217 3.446-.495.904-.711 1.632-1.942 1.938-3.065.043-.156.046-.277.005-.332-.043-.055-.162-.068-.253-.068h-1.574a.572.572 0 0 1-.438-.202.42.42 0 0 1-.087-.362l1.076-4.674c.053-.24.27-.42.537-.453v-.011h10.33c.024 0 .049 0 .072.005.268.034.457.284.452.556h.002Z"/>
      <path d="M41.594 8.65a.548.548 0 0 1-.548.531H35.4c-.37 0-.679-.3-.679-.665 0-1.648-.57-2.45-1.736-2.45s-1.918.717-1.94 1.968c-.025 1.395.764 2.662 3.01 4.84 2.957 2.774 4.142 5.232 4.085 8.48C38.047 26.605 34.476 30 29.042 30c-2.775 0-4.895-.743-6.305-2.207-1.431-1.486-2.087-3.668-1.95-6.485a.548.548 0 0 1 .549-.53h5.84a.55.55 0 0 1 .422.209.48.48 0 0 1 .106.384c-.065 1.016.112 1.775.512 2.195.256.272.613.41 1.058.41 1.079 0 1.711-.763 1.735-2.09.02-1.148-.343-2.155-2.321-4.19-2.555-2.496-4.846-5.075-4.775-9.13.042-2.351.976-4.502 2.631-6.056C28.294.868 30.687 0 33.465 0c2.783.02 4.892.813 6.269 2.359 1.304 1.466 1.932 3.582 1.862 6.29h-.002Z"/>
      <path d="m59.096 29.012.037-27.932a.525.525 0 0 0-.529-.533h-8.738l-.507.42L36.707 28.842v.005l-.005.006c-.14.343.126.71.497.71h6.108c.33 0 .548-.1.656-.308l1.213-2.915l.601-.424h5.836c.406 0 .415.008.408.405l-.131 2.71a.525.525 0 0 0 .529.532h6.17a.522.522 0 0 0 .403-.182.458.458 0 0 0 .104-.369Zm-10.81-9.326c-.057 0-.102-.001-.138-.005a.146.146 0 0 1-.13-.183l4.377-10.827l.136-.314c.071-.145.157-.155.184-.047c.023.09-.502 11.118-.502 11.118c-.041.413-.06.43-.467.464l-3.509-.041h-.008l.003-.002Z"/>
      <path d="M71.545.547h-4.639c-.245 0-.52.13-.585.422l-6.455 28.029a.423.423 0 0 0 .088.364.572.572 0 0 0 .437.202h5.798c.311 0 .525-.153.583-.418l.704-3.178c.05-.247-.036-.439-.258-.555c-.105-.054-.209-.108-.312-.163l-1.005-.522l-1-.522l-.387-.201a.186.186 0 0 1-.102-.17a.199.199 0 0 1 .198-.194l3.178.014c.95.005 1.901-.062 2.836-.234 6.58-1.215 10.95-6.485 11.076-13.656.107-6.12-3.309-9.221-10.15-9.221l-.005.003Zm-1.579 16.68h-.124c-.278 0-.328-.03-.337-.04c-.004-.007 1.833-8.073 1.834-8.084c.047-.233.045-.367-.099-.446c-.184-.102-2.866-1.516-2.866-1.516a.188.188 0 0 1-.101-.172a.197.197 0 0 1 .197-.192h4.241c1.32.04 2.056 1.221 2.021 3.237-.061 3.492-1.721 7.09-4.766 7.214Z"/>
    </svg>
  ),
  framerMotion: ({ isDarkMode }: { isDarkMode: boolean }) => (
    <svg  fill={isDarkMode ? "#ffffff" : "#000"} viewBox="0 0 24 24" className={`h-16 w-16 sm:h-20 sm:w-20 cursor-target hover:scale-110 transition-transform duration-200 ${isDarkMode ? "drop-shadow-[0_0_30px_#ffffff]" : ""}`} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z"></path>
    </svg>
  ),
};