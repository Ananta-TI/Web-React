import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Ambil dari localStorage atau fallback ke sistem
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme !== null) return savedTheme === "dark";
    return getSystemTheme();
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
