import React, { 
  useEffect, useState, useContext, useMemo, useRef, useCallback, useReducer 
} from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { createPortal } from "react-dom";
import { smootherInstance } from "../layouts/GSAPSmoothScrollWrapper";
import { motion, AnimatePresence } from "framer-motion";

// ─── CONSTANTS ────────────────────────────────────────────────────────────
const API_KEY =  "F10E38DFF1FBB84407DF02D50B49A8CF";
const PROXY = "https://api.codetabs.com/v1/proxy?quest=";
const CACHE_TTL = 3600_000;
const REQUEST_TIMEOUT = 10_000;
const MAX_RETRIES = 3;

// ─── TYPES & ENUMS ────────────────────────────────────────────────────────
const TAB_KEYS = {
  OVERVIEW: "overview",
  RECENTLY: "recently",
  ANALYTICS: "analytics",
  ACHIEVEMENTS: "achievements",
};

const FILTER_MODES = {
  ALL: "all",
  PLAYED_RECENTLY: "recent",
  MOST_PLAYED: "toptime",
  ABANDONED: "abandoned",
  NEW: "new",
};

// ─── UTILITIES ────────────────────────────────────────────────────────────
const withTimeout = (promise, ms) => 
  Promise.race([promise, new Promise((_, rej) => 
    setTimeout(() => rej(new Error("Request timeout")), ms)
  )]);

const withRetry = async (fn, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await withTimeout(fn(), REQUEST_TIMEOUT);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
    }
  }
};

const pget = async (url) => {
  return withRetry(async () => {
    const res = await fetch(PROXY + encodeURIComponent(url));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
};

// ─── ANALYSIS ENGINE ──────────────────────────────────────────────────────
const analyzeComprehensive = (games, recent, profile) => {
  if (!games || games.length === 0) return null;

  const totalPlaytime = games.reduce((acc, g) => acc + g.playtime_forever, 0);
  const topGame = games[0];
  const topPercentage = ((topGame.playtime_forever / totalPlaytime) * 100);

  const recentTotal = recent.reduce((acc, g) => acc + g.playtime_2weeks, 0);
  const avgDaily = recentTotal / 14 / 60;
  const memberDays = profile?.timecreated 
    ? Math.floor((Date.now() / 1000 - profile.timecreated) / 86400) 
    : 0;
  const avgDailyAllTime = totalPlaytime / Math.max(memberDays, 1) / 60;

  const recentMap = new Map(recent.map(g => [g.appid, g]));
  const abandonedGames = games.filter(
    g => !recentMap.has(g.appid) && g.playtime_forever > 300 && g.appid !== topGame.appid
  );

  const categorizePlaytime = (hours) => {
    if (hours > 500) return "Epic";
    if (hours > 100) return "Veteran";
    if (hours > 50) return "Dedicated";
    if (hours > 20) return "Regular";
    if (hours > 5) return "Casual";
    return "Tourist";
  };

  let intensity = "Dormant";
  if (avgDaily > 6) intensity = "Extreme Grinder";
  else if (avgDaily > 4) intensity = "Hardcore";
  else if (avgDaily > 1.5) intensity = "Active";
  else if (avgDaily > 0.5) intensity = "Casual";
  else if (avgDaily > 0.1) intensity = "Minimal";

  let behaviorType = "Balanced Player";
  if (topPercentage > 70) behaviorType = "Ultra-Focused";
  else if (topPercentage > 50) behaviorType = "Focused Grinder";
  else if (topPercentage > 30) behaviorType = "Multi-Game Juggler";
  else behaviorType = "Variety Explorer";

  let health = "Healthy";
  let risk = "None";
  
  if (avgDaily === 0) {
    health = "Inactive";
    risk = "Account Dormant";
  } else if (avgDaily > 8) {
    health = "Warning";
    risk = "Extreme Playtime";
  } else if (abandonedGames.length > 15 && topPercentage < 30) {
    health = "Concern";
    risk = "Low Retention";
  } else if (recent.length === 0) {
    health = "Inactive";
    risk = "No Recent Activity";
  }

  const diversityScore = Math.min(100, (games.length / 50) * 100);
  
  const engagementScore = Math.min(100, 
    (avgDaily / 4) * 40 + 
    (diversityScore / 100) * 30 + 
    (100 - (abandonedGames.length / games.length * 100)) * 30
  );

  return {
    topGame: topGame?.name,
    topPercentage: topPercentage.toFixed(1),
    totalPlaytime,
    avgDailyRecent: avgDaily.toFixed(2),
    avgDailyAllTime: avgDailyAllTime.toFixed(2),
    abandonedCount: abandonedGames.length,
    abandonedSample: abandonedGames.slice(0, 3).map(g => g.name),
    intensity,
    behaviorType,
    categorization: categorizePlaytime(topGame.playtime_forever / 60),
    health,
    risk,
    diversityScore: diversityScore.toFixed(0),
    engagementScore: engagementScore.toFixed(0),
    memberDays,
    totalGames: games.length,
    recentGameCount: recent.length,
  };
};

// ─── FORMATTING ──────────────────────────────────────────────────────────
const fmtPlaytime = (mins) => {
  if (!mins) return "0.0";
  const hours = mins / 60;
  if (hours >= 1000) return (hours / 1000).toFixed(1) + "k";
  return hours.toFixed(1);
};

const fmtNumber = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n;
};

const getGameImages = (appid, hash) => ({
  icon: hash 
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${hash}.jpg` 
    : `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`,
  banner: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
  cover: `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900.jpg`,
  capsule: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`,
  logo: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/logo.png`,
});

const getStatusTheme = (state, gameInfo) => {
  if (gameInfo) return { 
    label: `PLAYING: ${gameInfo.toUpperCase().slice(0, 20)}`, 
    color: "#22c55e", 
    bg: "bg-green-500/10", 
    border: "border-green-500/30", 
    glow: "shadow-green-500", 
    dot: "bg-green-500" 
  };
  const states = {
    1: { label: "ONLINE", color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/30", glow: "shadow-blue-500", dot: "bg-blue-500" },
    2: { label: "BUSY", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", glow: "shadow-red-500", dot: "bg-red-500" },
    3: { label: "AWAY", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-amber-500", dot: "bg-amber-500" },
    4: { label: "SNOOZE", color: "#8b5cf6", bg: "bg-purple-500/10", border: "border-purple-500/30", glow: "shadow-purple-500", dot: "bg-purple-500" },
  };
  return states[state] || { label: "OFFLINE", color: "#6b7280", bg: "bg-gray-500/10", border: "border-gray-500/30", glow: "shadow-transparent", dot: "bg-gray-500" };
};

// ─── ICONS ────────────────────────────────────────────────────────────────
const Icons = {
  Gamepad: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Trophy: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-4.52.636m4.52-.636a6.003 6.003 0 00-4.52.636"/></svg>,
  Friends: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  Fire: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 2.08 13.5.67zM11.71 19c-1.71 0-3.29-.89-4.14-2.15l2.04-2.85c.36.25.82.37 1.3.37.47 0 .93-.12 1.3-.37l2.06 2.88c-.9 1.26-2.38 2.12-4.06 2.12z"/></svg>,
  TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  History: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  ExternalLink: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
  Star: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};

// ─── ANIMATED COMPONENTS ──────────────────────────────────────────────────
const PulseDot = ({ color, size = 8 }) => (
  <span className="relative flex h-[8px] w-[8px]">
    <span 
      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" 
      style={{ backgroundColor: color }}
    />
    <span 
      className="relative inline-flex rounded-full h-[8px] w-[8px]" 
      style={{ backgroundColor: color }}
    />
  </span>
);

const ProgressBar = ({ value, color = "#3b82f6", showLabel = false }) => (
  <div className="w-full">
    <div className="h-2 w-full rounded-full overflow-hidden bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 12px ${color}66`,
        }}
      />
    </div>
    {showLabel && <span className="text-[10px] text-white/60 mt-1">{value.toFixed(0)}%</span>}
  </div>
);

