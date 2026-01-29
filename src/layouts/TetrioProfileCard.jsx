  // TetrioProfileCard.jsx
  import React, { useEffect, useState, useContext, useMemo, useCallback, useRef } from "react";
  import { ThemeContext } from "../context/ThemeContext.jsx";
  import { 
    fetchTetrioProfile, 
    fetchTetrioAchievements, 
    fetchPersonalRecords,
    fetchHistoricalLeagueData,
    fetchAchievementInfo,
    getAchievementIconUrl,
    getAchievementTier 
  } from "./tetrioApi.jsx";
  // import TetrioAchievementsSection from "./TetrioAchievementsSection.jsx";

  export default function TetrioProfileCard({
    userId = "684fa6fe12175609312650e8",
    showNews = true,
    compact = false,
    showConnections = true,
    showRecords = true,
    showBadges = true,
  }) {
    const themeCtx = useContext(ThemeContext);
    const isDarkMode = themeCtx?.isDarkMode ?? true;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedNews, setExpandedNews] = useState(false);
    const [topAchievement, setTopAchievement] = useState(null);
    const [achievementBanners, setAchievementBanners] = useState([]);
    const [showAllAchievements, setShowAllAchievements] = useState(false);
    const [personalRecords, setPersonalRecords] = useState({});
    const [historicalData, setHistoricalData] = useState(null);
    const [showHistorical, setShowHistorical] = useState(false);
    const [achievementIcons, setAchievementIcons] = useState({});
    const [activeAchievementIndex, setActiveAchievementIndex] = useState(0);
    const [expandedAchievements, setExpandedAchievements] = useState(false);
    const [expandedRecords, setExpandedRecords] = useState(false);
    const [activeGameModeIndex, setActiveGameModeIndex] = useState(0); // New state for carousel
    
    // Ref untuk debounce achievement fetch
    const achievementTimeoutRef = useRef(null);

    useEffect(() => {
      let mounted = true;
      setLoading(true);
      setError(null);
      setTopAchievement(null);
      setAchievementBanners([]);
      setPersonalRecords({});
      setHistoricalData(null);
      setAchievementIcons({});

      // Fetch all data in parallel
      const fetchData = async () => {
        try {
          const [
            profileData,
            achievementsData,
            records40lData,
            recordsBlitzData,
            recordsZenithData,
            recordsZenithexData,
            recordsLeagueData,
            historicalLeagueData
          ] = await Promise.allSettled([
            fetchTetrioProfile(userId),
            fetchTetrioAchievements(userId),
            fetchPersonalRecords(userId, "40l"),
            fetchPersonalRecords(userId, "blitz"),
            fetchPersonalRecords(userId, "zenith"),
            fetchPersonalRecords(userId, "zenithex"),
            fetchPersonalRecords(userId, "league"),
            fetchHistoricalLeagueData(userId)
          ]);

          if (!mounted) return;

          // Process profile data
          if (profileData.status === 'fulfilled') {
            setProfile(profileData.value);
          }

          // Process achievements data
          if (achievementsData.status === 'fulfilled') {
            const achievements = achievementsData.value;
            
            // Get highest tier achievement
            if (achievements && achievements.length > 0) {
              let highest = null;
              let highestScore = -1;

              achievements.forEach((ach) => {
                if (ach.v && typeof ach.v === "number") {
                  if (ach.v > highestScore) {
                    highestScore = ach.v;
                    highest = ach;
                  }
                }
              });

              if (highest) {
                setTopAchievement(highest);
              }

              // Group achievements by category
              const banners = {};
              achievements.forEach((ach) => {
                if (ach.category) {
                  if (!banners[ach.category]) {
                    banners[ach.category] = [];
                  }
                  banners[ach.category].push(ach);
                }
              });

              setAchievementBanners(Object.entries(banners));
              
              // Fetch achievement icons
              const iconPromises = achievements.map(async (ach) => {
                try {
                  const iconUrl = getAchievementIconUrl(ach.k);
                  return [ach.k, iconUrl];
                } catch (e) {
                  return [ach.k, null];
                }
              });
              
              const iconResults = await Promise.allSettled(iconPromises);
              const icons = {};
              iconResults.forEach(result => {
                if (result.status === 'fulfilled') {
                  const [id, url] = result.value;
                  icons[id] = url;
                }
              });
              
              setAchievementIcons(icons);
            }
          }

          // Process personal records
          const records = {};
          if (records40lData.status === 'fulfilled') {
            records["40l"] = records40lData.value;
          }
          if (recordsBlitzData.status === 'fulfilled') {
            records["blitz"] = recordsBlitzData.value;
          }
          if (recordsZenithData.status === 'fulfilled') {
            records["zenith"] = recordsZenithData.value;
          }
          if (recordsZenithexData.status === 'fulfilled') {
            records["zenithex"] = recordsZenithexData.value;
          }
          if (recordsLeagueData.status === 'fulfilled') {
            records["league"] = recordsLeagueData.value;
          }
          setPersonalRecords(records);

          // Process historical league data
          if (historicalLeagueData.status === 'fulfilled') {
            setHistoricalData(historicalLeagueData.value);
          }
        } catch (error) {
          if (!mounted) return;
          setError(error.message || "Failed to fetch data");
        } finally {
          if (!mounted) return;
          setLoading(false);
        }
      };

      fetchData();

      return () => {
        mounted = false;
      };
    }, [userId]);

    // Memoize achievement data untuk mencegah render ulang yang tidak perlu
    const allAchievements = useMemo(() => {
      const achievements = [];
      Object.values(achievementBanners).forEach(categoryAchievements => {
        achievements.push(...categoryAchievements);
      });
      return achievements;
    }, [achievementBanners]);

    const activeAchievement = useMemo(() => allAchievements[activeAchievementIndex], [allAchievements, activeAchievementIndex]);

    const handlePrevAchievement = useCallback(() => {
      setActiveAchievementIndex(prev => (prev === 0 ? allAchievements.length - 1 : prev - 1));
    }, [allAchievements.length]);

    const handleNextAchievement = useCallback(() => {
      setActiveAchievementIndex(prev => (prev === allAchievements.length - 1 ? 0 : prev + 1));
    }, [allAchievements.length]);

    // Game modes data for carousel
    const gameModes = useMemo(() => {
      if (!profile) return [];
      
      return [
        {
          id: "league",
          name: "TETRA LEAGUE",
          icon: "TL",
          color: getGameModeIconColor("league"),
          rank: profile.league?.rank ? profile.league.rank.toUpperCase() : "—",
          stat: profile.league?.tr ? formatNumber(profile.league.tr) : "—",
          statLabel: "TR"
        },
        {
          id: "zenith",
          name: "QUICK PLAY",
          icon: "QP",
          color: getGameModeIconColor("zenith"),
          rank: profile.quickplay?.rank ? `#${profile.quickplay.rank}` : "—",
          stat: profile.quickplay?.record?.alt ? `${profile.quickplay.record.alt}m` : "—",
          statLabel: "Altitude"
        },
        {
          id: "40l",
          name: "40 LINES",
          icon: "40L",
          color: getGameModeIconColor("40l"),
          rank: profile.lines40?.rank ? `#${profile.lines40.rank}` : "—",
          stat: profile.lines40?.record?.endcontext?.finalTime ? formatTime(profile.lines40.record.endcontext.finalTime) : "—",
          statLabel: "Time"
        },
        {
          id: "blitz",
          name: "BLITZ",
          icon: "BL",
          color: getGameModeIconColor("blitz"),
          rank: profile.blitz?.rank ? `#${profile.blitz.rank}` : "—",
          stat: profile.blitz?.record?.endcontext?.score ? Number(profile.blitz.record.endcontext.score).toLocaleString() : "—",
          statLabel: "Score"
        },
        {
          id: "zen",
          name: "ZEN",
          icon: "ZEN",
          color: getGameModeIconColor("zen"),
          rank: profile.zen?.level ? `Level ${profile.zen.level}` : "—",
          stat: profile.zen?.score ? Number(profile.zen.score).toLocaleString() : "—",
          statLabel: "Score"
        }
      ];
    }, [profile]);

    const activeGameMode = useMemo(() => gameModes[activeGameModeIndex], [gameModes, activeGameModeIndex]);

    const handlePrevGameMode = useCallback(() => {
      setActiveGameModeIndex(prev => (prev === 0 ? gameModes.length - 1 : prev - 1));
    }, [gameModes.length]);

    const handleNextGameMode = useCallback(() => {
      setActiveGameModeIndex(prev => (prev === gameModes.length - 1 ? 0 : prev + 1));
    }, [gameModes.length]);

    // Stats data for individual cards
    const statsData = useMemo(() => {
      if (!profile) return [];
      
      return [
        {
          id: "games",
          name: "Games Played",
          value: profile.gamesplayed ?? "—",
          icon: "🎮",
          color: "bg-blue-600"
        },
        {
          id: "winrate",
          name: "Win Rate",
          value: profile.winrate ? `${profile.winrate}%` : "—",
          icon: "🏆",
          color: "bg-green-600"
        },
        {
          id: "apm",
          name: "APM",
          value: formatNumber(profile.league?.apm),
          icon: "⚡",
          color: "bg-purple-600"
        },
        {
          id: "pps",
          name: "PPS",
          value: formatNumber(profile.league?.pps),
          icon: "🧩",
          color: "bg-orange-600"
        }
      ];
    }, [profile]);

    if (loading) {
      return (
        <div className={`w-full max-w-2xl p-6 rounded-xl shadow-xl animate-pulse flex gap-4 border ${isDarkMode ? "bg-zinc-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className={`w-24 h-24 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
          <div className="flex-1 space-y-3">
            <div className={`h-6 rounded w-1/3 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
            <div className={`h-20 rounded w-full mt-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
          </div>
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
      <div className={`font-sans antialiased w-full mx-auto transition-colors duration-300 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
        
        <div className={`relative overflow-hidden cursor-target rounded-xl border shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all group-card ${
            isDarkMode ? "bg-gradient-to-br from-zinc-900 to-zinc-700 border-gray-600 border-b-0" : "bg-gradient-to-br from-white to-gray-100 border-gray-800 shadow-lg border-b-0"
          }`}>
          
          {/* Abstract Glow (Optimized: will-change) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff1a] opacity-15 rounded-full blur-[80px] pointer-events-none will-change-transform"></div>

          <div className="relative p-5 flex flex-col gap-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className={`absolute -inset-0.5 rounded-lg blur opacity-30 transition duration-200 ${profile.league ? "bg-gradient-to-r from-green-400 to-blue-500" : "bg-blue-600"}`}></div>
                <div className="relative w-24 h-24">
                  <img 
                    src={profile.avatar || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMDAnIGhlaWdodD0nMzAwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDgsMTAsNiwxKTsnPjxnIHN0eWxlPSdmaWxsOnJnYmEoMTQ4LDIwMiw0MywxKTsgc3Ryb2tlOnJnYmEoMTQ4LDIwMiw0MywxKTsgc3Ryb2tlLXdpZHRoOjEuNTsnPjxyZWN0ICB4PScxMjknIHk9JzE3MScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzEyOScgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nODcnIHk9JzQ1JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nMTcxJyB5PSc0NScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9Jzg3JyB5PSc4Nycgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzE3MScgeT0nODcnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PSc4NycgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nMTcxJyB5PScyMTMnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PSc0NScgeT0nNDUnIHdpZHRoPSc0MicgaGVpZ2h0PSc0MicvPjxyZWN0ICB4PScyMTMnIHk9JzQ1JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nNDUnIHk9JzEyOScgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzIxMycgeT0nMTI5JyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48cmVjdCAgeD0nNDUnIHk9JzIxMycgd2lkdGg9JzQyJyBoZWlnaHQ9JzQyJy8+PHJlY3QgIHg9JzIxMycgeT0nMjEzJyB3aWR0aD0nNDInIGhlaWdodD0nNDInLz48L2c+PC9zdmc+"} 
                    alt="Tetr.io Avatar" 
                    loading="lazy" 
                    decoding="async" 
                    className="relative z-10 w-full h-full rounded-lg object-cover border-2 border-[#2a475e] shadow-lg"
                  />
                  {/* Badge supporter */}
                  {profile.supporter && (
                    <div className="absolute z-30 -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg"
                      title="Supporter">
                      ★
                    </div>
                  )}
                  {/* Status indicator */}
                  <div className={`absolute z-30 bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1b2838] ${profile.league ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "bg-gray-500"}`}/>
                </div>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <a
                  href={`https://ch.tetr.io/u/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-2xl font-bold transition-colors truncate block ${isDarkMode ? "text-white hover:text-[#66c0f4]" : "text-gray-900 hover:text-blue-600"}`}
                >
                  {profile.username}
                </a>
                <div className="flex flex-col">
                  <div className={`text-xs mt-1 transition-colors ${profile.league ? "text-emerald-500 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "text-gray-500"}`}>
                    {profile.league && <span className="mr-1">🎮</span>}
                    {profile.league ? `TETRA LEAGUE: ${profile.league.rank.toUpperCase()}` : "Not Ranked"}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-[#8f98a0] mt-2">
                  {profile.country && (
                    <span className={`flex items-center gap-1 px-2 py-1 rounded ${isDarkMode ? "bg-[#2a475e]/20" : "bg-gray-200 text-gray-700"}`}>
                      {countryFlag(profile.country)}
                      {profile.country}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded ${isDarkMode ? "bg-[#2a475e]/20" : "bg-gray-200 text-gray-700"}`}>
                    {profile.join_relative || "Unknown join date"}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded cursor-default ${isDarkMode ? "bg-[#2a475e]/20 hover:text-white" : "bg-gray-200 text-gray-700"}`}>
                    {profile.friend_count ?? 0} Friends
                  </span>
                </div>
              </div>

              <div className={`hidden sm:flex flex-col items-center px-4 py-2 rounded-lg border ${isDarkMode ? "bg-[#000000]/30 border-[#2a475e]" : "bg-white border-gray-300 shadow-sm"}`}>
                <span className={`text-xl font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>{profile.league?.tr ?? "—"}</span>
                <span className={`text-[9px] uppercase tracking-wider mt-1 ${isDarkMode ? "text-[#66c0f4]" : "text-blue-600"}`}>TR</span>
              </div>
            </div>

            {!compact && (
              <>
              

              {/* GAME MODES CAROUSEL */}
  <div className="relative group">
    <button 
      onClick={handlePrevGameMode} 
      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 p-2 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/20"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button 
      onClick={handleNextGameMode} 
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 p-2 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/20"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <div className={`relative overflow-hidden rounded-2xl transition-all min-h-[140px] backdrop-blur-xl shadow-2xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-black/10 border-white/20"}`}>
      
      {/* Dynamic gradient background that follows the profile rank color */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 blur-3xl scale-150 transition-transform duration-700 will-change-transform opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rankColor.replace('bg-', '#').replace('600', '') || '#66c0f4'}, transparent 70%)`
          }}
        ></div>
        
        {/* Secondary gradient for depth */}
        <div 
          className="absolute inset-0 blur-2xl scale-125 transition-transform duration-700 will-change-transform opacity-20"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${activeGameMode?.color || '#66c0f4'}, transparent 60%)`
          }}
        ></div>
      </div>

      {/* Glass effect overlay with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
      
      {/* Animated particles for extra visual effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 blur-sm animate-pulse"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative p-4 flex flex-col gap-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold backdrop-blur-md shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-6`} 
                style={{ 
                  background: `linear-gradient(135deg, ${rankColor.replace('bg-', '#').replace('600', '') || '#66c0f4'}, ${activeGameMode?.color || '#4a90e2'})`,
                  boxShadow: `0 4px 20px ${rankColor.replace('bg-', '#').replace('600', '') || '#66c0f4'}40`
                }}>
              {activeGameMode?.icon}
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors duration-300`} 
                  style={{ color: rankColor.replace('bg-', '#').replace('600', '') || (isDarkMode ? "#66c0f4" : "#2563eb") }}>
                Game Mode
              </div>
              <div className={`font-bold text-lg leading-tight line-clamp-1 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {activeGameMode?.name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                style={{ textShadow: isDarkMode ? `0 0 10px ${rankColor.replace('bg-', '#').replace('600', '') || '#66c0f4'}40` : 'none' }}>
              {activeGameMode?.stat}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">{activeGameMode?.statLabel}</div>
          </div>
        </div>

        <div className="h-8 flex flex-col justify-center">
          <div className={`w-full rounded-lg p-2 backdrop-blur-md border transition-all duration-300 ${isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white/20 border-white/30 hover:bg-white/30"}`}>
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span className="font-semibold transition-colors duration-300" style={{ color: rankColor.replace('bg-', '#').replace('600', '') || (isDarkMode ? "#66c0f4" : "#2563eb") }}>Rank</span>
              <span className="transition-colors duration-300" style={{ color: rankColor.replace('bg-', '#').replace('600', '') || (isDarkMode ? "#66c0f4" : "#2563eb") }}>{activeGameMode?.rank}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-center gap-1.5 mt-2">
      {gameModes.map((mode, idx) => (
        <button
          key={idx}
          onClick={() => setActiveGameModeIndex(idx)}
          className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeGameModeIndex ? "w-4" : "w-1.5"}`}
          style={{
            backgroundColor: idx === activeGameModeIndex 
              ? (rankColor.replace('bg-', '#').replace('600', '') || (isDarkMode ? "#66c0f4" : "#2563eb"))
              : (isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2) text-gray-400"),
            boxShadow: idx === activeGameModeIndex 
              ? `0 0 10px ${rankColor.replace('bg-', '#').replace('600', '') || (isDarkMode ? "#66c0f4" : "#2563eb")}60`
              : "none"
          }}
        />
      ))}
    </div>
  </div>
  {/* STATS SECTION - NOW AS INDIVIDUAL CARDS */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-1 bg-[#66c0f4] rounded-full"></div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Player Statistics</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {statsData.map((stat) => (
                      <div key={stat.id} className={`flex items-center gap-3 p-2.5 rounded border transition-all group ${isDarkMode ? "bg-[#000000]/20 border-transparent hover:border-[#66c0f4]/20 hover:bg-[#2a475e]/20" : "bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50 shadow-sm"}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div className="overflow-hidden">
                          <div className={`text-sm font-medium truncate transition-colors ${isDarkMode ? "text-gray-200 group-hover:text-[#66c0f4]" : "text-gray-800 group-hover:text-blue-600"}`}>
                            {stat.name}
                          </div>
                          <div className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ACHIEVEMENT BANNERS EXPANSION */}
                {/* {achievementBanners.length > 0 && (
                  <div className={`pt-3 mt-2 border-t ${isDarkMode ? "border-gray-800/50" : "border-gray-200"}`}>
                    <button onClick={() => setExpandedAchievements(!expandedAchievements)} className={`w-full group flex justify-between items-center text-xs transition-colors py-1 focus:outline-none ${isDarkMode ? "text-gray-500 hover:text-[#66c0f4]" : "text-gray-500 hover:text-blue-600"}`}>
                      <span className="uppercase tracking-wider font-semibold">Achievement Banners ({allAchievements.length})</span>
                      <span className="transform group-hover:translate-y-0.5 transition-transform">{expandedAchievements ? "▲" : "▼"}</span>
                    </button>

                    {expandedAchievements && (
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {achievementBanners.map(([category, achievements]) => (
                          <div key={category} className={`p-2 rounded ${isDarkMode ? "bg-[#000000]/20" : "bg-gray-100"}`}>
                            <div className={`text-xs font-bold mb-2 ${isDarkMode ? "text-[#66c0f4]" : "text-blue-600"}`}>{category}</div>
                            <div className="flex flex-wrap gap-1">
                              {achievements.slice(0, 4).map((ach, i) => (
                                <span 
                                  key={i} 
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-bold ${getMedalBgColor(ach.rank)}`}
                                  title={ach.name}
                                >
                                  {achievementIcons[ach.k] && (
                                    <img
                                      src={achievementIcons[ach.k]}
                                      alt={ach.name}
                                      className="w-3 h-3"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {ach.name}
                                </span>
                              ))}
                              {achievements.length > 4 && (
                                <span className="text-xs text-gray-300">+{achievements.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )} */}

                {/* HISTORICAL LEAGUE DATA EXPANSION */}
                {historicalData && Object.keys(historicalData).length > 0 && (
                  <div className={`pt-3 mt-2 border-t ${isDarkMode ? "border-gray-800/50" : "border-gray-200"}`}>
                    <button onClick={() => setShowHistorical(!showHistorical)} className={`w-full group flex justify-between items-center text-xs transition-colors py-1 focus:outline-none ${isDarkMode ? "text-gray-500 hover:text-[#66c0f4]" : "text-gray-500 hover:text-blue-600"}`}>
                      <span className="uppercase tracking-wider font-semibold">Historical League Data</span>
                      <span className="transform group-hover:translate-y-0.5 transition-transform">{showHistorical ? "▲" : "▼"}</span>
                    </button>

                    {showHistorical && (
                      <div className="mt-3 space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {Object.entries(historicalData).slice(0, 10).map(([season, data]) => (
                          <div key={season} className={`flex justify-between items-center text-[11px] p-1.5 rounded transition-colors ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                            <div className="flex items-center gap-2 overflow-hidden w-2/3">
                              <span className="text-gray-500 text-[9px] w-4">{season}.</span>
                              <span className={`truncate ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>Rank {data.rank}</span>
                            </div>
                            <div className="flex gap-2 text-gray-500">
                              <span>TR {data.tr}</span>
                              <span>GXE {(data.gxe * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LATEST NEWS */}
                {showNews && profile.latest && profile.latest.length > 0 && (
                  <div className={`pt-3 mt-2 border-t ${isDarkMode ? "border-gray-800/50" : "border-gray-200"}`}>
                    <button onClick={() => setExpandedNews(!expandedNews)} className={`w-full group flex justify-between items-center text-xs transition-colors py-1 focus:outline-none ${isDarkMode ? "text-gray-500 hover:text-[#66c0f4]" : "text-gray-500 hover:text-blue-600"}`}>
                      <span className="uppercase tracking-wider font-semibold">Latest News</span>
                      <span className="transform group-hover:translate-y-0.5 transition-transform">{expandedNews ? "▲" : "▼"}</span>
                    </button>

                    {expandedNews && (
                      <div className="mt-3 space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {profile.latest.map((n, i) => (
                          <div key={i} className={`text-[11px] p-1.5 rounded transition-colors ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                            <div className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-[#66c0f4] rounded-full mt-1 flex-shrink-0"></div>
                              <div className={`truncate ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>{n.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Info icon (hover popup) */}
          <div className="absolute bottom-2 right-2 group cursor-pointer">
            <div
              className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold
                ${isDarkMode ? "bg-zinc-700 text-white" : "bg-gray-300 text-black"}
                transition-all duration-200 hover:scale-110`}
              title="Info"
            >
              i
            </div>

            {/* Tooltip popup */}
            <div
              className={`absolute bottom-7 right-0 w-72 text-xs rounded-md p-3 shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-300 z-50
                ${isDarkMode ? "bg-zinc-600 text-gray-200" : "bg-white text-gray-800"}`}
            >
              <p className="font-mono mb-2"><span className="text-red-400 font-bold">APM</span> - Attacks Per Minute</p>
              <p className="font-mono mb-2"><span className="text-blue-400 font-bold">PPS</span> - Pieces Per Second</p>
              <p className="font-mono mb-2"><span className="text-green-400 font-bold">VS</span> - Versus Score</p>
              <p className="font-mono mb-2"><span className="text-yellow-400 font-bold">TR</span> - Tetra Rating</p>
              <p className="font-mono mb-2"><span className="text-purple-400 font-bold">GXE</span> - Glixare (% vs avg)</p>
              <p className="font-mono mb-2"><span className="text-orange-400 font-bold">AR</span> - Achievement Rating</p>
              <p className="font-mono"><span className="text-indigo-400 font-bold">40L</span> - 40 Lines Sprint</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper functions
  function getRoleColor(role) {
    if (!role) return "bg-gray-500";
    const r = role.toLowerCase();
    if (r === "admin" || r === "sysop") return "bg-red-600";
    if (r === "mod" || r === "halfmod") return "bg-blue-600";
    if (r === "bot") return "bg-purple-600";
    if (r === "banned") return "bg-black";
    return "bg-gray-500";
  }

  function getTierName(tier) {
    switch (tier) {
      case "1": return "Bronze";
      case "2": return "Silver";
      case "3": return "Gold";
      case "4": return "Platinum";
      case "5": return "Diamond";
      case "100": return "Issued";
      default: return "Unknown";
    }
  }

  function getRankName(rank) {
    switch (rank) {
      case 0: return "NONE";
      case 1: return "BRONZE";
      case 2: return "SILVER";
      case 3: return "GOLD";
      case 4: return "PLATINUM";
      case 5: return "DIAMOND";
      case 100: return "ISSUED";
      default: return "UNKNOWN";
    }
  }

  function getRankColor(rank) {
    if (!rank) return "bg-gray-500";
    const r = rank.toLowerCase();
    if (r === "x") return "bg-red-600 shadow-lg shadow-red-500/50";
    if (r === "x+") return "bg-red-700 shadow-lg shadow-red-600/50";
    if (r === "ss") return "bg-yellow-500";
    if (r === "s+") return "bg-yellow-600";
    if (r === "s") return "bg-yellow-700";
    if (r === "s-") return "bg-orange-500";
    if (r.startsWith("a") || r === "a+") return "bg-green-600";
    if (r.startsWith("b") || r.startsWith("b+")) return "bg-blue-600";
    if (r.startsWith("c") || r.startsWith("c+")) return "bg-indigo-600";
    if (r.startsWith("d") || r.startsWith("d+")) return "bg-gray-600";
    return "bg-gray-500";
  }

  function getGameModeIconColor(mode) {
    switch (mode) {
      case "league": return "bg-red-600";
      case "zenith": return "bg-green-600";
      case "40l": return "bg-blue-600";
      case "blitz": return "bg-purple-600";
      case "zen": return "bg-pink-600";
      default: return "bg-gray-600";
    }
  }

  function countryFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return "";
    return String.fromCodePoint(
      ...countryCode.toUpperCase().split("").map((c) => 127397 + c.charCodeAt(0))
    );
  }

  function formatNumber(num) {
    if (num == null) return "—";
    if (typeof num === "number") {
      return num.toFixed(2);
    }
    return "—";
  }

  function formatTime(milliseconds) {
    if (!milliseconds) return "—";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  function getMedalBgColor(rank) {
    if (!rank) return "bg-gray-600";
    switch (rank) {
      case 5: return "bg-cyan-600"; // Diamond
      case 4: return "bg-slate-600"; // Platinum
      case 3: return "bg-yellow-600"; // Gold
      case 2: return "bg-gray-600"; // Silver
      case 1: return "bg-orange-600"; // Bronze
      case 100: return "bg-purple-600"; // Issued
      default: return "bg-gray-600";
    }
  }

  function getCategoryColor(category) {
    if (!category) return "bg-gray-700";
    const c = category.toLowerCase();
    if (c === "general") return "bg-indigo-700";
    if (c === "tetra league") return "bg-red-700";
    if (c === "sprint") return "bg-blue-700";
    if (c === "blitz") return "bg-purple-700";
    if (c === "zen") return "bg-pink-700";
    if (c === "custom") return "bg-green-700";
    return "bg-gray-700";
  }