import React, { useContext, lazy, Suspense } from "react"; // Tambahkan React, lazy, dan Suspense
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";

// Import LiquidEther diubah menjadi import dinamis (Code Splitting)
const LiquidEther = lazy(() => import('./LiquidEther')); 

// import { ChevronDown } from "lucide-react";
import Magnet from "./magnet"; // Import komponen Magnet


export default function Hero() {
  const { isDarkMode } = useContext(ThemeContext);
// Biasanya, window.scrollTo(0, 0) lebih baik ditempatkan di useEffect 
// atau di App.jsx jika Anda ingin memastikan ini hanya berjalan sekali, 
// tapi saya biarkan di sini sesuai kode Anda:

  return (
    <section
      id="home"
      className={`relative min-h-180 flex flex-col items-center justify-center overflow-hidden text-center sm:px-6 lg:px-8 ${
isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* Background LiquidEther Dibalut Suspense */}
      <div style={{ width: '100%', height: 800, position: 'absolute' }}>
          {/* Fallback=null memastikan tidak ada yang dirender saat memuat. 
          LiquidEther akan dimuat secara asinkron (tidak memblokir render utama). */}
          <Suspense fallback={null}>
              <LiquidEther
                  colors={[ '#171717', '#fff', '#fff' ]}
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
          <div className="relative w-70 h-40 overflow-hidden  cursor-none md:w-96 md:h-76">
            <img
  key={isDarkMode}
// Ganti ke .avif (atau WebP) dan pastikan sudah di-resize
  src={isDarkMode ? "../img/logo1.avif" : "../img/logo3.avif"} 
  alt="Ananta Firdaus"
// ATRIBUT LCP KRITIS
fetchpriority="high" 
  loading="eager" 
//   style={{
//      animation: "scale-in-hor-center 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
//   }}
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