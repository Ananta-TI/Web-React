import axios from "axios";

export default async function handler(req, res) {
  // Gunakan variabel WAKATIME_API_KEY (tanpa VITE_) untuk backend
  const API_KEY = process.env.WAKATIME_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key tidak ditemukan di Environment Variables" });
  }

  try {
    // WakaTime Basic Auth membutuhkan format base64(api_key:)
    const auth = Buffer.from(`${API_KEY}:`).toString("base64");

    const [allTimeRes, last7Res] = await Promise.all([
      axios.get("https://wakatime.com/api/v1/users/current/all_time_since_today", {
        headers: { Authorization: `Basic ${auth}` },
      }),
      axios.get("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
        headers: { Authorization: `Basic ${auth}` },
      }),
    ]);

    // Memastikan kunci data (keys) sesuai dengan yang diharapkan frontend
    return res.status(200).json({
      data: {
        total_all_time: allTimeRes.data.data.text,
        total_7_days: last7Res.data.data.human_readable_total,
        daily_average: last7Res.data.data.human_readable_daily_average,
        best_day: last7Res.data.data.best_day,
        languages: last7Res.data.data.languages,
        editors: last7Res.data.data.editors,
      },
    });

  } catch (err) {
    console.error("WakaTime API Error:", err.response?.data || err.message);
    return res.status(500).json({ error: err.message });
  }
}