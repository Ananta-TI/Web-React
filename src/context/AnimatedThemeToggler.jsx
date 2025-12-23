"use client";

import { useCallback, useEffect, useRef, useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { ThemeContext } from "./ThemeContext"; // Path yang benar

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}) => {
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const buttonRef = useRef(null);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    // Simpan tema baru ke localStorage
    const newTheme = !isDarkMode;
    
    // Gunakan View Transition API jika tersedia
    if (!document.startViewTransition) {
      // Fallback untuk browser yang tidak support View Transition
      flushSync(() => {
        setIsDarkMode(newTheme);
        if (newTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme ? "dark" : "light");
      });
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(newTheme);
        if (newTheme) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", newTheme ? "dark" : "light");
      });
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [isDarkMode, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={className}
      {...props}
    >
      {isDarkMode ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};