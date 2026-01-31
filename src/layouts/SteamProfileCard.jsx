import React, { useEffect, useState, useContext, useMemo, useCallback, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

// --- HELPER FUNCTIONS (Di luar component agar tidak direkreasikan) ---
const formatPlaytime = (minutes) => {
  if (!minutes) return "0h";
  const hours = (minutes / 60).toFixed(1);
  return `${hours}h`;
};

const MANUAL_FRAMES = {
  "76561199745356826": "https://shared.fastly.steamstatic.com/community_assets/images/items/4101120/688f97fa743ac41b68ab10d5236a02f01ecb9725.png",
};

const getStatusColorClass = (profile) => {
  if (profile.gameextrainfo) {
    return "text-emerald-500 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]";
  }
  switch (profile.personastate) {
    case 0: return "text-gray-500";
    case 1: return "text-blue-400 font-semibold";
    case 2: return "text-red-500";
    case 3: return "text-amber-500";
    case 4: return "text-blue-300";
    default: return "text-blue-400";
  }
};

const getStatusText = (profile) => {
  if (profile.gameextrainfo) return `Playing ${profile.gameextrainfo}`;
  const states = ["Offline", "Online", "Busy", "Away", "Snooze", "Looking to Trade", "Looking to Play"];
  return states[profile.personastate] || "Offline";
};

const getStatusColor = (status) => {
  if (status === 1) return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]";
  if (status > 1) return "bg-blue-400";
  return "bg-gray-500";
};

