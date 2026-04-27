export default async function handler(req, res) {
  const API_KEY = process.env.WAKATIME_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key tidak ada" });
  }

  try {
    const auth = Buffer.from(API_KEY).toString("base64");

    const [allTimeRes, last7Res] = await Promise.all([
      fetch("https://wakatime.com/api/v1/users/current/all_time_since_today", {
        headers: { Authorization: `Basic ${auth}` },
      }),
      fetch("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
        headers: { Authorization: `Basic ${auth}` },
      }),
    ]);

    const allTime = await allTimeRes.json();
    const last7 = await last7Res.json();

    return res.status(200).json({
      data: {
        human_readable_total: allTime.data.text,
        human_readable_daily_average: last7.data.human_readable_daily_average,
        best_day: last7.data.best_day,
        languages: last7.data.languages,
        editors: last7.data.editors,
      },
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}