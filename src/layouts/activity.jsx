import React, {
  useContext,
  useEffect,
  lazy,
  Suspense,
  useState,
} from "react";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";

import Tetris from "../pages/TetrioProfileCard.jsx";
import SteamProfileCard from "../pages/SteamProfileCard.jsx";
import DiscordProfileCard from "./DiscordProfileCard.jsx";
import WakatimeProfileCard from "../components/WakaTimeCard.jsx";

import "../index.css";

const GithubIsometric = lazy(() => import("../components/GithubIsometric"));

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  useEffect(() => {
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

const Activity = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-500 ${
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

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4 mt-14 sm:mt-20">
              <DecryptedText
                text="Activity"
                speed={100}
                maxIterations={105}
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
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!isMobile ? (
          <div className="break-inside-avoid inline-block w-full mb-4">
            <Suspense
              fallback={
                <div
                  className={`min-h-[260px] rounded-3xl border animate-pulse ${
                    isDarkMode
                      ? "border-zinc-800 bg-zinc-800/40"
                      : "border-gray-200 bg-gray-100"
                  }`}
                />
              }
            >
              <GithubIsometric username="Ananta-TI" />
            </Suspense>
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
              3D GitHub activity dimatikan di mobile supaya halaman lebih ringan.
            </p>
          </div>
        )}

        <div className="w-full max-w-7xl mx-auto columns-1 lg:columns-2 gap-4">
          <div className="break-inside-avoid inline-block w-full mb-4">
            <DiscordProfileCard userId="900690698133700638" />
          </div>

          <div className="break-inside-avoid inline-block w-full mb-4">
            <Tetris />
          </div>

          <div className="break-inside-avoid inline-block w-full mb-4">
            <WakatimeProfileCard />
          </div>

          <div className="break-inside-avoid inline-block w-full mb-4">
            <SteamProfileCard
              steamIds={[
                "76561199166544214",
                "76561199745356826",
                "76561198773672138",
                "76561198735338945",
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Activity;