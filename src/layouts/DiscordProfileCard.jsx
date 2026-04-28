import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useLanyard } from "./useLanyard";
import {
  Monitor,
  Smartphone,
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
  Check,
  Gamepad2
} from "lucide-react";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStatusMeta(status) {
  switch (status) {
    case "online":
      return { color: "#22c55e", glow: "0 0 12px rgba(34,197,94,0.6)", label: "Online", pillCls: "bg-green-500 text-white" };
    case "idle":
      return { color: "#facc15", glow: "0 0 12px rgba(250,204,21,0.6)", label: "Idle", pillCls: "bg-yellow-400 text-zinc-900" };
    case "dnd":
      return { color: "#f87171", glow: "0 0 12px rgba(248,113,113,0.6)", label: "Busy", pillCls: "bg-red-500 text-white" };
    default:
      return { color: "#52525b", glow: "none", label: "Offline", pillCls: "bg-zinc-600 text-zinc-300" };
  }
}

function formatMs(ms) {
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor(ms / 1000 / 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatElapsed(start) {
  const diff = Date.now() - start;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m`;
  return "Just now";
}

// Helper BUG FIX: Menangani aset Discord yang berformat external proxy
function getAssetUrl(appId, assetId) {
  if (!assetId) return null;
  if (assetId.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${assetId.replace("mp:external/", "")}`;
  }
  return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

function getDiscordBadges(flags) {
  if (!flags) return [];
  const map = [
    [0, "Staff", "text-indigo-400"],
    [1, "Partner", "text-blue-400"],
    [2, "HypeSquad", "text-amber-400"],
    [3, "Bug Hunter", "text-green-400"],
    [6, "Bravery", "text-purple-400"],
    [7, "Brilliance", "text-red-400"],
    [8, "Balance", "text-emerald-400"],
    [9, "Early Supporter", "text-pink-400"],
    [14, "Bug Hunter Lv2", "text-green-400"],
    [17, "Verified Bot Dev", "text-blue-400"],
    [22, "Active Dev", "text-green-400"],
  ];
  return map.filter(([bit]) => flags & (1 << bit)).map(([, name, color]) => ({ name, color }));
}

// ─────────────────────────────────────────────
// Sub-hooks
// ─────────────────────────────────────────────

function useLiveTimer(start) {
  const [text, setText] = useState(() => formatElapsed(start));
  useEffect(() => {
    const id = setInterval(() => setText(formatElapsed(start)), 30000);
    return () => clearInterval(id);
  }, [start]);
  return text;
}

function useSpotifyProgress(spotify) {
  const [state, setState] = useState({ pct: 0, current: "0:00", total: "0:00" });
  useEffect(() => {
    if (!spotify?.timestamps) return;
    const { start, end } = spotify.timestamps;
    const totalMs = Math.max(0, end - start);
    
    const tick = () => {
      const cur = Math.max(0, Date.now() - start);
      setState({
        pct: totalMs > 0 ? Math.min((cur / totalMs) * 100, 100) : 0,
        current: formatMs(cur),
        total: formatMs(totalMs),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [spotify]);
  return state;
}

// ─────────────────────────────────────────────
// Tiny components
// ─────────────────────────────────────────────

function LoadingCard({ dark }) {
  return (
    <div className={`flex items-center justify-center h-44 w-full rounded-2xl border ${dark ? "bg-zinc-900/80 border-zinc-700/50" : "bg-white/80 border-gray-200"}`}>
      <div className={`w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin ${dark ? "border-indigo-400" : "border-indigo-600"}`} />
    </div>
  );
}

function UserNotFound({ dark }) {
  return (
    <div className={`p-6 rounded-2xl border text-center w-full ${dark ? "bg-red-900/20 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
      <p className="font-bold text-lg mb-1">User not found</p>
      <p className="opacity-70 text-xs">This user is not connected to Lanyard API.</p>
    </div>
  );
}

function Toast({ show, message, dark }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[999] pointer-events-none">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl animate-[slideUp_0.2s_ease-out] ${dark ? "bg-green-400 text-zinc-900" : "bg-green-600 text-white"}`}>
        <Check size={14} strokeWidth={3} />
        {message}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────

function AvatarSection({ user, status, dark, onClick, clickable }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;

  const decorUrl = user.avatar_decoration_data
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`
    : null;

  const { color, glow } = getStatusMeta(status);

  return (
    <div className="relative flex-shrink-0 group">
      <div className="relative z-10">
        <img
          src={avatarUrl}
          alt="Avatar"
          onClick={clickable ? onClick : undefined}
          className={`w-[90px] h-[90px] rounded-2xl object-cover ring-4 ${dark ? "ring-zinc-800/50" : "ring-white/50"} shadow-lg transition-all duration-300 ${clickable ? "cursor-pointer group-hover:scale-[1.05] group-hover:shadow-indigo-500/20" : ""}`}
        />
        {decorUrl && (
          <img
            src={decorUrl}
            alt="decoration"
            className="absolute inset-0 w-[90px] h-[90px] pointer-events-none scale-[1.25]"
          />
        )}
      </div>
      {/* Status ring */}
      <div
        className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-[4px] z-20 ${dark ? "border-[#1c1c1f]" : "border-white"}`}
        style={{ background: color, boxShadow: glow }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Header (name, badges, status)
// ─────────────────────────────────────────────

function Header({ user, discord, dark, onCopyId, onStatusClick }) {
  let badges = getDiscordBadges(user.public_flags);

  // Manual override
  if (user.id === "900690698133700638") {
    badges = [
      { name: "Originally known as ntakunti_14#4619", src: "https://cdn.discordapp.com/badge-icons/6de6d34650760ba5551a79732e98ed60.png" },
      { name: "Completed a Quest", src: "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png" },
      { name: "Last Meadow Online - Level 16 Reached", src: "https://cdn.discordapp.com/badge-icons/ca105ad9cfc8580c765101d17bbb2323.png" },
      { name: "Collected the Orb Profile Badge", src: "https://cdn.discordapp.com/badge-icons/83d8a1eb09a8d64e59233eec5d4d5c2d.png" },
    ];
  }

  const { pillCls, label } = getStatusMeta(discord.discord_status);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-[24px] font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 truncate drop-shadow-sm">
          {user.display_name || user.username}
        </h2>
        <button onClick={onStatusClick} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md transition-all hover:brightness-110 flex-shrink-0 shadow-sm ${pillCls}`}>
          {label}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-1.5">
        <button onClick={onCopyId} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group font-medium">
          <span>@{user.username}</span>
          <Copy size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <span className="text-zinc-600">·</span>
        <div className="flex items-center gap-1.5 opacity-80">
          {discord.active_on_discord_desktop && <Monitor size={14} className="text-indigo-400" title="Desktop" />}
          {discord.active_on_discord_mobile && <Smartphone size={14} className="text-green-400" title="Mobile" />}
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {badges.map((b) =>
            b.src ? (
              <img key={b.name} src={b.src} alt={b.name} title={b.name} className="w-6 h-6 object-contain drop-shadow-md hover:scale-110 transition-transform" onError={(e) => (e.target.style.display = "none")} />
            ) : (
              <span key={b.name} title={b.name} className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${dark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10"} ${b.color}`}>
                {b.name}
              </span>
            )
          )}
        </div>
      )}

      {/* Clan badge */}
      {user.primary_guild && (
        <div className="flex items-center gap-2 mt-3 bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-lg w-fit">
          <img src={`https://cdn.discordapp.com/clan-badges/${user.primary_guild.identity_guild_id}/${user.primary_guild.badge}.png`} alt="Clan" className="w-[18px] h-[18px] object-contain drop-shadow-sm" />
          <span className="text-[11px] font-bold text-yellow-400 tracking-wide">{user.primary_guild.tag}</span>
        </div>
      )}

      {discord.kv?.location && (
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-2 font-medium">
          <MapPin size={12} />
          <span>{discord.kv.location}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Spotify
// ─────────────────────────────────────────────

function SpotifyCard({ spotify, dark, onClick }) {
  const { pct, current, total } = useSpotifyProgress(spotify);
  if (!spotify) return null;

  // BUG FIX: Gunakan direct URL Spotify yang benar
  const spotifyUrl = `https://open.spotify.com/track/${spotify.track_id}`;

  return (
    <div onClick={onClick} className={`mt-4 rounded-2xl border p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group ${dark ? "bg-[#1db954]/[0.08] border-[#1db954]/30 hover:bg-[#1db954]/[0.12] hover:border-[#1db954]/50" : "bg-green-50 border-green-300 hover:bg-green-100"}`}>
      
      {/* Background Blur Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${spotify.album_art_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)' }} />

      <div className="flex items-center gap-4 relative z-10">
        <a href={spotifyUrl} target="_blank" rel="noreferrer" className="flex-shrink-0 relative group/art" onClick={(e) => e.stopPropagation()}>
          <img src={spotify.album_art_url} alt="Album Art" className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover/art:opacity-75 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-opacity pointer-events-none">
            <ExternalLink size={16} className="text-white drop-shadow-md" />
          </div>
        </a>

        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1 ${dark ? "text-green-400" : "text-green-600"}`}>
            <Music size={10} className="animate-pulse" />
            Listening to Spotify
          </div>
          <a href={spotifyUrl} target="_blank" rel="noreferrer" className={`block text-[14px] font-bold truncate hover:underline ${dark ? "text-green-50" : "text-green-950"}`} onClick={(e) => e.stopPropagation()}>
            {spotify.song}
          </a>
          <div className={`text-[12px] truncate mt-px font-medium ${dark ? "text-green-300/80" : "text-green-800/80"}`}>
            by {spotify.artist}
          </div>
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <div className={`h-[4px] rounded-full overflow-hidden ${dark ? "bg-black/30" : "bg-black/10"}`}>
          <div className="h-full bg-green-500 rounded-full transition-[width] duration-1000 ease-linear shadow-[0_0_8px_rgba(34,197,94,0.6)]" style={{ width: `${pct}%` }} />
        </div>
        <div className={`flex justify-between text-[10px] font-mono mt-1.5 font-semibold ${dark ? "text-green-400/60" : "text-green-700/60"}`}>
          <span>{current}</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Activity item
// ─────────────────────────────────────────────

function ActivityItem({ act, dark, onClick, clickable }) {
  const elapsed = act.timestamps?.start ? useLiveTimer(act.timestamps.start) : null;
  
  // BUG FIX: Penanganan aset yang akurat (external proxy vs app-assets)
  const imgSrc = getAssetUrl(act.application_id, act.assets?.large_image);
  const smallSrc = getAssetUrl(act.application_id, act.assets?.small_image);

  return (
    <div onClick={clickable ? () => onClick(act) : undefined} className={`flex items-start gap-3 p-3 rounded-2xl border transition-all duration-200 ${clickable ? "cursor-pointer" : ""} ${dark ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/10" : "bg-gray-50 border-gray-200 hover:bg-white hover:shadow-sm"}`}>
      
      <div className="relative flex-shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={act.name} className="w-12 h-12 rounded-xl object-cover shadow-md bg-black/20" title={act.assets.large_text || act.name} onError={(e) => (e.target.style.display = "none")} />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-[12px] font-black text-indigo-400 uppercase shadow-inner border border-indigo-500/20">
            <Gamepad2 size={20} className="opacity-50" />
          </div>
        )}
        {smallSrc && (
          <img src={smallSrc} alt="" title={act.assets.small_text} className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-[2.5px] object-cover ${dark ? "border-[#202024]" : "border-gray-50"}`} />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className={`text-[13px] font-bold truncate ${dark ? "text-indigo-200" : "text-indigo-700"}`}>
          {act.name}
        </div>
        {act.details && (
          <div className={`text-[12px] truncate mt-0.5 font-medium ${dark ? "text-zinc-400" : "text-gray-600"}`}>
            {act.details}
          </div>
        )}
        {act.state && (
          <div className={`text-[11px] truncate mt-px ${dark ? "text-zinc-500" : "text-gray-500"}`}>
            {act.state}
          </div>
        )}
        {elapsed && (
          <div className={`flex items-center gap-1 mt-2 text-[10px] font-mono w-fit px-2 py-0.5 rounded-md border ${dark ? "bg-black/30 border-white/5 text-zinc-500" : "bg-gray-200/50 border-gray-200 text-gray-500"}`}>
            <Clock size={10} />
            {elapsed} elapsed
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Activity list
// ─────────────────────────────────────────────

function ActivityList({ activities, dark, onActivityClick, clickable }) {
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => activities.filter((a) => a.id !== "custom" && a.id !== "spotify:1"), [activities]);
  if (filtered.length === 0) return null;

  const shown = expanded ? filtered : filtered.slice(0, 1);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-black uppercase tracking-widest pl-1 ${dark ? "text-zinc-500" : "text-gray-400"}`}>
          Current Activities
        </span>
        {filtered.length > 1 && (
          <button onClick={() => setExpanded((x) => !x)} className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-colors ${dark ? "border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}>
            {expanded ? "Show Less" : `+${filtered.length - 1} More`}
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {shown.map((act, i) => (
          <ActivityItem key={i} act={act} dark={dark} onClick={onActivityClick} clickable={clickable} />
        ))}
      </div>
    </div>
  );
}

function CtrlBtn({ onClick, title, children, dark }) {
  return (
    <button onClick={onClick} title={title} className={`w-8 h-8 flex items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-200 ${dark ? "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]" : "border-gray-200 bg-white/50 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

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
  refreshInterval = 30000,
}) {
  const themeCtx = useContext(ThemeContext);
  const dark = themeCtx?.isDarkMode ?? true;

  const { data: discord, loading, refetch } = useLanyard(userId);
  const [isCompact, setIsCompact] = useState(compact);
  const [toast, setToast] = useState({ show: false, msg: "" });

  useEffect(() => {
    if (!autoRefresh || !refetch) return;
    const id = setInterval(() => { refetch(); onRefresh?.(); }, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, refetch, onRefresh]);

  const notify = useCallback((msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  }, []);

  const handleCopyId = useCallback(() => {
    const id = discord?.discord_user?.id;
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => { notify("ID Copied!"); onCopyId?.(id); });
  }, [discord, onCopyId, notify]);

  const handleAvatarClick = useCallback(() => { if (onAvatarClick) onAvatarClick(discord?.discord_user); }, [discord, onAvatarClick]);
  const handleStatusClick = useCallback(() => { if (onStatusClick) onStatusClick(discord?.discord_status); }, [discord, onStatusClick]);
  const handleSpotifyClick = useCallback(() => {
    if (onSpotifyClick) onSpotifyClick(discord?.spotify);
    else if (discord?.spotify?.track_id) window.open(`https://open.spotify.com/track/${discord.spotify.track_id}`, "_blank");
  }, [discord, onSpotifyClick]);
  const handleActivityClick = useCallback((act) => { if (onActivityClick) onActivityClick(act); }, [onActivityClick]);

  const handleRefresh = useCallback(() => { refetch?.(); notify("Data Refreshed!"); onRefresh?.(); }, [refetch, onRefresh, notify]);

  const handleShare = useCallback(async () => {
    const shareData = { title: `${discord?.discord_user?.display_name}'s Profile`, text: `Check out ${discord?.discord_user?.display_name} on Discord!`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); onShare?.(shareData); } catch (_) {} } 
    else { navigator.clipboard.writeText(window.location.href).then(() => notify("Link Copied!")); }
  }, [discord, onShare, notify]);

  const handleExport = useCallback(() => {
    if (!discord) return;
    const blob = new Blob([JSON.stringify(discord, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `discord-${discord.discord_user.username}.json`; a.click();
    URL.revokeObjectURL(url);
    notify("JSON Downloaded!");
    onExport?.(discord);
  }, [discord, onExport, notify]);

  if (loading) return <LoadingCard dark={dark} />;
  if (!discord) return <UserNotFound dark={dark} />;

  const user = discord.discord_user;
  const spotify = discord.spotify;
  const activities = discord.activities || [];
  const customStatus = activities.find((a) => a.id === "custom");

  return (
    <>
      <Toast show={toast.show} message={toast.msg} dark={dark} />

      <div className={`relative flex flex-col w-full max-w-2xl rounded-[24px] overflow-hidden transition-all duration-500 shadow-2xl ${dark ? "bg-[#18181b]/90 border border-zinc-700/60 text-zinc-100" : "bg-white/95 border border-gray-200 text-gray-900"} backdrop-blur-2xl`}>
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-50 mix-blend-screen" style={{ background: "radial-gradient(circle at 100% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-50 mix-blend-screen" style={{ background: "radial-gradient(circle at 0% 100%, rgba(34,197,94,0.08) 0%, transparent 60%)" }} />

        {/* Top Controls Container */}
        <div className="absolute top-5 right-5 flex items-center gap-1.5 z-20">
          {showCompactToggle && <CtrlBtn dark={dark} title={isCompact ? "Expand" : "Compact"} onClick={() => setIsCompact((x) => !x)}>{isCompact ? <Eye size={14} /> : <EyeOff size={14} />}</CtrlBtn>}
          {showExportButton && <CtrlBtn dark={dark} title="Download JSON" onClick={handleExport}><Download size={14} /></CtrlBtn>}
          {showShareButton && <CtrlBtn dark={dark} title="Share" onClick={handleShare}><Share2 size={14} /></CtrlBtn>}
          {showRefreshButton && <CtrlBtn dark={dark} title="Refresh" onClick={handleRefresh}><RefreshCw size={14} className="transition-transform hover:rotate-180 duration-700" /></CtrlBtn>}
          <div className={`w-2.5 h-2.5 rounded-full ml-1.5 border border-black/20 ${discord.success === false ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"}`} title={discord.success === false ? "API Error" : "Connected"} />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-full pr-24">
            <AvatarSection user={user} status={discord.discord_status} dark={dark} onClick={handleAvatarClick} clickable={enableClickableAvatar} />
            <div className="flex-1 min-w-0">
              <Header user={user} discord={discord} dark={dark} onCopyId={handleCopyId} onStatusClick={handleStatusClick} />
            </div>
          </div>

          {/* Custom status */}
          {customStatus?.state && (
            <div className={`mt-5 text-[13px] font-medium px-4 py-2.5 rounded-xl inline-flex max-w-full border ${dark ? "bg-white/[0.03] border-white/[0.08] text-zinc-300 shadow-inner" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <span className="italic truncate">"{customStatus.state}"</span>
            </div>
          )}

          {/* Details (Spotify & Activities) */}
          <div className={`transition-all duration-500 overflow-hidden ${isCompact ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100 mt-2"}`}>
            <SpotifyCard spotify={spotify} dark={dark} onClick={handleSpotifyClick} />
            <ActivityList activities={activities} dark={dark} onActivityClick={handleActivityClick} clickable={enableClickableActivities} />
          </div>
        </div>
      </div>
    </>
  );
}