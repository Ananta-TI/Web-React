export default async function handler(req, res) {
  const API_KEY = process.env.WAKATIME_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key tidak ada" });
  }

  try {
    const auth = Buffer.from(API_KEY).toString("base64");

    const response = await fetch(
      "https://wakatime.com/api/v1/users/current/stats/last_7_days",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}