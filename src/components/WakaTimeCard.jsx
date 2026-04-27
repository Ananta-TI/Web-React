import React, { useState, useEffect, useContext, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { 
  Code2, 
  Clock, 
  Terminal, 
  ExternalLink, 
  RefreshCw, 
  ChevronRight,
  Monitor,
  AlertCircle,
  Trophy
} from "lucide-react";

const WakatimeProfileCard = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mengambil URL Backend dari .env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const fetchWakaStats = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/wakatime");
    const text = await response.text();

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Response bukan JSON");
    }

    if (!response.ok) {
      throw new Error(json.error || "Gagal fetch");
    }

    if (!json.data) {
      throw new Error("Data tidak valid");
    }

    setStats(json.data);

  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    fetchWakaStats();
  }, [fetchWakaStats]);

  if (loading) {
    return (
      <div className={`w-full min-h-[300px] rounded-2xl border animate-pulse ${isDarkMode ? "bg-zinc-800/40 border-zinc-700" : "bg-gray-100 border-gray-200"}`}>
        <div className="p-6 space-y-4">
          <div className="h-4 w-32 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/10 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
             <div className="h-20 bg-white/10 rounded-xl" />
             <div className="h-20 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-2xl p-6 border ${isDarkMode ? "bg-zinc-800/60 border-red-500/20 text-white" : "bg-white border-red-200 text-black"} backdrop-blur-xl`}>
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-sm font-medium opacity-70 mb-4">{error}</p>
        <button 
          onClick={fetchWakaStats}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
        >
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col w-full rounded-2xl p-6 transition-all duration-300 shadow-2xl border overflow-hidden ${isDarkMode ? "bg-zinc-800 bg-opacity-60 border-zinc-700 text-white" : "bg-white bg-opacity-80 border-gray-200 text-black"} backdrop-blur-xl font-sans`}>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2 opacity-60">
          <Terminal size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Coding Activity</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={fetchWakaStats} className="opacity-40 hover:opacity-100 transition-opacity p-1"><RefreshCw size={14} /></button>
           <a href="https://wakatime.com" target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 transition-opacity p-1"><ExternalLink size={14} /></a>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* All-time Total Time */}
        <div className="flex items-end gap-3">
          <div className={`p-3 rounded-2xl ${isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50"}`}>
            <Clock className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase opacity-50 mb-0.5">Total Coding Time</p>
            <h2 className="text-3xl font-black tracking-tighter leading-none">
              {stats?.human_readable_total || "0 hrs"}
            </h2>
          </div>
        </div>

        {/* Best Day Info (Data baru dari backend kamu) */}
        {stats?.best_day && (
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
            <Trophy className="w-5 h-5 text-amber-400" />
            <div className="text-xs">
              <span className="opacity-60">Best day: </span>
              <span className="font-bold">{stats.best_day.date}</span>
              <span className="mx-2 opacity-30">|</span>
              <span className="font-bold text-amber-400">{stats.best_day.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Languages */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-black/20 border-white/5" : "bg-gray-50 border-black/5"}`}>
            <div className="flex items-center gap-2 mb-3"><Code2 size={14} className="text-blue-400" /><span className="text-xs font-bold uppercase tracking-wider opacity-70">Last 7 Days</span></div>
            <div className="space-y-3">
              {stats?.languages?.slice(0, 3).map((lang) => (
                <div key={lang.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold"><span>{lang.name}</span><span className="opacity-60">{lang.percent}%</span></div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${lang.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editors & Average */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-black/20 border-white/5" : "bg-gray-50 border-black/5"}`}>
            <div className="flex items-center gap-2 mb-3"><Monitor size={14} className="text-purple-400" /><span className="text-xs font-bold uppercase tracking-wider opacity-70">Environment</span></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col"><span className="text-[9px] uppercase opacity-40 font-black">Top Editor</span><span className="text-xs font-bold">{stats?.editors?.[0]?.name || "VS Code"}</span></div>
                <div className="flex flex-col text-right"><span className="text-[9px] uppercase opacity-40 font-black">Daily Avg</span><span className="text-xs font-bold text-green-400">{stats?.human_readable_daily_average || "0h"}</span></div>
              </div>
              <div className="h-[1px] w-full bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col"><span className="text-[9px] uppercase opacity-40 font-black">Operating System</span><span className="text-xs font-bold">Windows</span></div>
                <div className={`px-2 py-1 rounded text-[10px] font-black ${isDarkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"}`}>VERIFIED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WakatimeProfileCard;