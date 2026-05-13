import React, { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import SmoothScrollWrapper from "./layouts/SmoothScrollWrapper";
import { PageTransitionProvider } from "./components/Shared/PageTransition";

import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import ScrollToTop from "./components/Shared/ScrollToTop";
import HomePage from "./pages/HomePage";

import "./index.css";
import "./assets/tailwind.css";

const Preloader = lazy(() => import("./components/Preloader"));
const TargetCursor = lazy(() => import("./components/Shared/TargetCursor"));
const ScrollProgress = lazy(() => import("./components/Home/ScrollProgress"));
const AllProjects = lazy(() => import("./layouts/AllProjects"));
const Certificates = lazy(() => import("./layouts/Certificates"));
const Scanner = lazy(() => import("./components/WebsiteSecurityScanner"));
const Timeline = lazy(() => import("./layouts/timeline"));
const Art = lazy(() => import("./layouts/Art"));
const Activity = lazy(() => import("./layouts/activity"));

const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((mod) => ({
    default: mod.Analytics,
  }))
);

const SpeedInsights = lazy(() =>
  import("@vercel/speed-insights/react").then((mod) => ({
    default: mod.SpeedInsights,
  }))
);

const SESSION_KEY = "has_loaded_once";
const PRELOADER_DURATION = 900;

function getInitialLoadingState() {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "true";
  } catch {
    return false;
  }
}

function useFancyCursorEnabled(isLoading) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const media = window.matchMedia("(pointer: fine) and (min-width: 1024px)");

    const activate = () => {
      setEnabled(media.matches);
    };

    let timeoutId;
    let idleId;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(activate, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(activate, 1200);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  return enabled;
}

function IdleOnly({ children, delay = 1200 }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId;
    let idleId;

    const activate = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(activate, {
        timeout: delay + 1500,
      });
    } else {
      timeoutId = window.setTimeout(activate, delay);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delay]);

  return ready ? children : null;
}

function PageFallback() {
  return <div className="min-h-screen w-full bg-background" />;
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

function App() {
  const [isLoading, setIsLoading] = useState(getInitialLoadingState);
  const location = useLocation();
  const cursorEnabled = useFancyCursorEnabled(isLoading);

  useEffect(() => {
    if (!isLoading) return;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    window.scrollTo(0, 0);

    const timer = window.setTimeout(() => {
      setIsLoading(false);

      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // Abaikan jika sessionStorage diblokir browser.
      }
    }, PRELOADER_DURATION);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.cursor = "";
    };
  }, [isLoading]);

  const onPreloaderExitComplete = () => {
    document.body.style.overflow = "";
    document.body.style.height = "";
    document.body.style.cursor = "";
  };

  return (
    <ThemeProvider>
      <PageTransitionProvider>
        {cursorEnabled && (
          <Suspense fallback={null}>
            <TargetCursor
              spinDuration={1.1}
              hideDefaultCursor={true}
              parallaxOn={true}
            />
          </Suspense>
        )}

        <AnimatePresence mode="wait" onExitComplete={onPreloaderExitComplete}>
          {isLoading && (
            <Suspense fallback={null}>
              <Preloader key="preloader" />
            </Suspense>
          )}
        </AnimatePresence>

        {!isLoading && <Header />}

        <SmoothScrollWrapper>
          <main
            className={`relative z-0 min-h-screen w-full bg-background text-foreground ${
              cursorEnabled ? "cursor-none" : "cursor-auto"
            }`}
          >
            <ScrollToTop />

            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage isAppLoading={isLoading} />} />

              <Route
                path="/scanner"
                element={
                  <LazyPage>
                    <Scanner />
                  </LazyPage>
                }
              />

              <Route
                path="/timeline"
                element={
                  <LazyPage>
                    <Timeline />
                  </LazyPage>
                }
              />

              <Route
                path="/all-projects"
                element={
                  <LazyPage>
                    <AllProjects />
                  </LazyPage>
                }
              />

              <Route
                path="/certificates"
                element={
                  <LazyPage>
                    <Certificates />
                  </LazyPage>
                }
              />

              <Route
                path="/art"
                element={
                  <LazyPage>
                    <Art />
                  </LazyPage>
                }
              />

              <Route
                path="/activity"
                element={
                  <LazyPage>
                    <Activity />
                  </LazyPage>
                }
              />
            </Routes>

            <Footer />
          </main>
        </SmoothScrollWrapper>

        {!isLoading && (
          <IdleOnly delay={800}>
            <Suspense fallback={null}>
              <ScrollProgress />
            </Suspense>
          </IdleOnly>
        )}

        <IdleOnly delay={1600}>
          <Suspense fallback={null}>
            <SpeedInsights />
            <Analytics />
          </Suspense>
        </IdleOnly>
      </PageTransitionProvider>
    </ThemeProvider>
  );
}

export default App;