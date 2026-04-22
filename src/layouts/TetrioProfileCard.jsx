import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { fetchTetrioProfile, fetchHistoricalLeagueData, fetchLeagueFlow, formatTime } from "./tetrioApi";

// Helper Component untuk Stat
function StatBadge({ label, value, colorClass, isDarkMode }) {
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-300 hover:scale-105 group ${
      isDarkMode 
        ? "bg-white/5 border-white/10 hover:bg-white/10" 
        : "bg-black/5 border-black/10 hover:bg-black/10"
    } backdrop-blur-sm`}>
      <span className="text-[9px] uppercase tracking-[0.2em] opacity-50 group-hover:opacity-100 transition-opacity mb-1">{label}</span>
      <span className={`text-lg font-black ${colorClass} drop-shadow-md`}>{value}</span>
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
      <div className={`w-full h-full min-h-[500px] p-6 rounded-2xl shadow-2xl animate-pulse border flex flex-col gap-4 ${isDarkMode ? "bg-zinc-900/80 border-zinc-700/50" : "bg-white/80 border-gray-200"} backdrop-blur-xl`}>
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-500/20"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/2 rounded bg-gray-500/20"></div>
            <div className="h-4 w-1/3 rounded bg-gray-500/20"></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
           {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-500/20"></div>)}
        </div>
        <div className="h-48 w-full rounded-xl bg-gray-500/20 mt-4"></div>
      </div>
    );
  }

  if (error || !profile) return (
    <div className="text-red-400 p-6 border border-red-500/30 rounded-2xl bg-red-500/10 backdrop-blur-md font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)]">
      ⚠️ Error: {error}
    </div>
  );

  const qpData = profile.quickplay;
  const qpDisplay = qpData?.displayValue ?? "—";
  const qpRank = qpData?.rank ?? -1;
  
  const rankColor = getRankColor(profile.league?.rank);
  const textColor = isDarkMode ? "text-gray-100" : "text-gray-900";
  const subTextColor = isDarkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = isDarkMode 
    ? "bg-zinc-800 border-gray-600" 
    : "bg-gray-100 border-gray-800";
  const bgBadge = isDarkMode ? "bg-white/10" : "bg-black/10";

  return (
    <div className={`w-full h-full flex flex-col rounded-2xl overflow-hidden border shadow-2xl backdrop-blur-xl ${bgCard} ${textColor} text-sm transition-all duration-500 relative group/card`}>
      
      {/* HEADER SECTION */}
      <div className="relative p-6 border-b border-gray-500/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500/10 rounded-full blur-3xl -z-0"></div>

        <div className="flex justify-between items-center z-10 relative">
            <h1 className={`text-2xl font-black tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r ${isDarkMode ? 'from-white to-gray-500' : 'from-black to-gray-400'}`}>
              Tetr.io
            </h1>
            <div className="flex gap-2">
                {profile.badges?.slice(0, 3).map((b, i) => (
                    <span key={i} className="text-xl hover:scale-125 transition-transform cursor-pointer drop-shadow-md">🏆</span>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-5 mt-6 z-10 relative">
          <div className="relative w-20 h-20 flex-shrink-0 group/avatar cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl blur-md opacity-40 group-hover/avatar:opacity-100 transition-all duration-500"></div>
            <img 
              src={profile.avatar || "https://tetr.io/res/avatar.png"} 
              alt="Avatar" 
              className="relative w-full h-full cursor-target object-cover rounded-2xl border-2 border-white/20 shadow-xl group-hover/avatar:scale-105 transition-transform duration-300"
            />
            {profile.supporter && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-md shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-pulse">PRO</div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              {profile.username}
              {profile.country && <span className="text-xl drop-shadow-sm" title={profile.country}>{countryFlag(profile.country)}</span>}
            </h1>
            <div className="flex flex-wrap cursor-target gap-2 mt-2 text-[10px] font-bold opacity-80 uppercase tracking-wider">
              <span className={`${bgBadge} px-2 py-1 rounded-md backdrop-blur-md`}>⏱️ {profile.play_time_readable || "0h"}</span>
              <span className={`${bgBadge} px-2 py-1 rounded-md backdrop-blur-md`}>🎮 {profile.gamesplayed?.toLocaleString() || 0} GMS</span>
              <span className={`${bgBadge} px-2 py-1 rounded-md backdrop-blur-md`}>🏆 {profile.winrate || 0}% WR</span>
            </div>
          </div>

          {profile.league && (
            <div className={`flex flex-col cursor-target items-center justify-center p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg transform transition-all hover:scale-110 hover:-rotate-2`}>
              <span className={`text-4xl leading-none font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${rankColor.replace('bg-', 'text-').replace('600', '400')}`}>
                {profile.league.rank.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold opacity-80 mt-1 bg-black/20 px-2 py-0.5 rounded-full text-white">{profile.league.tr} TR</span>
            </div>
          )}
        </div>
      </div>

      {/* QUICK STATS BOARD */}
      <div className="grid grid-cols-4 gap-2 p-4 border-b border-gray-500/10 ">
          <StatBadge label="APM" value={profile.league?.apm?.toFixed(2) || "0.00"} colorClass="text-red-400" isDarkMode={isDarkMode} />
          <StatBadge label="PPS" value={profile.league?.pps?.toFixed(2) || "0.00"} colorClass="text-blue-400" isDarkMode={isDarkMode} />
          <StatBadge label="VS" value={profile.league?.vs?.toFixed(2) || "0.00"} colorClass="text-green-400" isDarkMode={isDarkMode} />
          <StatBadge label="GLICKO" value={profile.league?.glicko ? Math.round(profile.league.glicko) : "—"} colorClass="text-purple-400" isDarkMode={isDarkMode} />
      </div>

      {/* MAIN SCROLL AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        
        <section>
          <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
              <h3 className={`text-xs font-bold ${subTextColor} uppercase tracking-widest`}>Mastery Records</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* 40 LINES */}
            <div className={`group p-4 cursor-target rounded-2xl border ${isDarkMode ? 'border-blue-500/20 bg-blue-900/10' : 'border-blue-500/30 bg-blue-500/5'} hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 relative overflow-hidden`}>
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">⏱️</div>
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">40 Lines Sprint</h4>
              <div className={`text-2xl font-black tracking-tight drop-shadow-md ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.lines40?.time ? formatTime(profile.lines40.time) : "—"}
              </div>
              {profile.lines40?.time && (
                <div className="flex gap-3 mt-3 text-[10px] font-mono opacity-80">
                  <span className="bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">PPS: {profile.lines40.pps}</span>
                  <span className="bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded">F: {profile.lines40.finesse}</span>
                </div>
              )}
            </div>

            {/* BLITZ */}
            <div className={`group p-4 cursor-target rounded-2xl border ${isDarkMode ? 'border-purple-500/20 bg-purple-900/10' : 'border-purple-500/30 bg-purple-500/5'} hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 relative overflow-hidden`}>
              <div className="absolute  -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">⚡</div>
              <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Blitz 2 Min</h4>
              <div className={`text-2xl font-black tracking-tight drop-shadow-md ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.blitz?.score?.toLocaleString() || "—"}
              </div>
              {profile.blitz?.score && (
                <div className="flex gap-3 mt-3 text-[10px] font-mono opacity-80">
                  <span className="bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">SPS: {profile.blitz.sps}</span>
                </div>
              )}
            </div>
            
            {/* QUICK PLAY */}
            <div className={`group p-4 cursor-target rounded-2xl  border ${isDarkMode ? 'border-emerald-500/20 bg-emerald-900/10' : 'border-emerald-500/30 bg-emerald-500/5'} hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 relative overflow-hidden`}>
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">🏔️</div>
              <div className="flex justify-between items-start">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Quick Play</h4>
                  {qpRank !== -1 && <span className="text-[8px] bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded-full">#{Math.round(qpRank).toLocaleString()}</span>}
              </div>
              <div className={`text-2xl font-black tracking-tight drop-shadow-md ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {qpDisplay !== "—" ? `${qpDisplay}m` : "—"}
              </div>
            </div>

            {/* ZEN MODE */}
            <div className={`group p-4 cursor-target rounded-2xl border ${isDarkMode ? 'border-pink-500/20 bg-pink-900/10' : 'border-pink-500/30 bg-pink-500/5'} hover:border-pink-400/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-300 relative overflow-hidden`}>
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🌸</div>
              <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">Zen Mode</h4>
              <div className={`text-2xl font-black tracking-tight drop-shadow-md ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.zen?.level ? `Lvl ${profile.zen.level}` : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* MATCH HISTORY SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
              <h3 className={`text-xs font-bold ${subTextColor} uppercase tracking-widest`}>Recent Engagements</h3>
          </div>
          
          <div className={`rounded-2xl border overflow-hidden backdrop-blur-xl cursor-none ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-black/10 bg-black/5'}`}>
            {flow && flow.points && flow.points.length > 0 ? (
              <div className="max-h-[550px] overflow-y-auto cursor-none custom-scrollbar">
                <table className="w-full text-xs cursor-none text-left whitespace-nowrap">
                  <thead className={`sticky top-0 backdrop-blur-md z-20 cursor-none ${isDarkMode ? 'bg-zinc-800/90' : 'bg-gray-200/90'}`}>
                    <tr className={`uppercase text-[9px] opacity-60 cursor-none tracking-widest border-b ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                      <th className="px-4 py-3 cursor-none font-bold">Result</th>
                      <th className="px-3 py-3 font-bold text-right">Rating</th>
                      <th className="px-3 py-3 font-bold text-right">Opponent</th>
                      <th className="px-4 py-3 font-bold text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y cursor-none ${isDarkMode ? 'divide-white/5' : 'divide-black/5'}`}>
                    {[...flow.points].reverse().slice(0, 15).map((pt, idx) => {
                      const isWin = pt[1] === 1 || pt[1] === 3;
                      const isLoss = pt[1] === 2 || pt[1] === 4;
                      const date = new Date(flow.startTime + pt[0]);
                      const trColor = pt[2] >= 1000 ? "text-red-500" : pt[2] >= 500 ? (isDarkMode ? "text-yellow-400" : "text-yellow-600") : subTextColor;
                      
                      return (
                        <tr key={idx} className={`group cursor-none transition-colors duration-200 cursor-target ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wider ${isWin ? 'bg-green-500/20 text-green-500' : isLoss ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'}`}>
                              {isWin ? "VICTORY" : isLoss ? "DEFEAT" : "DRAW"}
                            </span>
                          </td>
                          <td className={`px-3 py-3 text-right font-mono font-bold ${trColor}`}>
                            {pt[2].toFixed(0)} <span className="text-[9px] opacity-50">TR</span>
                          </td>
                          <td className="px-3 py-3 text-right font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                            {pt[3].toFixed(0)} TR
                          </td>
                          <td className="px-4 py-3 text-right opacity-60 text-[10px] font-mono group-hover:opacity-100 transition-opacity">
                            {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center opacity-50">
                <span className="text-3xl mb-2">👻</span>
                <span className="text-xs italic tracking-widest uppercase">No Intel Available</span>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

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