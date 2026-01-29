// wakatime.js (backend)
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

app.get('/api/wakatime', async (req, res) => {
  const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;

  if (!WAKATIME_API_KEY) {
    return res.status(500).json({ error: "API Key belum disetting di .env" });
  }

  try {
    // Get all-time stats
    const allTimeResponse = await axios.get("https://wakatime.com/api/v1/users/current/all_time_since_today", {
      headers: {
        Authorization: `Basic ${Buffer.from(WAKATIME_API_KEY).toString("base64")}`,
      },
    });

    // Get last 7 days stats for language and editor breakdowns
    const last7DaysResponse = await axios.get("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
      headers: {
        Authorization: `Basic ${Buffer.from(WAKATIME_API_KEY).toString("base64")}`,
      },
    });

    // Combine the data
    const combinedData = {
      data: {
        // Use all-time stats for total time
        human_readable_total: allTimeResponse.data.data.text,
        human_readable_daily_average: allTimeResponse.data.data.text, // You might want to calculate this differently
        best_day: last7DaysResponse.data.data.best_day,
        // Use last 7 days for language and editor breakdowns
        languages: last7DaysResponse.data.data.languages,
        editors: last7DaysResponse.data.data.editors
      }
    };

    res.json(combinedData);
    
  } catch (error) {
    console.error("WakaTime API Error:", error);
    const errorMessage = error.response?.data?.message || error.message;
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});