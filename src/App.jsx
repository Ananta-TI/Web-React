// src/App.jsx

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion"; // <-- PENTING: Untuk animasi keluar preloader

// Import Components
import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import ScrollProgress from "./components/Home/ScrollProgress";
import TargetCursor from "./components/Shared/TargetCursor";
import Preloader from "./components/Preloader"; 
import SmoothScrollWrapper from "./components/SmoothScrollWrapper";

// Import Halaman Utama
import Hero from "./components/Home/hero";
import Hero2 from "./components/Shared/TextPressure";
import About from "./layouts/about";
import Project from "./layouts/project";
import AllProjects from "./layouts/AllProjects";
import Certificates from "./layouts/Certificates";
import Scanner from "./layouts/scanner";
import ScannerCharts from "./layouts/scannerChart";
import Timeline from "./layouts/timeline";
// import Contact from "./layouts/contact/contact.jsx"; // Tidak digunakan di Route utama

// Vercel Analytics/Speed Insights
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./index.css";
import "./assets/tailwind.css";

// Tentukan kunci Session Storage
const SESSION_KEY = 'has_loaded_once';

function App() {
  // 1. INICIALISASI STATE: Cek Session Storage
  // Jika has_loaded_once ada di session storage, atur isLoading ke false secara instan.
  const initialLoadStatus = sessionStorage.getItem(SESSION_KEY) !== 'true';
  const [isLoading, setIsLoading] = useState(initialLoadStatus);

  // LOGIKA PRELOADER
  useEffect(() => {
    // 2. KONTROL SCROLL BODY & Session Storage
    if (isLoading) {
      document.body.style.overflow = 'hidden'; // Nonaktifkan scrolling saat loading
      
      // Jika ini adalah loading pertama (dan sedang berjalan)
      const minLoadTime = 6000; // Sesuaikan dengan durasi Preloader.jsx Anda (3 detik)
      const startTime = Date.now();

      const timer = setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minLoadTime - elapsedTime;

        setTimeout(() => {
          setIsLoading(false);
          // SET SESSION STORAGE setelah loading Selesai
          sessionStorage.setItem(SESSION_KEY, 'true'); 
        }, remainingTime > 0 ? remainingTime : 0);
      }, 100); // Mulai hitungan mundur sebentar

      // Cleanup timer
      return () => clearTimeout(timer); 

    } else {
      // Saat loading selesai
      document.body.style.overflow = 'unset'; // Aktifkan kembali scrolling
    }

    // Cleanup scroll jika komponen di-unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLoading]);
  return (
    <ThemeProvider>
      <TargetCursor spinDuration={1.1} hideDefaultCursor={true} parallaxOn={false} />

      <AnimatePresence mode="wait"> 
        {isLoading && <Preloader key="preloader" />}
      </AnimatePresence>

      <div className={isLoading ? "opacity-0 invisible" : "opacity-100 visible transition-opacity duration-1000"}>
        <Header />

        <Routes>
          {/* Halaman utama (Home) */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Hero2 />
                <About />
                <ScannerCharts />
                <Project />
                {/* Pastikan tidak ada komponen yang tidak seharusnya di-mount di Home */}
              </>
            }
          />

          {/* Halaman-halaman terpisah */}
          <Route path="/Scanner" element={<Scanner />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/all-projects" element={<AllProjects />} />
          <Route path="/certificates" element={<Certificates />} />
        </Routes>

        <ScrollProgress />
        <Footer />
        
      </div>
      
      {/* Vercel Insights & Analytics (Ditaruh di luar conditional loading) */}
      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;