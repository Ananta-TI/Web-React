// TetrioProfileCard.jsx
import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { fetchTetrioProfile } from "./tetrioApi.jsx";

export default function TetrioProfileCard({
  userId = "684fa6fe12175609312650e8",
  showNews = true,
}) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchTetrioProfile(userId)
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
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
      className={`cursor-target flex items-center gap-4 w-full max-w-xl rounded-xl p-4 transition-all duration-300 shadow-md
      ${
        isDarkMode
          ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0"
          : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
      } backdrop-blur-sm`}
    >
      {/* Avatar */}
      <img
  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMDAnIGhlaWdodD0nMzAwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDgsMTAsNiwxKTsnPjxnIHN0eWxlPSdmaWxsOnJnYmEoMTQ4LDIwMiw0MywxKTsgc3Ryb2tlOnJnYmEoMTQ4LDIwMiw0MywxKTsgc3Ryb2tlLXdpZHRoOjEuNTsnPjxyZWN0ICB4PScxMjknIHk9JzE3MScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzEyOScgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nODcnIHk9JzQ1JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nMTcxJyB5PSc0NScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9Jzg3JyB5PSc4Nycgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzE3MScgeT0nODcnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PSc4NycgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nMTcxJyB5PScyMTMnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PSc0NScgeT0nNDUnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PScyMTMnIHk9JzQ1JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nNDUnIHk9JzEyOScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzIxMycgeT0nMTI5JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nNDUnIHk9JzIxMycgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzIxMycgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48L2c+PC9zdmc+"
  alt="Tetr.io Avatar"
  className="w-24 h-24 rounded-lg object-cover"
/>


      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <a
  href={`https://tetr.io/`}
  target="_blank"
  rel="noopener noreferrer"
  className={`
    font-semibold truncate bg-clip-text text-transparent
    bg-gradient-to-r from-green-400 to-green-800
    transition-all duration-200 hover:brightness-110 hover:underline hover:cursor-none
  `}
>
  {profile.username}
</a>



              {/* country */}
              <span className="text-xs opacity-80">
                {profile.country ? countryFlag(profile.country) : ""}
                {profile.country ? ` ${profile.country}` : ""}
              </span>

              {/* rank pill */}
              {profile.league?.rank && (
                <span
                  className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${rankColor} text-white`}
                >
                  {profile.league.rank.toUpperCase()}
                </span>
              )}
            </div>

            <div className="text-xs mt-1 text-gray-400">
              {/* XP · joined · playtime */}
              <span>{profile.xp ? `${Number(profile.xp).toLocaleString()} XP` : ""}</span>
              <span className="mx-2">•</span>
              <span>{profile.join_relative ?? ""}</span>
              {profile.play_time_readable && (
                <>
                  <span className="mx-2">•</span>
                  <span>Play time: {profile.play_time_readable}</span>
                </>
              )}
            </div>
          </div>

          {/* right small stats */}
          <div className="text-right text-xs">
            <div className="text-sm font-bold transition-all duration-200 hover:scale-105 hover:text-indigo-300">
  TR {profile.league?.tr ?? "—"}
</div>

            <div className="text-gray-400 mt-1">
              {profile.league?.standing ? `#${profile.league.standing}` : "Unranked"}
            </div>
          </div>
        </div>

        {/* middle line: games / wins / winrate / apm pps vs */}
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="text-sm">
            <div>
              Games: <span className="font-semibold">{profile.gamesplayed ?? "—"}</span>
              <span className="mx-2">•</span>
              Wins: <span className="font-semibold">{profile.gameswon ?? "—"}</span>
              {profile.winrate != null && (
                <span className="ml-2 text-xs text-gray-400">({profile.winrate}%)</span>
              )}
            </div>
            <div className="mt-1 text-xs">
  <span className="text-red-400">APM: {profile.league?.apm ?? "—"}</span> •
  <span className="text-blue-400 ml-1">PPS: {profile.league?.pps ?? "—"}</span> •
  <span className="text-green-400 ml-1">VS: {profile.league?.vs ?? "—"}</span>
</div>

          </div>

          <div className="text-xs">
            <div className="text-gray-400">Friends</div>
            <div className="font-semibold">{profile.friend_count ?? 0}</div>
          </div>
        </div>

        {/* latest news (compact) */}
        {showNews && profile.latest && profile.latest.length > 0 && (
          <div className="mt-3 text-xs text-gray-300">
            <div className="text-xs text-gray-400 mb-1 font-semibold">LATEST</div>
            <ul className="list-inside list-disc space-y-1">
              {profile.latest.slice(0, 3).map((n, i) => (
                <li key={i} className="truncate">
                  {n.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* rank -> tailwind bg mapping (simple) */
function getRankColor(rank) {
  if (!rank) return "bg-gray-500";
  const r = rank.toLowerCase();
  if (r.includes("x")) return "bg-red-500";
  if (r.includes("ss") || r.includes("s+")) return "bg-yellow-500";
  if (r.startsWith("s")) return "bg-orange-500";
  if (r.startsWith("a")) return "bg-green-600";
  if (r.startsWith("b")) return "bg-blue-600";
  if (r.startsWith("c")) return "bg-indigo-600";
  if (r.startsWith("d")) return "bg-gray-600";
  return "bg-gray-500";
}

/* convert country code -> emoji flag, fallback empty */
function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  return String.fromCodePoint(
    ...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0))
  );
}
