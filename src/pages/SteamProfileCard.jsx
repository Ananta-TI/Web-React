import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { fetchSteamStats, fetchSteamAchievement } from "../services/steamClient.js";

const CACHE_TTL = 30 * 60 * 1000;

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

const Icons = {
  Gamepad: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Trophy: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172" />
    </svg>
  ),
  Friends: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07" />
    </svg>
  ),
  Fire: () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 2.08 13.5.67z" />
    </svg>
  ),
  Trend: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  History: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  External: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
  Refresh: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M20.49 9.348A8.25 8.25 0 105.64 16.5" />
    </svg>
  ),
  Copy: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Download: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Close: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

function fmtPlaytime(mins = 0) {
  const hours = Number(mins || 0) / 60;
  if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k`;
  return hours.toFixed(1);
}

function fmtNumber(n = 0) {
  const value = Number(n || 0);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

function getGameImages(appid, hash) {
  return {
    icon: hash
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appid}/${hash}.jpg`
      : `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`,
    banner: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`,
    cover: `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/library_600x900.jpg`,
    capsule: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`,
  };
}

function getStatusTheme(state, gameInfo) {
  if (gameInfo) {
    return {
      label: `PLAYING: ${String(gameInfo).toUpperCase().slice(0, 20)}`,
      color: "#22c55e",
      border: "border-green-500/30",
    };
  }

  const states = {
    1: { label: "ONLINE", color: "#3b82f6", border: "border-blue-500/30" },
    2: { label: "BUSY", color: "#ef4444", border: "border-red-500/30" },
    3: { label: "AWAY", color: "#f59e0b", border: "border-amber-500/30" },
    4: { label: "SNOOZE", color: "#8b5cf6", border: "border-purple-500/30" },
  };

  return states[state] || {
    label: "OFFLINE",
    color: "#6b7280",
    border: "border-gray-500/30",
  };
}

function analyzeComprehensive(games = [], recent = [], profile = null) {
  if (!games.length) return null;

  const totalPlaytime = games.reduce((acc, game) => acc + Number(game.playtime_forever || 0), 0);
  const topGame = games[0];
  const topPercentage = totalPlaytime > 0 ? (topGame.playtime_forever / totalPlaytime) * 100 : 0;
  const recentTotal = recent.reduce((acc, game) => acc + Number(game.playtime_2weeks || 0), 0);
  const avgDaily = recentTotal / 14 / 60;

  const memberDays = profile?.timecreated
    ? Math.floor((Date.now() / 1000 - profile.timecreated) / 86400)
    : 1;

  const avgDailyAllTime = totalPlaytime / Math.max(memberDays, 1) / 60;
  const recentMap = new Map(recent.map((game) => [game.appid, game]));
  const abandonedGames = games.filter(
    (game) => !recentMap.has(game.appid) && game.playtime_forever > 300 && game.appid !== topGame.appid
  );

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

  const diversityScore = Math.min(100, (games.length / 50) * 100);
  const abandonedRatio = games.length > 0 ? abandonedGames.length / games.length : 0;
  const engagementScore = Math.min(
    100,
    (avgDaily / 4) * 40 + (diversityScore / 100) * 30 + (1 - abandonedRatio) * 30
  );

  return {
    behaviorType,
    intensity,
    engagementScore: engagementScore.toFixed(0),
    diversityScore: diversityScore.toFixed(0),
    topPercentage: topPercentage.toFixed(1),
    avgDailyRecent: avgDaily.toFixed(2),
    avgDailyAllTime: avgDailyAllTime.toFixed(2),
    abandonedCount: abandonedGames.length,
    topGame: topGame.name,
  };
}

