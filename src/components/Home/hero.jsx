import React, { useContext, lazy, Suspense } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import Magnet from "./magnet";

const LiquidEther = lazy(() => import('./LiquidEther')); 

export default function Hero() {
  const { isDarkMode } = useContext(ThemeContext);
  
  const liquidEtherColors = isDarkMode 
    ? ['#171717', '#ffffff', '#1a1a1a'] 
    : ['#f5f5f5', '#1a1a1a', '#ffffff'];
 
return (
    <section
      id="home"
      // PERBAIKAN DI SINI:
      // 1. Hapus "style={{...}}" dari dalam string className
      // 2. Gunakan style sebagai prop terpisah (opsional jika sudah ada class 'relative')
      className={`relative min-h-180 flex flex-col items-center justify-center overflow-hidden text-center sm:px-6 lg:px-8 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
      style={{ position: 'relative' }} // Pastikan ini menjadi prop sendiri
    >
      {/* Background LiquidEther */}
      {/* <div style={{ width: '100%', height: 800, position: 'absolute' }}>
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
      </div> */}

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        // Pastikan element ini juga relative agar context stacking-nya benar
        className="relative z-10 flex flex-col items-center" 
      >
        {/* Foto dengan Magnet Effect */}
        <Magnet magnetStrength={4}>
          <div className="relative w-70 h-40 overflow-hidden cursor-none md:w-96 md:h-76">
             {/* Kode gambar yang sudah diperbaiki sebelumnya... */}
             <img
              src="/img/logo3.avif" 
              alt="Ananta Firdaus"
              className={`absolute top-0 left-0 object-cover w-full h-full transition-opacity duration-500 ${
                isDarkMode ? "opacity-0" : "opacity-100"
              }`}
            />
            <img
              src="/img/logo1.avif"
              alt="Ananta Firdaus"
              className={`absolute top-0 left-0 object-cover w-full h-full transition-opacity duration-500 ${
                isDarkMode ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </Magnet>

        <h1 className="mt-6 text-9xl font-MailBox md:text-9xl">@nanta Firdaus</h1>
        <p className=" mx-auto mt-4 text-lg opacity-80 font-mono">
          Developing and designing the next generation of web applications.
        </p>
      </motion.div>

      {/* Bottom Separator */}
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