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

// ─── ICONS (LUCIDE-STYLE) ────────────────────────────────────────────────────
const Icons = {
  Gamepad: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Trophy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-4.52.636m4.52-.636a6.003 6.003 0 00-4.52.636"/></svg>,
  Friends: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>,
  ExternalLink: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>,
  Signal: () => <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM20.57 16.476c.507.393.927.906 1.23 1.503a.75.75 0 01-1.335.673 3.457 3.457 0 00-.788-.964.75.75 0 01.893-1.212zM17.03 15.04a4.957 4.957 0 012.15 2.68.75.75 0 01-1.42.488 3.457 3.457 0 00-1.497-1.87.75.75 0 01.767-1.298zM13.49 14.07a6.96 6.96 0 013.1 3.78.75.75 0 01-1.398.545 5.46 5.46 0 00-2.434-2.97.75.75 0 01.732-1.355zM9.9 13.5a8.96 8.96 0 014.14 4.95.75.75 0 11-1.376.594A7.46 7.46 0 009.1 14.7a.75.75 0 01.8-1.2z"/></svg>,
  Sparkle: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"/></svg>,
};

// ─── ANIMATED PULSE DOT ──────────────────────────────────────────────────────
const PulseDot = ({ color, size = 8 }) => (
  <span className="relative flex h-[8px] w-[8px]">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60`} style={{ backgroundColor: color }}></span>
    <span className="relative inline-flex rounded-full h-[8px] w-[8px]" style={{ backgroundColor: color }}></span>
  </span>
);

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
const MiniBarChart = ({ data, color = "#66c0f4" }) => (
  <div className="flex gap-[3px] h-5 items-end">
    {data.map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-sm transition-all duration-500"
        style={{
          height: `${h}%`,
          backgroundColor: color,
          opacity: 0.25 + (h / 100) * 0.75,
        }}
      ></div>
    ))}
  </div>
);

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = "#66c0f4", bgColor }) => (
  <div className={`h-[6px] w-full rounded-full overflow-hidden ${bgColor || 'bg-black/40'}`}>
    <div
      className="h-full rounded-full transition-all duration-1000 ease-out"
      style={{
        width: `${value}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: `0 0 12px ${color}66`,
      }}
    ></div>
  </div>
);

