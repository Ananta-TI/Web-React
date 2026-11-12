import axios from "axios";

/**
 * WakaTime API
 *
 * PENTING: sejak 2025 WakaTime mengubah API key menjadi "write-only"
 * (hanya untuk plugin yang mengirim heartbeat). Untuk membaca statistik
 * (endpoint /users/current/...), WakaTime sekarang MENOLAK API key dengan:
 *   403 "API Keys are only for plugins, use your personal oauth token instead."
 *
 * Solusi: pakai OAuth token pribadi.
 *   1. Login ke https://wakatime.com
 *   2. Buka https://wakatime.com/oauth  → copy token-nya
 *   3. Simpan sebagai WAKATIME_OAUTH_TOKEN
 *
 * Token lama (WAKATIME_API_KEY) tetap dibaca sebagai fallback supaya
 * environment lama tidak langsung rusak, TAPI akan tetap 403 kalau
 * isinya API key plugin (bukan OAuth token). Pesan error di bawah
 * menjelaskan hal itu secara eksplisit.
 */

const WAKATIME_API = "https://wakatime.com/api/v1";

function resolveToken() {
  const candidates = [
    process.env.WAKATIME_OAUTH_TOKEN,
    process.env.WAKATIME_ACCESS_TOKEN,
    process.env.WAKATIME_API_KEY,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function describeUpstreamError(reason) {
  const status = reason?.response?.status;
  const raw = reason?.response?.data;

  if (status === 401 || status === 403) {
    const message =
      typeof raw === "string"
        ? raw
        : raw?.error || raw?.errors?.[0] || "Unauthorized";

    return {
      status: 401,
      error:
        "WakaTime menolak kredensial (API key bersifat write-only). " +
        "Isi WAKATIME_OAUTH_TOKEN dengan OAuth token dari https://wakatime.com/oauth",
      upstream: message,
    };
  }

  return {
    status: 502,
    error:
      reason?.response?.data?.error ||
      reason?.message ||
      "Gagal mengambil data dari WakaTime",
  };
}

export default async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = resolveToken();

  if (!token) {
    return res.status(500).json({
      error:
        "WAKATIME_OAUTH_TOKEN belum diset. Ambil OAuth token di https://wakatime.com/oauth lalu simpan sebagai environment variable.",
    });
  }

  const client = axios.create({
    baseURL: WAKATIME_API,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  // allSettled: kalau satu endpoint gagal, yang lain tetap ditampilkan.
  const [allTime, last7] = await Promise.allSettled([
    client.get("/users/current/all_time_since_today"),
    client.get("/users/current/stats/last_7_days"),
  ]);

  const allTimeData =
    allTime.status === "fulfilled" ? allTime.value.data?.data : null;
  const last7Data =
    last7.status === "fulfilled" ? last7.value.data?.data : null;

  if (!allTimeData && !last7Data) {
    const reason =
      allTime.status === "rejected" ? allTime.reason : last7.reason;
    const { status, error, upstream } = describeUpstreamError(reason);

    console.error("WakaTime API Error:", upstream || error);

    return res.status(status).json({ error, upstream });
  }

  // "text" = total sejak akun dibuat (human readable).
  // Fallback ke "digital" kalau "text" tidak ada.
  const totalAllTime =
    allTimeData?.text || allTimeData?.digital || "0 hrs";

  return res.status(200).json({
    data: {
      total_all_time: totalAllTime,
      total_7_days: last7Data?.human_readable_total || "0 hrs",
      daily_average: last7Data?.human_readable_daily_average || "0 hrs",
      best_day: last7Data?.best_day || null,
      languages: last7Data?.languages || [],
      editors: last7Data?.editors || [],
      // true kalau sebagian data gagal diambil (mis. stats butuh scope read_stats)
      partial: !allTimeData || !last7Data,
    },
  });
}
