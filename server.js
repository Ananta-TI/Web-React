import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit"; // <-- IMPORT

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Terapkan rate limiter ke semua rute API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Batasi setiap IP hingga 100 permintaan per 'window'
  message: "Terlalu banyak permintaan dari IP ini, coba lagi setelah 15 menit",
});
app.use("/api/", apiLimiter); // <-- GUNAKAN

// ... sisa kode Anda ...

const VT_KEY = process.env.VT_API_KEY;
if (!VT_KEY) console.warn("⚠️ VirusTotal API key not found (VT_API_KEY)!");

app.post("/api/vt/scan", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    const params = new URLSearchParams();
    params.append("url", url);

    const response = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "x-apikey": VT_KEY,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json({ id: data.data?.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/vt/result/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
      headers: { "x-apikey": VT_KEY },
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get result" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ready at http://localhost:${PORT}`));
