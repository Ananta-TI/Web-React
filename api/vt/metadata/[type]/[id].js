// File: /api/vt/metadata/[type].js

import axios from "axios";

export default async function handler(req, res) {
  // 🔥 TAMBAHKAN HEADER INI JUGA
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, id } = req.query; // Vercel akan mengisi ini dari URL, misal: /api/vt/metadata/files?...
  const VT_KEY = process.env.VT_API_KEY;

  if (!VT_KEY) {
    return res.status(500).json({ error: "Konfigurasi server tidak lengkap (VT_API_KEY hilang)." });
  }

  const allowedTypes = ['files', 'urls', 'domains', 'ip_addresses'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Tipe tidak valid. Gunakan: files, urls, domains, ip_addresses" });
  }

  try {
    console.log(`🔍 Mengambil metadata untuk tipe: ${type}, id: ${id}`);

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/${type}/${encodeURIComponent(id)}`,
      {
        headers: { "x-apikey": VT_KEY },
      }
    );

    console.log(`✅ Berhasil mendapatkan metadata untuk ${type}/${id}`);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error(`❌ Gagal mengambil metadata untuk ${type}/${id}:`, err.message);
    
    // Tangani error spesifik dari axios
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: `Error dari VirusTotal: ${err.response.status}`,
        details: err.response.data 
      });
    }
    
    return res.status(500).json({ error: err.message });
  }
}