import React, { useEffect, useRef, useState, useContext } from "react";
import { Code, Brain, Gamepad } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

const experiences = [
  {
    title: "Project Manager & Developer for Asset Management System",
    duration: "React, Supabase, Tailwind • Agile Team Project",
    category: "Web",
  },
  {
    title: "Developer of Personal Finance Management App",
    duration: "React, Tailwind • Solo Project",
    category: "Web",
  },
  {
    title: "AI Project: Weather Prediction with LSTM",
    duration: "Python, Jupyter Notebook • Real-time Weather API",
    category: "AI",
  },
  {
    title: "Game Developer – Tarzan: Hutan Penyelamat (RPG Maker MV)",
    duration: "Quest system, timer, plugin scripting",
    category: "Game",
  },
  {
    title: "Unity Game Project – TechnoVerse: Dunia Masa Depan",
    duration: "Future-themed collaborative education game",
    category: "Game",
  },
  {
    title: "RPL Project – Krisis Pangan",
    duration: "Business process, use case diagram, ERD",
    category: "Web",
  },
  {
    title: "Chatbot for Job Search with GUI",
    duration: "Python + Tkinter • TTS, Histori, JSON KB",
    category: "AI",
  },
];

const iconMap = {
  Web: <Code className="text-blue-400" size={28} />,
  AI: <Brain className="text-yellow-400" size={28} />,
  Game: <Gamepad className="text-pink-400" size={28} />,
};

export default function ExperienceList() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: false };

  const scrollSpeed = 0.75;
  let scrollPosition = 0;
  let animationId;

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    scrollPosition = scrollContainer.scrollLeft;

    const animate = () => {
      if (isPaused) {
        scrollPosition = scrollContainer.scrollLeft;
      } else {
        scrollPosition += scrollSpeed;

        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }

        scrollContainer.scrollLeft = scrollPosition;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const repeatedExperiences = [...experiences, ...experiences];

  return (
    <div className="relative overflow-hidden transition-colors duration-500">
    {/* Gradient kiri */}
<div
  className={`pointer-events-none  absolute left-0 top-0 h-full w-20 z-30 bg-gradient-to-r to-transparent
    ${isDarkMode ? "from-zinc-900" : "from-white"}
  `}
/>

{/* Gradient kanan */}
<div
  className={`pointer-events-none  absolute right-0 top-0 h-full w-20 z-30 bg-gradient-to-l to-transparent
    ${isDarkMode ? "from-zinc-900" : "from-white"}
  `}
/>


      {/* Kontainer scroll */}
      <div
        ref={scrollRef}
        className="flex gap-6 py-6  overflow-x-hidden px-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ scrollBehavior: "auto", willChange: "scroll-position" }}
      >
        {repeatedExperiences.map((exp, index) => (
          <div
            key={`${exp.title}-${index}`}
            className={`relative w-[300px] cursor-target  md:w-[400px] flex-shrink-0 rounded-2xl px-6 py-5 transition-all duration-300 shadow-sm hover:shadow-xl 
              ${isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"}
            `}
            title={exp.duration}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute rounded-2xl -left-0.5 -top-0.5 h-[calc(100%+4px)] w-[calc(100%+4px)] border border-b-0
                  ${isDarkMode ? "border-gray-600" : "border-gray-800"}
                `}
              />
              <span
                className={`relative z-20 text-base font-medium transition-colors duration-500 flex items-center gap-2
                  ${isDarkMode ? "text-gray-100" : "text-gray-800"}
                `}
              >
                {iconMap[exp.category]} {exp.title} 
              </span>
              <div className="relative z-20 mt-4">
                <span
                  className={`text-xs  font-normal leading-[1.6] transition-colors duration-500
                    ${isDarkMode ? "text-gray-400" : "text-gray-600"}
                  `}
                >
                  {exp.duration} <br />
                  {exp.title}
                </span>
              </div>
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}
