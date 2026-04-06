import React, { useEffect, useState, useContext, useMemo, useRef, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

// ─── API & CONSTANTS ──────────────────────────────────────────────────────────
const API_KEY = "F10E38DFF1FBB84407DF02D50B49A8CF";
const PROXY = "https://api.codetabs.com/v1/proxy?quest=";
const CACHE_TTL = 3600_000;

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const pget = async (url) => {
  const res = await fetch(PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
};

const fmtPlaytime = (mins) => {
  if (!mins) return "0.0";
  return (mins / 60).toFixed(1);
};

const getImgs = (appid, hash) => ({
  icon: hash ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${hash}.jpg` : `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
  banner: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
  cover: `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900.jpg`,
});

const getStatusTheme = (state, gameInfo) => {
  if (gameInfo) return { label: `PLAYING: ${gameInfo.toUpperCase()}`, color: "#a3cc47", bg: "bg-[#a3cc47]/10", border: "border-[#a3cc47]/30", glow: "shadow-[#a3cc47]", dot: "bg-[#a3cc47]" };
  switch (state) {
    case 1: return { label: "ONLINE", color: "#57cbde", bg: "bg-[#57cbde]/10", border: "border-[#57cbde]/30", glow: "shadow-[#57cbde]", dot: "bg-[#57cbde]" };
    case 2: return { label: "BUSY", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", glow: "shadow-red-500", dot: "bg-red-500" };
    case 3: return { label: "AWAY", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-amber-500", dot: "bg-amber-500" };
    case 4: return { label: "SNOOZE", color: "#60a5fa", bg: "bg-blue-400/10", border: "border-blue-400/30", glow: "shadow-blue-400", dot: "bg-blue-400" };
    default: return { label: "OFFLINE", color: "#6b7280", bg: "bg-gray-500/10", border: "border-gray-500/30", glow: "shadow-transparent", dot: "bg-gray-500" };
  }
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Icons = {
  Gamepad: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/></svg>,
  Clock: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
  Trophy: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011-1h8a1 1 0 011 1v1h1a2 2 0 012 2v1a2 2 0 01-2 2h-1v1a5 5 0 01-5 5h-1a5 5 0 01-5-5V8H4a2 2 0 01-2-2V5a2 2 0 012-2h1V2zm1 2v4h8V4H6zm-2 2v1a1 1 0 001 1h1V6H4zm12 0v1h1a1 1 0 001-1V6h-2zM8 17a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/></svg>,
  Friends: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
};

export default function SteamProfileCard({
  steamIds = ["76561199745356826", "76561199166544214", "76561198773672138", "76561198735338945"],
}) {
  const { isDarkMode } = useContext(ThemeContext);

  const [data, setData] = useState({ profile: null, games: [], recent: [], total: 0, friends: 0, playtimeTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeIdx, setActiveIdx] = useState(0);
  const [achCache, setAchCache] = useState({});
  const achTimeoutRef = useRef(null);
  const carouselRef = useRef(null);

  // ─── DATA FETCHING ───
  useEffect(() => {
    let mounted = true;
    const cacheKey = "steam_v3_" + steamIds.join("_");

    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey));
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    } catch (_) {}

    async function loadData() {
      try {
        const [profRes, friendRes, ...rest] = await Promise.all([
          pget(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamIds[0]}`),
          pget(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${API_KEY}&steamid=${steamIds[0]}&relationship=friend`),
          ...steamIds.map(id => pget(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${id}&include_appinfo=true&include_played_free_games=true`)),
          ...steamIds.map(id => pget(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${id}`)),
        ]);

        if (!mounted) return;

        const p = profRes.response?.players?.[0];
        const fCount = friendRes.friendslist?.friends?.length || 0;
        
        const gMap = new Map(), rMap = new Map();
        let ptTotal = 0;

        rest.slice(0, steamIds.length).forEach(r => (r.response?.games || []).forEach(g => {
          if (g.playtime_forever > 0) ptTotal += g.playtime_forever;
          const ex = gMap.get(g.appid);
          ex ? (ex.playtime_forever += g.playtime_forever) : gMap.set(g.appid, { ...g });
        }));

        rest.slice(steamIds.length).forEach(r => (r.response?.games || []).forEach(g => {
          const ex = rMap.get(g.appid);
          ex ? (ex.playtime_2weeks += g.playtime_2weeks) : rMap.set(g.appid, { ...g });
        }));

        const finalData = {
          profile: p,
          friends: fCount,
          total: gMap.size,
          playtimeTotal: ptTotal,
          games: [...gMap.values()].sort((a, b) => b.playtime_forever - a.playtime_forever),
          recent: [...rMap.values()].sort((a, b) => b.playtime_2weeks - a.playtime_2weeks).slice(0, 5),
        };

        setData(finalData);
        try { localStorage.setItem(cacheKey, JSON.stringify({ data: finalData, ts: Date.now() })); } catch (_) {}
      } catch (err) {
        if (mounted) setError("SYSTEM ERROR: Failed to connect to Steam Network.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [steamIds]);

  const topGames = useMemo(() => (data.games || []).slice(0, 5), [data.games]);

  // ─── ACHIEVEMENTS FETCHING ───
  useEffect(() => {
    if (!data.games || data.games.length === 0) return;
    const g = topGames[activeIdx];
    if (!g || achCache[g.appid] !== undefined) return;

    if (achTimeoutRef.current) clearTimeout(achTimeoutRef.current);
    achTimeoutRef.current = setTimeout(async () => {
      for (const sid of steamIds) {
        try {
          const res = await pget(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${g.appid}&key=${API_KEY}&steamid=${sid}`);
          const all = res.playerstats?.achievements;
          if (all?.length > 0) {
            const unlocked = all.filter(a => a.achieved === 1).length;
            setAchCache(p => ({ ...p, [g.appid]: { found: true, cur: unlocked, tot: all.length, pct: Math.round((unlocked / all.length) * 100) } }));
            return;
          }
        } catch (_) {}
      }
      setAchCache(p => ({ ...p, [g.appid]: { found: false } }));
    }, 400);
  }, [activeIdx, topGames, steamIds, achCache, data.games]);

  // ─── CAROUSEL LOGIC ───
  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev === 0 ? topGames.length - 1 : prev - 1));
  }, [topGames.length]);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev === topGames.length - 1 ? 0 : prev + 1));
  }, [topGames.length]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: carouselRef.current.clientWidth * activeIdx,
        behavior: "smooth",
      });
    }
  }, [activeIdx]);

  // ─── RENDER ───
  const isDark = isDarkMode; 
  const bgMain = isDark ? "bg-zinc-800 border-[#1f2937]" : "bg-[#f8f9fa] border-gray-200";
  const bgPanel = isDark ? "bg-zinc-900 border-[#2a3441]" : "bg-white border-gray-200";
  const txtPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const txtSecondary = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) return (
    <div className={`w-full h-full min-h-[500px] flex flex-col rounded-2xl border p-6 overflow-hidden relative ${bgMain}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent animate-pulse"></div>
      <div className="flex gap-5 items-center z-10 mb-8">
        <div className="w-20 h-20 rounded-xl bg-gray-600/20 animate-pulse"></div>
        <div className="space-y-3 flex-1">
          <div className="h-6 w-1/3 bg-gray-600/20 rounded animate-pulse"></div>
          <div className="h-4 w-1/4 bg-gray-600/20 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="h-48 w-full rounded-xl bg-gray-600/20 animate-pulse mb-4"></div>
      <div className="h-24 w-full rounded-xl bg-gray-600/20 animate-pulse"></div>
    </div>
  );

  if (error) return <div className="p-5 font-mono text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl">{error}</div>;
  if (!data.profile) return null;

  const { profile, recent, total, friends, playtimeTotal } = data;
  const status = getStatusTheme(profile.personastate, profile.gameextrainfo);
  const heroImg = topGames[0] ? getImgs(topGames[0].appid).banner : null;

  return (
    <div className={`w-full h-full flex flex-col rounded-2xl border shadow-2xl relative overflow-hidden font-sans ${bgMain} ${txtPrimary}`}>
      
      {/* ─── 1. CINEMATIC HEADER ─── */}
      <div className="relative w-full h-44 shrink-0 overflow-hidden">
        {heroImg && (
          <div className="absolute inset-0 z-0">
            <img src={heroImg} className="w-full h-full object-cover opacity-50 blur-xl scale-125 saturate-150" alt=""/>
            <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-zinc-800 via-zinc-800/80' : 'from-[#f8f9fa] via-[#f8f9fa]/80'} to-transparent`}></div>
          </div>
        )}

        <div className="absolute bottom-4 left-6 right-6 z-10 flex items-end gap-5">
          <div className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 ${status.border} ${status.glow} shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 cursor-pointer`} onClick={() => window.open(profile.profileurl)}>
            <img src={profile.avatarfull} className="w-full h-full object-cover" alt="Avatar"/>
            <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-1`}>
              <div className={`w-2 h-2 rounded-full ${status.dot} shadow-[0_0_5px_currentColor]`}></div>
            </div>
          </div>

          <div className="flex-1 pb-1">
            <h1 className="text-3xl font-black tracking-tight drop-shadow-md truncate">{profile.personaname}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-sm border backdrop-blur-md ${status.bg} ${status.border}`} style={{ color: status.color }}>
                {status.label}
              </span>
              {profile.loccountrycode && (
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase opacity-60">
                  <img src={`https://flagcdn.com/16x12/${profile.loccountrycode.toLowerCase()}.png`} alt="flag" className="w-4 h-3 rounded-sm opacity-80"/>
                  {profile.loccountrycode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. SCROLLABLE COMMAND CENTER ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-6 z-10">
        
        {/* Quick Metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <Icons.Gamepad />, val: total, label: "GAMES" },
            { icon: <Icons.Clock />, val: `${fmtPlaytime(playtimeTotal)}`, label: "HOURS" },
            { icon: <Icons.Friends />, val: friends, label: "FRIENDS" },
            { icon: <Icons.Trophy />, val: profile.timecreated ? new Date().getFullYear() - new Date(profile.timecreated * 1000).getFullYear() : 0, label: "YEARS" },
          ].map((stat, i) => (
            <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${bgPanel} shadow-sm transition-colors hover:border-white/20`}>
              <div className={`text-[10px] ${txtSecondary} mb-1.5`}>{stat.icon}</div>
              <span className="text-sm font-black tracking-tight">{stat.val}</span>
              <span className={`text-[8px] font-bold tracking-widest uppercase ${txtSecondary}`}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ─── 3. FEATURED GAME SHOWCASE (CAROUSEL) ─── */}
        {topGames.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-[#66c0f4] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#66c0f4] rounded-sm"></span> Top Played Matrix
              </h2>
              <div className="flex gap-1.5">
                {topGames.map((_, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} className={`w-6 h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'bg-[#66c0f4]' : 'bg-gray-600/40 hover:bg-gray-500/60'}`}></button>
                ))}
              </div>
            </div>

            <div className={`relative w-full rounded-2xl border ${isDark ? 'border-white/10' : 'border-gray-300'} shadow-lg group overflow-hidden`}>
              
              <button onClick={handlePrev} className="absolute left-1 bottom-1 -translate-y-1/2 z-20 w-5 h-5 flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm  ">❮</button>
              <button onClick={handleNext} className="absolute right-1 bottom-1 -translate-y-1/2 z-20 w-5 h-5 flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm  ">❯</button>

              <div 
                ref={carouselRef}
                className="flex w-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {topGames.map((game, index) => {
                  const ach = achCache[game.appid];
                  
                  return (
                    <div key={game.appid} className="relative w-full shrink-0 snap-center flex-col">
                      <div className="absolute inset-0 bg-[#0f1115]">
                        <img src={getImgs(game.appid).banner} className="w-full h-full object-cover opacity-60 transition-transform duration-1000  group-hover:opacity-80" alt=""/>
                        <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-[#0b0e14] via-[#0b0e14]/90' : 'from-gray-900 via-gray-900/80'} to-transparent`}></div>
                      </div>

                      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="w-24 h-36 shrink-0 rounded-lg overflow-hidden border border-white/20 shadow-2xl hidden sm:block">
                          <img src={getImgs(game.appid).cover} className="w-full h-full object-cover" alt="Cover" onError={e => e.target.style.display='none'}/>
                        </div>
                        
                        <div className="flex-1 w-full text-white">
                          <div className="text-[10px] font-bold text-[#66c0f4] uppercase tracking-widest mb-1 shadow-black drop-shadow-md">Rank #{index + 1}</div>
                          <h3 className="text-2xl font-black leading-tight line-clamp-2 mb-3 shadow-black drop-shadow-lg">{game.name}</h3>
                          
                          <div className="flex items-end gap-6 mb-4">
                            <div>
                              <div className="text-3xl font-black tracking-tighter leading-none">{fmtPlaytime(game.playtime_forever)}</div>
                              <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">Total Hours</div>
                            </div>
                            <div className="flex-1 max-w-[120px] hidden md:block">
                              <div className="flex gap-0.5 h-6 items-end">
                                {[4,8,5,9,2,6,10,7,5,8].map((h, i) => (
                                  <div key={i} className="flex-1 bg-[#66c0f4]/40 rounded-t-sm" style={{ height: `${h*10}%` }}></div>
                                ))}
                              </div>
                              <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-center">Activity Matrix</div>
                            </div>
                          </div>

                          <div className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                            {ach === undefined ? (
                              <div className="h-2 bg-white/10 rounded-full animate-pulse w-full"></div>
                            ) : ach.found ? (
                              <div>
                                <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                                  <span className="flex items-center gap-1.5"><Icons.Trophy/> Achievements</span>
                                  <span className="text-[#66c0f4]">{ach.pct}% <span className="text-gray-500">({ach.cur}/{ach.tot})</span></span>
                                </div>
                                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden shadow-inner">
                                  <div className="h-full bg-gradient-to-r from-[#57cbde] to-[#66c0f4] shadow-[0_0_10px_#57cbde]" style={{ width: `${ach.pct}%` }}></div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Encrypted / No Data</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. TACTICAL RECENT ACTIVITY ─── */}
        {recent.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-sm"></span> Recent Log
            </h2>
            <div className={`rounded-xl border overflow-hidden ${bgPanel} divide-y ${isDark ? 'divide-[#2a3441]' : 'divide-gray-100'}`}>
              {recent.map((g, i) => (
                <div key={g.appid} className={`flex items-center gap-4 p-3 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} cursor-pointer group`} onClick={() => window.open(`https://store.steampowered.com/app/${g.appid}`)}>
                  <div className="text-[10px] font-bold text-gray-500 w-4 text-center">{i + 1}</div>
                  <img src={getImgs(g.appid, g.img_icon_url).icon} className="w-9 h-9 rounded-md shadow-sm border border-black/10 group-hover:scale-110 transition-transform" alt=""/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate group-hover:text-[#66c0f4] transition-colors">{g.name}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase mt-0.5 flex items-center gap-2">
                      <span className="text-[#a3cc47]">{fmtPlaytime(g.playtime_2weeks)}H</span> <span>PAST 2 WEEKS</span>
                    </div>
                  </div>
                  <div className="px-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#66c0f4]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}