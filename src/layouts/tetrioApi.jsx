// tetrioApi.js
const TETRIO_API = "https://ch.tetr.io/api";
const BASE_URL = "https://api.codetabs.com/v1/proxy?quest=";

async function proxyGet(url) {
  const res = await fetch(`${BASE_URL}${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function fetchTetrioProfile(userId = "") {
  if (!userId) throw new Error("userId is required");

  const endpoints = {
    user: `${TETRIO_API}/users/${userId}`,
    league: `${TETRIO_API}/users/${userId}/summaries/league`,
    zenith: `${TETRIO_API}/users/${userId}/summaries/zenith`,
    blitz: `${TETRIO_API}/users/${userId}/summaries/blitz`,
    _40l: `${TETRIO_API}/users/${userId}/summaries/40l`,
    zen: `${TETRIO_API}/users/${userId}/summaries/zen`,
    achievements: `${TETRIO_API}/users/${userId}/summaries/achievements`,
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

  if (!data.user.success) throw new Error(data.user.error?.message || "Failed fetching user");

  const u = data.user.data;
  const league = data.league.success ? data.league.data : null;
  const zen_mode = data.zen.success ? data.zen.data : null;
  const zenith = data.zenith.success ? data.zenith.data : null;
  const blitz = data.blitz.success ? data.blitz.data : null;
  const _40l = data._40l.success ? data._40l.data : null;
  const achievements = data.achievements.success ? data.achievements.data : null;

  const gamesplayed = typeof u.gamesplayed === "number" ? u.gamesplayed : null;
  const gameswon = typeof u.gameswon === "number" ? u.gameswon : null;
  const winrate = gamesplayed && gamesplayed > 0 && gameswon >= 0 ? Number(((gameswon / gamesplayed) * 100).toFixed(1)) : null;

  // Ekstraksi Data Mendalam yang Aman (Support API Baru 'results.stats' & API Lama 'endcontext')
  const sprintStats = _40l?.record?.results?.stats || _40l?.record?.endcontext || {};
  const blitzStats = blitz?.record?.results?.stats || blitz?.record?.endcontext || {};

  // Ambil nilai utama untuk records
  const sprintTime = sprintStats.finaltime || sprintStats.finalTime || _40l?.record?.time;
  const blitzScore = blitzStats.score || blitz?.record?.score;

  const latest = [];
  if (league?.rank) latest.push({ type: "rank", text: `Achieved ${league.rank.toUpperCase()} rank in Tetra League`, meta: { rank: league.rank, tr: league.tr } });
  if (zenith?.best?.record?.alt) latest.push({ type: "quickplay_pb", text: `New Quick Play PB: ${zenith.best.record.alt} m`, meta: { alt: zenith.best.record.alt } });
  if (blitzScore) latest.push({ type: "blitz_pb", text: `Blitz PB: ${Number(blitzScore).toLocaleString()} pts` });
  if (sprintTime) latest.push({ type: "40l_record", text: `40L Record Time: ${formatTime(parseFloat(sprintTime))}` });

  return {
    id: u._id,
    username: u.username,
    role: u.role,
    country: u.country,
    avatar: u.avatar_revision ? `https://tetr.io/user-content/avatars/${u._id}.jpg?rv=${u.avatar_revision}` : null,
    badges: u.badges || [],
    xp: u.xp ?? null,
    join_relative: u.ts ? relativeTime(u.ts) : null,
    play_time_readable: u.gametime >= 0 ? secondsToHuman(u.gametime) : null,
    gamesplayed,
    gameswon,
    winrate,
    supporter: !!u.supporter,
    league: league ? {
      rank: league.rank,
      bestrank: league.bestrank ?? null,
      tr: typeof league.tr === "number" ? Number(league.tr.toFixed(2)) : null,
      glicko: league.glicko ?? null,
      percentile_rank: league.percentile_rank ?? null,
      apm: league.apm ?? null,
      pps: league.pps ?? null,
      vs: league.vs ?? null,
    } : null,
    zen: zen_mode ? { level: zen_mode.level, score: zen_mode.score } : null,
    quickplay: zenith ? { record: zenith.record, rank: zenith.rank } : null,
    
    // Data mendalam untuk Sprint 40L
    lines40: _40l ? {
      rank: _40l.rank,
      time: sprintTime,
      finesse: sprintStats.finesse?.faults,
      kpp: sprintStats.kpp,
      pps: sprintStats.pps ? parseFloat(sprintStats.pps).toFixed(2) : null,
    } : null,

    // Data mendalam untuk Blitz
    blitz: blitz ? {
      rank: blitz.rank,
      score: blitzScore,
      sps: blitzScore ? Math.round(blitzScore / 120) : null, // Score per second (Blitz = 120s)
      quads: blitzStats.clears?.quads || blitzStats.quads,
      finesse: blitzStats.finesse?.faults,
    } : null,
    
    achievements,
    latest,
  };
}

export async function fetchHistoricalLeagueData(userId) {
  if (!userId) throw new Error("userId is required");
  const url = `${TETRIO_API}/users/${userId}/summaries/league`;
  const data = await proxyGet(url);
  if (!data.success) throw new Error(data.error?.message || "Failed fetching historical league data");
  return data.data.past ?? {};
}

// Tambahkan fungsi ini di bawah fetchHistoricalLeagueData
export async function fetchLeagueFlow(userId) {
  if (!userId) throw new Error("userId is required");
  const url = `${TETRIO_API}/labs/leagueflow/${userId}`;
  try {
    const data = await proxyGet(url);
    if (!data.success) return null;
    return data.data; // { startTime, points: [...] }
  } catch (e) {
    return null;
  }
}

// Helpers
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
    if (days > 0) return `${days} days ago`;
    return `recently`;
  } catch (e) { return null; }
}

export function formatTime(milliseconds) {
  if (!milliseconds) return "—";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}