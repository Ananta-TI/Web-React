import React, { useEffect, useState } from "react";
import GitHubCalendar from "react-github-calendar";
import { motion } from "framer-motion";

// HAPUS useContext. Komponen menerima isDarkMode dari luar (prop)
const GithubGraph = ({ username = "Ananta-TI", isDarkMode }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=2024&y=2025`)
      .then((res) => res.json())
      .then((data) => { setLoading(false); })
      .catch((err) => console.error(err));
  }, [username]);

  const calendarTheme = isDarkMode 
    ? { light: ["#18181b", "#0e4429", "#006d32", "#26a641", "#39d353"], dark: ["#18181b", "#0e4429", "#006d32", "#26a641", "#39d353"] }
    : { light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"], dark: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] };

  return (
    <div className="flex justify-center font-bold">
      <motion.div
        className={`cursor-target ${
          isDarkMode ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0" : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
        } backdrop-blur-lg p-6 rounded-xl shadow-xl  transition-all duration-500 max-w-full`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <motion.div className={`w-10 h-10 border-4 ${isDarkMode ? "border-indigo-400 border-t-transparent" : "border-indigo-600 border-t-transparent"} rounded-full animate-spin`} initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className={isDarkMode ? "github-calendar-dark" : "github-calendar-light"}>
            <GitHubCalendar username={username} blockSize={11} blockMargin={4} fontSize={14} showWeekdayLabels hideColorLegend={false} showTotalCount theme={calendarTheme} colorScheme={isDarkMode ? "dark" : "light"} />
          </motion.div>
        )}
        <style>{`.github-calendar-dark { color: #e6edf3; } .github-calendar-light { color: #24292f; } .github-calendar-dark .ContributionCalendar-label { color: #7d8590 !important; } .github-calendar-light .ContributionCalendar-label { color: #656d76 !important; } .github-calendar-dark .js-calendar-month-label { color: #e6edf3 !important; } .github-calendar-light .js-calendar-month-label { color: #24292f !important; } .github-calendar-dark .ContributionCalendar-footer { color: #e6edf3 !important; } .github-calendar-light .ContributionCalendar-footer { color: #24292f !important; }`}</style>
      </motion.div>
    </div>
  );
};

// KUNCI: Memo memastikan kalender TIDAK di-render saat transisi tema sedang berjalan
export default React.memo(GithubGraph);