import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import cors from "cors";
// IMPORT BARU
import multer from "multer";
import FormData from "form-data";

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Multer (Simpan file di memori sementara)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 } // Limit 32MB (Batas standar VT Public API)
});
// -------------------------------------------
// 1. SCAN URL (Active Scan)
// -------------------------------------------
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
    console.log("VT SCAN ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------
// 2. GET SCAN RESULT (Check Status)
// -------------------------------------------
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
    console.log("VT RESULT ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------
// 3. SEARCH (IP, Domain, File Hash) - NEW!
// -------------------------------------------
app.get("/api/vt/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query parameter required" });
    }

    // Menggunakan axios untuk GET request ke endpoint Search VT
    const response = await axios.get(
      "https://www.virustotal.com/api/v3/search",
      {
        params: { query: query }, // axios otomatis menangani URL encoding
        headers: {
          "x-apikey": process.env.VT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("VT SEARCH ERROR:", err.response?.data || err.message);
    
    // Handle specific error codes if needed
    if (err.response?.status === 404) {
        return res.status(404).json({ error: "Not found in VT database" });
    }
    
    res.status(500).json({ error: err.message });
  }
});
// -------------------------------------------
// 4. SCAN FILE (Upload File) - NEW!
// -------------------------------------------
app.post("/api/vt/scan-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Siapkan form-data untuk dikirim ke VirusTotal
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await axios.post(
      "https://www.virustotal.com/api/v3/files",
      formData,
      {
        headers: {
          "x-apikey": process.env.VT_API_KEY,
          ...formData.getHeaders(), // Penting: Header multipart boundaries
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("VT FILE ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------
// 5. GET OBJECT METADATA (Detail Lengkap) - NEW!
// -------------------------------------------
// type bisa: 'files', 'urls', 'domains', 'ip_addresses'
app.get("/api/vt/metadata/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Validasi type agar aman
    const allowedTypes = ['files', 'urls', 'domains', 'ip_addresses'];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }

    // Request ke VT API untuk detail object
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/${type}/${encodeURIComponent(id)}`,
      {
        headers: { "x-apikey": process.env.VT_API_KEY },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("VT METADATA ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () =>
  console.log("Local VT API running at http://localhost:5000")
);