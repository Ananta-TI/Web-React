// src/App.jsx
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Import Components
import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import ScrollProgress from "./components/Home/ScrollProgress";
import TargetCursor from "./components/Shared/TargetCursor";
import Preloader from "./components/Preloader"; 
import SmoothScrollWrapper from "./layouts/GSAPSmoothScrollWrapper";

// Import Halaman Utama
import Hero from "./components/Home/hero";
import Hero2 from "./components/Shared/TextPressure";
import About from "./layouts/about";
import Project from "./layouts/project";
import AllProjects from "./layouts/AllProjects";
import Certificates from "./layouts/Certificates";
import Scanner from "./layouts/scanner";
// import ScannerCharts from "./layouts/scannerChart";
import Timeline from "./layouts/timeline";

// Vercel Analytics/Speed Insights
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./index.css";
import "./assets/tailwind.css";

// Tentukan kunci Session Storage
const SESSION_KEY = 'has_loaded_once';

function App() {
  // 1. INICIALISASI STATE: Cek Session Storage
  const initialLoadStatus = sessionStorage.getItem(SESSION_KEY) !== 'true';
  const [isLoading, setIsLoading] = useState(initialLoadStatus);

  // LOGIKA PRELOADER
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      
      const minLoadTime = 6000;
      const startTime = Date.now();

      const timer = setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minLoadTime - elapsedTime;

        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem(SESSION_KEY, 'true'); 
        }, remainingTime > 0 ? remainingTime : 0);
      }, 100);

      return () => clearTimeout(timer); 
    } else {
      document.body.style.overflow = 'unset';
    }

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
      <SmoothScrollWrapper>

          <Routes>
            {/* Halaman utama (Home) */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Hero2 />
                  <About />
                  {/* <ScannerCharts /> */}
                  <Project />
                </>
              }
            />

            {/* Halaman-halaman terpisah */}
            <Route path="/Scanner" element={<Scanner />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/all-projects" element={<AllProjects />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>

          <Footer />
      </SmoothScrollWrapper>
          <ScrollProgress />
        </div>
        
        {/* Vercel Insights & Analytics */}
        <SpeedInsights />
        <Analytics />
    </ThemeProvider>
  );
}

export default App;