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
    title: "Game Developer – Tarzan: Penyelamat Hutan(Unity) ",
    duration: "Quest system, timer, plugin scripting",
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
  const rafRef = useRef(null);

  // mutable refs untuk logika runtime
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const baseScrollLeftRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: false };

  const scrollSpeed = 0.75; // px per frame, sesuaikan jika perlu

  // Auto-scroll loop (requestAnimationFrame)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const step = () => {
      // safety
      if (!el || el.scrollWidth === 0) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      const half = el.scrollWidth / 2;

      if (!isPausedRef.current && !isDraggingRef.current) {
        // tambahkan scroll
        el.scrollLeft += scrollSpeed;

        // wrap kanan
        if (el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Pointer (mouse + touch) handlers menggunakan pointer events
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      // hanya tombol kiri mouse atau touch
      if (e.pointerType === "mouse" && e.button !== 0) return;

      isDraggingRef.current = true;
      isPausedRef.current = true;
      setIsDragging(true);

      startXRef.current = e.clientX;
      baseScrollLeftRef.current = el.scrollLeft;

      // capture pointer supaya move/up tetap diterima
      if (e.pointerId) {
        try {
          e.target.setPointerCapture?.(e.pointerId);
        } catch (err) {}
      }

      el.style.cursor = "grabbing";
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const dx = e.clientX - startXRef.current;
      const walk = dx * 1.2; // sensitivitas drag, ubah sesuai rasa
      let newScrollLeft = baseScrollLeftRef.current - walk;

      const half = el.scrollWidth / 2;

      // normalisasi newScrollLeft ke rentang [0, half)
      // handle wrap kiri & kanan
      if (newScrollLeft >= half) {
        newScrollLeft = newScrollLeft - half;
        // sync base agar next moves relatif
        baseScrollLeftRef.current = newScrollLeft;
        startXRef.current = e.clientX;
      } else if (newScrollLeft < 0) {
        newScrollLeft = half + newScrollLeft;
        baseScrollLeftRef.current = newScrollLeft;
        startXRef.current = e.clientX;
      }

      el.scrollLeft = newScrollLeft;
    };

    const endDrag = (e) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      isPausedRef.current = false;
      setIsDragging(false);

      if (e && e.pointerId) {
        try {
          e.target.releasePointerCapture?.(e.pointerId);
        } catch (err) {}
      }

      el.style.cursor = "grab";
      // little delay agar auto-scroll tidak langsung bertabrakan
      // tapi biasanya cukup pakai boolean di refs
      setTimeout(() => {
        isPausedRef.current = false;
      }, 120);
    };

    // hover pause
    const onMouseEnter = () => {
      isPausedRef.current = true;
    };
    const onMouseLeave = () => {
      // kalau sedang drag, jangan resume
      if (!isDraggingRef.current) isPausedRef.current = false;
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: false });
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);

    // inisialisasi cursor
    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.style.cursor = "";
    };
  }, []);

  const repeatedExperiences = [...experiences, ...experiences];

  return (
    <div className="relative overflow-hidden transition-colors duration-500 select-none">
      {/* Gradient kiri */}
      <div
        className={`pointer-events-none absolute left-0 top-0 h-full w-20 z-30 bg-gradient-to-r to-transparent ${
          isDarkMode ? "from-zinc-900" : "from-white"
        }`}
      />

      {/* Gradient kanan */}
      <div
        className={`pointer-events-none absolute right-0 top-0 h-full w-20 z-30 bg-gradient-to-l to-transparent ${
          isDarkMode ? "from-zinc-900" : "from-white"
        }`}
      />

      {/* Kontainer scroll */}
      <div
        ref={scrollRef}
        className="flex gap-6 py-6 overflow-x-hidden px-2"
        style={{
          scrollBehavior: "auto",
          willChange: "scroll-position",
          touchAction: "pan-y", // biar pointer bisa handle horizontal drag dengan baik
        }}
      >
        {repeatedExperiences.map((exp, index) => (
          <div
            key={`${exp.title}-${index}`}
            className={`relative w-[300px] md:w-[400px] flex-shrink-0 rounded-2xl cursor-target px-6 py-5 transition-all duration-300 shadow-sm hover:shadow-xl ${
              isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"
            }`}
            title={exp.duration}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className={`pointer-events-none  absolute rounded-2xl -left-0.5 -top-0.5 h-[calc(100%+4px)] w-[calc(100%+4px)] border border-b-0 ${
                  isDarkMode ? "border-gray-600" : "border-gray-800"
                }`}
              />
              <span
                className={`relative z-20 text-base font-medium transition-colors duration-500 flex items-center gap-2 ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {iconMap[exp.category]} {exp.title}
              </span>
              <div className="relative z-20 mt-4">
                <span
                  className={`text-xs font-normal leading-[1.6] transition-colors duration-500 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {exp.duration}
                </span>
              </div>
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}
