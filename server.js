import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/vt/scan", async (req, res) => {
  try {
    const { url } = req.body;

    const response = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      new URLSearchParams({ url }),
      {
        headers: {
          "x-apikey": process.env.VT_API_KEY,
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("VT ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/vt/result/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${req.params.id}`,
      {
        headers: { "x-apikey": process.env.VT_API_KEY },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("VT ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () =>
  console.log("Local VT API running at http://localhost:5000")
);
