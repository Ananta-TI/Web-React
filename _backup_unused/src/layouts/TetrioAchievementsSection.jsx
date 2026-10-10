// TetrioAchievementsSection.jsx
import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { fetchTetrioAchievements } from "./tetrioApi.jsx";

export default function TetrioAchievementsSection({
  userId = "684fa6fe12175609312650e8",
  maxDisplay = 12, // show top 12 achievements
}) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchTetrioAchievements(userId)
      .then((achs) => {
        if (!mounted) return;

        // sort by rank descending (diamond first), then by score
        const sorted = (achs || []).sort((a, b) => {
          const rankA = a.rank ?? 0;
          const rankB = b.rank ?? 0;
          if (rankA !== rankB) return rankB - rankA;
          const scoreA = a.data?.v ?? -Infinity;
          const scoreB = b.data?.v ?? -Infinity;
          return scoreB - scoreA;
        });

        setAchievements(sorted.slice(0, maxDisplay));
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || String(e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId, maxDisplay]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div
          className={`w-6 h-6 border-4 ${
            isDarkMode ? "border-indigo-400" : "border-indigo-600"
          } border-t-transparent rounded-full animate-spin`}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-md">
        <p className="text-red-400 text-xs">Error: {error}</p>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className={`p-4 rounded-md text-center text-sm opacity-60
        ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}>
        No achievements yet
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-xl rounded-xl p-4 transition-all duration-300 shadow-md
      ${isDarkMode
        ? "bg-zinc-800 bg-opacity-60 border border-gray-600"
        : "bg-gray-100 bg-opacity-80 border border-gray-800"
      } backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg font-bold text-yellow-400">🏆</span>
        <h2 className="text-sm font-bold uppercase tracking-wide">Achievements</h2>
        <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded ${
          isDarkMode ? "bg-zinc-700 text-gray-300" : "bg-gray-300 text-gray-800"
        }`}>
          {achievements.length} shown
        </span>
      </div>

      {/* Grid of achievements */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {achievements.map((ach, idx) => {
          const tierInfo = getRankInfo(ach.rank);
          const achievementImg = getAchievementImage(ach.k);

          return (
            <div
              key={idx}
              className={`relative group cursor-pointer transition-all duration-200 transform hover:scale-110 hover:-translate-y-2`}
              title={ach.name || "Achievement"}
            >
              {/* Medal/Badge Container */}
              <div className={`relative w-full aspect-square rounded-full flex items-center justify-center
                ${tierInfo.containerBg} ${tierInfo.border} border-2 shadow-lg
                transition-all duration-200 group-hover:shadow-2xl group-hover:${tierInfo.glow}`}>
                
                {/* Inner circle with image */}
                <div className={`w-4/5 h-4/5 rounded-full flex items-center justify-center overflow-hidden relative
                  ${tierInfo.innerBg} shadow-inner`}>
                  
                  {/* Achievement image */}
                  <img
                    src={achievementImg}
                    alt={ach.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4Ij48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIyNCIgeT0iMjgiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj8gPC90ZXh0Pjwvc3ZnPg==`;
                    }}
                  />

                  {/* Shine effect */}
                  <div className="absolute top-1 left-1 w-1/4 h-1/4 rounded-full opacity-40"
                    style={{ background: tierInfo.shine }} />
                </div>

                {/* Rank badge at bottom */}
                {ach.rank && ach.rank !== 0 && (
                  <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                    px-2 py-1 rounded-full text-white text-xs font-bold ${tierInfo.badgeBg}
                    shadow-md border border-white/30`}>
                    {tierInfo.label}
                  </div>
                )}
              </div>

              {/* Tooltip on hover */}
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 rounded text-xs font-semibold whitespace-nowrap
                opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50
                ${isDarkMode ? "bg-zinc-700 text-gray-100" : "bg-gray-700 text-white"}`}>
                <div className="font-bold">{ach.name || "Unknown"}</div>
                <div className="text-gray-400 text-xs">{ach.objectice || ""}</div>
              </div>

              {/* Score/Value display */}
              <div className="mt-2 text-center">
                <p className="text-xs font-bold text-gray-300">
                  {formatAchievementValue(ach.data?.v, ach.vt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Rank to color & label mapping */
function getRankInfo(rank) {
  const rankMap = {
    5: { // DIAMOND
      label: "◆",
      containerBg: "bg-gradient-to-br from-cyan-300 to-cyan-500",
      innerBg: "bg-gradient-to-br from-cyan-100 to-cyan-200",
      border: "border-cyan-400",
      badgeBg: "bg-cyan-600",
      shine: "#ffffff",
      glow: "shadow-cyan-500/50",
    },
    4: { // PLATINUM
      label: "■",
      containerBg: "bg-gradient-to-br from-slate-300 to-slate-400",
      innerBg: "bg-gradient-to-br from-slate-100 to-slate-200",
      border: "border-slate-400",
      badgeBg: "bg-slate-600",
      shine: "#ffffff",
      glow: "shadow-slate-500/50",
    },
    3: { // GOLD
      label: "●",
      containerBg: "bg-gradient-to-br from-yellow-300 to-yellow-500",
      innerBg: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      border: "border-yellow-400",
      badgeBg: "bg-yellow-600",
      shine: "#fef3c7",
      glow: "shadow-yellow-500/50",
    },
    2: { // SILVER
      label: "○",
      containerBg: "bg-gradient-to-br from-gray-300 to-gray-400",
      innerBg: "bg-gradient-to-br from-gray-100 to-gray-200",
      border: "border-gray-400",
      badgeBg: "bg-gray-600",
      shine: "#ffffff",
      glow: "shadow-gray-500/50",
    },
    1: { // BRONZE
      label: "◇",
      containerBg: "bg-gradient-to-br from-orange-300 to-orange-500",
      innerBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      border: "border-orange-400",
      badgeBg: "bg-orange-600",
      shine: "#fed7aa",
      glow: "shadow-orange-500/50",
    },
    100: { // ISSUED
      label: "★",
      containerBg: "bg-gradient-to-br from-purple-300 to-purple-500",
      innerBg: "bg-gradient-to-br from-purple-100 to-purple-200",
      border: "border-purple-400",
      badgeBg: "bg-purple-600",
      shine: "#e9d5ff",
      glow: "shadow-purple-500/50",
    },
    0: { // NONE/UNRANKED
      label: "◉",
      containerBg: "bg-gradient-to-br from-gray-400 to-gray-600",
      innerBg: "bg-gradient-to-br from-gray-200 to-gray-300",
      border: "border-gray-500",
      badgeBg: "bg-gray-700",
      shine: "#d1d5db",
      glow: "shadow-gray-600/50",
    },
  };

  return rankMap[rank] || rankMap[0];
}

/* Get achievement image URL */
function getAchievementImage(achievementId) {
  // TETR.IO achievement images hosted at tetr.io cdn
  return `https://tetr.io/res/big-ach/${achievementId}.png`;
}

/* Format achievement value based on type */
function formatAchievementValue(value, valueType) {
  if (value == null) return "—";

  const v = Number(value);

  switch (valueType) {
    case 0: // NONE
      return "—";
    case 1: // NUMBER
      if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
      if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
      return Math.round(v).toString();
    case 2: // TIME (milliseconds)
      return formatTime(v);
    case 3: // TIME_INV (negative milliseconds - negate before display)
      return formatTime(Math.abs(v));
    case 4: // FLOOR (altitude)
      return `FL ${Math.round(v)}`;
    case 5: // ISSUE (negative time of issue)
      return "✓";
    case 6: // NUMBER_INV (negative number - negate before display)
      if (Math.abs(v) >= 1000000) return `${(Math.abs(v) / 1000000).toFixed(1)}M`;
      if (Math.abs(v) >= 1000) return `${(Math.abs(v) / 1000).toFixed(1)}K`;
      return Math.round(Math.abs(v)).toString();
    default:
      return "—";
  }
}

/* Format time in milliseconds */
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}