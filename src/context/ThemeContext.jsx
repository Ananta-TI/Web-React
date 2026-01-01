import { createContext, useState, useEffect, useMemo } from "react"; // 1. Impor useMemo

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isDarkMode, setIsDarkMode] = useState(() => {
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

  // 2. Bungkus value dengan useMemo
  // Ini mencegah pembuatan objek baru setiap render
  const value = useMemo(() => ({ isDarkMode, setIsDarkMode }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}