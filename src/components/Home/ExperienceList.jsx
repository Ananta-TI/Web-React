import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Code,
  Brain,
  Gamepad,
} from "lucide-react";

import { ThemeContext } from "../../context/ThemeContext";

const experiences = [
  {
    title:
      "Project Manager & Developer for Asset Management System",
    duration:
      "React, Supabase, Tailwind • Agile Team Project",
    category: "Web",
  },

  {
    title:
      "Game Developer – Tarzan: Penyelamat Hutan (Unity)",
    duration:
      "Quest system, timer, plugin scripting",
    category: "Game",
  },

  {
    title:
      "RPL Project – Krisis Pangan",
    duration:
      "Business process, use case diagram, ERD",
    category: "Web",
  },

  {
    title:
      "Chatbot for Job Search with GUI",
    duration:
      "Python + Tkinter • TTS, Histori, JSON KB",
    category: "AI",
  },
];

const iconMap = {
  Web: (
    <Code className="h-5 w-5 shrink-0 text-blue-400 md:h-6 md:w-6" />
  ),

  AI: (
    <Brain className="h-5 w-5 shrink-0 text-yellow-400 md:h-6 md:w-6" />
  ),

  Game: (
    <Gamepad className="h-5 w-5 shrink-0 text-pink-400 md:h-6 md:w-6" />
  ),
};

