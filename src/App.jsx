// src/App.jsx
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Import Components
import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import ScrollProgress from "./components/Home/ScrollProgress";
import TargetCursor from "./components/Shared/TargetCursor";
import Preloader from "./components/Preloader"; // Pastikan ini komponen Preloader "Curtain" tadi
import SmoothScrollWrapper from "./layouts/GSAPSmoothScrollWrapper";

// Import Halaman
import Hero from "./components/Home/hero";
import Hero2 from "./components/Shared/TextPressure";
import About from "./layouts/about";
import Project from "./layouts/project";
import AllProjects from "./layouts/AllProjects";
import Certificates from "./layouts/Certificates";
import Scanner from "./components/WebsiteSecurityScanner";
import Timeline from "./layouts/timeline";

// Analytics
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./index.css";
import "./assets/tailwind.css";

const SESSION_KEY = 'has_loaded_once';

function App() {
  // 1. STATE MANAGEMENT
  // Cek apakah user baru pertama kali buka atau refresh
  const [isLoading, setIsLoading] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) !== 'true';
  });

  const location = useLocation(); // Untuk reset scroll saat pindah page (opsional)

  // 2. LOGIKA TIMER PRELOADER
  useEffect(() => {
    if (isLoading) {
      // Kunci Scroll SEGERA saat loading dimulai
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh'; // Extra proteksi biar gak bisa scroll
      window.scrollTo(0, 0); // Pastikan posisi di paling atas

      // Simulasi loading time (Misal 2.5 detik cukup, 6 detik terlalu lama buat UX)
      // Sesuaikan durasi ini dengan durasi animasi kata-kata di Preloader kamu
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem(SESSION_KEY, 'true');
      }, 3500); // 3.5 detik (Waktu baca teks preloader)

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 3. HANDLE SAAT PRELOADER SELESAI ANIMASI (PENTING!)
  // Fungsi ini akan dipanggil oleh AnimatePresence SETELAH animasi exit selesai
  const onPreloaderExitComplete = () => {
    document.body.style.overflow = ''; // Hapus style inline (kembali ke CSS default)
    document.body.style.height = ''; 
    document.body.style.cursor = 'default';
    
    // Trigger refresh GSAP/ScrollTrigger jika perlu, biar ukurannya pas
    // ScrollTrigger.refresh(); 
  };

  return (
    <ThemeProvider>
      {/* Target Cursor tetap jalan di atas segalanya */}
      <TargetCursor spinDuration={1.1} hideDefaultCursor={true} parallaxOn={true} />

      {/* ANITMATE PRESENCE:
         mode="wait": Menunggu exit selesai baru unmount total.
         onExitComplete: Ini rahasia agar tidak bentrok. Scroll baru dibuka disini.
      */}
      <AnimatePresence mode="wait" onExitComplete={onPreloaderExitComplete}>
        {isLoading && <Preloader key="preloader" />}
      </AnimatePresence>

      {/* HEADER: 
         Opsional: Bisa disembunyikan saat isLoading jika mau, 
         tapi biasanya Header dibiarkan di belakang preloader.
      */}
      {!isLoading && <Header />}

      {/* SMOOTH SCROLL WRAPPER:
         Render konten tetap berjalan di background supaya layout siap.
      */}
      <SmoothScrollWrapper>
        <main className="relative z-0 min-h-screen w-full cursor-none bg-background text-foreground">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <Hero2 />
                    <About />
                    <Project />
                  </>
                }
              />
              <Route path="/Scanner" element={<Scanner />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/all-projects" element={<AllProjects />} />
              <Route path="/certificates" element={<Certificates />} />
            </Routes>
        <Footer />
        </main>
        
        {/* Footer dimasukkan dalam wrapper scroll agar ikut smooth scroll */}
      </SmoothScrollWrapper>

      {/* Komponen overlay UI */}
      {!isLoading && <ScrollProgress />}
      
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;