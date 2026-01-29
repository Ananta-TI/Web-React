import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

// --- MOCK DATA (Fallback jika API Error/Limit Habis) ---
const MOCK_WAKA_DATA = {
  data: {
    human_readable_total: "0 hrs 0 mins",
    human_readable_daily_average: "0 hrs 0 mins",
    best_day: { date: "Today", text: "0 hrs 0 mins" },
    languages: [],
    editors: []
  }
};

export default function WakaTimeCard() {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [stats, setStats] = useState(MOCK_WAKA_DATA.data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("languages");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try to call the API
        const res = await fetch('http://localhost:5000/api/wakatime');
        
        if (!res.ok) throw new Error(`Gagal mengambil data: ${res.status}`);
        
        const json = await res.json();
        if (json.data) {
          setStats(json.data);
          setError(false);
        } else {
          setStats(MOCK_WAKA_DATA.data);
          setError(true);
        }
      } catch (err) {
        console.error("WakaTime Fallback:", err);
        setError(true);
        setStats(MOCK_WAKA_DATA.data); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`w-full max-w-md h-48 rounded-xl animate-pulse border ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-100 border-gray-200"}`}>
        <div className="h-full flex flex-col justify-center items-center space-y-3">
          <div className={`w-10 h-10 rounded ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}`}></div>
          <div className={`w-1/2 h-4 rounded ${isDarkMode ? "bg-zinc-800" : "bg-gray-300"}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased w-full max-w-md mx-auto">
      <div className={`relative overflow-hidden rounded-xl border shadow-xl transition-all duration-300 group
        ${isDarkMode 
          ? "bg-[#121212] border-[#333]" 
          : "bg-white border-gray-200"
        }`}>
        
        {/* Header Strip */}
        <div className={`h-1 w-full bg-gradient-to-r ${error ? "from-red-500 to-orange-500" : "from-blue-500 via-purple-500 to-pink-500"}`}></div>

        <div className="p-5">
          {/* Header Info */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg border ${isDarkMode ? "bg-[#202020] border-[#333]" : "bg-gray-100 border-gray-200"}`}>
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.15 13.85L12 13V7h1.5v5.2l3.55 2.15-.9 1.5z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  WakaTime Stats
                </h3>
                <h2 className={`text-xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  Last 7 Days
                </h2>
              </div>
            </div>
            
            <div className="text-right">
               <div className={`text-2xl font-bold font-mono ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                 {stats.human_readable_total || "0 hrs"}
               </div>
               <div className="text-[10px] text-gray-500">Total Coding Time</div>
            </div>
          </div>

          {/* Main Stats Area */}
          <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? "bg-[#1a1a1a] border-[#333]" : "bg-gray-50 border-gray-100"}`}>
            <div className="flex justify-between items-center mb-2">
               <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Daily Average</span>
               <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{stats.human_readable_daily_average || "-"}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Best Day</span>
               <div className="text-right">
                 <span className={`block font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{stats.best_day?.text || "-"}</span>
                 <span className="text-[10px] text-gray-500">{stats.best_day?.date || "-"}</span>
               </div>
            </div>
          </div>

          {/* Languages / Editors Tabs */}
          <div className="mb-3 flex border-b border-gray-200 dark:border-[#333]">
            <button 
              onClick={() => setActiveTab('languages')}
              className={`pb-2 pr-4 text-xs font-bold uppercase transition-colors ${activeTab === 'languages' ? (isDarkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-600") : "text-gray-500"}`}
            >
              Languages
            </button>
            <button 
              onClick={() => setActiveTab('editors')}
              className={`pb-2 px-4 text-xs font-bold uppercase transition-colors ${activeTab === 'editors' ? (isDarkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-600 border-b-2 border-blue-600") : "text-gray-500"}`}
            >
              Editors
            </button>
          </div>

          {/* List Content */}
          <div className="space-y-3 min-h-[120px]">
            {activeTab === 'languages' ? (
              stats.languages && stats.languages.length > 0 ? (
                stats.languages.slice(0, 5).map((lang, idx) => (
                  <ProgressBar 
                    key={idx} 
                    label={lang.name} 
                    percent={lang.percent} 
                    color={lang.color || "#ccc"} 
                    isDark={isDarkMode}
                  />
                ))
              ) : (
                <div className="text-center text-xs text-gray-500 pt-4">No language data available</div>
              )
            ) : (
              stats.editors && stats.editors.length > 0 ? (
                stats.editors.slice(0, 5).map((editor, idx) => (
                  <ProgressBar 
                    key={idx} 
                    label={editor.name} 
                    percent={editor.percent} 
                    color={isDarkMode ? "#ffffff" : "#333333"} 
                    isDark={isDarkMode}
                  />
                ))
              ) : (
                <div className="text-center text-xs text-gray-500 pt-4">No editor data available</div>
              )
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-[#333] text-center">
             <span className="text-[10px] text-gray-500 flex justify-center items-center gap-1">
               <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-green-500 animate-pulse"}`}></span>
               {error ? "Failed to load WakaTime" : "Live from WakaTime API"}
             </span>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper Component: Custom Progress Bar
const ProgressBar = ({ label, percent, color, isDark }) => (
  <div className="group">
    <div className="flex justify-between mb-1">
      <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</span>
      <span className={`text-xs font-mono ${isDark ? "text-gray-500" : "text-gray-500"}`}>{percent}%</span>
    </div>
    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#333]" : "bg-gray-200"}`}>
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percent}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);