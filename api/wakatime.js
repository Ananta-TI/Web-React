const WAKATIME_BASE = "https://wakatime.com/api/v1";

async function wakaGet(path, apiKey) {
  const auth = Buffer.from(`${apiKey}:`).toString("base64");

  const res = await fetch(`${WAKATIME_BASE}${path}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(json?.error || `WakaTime HTTP ${res.status}`);
  }

  return json;
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.WAKATIME_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "WAKATIME_API_KEY belum diset.",
      });
    }

    const [allTime, last7Days, languages, editors, os] = await Promise.allSettled([
      wakaGet("/users/current/all_time_since_today", apiKey),
      wakaGet("/users/current/stats/last_7_days", apiKey),
      wakaGet("/users/current/stats/last_7_days", apiKey),
      wakaGet("/users/current/stats/last_7_days", apiKey),
      wakaGet("/users/current/stats/last_7_days", apiKey),
    ]);

    const stats = last7Days.status === "fulfilled" ? last7Days.value?.data : null;

    return res.status(200).json({
      allTime: allTime.status === "fulfilled" ? allTime.value?.data : null,
      last7Days: stats,
      languages: stats?.languages || [],
      editors: stats?.editors || [],
      operatingSystems: stats?.operating_systems || [],
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || "WakaTime API failed.",
    });
  }
}