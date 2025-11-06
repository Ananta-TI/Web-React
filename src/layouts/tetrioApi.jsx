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
    _40l: `${TETRIO_API}/users/${userId}/summaries/40l`
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
  const zen = data.zenith.success ? data.zenith.data : null;
  const blitz = data.blitz.success ? data.blitz.data : null;
  const _40l = data._40l.success ? data._40l.data : null;

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
  if (zen?.best?.record?.alt) {
    latest.push({
      type: "quickplay_pb",
      text: `New Quick Play PB: ${zen.best.record.alt} m`,
      meta: { alt: zen.best.record.alt, when: zen.best.record?.ts },
    });
  } else if (zen?.record?.alt) {
    latest.push({
      type: "quickplay_recent",
      text: `Quick Play last: ${zen.record.alt} m`,
      meta: { alt: zen.record.alt, when: zen.record?.ts },
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

  const cleanProfile = {
    id: u._id,
    username: u.username,
    country: u.country,
    avatar: u.avatar_revision
      ? `https://tetr.io/user-content/avatars/${u._id}.jpg?rv=${u.avatar_revision}`
      : null,
    xp: u.xp ?? null,
    join_ts: u.ts ?? null,
    join_relative: u.ts ? relativeTime(u.ts) : null, // helper below
    play_time_seconds: u.gametime >= 0 ? u.gametime : null,
    play_time_readable: u.gametime >= 0 ? secondsToHuman(u.gametime) : null,
    gamesplayed: gamesplayed,
    gameswon: gameswon,
    winrate: winrate,
    friend_count: u.friend_count ?? null,
    supporter: !!u.supporter,
    // league
    league: league
      ? {
          rank: league.rank,
          tr: typeof league.tr === "number" ? Number(league.tr.toFixed(2)) : null,
          glicko: league.glicko ?? null,
          rd: league.rd ?? null,
          standing: league.standing ?? null,
          gamesplayed: league.gamesplayed ?? null,
          gameswon: league.gameswon ?? null,
          apm: league.apm ?? null,
          pps: league.pps ?? null,
          vs: league.vs ?? null,
          percentile: league.percentile ?? null,
        }
      : null,
    // summaries / pbs
    quickplay: zen ? { record: zen.record ?? null, best: zen.best ?? null, rank: zen.rank ?? null } : null,
    blitz: blitz ? { record: blitz.record ?? null, rank: blitz.rank ?? null } : null,
    lines40: _40l ? { record: _40l.record ?? null, rank: _40l.rank ?? null } : null,
    latest,
  };

  return cleanProfile;
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
