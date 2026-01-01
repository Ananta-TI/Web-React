import React, { useContext, lazy, Suspense } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";

// Import LiquidEther diubah menjadi import dinamis (Code Splitting)
const LiquidEther = lazy(() => import('./LiquidEther')); 
// const Lightning  = lazy(() => import('./Lightning')); 

// import { ChevronDown } from "lucide-react";
import Magnet from "./magnet"; // Import komponen Magnet

export default function Hero() {
  const { isDarkMode } = useContext(ThemeContext);
  
  // Theme-aware colors for LiquidEther
  const liquidEtherColors = isDarkMode 
    ? ['#171717', '#ffffff', '#1a1a1a'] // Dark theme: black, white, blue accent
    : ['#f5f5f5', '#1a1a1a', '#ffffff']; // Light theme: light gray, dark gray, blue accent
 
  return (
    <section
      id="home"
      className={`relative min-h-180 flex flex-col items-center justify-center overflow-hidden text-center sm:px-6 lg:px-8 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* Background LiquidEther dengan Theme-Aware Colors */}
      <div style={{ width: '100%', height: 800, position: 'absolute' }}>
        <Suspense fallback={null}>
          <LiquidEther
            colors={liquidEtherColors}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </Suspense> 
      </div>

      {/* Hero Content (Konten Kritis) */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Foto dengan Magnet Effect */}
        <Magnet magnetStrength={4}>
          <div className="relative w-70 h-40 overflow-hidden  cursor-none md:w-96 md:h-76">
            <img
              key={isDarkMode}
              // Ganti ke .avif (atau WebP) dan pastikan sudah di-resize
              src={isDarkMode ? "../img/logo1.avif" : "../img/logo3.avif"} 
              alt="Ananta Firdaus"
              // ATRIBUT LCP KRITIS
              fetchpriority="high" 
              loading="eager" 
              className="object-cover w-full h-full"
            />
          </div>
        </Magnet>

        <h1 className="mt-6 text-9xl font-MailBox md:text-9xl">@nanta Firdaus</h1>
        <p className=" mx-auto mt-4 text-lg opacity-80 font-mono">
          Developing and designing the next generation of web applications.
        </p>
      </motion.div>

      {/* Scroll Indicator */}
      {/* <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 10 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        className="absolute z-10 bottom-10"
      >
        <ChevronDown size={32} />
      </motion.div> */}

      {/* Bottom Gradient Separator */}
      <div
        className={`absolute bottom-0 left-0 w-full h-40 z-30 pointer-events-none ${
          isDarkMode
            ? "bg-gradient-to-b from-transparent to-zinc-900"
            : "bg-gradient-to-b from-transparent to-[#faf9f9]"
        }`}
      />
    </section>
  );
}