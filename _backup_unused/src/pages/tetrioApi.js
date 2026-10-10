async function tetrioGet(path) {
  const res = await fetch(`/api/tetrio?path=${encodeURIComponent(path)}`);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.error || `TETR.IO HTTP ${res.status}`);
  }

  return json;
}

async function tetrioGetSafe(path) {
  try {
    return await tetrioGet(path);
  } catch (err) {
    return {
      success: false,
      error: err.message || "Request failed",
      data: null,
    };
  }
}

function getPayload(json) {
  if (!json?.success) return null;
  return json.data?.user ?? json.data ?? null;
}

export async function fetchTetrioProfile(userId = "") {
  if (!userId) throw new Error("userId is required");

  const endpoints = {
    user: `users/${userId}`,
    league: `users/${userId}/summaries/league`,
    zenith: `users/${userId}/summaries/zenith`,
    zenithex: `users/${userId}/summaries/zenithex`,
    blitz: `users/${userId}/summaries/blitz`,
    lines40: `users/${userId}/summaries/40l`,
    zen: `users/${userId}/summaries/zen`,
    achievements: `users/${userId}/summaries/achievements`,
    scoreflow40l: `labs/scoreflow/${userId}/40l`,
    scoreflowBlitz: `labs/scoreflow/${userId}/blitz`,
    scoreflowZenith: `labs/scoreflow/${userId}/zenith`,
    scoreflowZen: `labs/scoreflow/${userId}/zen`,
  };

  const entries = await Promise.all(
    Object.entries(endpoints).map(async ([key, path]) => {
      const value = await tetrioGetSafe(path);
      return [key, value];
    })
  );

  const data = Object.fromEntries(entries);

  if (!data.user?.success) {
    throw new Error(data.user?.error?.message || data.user?.error || "Failed fetching user");
  }

  const user = getPayload(data.user);
  const league = getPayload(data.league);
  const zenith = getPayload(data.zenith);
  const zenithex = getPayload(data.zenithex);
  const blitz = getPayload(data.blitz);
  const lines40 = getPayload(data.lines40);
  const zen = getPayload(data.zen);
  const achievementsRaw = getPayload(data.achievements);

  const achievements = Array.isArray(achievementsRaw)
    ? achievementsRaw
    : achievementsRaw?.achievements || [];

  const gamesplayed = user?.gamesplayed ?? null;
  const gameswon = user?.gameswon ?? null;

  const winrate =
    gamesplayed > 0 ? Number(((gameswon / gamesplayed) * 100).toFixed(1)) : null;

  const sprintStats =
    lines40?.record?.results?.stats || lines40?.record?.endcontext || {};

  const sprintTime =
    sprintStats.finaltime || sprintStats.finalTime || lines40?.record?.time || null;

  const blitzStats = blitz?.record?.results?.stats || blitz?.record?.endcontext || {};
  const blitzScore = blitzStats.score || blitz?.record?.score || null;

  const qpCurrentAlt = zenith?.record?.results?.stats?.zenith?.altitude ?? 0;
  const qpCareerAlt = zenith?.best?.record?.results?.stats?.zenith?.altitude ?? 0;
  const qpHighestAlt = Math.max(qpCurrentAlt, qpCareerAlt);

  const zenStats = zen
    ? {
        level: zen.level,
        score: zen.score,
        levelProgress: zen.level ? (zen.level % 1) * 100 : 0,
      }
    : null;

  const processScoreflow = (scoreflow) => {
    const payload = getPayload(scoreflow);

    if (!payload?.points) {
      return {
        pbCount: 0,
        totalRecords: 0,
        avgScore: 0,
      };
    }

    const points = payload.points;
    const pbCount = points.filter((p) => p[1] === 1).length;
    const totalRecords = points.length;

    const avgScore =
      totalRecords > 0
        ? points.reduce((sum, p) => sum + Number(p[2] || 0), 0) / totalRecords
        : 0;

    return {
      pbCount,
      totalRecords,
      avgScore,
    };
  };

  return {
    id: user?._id,
    username: user?.username,
    role: user?.role,
    country: user?.country,
    avatar: user?.avatar_revision
      ? `https://tetr.io/user-content/avatars/${user._id}.jpg?rv=${user.avatar_revision}`
      : null,
    badges: user?.badges || [],
    xp: user?.xp ?? null,
    join_relative: user?.ts ? relativeTime(user.ts) : null,
    play_time_readable: user?.gametime >= 0 ? secondsToHuman(user.gametime) : null,

    gamesplayed,
    gameswon,
    winrate,
    supporter: Boolean(user?.supporter),
    achievementCount: achievements.length,
    achievements,

    stats: {
      totalGamesPlayed: gamesplayed,
      totalGamesWon: gameswon,
      winrate,
      totalPlaytime: user?.gametime,
      xp: user?.xp,
      rank: user?.role,
      leagueGamesPlayed: league?.gamesplayed ?? 0,
      leagueGamesWon: league?.gameswon ?? 0,
      leagueWinrate:
        league?.gamesplayed > 0
          ? Number(((league.gameswon / league.gamesplayed) * 100).toFixed(1))
          : 0,
      achievementCount: achievements.length,
      achievementRating: user?.ar ?? 0,
      globalRank: league?.standing ?? -1,
      countryRank: league?.standing_local ?? -1,
      percentileRank: league?.percentile_rank ?? 1,
    },

    scoreflowStats: {
      lines40: processScoreflow(data.scoreflow40l),
      blitz: processScoreflow(data.scoreflowBlitz),
      zenith: processScoreflow(data.scoreflowZenith),
      zen: processScoreflow(data.scoreflowZen),
    },

    league: league
      ? {
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
        }
      : null,

    zen: zenStats,

    quickplay: zenith
      ? {
          rank: zenith.rank ?? -1,
          displayValue: qpHighestAlt,
          careerBest: qpCareerAlt,
          currentAlt: qpCurrentAlt,
          record: zenith.record,
          best: zenith.best,
        }
      : null,

    expertqp: zenithex
      ? {
          displayValue:
            zenithex.record?.results?.stats?.zenith?.altitude ??
            zenithex.best?.record?.results?.stats?.zenith?.altitude ??
            0,
          rank: zenithex.rank !== -1 ? zenithex.rank : zenithex.best?.rank ?? -1,
          record: zenithex.record,
          best: zenithex.best,
        }
      : null,

    lines40: lines40
      ? {
          rank: lines40.rank,
          time: sprintTime,
          finesse: sprintStats.finesse?.faults,
          kpp: sprintStats.kpp,
          pps: sprintStats.pps ? Number(sprintStats.pps).toFixed(2) : null,
          apm: sprintStats.apm ? Number(sprintStats.apm).toFixed(2) : null,
          lines: sprintStats.lines,
        }
      : null,

    blitz: blitz
      ? {
          rank: blitz.rank,
          score: blitzScore,
          sps: blitzScore ? Math.round(blitzScore / 120) : null,
          quads: blitzStats.clears?.quads || blitzStats.quads,
          finesse: blitzStats.finesse?.faults,
          apm: blitzStats.apm ? Number(blitzStats.apm).toFixed(2) : null,
          pps: blitzStats.pps ? Number(blitzStats.pps).toFixed(2) : null,
        }
      : null,

    scoreflows: {
      lines40: getPayload(data.scoreflow40l),
      blitz: getPayload(data.scoreflowBlitz),
      zenith: getPayload(data.scoreflowZenith),
      zen: getPayload(data.scoreflowZen),
    },
  };
}

export async function fetchHistoricalLeagueData(userId) {
  if (!userId) throw new Error("userId is required");

  const json = await tetrioGetSafe(`users/${userId}/summaries/league`);
  const data = getPayload(json);

  return data?.past ?? {};
}

export async function fetchLeagueFlow(userId) {
  if (!userId) throw new Error("userId is required");

  const json = await tetrioGetSafe(`labs/leagueflow/${userId}`);
  return getPayload(json);
}

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

    return "recently";
  } catch {
    return null;
  }
}

export function formatTime(milliseconds) {
  if (!milliseconds) return "—";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(2, "0")}`;
}