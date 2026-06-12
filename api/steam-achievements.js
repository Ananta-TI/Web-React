const STEAM_BASE = "https://api.steampowered.com";
const REQUEST_TIMEOUT = 10000;

function normalizeSteamIds(value) {
  return String(value || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

async function steamGet(path, params = {}) {
  const key = process.env.STEAM_API_KEY;

  if (!key) {
    throw new Error("STEAM_API_KEY belum diset.");
  }

  const url = new URL(`${STEAM_BASE}${path}`);

  Object.entries({
    key,
    format: "json",
    ...params,
  }).forEach(([paramKey, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(paramKey, String(value));
    }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
      return null;
    }

    return json;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  try {
    const steamIds = normalizeSteamIds(req.query.steamids);
    const appid = String(req.query.appid || "").trim();

    if (!appid) {
      return res.status(400).json({
        found: false,
        error: "appid wajib diisi.",
      });
    }

    if (steamIds.length === 0) {
      return res.status(400).json({
        found: false,
        error: "steamids wajib diisi.",
      });
    }

    for (const steamid of steamIds) {
      const json = await steamGet("/ISteamUserStats/GetPlayerAchievements/v1/", {
        steamid,
        appid,
      });

      const achievements = json?.playerstats?.achievements;

      if (Array.isArray(achievements) && achievements.length > 0) {
        const cur = achievements.filter((item) => item.achieved === 1).length;
        const tot = achievements.length;

        return res.status(200).json({
          found: true,
          cur,
          tot,
          pct: Math.round((cur / tot) * 100),
          achievements,
        });
      }
    }

    return res.status(200).json({
      found: false,
    });
  } catch (err) {
    return res.status(200).json({
      found: false,
      error: err.message || "Achievement request failed.",
    });
  }
}