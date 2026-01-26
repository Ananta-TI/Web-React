// tetrioApi.js
const TETRIO_API = "https://ch.tetr.io/api";
const BASE_URL = "https://api.codetabs.com/v1/proxy?quest=";

/**
 * Wrapper fetch to Codetabs proxy (keperluan CORS).
 */
async function proxyGet(url) {
  const res = await fetch(`${BASE_URL}${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

/**
 * Ambil data penting user + summaries.
 * Returns cleaned JSON ready dipakai di UI.
 */
export async function fetchTetrioProfile(userId = "") {
  if (!userId) throw new Error("userId is required");

  // endpoints we will call
  const endpoints = {
    user: `${TETRIO_API}/users/${userId}`,
    league: `${TETRIO_API}/users/${userId}/summaries/league`,
    zenith: `${TETRIO_API}/users/${userId}/summaries/zenith`, // quick play
    blitz: `${TETRIO_API}/users/${userId}/summaries/blitz`,
    _40l: `${TETRIO_API}/users/${userId}/summaries/40l`,
    zen: `${TETRIO_API}/users/${userId}/summaries/zen`, // zen mode
    achievements: `${TETRIO_API}/users/${userId}/summaries/achievements`, // achievements
  };

  const calls = Object.entries(endpoints).map(async ([k, url]) => {
    try {
      const json = await proxyGet(url);
      return [k, json];
    } catch (e) {
      return [k, { success: false, error: e.message }];
    }
  });

  const resolved = await Promise.all(calls);
  const data = Object.fromEntries(resolved);

  if (!data.user.success) {
    throw new Error(data.user.error?.message || "Failed fetching user");
  }

  const u = data.user.data;
  const league = data.league.success ? data.league.data : null;
  const zen_mode = data.zen.success ? data.zen.data : null;
  const zenith = data.zenith.success ? data.zenith.data : null;
  const blitz = data.blitz.success ? data.blitz.data : null;
  const _40l = data._40l.success ? data._40l.data : null;
  const achievements = data.achievements.success ? data.achievements.data : null;

  // helper winrate
  const gamesplayed = typeof u.gamesplayed === "number" ? u.gamesplayed : null;
  const gameswon = typeof u.gameswon === "number" ? u.gameswon : null;
  const winrate =
    gamesplayed && gamesplayed > 0 && gameswon >= 0
      ? Number(((gameswon / gamesplayed) * 100).toFixed(1))
      : null;

  // build latest "news" array from summaries (best-effort)
  const latest = [];
  if (league && league.rank) {
    latest.push({
      type: "rank",
      text: `${u.username} achieved ${league.rank.toUpperCase()} rank`,
      meta: { rank: league.rank, tr: league.tr },
    });
  }
  if (zenith?.best?.record?.alt) {
    latest.push({
      type: "quickplay_pb",
      text: `New Quick Play PB: ${zenith.best.record.alt} m`,
      meta: { alt: zenith.best.record.alt, when: zenith.best.record?.ts },
    });
  } else if (zenith?.record?.alt) {
    latest.push({
      type: "quickplay_recent",
      text: `Quick Play last: ${zenith.record.alt} m`,
      meta: { alt: zenith.record.alt, when: zenith.record?.ts },
    });
  }
  if (blitz?.record?.score) {
    latest.push({
      type: "blitz_pb",
      text: `Blitz PB: ${blitz.record.score}`,
      meta: { score: blitz.record.score, when: blitz.record?.ts },
    });
  }
  if (_40l?.record?.time) {
    latest.push({
      type: "40l_record",
      text: `40L record: ${_40l.record.time} (time)`,
      meta: { record: _40l.record, when: _40l.record?.ts },
    });
  }
  if (zen_mode?.score) {
    latest.push({
      type: "zen_score",
      text: `Zen Mode Level: ${zen_mode.level}, Score: ${zen_mode.score}`,
      meta: { level: zen_mode.level, score: zen_mode.score },
    });
  }

  const cleanProfile = {
    id: u._id,
    username: u.username,
    role: u.role,
    country: u.country,
    avatar: u.avatar_revision
      ? `https://tetr.io/user-content/avatars/${u._id}.jpg?rv=${u.avatar_revision}`
      : null,
    badges: u.badges || [],
    connections: u.connections || {},
    xp: u.xp ?? null,
    join_ts: u.ts ?? null,
    join_relative: u.ts ? relativeTime(u.ts) : null,
    play_time_seconds: u.gametime >= 0 ? u.gametime : null,
    play_time_readable: u.gametime >= 0 ? secondsToHuman(u.gametime) : null,
    gamesplayed: gamesplayed,
    gameswon: gameswon,
    winrate: winrate,
    friend_count: u.friend_count ?? null,
    supporter: !!u.supporter,
    ar: u.ar ?? null,
    ar_counts: u.ar_counts ?? {},
    // league
    league: league
      ? {
          rank: league.rank,
          bestrank: league.bestrank ?? null,
          tr: typeof league.tr === "number" ? Number(league.tr.toFixed(2)) : null,
          glicko: league.glicko ?? null,
          gxe: league.gxe ?? null,
          rd: league.rd ?? null,
          decaying: league.decaying ?? false,
          standing: league.standing ?? null,
          standing_local: league.standing_local ?? null,
          percentile: league.percentile ?? null,
          percentile_rank: league.percentile_rank ?? null,
          gamesplayed: league.gamesplayed ?? null,
          gameswon: league.gameswon ?? null,
          apm: league.apm ?? null,
          pps: league.pps ?? null,
          vs: league.vs ?? null,
          next_rank: league.next_rank ?? null,
          prev_rank: league.prev_rank ?? null,
          next_at: league.next_at ?? null,
          prev_at: league.prev_at ?? null,
          past_seasons: league.past ?? {},
        }
      : null,
    // zen mode
    zen: zen_mode
      ? {
          level: zen_mode.level ?? null,
          score: zen_mode.score ?? null,
        }
      : null,
    // summaries / pbs
    quickplay: zenith ? { record: zenith.record ?? null, best: zenith.best ?? null, rank: zenith.rank ?? null } : null,
    blitz: blitz ? { record: blitz.record ?? null, rank: blitz.rank ?? null } : null,
    lines40: _40l ? { record: _40l.record ?? null, rank: _40l.rank ?? null } : null,
    achievements: achievements ?? null,
    latest,
  };

  return cleanProfile;
}

