import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { fetchTetrioProfile, fetchHistoricalLeagueData, fetchLeagueFlow, formatTime } from "./tetrioApi";

// Komponen mini untuk menampilkan label dan nilai stat dalam baris horizontal
function InfoRow({ label, value, labelColor = "opacity-60", valueColor = "" }) {
  return (
    <div className="flex justify-between items-center text-xs py-1 border-b border-gray-500/10">
      <span className={`${labelColor} font-medium`}>{label}</span>
      <span className={`${valueColor} font-bold text-right`}>{value}</span>
    </div>
  );
}

export default function TetrioProfileCard({ userId = "684fa6fe12175609312650e8" }) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      fetchTetrioProfile(userId),
      fetchHistoricalLeagueData(userId),
      fetchLeagueFlow(userId)
    ]).then(([profileData, historyData, flowData]) => {
      if (mounted) {
        setProfile(profileData);
        setHistory(historyData);
        setFlow(flowData);
        setLoading(false);
      }
    }).catch((err) => {
      if (mounted) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [userId]);

  if (loading) {
    return (
      <div className={`w-full h-full min-h-[400px] p-4 rounded-xl shadow-lg animate-pulse border flex flex-col gap-3 ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"}`}>
        <div className="flex gap-3 items-center">
          <div className="w-16 h-16 rounded-lg bg-gray-500/10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/2 rounded bg-gray-500/10"></div>
            <div className="h-3 w-3/4 rounded bg-gray-500/10"></div>
          </div>
        </div>
        <div className="h-40 w-full rounded bg-gray-500/10"></div>
        <div className="h-32 w-full rounded bg-gray-500/10"></div>
      </div>
    );
  }

  if (error || !profile) return <div className="text-red-500 p-4 border rounded-xl bg-red-500/10">Error: {error}</div>;

  // ✅ FIXED v2: Gunakan nullish coalescing (??) alih-alih logical OR (||)
  const qpData = profile.quickplay;
  const qpDisplay = qpData?.displayValue ?? "—";  // ← Ganti || dengan ??
  const qpRank = qpData?.rank ?? -1;               // ← Ganti || dengan ??
  
  const rankColor = getRankColor(profile.league?.rank);
  const textColor = isDarkMode ? "text-gray-100" : "text-gray-900";
  const bgCard = isDarkMode ? "bg-zinc-800 border-gray-700 border-b-0" : "bg-white border-black border-b-0";
  const bgAlt = isDarkMode ? "bg-white/5" : "bg-black/5";

  return (
    // Menggunakan h-full agar mengisi col-span-3 secara responsif
    <div className={`w-full h-full flex flex-col rounded-xl overflow-hidden border shadow-lg ${bgCard} ${textColor} text-sm transition-all relative`}>
      {/* TITLE */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-500/10">
        <h1 className={`text-3xl font-bold font-lyrae tracking-widest ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Tetr.io
        </h1>
      </div>

      {/* HEADER SECTION - Tanpa banner yang memakan tempat */}
      <div className="p-4 border-b border-gray-500/10 flex items-center gap-4">
        {/* Avatar Area */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-zinc-700 shadow-md bg-zinc-900">
          <img 
            src={profile.avatar || "https://tetr.io/res/avatar.png"} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
          {profile.supporter && (
            <div className="absolute top-0.5 right-0.5 bg-yellow-400 text-black text-[8px] font-bold px-1 py-0.5 rounded shadow">★</div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-[100px]">
          <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2 truncate">
            {profile.username}
            {profile.country && <span className="text-base flex-shrink-0" title={profile.country}>{countryFlag(profile.country)}</span>}
          </h1>
          <div className="flex flex-col gap-0.5 text-[10px] opacity-70 font-medium">
            <span>⏱️ {profile.play_time_readable || "0h"} playtime</span>
            <span>🎮 {profile.gamesplayed?.toLocaleString() || 0} games played</span>
          </div>
        </div>

        {/* Top Rank Badge */}
        {profile.league && (
          <div className={`flex flex-col items-center justify-center p-2 rounded-lg border flex-shrink-0 min-w-[70px] ${bgAlt} border-gray-500/10`}>
            <span className="text-[8px] uppercase tracking-widest opacity-60 mb-0.5">League</span>
            <span className={`text-2xl leading-none font-black ${rankColor.replace('bg-', 'text-').replace('600', '400')}`}>
              {profile.league.rank.toUpperCase()}
            </span>
            <span className="text-[9px] font-bold opacity-80 mt-1">{profile.league.tr} TR</span>
          </div>
        )}
      </div>

      {/* OVERVIEW STATS ROW - Data penting diletakkan di atas */}
      <div className="p-4 py-2 grid grid-cols-2 gap-x-4 border-b border-gray-500/10">
        <div className="col-span-1 border-r border-gray-500/10 pr-4">
          <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Attack
          </h3>
          <InfoRow label="APM" value={profile.league?.apm?.toFixed(2)} labelColor="text-red-400/80" valueColor="text-red-400" />
          <InfoRow label="VS" value={profile.league?.vs?.toFixed(2)} labelColor="text-green-400/80" valueColor="text-green-400" />
        </div>
        <div className="col-span-1 pl-1">
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Pieces
          </h3>
          <InfoRow label="PPS" value={profile.league?.pps?.toFixed(2)} labelColor="text-blue-400/80" valueColor="text-blue-400" />
          <InfoRow label="Win%" value={`${profile.winrate}%`} valueColor="text-yellow-400" />
        </div>
      </div>

      {/* MAIN CONTENT AREA - Area scroll untuk Records dan History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {/* RECORDS SECTION */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
            🏆 Best Records
          </h3>
          
          {/* Grid 2x2 untuk 4 mode agar simetris dan rapi */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* 1. 40 LINES (TEMA BIRU) */}
            <div className={`p-3 rounded-xl border flex flex-col relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? "bg-blue-900/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
              {/* Icon background transparan */}
              <div className="absolute -bottom-2 -right-2 text-5xl opacity-5 pointer-events-none">⏱️</div>
              
              <div className="flex justify-between items-start mb-2 z-10">
                <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">40 Lines</h4>
                {profile.lines40?.rank && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-200 text-blue-700"}`}>
                    #{profile.lines40.rank}
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black z-10 tracking-tight">
                {profile.lines40?.time ? formatTime(profile.lines40.time) : "—"}
              </div>
              
              {profile.lines40?.time && (
                <div className="flex justify-between mt-auto pt-3 z-10 border-t border-blue-500/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">{profile.lines40.pps}</span>
                    <span className="text-[8px] opacity-60 uppercase">PPS</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[11px] font-bold text-yellow-500">{profile.lines40.finesse}</span>
                    <span className="text-[8px] opacity-60 uppercase">Faults</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] font-bold">{profile.lines40.kpp?.toFixed(2)}</span>
                    <span className="text-[8px] opacity-60 uppercase">KPP</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. BLITZ (TEMA UNGU) */}
            <div className={`p-3 rounded-xl border flex flex-col relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? "bg-purple-900/10 border-purple-500/20" : "bg-purple-50 border-purple-200"}`}>
              <div className="absolute -bottom-2 -right-2 text-5xl opacity-5 pointer-events-none">⚡</div>
              
              <div className="flex justify-between items-start mb-2 z-10">
                <h4 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Blitz</h4>
                {profile.blitz?.rank && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-200 text-purple-700"}`}>
                    #{profile.blitz.rank}
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black z-10 tracking-tight">
                {profile.blitz?.score?.toLocaleString() || "—"}
              </div>
              
              {profile.blitz?.score && (
                <div className="flex justify-between mt-auto pt-3 z-10 border-t border-purple-500/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">{profile.blitz.sps}</span>
                    <span className="text-[8px] opacity-60 uppercase">SPS</span>
                  </div>
                  <div className="flex flex-col text-center">
                    <span className="text-[11px] font-bold">{profile.blitz.quads}</span>
                    <span className="text-[8px] opacity-60 uppercase">Quads</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] font-bold text-yellow-500">{profile.blitz.finesse}</span>
                    <span className="text-[8px] opacity-60 uppercase">Faults</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 3. QUICK PLAY (TEMA HIJAU) */}
            <div className={`p-3 rounded-xl border flex flex-col relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? "bg-green-900/10 border-green-500/20" : "bg-green-50 border-green-200"}`}>
              <div className="absolute -bottom-2 -right-2 text-5xl opacity-5 pointer-events-none">🏔️</div>
              
              <div className="flex justify-between items-start mb-2 z-10">
                <h4 className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Quick Play</h4>
                {/* ✅ FIXED: Parse rank sebagai integer & cek != -1 */}
                {qpRank && qpRank !== -1 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? "bg-green-500/20 text-green-300" : "bg-green-200 text-green-700"}`}>
                    #{Math.round(qpRank).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="text-xl sm:text-2xl font-black z-10 tracking-tight mt-auto">
                {/* ✅ FIXED: Gunakan ?? untuk handle nilai 0 */}
                {qpDisplay !== "—" ? `${qpDisplay}m` : "—"}

                {/* Career Best dengan sanitasi lengkap */}
                {(qpData?.careerBest ?? 0) > 0 && qpData?.careerBest !== qpDisplay && (
                  <div className="text-[9px] opacity-60 mt-1">
                    Best: {qpData.careerBest}m
                  </div>
                )}
              </div>
            </div>

            {/* 4. ZEN MODE (TEMA PINK) */}
            <div className={`p-3 rounded-xl border flex flex-col relative overflow-hidden transition-all hover:scale-[1.02] ${isDarkMode ? "bg-pink-900/10 border-pink-500/20" : "bg-pink-50 border-pink-200"}`}>
              <div className="absolute -bottom-2 -right-2 text-5xl opacity-5 pointer-events-none">🌸</div>
              
              <div className="flex justify-between items-start mb-2 z-10">
                <h4 className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Zen Mode</h4>
              </div>
              
              <div className="flex flex-col mt-auto z-10">
                <div className="text-xl sm:text-2xl font-black tracking-tight">
                  {profile.zen?.level ? `Lvl ${profile.zen.level}` : "—"}
                </div>
                {profile.zen?.score && (
                  <div className="text-[10px] font-medium opacity-70 mt-1 border-t border-pink-500/10 pt-1">
                    Score: {Number(profile.zen.score).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* MATCH HISTORY SECTION */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Recent Matches</h3>
          <div className={`rounded-lg border overflow-hidden ${bgAlt} border-gray-500/10`}>
            {flow && flow.points && flow.points.length > 0 ? (
              <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <tbody className="divide-y divide-gray-500/5">
                    {[...flow.points].reverse().slice(0, 15).map((pt, idx) => {
                      const isWin = pt[1] === 1 || pt[1] === 3;
                      const isLoss = pt[1] === 2 || pt[1] === 4;
                      const date = new Date(flow.startTime + pt[0]);
                      const trColor = isDarkMode ? pt[2] >= 1000 ? "text-red-400" : pt[2] >= 500 ? "text-yellow-400" : "text-gray-200" : "text-gray-900";
                      return (
                        <tr key={idx} className={`transition-colors hover:bg-white/5`}>
                          <td className={`px-3 py-2 font-black ${isWin ? (isDarkMode ? 'text-green-400' : 'text-green-600') : isLoss ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 'text-gray-400'}`}>
                            {isWin ? "WIN" : isLoss ? "LOSS" : "DRAW"}
                          </td>
                          <td className="px-3 py-2 opacity-70 text-[10px]">
                            {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className={`px-3 py-2 font-mono ${trColor}`}>
                            {pt[2].toFixed(0)} <span className="text-[9px] opacity-60">TR</span>
                          </td>
                          <td className="px-3 py-2 text-right opacity-60 text-[10px]">
                            vs {pt[3].toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 py-8 text-center text-xs opacity-50 italic">No recent match data available.</div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

// Helpers
function getRankColor(rank) {
  if (!rank || typeof rank !== "string") return "bg-gray-600 text-white"; 
  
  const r = rank.toLowerCase();
  if (r.includes("x")) return "bg-red-600 text-white";
  if (r.includes("s")) return "bg-yellow-500 text-black";
  if (r.includes("a")) return "bg-green-600 text-white";
  if (r.includes("b")) return "bg-blue-600 text-white";
  if (r.includes("c")) return "bg-indigo-600 text-blue";
  if (r.includes("d")) return "bg-gray-600 text-white";
  return "bg-gray-600 text-white";
}

function countryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  return String.fromCodePoint(...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0)));
}