export default function ExperienceList() {
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);

  const startXRef = useRef(0);
  const baseScrollLeftRef = useRef(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const { isDarkMode } =
    useContext(ThemeContext) || {
      isDarkMode: false,
    };

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  const scrollSpeed = 0.75;

  useEffect(() => {
    const el =
      scrollRef.current;

    if (!el) return;

    const step = () => {
      if (
        !el ||
        el.scrollWidth === 0
      ) {
        rafRef.current =
          requestAnimationFrame(step);

        return;
      }

      const half =
        el.scrollWidth / 2;

      if (
        !isPausedRef.current &&
        !isDraggingRef.current
      ) {
        el.scrollLeft +=
          scrollSpeed;

        if (
          el.scrollLeft >=
          half
        ) {
          el.scrollLeft -=
            half;
        }
      }

      rafRef.current =
        requestAnimationFrame(step);
    };

    rafRef.current =
      requestAnimationFrame(step);

    return () => {
      if (
        rafRef.current
      ) {
        cancelAnimationFrame(
          rafRef.current
        );

        rafRef.current =
          null;
      }
    };
  }, []);

  // ============================================================
  // POINTER / DRAG
  // ============================================================

  useEffect(() => {
    const el =
      scrollRef.current;

    if (!el) return;

    const onPointerDown = (
      event
    ) => {
      if (
        event.pointerType ===
          "mouse" &&
        event.button !== 0
      ) {
        return;
      }

      if (
        resumeTimeoutRef.current
      ) {
        clearTimeout(
          resumeTimeoutRef.current
        );
      }

      isDraggingRef.current =
        true;

      isPausedRef.current =
        true;

      setIsDragging(true);

      startXRef.current =
        event.clientX;

      baseScrollLeftRef.current =
        el.scrollLeft;

      try {
        el.setPointerCapture?.(
          event.pointerId
        );
      } catch {
        // ignore
      }
    };

    const onPointerMove = (
      event
    ) => {
      if (
        !isDraggingRef.current
      ) {
        return;
      }

      if (
        event.cancelable
      ) {
        event.preventDefault();
      }

      const dx =
        event.clientX -
        startXRef.current;

      const walk =
        dx * 1.2;

      let newScrollLeft =
        baseScrollLeftRef.current -
        walk;

      const half =
        el.scrollWidth / 2;

      if (
        !half
      ) {
        return;
      }

      if (
        newScrollLeft >=
        half
      ) {
        newScrollLeft -=
          half;

        baseScrollLeftRef.current =
          newScrollLeft;

        startXRef.current =
          event.clientX;
      } else if (
        newScrollLeft < 0
      ) {
        newScrollLeft =
          half +
          newScrollLeft;

        baseScrollLeftRef.current =
          newScrollLeft;

        startXRef.current =
          event.clientX;
      }

      el.scrollLeft =
        newScrollLeft;
    };

    const endDrag = (
      event
    ) => {
      if (
        !isDraggingRef.current
      ) {
        return;
      }

      isDraggingRef.current =
        false;

      setIsDragging(false);

      try {
        if (
          el.hasPointerCapture?.(
            event.pointerId
          )
        ) {
          el.releasePointerCapture(
            event.pointerId
          );
        }
      } catch {
        // ignore
      }

      if (
        resumeTimeoutRef.current
      ) {
        clearTimeout(
          resumeTimeoutRef.current
        );
      }

      resumeTimeoutRef.current =
        setTimeout(() => {
          isPausedRef.current =
            false;
        }, 120);
    };

    // ==========================================================
    // HOVER PAUSE
    // ==========================================================

    const onMouseEnter =
      () => {
        isPausedRef.current =
          true;
      };

    const onMouseLeave =
      () => {
        if (
          !isDraggingRef.current
        ) {
          isPausedRef.current =
            false;
        }
      };

    // ==========================================================
    // EVENT LISTENERS
    // ==========================================================

    el.addEventListener(
      "pointerdown",
      onPointerDown,
      {
        passive: false,
      }
    );

    window.addEventListener(
      "pointermove",
      onPointerMove,
      {
        passive: false,
      }
    );

    window.addEventListener(
      "pointerup",
      endDrag
    );

    window.addEventListener(
      "pointercancel",
      endDrag
    );

    el.addEventListener(
      "mouseenter",
      onMouseEnter
    );

    el.addEventListener(
      "mouseleave",
      onMouseLeave
    );

    return () => {
      el.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      window.removeEventListener(
        "pointermove",
        onPointerMove
      );

      window.removeEventListener(
        "pointerup",
        endDrag
      );

      window.removeEventListener(
        "pointercancel",
        endDrag
      );

      el.removeEventListener(
        "mouseenter",
        onMouseEnter
      );

      el.removeEventListener(
        "mouseleave",
        onMouseLeave
      );

      if (
        resumeTimeoutRef.current
      ) {
        clearTimeout(
          resumeTimeoutRef.current
        );
      }
    };
  }, []);

  // ============================================================
  // PAUSE SAAT TAB TIDAK AKTIF
  // ============================================================

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (
          document.hidden
        ) {
          isPausedRef.current =
            true;
        } else if (
          !isDraggingRef.current
        ) {
          isPausedRef.current =
            false;
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // ============================================================
  // DUPLICATE UNTUK INFINITE LOOP
  // ============================================================

  const repeatedExperiences = [
    ...experiences,
    ...experiences,
  ];

  return (
    <div
      className="
        relative
        w-full
        min-w-0
        max-w-full
        select-none
        overflow-hidden
      "
    >
      {/* ====================================================== */}
      {/* GRADIENT KIRI */}
      {/* ====================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-30

          ${
            isDarkMode
              ? "bg-[linear-gradient(to_right,rgb(24_24_27)_0%,rgba(24,24,27,0.96)_25%,rgba(24,24,27,0.68)_55%,rgba(24,24,27,0.25)_78%,transparent_100%)]"
              : "bg-[linear-gradient(to_right,#faf9f9_0%,rgba(250,249,249,0.96)_25%,rgba(250,249,249,0.68)_55%,rgba(250,249,249,0.25)_78%,transparent_100%)]"
          }
        `}
        style={{
          width:
            "clamp(30px, 6%, 90px)",
        }}
      />

      {/* ====================================================== */}
      {/* GRADIENT KANAN */}
      {/* ====================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-y-0
          right-0
          z-30

          ${
            isDarkMode
              ? "bg-[linear-gradient(to_left,rgb(24_24_27)_0%,rgba(24,24,27,0.96)_25%,rgba(24,24,27,0.68)_55%,rgba(24,24,27,0.25)_78%,transparent_100%)]"
              : "bg-[linear-gradient(to_left,#faf9f9_0%,rgba(250,249,249,0.96)_25%,rgba(250,249,249,0.68)_55%,rgba(250,249,249,0.25)_78%,transparent_100%)]"
          }
        `}
        style={{
          width:
            "clamp(30px, 6%, 90px)",
        }}
      />

      {/* ====================================================== */}
      {/* SCROLLER */}
      {/* ====================================================== */}

      <div
        ref={
          scrollRef
        }
        className={`
          flex
          w-full
          min-w-0
          max-w-full
        cursor-target

          items-stretch

          overflow-x-hidden
          overflow-y-hidden

          gap-1

          py-1

          sm:gap-1

          md:gap-1

          ${
            isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }
        `}
        style={{
          scrollBehavior:
            "auto",

          willChange:
            "scroll-position",

          touchAction:
            "pan-y",

          overscrollBehaviorX:
            "contain",
        }}
      >
        {repeatedExperiences.map(
          (
            exp,
            index
          ) => (
            <article
              key={`${exp.title}-${index}`}
              title={
                exp.duration
              }
              className={`
                relative
        cursor-target

                flex
                shrink-0

                overflow-hidden

                rounded-xl
                sm:rounded-2xl

                shadow-sm

                transition-[background-color,box-shadow]
                duration-300

                hover:shadow-xl

                ${
                  isDarkMode
                    ? "bg-zinc-800 hover:bg-zinc-700 border border-gray-600 border-b-0"
                    : "bg-gray-100 hover:bg-gray-200 border border-gray-800 border-b-0"
                }
              `}
              style={{
                /*
                 * Desktop:
                 * tetap 400px seperti desain awal.
                 *
                 * Kalau parent benar-benar sempit:
                 * baru card mengikuti lebar parent.
                 *
                 * Tidak pakai vw.
                 * Tidak pakai breakpoint width.
                 */
                width:
                  "min(400px, calc(100% - 24px))",

                minWidth:
                  "min(400px, calc(100% - 24px))",

                padding:
                  "clamp(16px, 2vw, 24px)",
              }}
            >
              <blockquote
                className="
                  relative
                  flex
                  min-h-full
                  w-full
                  min-w-0
                  flex-col
                  justify-between
                "
              >
                {/* ============================================ */}
                {/* TITLE */}
                {/* ============================================ */}

                <div
                  className="
                    relative
                    z-20

                    flex
                    min-w-0
                    items-start

                    gap-2.5
                    md:gap-3
                  "
                >
                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      md:h-10
                      md:w-10

                      ${
                        isDarkMode
                          ? "bg-white/[0.06]"
                          : "bg-black/[0.04]"
                      }
                    `}
                  >
                    {
                      iconMap[
                        exp.category
                      ]
                    }
                  </div>

                  {/* TITLE TEXT */}

                  <span
                    className={`
                      min-w-0
                      flex-1

                      font-medium
                      leading-[1.4]

                      transition-colors
                      duration-500

                      ${
                        isDarkMode
                          ? "text-gray-100"
                          : "text-gray-800"
                      }
                    `}
                    style={{
                      fontSize:
                        "clamp(13px, 1.15vw, 16px)",
                    }}
                  >
                    {
                      exp.title
                    }
                  </span>
                </div>

                {/* ============================================ */}
                {/* DESCRIPTION */}
                {/* ============================================ */}

                <div
                  className="
                    relative
                    z-20
                    mt-5
                  "
                >
                  <span
                    className={`
                      block

                      font-normal
                      leading-[1.6]

                      transition-colors
                      duration-500

                      ${
                        isDarkMode
                          ? "text-gray-400"
                          : "text-gray-600"
                      }
                    `}
                    style={{
                      fontSize:
                        "clamp(11px, 0.9vw, 13px)",
                    }}
                  >
                    {
                      exp.duration
                    }
                  </span>
                </div>
              </blockquote>
            </article>
          )
        )}
      </div>
    </div>
  );
}