export default function SteamProfileCard({
  steamIds = ["76561199745356826", "76561199166544214", "76561198773672138", "76561198735338945"],
}) {
  const { isDarkMode } = useContext(ThemeContext);

  const [data, setData] = useState({ profile: null, games: [], recent: [], total: 0, friends: 0, playtimeTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [achCache, setAchCache] = useState({});
  const [imgErrors, setImgErrors] = useState({});
  const achTimeoutRef = useRef(null);
  const carouselRef = useRef(null);

  // ─── DATA FETCHING ───
  useEffect(() => {
    let mounted = true;
    const cacheKey = "steam_v4_" + steamIds.join("_");

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

  const topGames = useMemo(() => (data.games || []).slice(0, 6), [data.games]);

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

  // ─── CAROUSEL ───
  const handlePrev = useCallback(() => setActiveIdx(p => p === 0 ? topGames.length - 1 : p - 1), [topGames.length]);
  const handleNext = useCallback(() => setActiveIdx(p => p === topGames.length - 1 ? 0 : p + 1), [topGames.length]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: carouselRef.current.clientWidth * activeIdx, behavior: "smooth" });
    }
  }, [activeIdx]);

  const handleImgError = useCallback((appid) => {
    setImgErrors(prev => ({ ...prev, [appid]: true }));
  }, []);

  // ─── THEME TOKENS ───
  const isDark = isDarkMode;
  const t = {
    bgMain: isDark ? "bg-zinc-800" : "bg-[#f8f9fa]",
    bgPanel: isDark ? "bg-zinc-900/80" : "bg-white/80",
    bgPanelSolid: isDark ? "bg-zinc-900" : "bg-white",
    bgGlass: isDark ? "bg-white/[0.03]" : "bg-black/[0.02]",
    bgHover: isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.04]",
    border: isDark ? "border-white/[0.06]" : "border-black/[0.08]",
    borderHover: isDark ? "hover:border-white/[0.12]" : "hover:border-black/[0.15]",
    divider: isDark ? "divide-white/[0.04]" : "divide-black/[0.06]",
    txt1: isDark ? "text-gray-100" : "text-gray-900",
    txt2: isDark ? "text-gray-400" : "text-gray-500",
    txt3: isDark ? "text-gray-500" : "text-gray-400",
    accent: "#66c0f4",
    accentGreen: "#a3cc47",
    cardShadow: isDark ? "shadow-[0_1px_3px_rgba(0,0,0,0.4)]" : "shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
    gradientFade: isDark
      ? "from-zinc-800 via-zinc-800/90"
      : "from-[#f8f9fa] via-[#f8f9fa]/90",
  };

  // ─── LOADING SKELETON ───
  if (loading) return (
    <div className={`w-full h-full min-h-[520px] flex flex-col rounded-2xl border ${t.border} p-0 overflow-hidden relative ${t.bgMain}`}>
      <div className="h-52 bg-gradient-to-br from-gray-600/10 to-gray-600/5 animate-pulse" />
      <div className="p-6 -mt-14 relative z-10 space-y-5">
        <div className="flex gap-4 items-end">
          <div className="w-20 h-20 rounded-2xl bg-gray-600/15 animate-pulse border border-white/5" />
          <div className="space-y-2.5 flex-1 pb-2">
            <div className="h-7 w-48 bg-gray-600/15 rounded-lg animate-pulse" />
            <div className="h-4 w-28 bg-gray-600/15 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-20 rounded-xl ${t.bgGlass} border ${t.border} animate-pulse`} />
          ))}
        </div>
        <div className={`h-56 rounded-2xl ${t.bgGlass} border ${t.border} animate-pulse`} />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-600/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 font-mono text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-2xl backdrop-blur-sm">
      <span className="text-red-500 font-bold">✕</span> {error}
    </div>
  );
  if (!data.profile) return null;

  const { profile, recent, total, friends, playtimeTotal } = data;
  const status = getStatusTheme(profile.personastate, profile.gameextrainfo);
  const heroImg = topGames[0] ? getImgs(topGames[0].appid).banner : null;
  const memberYears = profile.timecreated ? new Date().getFullYear() - new Date(profile.timecreated * 1000).getFullYear() : 0;

  // Fake activity data per game (deterministic)
  const getActivityData = (appid) => {
    const seed = appid % 97;
    return Array.from({ length: 12 }, (_, i) => 15 + ((seed * (i + 3) * 7) % 80));
  };

  return (
    <div className={`w-full h-full flex flex-col rounded-2xl border ${t.border} shadow-2xl relative overflow-hidden font-sans ${t.bgMain} ${t.txt1}`}>

      {/* ═══════════════ CINEMATIC HEADER ═══════════════ */}
      <div className="relative w-full h-52 shrink-0 overflow-hidden">
        {/* Section label */}
        <div className="absolute top-0 left-0 right-0 z-30 px-5 pt-4 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#1b2838] flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <span className={`text-xs font-black uppercase tracking-[0.2em] ${t.txt3}`}>Steam Profile</span>
          </div>
          <button
            onClick={() => window.open(profile.profileurl)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${t.bgGlass} ${t.border} border ${t.borderHover} transition-all ${t.txt2} hover:${t.txt1}`}
          >
            <Icons.ExternalLink /> View
          </button>
        </div>

        {/* Hero backdrop */}
        {heroImg && (
          <div className="absolute inset-0 z-0">
            <img src={heroImg} className="w-full h-full object-cover opacity-40 scale-110 saturate-[1.3]" alt="" />
            <div className={`absolute inset-0 bg-gradient-to-t ${t.gradientFade} to-transparent`} />
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-zinc-800/60' : 'from-[#f8f9fa]/60'} via-transparent to-transparent`} />
          </div>
        )}

        {/* Noise overlay for texture */}
        <div className="absolute inset-0 z-[1] opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-16">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div
              className={`relative w-[88px] h-[88px] rounded-2xl overflow-hidden border-2 ${status.border} shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.04] cursor-pointer group`}
              onClick={() => window.open(profile.profileurl)}
            >
              <img src={profile.avatarfull} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                <PulseDot color={status.color} size={7} />
              </div>
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0 pb-0.5">
              <h1 className="text-[28px] font-black tracking-tight leading-none truncate drop-shadow-lg">
                {profile.personaname}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-[3px] text-[9px] font-black uppercase tracking-[0.15em] rounded-md border backdrop-blur-md"
                  style={{
                    color: status.color,
                    backgroundColor: `${status.color}12`,
                    borderColor: `${status.color}30`,
                  }}
                >
                  <span className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: status.color }} />
                  {status.label}
                </span>
                {profile.loccountrycode && (
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${t.txt3}`}>
                    <img
                      src={`https://flagcdn.com/16x12/${profile.loccountrycode.toLowerCase()}.png`}
                      alt=""
                      className="w-4 h-3 rounded-[2px] opacity-80"
                    />
                    {profile.loccountrycode}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ SCROLLABLE BODY ═══════════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-5 space-y-5 z-10">

        {/* ──── STAT CARDS ──── */}
        <div className="grid grid-cols-4 gap-2.5 ">
          {[
            { icon: <Icons.Gamepad />, val: total.toLocaleString(), label: "Games", accent: "#66c0f4" },
            { icon: <Icons.Clock />, val: fmtPlaytime(playtimeTotal), label: "Hours", accent: "#a3cc47" },
            { icon: <Icons.Friends />, val: friends.toLocaleString(), label: "Friends", accent: "#57cbde" },
            { icon: <Icons.Trophy />, val: memberYears, label: "Years", accent: "#f59e0b" },
          ].map((stat, i) => (
            <div
              key={i}
              className={`relative flex flex-col items-center cursor-target cursor-none justify-center p-3.5 rounded-xl border ${t.bgGlass} ${t.border} ${t.borderHover} ${t.cardShadow} transition-all duration-200 cursor-default group overflow-hidden`}
            >
              {/* Subtle accent glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${stat.accent}08, transparent 70%)` }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-2" style={{ color: stat.accent }}>{stat.icon}</div>
                <span className="text-[15px] font-black tracking-tight leading-none">{stat.val}</span>
                <span className={`text-[8px] font-bold uppercase tracking-[0.18em] ${t.txt3} mt-1.5`}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ──── FEATURED GAME CAROUSEL ──── */}
        {topGames.length > 0 && (
          <div className="space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <Icons.Sparkle />
                <h2 className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: t.accent }}>
                  Top Played
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Dot indicators */}
                <div className="hidden sm:flex gap-1">
                  {topGames.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === activeIdx ? '18px' : '6px',
                        height: '6px',
                        backgroundColor: i === activeIdx ? t.accent : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
                      }}
                    />
                  ))}
                </div>
                {/* Nav arrows */}
                <div className="flex gap-0.5">
                  <button
                    onClick={handlePrev}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.bgGlass} ${t.border} border ${t.txt3} hover:${t.txt1} transition-all`}
                  >
                    <Icons.ChevronLeft />
                  </button>
                  <button
                    onClick={handleNext}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.bgGlass} ${t.border} border ${t.txt3} hover:${t.txt1} transition-all`}
                  >
                    <Icons.ChevronRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel container */}
            <div className={`relative rounded-2xl border ${t.border} overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)]`}>
              <div
                ref={carouselRef}
                className="flex w-full overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {topGames.map((game, index) => {
                  const ach = achCache[game.appid];
                  const hasCoverErr = imgErrors[game.appid];
                  const actData = getActivityData(game.appid);

                  return (
                    <div key={game.appid} className="relative w-full shrink-0 snap-center">
                      {/* Background image */}
                      <div className="absolute inset-0">
                        <img
                          src={getImgs(game.appid).banner}
                          className="w-full h-full object-cover opacity-50"
                          alt=""
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-[#0c0e14] via-[#0c0e14]/95 to-[#0c0e14]/40' : 'from-gray-900 via-gray-900/95 to-gray-900/50'} `} />
                      </div>

                      {/* Content */}
                      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5 min-h-[220px]">
                        {/* Cover art */}
                        {!hasCoverErr && (
                          <div className="w-[72px] sm:w-[80px] shrink-0 rounded-xl overflow-hidden border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hidden sm:block">
                            <img
                              src={getImgs(game.appid).cover}
                              className="w-full h-[120px] object-cover"
                              alt=""
                              onError={() => handleImgError(game.appid)}
                            />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 w-full text-white min-w-0">
                          {/* Rank badge */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-black"
                              style={{
                                backgroundColor: index === 0 ? '#f59e0b22' : 'rgba(255,255,255,0.06)',
                                color: index === 0 ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                                border: `1px solid ${index === 0 ? '#f59e0b33' : 'rgba(255,255,255,0.08)'}`,
                              }}
                            >
                              #{index + 1}
                            </span>
                            {index === 0 && (
                              <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-amber-400/70">Most Played</span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black leading-tight line-clamp-2 mb-4 drop-shadow-lg">
                            {game.name}
                          </h3>

                          {/* Playtime + chart */}
                          <div className="flex items-end gap-6 mb-4">
                            <div>
                              <div className="text-[32px] font-black tracking-tighter leading-none tabular-nums">
                                {fmtPlaytime(game.playtime_forever)}
                              </div>
                              <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Total Hours</div>
                            </div>
                            <div className="flex-1 max-w-[140px] hidden md:block">
                              <MiniBarChart data={actData} color={t.accent} />
                              <div className="text-[7px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-1.5">Weekly Activity</div>
                            </div>
                          </div>

                          {/* Achievement bar */}
                          <div className={`w-full rounded-xl p-3 border border-white/[0.06] ${isDark ? 'bg-white/[0.03]' : 'bg-black/20'} backdrop-blur-sm`}>
                            {ach === undefined ? (
                              <div className="space-y-2">
                                <div className="h-2.5 w-24 bg-white/[0.06] rounded-md animate-pulse" />
                                <div className="h-[6px] w-full bg-white/[0.06] rounded-full animate-pulse" />
                              </div>
                            ) : ach.found ? (
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                    <span style={{ color: t.accent }}><Icons.Trophy /></span>
                                    Achievements
                                  </span>
                                  <span className="text-[11px] font-black tabular-nums">
                                    <span style={{ color: t.accent }}>{ach.pct}%</span>
                                    <span className="text-gray-600 font-semibold ml-1">{ach.cur}/{ach.tot}</span>
                                  </span>
                                </div>
                                <ProgressBar value={ach.pct} color={t.accent} bgColor="bg-white/[0.06]" />
                              </div>
                            ) : (
                              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.15em] text-center py-1">
                                <Icons.Signal /> <span className="ml-1">No Achievement Data</span>
                              </div>
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

        {/* ──── RECENT ACTIVITY ──── */}
        {recent.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-0.5">
              <Icons.Clock />
              <h2 className={`text-[10px] font-black uppercase tracking-[0.18em] ${t.txt3}`}>
                Recent Activity
              </h2>
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${t.bgGlass} ${t.border} border ${t.txt3}`}>
                2 WEEKS
              </span>
            </div>

            <div className={`rounded-xl border ${t.border} overflow-hidden ${t.bgPanel} ${t.divider} backdrop-blur-sm`}>
              {recent.map((g, i) => {
                const recentPct = topGames[0] ? Math.min((g.playtime_2weeks / (topGames[0].playtime_forever || 1)) * 100, 100) : 0;

                return (
                  <div
                    key={g.appid}
                    className={`flex items-center gap-3.5 px-4 py-3 transition-all duration-200 cursor-pointer group ${t.bgHover}`}
                    onClick={() => window.open(`https://store.steampowered.com/app/${g.appid}`)}
                  >
                    {/* Index */}
                    <span className={`text-[10px] font-bold w-4 text-center tabular-nums ${t.txt3}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/20 shadow-sm shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <img
                        src={getImgs(g.appid, g.img_icon_url).icon}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold truncate transition-colors duration-200 group-hover:text-[#66c0f4]">
                        {g.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black tabular-nums" style={{ color: t.accentGreen }}>
                          {fmtPlaytime(g.playtime_2weeks)}h
                        </span>
                        <div className="flex-1 max-w-[80px] hidden sm:block">
                          <ProgressBar value={recentPct} color={t.accentGreen} bgColor={isDark ? "bg-white/[0.04]" : "bg-black/[0.04]"} />
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0`} style={{ color: t.accent }}>
                      <Icons.ExternalLink />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom spacer for scroll */}
        <div className="h-2" />
      </div>
    </div>
  );
}