function PulseDot({ color }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

function ProgressBar({ value, color = "#3b82f6" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${safeValue}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 14px ${color}55`,
        }}
      />
    </div>
  );
}

function Tooltip({ text, children }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-lg bg-black/90 px-3 py-1.5 text-[11px] text-white">
          {text}
        </div>
      </div>
    </div>
  );
}

export default function SteamProfileCard({
  steamIds = [
    "76561199166544214",
    "76561199745356826",
    "76561198773672138",
    "76561198735338945",
  ],
}) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const theme = useMemo(() => {
    const dark = {
      bg: "bg-zinc-900",
      bgCard: "bg-zinc-800/70",
      bgGlass: "bg-zinc-800/45",
      bgHover: "hover:bg-zinc-700/45",
      border: "border-zinc-700/80",
      txt1: "text-white",
      txt2: "text-zinc-300",
      txt3: "text-zinc-500",
      accent: "#3b82f6",
      accentGreen: "#22c55e",
      accentOrange: "#f59e0b",
      accentPurple: "#8b5cf6",
    };

    const light = {
      bg: "bg-white",
      bgCard: "bg-white",
      bgGlass: "bg-gray-100/80",
      bgHover: "hover:bg-gray-200/80",
      border: "border-gray-200",
      txt1: "text-gray-950",
      txt2: "text-gray-700",
      txt3: "text-gray-500",
      accent: "#2563eb",
      accentGreen: "#16a34a",
      accentOrange: "#d97706",
      accentPurple: "#7c3aed",
    };

    return isDarkMode ? dark : light;
  }, [isDarkMode]);

  const idsKey = useMemo(() => steamIds.join("_"), [steamIds]);

  const [data, setData] = useState({
    profile: null,
    games: [],
    recent: [],
    allGames: [],
    total: 0,
    friends: 0,
    playtimeTotal: 0,
    level: 0,
    friendProfiles: [],
    realName: "",
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.OVERVIEW);
  const [filterMode, setFilterMode] = useState(FILTER_MODES.ALL);
  const [sortBy, setSortBy] = useState("playtime");
  const [searchQuery, setSearchQuery] = useState("");
  const [achCache, setAchCache] = useState({});
  const [imgErrors, setImgErrors] = useState({});
  const [detailGameId, setDetailGameId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const achTimeoutRef = useRef(null);

  const handleImgError = useCallback((key) => {
    setImgErrors((prev) => ({ ...prev, [key]: true }));
  }, []);

  const loadData = useCallback(
    async (force = false) => {
      try {
        setError(null);

        if (force) setRefreshing(true);
        else setLoading(true);

        const cacheKey = `steam_card_modern_${idsKey}`;

        if (!force) {
          const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");

          if (cached?.data && Date.now() - cached.ts < CACHE_TTL) {
            setData(cached.data);
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }

        const result = await fetchSteamStats(steamIds);

        setData({
          profile: result.profile || null,
          realName: result.realName || "",
          friends: result.friends ?? result.friendsCount ?? 0,
          friendsCount: result.friendsCount ?? result.friends ?? 0,
          friendProfiles: result.friendProfiles || [],
          level: result.level || 0,
          total: result.total || 0,
          playtimeTotal: result.playtimeTotal || 0,
          games: result.games || [],
          allGames: result.allGames || result.games || [],
          recent: result.recent || [],
          failed: result.failed || null,
        });

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: result,
            ts: Date.now(),
          })
        );
      } catch (err) {
        setError(err.message || "Failed to connect to Steam Network.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idsKey, steamIds]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = originalOverflow;

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal]);

  useEffect(() => {
    if (!data.games?.length) return;

    const gamesToFetch = data.games.slice(0, 5);
    const missingGames = gamesToFetch.filter((game) => achCache[game.appid] === undefined);

    if (!missingGames.length) return;

    if (achTimeoutRef.current) clearTimeout(achTimeoutRef.current);

    achTimeoutRef.current = setTimeout(async () => {
      for (const game of missingGames) {
        try {
          const result = await fetchSteamAchievement({
            steamIds,
            appid: game.appid,
          });

          setAchCache((prev) => ({
            ...prev,
            [game.appid]: result,
          }));
        } catch {
          setAchCache((prev) => ({
            ...prev,
            [game.appid]: { found: false },
          }));
        }
      }
    }, 450);

    return () => {
      if (achTimeoutRef.current) clearTimeout(achTimeoutRef.current);
    };
  }, [data.games, steamIds, achCache]);

  const filteredGames = useMemo(() => {
    let result = [...(data.allGames || [])];

    if (filterMode === FILTER_MODES.PLAYED_RECENTLY) {
      const recentIds = new Set(data.recent.map((game) => game.appid));
      result = result.filter((game) => recentIds.has(game.appid));
    }

    if (filterMode === FILTER_MODES.MOST_PLAYED) {
      result = result.slice(0, 15);
    }

    if (filterMode === FILTER_MODES.ABANDONED) {
      const recentIds = new Set(data.recent.map((game) => game.appid));
      result = result.filter((game) => !recentIds.has(game.appid) && game.playtime_forever > 300);
    }

    if (filterMode === FILTER_MODES.NEW) {
      result = result.slice(-20).reverse();
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((game) => game.name?.toLowerCase().includes(q));
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "recent") {
      const recentOrder = new Map(data.recent.map((game, index) => [game.appid, index]));
      result.sort((a, b) => (recentOrder.get(a.appid) ?? 999) - (recentOrder.get(b.appid) ?? 999));
    } else {
      result.sort((a, b) => b.playtime_forever - a.playtime_forever);
    }

    return result;
  }, [data.allGames, data.recent, filterMode, searchQuery, sortBy]);

  const insights = useMemo(
    () => analyzeComprehensive(data.allGames, data.recent, data.profile),
    [data.allGames, data.recent, data.profile]
  );

  const openModal = (appid) => {
    setDetailGameId(appid);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setDetailGameId(null), 250);
  };

  const copyProfileUrl = useCallback(() => {
    navigator.clipboard.writeText(data.profile?.profileurl || "");
  }, [data.profile?.profileurl]);

  const exportStats = useCallback(() => {
    const stats = {
      profile: data.profile?.personaname,
      totalGames: data.total,
      totalPlaytime: fmtPlaytime(data.playtimeTotal),
      friends: data.friends,
      timestamp: new Date().toISOString(),
      topGames: data.games.slice(0, 10).map((game) => ({
        name: game.name,
        playtime: fmtPlaytime(game.playtime_forever),
        appid: game.appid,
      })),
    };

    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `steam-stats-${Date.now()}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }, [data]);

  if (loading) {
    return (
      <div className={`flex min-h-[680px] w-full flex-col overflow-hidden rounded-3xl border ${theme.border} ${theme.bg}`}>
        <div className="h-52 animate-pulse bg-gradient-to-br from-white/10 to-white/5" />
        <div className="relative z-10 -mt-16 space-y-6 p-6">
          <div className="flex gap-5">
            <div className={`h-24 w-24 animate-pulse rounded-2xl border ${theme.border} ${theme.bgGlass}`} />
            <div className="flex-1 space-y-3 pt-8">
              <div className="h-7 w-52 animate-pulse rounded-lg bg-white/10" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-white/10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`h-20 animate-pulse rounded-2xl border ${theme.border} ${theme.bgGlass}`} />
            ))}
          </div>

          <div className={`h-64 animate-pulse rounded-2xl border ${theme.border} ${theme.bgGlass}`} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-3xl border p-8 ${theme.border} ${theme.bgCard}`}>
        <div className={`flex items-start gap-3 ${theme.txt1}`}>
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="mb-1 font-bold">Connection Error</h3>
            <p className={`text-sm ${theme.txt2}`}>{error}</p>
            <button
              onClick={() => loadData(true)}
              className={`mt-4 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest ${theme.border} ${theme.bgGlass}`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data.profile) return null;

  const { profile, total, friends, playtimeTotal } = data;
  const status = getStatusTheme(profile.personastate, profile.gameextrainfo);
  const heroImg = data.games[0] ? getGameImages(data.games[0].appid, data.games[0].img_icon_url).banner : null;

  const memberYears = profile.timecreated
    ? new Date().getFullYear() - new Date(profile.timecreated * 1000).getFullYear()
    : 0;

  const detailGame = data.allGames.find((game) => game.appid === detailGameId);

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-3xl border ${theme.border} ${theme.bg} ${theme.txt1} shadow-2xl`}>
      <div className="group relative h-56 shrink-0 overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
        {heroImg && !imgErrors.hero_banner ? (
          <img
            src={heroImg}
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-[1px] transition-all duration-700 group-hover:scale-105 group-hover:opacity-35"
            alt=""
            onError={() => handleImgError("hero_banner")}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-transparent" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 pt-5">
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-white/70 backdrop-blur-xl">
            Steam Profile
          </span>

          <div className="flex gap-2">
            <Tooltip text="Refresh data">
              <button
                onClick={() => loadData(true)}
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 backdrop-blur-xl transition hover:bg-white/20"
              >
                <span className={refreshing ? "block animate-spin" : "block"}>
                  <Icons.Refresh />
                </span>
              </button>
            </Tooltip>

            <Tooltip text="Copy profile URL">
              <button
                onClick={copyProfileUrl}
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 backdrop-blur-xl transition hover:bg-white/20"
              >
                <Icons.Copy />
              </button>
            </Tooltip>

            <Tooltip text="Export statistics">
              <button
                onClick={exportStats}
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 backdrop-blur-xl transition hover:bg-white/20"
              >
                <Icons.Download />
              </button>
            </Tooltip>

            <Tooltip text="View on Steam">
              <button
                onClick={() => window.open(profile.profileurl, "_blank", "noopener,noreferrer")}
                className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 backdrop-blur-xl transition hover:bg-white/20"
              >
                <Icons.External />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end gap-5 px-6 pb-5 pt-16">
          <button
            onClick={() => window.open(profile.profileurl, "_blank", "noopener,noreferrer")}
            className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 ${status.border} bg-black shadow-2xl transition hover:scale-105`}
          >
            <img
              src={profile.avatarfull || profile.avatarmedium || profile.avatar}
              className="h-full w-full object-cover"
              alt={profile.personaname}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-0 transition hover:opacity-100" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <PulseDot color={status.color} />
            </div>
          </button>

          <div className="min-w-0 flex-1 pb-1 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <h1 className="truncate text-3xl font-black leading-none tracking-tight sm:text-4xl">
                {profile.personaname}
              </h1>
              <span className="rounded-full border border-blue-400/40 bg-blue-500/20 px-2.5 py-1 text-xs font-black text-blue-200">
                LVL {data.level || 0}
              </span>
            </div>

            {data.realName && (
              <p className="mt-1 text-sm font-medium italic text-white/45">
                {data.realName}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]"
                style={{
                  color: status.color,
                  backgroundColor: `${status.color}18`,
                  borderColor: `${status.color}50`,
                }}
              >
                <span className="h-[5px] w-[5px] rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                {status.label.split(":")[0]}
              </span>

              {profile.loccountrycode && (
                <span className="text-[10px] font-bold uppercase text-white/50">
                  {profile.loccountrycode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {data.friendProfiles?.length > 0 && (
        <div className="px-5 pt-4">
          <div className="flex flex-wrap -space-x-3">
            {data.friendProfiles.slice(0, 42).map((friend, index) => (
              <motion.a
                key={friend.steamid}
                href={friend.profileurl}
                target="_blank"
                rel="noopener noreferrer"
                title={friend.personaname}
                className="relative mb-2 rounded-full"
                style={{ zIndex: data.friendProfiles.length - index }}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0, transition: { delay: index * 0.015 } }}
                whileHover={{ y: -6, scale: 1.08, zIndex: 999 }}
              >
                <img
                  src={friend.avatarmedium}
                  alt={friend.personaname}
                  className={`h-9 w-9 rounded-full border-2 object-cover ${
                    friend.personastate > 0 ? "border-blue-500" : isDarkMode ? "border-zinc-700" : "border-white"
                  }`}
                />
              </motion.a>
            ))}
          </div>
        </div>
      )}

      <div className="custom-scrollbar z-10 flex-1 space-y-5 overflow-y-auto px-5 pb-6 pt-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: <Icons.Gamepad />, val: fmtNumber(total), label: "Games", color: theme.accent },
            { icon: <Icons.Clock />, val: fmtPlaytime(playtimeTotal), label: "Hours", color: theme.accentGreen },
            { icon: <Icons.Friends />, val: fmtNumber(friends), label: "Friends", color: "#06b6d4" },
            { icon: <Icons.Trophy />, val: memberYears, label: "Years", color: theme.accentOrange },
          ].map((stat, index) => (
            <div
              key={index}
              className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 hover:scale-[1.02] ${theme.border} ${theme.bgGlass}`}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${stat.color}22, transparent 65%)`,
                }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-2 transition-transform duration-300 group-hover:scale-110" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="text-lg font-black tracking-tight">{stat.val}</span>
                <span className={`mt-2 text-[8px] font-black uppercase tracking-[0.2em] ${theme.txt3}`}>
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* {data.failed && Object.values(data.failed).some(Boolean) && (
          <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-xs text-yellow-500">
            Sebagian data Steam gagal dimuat. Biasanya karena profile private, endpoint Steam nolak, atau rate limit. Card tetap jalan karena sekarang tidak manja seperti kode lama.
          </div>
        )} */}

        <div className={`grid grid-cols-4 gap-1 border-b pb-0 ${theme.border}`}>
  {[
    { key: TAB_KEYS.OVERVIEW, label: "Overview", short: "Overview", icon: <Icons.Gamepad /> },
    { key: TAB_KEYS.RECENTLY, label: "Recently Played", short: "Recent", icon: <Icons.History /> },
    { key: TAB_KEYS.ANALYTICS, label: "Analytics", short: "Analytics", icon: <Icons.Trend /> },
    { key: TAB_KEYS.ACHIEVEMENTS, label: "Achievements", short: "Achieve", icon: <Icons.Trophy /> },
  ].map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`min-w-0 flex flex-col items-center justify-center gap-1 border-b-2 px-1 py-3 text-[8px] font-black uppercase tracking-[0.14em] transition sm:flex-row sm:gap-2 sm:px-4 sm:text-[11px] ${
        activeTab === tab.key
          ? "border-blue-500 text-blue-500"
          : `border-transparent ${theme.txt3}`
      }`}
    >
      <span className="shrink-0">{tab.icon}</span>
      <span className="truncate">{tab.short}</span>
    </button>
  ))}
</div>

        {activeTab === TAB_KEYS.OVERVIEW && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {data.games.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-0.5">
                  <div className="flex items-center gap-2">
                    <Icons.Fire />
                    <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: theme.accent }}>
                      Most Played
                    </h2>
                  </div>

                  <span className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${theme.bgGlass} ${theme.border} ${theme.txt3}`}>
                    Top {Math.min(6, data.games.length)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.games.slice(0, 6).map((game, index) => (
                    <GameTile
                      key={game.appid}
                      game={game}
                      index={index}
                      totalPlaytime={data.playtimeTotal}
                      imgErrors={imgErrors}
                      handleImgError={handleImgError}
                      openModal={openModal}
                      theme={theme}
                    />
                  ))}
                </div>
              </section>
            )}

            {insights && (
              <section className={`space-y-5 rounded-2xl border p-5 backdrop-blur-sm ${theme.border} ${theme.bgGlass}`}>
                <div className="flex items-center gap-2">
                  <Icons.Trophy />
                  <h3 className="text-sm font-black uppercase tracking-widest">Profile Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Play Style", val: insights.behaviorType, color: theme.accent },
                    { label: "Activity", val: insights.intensity, color: theme.accentGreen },
                    { label: "Engagement", val: `${insights.engagementScore}%`, color: theme.accentOrange },
                    { label: "Diversity", val: `${insights.diversityScore}%`, color: theme.accentPurple },
                  ].map((item, index) => (
                    <div key={index} className={`rounded-xl border p-3 ${theme.border} ${theme.bgGlass}`}>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${theme.txt3}`}>
                        {item.label}
                      </span>
                      <p className="mt-2 text-base font-black" style={{ color: item.color }}>
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}

        {activeTab === TAB_KEYS.RECENTLY && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {data.recent.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="text-sm font-black uppercase tracking-widest">Last 2 Weeks</h3>
                  <span className={`text-[9px] font-black uppercase ${theme.txt3}`}>
                    {data.recent.length} games
                  </span>
                </div>

                <div className="space-y-2">
                  {data.recent.map((game) => {
                    const recentPlaytime = game.playtime_2weeks || 0;
                    const totalGamePlaytime = game.playtime_forever || 0;
                    const maxPlaytime = Math.max(...data.recent.map((item) => item.playtime_2weeks || 0), 1);

                    return (
                      <button
                        key={game.appid}
                        onClick={() => openModal(game.appid)}
                        className={`group w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-500/50 ${theme.border} ${theme.bgGlass} ${theme.bgHover}`}
                      >
                        <div className="flex gap-4">
                          <GameThumb
                            game={game}
                            mode="cover"
                            className="h-24 w-16 rounded-xl"
                            imgErrors={imgErrors}
                            handleImgError={handleImgError}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-bold transition group-hover:text-blue-400">
                                  {game.name}
                                </h4>
                                <p className={`text-xs ${theme.txt3}`}>
                                  Played {recentPlaytime}m recently
                                </p>
                              </div>

                              <span className="text-sm font-black" style={{ color: theme.accent }}>
                                {fmtPlaytime(recentPlaytime)}h
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="mb-1 flex items-center justify-between">
                                <span className={`text-[10px] ${theme.txt3}`}>Recent Activity</span>
                                <span className={`text-[9px] font-bold ${theme.txt3}`}>
                                  {totalGamePlaytime > 0
                                    ? ((recentPlaytime / totalGamePlaytime) * 100).toFixed(0)
                                    : 0}
                                  % of total
                                </span>
                              </div>

                              <ProgressBar value={(recentPlaytime / maxPlaytime) * 100} color={theme.accent} />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className={`rounded-2xl border py-12 text-center ${theme.border} ${theme.bgGlass} ${theme.txt3}`}>
                <div className="mx-auto mb-3 flex justify-center">
                  <Icons.History />
                </div>
                <p className="font-semibold">No recent activity</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === TAB_KEYS.ANALYTICS && insights && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className={`rounded-2xl border p-5 ${theme.border} ${theme.bgGlass}`}>
              <h3 className="mb-5 text-sm font-black uppercase tracking-widest">Metrics</h3>

              <div className="space-y-4">
                {[
                  { label: "Overall Engagement", val: insights.engagementScore, color: theme.accent },
                  { label: "Game Diversity", val: insights.diversityScore, color: theme.accentGreen },
                  { label: "Primary Focus", val: insights.topPercentage, color: theme.accentOrange },
                ].map((metric, index) => (
                  <div key={index}>
                    <div className="mb-2 flex justify-between">
                      <span className={`text-xs font-black uppercase tracking-wider ${theme.txt3}`}>
                        {metric.label}
                      </span>
                      <span className="text-sm font-black" style={{ color: metric.color }}>
                        {metric.val}%
                      </span>
                    </div>
                    <ProgressBar value={parseFloat(metric.val)} color={metric.color} />
                  </div>
                ))}
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-3 rounded-2xl border p-5 ${theme.border} ${theme.bgGlass}`}>
              <div>
                <p className={`mb-2 text-xs font-black uppercase tracking-wider ${theme.txt3}`}>Daily Avg</p>
                <p className="text-2xl font-black">{insights.avgDailyRecent}h</p>
                <p className={`text-xs ${theme.txt3}`}>Last 2 weeks</p>
              </div>

              <div>
                <p className={`mb-2 text-xs font-black uppercase tracking-wider ${theme.txt3}`}>All-Time Avg</p>
                <p className="text-2xl font-black">{insights.avgDailyAllTime}h</p>
                <p className={`text-xs ${theme.txt3}`}>Per day</p>
              </div>
            </div>

            <div className={`space-y-3 rounded-2xl border p-5 ${theme.border} ${theme.bgGlass}`}>
              <h3 className="text-sm font-black uppercase tracking-widest">Top 5 Games</h3>

              {data.games.slice(0, 5).map((game, index) => (
                <div key={game.appid} className={`pb-3 ${index < 4 ? `border-b ${theme.border}` : ""}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="w-6 text-center text-sm font-black">{index + 1}.</span>
                    <span className="flex-1 truncate text-sm font-bold">{game.name}</span>
                    <span className="text-sm font-black" style={{ color: theme.accent }}>
                      {fmtPlaytime(game.playtime_forever)}h
                    </span>
                  </div>

                  <ProgressBar
                    value={data.playtimeTotal > 0 ? (game.playtime_forever / data.playtimeTotal) * 100 : 0}
                    color={theme.accent}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === TAB_KEYS.ACHIEVEMENTS && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className={`rounded-2xl border p-5 ${theme.border} ${theme.bgGlass}`}>
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest">Achievement Progress</h3>

              {data.games.slice(0, 5).map((game, index) => {
                const ach = achCache[game.appid];

                return (
                  <div key={game.appid} className={`py-3 ${index < 4 ? `border-b ${theme.border}` : ""}`}>
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold">{game.name}</h4>
                        <p className={`text-xs ${theme.txt3}`}>
                          {fmtPlaytime(game.playtime_forever)}h played
                        </p>
                      </div>

                      {ach?.found && (
                        <span className="text-sm font-black" style={{ color: theme.accent }}>
                          {ach.pct}%
                        </span>
                      )}
                    </div>

                    {ach === undefined ? (
                      <div className="h-2 animate-pulse rounded-full bg-white/10" />
                    ) : ach.found ? (
                      <>
                        <ProgressBar value={ach.pct} color={theme.accent} />
                        <p className={`mt-1 text-xs ${theme.txt3}`}>
                          {ach.cur}/{ach.tot} unlocked
                        </p>
                      </>
                    ) : (
                      <p className={`text-xs ${theme.txt3}`}>
                        No achievement data available for this title
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="h-3" />
      </div>

      {createPortal(
        <AnimatePresence>
          {showModal && detailGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
              onClick={closeModal}
            >
              <div className={`absolute inset-0 backdrop-blur-md ${isDarkMode ? "bg-black/80" : "bg-white/55"}`} />

              <GameModal
                game={detailGame}
                closeModal={closeModal}
                theme={theme}
                isDarkMode={isDarkMode}
                ach={achCache[detailGame.appid]}
                imgErrors={imgErrors}
                handleImgError={handleImgError}
                playtimeTotal={data.playtimeTotal}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function GameTile({ game, index, totalPlaytime, imgErrors, handleImgError, openModal, theme }) {
  const images = getGameImages(game.appid, game.img_icon_url);
  const percent = totalPlaytime > 0 ? Math.min(100, (game.playtime_forever / totalPlaytime) * 200) : 0;

  return (
    <button
      type="button"
      onClick={() => openModal(game.appid)}
      className={`group relative h-44 overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-blue-500/50 ${theme.border} ${theme.bgGlass}`}
    >
      {!imgErrors[`banner_${game.appid}`] ? (
        <img
          src={images.banner}
          className="absolute inset-0 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105 group-hover:opacity-55"
          alt=""
          onError={() => handleImgError(`banner_${game.appid}`)}
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-800/80" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-4 text-white">
        <div>
          <div
            className={`mb-2 inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-black ${
              index === 0 ? "bg-yellow-400/30 text-yellow-200" : "bg-white/10 text-gray-300"
            }`}
          >
            #{index + 1}
          </div>

          <h3 className="line-clamp-2 text-sm font-bold transition group-hover:line-clamp-3">
            {game.name}
          </h3>
        </div>

        <div className="space-y-2">
          <div className="text-2xl font-black tabular-nums">{fmtPlaytime(game.playtime_forever)}h</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

function GameThumb({ game, mode = "banner", className = "", imgErrors, handleImgError }) {
  const images = getGameImages(game.appid, game.img_icon_url);
  const key = `${mode}_${game.appid}`;
  const src = mode === "cover" ? images.cover : images.capsule;

  if (imgErrors[key]) {
    return (
      <div className={`flex items-center justify-center bg-zinc-800/70 ${className}`}>
        <Icons.Gamepad />
      </div>
    );
  }

  return (
    <img
      src={src}
      className={`object-cover ${className}`}
      alt={game.name}
      onError={() => handleImgError(key)}
    />
  );
}

function GameModal({
  game,
  closeModal,
  theme,
  isDarkMode,
  ach,
  imgErrors,
  handleImgError,
  playtimeTotal,
}) {
  const images = getGameImages(game.appid, game.img_icon_url);

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 28 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.92, opacity: 0, y: 28 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border shadow-[0_0_60px_rgba(0,0,0,0.35)] ${theme.border} ${
        isDarkMode ? theme.bgCard : "bg-white"
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className={`relative h-48 w-full shrink-0 overflow-hidden sm:h-64 ${isDarkMode ? "bg-zinc-900" : "bg-gray-200"}`}>
        {!imgErrors[`modal_banner_${game.appid}`] ? (
          <img
            src={images.banner}
            className="h-full w-full scale-105 object-cover opacity-45 blur-[2px]"
            alt=""
            onError={() => handleImgError(`modal_banner_${game.appid}`)}
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-800/50" />
        )}

        <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? "from-zinc-800" : "from-white"} via-transparent to-transparent`} />

        <button
          onClick={closeModal}
          className={`absolute right-5 top-5 z-50 rounded-full border p-2.5 backdrop-blur-xl transition ${
            isDarkMode
              ? "border-white/10 bg-black/40 text-white/70 hover:bg-red-500/80"
              : "border-gray-200 bg-white/70 text-gray-900 hover:bg-red-500 hover:text-white"
          }`}
        >
          <Icons.Close />
        </button>
      </div>

      <div className="custom-scrollbar relative z-10 -mt-20 flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="flex flex-col gap-8 sm:flex-row">
          <div className="w-full shrink-0 space-y-4 sm:w-48">
            {!imgErrors[`modal_cover_${game.appid}`] ? (
              <motion.img
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
                src={images.cover}
                className={`aspect-[2/3] w-full rounded-2xl border-2 object-cover shadow-2xl ${
                  isDarkMode ? "border-white/10" : "border-gray-200"
                }`}
                alt={game.name}
                onError={() => handleImgError(`modal_cover_${game.appid}`)}
              />
            ) : (
              <div className={`flex aspect-[2/3] w-full items-center justify-center rounded-2xl border-2 ${
                isDarkMode ? "border-white/10 bg-zinc-800" : "border-gray-200 bg-gray-100"
              }`}>
                <Icons.Gamepad />
              </div>
            )}

            <button
              onClick={() => window.open(`https://store.steampowered.com/app/${game.appid}`, "_blank", "noopener,noreferrer")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
            >
              <span>STEAM STORE</span>
              <Icons.External />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <motion.h2
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 }}
                className={`mb-2 text-3xl font-black tracking-tighter sm:text-4xl ${theme.txt1}`}
              >
                {game.name}
              </motion.h2>

              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest ${
                isDarkMode ? "border-white/10 bg-white/5 text-white/50" : "border-gray-200 bg-gray-100 text-gray-500"
              }`}>
                APP ID: {game.appid}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-2xl border p-4 ${isDarkMode ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${theme.txt3}`}>Playtime</p>
                <p className={`text-xl font-black ${theme.txt1}`}>
                  {fmtPlaytime(game.playtime_forever)}
                  <span className={`ml-1 text-xs font-normal ${theme.txt3}`}>Hours</span>
                </p>
              </div>

              <div className={`rounded-2xl border p-4 ${isDarkMode ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-wider ${theme.txt3}`}>Global Share</p>
                <p className="text-xl font-black text-blue-500">
                  {playtimeTotal > 0 ? ((game.playtime_forever / playtimeTotal) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <div className={`space-y-4 border-t pt-4 ${isDarkMode ? "border-white/10" : "border-gray-100"}`}>
              <div className="flex items-center justify-between text-sm">
                <h3 className={`font-black uppercase tracking-widest ${theme.txt2}`}>Achievements</h3>
                {ach?.found && <span className="font-black text-blue-500">{ach.pct}%</span>}
              </div>

              {ach === undefined ? (
                <div className={`h-2 w-full animate-pulse rounded-full ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />
              ) : ach.found ? (
                <div className="space-y-3">
                  <ProgressBar value={ach.pct} color="#3b82f6" />
                  <p className={`text-xs font-medium ${theme.txt3}`}>
                    Unlocked {ach.cur} of {ach.tot} trophies
                  </p>
                </div>
              ) : (
                <div className={`rounded-xl p-4 text-center ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                  <p className={`text-xs italic ${theme.txt3}`}>
                    No achievement data available for this title
                  </p>
                </div>
              )}
            </div>

            <div className={`rounded-2xl border p-4 ${isDarkMode ? "border-white/10 bg-black/20" : "border-gray-100 bg-gray-50"}`}>
              <p className={`mb-2 text-[10px] font-black uppercase tracking-widest ${theme.txt3}`}>
                Playtime Weight
              </p>
              <ProgressBar
                value={playtimeTotal > 0 ? (game.playtime_forever / playtimeTotal) * 100 : 0}
                color={theme.accent}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}