/**
 * Fetch user achievements hanya
 */
export async function fetchTetrioAchievements(userId = "") {
  if (!userId) throw new Error("userId is required");
  
  const url = `${TETRIO_API}/users/${userId}/summaries/achievements`;
  const data = await proxyGet(url);
  
  if (!data.success) {
    throw new Error(data.error?.message || "Failed fetching achievements");
  }
  
  return data.data ?? [];
}

/**
 * Fetch achievement info with details including icon
 */
export async function fetchAchievementInfo(achievementId) {
  if (!achievementId) throw new Error("achievementId is required");
  
  const url = `${TETRIO_API}/achievements/${achievementId}`;
  const data = await proxyGet(url);
  
  if (!data.success) {
    throw new Error(data.error?.message || "Failed fetching achievement info");
  }
  
  return data.data;
}

/**
 * Get achievement icon URL
 */
export function getAchievementIconUrl(achievementId) {
  if (!achievementId) return null;
  return `https://tetr.io/res/achievements/${achievementId}.png`;
}

/**
 * Fetch league summary dengan detail lengkap
 */
export async function fetchTetrioLeague(userId = "") {
  if (!userId) throw new Error("userId is required");
  
  const url = `${TETRIO_API}/users/${userId}/summaries/league`;
  const data = await proxyGet(url);
  
  if (!data.success) {
    throw new Error(data.error?.message || "Failed fetching league data");
  }
  
  const league = data.data;
  return {
    rank: league.rank,
    bestrank: league.bestrank ?? null,
    tr: typeof league.tr === "number" ? Number(league.tr.toFixed(2)) : null,
    glicko: league.glicko ?? null,
    gxe: league.gxe ?? null,
    rd: league.rd ?? null,
    decaying: league.decaying ?? false,
    standing: league.standing ?? null,
    standing_local: league.standing_local ?? null,
    percentile: league.percentile ?? null,
    percentile_rank: league.percentile_rank ?? null,
    gamesplayed: league.gamesplayed ?? null,
    gameswon: league.gameswon ?? null,
    apm: league.apm ?? null,
    pps: league.pps ?? null,
    vs: league.vs ?? null,
    next_rank: league.next_rank ?? null,
    prev_rank: league.prev_rank ?? null,
    next_at: league.next_at ?? null,
    prev_at: league.prev_at ?? null,
    past_seasons: league.past ?? {},
  };
}

