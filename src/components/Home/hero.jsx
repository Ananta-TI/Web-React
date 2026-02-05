import React, { useContext, lazy, Suspense } from "react"; // Tambahkan lazy & Suspense
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import MergedShapes from "./MergedShape";

// Ganti import statis menjadi lazy load
const Particles = lazy(() => import("./particles"));

export default function Hero({ isAppLoading }) {
  const { isDarkMode } = useContext(ThemeContext);
  const shapeColor = isDarkMode ? "#ffffff" : "#1a1a1a";

  return (
    <section
      id="home"
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-4 touch-pan-y overflow-hidden ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* Bungkus Particles dengan Suspense agar tidak memblokir render utama */}
      <Suspense fallback={null}>
        <Particles
          particleCount={window.innerWidth < 768 ? 30 : 60} // KURANGI SEDIKIT JUMLAH PARTIKEL (Opsional, tapi disarankan)
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
        {/* <h1 className="text-2xl font-bold uppercase tracking-widest opacity-90">
          Ananta Firdaus
        </h1>
        <p className="mt-4 text-sm md:text-base opacity-60 font-mono max-w-sm">
          Developing and designing the next generation of web applications.
        </p> */}
      </motion.div>
    </motion.div>

    <div
      className={`absolute bottom-0 left-0 w-full h-40 z-20 pointer-events-none bg-gradient-to-b from-transparent ${
        isDarkMode ? "to-zinc-900" : "to-[#faf9f9]"
      }`}
    />
  </section>
);
}