import React, { useEffect, useContext, useState } from "react";
import GitHubCalendar from "react-github-calendar";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext.jsx";

export default function GithubGraph({ username = "Ananta-TI" }) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true; // Default ke dark mode
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=2024&y=2025`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 Data API:", data);
        setLoading(false);
      })
      .catch((err) => console.error("❌ Error fetching data:", err));
  }, [username]);

  // Theme configuration untuk calendar
  const calendarTheme = isDarkMode 
    ? {
        light: ["#18181b", "#0e4429", "#006d32", "#26a641", "#39d353"], // Dark mode colors
        dark: ["#18181b", "#0e4429", "#006d32", "#26a641", "#39d353"],
      }
    : {
        light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"], // Light mode colors  
        dark: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
      };

  return (
    <div className=" flex justify-center font-bold">
      <motion.div
        className={`cursor-target ${
          isDarkMode
            ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0"
            : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
        } backdrop-blur-lg p-6 rounded-xl shadow-xl  
        hover:shadow-indigo-500/50 transition-all duration-500 max-w-full`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* <h2 className={`text-2xl font-bold text-center mb-6 bg-gradient-to-r ${
          isDarkMode 
            ? "from-zinc-100 to-zinc-400" 
            : "from-gray-700 to-gray-900"
        } text-transparent bg-clip-text`}>
          GitHub Contributions
        </h2> */}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div
              className={`w-10 h-10 border-4 ${
                isDarkMode 
                  ? "border-indigo-400 border-t-transparent" 
                  : "border-indigo-600 border-t-transparent"
              } rounded-full animate-spin`}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={isDarkMode ? "github-calendar-dark" : "github-calendar-light"}
          >
            <GitHubCalendar
              username={username}
              blockSize={11}
              blockMargin={4}
              fontSize={14}
              showWeekdayLabels
              hideColorLegend={false}
              showTotalCount
              theme={calendarTheme}
              colorScheme={isDarkMode ? "dark" : "light"}
            />
            
            {/* Custom Less - More Legend */}
            {/* <div className="flex items-center justify-end mt-4 gap-2">
              <span className={`text-xs ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}>
                Less
              </span>
              <div className="flex gap-1">
                {calendarTheme.light.map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className={`text-xs ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}>
                More
              </span>
            </div> */}
          </motion.div>
        )}

        {/* Custom CSS untuk styling tambahan */}
        <style jsx>{`
          .github-calendar-dark {
            color: #e6edf3;
          }
          
          .github-calendar-light {
            color: #24292f;
          }
          
          /* Styling untuk text labels */
          .github-calendar-dark .ContributionCalendar-label {
            color: #7d8590 !important;
          }
          
          .github-calendar-light .ContributionCalendar-label {
            color: #656d76 !important;
          }
          
          /* Styling untuk month labels */
          .github-calendar-dark .js-calendar-month-label {
            color: #e6edf3 !important;
          }
          
          .github-calendar-light .js-calendar-month-label {
            color: #24292f !important;
          }

          /* Styling untuk total count */
          .github-calendar-dark .ContributionCalendar-footer {
            color: #e6edf3 !important;
          }
          
          .github-calendar-light .ContributionCalendar-footer {
            color: #24292f !important;
          }
        `}</style>
      </motion.div>
    </div>
  );
}