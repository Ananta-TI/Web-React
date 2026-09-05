"use client";

import {
  useContext,
  useEffect,
  useRef,
} from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThemeContext } from "../../context/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

export const TextReveal = ({
  text,
  className = "",
  isDarkMode: isDarkModeProp,
}) => {
  const containerRef =
    useRef(null);

  const theme =
    useContext(ThemeContext);

  const isDarkMode =
    isDarkModeProp ??
    theme?.isDarkMode ??
    false;

  const words =
    text.split(" ");

  // ============================================================
  // TEXT REVEAL ANIMATION
  // ============================================================

  useEffect(() => {
    if (
      !containerRef.current
    ) {
      return;
    }

    const ctx =
      gsap.context(() => {
        const revealWords =
          gsap.utils.toArray(
            ".reveal-word",
            containerRef.current
          );

        if (
          !revealWords.length
        ) {
          return;
        }

        const mm =
          gsap.matchMedia();

        // ======================================================
        // MOBILE
        // ======================================================

        mm.add(
          "(max-width: 639px)",
          () => {
            gsap.fromTo(
              revealWords,
              {
                opacity:
                  0.12,
              },
              {
                opacity:
                  1,

                stagger:
                  0.025,

                ease:
                  "none",

                scrollTrigger: {
                  trigger:
                    containerRef.current,

                  /*
                   * Mulai lebih cepat saat text
                   * masuk dari bawah viewport.
                   */
                  start:
                    "top 42%",

                  /*
                   * Selesai saat mayoritas paragraph
                   * sudah naik ke tengah layar.
                   */
                  end:
                    "bottom 85%",

                  scrub:
                    0.65,

                  invalidateOnRefresh:
                    true,
                },
              }
            );
          }
        );

        // ======================================================
        // TABLET
        // ======================================================

        mm.add(
          "(min-width: 640px) and (max-width: 1023px)",
          () => {
            gsap.fromTo(
              revealWords,
              {
                opacity:
                  0.1,
              },
              {
                opacity:
                  1,

                stagger:
                  0.035,

                ease:
                  "none",

                scrollTrigger: {
                  trigger:
                    containerRef.current,

                  start:
                    "top 42%",

                  end:
                    "bottom 82%",

                  scrub:
                    0.8,

                  invalidateOnRefresh:
                    true,
                },
              }
            );
          }
        );

        // ======================================================
        // DESKTOP
        // ======================================================

        mm.add(
          "(min-width: 1024px)",
          () => {
            gsap.fromTo(
              revealWords,
              {
                opacity:
                  0.1,
              },
              {
                opacity:
                  1,

                stagger:
                  0.05,

                ease:
                  "none",

                scrollTrigger: {
                  trigger:
                    containerRef.current,

                  start:
                    "top 35%",

                  end:
                    "bottom 75%",

                  scrub:
                    1,

                  invalidateOnRefresh:
                    true,
                },
              }
            );
          }
        );

        return () =>
          mm.revert();
      }, containerRef);

    // refresh sesudah layout selesai
    const refreshTimer =
      window.setTimeout(
        () => {
          ScrollTrigger.refresh();
        },
        100
      );

    return () => {
      window.clearTimeout(
        refreshTimer
      );

      ctx.revert();
    };
  }, [text]);

  // ============================================================
  // PARSE HIGHLIGHT
  // ============================================================

  let isHighlighting =
    false;

  return (
    <div
      ref={
        containerRef
      }
      className={`
        relative

        flex
        w-full
        min-w-0

        items-start
        justify-start

        transition-colors
        duration-500

        ${className}
      `}
    >
      <div
        className="
          w-full
          min-w-0

          py-3

          sm:py-5

          md:py-7

          lg:py-10
        "
      >
        <p
          className="
            flex
            w-full
            min-w-0
            flex-wrap

            items-baseline

            font-bold
            leading-[1.55]

            transition-colors
            duration-500

            sm:leading-[1.6]

            md:leading-[1.65]
          "
        >
          {words.map(
            (
              word,
              index
            ) => {
              const startHighlight =
                word.startsWith(
                  "**"
                );

              const endHighlight =
                word.endsWith(
                  "**"
                ) ||
                word.includes(
                  "**"
                );

              if (
                startHighlight
              ) {
                isHighlighting =
                  true;
              }

              const cleanWord =
                word.replace(
                  /\*\*/g,
                  ""
                );

              const currentHighlightStatus =
                isHighlighting;

              if (
                endHighlight
              ) {
                isHighlighting =
                  false;
              }

              const colorClass =
                currentHighlightStatus
                  ? isDarkMode
                    ? "text-[#c1ff72]"
                    : "text-[#f50a0a]"
                  : isDarkMode
                    ? "text-white reveal-word"
                    : "text-gray-900 reveal-word";

              return (
                <span
                  key={
                    `${cleanWord}-${index}`
                  }
                  className="
                    relative
                    inline-block

                    mx-[2px]
                    my-[2px]

                    sm:mx-[3px]
                    sm:my-[3px]

                    md:mx-[4px]

                    lg:mx-[5px]
                  "
                >
                  <span
                    className={`
                      transition-colors
                      duration-500

                      ${colorClass}
                    `}
                    style={{
                      opacity:
                        currentHighlightStatus
                          ? 1
                          : 0.1,
                    }}
                  >
                    {
                      cleanWord
                    }
                  </span>
                </span>
              );
            }
          )}
        </p>
      </div>
    </div>
  );
};