const Tooltip = ({ text, children }) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-black/90 text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function SteamProfileCardModern({
  steamIds = ["76561199166544214", "76561199745356826", "76561198773672138", "76561198735338945"],
}) {
  const { isDarkMode } = useContext(ThemeContext);

  // ─── THEME ─
  const colors = {
    dark: {
      bg: "bg-zinc-900",
      bgCard: "bg-zinc-800/60",
      bgGlass: "bg-zinc-800/40",
      bgHover: "hover:bg-zinc-700/40",
      border: "border-gray-600",
      borderLight: "border-gray-700",
      txt1: "text-white",
      txt2: "text-gray-300",
      txt3: "text-gray-500",
      accent: "#3b82f6",
      accentGreen: "#22c55e",
      accentOrange: "#f59e0b",
      accentRed: "#ef4444",
    },
    light: {
      bg: "bg-gray-50",
      bgCard: "bg-gray-100/60",
      bgGlass: "bg-gray-100/40",
      bgHover: "hover:bg-gray-200/40",
      border: "border-gray-800",
      borderLight: "border-gray-700",
      txt1: "text-gray-900",
      txt2: "text-gray-700",
      txt3: "text-gray-600",
      accent: "#2563eb",
      accentGreen: "#16a34a",
      accentOrange: "#d97706",
      accentRed: "#dc2626",
    }
  };

  const theme = isDarkMode ? colors.dark : colors.light;

  const [data, setData] = useState({ 
    profile: null, 
    games: [], 
    recent: [], 
    allGames: [],
    total: 0, 
    friends: 0, 
    playtimeTotal: 0 ,
    level: 0,
    friendProfiles: [],
    realName: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.OVERVIEW);
  const [filterMode, setFilterMode] = useState(FILTER_MODES.ALL);
  const [achCache, setAchCache] = useState({});
  const [imgErrors, setImgErrors] = useState({}); 
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("playtime");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredGame, setHoveredGame] = useState(null);

  // ─── STATE & LOGIKA MODAL ───
  const [detailGameId, setDetailGameId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const openModal = (appid) => {
    setDetailGameId(appid);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setDetailGameId(null), 300); 
  };

  useEffect(() => {
    if (smootherInstance) {
      smootherInstance.paused(showModal);
    }
  }, [showModal]);

  const achTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ─── FUNGSI HANDLE IMAGE ERROR ───
  const handleImgError = useCallback((key) => {
    setImgErrors(prev => ({ ...prev, [key]: true }));
  }, []);

  // ─── DATA FETCHING ─
  useEffect(() => {
    let mounted = true;
    abortControllerRef.current = new AbortController();
    const cacheKey = "steam_v9_" + steamIds.join("_");

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
        const numIds = steamIds.length;

        const [profRes, badgesRes, ...rest] = await Promise.all([
          pget(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamIds[0]}`),
          pget(`https://api.steampowered.com/IPlayerService/GetBadges/v1/?key=${API_KEY}&steamid=${steamIds[0]}`),
          ...steamIds.map(id => 
            pget(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${API_KEY}&steamid=${id}&relationship=friend`)
            .catch(() => ({ friendslist: { friends: [] } }))
          ),
          ...steamIds.map(id => pget(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${id}&include_appinfo=true&include_played_free_games=true`)),
          ...steamIds.map(id => pget(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${id}`)),
        ]);

        if (!mounted) return;

        const p = profRes.response?.players?.[0];
        
        const allFriendsData = rest.slice(0, numIds);
        const uniqueFriendIds = new Set();
        
        allFriendsData.forEach(res => {
          res.friendslist?.friends?.forEach(f => uniqueFriendIds.add(f.steamid));
        });

        const fCount = uniqueFriendIds.size;
        let friendProfiles = [];
        
        if (fCount > 0) {
          const topIds = Array.from(uniqueFriendIds).slice(0, 100).join(",");
          const friendDetailsRes = await pget(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${topIds}`);
          friendProfiles = friendDetailsRes.response?.players || [];
        }

        const ownedGamesRes = rest.slice(numIds, numIds * 2);
        const recentGamesRes = rest.slice(numIds * 2, numIds * 3);

        const gMap = new Map(), rMap = new Map();
        let ptTotal = 0;

        ownedGamesRes.forEach(r => {
          (r.response?.games || []).forEach(g => {
            if (g.playtime_forever > 0) ptTotal += g.playtime_forever;
            const ex = gMap.get(g.appid);
            ex ? (ex.playtime_forever += g.playtime_forever) : gMap.set(g.appid, { ...g, accounts: 1 });
          });
        });

        recentGamesRes.forEach(r => {
          (r.response?.games || []).forEach(g => {
            const ex = rMap.get(g.appid);
            ex ? (ex.playtime_2weeks += g.playtime_2weeks) : rMap.set(g.appid, { ...g });
          });
        });

        const allGamesList = [...gMap.values()].sort((a, b) => b.playtime_forever - a.playtime_forever);
        
        const finalData = {
          profile: p,
          realName: p.realname || "",
          friendsCount: fCount,
          friendProfiles: friendProfiles,
          level: badgesRes.response?.player_level || 0,
          total: gMap.size,
          playtimeTotal: ptTotal,
          games: allGamesList.slice(0, 20),
          allGames: allGamesList,
          recent: [...rMap.values()].sort((a, b) => b.playtime_2weeks - a.playtime_2weeks).slice(0, 10),
        };

        setData(finalData);
        try { 
          localStorage.setItem(cacheKey, JSON.stringify({ data: finalData, ts: Date.now() })); 
        } catch (_) {}
      } catch (err) {
        if (mounted) {
          console.error("Steam API Error:", err);
          setError(err.message || "Failed to connect to Steam Network.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    
    return () => { 
      mounted = false;
      abortControllerRef.current?.abort();
    };
  }, [steamIds]);

  // ─── FILTERED & SORTED GAMES ─
  const filteredGames = useMemo(() => {
    let result = data.allGames || [];

    switch (filterMode) {
      case FILTER_MODES.PLAYED_RECENTLY:
        const recentIds = new Set(data.recent.map(g => g.appid));
        result = result.filter(g => recentIds.has(g.appid));
        break;
      case FILTER_MODES.MOST_PLAYED:
        result = result.slice(0, 15);
        break;
      case FILTER_MODES.ABANDONED:
        const recentMap = new Map(data.recent.map(g => [g.appid, g]));
        result = result.filter(g => !recentMap.has(g.appid) && g.playtime_forever > 300);
        break;
      case FILTER_MODES.NEW:
        result = result.slice(-20).reverse();
        break;
      default:
        result = result;
    }

    if (searchQuery) {
      result = result.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
        const recentMapSort = new Map(data.recent.map((g, i) => [g.appid, i]));
        result = [...result].sort((a, b) => (recentMapSort.get(a.appid) ?? 999) - (recentMapSort.get(b.appid) ?? 999));
        break;
      default:
        result = [...result].sort((a, b) => b.playtime_forever - a.playtime_forever);
    }

    return result;
  }, [data.allGames, data.recent, filterMode, searchQuery, sortBy]);

  // ─── ACHIEVEMENTS (SUDAH DIPERBAIKI UNTUK TOP 5 GAMES) ─
  useEffect(() => {
    if (!data.games || data.games.length === 0) return;

    const gamesToFetch = data.games.slice(0, 5);
    const missingGames = gamesToFetch.filter(g => achCache[g.appid] === undefined);
    
    if (missingGames.length === 0) return;

    if (achTimeoutRef.current) clearTimeout(achTimeoutRef.current);
    
    achTimeoutRef.current = setTimeout(async () => {
      for (const g of missingGames) {
        let found = false;
        for (const sid of steamIds) {
          try {
            const res = await pget(
              `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${g.appid}&key=${API_KEY}&steamid=${sid}`
            );
            const all = res.playerstats?.achievements;
            if (all?.length > 0) {
              const unlocked = all.filter(a => a.achieved === 1).length;
              setAchCache(p => ({ 
                ...p, 
                [g.appid]: { 
                  found: true, 
                  cur: unlocked, 
                  tot: all.length, 
                  pct: Math.round((unlocked / all.length) * 100),
                  achievements: all
                } 
              }));
              found = true;
              break; 
            }
          } catch (_) {}
        }
        if (!found) {
          setAchCache(p => ({ ...p, [g.appid]: { found: false } }));
        }
      }
    }, 500);

    return () => achTimeoutRef.current && clearTimeout(achTimeoutRef.current);
  }, [data.games, steamIds]); 

  // ─── HANDLERS ─
  const exportStats = useCallback(() => {
    const stats = {
      profile: data.profile?.personaname,
      totalGames: data.total,
      totalPlaytime: fmtPlaytime(data.playtimeTotal),
      friends: data.friends,
      timestamp: new Date().toISOString(),
      topGames: data.games.slice(0, 10).map(g => ({
        name: g.name,
        playtime: fmtPlaytime(g.playtime_forever),
        appid: g.appid,
      })),
    };
    
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `steam-stats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const copyProfileUrl = useCallback(() => {
    navigator.clipboard.writeText(data.profile?.profileurl || "");
  }, [data.profile?.profileurl]);

  // ─── INSIGHTS ─
  const insights = useMemo(() => 
    analyzeComprehensive(data.allGames, data.recent, data.profile), 
    [data]
  );

  // ─── LOADING SKELETON ─
  if (loading) {
    return (
      <div className={`w-full h-full min-h-[700px] flex flex-col rounded-2xl border ${theme.border} p-0 overflow-hidden ${theme.bg}`}>
        <div className="h-48 bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
        <div className="p-6 -mt-16 relative z-10 space-y-6">
          <div className="flex gap-5">
            <div className={`w-24 h-24 rounded-2xl ${theme.bgGlass} border ${theme.border} animate-pulse`} />
            <div className="space-y-3 flex-1">
              <div className={`h-6 w-48 rounded-lg animate-pulse bg-white/10`} />
              <div className={`h-4 w-32 rounded-lg animate-pulse bg-white/10`} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-20 rounded-xl ${theme.bgGlass} border ${theme.border} animate-pulse`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-2xl backdrop-blur-sm border ${theme.border} ${theme.bgCard}`}>
        <div className={`flex items-center gap-3 ${theme.txt1}`}>
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold mb-1">Connection Error</h3>
            <p className={`text-sm ${theme.txt2}`}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data.profile) return null;

  const { profile, recent, total, friends, playtimeTotal } = data;
  const status = getStatusTheme(profile.personastate, profile.gameextrainfo);
  const heroImg = data.games[0] ? getGameImages(data.games[0].appid).banner : null;
  const memberYears = profile.timecreated 
    ? new Date().getFullYear() - new Date(profile.timecreated * 1000).getFullYear() 
    : 0;

  // ─── MAIN RENDER ─
  return (
    <div className={`w-full h-full flex flex-col rounded-2xl border ${theme.border} relative overflow-hidden font-sans ${theme.bg} ${theme.txt1} shadow-xl`}>

      {/* ═══════════════ CINEMATIC HEADER ═══════════════ */}
      <div className="relative w-full h-48 shrink-0 overflow-hidden group bg-gradient-to-b from-white/5 to-transparent">
        {heroImg && !imgErrors['hero_banner'] ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImg} 
              className="w-full h-full object-cover opacity-20 group-hover:opacity-30 scale-110 transition-all duration-700" 
              alt="" 
              onError={(e) => {
                const imgs = getGameImages(data.games[0].appid);
                if (e.target.src === imgs.banner) e.target.src = imgs.capsule;
                else if (e.target.src === imgs.capsule) e.target.src = imgs.cover;
                else handleImgError('hero_banner');
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-zinc-800/40" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1]" />

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-4 flex items-center justify-between">
          <span className={`text-xs font-black uppercase tracking-widest ${theme.txt3}`}>
            🎮 STEAM PROFILE
          </span>
          <div className="flex gap-2">
            <Tooltip text="Copy profile URL">
              <button
                onClick={copyProfileUrl}
                className={`p-2 rounded-lg ${theme.bgGlass} border ${theme.border} hover:border-blue-500/50 transition-all ${theme.txt2} hover:${theme.txt1}`}
              >
                <Icons.Copy />
              </button>
            </Tooltip>
            <Tooltip text="Export statistics">
              <button
                onClick={exportStats}
                className={`p-2 rounded-lg ${theme.bgGlass} border ${theme.border} hover:border-blue-500/50 transition-all ${theme.txt2} hover:${theme.txt1}`}
              >
                <Icons.Download />
              </button>
            </Tooltip>
            <Tooltip text="View on Steam">
              <button
                onClick={() => window.open(profile.profileurl)}
                className={`p-2 rounded-lg ${theme.bgGlass} border ${theme.border} hover:border-blue-500/50 transition-all ${theme.txt2} hover:${theme.txt1}`}
              >
                <Icons.ExternalLink />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 cursor-none right-0 z-10 px-6 pb-4 pt-16 flex items-end gap-5">
          <Tooltip text="View profile ">
            <div
              className={`relative w-24 h-24 rounded-xl cursor-none cursor-target overflow-hidden border-2 ${status.border} transition-transform duration-300 hover:scale-105 cursor-pointer shadow-lg`}
              onClick={() => window.open(profile.profileurl)}
            >
              <img src={profile.avatarfull} className="w-full h-full cursor-none object-cover" alt="" />
              <div className="absolute inset-0 cursor-none bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <PulseDot color={status.color} size={6} />
              </div>
            </div>
          </Tooltip>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight leading-none truncate">
                {profile.personaname}
              </h1>
              <span className={`px-2 py-0.5 rounded-full border border-blue-500/50 bg-blue-500/20 text-blue-400 text-xs font-black`}>
                LVL {data.level}
              </span>
            </div>
            {data.realName && (
              <p className={`text-sm mt-1 font-medium italic ${theme.txt3}`}>
                {data.realName}
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border"
                style={{ color: status.color, backgroundColor: `${status.color}18`, borderColor: `${status.color}50` }}
              >
                <span className="w-[5px] h-[5px] rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                {status.label.split(':')[0]}
              </span>
              {profile.loccountrycode && (
                <span className={`text-[9px] font-semibold opacity-70`}>
                  {profile.loccountrycode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──── FRIENDS STACK ──── */}
      {data.friendProfiles?.length > 0 && (
        <div className="flex items-center gap-3 mt-3">
          <div className="flex flex-wrap -space-x-3 lg:-space-x-4 pl-2 justify-center lg:justify-start py-2">
            {data.friendProfiles.map((friend, idx) => (
              <motion.a
                key={friend.steamid}
                href={friend.profileurl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group outline-none rounded-full mb-2 cursor-none" 
                style={{ zIndex: data.friendProfiles.length - idx }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.02 } }}
                whileHover={{ scale: 1, y: -6, zIndex: 999, transition: { type: "spring", stiffness: 400, damping: 12 } }}
              >
                <img
                  src={friend.avatarmedium}
                  alt={friend.personaname}
                  className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 object-cover ${friend.personastate > 0 ? 'border-blue-500' : theme.border} ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out bg-zinc-800 text-white text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap pointer-events-none border border-zinc-600 z-50">
                  <div className="w-2 h-2 bg-zinc-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-zinc-600" />
                  {friend.personaname}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ SCROLLABLE BODY ═══════════════ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-5 space-y-5 z-10">

        {/* ──── STAT CARDS ──── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ">
          {[
            { icon: <Icons.Gamepad />, val: total.toLocaleString(), label: "Games", color: theme.accent },
            { icon: <Icons.Clock />, val: fmtPlaytime(playtimeTotal), label: "Hours", color: theme.accentGreen },
            { icon: <Icons.Friends />, val: fmtNumber(friends), label: "Friends", color: "#06b6d4" },
            { icon: <Icons.Trophy />, val: memberYears, label: "Years", color: theme.accentOrange },
          ].map((stat, i) => (
            <div
              key={i}
              className={`group relative flex flex-col items-center cursor-target cursor-none justify-center p-4 rounded-xl border ${theme.border} ${theme.bgGlass} transition-all duration-300 hover:scale-105 hover:border-opacity-70 cursor-default`}
              style={{ borderColor: isDarkMode ? undefined : `rgb(217, 119, 6)` }}
            >
              <div
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl inset-0"
                style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}12, transparent 70%)` }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: stat.color }}>{stat.icon}</div>
                <span className="text-base sm:text-lg font-black tracking-tight">{stat.val}</span>
                <span className={`text-[7px] font-bold uppercase tracking-[0.15em] ${theme.txt3} mt-2 opacity-70`}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ──── TABS ──── */}
        <div className={`flex gap-1 border-b custom-scrollbar ${theme.border} pb-0 overflow-x-auto`}>
          {[
            { key: TAB_KEYS.OVERVIEW, label: "Overview", icon: <Icons.Gamepad /> },
            { key: TAB_KEYS.RECENTLY, label: "Recently Played", icon: <Icons.History /> },
            { key: TAB_KEYS.ANALYTICS, label: "Analytics", icon: <Icons.TrendingUp /> },
            { key: TAB_KEYS.ACHIEVEMENTS, label: "Achievements", icon: <Icons.Trophy /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center cursor-target cursor-none gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.key
                  ? `border-blue-500 ${theme.txt1}`
                  : `border-transparent ${theme.txt3} hover:${theme.txt2}`
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ──── OVERVIEW TAB ──── */}
        {activeTab === TAB_KEYS.OVERVIEW && (
          <div className="space-y-6 animate-in fade-in duration-500 cursor-none">
            {/* Featured Games */}
            {data.games.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <Icons.Fire />
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: theme.accent }}>
                      Most Played
                    </h2>
                  </div>
                  <span className={`text-[9px] font-bold cursor-target cursor-none uppercase tracking-wider px-2 py-1 rounded ${theme.bgGlass} border ${theme.border} ${theme.txt3}`}>
                    Top {Math.min(6, data.games.length)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 cursor-none lg:grid-cols-3 gap-3">
                  {data.games.slice(0, 6).map((game, idx) => (
                    <div
                      key={game.appid}
                      onClick={() => openModal(game.appid)}
                      onMouseEnter={() => setHoveredGame(game.appid)}
                      onMouseLeave={() => setHoveredGame(null)}
                      className={`group relative cursor-target cursor-none rounded-xl border ${theme.border} overflow-hidden transition-all duration-300 cursor-pointer ${theme.bgGlass} hover:scale-105 hover:border-blue-500/50`}
                    >
                      {/* SMART IMAGE FALLBACK FOR OVERVIEW GRID */}
                      {!imgErrors[`banner_${game.appid}`] ? (
                        <img
                          src={getGameImages(game.appid).banner}
                          className="absolute inset-0 w-full h-full cursor-none object-cover opacity-30 group-hover:opacity-50 transition-opacity"
                          alt=""
                          onError={(e) => {
                            const imgs = getGameImages(game.appid);
                            if (e.target.src === imgs.banner) e.target.src = imgs.capsule;
                            else if (e.target.src === imgs.capsule) e.target.src = imgs.cover;
                            else handleImgError(`banner_${game.appid}`);
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-zinc-800/40" />
                      )}
                      
                      <div className="absolute inset-0 cursor-none bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      <div className="relative p-4 h-44 flex flex-col justify-between text-white">
                        <div>
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-black mb-2 ${idx === 0 ? 'bg-yellow-400/30 text-yellow-300' : 'bg-white/10 text-gray-300'}`}>
                            #{idx + 1}
                          </div>
                          <h3 className="text-sm font-bold line-clamp-2 group-hover:line-clamp-3 transition-all">{game.name}</h3>
                        </div>

                        <div className="space-y-2">
                          <div className="text-2xl font-black tabular-nums">
                            {fmtPlaytime(game.playtime_forever)}h
                          </div>
                          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                              style={{ width: `${Math.min(100, (game.playtime_forever / data.playtimeTotal) * 200)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {insights && (
              <div className={`rounded-xl border ${theme.border} p-5 ${theme.bgGlass} space-y-5 backdrop-blur-sm`}>
                <div className="flex items-center gap-2">
                  <Icons.Star />
                  <h3 className="text-sm font-black uppercase tracking-widest">Profile Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 ">
                  {[
                    { label: "Play Style", val: insights.behaviorType, icon: "🎯", color: theme.accent },
                    { label: "Activity", val: insights.intensity, icon: "⚡", color: theme.accentGreen },
                    { label: "Engagement", val: `${insights.engagementScore}%`, icon: "📊", color: "#f59e0b" },
                    { label: "Diversity", val: `${insights.diversityScore}%`, icon: "🎮", color: "#8b5cf6" },
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-lg cursor-target border ${theme.border} ${theme.bgGlass}/50`}>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${theme.txt3}`}>
                        {item.icon} {item.label}
                      </span>
                      <p className={`text-base font-black mt-2`} style={{ color: item.color }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──── RECENTLY PLAYED TAB ──── */}
        {activeTab === TAB_KEYS.RECENTLY && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {data.recent && data.recent.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="text-sm font-black uppercase tracking-widest">Last 2 Weeks</h3>
                  <span className={`text-[9px] font-bold uppercase ${theme.txt3}`}>{data.recent.length} games</span>
                </div>

                <div className="space-y-2">
                  {data.recent.map((game, idx) => {
                    const recentPlaytime = game.playtime_2weeks || 0;
                    const totalPlaytime = game.playtime_forever || 0;
                    const maxPlaytime = Math.max(...data.recent.map(g => g.playtime_2weeks || 0));
                    return (
                      <div
                        key={game.appid}
                        onClick={() => openModal(game.appid)}
                        className={`group relative rounded-lg cursor-target border ${theme.border} ${theme.bgGlass} p-4 transition-all duration-300 cursor-pointer hover:border-blue-500/50 ${theme.bgHover}`}
                      >
                        <div className="flex gap-4 items-start">
                          
                          {/* SMART IMAGE FALLBACK FOR RECENTLY PLAYED */}
                          {!imgErrors[`cover_${game.appid}`] ? (
                            <img
                              src={getGameImages(game.appid).cover}
                              className="w-16 h-24 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              alt={game.name}
                              onError={(e) => {
                                const imgs = getGameImages(game.appid);
                                if (e.target.src === imgs.cover) e.target.src = imgs.capsule;
                                else if (e.target.src === imgs.capsule) e.target.src = imgs.banner;
                                else handleImgError(`cover_${game.appid}`);
                              }}
                            />
                          ) : (
                            <div className="w-16 h-24 rounded-lg bg-zinc-800/80 border border-white/5 flex flex-col items-center justify-center p-1 text-center opacity-80">
                              <Icons.Gamepad />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <h4 className="font-bold text-sm truncate group-hover:text-blue-400 transition-colors">{game.name}</h4>
                                <p className={`text-xs ${theme.txt3}`}>Played {recentPlaytime}m this week</p>
                              </div>
                              <span className="text-sm font-black" style={{ color: theme.accent }}>
                                {fmtPlaytime(recentPlaytime)}h
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] ${theme.txt3}`}>Recent Activity</span>
                                <span className={`text-[9px] font-bold ${theme.txt3}`}>
                                  {totalPlaytime > 0 ? ((recentPlaytime / totalPlaytime) * 100).toFixed(0) : 0}% of total
                                </span>
                              </div>
                              <ProgressBar value={(recentPlaytime / Math.max(maxPlaytime, 1)) * 100} color={theme.accent} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={`text-center py-12 ${theme.txt3}`}>
                <Icons.History />
                <p className="mt-3 font-semibold">No recent activity</p>
              </div>
            )}
          </div>
        )}

        {/* ──── ANALYTICS TAB ──── */}
        {activeTab === TAB_KEYS.ANALYTICS && insights && (
          <div className="space-y-5 animate-in fade-in duration-500">
            {/* Analytics Content... */}
            <div className={`rounded-xl border ${theme.border} p-5 ${theme.bgGlass}`}>
              <h3 className="text-sm font-black uppercase tracking-widest mb-5">Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: "Overall Engagement", val: insights.engagementScore, color: theme.accent },
                  { label: "Game Diversity", val: insights.diversityScore, color: theme.accentGreen },
                  { label: "Primary Focus", val: insights.topPercentage, color: theme.accentOrange },
                ].map((metric, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-bold uppercase ${theme.txt3}`}>{metric.label}</span>
                      <span className="text-sm font-black" style={{ color: metric.color }}>{metric.val}%</span>
                    </div>
                    <ProgressBar value={parseFloat(metric.val)} color={metric.color} />
                  </div>
                ))}
              </div>
            </div>
            <div className={`grid grid-cols-2 gap-3 rounded-xl border ${theme.border} p-5 ${theme.bgGlass}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${theme.txt3} mb-2`}>Daily Avg</p>
                <p className="text-2xl font-black">{insights.avgDailyRecent}h</p>
                <p className={`text-xs ${theme.txt3}`}>Last 2 weeks</p>
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${theme.txt3} mb-2`}>All-Time Avg</p>
                <p className="text-2xl font-black">{insights.avgDailyAllTime}h</p>
                <p className={`text-xs ${theme.txt3}`}>Per day</p>
              </div>
            </div>
            <div className={`rounded-xl border ${theme.border} p-5 ${theme.bgGlass} space-y-3`}>
              <h3 className="text-sm font-black uppercase tracking-widest">Top 5 Games</h3>
              {data.games.slice(0, 5).map((game, idx) => (
                <div key={game.appid} className={`pb-3 ${idx < 4 ? 'border-b ' + theme.border : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-black w-6 text-center`}>{idx + 1}.</span>
                    <span className="text-sm font-bold flex-1 truncate">{game.name}</span>
                    <span className="text-sm font-black" style={{ color: theme.accent }}>{fmtPlaytime(game.playtime_forever)}h</span>
                  </div>
                  <ProgressBar value={((game.playtime_forever / data.playtimeTotal) * 100)} color={theme.accent} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── ACHIEVEMENTS TAB ──── */}
        {activeTab === TAB_KEYS.ACHIEVEMENTS && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className={`rounded-xl border ${theme.border} p-5 ${theme.bgGlass}`}>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">Achievement Progress</h3>
              
              {data.games.slice(0, 5).map(game => {
                const ach = achCache[game.appid];
                return (
                  <div key={game.appid} className={`py-3 ${game !== data.games[4] ? 'border-b ' + theme.border : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold">{game.name}</h4>
                        <p className={`text-xs ${theme.txt3}`}>{fmtPlaytime(game.playtime_forever)}h played</p>
                      </div>
                      {ach && ach.found && (
                        <span className="text-sm font-black" style={{ color: theme.accent }}>
                          {ach.pct}%
                        </span>
                      )}
                    </div>

                    {ach === undefined ? (
                      <div className="h-2 bg-white/10 rounded-full animate-pulse" />
                    ) : ach.found ? (
                      <>
                        <ProgressBar value={ach.pct} color={theme.accent} />
                        <p className={`text-xs ${theme.txt3} mt-1`}>{ach.cur}/{ach.tot} unlocked</p>
                      </>
                    ) : (
                      <p className={`text-xs ${theme.txt3}`}>No achievement data available for this title</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

{/* ═══════════════ DETAIL MODAL ═══════════════ */}
{createPortal(
  <AnimatePresence>
    {showModal && detailGameId && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
        onClick={closeModal}
      >
        <div className={`absolute inset-0 backdrop-blur-md ${isDarkMode ? 'bg-black/80' : 'bg-white/40'}`} />
        
        {data.allGames.find(g => g.appid === detailGameId) && (() => {
          const game = data.allGames.find(g => g.appid === detailGameId);
          const ach = achCache[game.appid];
          const images = getGameImages(game.appid);
          
          return (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-3xl border ${theme.border} ${isDarkMode ? theme.bgCard : 'bg-white'} shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className={`relative h-48 sm:h-64 w-full shrink-0 overflow-hidden ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-200'}`}>
                {!imgErrors[`modal_banner_${game.appid}`] ? (
                  <img 
                    src={images.banner} 
                    className="w-full h-full object-cover scale-105 blur-[2px] opacity-40"
                    alt=""
                    onError={(e) => {
                      if (e.target.src === images.banner) e.target.src = images.capsule;
                      else if (e.target.src === images.capsule) e.target.src = images.cover;
                      else handleImgError(`modal_banner_${game.appid}`);
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-zinc-800/40" />
                )}
                <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-zinc-900' : 'from-white'} via-transparent to-transparent`} />
                
                <button
                  onClick={closeModal}
                  className={`absolute top-5 right-5 z-50 p-2.5 rounded-full transition-all backdrop-blur-xl border ${
                    isDarkMode 
                      ? 'bg-black/40 text-white/70 border-white/10 hover:bg-red-500/80' 
                      : 'bg-white/60 text-gray-900 border-gray-200 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body Modal */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 -mt-20 relative z-10">
                <div className="flex flex-col sm:flex-row gap-8">
                  
                  {/* Kiri: Poster */}
                  <div className="w-full sm:w-48 shrink-0 space-y-4 ">
                    {!imgErrors[`modal_cover_${game.appid}`] ? (
                      <motion.img
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        src={images.cover}
                        className={`w-full aspect-[2/3] cursor-none cursor-target rounded-2xl object-cover shadow-2xl border-2 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}
                        alt={game.name}
                        onError={(e) => {
                          if (e.target.src === images.cover) e.target.src = images.capsule;
                          else if (e.target.src === images.capsule) e.target.src = images.banner;
                          else handleImgError(`modal_cover_${game.appid}`);
                        }}
                      />
                    ) : (
                      <div className={`w-full aspect-[2/3] rounded-2xl shadow-2xl border-2 flex items-center justify-center opacity-70 ${isDarkMode ? 'border-white/10 bg-zinc-800' : 'border-gray-200 bg-gray-100'}`}>
                        <Icons.Gamepad />
                      </div>
                    )}

                    <button
                      onClick={() => window.open(`https://store.steampowered.com/app/${game.appid}`)}
                      className={`w-full py-3 px-4 cursor-none cursor-target rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group shadow-lg ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50'
                      }`}
                    >
                      <span>STEAM STORE</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>

                  {/* Kanan: Stats & Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <motion.h2 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`text-3xl  sm:text-4xl font-black tracking-tighter mb-2 ${theme.txt1}`}
                      >
                        {game.name}
                      </motion.h2>
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-widest ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white/50' 
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}>
                        APP ID: {game.appid}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-4 rounded-2xl border cursor-none cursor-target ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme.txt3}`}>Playtime</p>
                        <p className={`text-xl font-black ${theme.txt1}`}>{fmtPlaytime(game.playtime_forever)} <span className={`text-xs font-normal ${theme.txt3}`}>Hours</span></p>
                      </div>
                      <div className={`p-4 rounded-2xl border cursor-none cursor-target ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme.txt3}`}>Global Share</p>
                        <p className="text-xl font-black text-blue-500">{((game.playtime_forever / data.playtimeTotal) * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Achievements di Modal */}
                    <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between text-sm">
                        <h3 className={`font-bold uppercase tracking-widest ${theme.txt2}`}>Achievements</h3>
                        {ach?.found && <span className="text-blue-500 font-black">{ach.pct}%</span>}
                      </div>

                      {ach === undefined ? (
                        <div className={`h-2 w-full rounded-full animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                      ) : ach.found ? (
                        <div className="space-y-3">
                          <ProgressBar value={ach.pct} color="#3b82f6" />
                          <p className={`text-xs font-medium ${theme.txt3}`}>
                            Unlocked {ach.cur} of {ach.tot} trophies
                          </p>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className={`text-xs italic ${theme.txt3}`}>No achievement data available for this title</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </motion.div>
    )}
  </AnimatePresence>,
  document.body
)}
    </div>
  );
}