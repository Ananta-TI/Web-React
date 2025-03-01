import React, { useEffect } from "react";
import GitHubCalendar from "react-github-calendar";
import { motion } from "framer-motion";

export default function GithubGraph({ username = "Ananta-TI" }) {
  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=2024&y=2025`)
      .then((res) => res.json())
      .then((data) => console.log("🔍 Data API:", data))
      .catch((err) => console.error("❌ Error fetching data:", err));
  }, [username]);

  const theme = {
    light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    dark: ["#2d2d2d", "#0e4429", "#006d32", "#26a641", "#39d353"],
  };

  return (
    <div className="p-6 flex justify-center">
      <motion.div
        className="bg-white text-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border-2 border-transparent 
                   hover:border-indigo-500 dark:hover:border-purple-500 transition-all duration-300 
                   backdrop-blur-lg bg-opacity-75 dark:bg-opacity-60"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2 className="text-xl font-bold text-center  dark:text-white mb-4">
          GitHub Contributions
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <GitHubCalendar
            username={username}
            blockSize={12}
            blockMargin={4}
            fontSize={14}
            showWeekdayLabels
            hideColorLegend
            showTotalCount
            theme={theme}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
