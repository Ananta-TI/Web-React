// tetrioApi.js - EXTENDED COMPLEX VERSION
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
    zenithex: `${TETRIO_API}/users/${userId}/summaries/zenithex`,
    blitz: `${TETRIO_API}/users/${userId}/summaries/blitz`,
    _40l: `${TETRIO_API}/users/${userId}/summaries/40l`,
    zen: `${TETRIO_API}/users/${userId}/summaries/zen`,
    achievements: `${TETRIO_API}/users/${userId}/summaries/achievements`,
    // ✅ EXTENDED: Tambah scoreflow untuk tracking progression
    scoreflow_40l: `${TETRIO_API}/labs/scoreflow/${userId}/40l`,
    scoreflow_blitz: `${TETRIO_API}/labs/scoreflow/${userId}/blitz`,
    scoreflow_zenith: `${TETRIO_API}/labs/scoreflow/${userId}/zenith`,
    scoreflow_zen: `${TETRIO_API}/labs/scoreflow/${userId}/zen`,
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
  const zenithex = data.zenithex.success ? data.zenithex.data : null;
  const blitz = data.blitz.success ? data.blitz.data : null;
  const _40l = data._40l.success ? data._40l.data : null;
  const achievements = data.achievements.success ? data.achievements.data : null;

  // Scoreflow data
  const scoreflow_40l = data.scoreflow_40l.success ? data.scoreflow_40l.data : null;
  const scoreflow_blitz = data.scoreflow_blitz.success ? data.scoreflow_blitz.data : null;
  const scoreflow_zenith = data.scoreflow_zenith.success ? data.scoreflow_zenith.data : null;
  const scoreflow_zen = data.scoreflow_zen.success ? data.scoreflow_zen.data : null;

  const gamesplayed = u.gamesplayed ?? null;
  const gameswon = u.gameswon ?? null;
  const winrate = gamesplayed > 0 ? Number(((gameswon / gamesplayed) * 100).toFixed(1)) : null;

  // 40L Stats
  const sprintStats = _40l?.record?.results?.stats || _40l?.record?.endcontext || {};
  const sprintTime = sprintStats.finaltime || sprintStats.finalTime || _40l?.record?.time;

  // Blitz Stats
  const blitzStats = blitz?.record?.results?.stats || blitz?.record?.endcontext || {};
  const blitzScore = blitzStats.score || blitz?.record?.score;

  // ✅ Quick Play - altitude di results.stats.zenith.altitude
  const qpCurrentAlt = zenith?.record?.results?.stats?.zenith?.altitude ?? 0;
  const qpCareerAlt = zenith?.best?.record?.results?.stats?.zenith?.altitude ?? 0;
  const qpHighestAlt = Math.max(qpCurrentAlt, qpCareerAlt);

  // Zen Mode Stats
  const zenStats = zen_mode ? {
    level: zen_mode.level,
    score: zen_mode.score,
    levelProgress: (zen_mode.level % 1) * 100, // Progress ke level berikutnya
  } : null;

  // ✅ Advanced Stats Calculation
  const stats = {
    totalGamesPlayed: gamesplayed,
    totalGamesWon: gameswon,
    winrate: winrate,
    totalPlaytime: u.gametime,
    xp: u.xp,
    rank: u.role,
    // League stats
    leagueGamesPlayed: league?.gamesplayed ?? 0,
    leagueGamesWon: league?.gameswon ?? 0,
    leagueWinrate: league?.gamesplayed > 0 ? ((league?.gameswon / league?.gamesplayed) * 100).toFixed(1) : 0,
    // Achievement stats
    achievementCount: achievements ? achievements.length : 0,
    achievementRating: u.ar ?? 0,
    // Ranking
    globalRank: league?.standing ?? -1,
    countryRank: league?.standing_local ?? -1,
    percentileRank: league?.percentile_rank ?? 1,
  };

  // ✅ Scoreflow processing - extract PBs count
  const processScoreflow = (scoreflow) => {
    if (!scoreflow || !scoreflow.points) return { pbCount: 0, totalRecords: 0, avgScore: 0 };
    const pbCount = scoreflow.points.filter(p => p[1] === 1).length;
    const totalRecords = scoreflow.points.length;
    const avgScore = scoreflow.points.length > 0 
      ? scoreflow.points.reduce((sum, p) => sum + p[2], 0) / scoreflow.points.length 
      : 0;
    return { pbCount, totalRecords, avgScore };
  };

  const scoreflowStats = {
    _40l: processScoreflow(scoreflow_40l),
    blitz: processScoreflow(scoreflow_blitz),
    zenith: processScoreflow(scoreflow_zenith),
    zen: processScoreflow(scoreflow_zen),
  };

  return {
    // User info
    id: u._id,
    username: u.username,
    role: u.role,
    country: u.country,
    avatar: u.avatar_revision ? `https://tetr.io/user-content/avatars/${u._id}.jpg?rv=${u.avatar_revision}` : null,
    badges: u.badges || [],
    xp: u.xp ?? null,
    join_relative: u.ts ? relativeTime(u.ts) : null,
    play_time_readable: u.gametime >= 0 ? secondsToHuman(u.gametime) : null,
    
    // Overall stats
    gamesplayed,
    gameswon,
    winrate,
    supporter: !!u.supporter,
    stats,
    scoreflowStats,
    achievementCount: achievements ? achievements.length : 0,
    achievements,
    
    // League
    league: league ? {
      rank: league.rank,
      bestrank: league.bestrank ?? null,
      tr: typeof league.tr === "number" ? Number(league.tr.toFixed(2)) : null,
      glicko: league.glicko ?? null,
      percentile_rank: league.percentile_rank ?? null,
      apm: league.apm ?? null,
      pps: league.pps ?? null,
      vs: league.vs ?? null,
      gamesplayed: league.gamesplayed ?? 0,
      gameswon: league.gameswon ?? 0,
      standing: league.standing ?? -1,
      standing_local: league.standing_local ?? -1,
      past: league.past ?? {},
    } : null,
    
    // Zen Mode
    zen: zenStats,
    
    // Quick Play
    quickplay: zenith ? {
      rank: zenith.rank ?? -1,
      displayValue: qpHighestAlt,
      careerBest: qpCareerAlt,
      currentAlt: qpCurrentAlt,
      record: zenith.record,
      best: zenith.best,
    } : null,

    // Expert QP
    expertqp: zenithex ? {
      displayValue: zenithex.record?.results?.stats?.zenith?.altitude ?? 
                   zenithex.best?.record?.results?.stats?.zenith?.altitude ?? 0,
      rank: zenithex.rank !== -1 ? zenithex.rank : (zenithex.best?.rank ?? -1),
      record: zenithex.record,
      best: zenithex.best,
    } : null,

    // 40 Lines
    lines40: _40l ? {
      rank: _40l.rank,
      time: sprintTime,
      finesse: sprintStats.finesse?.faults,
      kpp: sprintStats.kpp,
      pps: sprintStats.pps ? parseFloat(sprintStats.pps).toFixed(2) : null,
      apm: sprintStats.apm ? parseFloat(sprintStats.apm).toFixed(2) : null,
      lines: sprintStats.lines,
    } : null,

    // Blitz
    blitz: blitz ? {
      rank: blitz.rank,
      score: blitzScore,
      sps: blitzScore ? Math.round(blitzScore / 120) : null,
      quads: blitzStats.clears?.quads || blitzStats.quads,
      finesse: blitzStats.finesse?.faults,
      apm: blitzStats.apm ? parseFloat(blitzStats.apm).toFixed(2) : null,
      pps: blitzStats.pps ? parseFloat(blitzStats.pps).toFixed(2) : null,
    } : null,
    
    // Scoreflow data
    scoreflows: {
      _40l: scoreflow_40l,
      blitz: scoreflow_blitz,
      zenith: scoreflow_zenith,
      zen: scoreflow_zen,
    },
  };
}

export async function fetchHistoricalLeagueData(userId) {
  if (!userId) throw new Error("userId is required");
  const url = `${TETRIO_API}/users/${userId}/summaries/league`;
  const data = await proxyGet(url);
  if (!data.success) throw new Error(data.error?.message || "Failed fetching historical league data");
  return data.data.past ?? {};
}

export async function fetchLeagueFlow(userId) {
  if (!userId) throw new Error("userId is required");
  const url = `${TETRIO_API}/labs/leagueflow/${userId}`;
  try {
    const data = await proxyGet(url);
    if (!data.success) return null;
    return data.data;
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