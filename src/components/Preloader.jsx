import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Skull,
  Ghost,
  Moon,
  Flame,
  Eye,
  Swords,
  Crown,
  Zap,
} from "lucide-react";
import MorphTransition from "./Shared/MorphTransition"; // <-- IMPORT BARU

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMorphing, setIsMorphing] = useState(false); // <-- STATE BARU UNTUK MORPHING
  const containerRef = useRef(null);

  // Gothic themed stages
  const stages = [
    {
      text: "Awakening Darkness",
      icon: Moon,
      target: 15,
    },
    {
      text: "Summoning Spirits",
      icon: Ghost,
      target: 35,
    },
    {
      text: "Channeling Power",
      icon: Flame,
      target: 60,
    },
    {
      text: "Opening Portal",
      icon: Eye,
      target: 85,
    },
    {
      text: "Enter the Void",
      icon: Crown,
      target: 100,
    },
  ];

  useEffect(() => {
    let current = 0;
    const intervalTime = 40;
    const increment = 0.8;
    const interval = setInterval(() => {
      current += increment;
      setProgress(Math.min(current, 100));

      const newStage = [...stages]
        .reverse()
        .findIndex((s) => current >= s.target);
      if (newStage !== -1) {
        setStageIndex(stages.length - 1 - newStage);
      } else {
        setStageIndex(0);
      }

      if (current >= 100) {
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = stages[stageIndex]?.icon || Skull;
  const loadingText = stages[stageIndex]?.text || "Loading";

  if (!isVisible) return null;

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{
        opacity: progress >= 100 ? 0 : 1,
        scale: progress >= 100 ? 1.05 : 1,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Minimal Background Grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(white 1px, transparent 1px),
                         linear-gradient(90deg, white 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Floating Minimal Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
          }}
          animate={{
            y: -50,
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear",
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Logo Container */}
        <motion.div
          className="relative mb-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Simple Rotating Border */}
          <motion.div
            className="absolute -inset-6 border border-white/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo */}
          <div className="relative">
            <img
              src="/img/logo1.avif"
              alt="Logo"
              className="w-32 h-32 object-contain rounded-full border-2 border-white/30 grayscale"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 6v6l4 2'/%3E%3C/svg%3E";
              }}
            />
          </div>
        </motion.div>

        {/* Loading Icon */}
        <motion.div
          key={stageIndex}
          className="mb-8"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CurrentIcon className="h-12 w-12 text-white" strokeWidth={1.5} />
        </motion.div>

        {/* Loading Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-light text-white mb-2 tracking-widest uppercase">
              {loadingText}
            </h2>
            <p className="text-gray-500 text-sm">
              {progress < 30 && "Initializing system..."}
              {progress >= 30 && progress < 60 && "Loading modules..."}
              {progress >= 60 && progress < 90 && "Preparing interface..."}
              {progress >= 90 && "Almost ready..."}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-64 md:w-80 mb-6">
          <div className="h-[2px] bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress Percentage */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-600 font-mono">0%</span>
            <span className="text-2xl font-light text-white font-mono tabular-nums">
              {Math.round(progress)}%
            </span>
            <span className="text-xs text-gray-600 font-mono">100%</span>
          </div>
        </div>

        {/* Tech Badges */}
        <motion.div
          className="mt-6 flex gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {["React", "Vite", "Tailwind", "Framer"].map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
              className="px-4 py-1.5 border border-white/20 text-white/70 text-xs uppercase tracking-wider hover:bg-white/5 transition-colors"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* Stage Indicators */}
        <div className="flex justify-center gap-8 mt-10">
          {stages.map((stage, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-2"
              animate={{
                opacity: progress >= stage.target ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`w-2 h-2 ${
                  progress >= stage.target ? "bg-white" : "bg-white/20"
                }`}
              />
              <span className="text-[10px] text-gray-700 font-mono">
                {stage.target}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs text-gray-700 font-mono uppercase tracking-widest">
          Powered by <span className="text-white">Ananta-TI</span>
        </p>
        <p className="text-[10px] text-gray-800 mt-1">
          v2.0 • Gothic Loading System
        </p>
      </motion.div>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-4 left-4 bg-white/5 border border-white/10 p-2 text-xs text-white/50 font-mono">
          Progress: {Math.round(progress)}% | Stage: {stageIndex}
        </div>
      )}
    </motion.div>
  );
}