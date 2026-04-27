import React, { useContext, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useLanyard } from "./useLanyard";
import { 
  Smartphone, 
  Monitor, 
  MapPin, 
  Music, 
  ExternalLink,
  Clock,
  Copy,
  RefreshCw,
  Share2,
  Download,
  Eye,
  EyeOff,
  Disc,
  MessageSquare // <--- Tambahan Icon untuk judul
} from "lucide-react";

// --------------------------------------------------
// Helper & Hooks
// --------------------------------------------------

function getStatusColor(status) {
  switch (status) {
    case "online": return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]";
    case "idle": return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]";
    case "dnd": return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
    default: return "bg-gray-500";
  }
}

function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatElapsedString(start) {
  const diff = Date.now() - start;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
}

// Decoder untuk public_flags Discord (Discord Badges Bawaan)
function getDiscordBadges(flags) {
  if (!flags) return [];
  const badges = [];
  if (flags & (1 << 0)) badges.push({ name: "Staff", color: "text-indigo-400" });
  if (flags & (1 << 1)) badges.push({ name: "Partner", color: "text-blue-400" });
  if (flags & (1 << 2)) badges.push({ name: "HypeSquad", color: "text-amber-400" });
  if (flags & (1 << 3)) badges.push({ name: "Bug Hunter", color: "text-green-400" });
  if (flags & (1 << 6)) badges.push({ name: "Bravery", color: "text-purple-400" });
  if (flags & (1 << 7)) badges.push({ name: "Brilliance", color: "text-red-400" });
  if (flags & (1 << 8)) badges.push({ name: "Balance", color: "text-emerald-400" });
  if (flags & (1 << 9)) badges.push({ name: "Early Supporter", color: "text-pink-400" });
  if (flags & (1 << 14)) badges.push({ name: "Bug Hunter Lvl 2", color: "text-green-400" });
  if (flags & (1 << 17)) badges.push({ name: "Verified Bot Dev", color: "text-blue-400" });
  if (flags & (1 << 22)) badges.push({ name: "Active Dev", color: "text-green-400" });
  return badges;
}

function LiveTimer({ start }) {
  const [text, setText] = useState(formatElapsedString(start));
  
  useEffect(() => {
    const timer = setInterval(() => setText(formatElapsedString(start)), 60000);
    return () => clearInterval(timer);
  }, [start]);

  return <span>{text} elapsed</span>;
}

// --------------------------------------------------
// Sub Components
// --------------------------------------------------

