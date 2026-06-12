const STEAM_BASE = "https://api.steampowered.com";
const REQUEST_TIMEOUT = 10_000;

function steamUrl(path, params = {}) {
  const url = new URL(`${STEAM_BASE}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function fetchJson(url, fallback = null) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `HTTP ${res.status}`,
        data: fallback,
      };
    }

    const text = await res.text();
    const json = text ? JSON.parse(text) : fallback;

    return {
      ok: true,
      status: res.status,
      error: null,
      data: json,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message || "Request failed",
      data: fallback,
    };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeSteamIds(value) {
  return String(value || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export default async function handler(req, res) {
  try {
    const key = process.env.STEAM_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "STEAM_API_KEY belum diset di Environment Variables.",
      });
    }

    const steamIds = normalizeSteamIds(req.query.steamids);

    if (steamIds.length === 0) {
      return res.status(400).json({
        error: "Query steamids wajib diisi. Contoh: /api/steam?steamids=7656119...",
      });
    }

    const mainId = steamIds[0];

    const [profileResult, badgeResult, friendResults, ownedResults, recentResults] =
      await Promise.all([
        fetchJson(
          steamUrl("/ISteamUser/GetPlayerSummaries/v0002/", {
            key,
            steamids: mainId,
            format: "json",
          }),
          { response: { players: [] } }
        ),

        fetchJson(
          steamUrl("/IPlayerService/GetBadges/v1/", {
            key,
            steamid: mainId,
            format: "json",
          }),
          { response: { player_level: 0 } }
        ),

        Promise.all(
          steamIds.map((id) =>
            fetchJson(
              steamUrl("/ISteamUser/GetFriendList/v0001/", {
                key,
                steamid: id,
                relationship: "friend",
                format: "json",
              }),
              { friendslist: { friends: [] } }
            )
          )
        ),

        Promise.all(
          steamIds.map((id) =>
            fetchJson(
              steamUrl("/IPlayerService/GetOwnedGames/v0001/", {
                key,
                steamid: id,
                include_appinfo: "true",
                include_played_free_games: "true",
                format: "json",
              }),
              { response: { games: [] } }
            )
          )
        ),

        Promise.all(
          steamIds.map((id) =>
            fetchJson(
              steamUrl("/IPlayerService/GetRecentlyPlayedGames/v0001/", {
                key,
                steamid: id,
                format: "json",
              }),
              { response: { games: [] } }
            )
          )
        ),
      ]);

    const profile = profileResult.data?.response?.players?.[0] || null;

    if (!profile) {
      return res.status(404).json({
        error: "Steam profile tidak ditemukan atau request ditolak Steam.",
      });
    }

    const uniqueFriendIds = new Set();

    friendResults.forEach((result) => {
      const friends = result.data?.friendslist?.friends || [];
      friends.forEach((friend) => {
        if (friend?.steamid) uniqueFriendIds.add(friend.steamid);
      });
    });

    const friendIds = Array.from(uniqueFriendIds);
    let friendProfiles = [];

    if (friendIds.length > 0) {
      const ids = friendIds.slice(0, 80).join(",");

      const friendProfileResult = await fetchJson(
        steamUrl("/ISteamUser/GetPlayerSummaries/v0002/", {
          key,
          steamids: ids,
          format: "json",
        }),
        { response: { players: [] } }
      );

      friendProfiles = friendProfileResult.data?.response?.players || [];
    }

    const gameMap = new Map();
    const recentMap = new Map();
    let playtimeTotal = 0;

    ownedResults.forEach((result) => {
      const games = result.data?.response?.games || [];

      games.forEach((game) => {
        const appid = game.appid;
        const playtime = Number(game.playtime_forever || 0);

        if (playtime > 0) playtimeTotal += playtime;

        const existing = gameMap.get(appid);

        if (existing) {
          existing.playtime_forever += playtime;
          existing.accounts += 1;
        } else {
          gameMap.set(appid, {
            ...game,
            playtime_forever: playtime,
            accounts: 1,
          });
        }
      });
    });

    recentResults.forEach((result) => {
      const games = result.data?.response?.games || [];

      games.forEach((game) => {
        const appid = game.appid;
        const recentPlaytime = Number(game.playtime_2weeks || 0);
        const existing = recentMap.get(appid);

        if (existing) {
          existing.playtime_2weeks += recentPlaytime;
          existing.playtime_forever += Number(game.playtime_forever || 0);
        } else {
          recentMap.set(appid, {
            ...game,
            playtime_2weeks: recentPlaytime,
            playtime_forever: Number(game.playtime_forever || 0),
          });
        }
      });
    });

    const allGames = Array.from(gameMap.values()).sort(
      (a, b) => b.playtime_forever - a.playtime_forever
    );

    const recent = Array.from(recentMap.values()).sort(
      (a, b) => b.playtime_2weeks - a.playtime_2weeks
    );

    return res.status(200).json({
      profile,
      realName: profile.realname || "",
      level: badgeResult.data?.response?.player_level || 0,
      friends: uniqueFriendIds.size,
      friendsCount: uniqueFriendIds.size,
      friendProfiles,
      total: gameMap.size,
      playtimeTotal,
      games: allGames.slice(0, 20),
      allGames,
      recent: recent.slice(0, 10),
      failed: {
        profile: profileResult.ok === false ? profileResult.error : null,
        badges: badgeResult.ok === false ? badgeResult.error : null,
        friends: friendResults.filter((r) => !r.ok).length,
        owned: ownedResults.filter((r) => !r.ok).length,
        recent: recentResults.filter((r) => !r.ok).length,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "Steam API failed.",
    });
  }
}