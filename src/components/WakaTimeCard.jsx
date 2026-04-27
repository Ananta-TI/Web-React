import React, { useState, useEffect, useContext, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { 
  Code2, 
  Clock, 
  Terminal, 
  ExternalLink, 
  RefreshCw, 
  Monitor,
  AlertCircle,
  Trophy,
  Calendar
} from "lucide-react";

const WakatimeProfileCard = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWakaStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Menggunakan relative path agar bekerja di localhost (via vercel dev) dan produksi
      const response = await fetch("/api/wakatime");

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           throw new Error("Server mengembalikan HTML. Pastikan file api/wakatime.js sudah terdeploy.");
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const json = await response.json();
      if (json?.data) {
        setStats(json.data);
      } else {
        throw new Error("Data tidak valid.");
      }
    } catch (err) {
      console.error("WakaTime Fetch Error:", err);
      setError(err.message || "Gagal mengambil data.");
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-2xl p-6 border ${isDarkMode ? "bg-zinc-800/60 border-red-500/20 text-white" : "bg-white border-red-200 text-black"} backdrop-blur-xl`}>
        <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
        <p className="text-sm font-medium opacity-70 mb-4">{error}</p>
        <button onClick={fetchWakaStats} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold transition-all">
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col w-full rounded-2xl p-6 transition-all duration-300 shadow-2xl border overflow-hidden ${isDarkMode ? "bg-zinc-800 bg-opacity-60 border-zinc-700 text-gray-100" : "bg-gray-100 bg-opacity-80 border-gray-800 text-black"} backdrop-blur-xl font-sans`}>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Header Statis mirip Discord Card */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2 opacity-60">
          <Terminal size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Coding Stats</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={fetchWakaStats} className="opacity-30 hover:opacity-100 p-1"><RefreshCw size={14} /></button>
           <a href="https://wakatime.com" target="_blank" rel="noreferrer" className="opacity-30 hover:opacity-100 p-1"><ExternalLink size={14} /></a>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* ROW: All-time & Weekly */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 opacity-50">
              <Clock size={12} />
              <p className="text-[10px] font-bold uppercase tracking-tight">Total All-time</p>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">
              {stats?.total_all_time || "0 hrs"}
            </h2>
          </div>

          <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
            <div className="flex items-center gap-1.5 opacity-50">
              <Calendar size={12} />
              <p className="text-[10px] font-bold uppercase tracking-tight">This Week</p>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tighter leading-none text-indigo-400">
              {stats?.total_7_days || "0 hrs"}
            </h2>
          </div>
        </div>

        {/* Best Day Info */}
        {stats?.best_day && (
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDarkMode ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-[11px]">
              <span className="opacity-60">Best day: </span>
              <span className="font-bold">{stats.best_day.date}</span>
              <span className="mx-2 opacity-30">|</span>
              <span className="font-bold text-amber-400">{stats.best_day.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Languages Breakdown */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-black/20 border-white/5" : "bg-gray-50 border-black/5"}`}>
            <div className="flex items-center gap-2 mb-3"><Code2 size={14} className="text-blue-400" /><span className="text-xs font-bold uppercase tracking-wider opacity-70">Languages</span></div>
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

          {/* Environment Info */}
          <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-black/20 border-white/5" : "bg-gray-50 border-black/5"}`}>
            <div className="flex items-center gap-2 mb-3"><Monitor size={14} className="text-purple-400" /><span className="text-xs font-bold uppercase tracking-wider opacity-70">Environment</span></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col"><span className="text-[9px] uppercase opacity-40 font-black">Top Editor</span><span className="text-xs font-bold">{stats?.editors?.[0]?.name || "VS Code"}</span></div>
                <div className="flex flex-col text-right"><span className="text-[9px] uppercase opacity-40 font-black">Daily Avg</span><span className="text-xs font-bold text-green-400">{stats?.daily_average || "0h"}</span></div>
              </div>
              <div className="h-[1px] w-full bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="flex flex-col"><span className="text-[9px] uppercase opacity-40 font-black">OS</span><span className="text-xs font-bold">Windows</span></div>
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