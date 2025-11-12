import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS configuration - allow both local and production
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://ananta-ti.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

const VT_KEY = process.env.VT_API_KEY;
if (!VT_KEY) {
  console.warn("⚠️ VirusTotal API key not found (VT_API_KEY)!");
} else {
  console.log("✅ VirusTotal API key loaded");
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "VirusTotal Scanner API",
    endpoints: {
      scan: "POST /api/vt/scan",
      result: "GET /api/vt/result/:id",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", apiKeyConfigured: !!VT_KEY });
});

// Submit URL for scanning
app.post("/api/vt/scan", async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    if (!VT_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log(`📤 Scanning URL: ${url}`);

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
    
    if (!response.ok) {
      console.error("❌ VirusTotal error:", data);
      return res.status(response.status).json(data);
    }

    console.log(`✅ Analysis ID: ${data.data?.id}`);
    res.json({ id: data.data?.id });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// Get scan result
app.get("/api/vt/result/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!VT_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log(`📥 Fetching result for: ${id}`);

    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: { "x-apikey": VT_KEY },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ VirusTotal error:", data);
      return res.status(response.status).json(data);
    }

    const status = data?.data?.attributes?.status;
    console.log(`📊 Analysis status: ${status}`);

    res.json(data);
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Failed to get result", details: err.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server ready at http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});