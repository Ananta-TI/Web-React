import React, {
  useContext,
  useEffect,
  lazy,
  Suspense,
  useState,
  useRef,
  memo,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";

import "../index.css";

/* =========================
   LAZY LOAD SEMUA KOMPONEN BERAT
========================= */
const GithubIsometric = lazy(() => import("../components/GithubIsometric"));
const ScannerChart = lazy(() => import("../layouts/scannerChart.jsx"));

const DiscordProfileCard = lazy(() => import("./DiscordProfileCard.jsx"));
const WakatimeProfileCard = lazy(() => import("../components/WakaTimeCard.jsx"));
const Tetris = lazy(() => import("../pages/TetrioProfileCard.jsx"));
const SteamProfileCard = lazy(() => import("../pages/SteamProfileCard.jsx"));

/* =========================
   ERROR BOUNDARY BIAR 1 CARD ERROR
   TIDAK BIKIN 1 PAGE MATI
========================= */
class CardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Component failed to load.",
    };
  }

  componentDidCatch(error) {
    console.error("Activity card error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`rounded-3xl border p-6 font-mono text-sm ${
            this.props.isDarkMode
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-red-400/40 bg-red-50 text-red-700"
          }`}
        >
          <div className="font-bold">Card failed to render</div>
          <div className="mt-2 opacity-80">{this.state.message}</div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* =========================
   HOOK MOBILE
========================= */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isMobile;
}

/* =========================
   LAZY MOUNT SAAT DEKAT VIEWPORT
========================= */
function useLazyMount(rootMargin = "700px") {
  const ref = useRef(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || shouldMount) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldMount, rootMargin]);

  return [ref, shouldMount];
}

/* =========================
   IDLE MOUNT UNTUK BAGIAN BAWAH
========================= */
function useIdleReady(delay = 350) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId;
    let idleId;

    const run = () => setReady(true);

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: delay + 800 });
    } else {
      timeoutId = window.setTimeout(run, delay);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (idleId && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [delay]);

  return ready;
}

/* =========================
   SKELETON STABIL
========================= */
const SectionSkeleton = memo(function SectionSkeleton({
  height = "min-h-[260px]",
  isDarkMode,
}) {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${height} rounded-3xl border animate-pulse ${
        isDarkMode
          ? "border-zinc-800 bg-zinc-800/40"
          : "border-gray-200 bg-gray-100"
      }`}
    />
  );
});

/* =========================
   WRAPPER LAZY CARD
========================= */
function LazyCard({
  children,
  isDarkMode,
  skeletonHeight = "min-h-[360px]",
  rootMargin = "650px",
}) {
  const [ref, shouldMount] = useLazyMount(rootMargin);
  const idleReady = useIdleReady(250);

  return (
    <div ref={ref} className="break-inside-avoid inline-block w-full mb-4">
      {shouldMount && idleReady ? (
        <CardErrorBoundary isDarkMode={isDarkMode}>
          <Suspense
            fallback={
              <SectionSkeleton
                height={skeletonHeight}
                isDarkMode={isDarkMode}
              />
            }
          >
            {children}
          </Suspense>
        </CardErrorBoundary>
      ) : (
        <SectionSkeleton height={skeletonHeight} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

/* =========================
   REVEAL RINGAN
========================= */
function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* =========================
   ACTIVITY PAGE
========================= */
const Activity = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  const isMobile = useIsMobile();

  const [githubRef, mountGithub] = useLazyMount("800px");
  const [chartRef, mountChart] = useLazyMount("900px");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      <div
        className={`top-0 z-40 border-b backdrop-blur-lg ${
          isDarkMode
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-[#faf9f9]/80 border-gray-300"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between mb-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                isDarkMode
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="font-medium text-sm sm:text-base">
                Live Stats
              </span>
            </div>
          </div>

          <Reveal className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4 mt-14 sm:mt-20">
              <DecryptedText
                text="Activity"
                speed={80}
                maxIterations={70}
                sequential
                animateOn="view"
              />
            </h1>

            <p
              className={`text-sm sm:text-lg font-mono max-w-xl mx-auto leading-6 ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              My off-the-clock activities and gaming stats.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div ref={githubRef}>
          {!isMobile ? (
            <div className="break-inside-avoid inline-block w-full mb-4">
              {mountGithub ? (
                <CardErrorBoundary isDarkMode={isDarkMode}>
                  <Suspense
                    fallback={
                      <SectionSkeleton
                        height="min-h-[260px]"
                        isDarkMode={isDarkMode}
                      />
                    }
                  >
                    <GithubIsometric username="Ananta-TI" />
                  </Suspense>
                </CardErrorBoundary>
              ) : (
                <SectionSkeleton
                  height="min-h-[260px]"
                  isDarkMode={isDarkMode}
                />
              )}
            </div>
          ) : (
            <div
              className={`rounded-3xl border p-5 mb-4 ${
                isDarkMode
                  ? "border-zinc-800 bg-zinc-800/40"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-bold">GitHub Activity</h3>
              <p
                className={`mt-2 text-sm leading-6 ${
                  isDarkMode ? "text-zinc-400" : "text-gray-600"
                }`}
              >
                3D GitHub activity dimatikan di mobile supaya halaman lebih
                ringan.
              </p>
            </div>
          )}
        </div>

        {/* <div ref={chartRef} className="w-full max-w-7xl mx-auto mb-4">
          {mountChart ? (
            <CardErrorBoundary isDarkMode={isDarkMode}>
              <Suspense
                fallback={
                  <SectionSkeleton
                    height="min-h-[520px]"
                    isDarkMode={isDarkMode}
                  />
                }
              >
                <ScannerChart isDarkMode={isDarkMode} />
              </Suspense>
            </CardErrorBoundary>
          ) : (
            <SectionSkeleton
              height="min-h-[520px]"
              isDarkMode={isDarkMode}
            />
          )}
        </div> */}

        <div className="w-full max-w-7xl mx-auto columns-1 lg:columns-2 gap-4">
          <LazyCard
            isDarkMode={isDarkMode}
            skeletonHeight="min-h-[260px]"
            rootMargin="700px"
          >
            <DiscordProfileCard userId="900690698133700638" />
          </LazyCard>

          <LazyCard
            isDarkMode={isDarkMode}
            skeletonHeight="min-h-[520px]"
            rootMargin="850px"
          >
            <Tetris />
          </LazyCard>

          <LazyCard
            isDarkMode={isDarkMode}
            skeletonHeight="min-h-[380px]"
            rootMargin="900px"
          >
            <WakatimeProfileCard />
          </LazyCard>

          <LazyCard
            isDarkMode={isDarkMode}
            skeletonHeight="min-h-[680px]"
            rootMargin="1000px"
          >
            <SteamProfileCard
              steamIds={[
                "76561199166544214",
                "76561199745356826",
                "76561198773672138",
                "76561198735338945",
              ]}
            />
          </LazyCard>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(Activity);