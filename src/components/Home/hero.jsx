import React, { useContext, lazy, Suspense } from "react";
import { ThemeContext } from "../../context/ThemeContext";
// Tambahkan useSpring dari framer-motion
import { motion, useScroll, useTransform, useSpring } from "framer-motion"; 
import MergedShapes from "./MergedShape";
import LocationBadge from '../LocationBadge';

const Particles = lazy(() => import("./particles"));

export default function Hero({ isAppLoading }) {
  const { isDarkMode } = useContext(ThemeContext);
  const shapeColor = isDarkMode ? "#ffffff" : "#1a1a1a";

  // --- LOGIKA PARALLAX YANG SUPER SMOOTH ---
  const { scrollY } = useScroll();
  
  // 1. Transform nilai scroll mentah ke jarak pergerakan
  const yParallaxRaw = useTransform(scrollY, [0, 1000], [0, -450]);
  
  // 2. Bungkus dengan useSpring biar ada momentum & nggak kaku!
  const yParallaxSmooth = useSpring(yParallaxRaw, { 
    stiffness: 100, // Kekakuan pegas (makin kecil makin lambat ngikutin)
    damping: 30,    // Rem pegas (makin besar makin nggak memantul)
    restDelta: 0.001 
  });

  return (
    <section
      id="home"
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-4 touch-pan-y overflow-hidden ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      <Suspense fallback={null}>
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleColors={["#ffffff", "#ffffff", "#ffffff"]}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={120}
          sizeRandomness={5.2}
          cameraDistance={25}
          className="absolute inset-0 z-0 w-full h-full"
        />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={!isAppLoading ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="scale-50 sm:scale-75 md:scale-90 lg:scale-100 origin-center transition-transform duration-500">
          <MergedShapes fill={shapeColor} startAnimation={!isAppLoading} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={!isAppLoading ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 3.2, duration: 1 }}
          className="mt-12"
        >
          {/* Teks atau konten lain bisa ditaruh di sini nantinya */}
        </motion.div>
      </motion.div>

      {/* Gradien Bawah */}
      <div
        className={`absolute bottom-0 left-0 w-full h-40 z-20 pointer-events-none bg-gradient-to-b from-transparent ${
          isDarkMode ? "to-zinc-900" : "to-[#faf9f9]"
        }`}
      />

      {/* Wrapper LocationBadge Mentok Kiri dengan SMOOTH PARALLAX */}
      <motion.div
        // Gunakan nilai y yang sudah di-smooth
        style={{ y: yParallaxSmooth }}
        initial={{ opacity: 0, x: -100 }} 
        animate={!isAppLoading ? { opacity: 1, x: 0 } : { opacity: 0 }}
        // Delay 3.2s memastikan dia masuk SETELAH MergedShapes selesai merender animasinya
        transition={{ delay: 3.2, duration: 1.2, type: "spring", damping: 14 }}
        className="absolute left-0 bottom-[15%] z-50"
      >
        <LocationBadge isDarkMode={isDarkMode} />
      </motion.div>       
    </section>
  );
}