// --- COMPONENT UTAMA ---
const SteamProfileCard = ({
  steamIds = ["76561199745356826", "76561199166544214", "76561198773672138"],
  compact = false,
}) => {
  const { isDarkMode } = useContext(ThemeContext);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [topGames, setTopGames] = useState([]);
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const [achievementsCache, setAchievementsCache] = useState({});
  const [loadingAch, setLoadingAch] = useState(false);
  const [expandedGames, setExpandedGames] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  
  // Ref untuk debounce achievement fetch
  const achievementTimeoutRef = useRef(null);

  const API_KEY = "F10E38DFF1FBB84407DF02D50B49A8CF";
  const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";
  const CACHE_KEY = 'steamProfileData';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 jam

  const fetchWithProxy = useCallback((url) =>
    fetch(`${PROXY_URL}${encodeURIComponent(url)}`).then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }), []);

  // --- 1. FETCH DATA UTAMA (Memoized) ---
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        if (data && data.profile && data.stats && Date.now() - timestamp < CACHE_DURATION) {
          if (mounted) {
            setProfile(data.profile);
            setStats(data.stats);
            setRecentlyPlayed(data.recentlyPlayed);
            setFriendsCount(data.friendsCount);
            setTopGames(data.stats.games.slice(0, 5));
            setLoading(false);
          }
          return;
        }
      } catch (error) {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    async function fetchData() {
      try {
        const mainSteamId = steamIds[0];
        // Parallel fetching
        const [profileRes, friendRes, ...allGamesRes] = await Promise.all([
          fetchWithProxy(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${mainSteamId}`),
          fetchWithProxy(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${API_KEY}&steamid=${mainSteamId}&relationship=friend`),
          ...steamIds.map((id) => fetchWithProxy(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${id}&include_appinfo=true&include_played_free_games=true`)),
          ...steamIds.map((id) => fetchWithProxy(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${API_KEY}&steamid=${id}`))
        ]);

        if (!mounted) return;

        const profileData = profileRes.response?.players?.[0];
        if (profileData && MANUAL_FRAMES[profileData.steamid]) {
          profileData.avatarFrame = MANUAL_FRAMES[profileData.steamid];
        }

        const ownedGamesResponses = allGamesRes.slice(0, steamIds.length);
        const recentGamesResponses = allGamesRes.slice(steamIds.length);

        // Optimasi merging loop
        const mergedGamesMap = new Map();
        ownedGamesResponses.forEach((res) => {
          (res.response?.games || []).forEach((game) => {
            const existing = mergedGamesMap.get(game.appid);
            if (existing) {
              existing.playtime_forever += game.playtime_forever;
            } else {
              mergedGamesMap.set(game.appid, { ...game });
            }
          });
        });

        const mergedRecentMap = new Map();
        recentGamesResponses.forEach((res) => {
          (res.response?.games || []).forEach((game) => {
             const existing = mergedRecentMap.get(game.appid);
             if (existing) {
               existing.playtime_2weeks += game.playtime_2weeks;
             } else {
               mergedRecentMap.set(game.appid, { ...game });
             }
          });
        });

        const finalGamesList = Array.from(mergedGamesMap.values()).sort((a, b) => b.playtime_forever - a.playtime_forever);
        const finalRecentList = Array.from(mergedRecentMap.values()).sort((a, b) => b.playtime_2weeks - a.playtime_2weeks);

        const statsData = {
          games: finalGamesList,
          total_count: finalGamesList.length,
        };

        setProfile(profileData);
        setFriendsCount(friendRes.friendslist?.friends?.length || 0);
        setStats(statsData);
        setTopGames(finalGamesList.slice(0, 5));
        setRecentlyPlayed(finalRecentList);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: {
            profile: profileData,
            stats: statsData,
            recentlyPlayed: finalRecentList,
            friendsCount: friendRes.friendslist?.friends?.length || 0,
          },
          timestamp: Date.now()
        }));

      } catch (err) {
        if (mounted) setError("Gagal mengambil data Steam 😔");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [steamIds, fetchWithProxy]); 

  // --- 2. FETCH ACHIEVEMENT (Debounced & Optimized) ---
  useEffect(() => {
    if (topGames.length === 0) return;
    const currentGame = topGames[activeGameIndex];
    
    // Jika data sudah ada di cache, tidak perlu fetch
    if (achievementsCache[currentGame.appid] !== undefined) return;

    // Bersihkan timeout sebelumnya jika user geser cepat
    if (achievementTimeoutRef.current) clearTimeout(achievementTimeoutRef.current);

    setLoadingAch(true);

    // Delay 500ms (Debounce)
    achievementTimeoutRef.current = setTimeout(async () => {
      let foundData = null;
      
      // Loop berurutan (sequential) lebih ringan daripada Promise.all untuk API yang strict limit
      for (const steamId of steamIds) {
        try {
          const res = await fetchWithProxy(
            `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${currentGame.appid}&key=${API_KEY}&steamid=${steamId}`
          );
          if (res.playerstats?.achievements?.length > 0) {
            const all = res.playerstats.achievements;
            const unlocked = all.filter((a) => a.achieved === 1).length;
            foundData = {
              current: unlocked,
              total: all.length,
              percentage: Math.round((unlocked / all.length) * 100),
              found: true,
            };
            if (res.playerstats.success) break;
          }
        } catch (err) { /* ignore */ }
      }

      setAchievementsCache((prev) => ({
        ...prev,
        [currentGame.appid]: foundData || { found: false },
      }));
      setLoadingAch(false);
    }, 500);

    return () => {
      if (achievementTimeoutRef.current) clearTimeout(achievementTimeoutRef.current);
    };
  }, [activeGameIndex, topGames, steamIds, achievementsCache, fetchWithProxy]);

  // Memoize active data untuk mencegah render ulang yang tidak perlu
  const activeGame = useMemo(() => topGames[activeGameIndex], [topGames, activeGameIndex]);
  const activeAch = useMemo(() => activeGame ? achievementsCache[activeGame.appid] : null, [activeGame, achievementsCache]);

  const handlePrev = useCallback(() => setActiveGameIndex((prev) => (prev === 0 ? topGames.length - 1 : prev - 1)), [topGames.length]);
  const handleNext = useCallback(() => setActiveGameIndex((prev) => (prev === topGames.length - 1 ? 0 : prev + 1)), [topGames.length]);

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

  if (error) return <div className="p-4 bg-red-900/20 text-red-200 border border-red-500 rounded">{error}</div>;
  if (!profile) return null;

  return (
    <div className={`font-sans antialiased w-full mx-auto transition-colors duration-300 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
      
      <div className={`relative overflow-hidden cursor-target rounded-xl border shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all group-card ${
          isDarkMode ? "bg-gradient-to-br from-zinc-900 to-zinc-700 border-gray-600 border-b-0" : "bg-gradient-to-br from-white to-gray-100 border-gray-800 shadow-lg border-b-0"
        }`}>
        
        {/* Abstract Glow (Optimized: will-change) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#66eff4] opacity-5 rounded-full blur-[80px] pointer-events-none will-change-transform"></div>

        <div className="relative p-5 flex flex-col gap-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
              <div className={`absolute -inset-0.5 rounded-lg blur opacity-30 transition duration-200 ${profile.personastate === 1 ? "bg-green-400" : "bg-blue-600"}`}></div>
              <div className="relative w-24 h-24">
                  <img src={profile.avatarfull} alt={profile.personaname} loading="lazy" decoding="async" className="relative z-10 w-full h-full rounded-lg object-cover border-2 border-[#2a475e] shadow-lg"/>
                  {profile.avatarFrame && (
                      <img src={profile.avatarFrame} alt="frame" loading="lazy" decoding="async" className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] max-w-none pointer-events-none"/>
                  )}
                  <div className={`absolute z-30 bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1b2838] ${getStatusColor(profile.personastate)}`}/>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <a href={profile.profileurl} target="_blank" rel="noreferrer" className={`text-2xl font-bold transition-colors truncate block ${isDarkMode ? "text-white hover:text-[#66c0f4]" : "text-gray-900 hover:text-blue-600"}`}>
                {profile.personaname}
              </a>
              <div className="flex flex-col">
                <div className={`text-xs mt-1 transition-colors ${getStatusColorClass(profile)}`}>
                   {profile.gameextrainfo && <span className="mr-1">🎮</span>}
                   {getStatusText(profile)}
                </div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-[#8f98a0] mt-2">
                {profile.loccountrycode && (
                  <span className={`flex items-center gap-1 px-2 py-1 rounded ${isDarkMode ? "bg-[#2a475e]/20" : "bg-gray-200 text-gray-700"}`}>
                    <img src={`https://flagcdn.com/20x15/${profile.loccountrycode.toLowerCase()}.png`} alt="flag" loading="lazy" className="w-4 opacity-80"/>
                    {profile.loccountrycode}
                  </span>
                )}
                <span className={`px-2 py-1 rounded ${isDarkMode ? "bg-[#2a475e]/20" : "bg-gray-200 text-gray-700"}`}>
                    Joined {new Date(profile.timecreated * 1000).getFullYear()}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded cursor-default ${isDarkMode ? "bg-[#2a475e]/20 hover:text-white" : "bg-gray-200 text-gray-700"}`}>
                  {friendsCount} Friends
                </span>
              </div>
            </div>

            <div className={`hidden sm:flex flex-col items-center px-4 py-2 rounded-lg border ${isDarkMode ? "bg-[#000000]/30 border-[#2a475e]" : "bg-white border-gray-300 shadow-sm"}`}>
              <span className={`text-xl font-bold leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>{stats?.total_count || 0}</span>
              <span className={`text-[9px] uppercase tracking-wider mt-1 ${isDarkMode ? "text-[#66c0f4]" : "text-blue-600"}`}>Games</span>
            </div>
          </div>

          {!compact && activeGame && (
            <>
              {/* --- TOP 5 CAROUSEL --- */}
              <div className="relative group">
                <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 p-2 bg-black/50 hover:bg-[#66c0f4] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg">❮</button>
                <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 p-2 bg-black/50 hover:bg-[#66c0f4] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg">❯</button>

                <div className={`relative overflow-hidden rounded-lg border transition-all min-h-[140px] ${isDarkMode ? "bg-[#101216] border-gray-800" : "bg-white border-gray-200 shadow-sm"}`}>
                  
                  {isDarkMode && (
                      <div className="absolute inset-0 overflow-hidden opacity-20">
                        <img
                          key={activeGame.appid}
                          src={`https://media.steampowered.com/steamcommunity/public/images/apps/${activeGame.appid}/${activeGame.img_icon_url}.jpg`}
                          className="w-full h-full object-cover blur-xl scale-150 transition-transform duration-700 will-change-transform"
                          alt=""
                          loading="lazy"
                        />
                      </div>
                  )}

                  <div className="relative p-4 flex flex-col gap-3 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://media.steampowered.com/steamcommunity/public/images/apps/${activeGame.appid}/${activeGame.img_icon_url}.jpg`}
                          alt={activeGame.name}
                          loading="lazy"
                          className="w-12 h-12 rounded shadow-lg"
                        />
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDarkMode ? "text-[#66c0f4]" : "text-blue-600"}`}>
                            Top #{activeGameIndex + 1} Most Played
                          </div>
                          <div className={`font-bold text-lg leading-tight line-clamp-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {activeGame.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {formatPlaytime(activeGame.playtime_forever)}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">Hours</div>
                      </div>
                    </div>

                    <div className="h-8 flex flex-col justify-center">
                      {loadingAch ? (
                        <div className={`w-full h-1.5 rounded-full overflow-hidden animate-pulse ${isDarkMode ? "bg-gray-800" : "bg-gray-200"}`}>
                          <div className={`h-full w-1/3 ${isDarkMode ? "bg-gray-600" : "bg-gray-400"}`}></div>
                        </div>
                      ) : activeAch && activeAch.found ? (
                        <div className={`w-full rounded-lg p-2 border ${isDarkMode ? "bg-[#000000]/40 border-white/5" : "bg-gray-100 border-gray-200"}`}>
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span className={`font-semibold ${isDarkMode ? "text-[#66c0f4]" : "text-blue-600"}`}>Achievement</span>
                            <span>{activeAch.percentage}% ({activeAch.current}/{activeAch.total})</span>
                          </div>
                          <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDarkMode ? "bg-gray-700/50" : "bg-gray-300"}`}>
                            <div className="bg-gradient-to-r from-blue-500 to-[#66c0f4] h-1.5 rounded-full shadow-[0_0_10px_rgba(102,192,244,0.5)] transition-all duration-1000 will-change-transform"
                              style={{ width: `${activeAch.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-500 text-center italic">No stats available / Profile Private</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-1.5 mt-2">
                  {topGames.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveGameIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeGameIndex ? "bg-[#66c0f4] w-4" : isDarkMode ? "bg-gray-600 hover:bg-gray-400" : "bg-gray-300 hover:bg-gray-400"}`}
                    />
                  ))}
                </div>
              </div>

              {/* RECENTLY PLAYED */}
              {recentlyPlayed && recentlyPlayed.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-1 bg-[#66c0f4] rounded-full"></div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recently Played</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentlyPlayed.slice(0, 4).map((game) => (
                      <div key={game.appid} className={`flex items-center gap-3 p-2.5 rounded border transition-all group ${isDarkMode ? "bg-[#000000]/20 border-transparent hover:border-[#66c0f4]/20 hover:bg-[#2a475e]/20" : "bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50 shadow-sm"}`}>
                        <img
                          src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                          alt={game.name}
                          loading="lazy"
                          className="w-10 h-10 rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <div className="overflow-hidden">
                          <div className={`text-sm font-medium truncate transition-colors ${isDarkMode ? "text-gray-200 group-hover:text-[#66c0f4]" : "text-gray-800 group-hover:text-blue-600"}`}>
                              {game.name}
                          </div>
                          <div className="text-[11px] text-[#4c6b8a] flex gap-2">
                            <span>{formatPlaytime(game.playtime_2weeks)} past 2 weeks</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FULL LIBRARY EXPANSION */}
              {stats?.games && (
                <div className={`pt-3 mt-2 border-t ${isDarkMode ? "border-gray-800/50" : "border-gray-200"}`}>
                  <button onClick={() => setExpandedGames(!expandedGames)} className={`w-full group flex justify-between items-center text-xs transition-colors py-1 focus:outline-none ${isDarkMode ? "text-gray-500 hover:text-[#66c0f4]" : "text-gray-500 hover:text-blue-600"}`}>
                    <span className="uppercase tracking-wider font-semibold">Full Library ({stats.games.length})</span>
                    <span className="transform group-hover:translate-y-0.5 transition-transform">{expandedGames ? "▲" : "▼"}</span>
                  </button>

                  {expandedGames && (
                    <div className="mt-3 space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                      {stats.games.map((game, idx) => (
                        <div key={game.appid} className={`flex justify-between items-center text-[11px] p-1.5 rounded transition-colors ${isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                          <div className="flex items-center gap-2 overflow-hidden w-2/3">
                            <span className="text-gray-500 text-[9px] w-4">{idx + 1}.</span>
                            <span className={`truncate ${isDarkMode ? "text-gray-400" : "text-gray-700"}`}>{game.name}</span>
                          </div>
                          <span className="text-gray-500 font-mono">{formatPlaytime(game.playtime_forever)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Bungkus dengan React.memo agar parent re-render tidak memicu render ulang yang berat
export default React.memo(SteamProfileCard);