import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import {
  fetchTetrioProfile,
  fetchHistoricalLeagueData,
  fetchLeagueFlow,
  formatTime,
} from "./tetrioApi.jsx";

function StatBadge({ label, value, colorClass, isDarkMode }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all duration-300 hover:scale-105 ${
        isDarkMode
          ? "border-white/10 bg-white/5 hover:bg-white/10"
          : "border-black/10 bg-black/5 hover:bg-black/10"
      }`}
    >
      <span className="mb-1 text-[9px] uppercase tracking-[0.2em] opacity-50">
        {label}
      </span>
      <span className={`text-lg font-black ${colorClass}`}>{value}</span>
    </div>
  );
}

export default function TetrioProfileCard({
  userId = "684fa6fe12175609312650e8",
}) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(null);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    setWarning(null);

    const results = await Promise.allSettled([
      fetchTetrioProfile(userId),
      fetchHistoricalLeagueData(userId),
      fetchLeagueFlow(userId),
    ]);

    const profileResult = results[0];

    if (profileResult.status !== "fulfilled") {
      setError(profileResult.reason?.message || "Failed fetching TETR.IO user");
      setLoading(false);
      return;
    }

    setProfile(profileResult.value);
    setHistory(results[1].status === "fulfilled" ? results[1].value : null);
    setFlow(results[2].status === "fulfilled" ? results[2].value : null);

    if (results[1].status !== "fulfilled" || results[2].status !== "fulfilled") {
      setWarning("Sebagian data opsional gagal dimuat, tapi profil utama tetap jalan.");
    }

    setLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!mounted) return;
      await loadData();
    }

    run();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const textColor = isDarkMode ? "text-gray-100" : "text-gray-900";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-500";
  const cardClass = isDarkMode
    ? "border-gray-700 bg-zinc-900/90"
    : "border-gray-200 bg-white";
  const badgeClass = isDarkMode ? "bg-white/10" : "bg-black/10";

  if (loading) {
    return (
      <div
        className={`min-h-[500px] w-full animate-pulse rounded-2xl border p-6 shadow-2xl ${
          isDarkMode ? "border-zinc-700/50 bg-zinc-900/80" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-2xl bg-gray-500/20" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/2 rounded bg-gray-500/20" />
            <div className="h-4 w-1/3 rounded bg-gray-500/20" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-500/20" />
          ))}
        </div>
        <div className="mt-6 h-48 rounded-xl bg-gray-500/20" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 font-mono text-sm text-red-400">
        ⚠️ Error: {error || "TETR.IO profile tidak ditemukan"}
        <button
          onClick={loadData}
          className="mt-4 block rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const rankColor = getRankColor(profile.league?.rank);
  const qpDisplay = profile.quickplay?.displayValue ?? "—";
  const qpRank = profile.quickplay?.rank ?? -1;

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${cardClass} ${textColor}`}
    >
      <div className="relative overflow-hidden border-b border-gray-500/10 p-6">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <h1
            className={`bg-gradient-to-r bg-clip-text text-2xl font-black uppercase tracking-[0.3em] text-transparent ${
              isDarkMode ? "from-white to-gray-500" : "from-black to-gray-400"
            }`}
          >
            Tetr.io
          </h1>

          <button
            onClick={loadData}
            className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
              isDarkMode
                ? "border-white/10 bg-white/5 hover:bg-white/10"
                : "border-black/10 bg-black/5 hover:bg-black/10"
            }`}
          >
            Refresh
          </button>
        </div>

        <div className="relative z-10 mt-6 flex items-center gap-5">
          <div className="relative h-20 w-20 flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 opacity-40 blur-md" />
            <img
              src={profile.avatar || "https://tetr.io/res/avatar.png"}
              alt={profile.username}
              className="relative h-full w-full rounded-2xl border-2 border-white/20 object-cover shadow-xl"
            />
            {profile.supporter && (
              <div className="absolute -right-2 -top-2 rounded-md bg-yellow-400 px-2 py-1 text-[10px] font-black text-black">
                PRO
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 truncate text-2xl font-extrabold">
              {profile.username}
              {profile.country && (
                <span title={profile.country}>{countryFlag(profile.country)}</span>
              )}
            </h2>

            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80">
              <span className={`${badgeClass} rounded-md px-2 py-1`}>
                ⏱️ {profile.play_time_readable || "0h"}
              </span>
              <span className={`${badgeClass} rounded-md px-2 py-1`}>
                🎮 {profile.gamesplayed?.toLocaleString() || 0} GMS
              </span>
              <span className={`${badgeClass} rounded-md px-2 py-1`}>
                🏆 {profile.winrate || 0}% WR
              </span>
            </div>
          </div>

          {profile.league && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg">
              <span className={`text-4xl font-black leading-none ${rankColor}`}>
                {profile.league.rank?.toUpperCase()}
              </span>
              <span className="mt-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white">
                {profile.league.tr ?? "—"} TR
              </span>
            </div>
          )}
        </div>

        {warning && (
          <div className="relative z-10 mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-500">
            {warning}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 border-b border-gray-500/10 p-4">
        <StatBadge
          label="APM"
          value={profile.league?.apm?.toFixed(2) || "0.00"}
          colorClass="text-red-400"
          isDarkMode={isDarkMode}
        />
        <StatBadge
          label="PPS"
          value={profile.league?.pps?.toFixed(2) || "0.00"}
          colorClass="text-blue-400"
          isDarkMode={isDarkMode}
        />
        <StatBadge
          label="VS"
          value={profile.league?.vs?.toFixed(2) || "0.00"}
          colorClass="text-green-400"
          isDarkMode={isDarkMode}
        />
        <StatBadge
          label="GLICKO"
          value={profile.league?.glicko ? Math.round(profile.league.glicko) : "—"}
          colorClass="text-purple-400"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-1.5 rounded-full bg-indigo-500" />
            <h3 className={`text-xs font-bold uppercase tracking-widest ${subTextColor}`}>
              Mastery Records
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <RecordCard
              title="40 Lines Sprint"
              value={profile.lines40?.time ? formatTime(profile.lines40.time) : "—"}
              meta={
                profile.lines40?.time
                  ? `PPS ${profile.lines40.pps || "—"} · F ${profile.lines40.finesse ?? "—"}`
                  : null
              }
              accent="blue"
              isDarkMode={isDarkMode}
            />

            <RecordCard
              title="Blitz 2 Min"
              value={profile.blitz?.score?.toLocaleString() || "—"}
              meta={profile.blitz?.score ? `SPS ${profile.blitz.sps || "—"}` : null}
              accent="purple"
              isDarkMode={isDarkMode}
            />

            <RecordCard
              title="Quick Play"
              value={qpDisplay !== "—" ? `${qpDisplay}m` : "—"}
              meta={qpRank !== -1 ? `Rank #${Math.round(qpRank).toLocaleString()}` : null}
              accent="emerald"
              isDarkMode={isDarkMode}
            />

            <RecordCard
              title="Zen Mode"
              value={profile.zen?.level ? `Lvl ${profile.zen.level}` : "—"}
              meta={profile.zen?.score ? `Score ${profile.zen.score.toLocaleString()}` : null}
              accent="pink"
              isDarkMode={isDarkMode}
            />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-1.5 rounded-full bg-orange-500" />
            <h3 className={`text-xs font-bold uppercase tracking-widest ${subTextColor}`}>
              Recent Engagements
            </h3>
          </div>

          <div
            className={`overflow-hidden rounded-2xl border ${
              isDarkMode ? "border-white/10 bg-black/20" : "border-black/10 bg-black/5"
            }`}
          >
            {flow?.points?.length > 0 ? (
              <div className="custom-scrollbar max-h-[550px] overflow-y-auto">
                <table className="w-full whitespace-nowrap text-left text-xs">
                  <thead
                    className={`sticky top-0 z-20 backdrop-blur-md ${
                      isDarkMode ? "bg-zinc-800/90" : "bg-gray-200/90"
                    }`}
                  >
                    <tr className="border-b border-gray-500/10 text-[9px] uppercase tracking-widest opacity-60">
                      <th className="px-4 py-3 font-bold">Result</th>
                      <th className="px-3 py-3 text-right font-bold">Rating</th>
                      <th className="px-3 py-3 text-right font-bold">Opponent</th>
                      <th className="px-4 py-3 text-right font-bold">Date</th>
                    </tr>
                  </thead>

                  <tbody className={isDarkMode ? "divide-y divide-white/5" : "divide-y divide-black/5"}>
                    {[...flow.points].reverse().slice(0, 15).map((pt, idx) => {
                      const isWin = pt[1] === 1 || pt[1] === 3;
                      const isLoss = pt[1] === 2 || pt[1] === 4;
                      const rating = Number(pt[2] || 0);
                      const opponent = Number(pt[3] || 0);
                      const date = flow.startTime ? new Date(flow.startTime + pt[0]) : null;

                      return (
                        <tr
                          key={`${pt[0]}-${idx}`}
                          className={isDarkMode ? "hover:bg-white/10" : "hover:bg-black/5"}
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-md px-2 py-1 text-[10px] font-black tracking-wider ${
                                isWin
                                  ? "bg-green-500/20 text-green-500"
                                  : isLoss
                                  ? "bg-red-500/20 text-red-500"
                                  : "bg-gray-500/20 text-gray-500"
                              }`}
                            >
                              {isWin ? "VICTORY" : isLoss ? "DEFEAT" : "DRAW"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-bold">
                            {rating.toFixed(0)} <span className="text-[9px] opacity-50">TR</span>
                          </td>
                          <td className="px-3 py-3 text-right font-mono opacity-80">
                            {opponent.toFixed(0)} TR
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[10px] opacity-60">
                            {date
                              ? date.toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-50">
                <span className="mb-2 text-3xl">👻</span>
                <span className="text-xs uppercase tracking-widest">No Intel Available</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function RecordCard({ title, value, meta, accent, isDarkMode }) {
  const colorMap = {
    blue: {
      border: isDarkMode ? "border-blue-500/20 bg-blue-900/10" : "border-blue-500/30 bg-blue-500/5",
      text: "text-blue-400",
    },
    purple: {
      border: isDarkMode
        ? "border-purple-500/20 bg-purple-900/10"
        : "border-purple-500/30 bg-purple-500/5",
      text: "text-purple-400",
    },
    emerald: {
      border: isDarkMode
        ? "border-emerald-500/20 bg-emerald-900/10"
        : "border-emerald-500/30 bg-emerald-500/5",
      text: "text-emerald-400",
    },
    pink: {
      border: isDarkMode ? "border-pink-500/20 bg-pink-900/10" : "border-pink-500/30 bg-pink-500/5",
      text: "text-pink-400",
    },
  };

  const styles = colorMap[accent] || colorMap.blue;

  return (
    <div className={`rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02] ${styles.border}`}>
      <h4 className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${styles.text}`}>
        {title}
      </h4>
      <div className={isDarkMode ? "text-2xl font-black text-white" : "text-2xl font-black text-gray-900"}>
        {value}
      </div>
      {meta && <div className="mt-3 text-[10px] font-mono opacity-70">{meta}</div>}
    </div>
  );
}

function getRankColor(rank) {
  if (!rank || typeof rank !== "string") return "text-gray-400";

  const r = rank.toLowerCase();

  if (r.includes("x")) return "text-red-400";
  if (r.includes("s")) return "text-yellow-400";
  if (r.includes("a")) return "text-green-400";
  if (r.includes("b")) return "text-blue-400";
  if (r.includes("c")) return "text-indigo-400";
  if (r.includes("d")) return "text-gray-400";

  return "text-gray-400";
}

function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";

  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
  );
}