/**
 * Fetch personal records for a specific game mode
 */
export async function fetchPersonalRecords(userId, gameMode) {
  if (!userId) throw new Error("userId is required");
  if (!gameMode) throw new Error("gameMode is required");
  
  const url = `${TETRIO_API}/users/${userId}/summaries/${gameMode}`;
  const data = await proxyGet(url);
  
  if (!data.success) {
    throw new Error(data.error?.message || `Failed fetching ${gameMode} records`);
  }
  
  return data.data;
}

/**
 * Fetch historical league data
 */
export async function fetchHistoricalLeagueData(userId) {
  if (!userId) throw new Error("userId is required");
  
  const url = `${TETRIO_API}/users/${userId}/summaries/league`;
  const data = await proxyGet(url);
  
  if (!data.success) {
    throw new Error(data.error?.message || "Failed fetching historical league data");
  }
  
  return data.data.past ?? {};
}

/**
 * Get achievement medal color by tier
 */
export function getAchievementMedalColor(tier) {
  if (!tier) return "gray";
  const t = tier.toLowerCase();
  if (t === "diamond") return "cyan";
  if (t === "platinum") return "slate";
  if (t === "gold") return "yellow";
  if (t === "silver") return "gray";
  if (t === "bronze") return "orange";
  return "gray";
}

/**
 * Determine achievement tier from score and cutoffs
 */
export function getAchievementTier(score, cutoffs) {
  if (!cutoffs) return null;
  
  const s = Number(score);
  
  if (cutoffs.diamond !== undefined && (cutoffs.diamond === null || s >= cutoffs.diamond)) {
    return "diamond";
  }
  if (cutoffs.platinum !== undefined && (cutoffs.platinum === null || s >= cutoffs.platinum)) {
    return "platinum";
  }
  if (cutoffs.gold !== undefined && (cutoffs.gold === null || s >= cutoffs.gold)) {
    return "gold";
  }
  if (cutoffs.silver !== undefined && (cutoffs.silver === null || s >= cutoffs.silver)) {
    return "silver";
  }
  if (cutoffs.bronze !== undefined && (cutoffs.bronze === null || s >= cutoffs.bronze)) {
    return "bronze";
  }
  
  return null;
}

/* small helpers */
function secondsToHuman(sec = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.floor(sec)}s`;
}

function relativeTime(isoTs) {
  try {
    const t = new Date(isoTs);
    const diff = Math.floor((Date.now() - t.getTime()) / 1000);
    const days = Math.floor(diff / 86400);
    if (days >= 365) return `${Math.floor(days / 365)} years ago`;
    if (days >= 30) return `${Math.floor(days / 30)} months ago`;
    if (days >= 7) return `${Math.floor(days / 7)} weeks ago`;
    if (days > 0) return `${days} days ago`;
    const hours = Math.floor(diff / 3600);
    if (hours > 0) return `${hours} hours ago`;
    const minutes = Math.floor(diff / 60);
    if (minutes > 0) return `${minutes} minutes ago`;
    return `just now`;
  } catch (e) {
    return null;
  }
}