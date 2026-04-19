import React, { 
  useEffect, useState, useContext, useMemo, useRef, useCallback, useReducer 
} from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

// ─── CONSTANTS ────────────────────────────────────────────────────────────
const API_KEY =  "F10E38DFF1FBB84407DF02D50B49A8CF";
const PROXY = "https://api.codetabs.com/v1/proxy?quest=";
const CACHE_TTL = 3600_000;
const REQUEST_TIMEOUT = 10_000;
const MAX_RETRIES = 3;

// ─── TYPES & ENUMS ────────────────────────────────────────────────────────
const TAB_KEYS = {
  OVERVIEW: "overview",
  GAMES: "games",
  ANALYTICS: "analytics",
  ACHIEVEMENTS: "achievements",
  COMPARISON: "comparison",
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

  // Time-based analysis
  const recentTotal = recent.reduce((acc, g) => acc + g.playtime_2weeks, 0);
  const avgDaily = recentTotal / 14 / 60;
  const memberDays = profile?.timecreated 
    ? Math.floor((Date.now() / 1000 - profile.timecreated) / 86400) 
    : 0;
  const avgDailyAllTime = totalPlaytime / Math.max(memberDays, 1) / 60;

  // Game distribution
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

  // Behavior classification
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

  // Risk & Health assessment
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

  // Diversity score (0-100)
  const diversityScore = Math.min(100, (games.length / 50) * 100);
  
  // Engagement score
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
    color: "#a3cc47", 
    bg: "bg-[#a3cc47]/10", 
    border: "border-[#a3cc47]/30", 
    glow: "shadow-[#a3cc47]", 
    dot: "bg-[#a3cc47]" 
  };
  const states = {
    1: { label: "ONLINE", color: "#57cbde", bg: "bg-[#57cbde]/10", border: "border-[#57cbde]/30", glow: "shadow-[#57cbde]", dot: "bg-[#57cbde]" },
    2: { label: "BUSY", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", glow: "shadow-red-500", dot: "bg-red-500" },
    3: { label: "AWAY", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/30", glow: "shadow-amber-500", dot: "bg-amber-500" },
    4: { label: "SNOOZE", color: "#60a5fa", bg: "bg-blue-400/10", border: "border-blue-400/30", glow: "shadow-blue-400", dot: "bg-blue-400" },
  };
  return states[state] || { label: "OFFLINE", color: "#6b7280", bg: "bg-gray-500/10", border: "border-gray-500/30", glow: "shadow-transparent", dot: "bg-gray-500" };
};

// ─── ICONS ────────────────────────────────────────────────────────────────
const Icons = {
  Gamepad: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Trophy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-4.52.636m4.52-.636a6.003 6.003 0 00-4.52.636"/></svg>,
  Friends: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  Fire: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 2.08 13.5.67zM11.71 19c-1.71 0-3.29-.89-4.14-2.15l2.04-2.85c.36.25.82.37 1.3.37.47 0 .93-.12 1.3-.37l2.06 2.88c-.9 1.26-2.38 2.12-4.06 2.12z"/></svg>,
  TrendingUp: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  Target: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  ChevronLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>,
  ExternalLink: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>,
  Sparkle: () => <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"/></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  Copy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>,
  Grid: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  List: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>,
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

const ProgressRing = ({ percentage, color, size = 120, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
};

const MiniBarChart = ({ data, color = "#66c0f4", height = 20 }) => (
  <div className="flex gap-[2px] items-end" style={{ height }}>
    {data.map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-[2px] transition-all duration-500 hover:opacity-100"
        style={{
          height: `${h}%`,
          backgroundColor: color,
          opacity: 0.3 + (h / 100) * 0.7,
        }}
      />
    ))}
  </div>
);

const ProgressBar = ({ value, color = "#66c0f4", bgColor = "bg-black/40", showLabel = false }) => (
  <div className="w-full">
    <div className={`h-[6px] w-full rounded-full overflow-hidden ${bgColor}`}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 12px ${color}66`,
        }}
      />
    </div>
    {showLabel && <span className="text-[10px] text-gray-400 mt-1">{value.toFixed(0)}%</span>}
  </div>
);

// ─── TOOLTIP ──────────────────────────────────────────────────────────────
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function SteamProfileCardV2({
  steamIds = ["76561199166544214", "76561199745356826", "76561198773672138"],
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const isDark = isDarkMode;

  // ─── STATE MANAGEMENT ─
  const [data, setData] = useState({ 
    profile: null, 
    games: [], 
    recent: [], 
    allGames: [],
    total: 0, 
    friends: 0, 
    playtimeTotal: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.OVERVIEW);
  const [filterMode, setFilterMode] = useState(FILTER_MODES.ALL);
  const [achCache, setAchCache] = useState({});
  const [imgErrors, setImgErrors] = useState({});
  const [selectedGames, setSelectedGames] = useState([]);
  const [detailGameId, setDetailGameId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("playtime"); // playtime, name, recent
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  const achTimeoutRef = useRef(null);
  const carouselRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ─── DATA FETCHING ─
  useEffect(() => {
    let mounted = true;
    abortControllerRef.current = new AbortController();
    const cacheKey = "steam_v5_" + steamIds.join("_");

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

        // Merge games from all accounts
        rest.slice(0, steamIds.length).forEach(r => {
          (r.response?.games || []).forEach(g => {
            if (g.playtime_forever > 0) ptTotal += g.playtime_forever;
            const ex = gMap.get(g.appid);
            ex ? (ex.playtime_forever += g.playtime_forever) : gMap.set(g.appid, { ...g, accounts: 1 });
          });
        });

        rest.slice(steamIds.length).forEach(r => {
          (r.response?.games || []).forEach(g => {
            const ex = rMap.get(g.appid);
            ex ? (ex.playtime_2weeks += g.playtime_2weeks) : rMap.set(g.appid, { ...g });
          });
        });

        const allGamesList = [...gMap.values()].sort((a, b) => b.playtime_forever - a.playtime_forever);
        
        const finalData = {
          profile: p,
          friends: fCount,
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

    // Apply filter
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

    // Apply search
    if (searchQuery) {
      result = result.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    switch (sortBy) {
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
        const recentMap = new Map(data.recent.map((g, i) => [g.appid, i]));
        result = [...result].sort((a, b) => (recentMap.get(a.appid) ?? 999) - (recentMap.get(b.appid) ?? 999));
        break;
      default:
        result = [...result].sort((a, b) => b.playtime_forever - a.playtime_forever);
    }

    return result;
  }, [data.allGames, data.recent, filterMode, searchQuery, sortBy]);

  // ─── ACHIEVEMENTS ─
  useEffect(() => {
    if (!data.allGames || data.allGames.length === 0) return;
    const g = data.games[0];
    if (!g || achCache[g.appid] !== undefined) return;

    if (achTimeoutRef.current) clearTimeout(achTimeoutRef.current);
    achTimeoutRef.current = setTimeout(async () => {
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
            return;
          }
        } catch (_) {}
      }
      setAchCache(p => ({ ...p, [g.appid]: { found: false } }));
    }, 300);

    return () => achTimeoutRef.current && clearTimeout(achTimeoutRef.current);
  }, [data.games, steamIds, achCache, data.allGames]);

  // ─── HANDLERS ─
  const handleImgError = useCallback((appid) => {
    setImgErrors(prev => ({ ...prev, [appid]: true }));
  }, []);

  const toggleGameSelection = useCallback((appid) => {
    setSelectedGames(prev => 
      prev.includes(appid) 
        ? prev.filter(id => id !== appid)
        : [...prev, appid].slice(0, 3) // Max 3 comparisons
    );
  }, []);

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

  // ─── THEME TOKENS ─
  const t = {
    bgMain: isDark ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gray-50",
    bgCard: isDark ? "bg-gray-900/60 backdrop-blur-xl" : "bg-white/80 backdrop-blur-xl",
    bgPanel: isDark ? "bg-gray-900/80" : "bg-white/80",
    bgGlass: isDark ? "bg-white/[0.05]" : "bg-black/[0.03]",
    bgHover: isDark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.06]",
    border: isDark ? "border-white/[0.08]" : "border-black/[0.1]",
    borderHover: isDark ? "hover:border-white/[0.15]" : "hover:border-black/[0.2]",
    divider: isDark ? "divide-white/[0.05]" : "divide-black/[0.08]",
    txt1: isDark ? "text-gray-50" : "text-gray-900",
    txt2: isDark ? "text-gray-400" : "text-gray-600",
    txt3: isDark ? "text-gray-500" : "text-gray-400",
    accent: "#66c0f4",
    accentGreen: "#a3cc47",
    accentOrange: "#f59e0b",
    accentRed: "#ef4444",
    cardShadow: isDark 
      ? "shadow-[0_8px_32px_rgba(0,0,0,0.3)]" 
      : "shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
    gradientFade: isDark
      ? "from-gray-950 via-gray-900/90"
      : "from-gray-50 via-gray-50/90",
  };

  // ─── INSIGHTS ─
  const insights = useMemo(() => 
    analyzeComprehensive(data.allGames, data.recent, data.profile), 
    [data]
  );

  // ─── ACTIVITY DATA ─
  const getActivityData = (appid) => {
    const seed = appid % 97;
    return Array.from({ length: 12 }, (_, i) => 15 + ((seed * (i + 3) * 7) % 80));
  };

  // ─── LOADING SKELETON ─
  if (loading) {
    return (
      <div className={`w-full h-full min-h-[700px] flex flex-col rounded-2xl border ${t.border} p-0 overflow-hidden relative ${t.bgMain}`}>
        {/* Hero skeleton */}
        <div className="h-56 bg-gradient-to-br from-gray-600/20 to-gray-600/5 animate-pulse" />
        
        {/* Content skeleton */}
        <div className="p-6 -mt-20 relative z-10 space-y-6">
          {/* Avatar + name */}
          <div className="flex gap-5">
            <div className="w-28 h-28 rounded-2xl bg-gray-600/20 animate-pulse border border-white/5" />
            <div className="space-y-3 flex-1">
              <div className="h-8 w-48 bg-gray-600/20 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-gray-600/20 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-24 rounded-xl ${t.bgGlass} border ${t.border} animate-pulse`} />
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-600/20 rounded-lg animate-pulse" />
            ))}
          </div>

          {/* Content area */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-600/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-2xl backdrop-blur-sm border ${t.border} ${t.bgCard}`}>
        <div className={`flex items-center gap-3 ${t.txt1}`}>
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold mb-1">Connection Error</h3>
            <p className={`text-sm ${t.txt2}`}>{error}</p>
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

  const selectedGameData = selectedGames.map(id => 
    data.allGames.find(g => g.appid === id)
  ).filter(Boolean);

  // ─── MAIN RENDER ─
  return (
    <div className={`w-full h-full flex flex-col rounded-2xl border ${t.border} ${t.cardShadow} relative overflow-hidden font-sans ${t.bgMain} ${t.txt1}`}>

      {/* ═══════════════ CINEMATIC HEADER ═══════════════ */}
      <div className="relative w-full h-56 shrink-0 overflow-hidden group">
        {/* Section label */}
        <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#66c0f4] to-[#1b2838] flex items-center justify-center shadow-lg">
              <Icons.Sparkle />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest ${t.txt3}`}>
              STEAM PROFILE ANALYTICS
            </span>
          </div>
          <div className="flex gap-2">
            <Tooltip text="Copy profile URL">
              <button
                onClick={copyProfileUrl}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${t.bgGlass} ${t.border} border ${t.borderHover} transition-all ${t.txt2} hover:${t.txt1}`}
              >
                <Icons.Copy />
              </button>
            </Tooltip>
            <Tooltip text="Export statistics">
              <button
                onClick={exportStats}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${t.bgGlass} ${t.border} border ${t.borderHover} transition-all ${t.txt2} hover:${t.txt1}`}
              >
                <Icons.Download />
              </button>
            </Tooltip>
            <button
              onClick={() => window.open(profile.profileurl)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${t.bgGlass} ${t.border} border ${t.borderHover} transition-all ${t.txt2} hover:${t.txt1}`}
            >
              <Icons.ExternalLink /> View
            </button>
          </div>
        </div>

        {/* Hero backdrop */}
        {heroImg && (
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImg} 
              className="w-full h-full object-cover opacity-30 group-hover:opacity-40 scale-110 saturate-[1.2] transition-all duration-500" 
              alt="" 
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${t.gradientFade} to-transparent`} />
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-gray-950/70' : 'from-gray-50/70'} via-transparent to-transparent`} />
          </div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 z-[1] opacity-[0.02]" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'
        }} />

        {/* Profile info */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-20">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <Tooltip text="Visit Steam profile">
              <div
                className={`relative w-28 h-28 rounded-2xl overflow-hidden border-2 ${status.border} ${t.cardShadow} transition-all duration-300 hover:scale-105 cursor-pointer group/avatar`}
                onClick={() => window.open(profile.profileurl)}
              >
                <img src={profile.avatarfull} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <PulseDot color={status.color} size={6} />
                </div>
              </div>
            </Tooltip>

            {/* Name + status + stats */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-[28px] font-black tracking-tight leading-none truncate drop-shadow-lg">
                {profile.personaname}
              </h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border backdrop-blur-md"
                  style={{
                    color: status.color,
                    backgroundColor: `${status.color}15`,
                    borderColor: `${status.color}40`,
                  }}
                >
                  <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
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
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 pt-5 space-y-6 z-10">

        {/* ──── STAT CARDS ──── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { icon: <Icons.Gamepad />, val: total.toLocaleString(), label: "Total Games", color: "#66c0f4" },
            { icon: <Icons.Clock />, val: fmtPlaytime(playtimeTotal), label: "Total Hours", color: "#a3cc47" },
            { icon: <Icons.Friends />, val: fmtNumber(friends), label: "Friends", color: "#57cbde" },
            { icon: <Icons.Trophy />, val: memberYears, label: "Member Years", color: "#f59e0b" },
          ].map((stat, i) => (
            <Tooltip key={i} text={stat.label}>
              <div
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border ${t.bgGlass} ${t.border} ${t.borderHover} ${t.cardShadow} transition-all duration-200 group overflow-hidden cursor-default hover:scale-105`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}12, transparent 70%)` }}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                  <span className="text-[16px] sm:text-[18px] font-black tracking-tighter leading-none">{stat.val}</span>
                  <span className={`text-[7px] font-bold uppercase tracking-[0.2em] ${t.txt3} mt-1.5`}>{stat.label}</span>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>

        {/* ──── TABS ──── */}
        <div className={`flex gap-1 overflow-x-auto border-b ${t.border} pb-0`}>
          {[
            { key: TAB_KEYS.OVERVIEW, label: "Overview", icon: <Icons.Sparkle /> },
            { key: TAB_KEYS.GAMES, label: "Games", icon: <Icons.Gamepad /> },
            { key: TAB_KEYS.ANALYTICS, label: "Analytics", icon: <Icons.TrendingUp /> },
            { key: TAB_KEYS.ACHIEVEMENTS, label: "Achievements", icon: <Icons.Trophy /> },
            { key: TAB_KEYS.COMPARISON, label: "Compare", icon: <Icons.Target /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.key
                  ? `border-[${t.accent}] ${t.txt1}`
                  : `border-transparent ${t.txt3} hover:${t.txt2}`
              }`}
              style={activeTab === tab.key ? { borderBottomColor: "#66c0f4" } : {}}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ──── OVERVIEW TAB ──── */}
        {activeTab === TAB_KEYS.OVERVIEW && (
          <div className="space-y-6 animate-fadeIn">
            {/* Featured Games */}
            {data.games.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <Icons.Fire />
                    <h2 className="text-[11px] font-black uppercase tracking-widest" style={{ color: t.accent }}>
                      Most Played
                    </h2>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded ${t.bgGlass} ${t.border} border ${t.txt3}`}>
                    Top {Math.min(6, data.games.length)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.games.slice(0, 6).map((game, idx) => {
                    const ach = achCache[game.appid];
                    const activity = getActivityData(game.appid);
                    return (
                      <div
                        key={game.appid}
                        onClick={() => setDetailGameId(game.appid)}
                        className={`group relative rounded-xl border ${t.border} overflow-hidden ${t.cardShadow} transition-all duration-300 hover:scale-105 cursor-pointer ${t.bgGlass}`}
                      >
                        {/* Background */}
                        <img
                          src={getGameImages(game.appid).banner}
                          className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Content */}
                        <div className="relative p-4 h-40 flex flex-col justify-between text-white">
                          <div>
                            <div className={`inline-flex items-center justify-center w-6 h-6 rounded text-[9px] font-black mb-2 ${idx === 0 ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-gray-300'}`}>
                              #{idx + 1}
                            </div>
                            <h3 className="text-sm font-bold line-clamp-2">{game.name}</h3>
                          </div>

                          <div>
                            <div className="text-2xl font-black tabular-nums mb-2">
                              {fmtPlaytime(game.playtime_forever)}h
                            </div>
                            <MiniBarChart data={activity} color={t.accent} height={12} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Insights */}
            {insights && (
              <div className={`rounded-xl border ${t.border} p-5 ${t.bgGlass} space-y-4`}>
                <div className="flex items-center gap-2">
                  <Icons.TrendingUp />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">Player Profile</h3>
                </div>

                <div className={`grid grid-cols-2 gap-4 ${t.divider}`}>
                  {[
                    { label: "Play Pattern", val: insights.behaviorType, icon: "🎯" },
                    { label: "Activity Level", val: insights.intensity, icon: "⚡" },
                    { label: "Engagement", val: `${insights.engagementScore}%`, icon: "📊" },
                    { label: "Diversity", val: `${insights.diversityScore}%`, icon: "🎮" },
                    { label: "Primary Focus", val: insights.topPercentage + "%", icon: "🔥" },
                    { label: "Member Since", val: insights.memberDays + " days", icon: "📅" },
                  ].map((item, i) => (
                    <div key={i} className={`pb-4 ${i < 4 ? 'border-b ' + t.divider : ''}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${t.txt3}`}>
                        {item.icon} {item.label}
                      </span>
                      <p className={`text-[14px] font-bold mt-1 ${t.txt1}`}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──── GAMES TAB ──── */}
        {activeTab === TAB_KEYS.GAMES && (
          <div className="space-y-4 animate-fadeIn">
            {/* Search & Filters */}
            <div className="space-y-3">
              <div className={`flex gap-2 p-3 rounded-xl border ${t.border} ${t.bgGlass}`}>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 bg-transparent border-none outline-none text-[13px] placeholder-gray-500 ${t.txt1}`}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {Object.entries(FILTER_MODES).map(([key, val]) => (
                  <button
                    key={val}
                    onClick={() => setFilterMode(val)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      filterMode === val
                        ? `${t.bgCard} border-[#66c0f4] border-2`
                        : `${t.bgGlass} border ${t.border} hover:border-[#66c0f4]/50`
                    }`}
                  >
                    {key.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 justify-between">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg bg-transparent border ${t.border} ${t.txt2} cursor-pointer`}
                >
                  <option value="playtime">Sort: Playtime</option>
                  <option value="name">Sort: Name</option>
                  <option value="recent">Sort: Recent</option>
                </select>

                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${viewMode === "grid" ? `${t.bgCard} border-[#66c0f4]` : t.bgGlass} border ${t.border}`}
                  >
                    <Icons.Grid />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${viewMode === "list" ? `${t.bgCard} border-[#66c0f4]` : t.bgGlass} border ${t.border}`}
                  >
                    <Icons.List />
                  </button>
                </div>
              </div>
            </div>

            {/* Games Display */}
            {filteredGames.length > 0 ? (
              <>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${t.txt3}`}>
                  {filteredGames.length} games found
                </span>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredGames.map(game => {
                      const isSelected = selectedGames.includes(game.appid);
                      return (
                        <div
                          key={game.appid}
                          onClick={() => setDetailGameId(game.appid)}
                          className={`group relative rounded-xl border transition-all cursor-pointer overflow-hidden ${
                            isSelected
                              ? `border-[#66c0f4] ${t.bgCard} shadow-[0_0_20px_rgba(102,192,244,0.3)]`
                              : `border-${t.border} ${t.bgGlass} hover:border-[#66c0f4]/50`
                          }`}
                        >
                          <img
                            src={getGameImages(game.appid).cover}
                            className="w-full h-48 object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                            alt={game.name}
                            onError={() => handleImgError(game.appid)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                          <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                            <div className="flex items-start justify-between">
                              <h3 className="text-sm font-bold line-clamp-2 flex-1">{game.name}</h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleGameSelection(game.appid);
                                }}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isSelected
                                    ? "bg-[#66c0f4]/30 border border-[#66c0f4]"
                                    : "bg-white/10 border border-white/20"
                                }`}
                              >
                                ✓
                              </button>
                            </div>

                            <div className="text-xs">
                              <div className="text-lg font-black">{fmtPlaytime(game.playtime_forever)}h</div>
                              <div className="text-gray-300 text-[10px]">playtime</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`rounded-xl border ${t.border} overflow-hidden`}>
                    {filteredGames.map((game, idx) => (
                      <div
                        key={game.appid}
                        onClick={() => setDetailGameId(game.appid)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${idx > 0 ? 'border-t ' + t.border : ''} ${t.bgHover}`}
                      >
                        <img
                          src={getGameImages(game.appid).icon}
                          className="w-12 h-12 rounded object-cover"
                          alt=""
                          onError={() => handleImgError(game.appid)}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[13px] truncate">{game.name}</h4>
                          <p className={`text-[11px] ${t.txt3}`}>{fmtPlaytime(game.playtime_forever)}h playtime</p>
                        </div>
                        <span className="text-[12px] font-black" style={{ color: t.accent }}>
                          {((game.playtime_forever / (data.playtimeTotal || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-8 ${t.txt3}`}>
                <p>No games found</p>
              </div>
            )}
          </div>
        )}

        {/* ──── ANALYTICS TAB ──── */}
        {activeTab === TAB_KEYS.ANALYTICS && insights && (
          <div className="space-y-6 animate-fadeIn">
            {/* Engagement Metrics */}
            <div className={`rounded-xl border ${t.border} p-5 ${t.bgGlass}`}>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-5">Engagement Metrics</h3>
              
              <div className="space-y-5">
                {[
                  { label: "Overall Engagement", val: insights.engagementScore, color: "#66c0f4" },
                  { label: "Game Diversity", val: insights.diversityScore, color: "#a3cc47" },
                  { label: "Primary Focus", val: insights.topPercentage, color: "#f59e0b" },
                ].map((metric, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase ${t.txt3}`}>{metric.label}</span>
                      <span className="text-[12px] font-black" style={{ color: metric.color }}>
                        {metric.val}%
                      </span>
                    </div>
                    <ProgressBar value={parseFloat(metric.val)} color={metric.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* Time Analysis */}
            <div className={`grid grid-cols-2 gap-4 rounded-xl border ${t.border} p-5 ${t.bgGlass}`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${t.txt3} mb-2`}>Daily Average</p>
                <p className="text-[20px] font-black">{insights.avgDailyRecent}h</p>
                <p className={`text-[9px] ${t.txt3}`}>Last 2 weeks</p>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${t.txt3} mb-2`}>All-Time Average</p>
                <p className="text-[20px] font-black">{insights.avgDailyAllTime}h</p>
                <p className={`text-[9px] ${t.txt3}`}>Per day</p>
              </div>
            </div>

            {/* Top Games Breakdown */}
            <div className={`rounded-xl border ${t.border} p-5 ${t.bgGlass} space-y-3`}>
              <h3 className="text-[11px] font-black uppercase tracking-widest">Top 5 Games by Playtime</h3>
              
              {data.games.slice(0, 5).map((game, idx) => (
                <div key={game.appid}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black w-5`}>#{idx + 1}</span>
                    <span className="text-[12px] font-bold flex-1 truncate">{game.name}</span>
                    <span className={`text-[11px] font-black`} style={{ color: t.accent }}>
                      {fmtPlaytime(game.playtime_forever)}h
                    </span>
                  </div>
                  <ProgressBar value={((game.playtime_forever / data.playtimeTotal) * 100)} color={t.accent} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──── ACHIEVEMENTS TAB ──── */}
        {activeTab === TAB_KEYS.ACHIEVEMENTS && (
          <div className="space-y-4 animate-fadeIn">
            <div className={`rounded-xl border ${t.border} p-5 ${t.bgGlass}`}>
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-4">Achievement Progress</h3>
              
              {data.games.slice(0, 5).map(game => {
                const ach = achCache[game.appid];
                return (
                  <div key={game.appid} className={`py-3 ${t.divider} border-b last:border-b-0`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-[12px] font-bold">{game.name}</h4>
                        <p className={`text-[9px] ${t.txt3}`}>{fmtPlaytime(game.playtime_forever)}h</p>
                      </div>
                      {ach && ach.found && (
                        <span className="text-[11px] font-black" style={{ color: t.accent }}>
                          {ach.pct}%
                        </span>
                      )}
                    </div>

                    {ach === undefined ? (
                      <div className="h-2 bg-gray-600/20 rounded-full animate-pulse" />
                    ) : ach.found ? (
                      <>
                        <ProgressBar value={ach.pct} color={t.accent} />
                        <p className={`text-[9px] ${t.txt3} mt-1`}>{ach.cur}/{ach.tot} unlocked</p>
                      </>
                    ) : (
                      <p className={`text-[9px] ${t.txt3}`}>No achievement data available</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──── COMPARISON TAB ──── */}
        {activeTab === TAB_KEYS.COMPARISON && (
          <div className="space-y-4 animate-fadeIn">
            {selectedGameData.length > 0 ? (
              <>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${t.txt3}`}>
                  Comparing {selectedGameData.length} game{selectedGameData.length !== 1 ? 's' : ''}
                </span>

                <div className="grid grid-cols-1 gap-3">
                  {selectedGameData.map(game => (
                    <div key={game.appid} className={`rounded-xl border ${t.border} p-4 ${t.bgGlass}`}>
                      <div className="flex gap-4 items-start">
                        <img
                          src={getGameImages(game.appid).capsule}
                          className="w-32 h-16 rounded object-cover shrink-0"
                          alt={game.name}
                        />
                        <div className="flex-1">
                          <h4 className="text-[13px] font-bold mb-3">{game.name}</h4>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <p className={`${t.txt3} uppercase text-[8px] font-bold mb-1`}>Playtime</p>
                              <p className="font-black text-[14px]">{fmtPlaytime(game.playtime_forever)}h</p>
                            </div>
                            <div>
                              <p className={`${t.txt3} uppercase text-[8px] font-bold mb-1`}>Share</p>
                              <p className="font-black text-[14px]">
                                {((game.playtime_forever / data.playtimeTotal) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comparison Chart */}
                <div className={`rounded-xl border ${t.border} p-5 ${t.bgGlass}`}>
                  <h3 className="text-[11px] font-black uppercase tracking-widest mb-4">Playtime Comparison</h3>
                  
                  {selectedGameData.map(game => (
                    <div key={game.appid} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold truncate">{game.name}</span>
                        <span className="text-[11px] font-black" style={{ color: t.accent }}>
                          {fmtPlaytime(game.playtime_forever)}h
                        </span>
                      </div>
                      <ProgressBar 
                        value={(game.playtime_forever / Math.max(...selectedGameData.map(g => g.playtime_forever))) * 100} 
                        color={t.accent}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={`text-center py-8 rounded-xl border-2 border-dashed ${t.border} ${t.txt3}`}>
                <p className="font-bold mb-2">No games selected</p>
                <p className="text-[11px]">Click the ✓ icon on games to compare up to 3 titles</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {detailGameId && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetailGameId(null)}
        >
          <div 
            className={`rounded-2xl border ${t.border} max-w-2xl w-full max-h-[80vh] overflow-y-auto ${t.bgCard} p-6 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {data.allGames.find(g => g.appid === detailGameId) && (() => {
              const game = data.allGames.find(g => g.appid === detailGameId);
              const ach = achCache[game.appid];
              return (
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <img
                      src={getGameImages(game.appid).cover}
                      className="w-24 h-36 rounded-lg object-cover"
                      alt={game.name}
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-black mb-2">{game.name}</h2>
                      <div className="space-y-2 text-[12px]">
                        <p><span className={`font-bold ${t.txt3}`}>Playtime:</span> {fmtPlaytime(game.playtime_forever)}h</p>
                        <p><span className={`font-bold ${t.txt3}`}>App ID:</span> {game.appid}</p>
                        <p><span className={`font-bold ${t.txt3}`}>Share of playtime:</span> {((game.playtime_forever / data.playtimeTotal) * 100).toFixed(2)}%</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => window.open(`https://store.steampowered.com/app/${game.appid}`)}
                          className={`px-4 py-2 rounded-lg text-[11px] font-bold bg-[#66c0f4] text-white hover:bg-[#66c0f4]/80`}
                        >
                          View Store
                        </button>
                        <button
                          onClick={() => toggleGameSelection(game.appid)}
                          className={`px-4 py-2 rounded-lg text-[11px] font-bold border ${t.border} ${t.bgGlass}`}
                        >
                          {selectedGames.includes(game.appid) ? "Remove from Comparison" : "Add to Comparison"}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setDetailGameId(null)}
                      className={`text-2xl ${t.txt3} hover:${t.txt1}`}
                    >
                      ✕
                    </button>
                  </div>

                  {ach && ach.found && (
                    <div className={`rounded-lg border ${t.border} p-4 ${t.bgGlass}`}>
                      <h3 className="text-[12px] font-black uppercase tracking-wide mb-3">Achievements</h3>
                      <div className="mb-3">
                        <ProgressBar value={ach.pct} color={t.accent} showLabel />
                      </div>
                      <p className={`text-[11px] ${t.txt3}`}>{ach.cur} out of {ach.tot} achievements unlocked</p>
                    </div>
                  )}

                  <div className={`rounded-lg border ${t.border} p-4 ${t.bgGlass}`}>
                    <h3 className="text-[12px] font-black uppercase tracking-wide mb-3">Activity</h3>
                    <MiniBarChart data={getActivityData(game.appid)} color={t.accent} height={24} />
                    <p className={`text-[9px] ${t.txt3} mt-2`}>Weekly playtime trend</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}