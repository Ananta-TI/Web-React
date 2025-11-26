import React, { useEffect, useState } from "react";

// Helper untuk format menit ke Jam
const formatPlaytime = (minutes) => {
  if (!minutes) return "0h";
  const hours = Math.round(minutes / 60);
  return `${hours.toLocaleString()}h`;
};

export default function SteamProfileCard({
  steamId = "76561199166544214",
  compact = false,
}) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [topGame, setTopGame] = useState(null);
  const [expandedGames, setExpandedGames] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Status Online/Offline Steam
  const getStatusColor = (status) => {
    // 0: Offline, 1: Online, 2: Busy, 3: Away, 4: Snooze
    if (status === 1) return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"; // Online Glow
    if (status > 1) return "bg-blue-400"; // Away/Busy
    return "bg-gray-500"; // Offline
  };

  const getStatusText = (status) => {
    if (status === 1) return "Online";
    if (status > 1) return "Away/Busy";
    return "Offline";
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // ⚠️ PENTING: Di Production, jangan taruh API KEY di frontend. Gunakan .env
    const API_KEY = "A606B68DE5932545085B42E948C90379"; 
    const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";

    async function fetchData() {
      try {
        const fetchWithProxy = (url) => 
          fetch(`${PROXY_URL}${encodeURIComponent(url)}`).then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          });

        const [profileRes, gamesRes] = await Promise.all([
          fetchWithProxy(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${steamId}`),
          fetchWithProxy(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${steamId}&include_appinfo=true`),
        ]);

        if (!mounted) return;

        const profileData = profileRes.response?.players?.[0];
        const rawGames = gamesRes.response?.games || [];

        if (!profileData) throw new Error("Profile not found");

        // Logic Sorting dipindah ke sini agar aman
        const sortedGames = [...rawGames].sort((a, b) => b.playtime_forever - a.playtime_forever);
        
        setProfile(profileData);
        setStats({
          games: sortedGames,
          total_count: gamesRes.response?.game_count || 0
        });

        if (sortedGames.length > 0) {
          setTopGame(sortedGames[0]);
        }

      } catch (err) {
        if (mounted) setError(err.message || "Failed to fetch data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [steamId]);

  // --- LOADING STATE (SKELETON) ---
  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-[#171a21] p-6 rounded-xl border border-gray-700 shadow-xl animate-pulse flex gap-4">
        <div className="w-24 h-24 bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-20 bg-gray-700 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="w-full max-w-2xl p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="font-sans antialiased text-gray-200 w-full max-w-2xl mx-auto cursor-target">
      {/* CARD CONTAINER with Steam Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#171a21] to-[#1b2838] border border-[#2a475e] shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all hover:shadow-[0_8px_40px_rgba(102,192,244,0.1)]">
        
        {/* Background Decoration (Abstract Glow) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#66c0f4] opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative p-5 flex flex-col sm:flex-row gap-5">
          
          {/* 1. AVATAR COLUMN */}
          <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
            <div className="relative group">
              <div className={`absolute -inset-0.5 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200 ${profile.personastate === 1 ? 'bg-green-400' : 'bg-blue-600'}`}></div>
              <img
                src={profile.avatarfull}
                alt={profile.personaname}
                className="relative w-28 h-28 rounded-lg object-cover border-2 border-[#2a475e] shadow-lg"
              />
              <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-[#1b2838] ${getStatusColor(profile.personastate)}`} />
            </div>
            
            <div className="mt-3 text-center sm:text-left">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#000000]/40 border border-gray-700 ${profile.personastate === 1 ? 'text-green-400' : 'text-gray-400'}`}>
                {getStatusText(profile.personastate)}
              </span>
            </div>
          </div>

          {/* 2. MAIN INFO COLUMN */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div>
                <a
                  href={`https://steamcommunity.com/profiles/${profile.steamid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-2xl font-bold text-white hover:text-[#66c0f4] transition-colors truncate block"
                >
                  {profile.personaname}
                </a>
                <div className="flex items-center gap-2 text-sm text-[#8f98a0] mt-1">
                  {profile.realname && <span>{profile.realname}</span>}
                  {profile.loccountrycode && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <img 
                          src={`https://flagcdn.com/20x15/${profile.loccountrycode.toLowerCase()}.png`} 
                          alt={profile.loccountrycode} 
                          className="w-4 h-3 opacity-80"
                        />
                        {profile.loccountrycode}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Game Count Badge */}
              <div className="bg-[#000000]/30 px-3 py-2 rounded-lg border border-[#2a475e] text-center min-w-[80px]">
                 <span className="block text-xl font-bold text-white">{stats?.total_count || 0}</span>
                 <span className="text-[10px] uppercase text-[#66c0f4] tracking-wide">Games</span>
              </div>
            </div>

            {/* 3. TOP GAME HIGHLIGHT */}
            {!compact && topGame && (
              <div className="mt-5 p-3 rounded-lg bg-gradient-to-r from-[#16202d] to-[#1b2838] border border-[#2a475e]/50 relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#66c0f4] rounded-l-lg"></div>
                <div className="flex justify-between items-center pl-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.699-3.181a1 1 0 011.827.95l-1.39 5.865a7.001 7.001 0 01-14.18 0l-1.39-5.865a1 1 0 011.827-.95l1.699 3.181L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 3.452a5 5 0 009.636 0l-.818-3.452a6.992 6.992 0 01-8 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold text-[#66c0f4] uppercase tracking-wider">Most Played</span>
                    </div>
                    <h3 className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">{topGame.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-bold text-gray-200">{formatPlaytime(topGame.playtime_forever)}</span>
                    <span className="text-xs text-gray-500">Total Hours</span>
                  </div>
                </div>
                
                {/* Background Image of Game (Optional/Advanced: requires valid img id) */}
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#000] to-transparent opacity-20 pointer-events-none"></div>
              </div>
            )}

            {/* 4. RECENT/TOP GAMES LIST */}
            {!compact && stats?.games && stats.games.length > 0 && (
              <div className="mt-4 space-y-1">
                {stats.games.slice(0, expandedGames ? 6 : 2).map((game) => (
                  <div key={game.appid} className="flex justify-between items-center text-sm p-2 hover:bg-[#ffffff]/5 rounded transition-colors group cursor-default">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img 
                        src={`http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} 
                        alt="" 
                        className="w-5 h-5 rounded-sm opacity-70 group-hover:opacity-100"
                        onError={(e) => {e.target.style.display='none'}}
                      />
                      <span className="truncate text-gray-400 group-hover:text-gray-200">{game.name}</span>
                    </div>
                    <span className="font-mono text-xs text-[#4c6b8a] whitespace-nowrap">{formatPlaytime(game.playtime_forever)}</span>
                  </div>
                ))}
                
                {stats.games.length > 2 && (
                  <button
                    onClick={() => setExpandedGames(!expandedGames)}
                    className="w-full mt-2 py-1 text-xs text-[#66c0f4] hover:text-white hover:bg-[#2a475e] rounded transition-colors flex items-center justify-center gap-1"
                  >
                   {expandedGames ? "Show Less" : `View ${stats.games.length - 2} More Games`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        {!compact && (
           <div className="bg-[#000000]/20 px-5 py-2 flex justify-between items-center text-[10px] text-gray-500 border-t border-[#2a475e]/30">
             <span>Joined {new Date(profile.timecreated * 1000).getFullYear()}</span>
             <span>ID: {steamId}</span>
           </div>
        )}
      </div>
    </div>
  );
}