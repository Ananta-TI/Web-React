import React, { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import Tetris from "./TetrioProfileCard.jsx";
import SteamProfileCard from "./SteamProfileCard";
import DiscordProfileCard from "./DiscordProfileCard.jsx";
import WakatimeProfileCard from "../components/WakaTimeCard.jsx";
// import SpotifyProfileCard from "./SpotifyProfileCard.jsx";
import { Gamepad2 } from "lucide-react";
import "../index.css";

const Activity = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  // 🔝 Scroll ke atas saat halaman dibuka (Mengikuti layout Art.jsx)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* ===== Header Section ===== */}
      <div
        className={`top-0 z-40 backdrop-blur-lg border-b ${
          isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-[#faf9f9] border-gray-400"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span className="font-medium">Live Stats</span>
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4 mt-20">
              <DecryptedText
                text="Activity"
                speed={100}
                maxIterations={105}
                sequential
                animateOn="view"
              />
            </h1>
            <p
              className={`text-lg font-mono ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              My off-the-clock activities and gaming stats.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ===== Content Section (Masonry Layout) ===== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Menggunakan columns-1 untuk mobile, dan columns-2 untuk desktop */}
        <div className="w-full max-w-7xl mx-auto mt-1 mb-auto columns-1 lg:columns-2 gap-4">
          

          {/* Card 1: Discord */}
          <div className="break-inside-avoid inline-block w-full mb-4">
            <DiscordProfileCard userId="900690698133700638" />
          </div>
          
          {/* Card 3: TETR.IO (Akan otomatis mengisi ruang kosong di bawah Discord) */}
          <div className="break-inside-avoid inline-block w-full mb-4">
            <Tetris />
          </div>
          {/* Card WakaTime */}
<div className="break-inside-avoid inline-block w-full mb-4">
  <WakatimeProfileCard />
</div>
          {/* Card 2: Steam (Ditaruh urutan kedua agar jatuh di kolom kanan) */}
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

          
          {/* Card 4: Spotify (Jika nanti ingin diaktifkan) */}
          {/* <div className="break-inside-avoid inline-block w-full mb-4">
            <SpotifyProfileCard />
          </div> 
          */}

        </div>
      </div>
    </motion.div>
  );
};

export default Activity;