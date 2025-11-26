// TetrioProfileCard.jsx
import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { fetchTetrioProfile, fetchTetrioAchievements, getAchievementTier } from "./tetrioApi.jsx";
import TetrioAchievementsSection from "./TetrioAchievementsSection.jsx";

export default function TetrioProfileCard({
  userId = "684fa6fe12175609312650e8",
  showNews = true,
  compact = false, // tambahan
}) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNews, setExpandedNews] = useState(false); // tambahan
  const [topAchievement, setTopAchievement] = useState(null); // tambahan

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    setTopAchievement(null);

    Promise.all([
      fetchTetrioProfile(userId),
      fetchTetrioAchievements(userId),
    ])
      .then(([p, achievements]) => {
        if (!mounted) return;
        setProfile(p);

        // get highest tier achievement
        if (achievements && achievements.length > 0) {
          let highest = null;
          let highestScore = -1;

          achievements.forEach((ach) => {
            if (ach.data && typeof ach.data.score === "number") {
              if (ach.data.score > highestScore) {
                highestScore = ach.data.score;
                highest = ach;
              }
            }
          });

          if (highest) {
            setTopAchievement(highest);
          }
        }
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
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div
          className={`w-8 h-8 border-4 ${
            isDarkMode ? "border-indigo-400" : "border-indigo-600"
          } border-t-transparent rounded-full animate-spin`}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4 bg-red-900/10 border border-red-500/20 rounded-md">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!profile) return null;

  const rankColor = getRankColor(profile.league?.rank);

  return (
    <div
      className={`relative cursor-target flex items-center gap-4 w-full max-w-xl rounded-xl p-4 transition-all duration-300 shadow-md
      ${isDarkMode
        ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0"
        : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
      } backdrop-blur-sm`}
    >
      {/* Avatar */}
      <div className="relative group">
        <img
          src={profile.avatar || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMDAnIGhlaWdodD0nMzAwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDgsMTAsNiwxKTsnPjxnIHN0eWxlPSdmaWxsOnJnYmEoMTQ4LDIwMiw0MywxKTsgc3Ryb2tlOnJnYmEoMTQ4LDIwMiw0MywxKTsgc3Ryb2tlLXdpZHRoOjEuNTsnPjxyZWN0ICB4PScxMjknIHk9JzE3MScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzEyOScgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nODcnIHk9JzQ1JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nMTcxJyB5PSc0NScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9Jzg3JyB5PSc4Nycgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzE3MScgeT0nODcnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PSc4NycgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nMTcxJyB5PScyMTMnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PSc0NScgeT0nNDUnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PScyMTMnIHk9JzQ1JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nNDUnIHk9JzEyOScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzIxMycgeT0nMTI5JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nNDUnIHk9JzIxMycgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzIxMycgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48L2c+PC9zdmc+"}
          alt="Tetr.io Avatar"
          className="w-24 h-24 rounded-lg object-cover transition-transform duration-200 group-hover:scale-110"
        />
        {/* badge supporter */}
        {profile.supporter && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black"
            title="Supporter">
            ★
          </div>
        )}
        
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://tetr.io/u/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  font-bold truncate bg-clip-text text-transparent
                  bg-gradient-to-r from-green-400 to-green-500
                  transition-all duration-200 hover:brightness-110 hover:underline hover:cursor-pointer font-mono text-base
                `}
              >
                {profile.username}
              </a>

              {/* country */}
              {profile.country && (
                <span className="text-xs opacity-80 flex items-center gap-1">
                  {countryFlag(profile.country)}
                  {profile.country}
                </span>
              )}

              {/* rank pill */}
              {profile.league?.rank && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rankColor} text-white`}
                >
                  {profile.league.rank.toUpperCase()}
                </span>
              )}
            </div>

            <div className="text-xs mt-1 text-gray-400 space-x-2">
              {profile.xp && (
                <span className={isDarkMode ? 'text-yellow-400 font-bold' : 'text-yellow-800 font-bold'}>
                  {Number(profile.xp).toLocaleString()} XP
                </span>
              )}
              {profile.join_relative && (
                <>
                  <span>•</span>
                  <span>{profile.join_relative}</span>
                </>
              )}
              {profile.play_time_readable && (
                <>
                  <span>•</span>
                  <span>⏱ {profile.play_time_readable}</span>
                </>
              )}
            </div>
          </div>

          {/* right small stats */}
          <div className="text-right text-xs min-w-fit">
            <div className="text-sm font-bold transition-all duration-200 hover:scale-105 hover:text-indigo-300">
              TR {profile.league?.tr ?? "—"}
            </div>

            <div className="text-gray-400 mt-1">
              {profile.league?.standing ? `#${profile.league.standing}` : "Unranked"}
            </div>

            {profile.league?.percentile !== null && profile.league?.percentile !== undefined && (
              <div className="text-xs text-purple-400 mt-1">
                Top {(profile.league.percentile * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {/* middle line: games / wins / winrate / apm pps vs */}
        {!compact && (
          <>
            <div className="flex items-center justify-between mt-3 text-sm font-mono gap-4">
              <div className="flex-1">
                <div className="text-sm">
                  Games: <span className="font-semibold">{profile.gamesplayed ?? "—"}</span>
                  <span className="mx-2">•</span>
                  Wins: <span className="font-semibold">{profile.gameswon ?? "—"}</span>
                  {profile.winrate != null && (
                    <span className="ml-2 text-xs text-cyan-400">({profile.winrate}%)</span>
                  )}
                </div>
                <div className=" text-xs space-x-2 mt-2">
                  <span className="text-red-400 font-bold font-mono">APM: {formatNumber(profile.league?.apm)}</span>
                  <span className="text-blue-400 font-bold font-mono">PPS: {formatNumber(profile.league?.pps)}</span>
                  <span className="text-green-400 font-bold font-mono">VS: {formatNumber(profile.league?.vs)}</span>
                </div>
              </div>

              <div className="text-xs text-right min-w-fit">
                <div className="text-gray-400">Friends</div>
                <div className="font-semibold">{profile.friend_count ?? 0}</div>
              </div>
            </div>

            {/* Zen mode info */}
            {profile.zen && (
              <div className="mt-2 text-xs bg-opacity-40 bg-purple-900 p-2 rounded-md">
                <span className="text-purple-300 font-semibold">Zen:</span>
                <span className="ml-2">Level {profile.zen.level ?? "—"}</span>
                <span className="mx-2">•</span>
                <span>Score {Number(profile.zen.score ?? 0).toLocaleString()}</span>
              </div>
            )}

            {/* Highest achievement */}
            {topAchievement && (
              <div className="mt-2 text-xs bg-opacity-40 bg-blue-900 p-2 rounded-md flex items-center gap-2">
                <span className="text-blue-300 font-semibold">🏆 Achievement:</span>
                <span className="text-blue-200">{topAchievement.name ?? "Unknown"}</span>
                {topAchievement.tier && (
                  <span className={`ml-auto px-2 py-0.5 rounded text-white text-xs font-bold bg-${getMedalBgColor(topAchievement.tier)}`}>
                    {topAchievement.tier.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {/* latest news (compact) */}
            {showNews && profile.latest && profile.latest.length > 0 && (
              <div className="mt-3 text-xs text-gray-300">
                <div
                  className="text-xs text-gray-400 mb-1 font-semibold cursor-pointer hover:text-gray-200 transition"
                  onClick={() => setExpandedNews(!expandedNews)}
                >
                  📰 LATEST {profile.latest.length > 3 ? `(${expandedNews ? "−" : "+"}${profile.latest.length - 3})` : ""}
                </div>
                <ul className="list-inside list-disc space-y-1">
                  {profile.latest.slice(0, expandedNews ? profile.latest.length : 3).map((n, i) => (
                    <li key={i} className="truncate text-gray-300 hover:text-gray-100 transition">
                      {n.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* info icon (hover popup) */}
      <div className="absolute bottom-2 right-2 group cursor-pointer">
        <div
          className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold
            ${isDarkMode ? "bg-zinc-700 text-white" : "bg-gray-300 text-black"}
            transition-all duration-200 hover:scale-110`}
          title="Info"
        >
          i
        </div>

        {/* tooltip popup */}
        <div
          className={`absolute bottom-7 right-0 w-72 text-xs rounded-md p-3 shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-300 z-50
            ${isDarkMode ? "bg-zinc-600 text-gray-200" : "bg-white text-gray-800"}`}
        >
          <p className="font-mono mb-2"><span className="text-red-400 font-bold">APM</span> - Attacks Per Minute</p>
          <p className="font-mono mb-2"><span className="text-blue-400 font-bold">PPS</span> - Pieces Per Second</p>
          <p className="font-mono mb-2"><span className="text-green-400 font-bold">VS</span> - Versus Score</p>
          <p className="font-mono mb-2"><span className="text-yellow-400 font-bold">TR</span> - Tetra Rating</p>
          <p className="font-mono"><span className="text-purple-400 font-bold">GXE</span> - Glixare (% vs avg)</p>
        </div>
      </div>
    </div>
  );
}

/* rank -> tailwind bg mapping (extended) */
function getRankColor(rank) {
  if (!rank) return "bg-gray-500";
  const r = rank.toLowerCase();
  if (r === "x") return "bg-red-600 shadow-lg shadow-red-500/50";
  if (r === "x+") return "bg-red-700 shadow-lg shadow-red-600/50";
  if (r === "ss") return "bg-yellow-500";
  if (r === "s+") return "bg-yellow-600";
  if (r === "s") return "bg-yellow-700";
  if (r === "s-") return "bg-orange-500";
  if (r.startsWith("a")) return "bg-green-600";
  if (r.startsWith("b")) return "bg-blue-600";
  if (r.startsWith("c")) return "bg-indigo-600";
  if (r.startsWith("d")) return "bg-gray-600";
  return "bg-gray-500";
}

/* convert country code -> emoji flag */
function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0))
  );
}

/* format number helper */
function formatNumber(num) {
  if (num == null) return "—";
  if (typeof num === "number") {
    return num.toFixed(2);
  }
  return "—";
}

/* medal tier -> bg color */
function getMedalBgColor(tier) {
  if (!tier) return "gray-600";
  const t = tier.toLowerCase();
  if (t === "diamond") return "cyan-600";
  if (t === "platinum") return "slate-600";
  if (t === "gold") return "yellow-600";
  if (t === "silver") return "gray-600";
  if (t === "bronze") return "orange-600";
  return "gray-600";
}