// src/layouts/Timeline.jsx

import { motion, useScroll, useTransform } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { useInView } from "react-intersection-observer";
import {
  Calendar,
  Code,
  Lightbulb,
  Rocket,
  Trophy,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { useContext, useState } from "react";

const timelineData = [
  {
    year: "2025",
    title: "Level Up to Modern Web Applications",
    description:
      "A transformative year diving into React.js and Supabase, embracing the full-stack mindset. Exploring advanced component patterns, real-time data, authentication flows, and futuristic UI design that feels alive. This year marks the shift from crafting simple pages to building intelligent and scalable interactive applications.",
    icon: Rocket,
    achievements: [
      "React.js Advanced Concepts",
      "Supabase Integration",
      "Full-stack Development Thinking",
      "Dynamic & Modern UI/UX",
    ],
    current: true,
  },
  {
    year: "2024",
    title: "Backend Awakening & Server Logic Mastery",
    description:
      "A deeper dive into how the web truly works behind the scenes. Learning PHP, MySQL, and Laravel opened a gateway into handling requests, building secure APIs, managing databases, and structuring clean backend architecture. The journey included real project deployments, authentication, CRUD operations, and performance considerations to build reliable systems.",
    icon: Code,
    achievements: [
      "PHP Programming",
      "MySQL Database Design",
      "Laravel Framework",
      "REST API & Authentication",
    ],
  },
  {
    year: "2023",
    title: "The Academic Adventure Begins",
    description:
      "Entered Politeknik Caltex Riau as a new Informatics Engineering student. Steadily built foundational knowledge in software development, problem solving, and teamwork. This year also ignited curiosity toward exploring diverse areas in tech such as cybersecurity, game development, and UI design.",
    icon: BookOpen,
    achievements: [
      "Informatics Engineering Student",
      "Algorithm & Data Structures",
      "Technology Exploration",
      "Collaborative Learning",
    ],
  },
  {
    year: "2022",
    title: "The First Step into Web Development",
    description:
      "The beginning of the journey. Learned HTML, CSS, and JavaScript for the first time, unlocking the magic of turning ideas into interactive pages. Built a first website using Tailwind CSS and discovered the excitement of shaping digital experiences with creativity and logic combined.",
    icon: Sparkles,
    achievements: [
      "HTML, CSS & JavaScript Fundamentals",
      "Tailwind CSS",
      "First Personal Website",
      "Passion for Web Development Born",
    ],
  },
];

const AnimatedParticles = ({ isDark }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            isDark ? "bg-white/20" : "bg-black/30"
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 80 - 40, 0],
            y: [0, Math.random() * 80 - 40, 0],
            opacity: [0, 1, 0],
            scale: [0.4, 1.5, 0.4],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

const TimelineCard = ({ item, index, isDark }) => {
  const [ref, inView] = useInView({ threshold: 0.25, triggerOnce: true });
  const isEven = index % 2 === 0;
  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ x: isEven ? -80 : 80, opacity: 0 }}
      animate={inView ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className={`flex gap-6 md:gap-12 items-start relative mt-20 ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      <motion.div
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
          item.current ? "animate-pulse" : ""
        } ${isDark ? "bg-zinc-300/80" : "bg-zinc-700/80"}`}
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1, rotate: 360 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Icon className={`w-8 h-8 ${isDark ? "text-black" : "text-white"}`} />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.03 }}
        className={`w-full p-6 border rounded-xl shadow-md transition ${
          isDark
            ? "bg-zinc-900/90 border-zinc-700"
            : "bg-white/90 border-zinc-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`px-3 py-1 text-xs font-mono rounded-md font-medium ${
              isDark
                ? "border border-zinc-500 text-zinc-200"
                : "border border-zinc-600 text-zinc-700"
            }`}
          >
            {item.year}
          </span>

          {item.current && (
            <span
              className={`px-3 py-1 rounded-md text-xs font-medium font-mono inline-flex gap-1 items-center ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              <Trophy className="w-3 h-3" /> Current
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold mt-3">{item.title}</h3>
        <p className="text-sm opacity-70 mt-2">{item.description}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {item.achievements.map((a, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-md text-xs font-mono ${
                isDark ? "bg-zinc-800 text-zinc-100" : "bg-zinc-100 text-black"
              }`}
            >
              {a}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Timeline = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition ${
        isDarkMode
          ? "bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 text-white"
          : "bg-gradient-to-b from-[#f7f7f7] via-zinc-200 to-[#f7f7f7] text-black"
      }`}
    >
      <AnimatedParticles isDark={isDarkMode} />

      <div
        className={`top-0 z-40 backdrop-blur-lg border-b ${
          isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-[#faf9f9] border-gray-400"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4">
                          <DecryptedText
                            text="All Projects"
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
              Every extraordinary journey begins with a single step.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="container mx-auto max-w-5xl px-4 pb-40">
        <div className="relative">
          <div
            className={`absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 ${
              isDarkMode ? "bg-white/20" : "bg-black/40"
            }`}
          />

          {timelineData.map((item, index) => (
            <TimelineCard key={index} item={item} index={index} isDark={isDarkMode} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Timeline;
