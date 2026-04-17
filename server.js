import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// VT CLIENT
// ==========================================
const vtClient = axios.create({
  baseURL: "https://www.virustotal.com/api/v3",
  timeout: 30000,
  headers: {
    "x-apikey": process.env.VT_API_KEY,
    Accept: "application/json",
  },
});

// ==========================================
// MULTER (file upload to memory)
// ==========================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 650 * 1024 * 1024 }, // 650MB
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/api", (req, res) => {
  res.json({
    message: "VirusTotal Scanner API Active",
    status: "ok",
    vt_api_configured: !!process.env.VT_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ROUTE: POST /api/vt/scan  (URL scan)
// ==========================================
app.post("/api/vt/scan", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try { new URL(url); } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const response = await vtClient.post(
      "/urls",
      new URLSearchParams({ url }),
      { headers: { "content-type": "application/x-www-form-urlencoded" } }
    );

    const data = response.data;
    return res.json({
      success: true,
      data: {
        id: data.data.id,
        type: "url",
        url,
        attributes: { status: data.data.attributes?.status || "queued" },
      },
    });
  } catch (err) {
    console.error("[Scan Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// ROUTE: POST /api/vt/scan-file  (file scan)
// ==========================================
app.post("/api/vt/scan-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await vtClient.post("/files", formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 300000,
    });

    const data = response.data;
    return res.json({
      success: true,
      data: {
        id: data.data.id,
        type: "file",
        filename: req.file.originalname,
        size: req.file.size,
        attributes: { status: data.data.attributes?.status || "queued" },
      },
    });
  } catch (err) {
    console.error("[File Scan Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// ROUTE: GET /api/vt/result/:id  (poll analysis)
// ==========================================
app.get("/api/vt/result/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Analysis ID required" });

    const response = await vtClient.get(`/analyses/${id}`);
    const data = response.data;

    return res.json({
      success: true,
      data: {
        id: data.data.id,
        type: data.data.type,
        attributes: {
          status: data.data.attributes.status,
          stats: data.data.attributes.stats || {},
          results: data.data.attributes.results || {},
          date: data.data.attributes.date,
          url: data.data.attributes.url,
          sha256: data.data.attributes.sha256,
        },
      },
      meta: data.meta || {},
    });
  } catch (err) {
    console.error("[Result Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// ROUTE: GET /api/vt/metadata/:type?id=...
// ==========================================
const VT_TYPE_MAP = {
  file: "files",
  files: "files",
  url: "urls",
  urls: "urls",
  domain: "domains",
  domains: "domains",
  ip: "ip_addresses",
  ip_address: "ip_addresses",
  ip_addresses: "ip_addresses",
};

app.get("/api/vt/metadata/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: "id query param required" });

    const vtType = VT_TYPE_MAP[type?.toLowerCase()];
    if (!vtType)
      return res.status(400).json({ error: `Invalid type: ${type}` });

    const response = await vtClient.get(
      `/${vtType}/${encodeURIComponent(id)}`
    );
    return res.json(response.data);
  } catch (err) {
    console.error("[Metadata Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// ROUTE: GET /api/vt/search?query=...
// ==========================================
app.get("/api/vt/search", async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    if (!query) return res.status(400).json({ error: "query param required" });

    const response = await vtClient.get("/search", {
      params: {
        query: query.trim(),
        limit: Math.min(parseInt(limit) || 10, 40),
      },
    });

    const results = Array.isArray(response.data.data)
      ? response.data.data
      : response.data.data
      ? [response.data.data]
      : [];

    return res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.json({ success: true, data: [], count: 0 });
    }
    console.error("[Search Error]", err.message);
    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// UNIVERSAL VT PROXY
// Handles: /api/vt/files/:hash/behaviour_summary
//          /api/vt/urls/:id
//          /api/vt/domains/:domain
//          /api/vt/ip_addresses/:ip
//          /api/vt/files/upload_url
//          etc.
// MUST be last - catches everything else
// ==========================================
app.all(/^\/api\/vt\/(.*)/, async (req, res) => {
  try {
    const vtPath = "/" + req.params[0]; // hasil dari (.*)

    const response = await vtClient({
      method: req.method,
      url: vtPath,
      params: Object.keys(req.query).length ? req.query : undefined,
      data:
        req.method !== "GET" && req.method !== "DELETE"
          ? req.body
          : undefined,
      headers: {
        ...(req.headers["content-type"] && {
          "content-type": req.headers["content-type"],
        }),
      },
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error(`[Proxy Error] ${req.method} ${req.path}`, err.message);

    res
      .status(err.response?.status || 500)
      .json(err.response?.data || { error: err.message });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 VT API Gateway running at http://localhost:${PORT}`);
  console.log(`VT API Key configured: ${!!process.env.VT_API_KEY}`);
});