function LoadingCard({ dark }) {
  return (
    <div className={`flex justify-center cursor-target items-center h-48 w-full max-w-xl rounded-xl border ${dark ? "bg-zinc-800/60 border-zinc-700" : "bg-white/80 border-gray-200"}`}>
      <div className={`w-8 h-8 border-4 ${dark ? "border-indigo-400" : "border-indigo-600"} border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}

function UserNotFound({ dark }) {
  return (
    <div className={`p-4 rounded-xl border max-w-xl w-full text-center ${dark ? "bg-red-900/20 border-red-500/30 text-red-200" : "bg-red-50 border-red-200 text-red-800"}`}>
      <p className="font-bold">User not found on Lanyard</p>
      <p className="text-xs mt-1 opacity-80">Join <b>discord.gg/lanyard</b> first.</p>
    </div>
  );
}

function AvatarSection({ user, status, dark, onAvatarClick, enableClickableAvatar }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;

  const hasDecoration = user.avatar_decoration_data;
  const decorationUrl = hasDecoration 
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`
    : null;

  return (
    <div className="relative group shrink-0 ">
      <div className="relative ">
        <img
          src={avatarUrl}
          alt="Avatar"
          className={`w-24 h-24 rounded-2xl object-cover shadow-lg ring-4 ring-white/5 transition-transform duration-300 ${enableClickableAvatar ? 'cursor-pointer group-hover:scale-105' : ''}`}
          onClick={enableClickableAvatar ? onAvatarClick : undefined}
        />
        
        {decorationUrl && (
          <img 
            src={decorationUrl}
            alt="Decoration"
            className="absolute inset-0 w-24 h-24 pointer-events-none"
            style={{ transform: 'scale(1.2)' }}
          />
        )}
      </div>
      
      <div
        className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-[5px] ${dark ? "border-zinc-900" : "border-white"} ${getStatusColor(status)}`}
      />
    </div>
  );
}

function Header({ user, discord, dark, onCopyId, onStatusClick }) {
  let badges = getDiscordBadges(user.public_flags);

  // --------------------------------------------------------------------------
  // MANUAL OVERRIDE: Memaksa badge gambar asli muncul khusus ID kamu
  // --------------------------------------------------------------------------
  if (user.id === "900690698133700638") {
    badges = [
      { name: "Originally known as ntakunti_14#4619", src: "https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png" },
      { name: "Completed a Quest", src: "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png" },
      { name: "Last Meadow Online - Level 16 Reached", src: "https://cdn.discordapp.com/badge-icons/ca105ad9cfc8580c765101d17bbb2323.png" },
      { name: "Collected the Orb Profile Badge", src: "https://cdn.discordapp.com/badge-icons/83d8a1eb09a8d64e59233eec5d4d5c2d.png" }
    ];
  }

  return (
    <div className="flex flex-col mb-1 ">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold truncate bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 font-mono tracking-tight">
            {user.display_name || user.username}
          </h2>
        </div>
        
        <button 
          onClick={onStatusClick}
          className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide text-white ${getStatusColor(discord.discord_status)} hover:brightness-110 transition-all`}
        >
          {discord.discord_status === "dnd" ? "BUSY" : discord.discord_status}
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm opacity-70 font-medium mt-1">
        <button 
          onClick={onCopyId}
          className="flex items-center gap-1 hover:opacity-100 transition-opacity group"
        >
          <span>@{user.username}</span>
          <Copy size={12} className="opacity-0 group-hover:opacity-100" />
        </button>
        
        <div className="flex items-center gap-1.5 pl-2 border-l border-gray-500/30">
          {discord.active_on_discord_desktop && (
            <Monitor size={14} className="text-indigo-400" title="Online on Desktop" />
          )}
          {discord.active_on_discord_mobile && (
            <Smartphone size={14} className="text-green-400" title="Online on Mobile" />
          )}
          {discord.active_on_discord_web && (
            <div className="text-blue-400" title="Online on Web">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* RENDER BADGES (Menggunakan Gambar Asli) */}
      {badges.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {badges.map((badge) => (
            badge.src ? (
              <img 
                key={badge.name}
                src={badge.src}
                alt={badge.name}
                title={badge.name}
                className="w-[22px] h-[22px] object-contain drop-shadow-md"
              />
            ) : (
              <span key={badge.name} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"} ${badge.color}`}>
                {badge.name}
              </span>
            )
          ))}
        </div>
      )}

      {/* CLAN BADGE (Diperbaiki rata tengah dan ukurannya pas) */}
      {user.primary_guild && (
        <div className="flex items-center gap-1.5 text-xs mt-2">
          <div className="flex items-center gap-1 font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded-md">
            <span className="opacity-80">[</span>
            <img 
              src={`https://cdn.discordapp.com/clan-badges/${user.primary_guild.identity_guild_id}/${user.primary_guild.badge}.png`}
              alt="Clan Badge"
              className="w-4 h-4 object-contain" 
            />
            <span>{user.primary_guild.tag} <span className="opacity-80">]</span></span>
          </div>
          <span className="opacity-50 font-medium">Clan Member</span>
        </div>
      )}

      {discord.kv?.location && (
        <div className="flex items-center gap-1 text-xs opacity-50 mt-1">
          <MapPin size={12} />
          <span>{discord.kv.location}</span>
        </div>
      )}
    </div>
  );
}

function SpotifyCard({ spotify, dark, onSpotifyClick }) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");

  useEffect(() => {
    if (!spotify || !spotify.timestamps) return;

    const start = spotify.timestamps.start;
    const end = spotify.timestamps.end;
    const total = end - start;

    const update = () => {
      const now = Date.now();
      const current = now - start;
      const percent = Math.min((current / total) * 100, 100);
      
      setProgress(percent);
      setCurrentTime(formatTime(current));
      setTotalTime(formatTime(total));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [spotify]);

  if (!spotify) return null;

  return (
    <div 
      onClick={onSpotifyClick}
      className={`mt-4 relative overflow-hidden p-3 rounded-xl border transition-all cursor-pointer ${dark ? "bg-green-900/10 border-green-500/20 hover:bg-green-900/20" : "bg-green-50 border-green-200 hover:bg-green-100"}`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <a href={`https://open.spotify.com/track/${spotify.track_id}`} target="_blank" rel="noreferrer" className="shrink-0 group relative">
          <img 
            src={spotify.album_art_url} 
            className="w-14 h-14 rounded-lg shadow-sm group-hover:opacity-80 transition-opacity object-cover"
            alt="Album Art"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <ExternalLink size={16} className="text-white drop-shadow-md" />
          </div>
        </a>

        <div className="min-w-0 flex-1 ">
          <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${dark ? "text-green-400" : "text-green-600"}`}>
            <Music size={10} /> Listening to Spotify
          </div>
          <a href={`https://open.spotify.com/track/${spotify.track_id}`} target="_blank" rel="noreferrer" className={`font-bold text-sm truncate hover:underline block ${dark ? "text-green-100" : "text-green-900"}`}>
            {spotify.song}
          </a>
          <div className={`text-[11px] truncate ${dark ? "text-green-400/80" : "text-green-700/80"}`}>
            by {spotify.artist}
          </div>
          
          <div className={`text-[10px] truncate flex items-center gap-1 mt-0.5 ${dark ? "text-green-400/50" : "text-green-700/50"}`}>
            <Disc size={8} /> {spotify.album}
          </div>
        </div>
      </div>

      {spotify.timestamps && (
        <div className="mt-3 relative z-10">
          <div className={`h-1 w-full rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={`flex justify-between text-[10px] mt-1 font-mono ${dark ? "text-green-400/50" : "text-green-700/50"}`}>
            <span>{currentTime}</span>
            <span>{totalTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ act, dark, onActivityClick, enableClickableActivities }) {
  const hasTime = act.timestamps?.start;
  
  return (
    <div 
      onClick={enableClickableActivities ? () => onActivityClick(act) : undefined}
      className={`flex items-start rounded-lg border transition ${enableClickableActivities ? 'cursor-pointer' : ''} ${dark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
    >
      <div className="relative shrink-0">
        {act.assets?.large_image ? (
          <img
            src={`https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`}
            className="w-10 h-10 rounded-lg object-cover bg-black/20"
            title={act.assets.large_text || act.name}
            onError={(e) => { e.target.style.display = "none"; }}
            alt={act.name}
          />
        ) : (
          <div 
            className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-bold text-xs uppercase"
            title={act.name} 
          >
            {act.name.substring(0, 2)}
          </div>
        )}
        
        {act.assets?.small_image && (
          <img 
            src={`https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.small_image}.png`}
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#18181b]"
            title={act.assets.small_text} 
            alt="Small"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className={`text-xs font-bold ${dark ? "text-indigo-200" : "text-indigo-700"}`}>{act.name}</div>
        {act.details && <div className="text-[11px] opacity-90 truncate mt-0.5">{act.details}</div>}
        {act.state && <div className="text-[11px] opacity-60 truncate">{act.state}</div>}

        {hasTime && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] opacity-40 font-mono bg-black/20 w-fit px-1.5 py-0.5 rounded">
             <Clock size={8} />
             <LiveTimer start={act.timestamps.start} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityList({ activities, expanded, setExpanded, dark, onActivityClick, enableClickableActivities }) {
  const filtered = useMemo(
    () => activities.filter(a => a.id !== "custom" && a.id !== "spotify:1"),
    [activities]
  );

  if (filtered.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Activities</span>
        {filtered.length > 2 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className={`text-[10px] px-2 py-0.5 rounded border transition ${dark ? "border-white/10 hover:bg-white/10" : "border-black/10 hover:bg-black/5"}`}
          >
            {expanded ? "Collapse" : `+${filtered.length - 1} More`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.slice(0, expanded ? 5 : 1).map((act, i) => (
          <ActivityItem 
            key={i} 
            act={act} 
            dark={dark} 
            onActivityClick={onActivityClick}
            enableClickableActivities={enableClickableActivities}
          />
        ))}
      </div>
    </div>
  );
}

function Toast({ show, message, dark }) {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-[slideIn_0.2s_ease-out]">
      <div className={`px-4 py-2 rounded-lg shadow-lg border ${dark ? "bg-green-400 border-green-800 text-black" : "bg-green-200 border-green-500 text-gray-900"}`}>
        {message}
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function DiscordProfileCard({ 
  userId, 
  compact = false,
  onAvatarClick,
  onStatusClick,
  onActivityClick,
  onSpotifyClick,
  onRefresh,
  onCopyId,
  onShare,
  onExport,
  showRefreshButton = true,
  showShareButton = true,
  showExportButton = false,
  enableClickableAvatar = true,
  enableClickableActivities = true,
  showCompactToggle = false,
  autoRefresh = false,
  refreshInterval = 30000
}) {
  const themeCtx = useContext(ThemeContext);
  const dark = themeCtx?.isDarkMode ?? true;

  const { data: discord, loading, refetch } = useLanyard(userId);
  const [expanded, setExpanded] = useState(true);
  const [isCompact, setIsCompact] = useState(compact);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0 && refetch) {
      const interval = setInterval(() => {
        refetch();
        if (onRefresh) onRefresh();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetch, onRefresh]);

  const showNotification = useCallback((message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

  const handleCopyId = useCallback(() => {
    if (discord?.discord_user?.id) {
      navigator.clipboard.writeText(discord.discord_user.id).then(() => {
        showNotification("User ID copied!");
        if (onCopyId) onCopyId(discord.discord_user.id);
      });
    }
  }, [discord, onCopyId, showNotification]);

  const handleAvatarClick = useCallback(() => {
    if (onAvatarClick) {
      onAvatarClick(discord?.discord_user);
    } else {
      showNotification("Avatar clicked!");
    }
  }, [discord, onAvatarClick, showNotification]);

  const handleStatusClick = useCallback(() => {
    if (onStatusClick) {
      onStatusClick(discord?.discord_status);
    } else {
      showNotification(`Status: ${discord?.discord_status}`);
    }
  }, [discord, onStatusClick, showNotification]);

  const handleSpotifyClick = useCallback(() => {
    if (onSpotifyClick && discord?.spotify) {
      onSpotifyClick(discord.spotify);
    } else {
      showNotification("Listening to Spotify");
    }
  }, [discord, onSpotifyClick, showNotification]);

  const handleActivityClick = useCallback((activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      showNotification(`Activity: ${activity.name}`);
    }
  }, [onActivityClick, showNotification]);

  const handleRefresh = useCallback(() => {
    if (refetch) {
      refetch();
      showNotification("Refreshing...");
      if (onRefresh) onRefresh();
    }
  }, [refetch, onRefresh, showNotification]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${discord?.discord_user?.display_name}'s Discord Profile`,
      text: `Check out ${discord?.discord_user?.display_name} on Discord!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShare) onShare(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      showNotification("Share not supported");
    }
  }, [discord, onShare, showNotification]);

  const handleExport = useCallback(() => {
    if (discord) {
      const dataStr = JSON.stringify(discord, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `discord-${discord.discord_user.username}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      showNotification("Data exported!");
      if (onExport) onExport(discord);
    }
  }, [discord, onExport, showNotification]);

  if (loading) return <LoadingCard dark={dark} />;
  if (!discord) return <UserNotFound dark={dark} />;

  const user = discord.discord_user;
  const spotify = discord.spotify;
  const activities = discord.activities || [];
  const customStatus = activities.find(a => a.id === "custom");

  return (
    <>
      <Toast show={showToast} message={toastMessage} dark={dark} />
      
      {/* KOTAK UTAMA */}
      <div className={`cursor-target relative flex flex-col w-full rounded-2xl p-6 transition-all duration-300 shadow-2xl border ${dark ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0 text-gray-100" : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"} backdrop-blur-xl font-sans`}>
        
        {/* JUDUL DISCORD DI ATAS */}
        <div className="flex items-center gap-2 mb-5 opacity-60">
          <MessageSquare size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Discord Profile
          </span>
        </div>

        {/* BUNGKUSAN KONTEN ROW (AVATAR KIRI, INFO KANAN) */}
        <div className="flex flex-col sm:flex-row items-start gap-5 w-full">
          <AvatarSection 
            user={user} 
            status={discord.discord_status} 
            dark={dark} 
            onAvatarClick={handleAvatarClick}
            enableClickableAvatar={enableClickableAvatar}
          />

          <div className="flex-1 min-w-0 w-full">
            <Header 
              user={user} 
              discord={discord} 
              dark={dark} 
              onCopyId={handleCopyId}
              onStatusClick={handleStatusClick}
            />

            {customStatus && (
              <div className={`mt-3 text-sm py-1.5 px-3 rounded-lg italic border inline-block max-w-full truncate ${dark ? "bg-zinc-800/50 border-white/5 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                "{customStatus.state}"
              </div>
            )}

            {!isCompact && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <SpotifyCard 
                  spotify={spotify} 
                  dark={dark} 
                  onSpotifyClick={handleSpotifyClick}
                />
                <ActivityList 
                  activities={activities} 
                  expanded={expanded} 
                  setExpanded={setExpanded} 
                  dark={dark}
                  onActivityClick={handleActivityClick}
                  enableClickableActivities={enableClickableActivities}
                />
              </div>
            )}
          </div>
        </div>

        {/* Top Right Controls (Digeser sedikit agar tidak nabrak judul) */}
        <div className="absolute top-4 right-4 flex items-center gap-1">
          {showCompactToggle && (
            <button onClick={() => setIsCompact(!isCompact)} className="opacity-30 hover:opacity-100 transition-opacity p-1" title={isCompact ? "Show full" : "Compact view"}>
              {isCompact ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          )}
          {showExportButton && (
            <button onClick={handleExport} className="opacity-30 hover:opacity-100 transition-opacity p-1" title="Export data">
              <Download size={14} />
            </button>
          )}
          {showShareButton && (
            <button onClick={handleShare} className="opacity-30 hover:opacity-100 transition-opacity p-1" title="Share profile">
              <Share2 size={14} />
            </button>
          )}
          {showRefreshButton && (
            <button onClick={handleRefresh} className="opacity-30 hover:opacity-100  p-1 hover:rotate-180 transition-transform duration-500" title="Refresh data">
              <RefreshCw size={14} />
            </button>
          )}
          <a href="https://github.com/Phineas/lanyard" target="_blank" rel="noreferrer" className="opacity-30 hover:opacity-100 transition-opacity p-1" title="Powered by Lanyard">
            <div className={`w-2 h-2 rounded-full ${discord.success === false ? "bg-red-500" : "bg-green-500"}`}></div>
          </a>
        </div>
      </div>
    </>
  );
}