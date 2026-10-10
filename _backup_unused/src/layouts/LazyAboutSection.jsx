import React, { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

// Impor semua komponen berat Anda
import GithubGraph from "../components/GithubGraph";
import GithubCard from "../components/GithubCard";
import { AnimatedBeamDemo } from "../components/AnimatedBeamDemo";
import ExperienceList from "../components/Home/ExperienceList";
import Tetris from "./TetrioProfileCard.jsx";
import SteamProfileCard from "./SteamProfileCard";
import DiscordProfileCard from "./DiscordProfileCard.jsx";
import ScannerChart from "./scannerChart.jsx";

// Komponen Skeleton Loading sederhana
const AboutSectionSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto px-4 animate-pulse">
    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="lg:col-span-3 h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
      <div className="lg:col-span-3 h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="lg:col-span-4 h-96 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

const LazyAboutSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1, // Memuat saat 10% dari elemen terlihat
    triggerOnce: true, // Hanya memuat sekali
  });

  return (
    <div ref={ref} className="w-full">
      {inView ? (
        <>
          {/* --- ISI SELURUH KOMPONEN ABOUT ANDA DI SINI --- */}
          <div className="w-full max-w-7xl mx-auto px-4 mt-1 grid gap-6 grid-cols-1 lg:grid-cols-4">
            <div className="lg:col-span-1"><GithubCard username="Ananta-TI" /></div>
            <div className="lg:col-span-3"><GithubGraph /></div>
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 mt-1 grid grid-cols-1 lg:grid-cols-7 gap-2">
            <div className="col-span-1 lg:col-span-3">
              <Tetris />
              <div className="mt-1"><DiscordProfileCard userId="900690698133700638" /></div>
            </div>
            <div className="col-span-1 lg:col-span-4">
              <SteamProfileCard steamIds={["76561199745356826", "76561199166544214", "76561198773672138"]} />
            </div>
          </div>

          <div className="dark px-4 sm:px-0">
            <AnimatedBeamDemo />
          </div>

          <div className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20">
            <ScannerChart />
          </div>
        </>
      ) : (
        // Tampilkan skeleton saat belum di-scroll
        <AboutSectionSkeleton />
      )}
    </div>
  );
};

export default LazyAboutSection;