import React, { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// 1. Tetap gunakan Static Import untuk komponen yang muncul di atas (LCP)
import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import ScrollProgress from "./components/Home/ScrollProgress";
import TargetCursor from "./components/Shared/TargetCursor";
import Preloader from "./components/Preloader";
import SmoothScrollWrapper from "./layouts/GSAPSmoothScrollWrapper";
import Hero from "./components/Home/hero";

// 2. LAZY LOADING untuk komponen berat (Menghancurkan Chunk 8MB)
const Hero2 = lazy(() => import("./components/Shared/TextPressure"));
const About = lazy(() => import("./layouts/about"));
const Project = lazy(() => import("./layouts/project"));
const AllProjects = lazy(() => import("./layouts/AllProjects"));
const Certificates = lazy(() => import("./layouts/Certificates"));
const Scanner = lazy(() => import("./components/WebsiteSecurityScanner"));
const Timeline = lazy(() => import("./layouts/timeline"));
const Chatbot = lazy(() => import("./components/Chatbot/Chatbot"));


// Analytics
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./index.css";
import "./assets/tailwind.css";

const SESSION_KEY = 'has_loaded_once';

function App() {
  const [isLoading, setIsLoading] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) !== 'true';
  });

  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      window.scrollTo(0, 0);

      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem(SESSION_KEY, 'true');
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const onPreloaderExitComplete = () => {
    document.body.style.overflow = '';
    document.body.style.height = ''; 
    document.body.style.cursor = 'default';
  };

  return (
    <ThemeProvider>
      <TargetCursor spinDuration={1.1} hideDefaultCursor={true} parallaxOn={true} />

      <AnimatePresence mode="wait" onExitComplete={onPreloaderExitComplete}>
        {isLoading && <Preloader key="preloader" />}
      </AnimatePresence>

      {!isLoading && <Header />}

      <SmoothScrollWrapper>
        <main className="relative z-0 min-h-screen w-full cursor-none bg-background text-foreground">
          {/* 3. SUSPENSE: Menangani loading state saat komponen lazy diunduh */}
          <Suspense fallback={<div className="h-screen w-full bg-background" />}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <>
                    <Hero /> {/* Render cepat karena static import */}
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
          </Suspense>
          <Footer />
        </main>
      </SmoothScrollWrapper>

      {!isLoading && <ScrollProgress />}
      {!isLoading && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}

      <SpeedInsights />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;