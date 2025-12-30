// File: /api/vt/metadata/[type].js

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, id } = req.query; // Akan diisi dari URL, contoh: /api/vt/metadata/files?sha256=...
  const VT_KEY = process.env.VT_API_KEY;

  if (!VT_KEY) {
    return res.status(500).json({ error: "Konfigurasi server tidak lengkap (VT_API_KEY hilang)." });
  }

  const allowedTypes = ['files', 'urls', 'domains', 'ip_addresses'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Tipe tidak valid. Gunakan: files, urls, domains, ip_addresses" });
  }

  try {
    const response = await fetch(
      `https://www.virustotal.com/api/v3/${type}/${encodeURIComponent(id)}`,
      { headers: { "x-apikey": VT_KEY } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Error dari VirusTotal: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(`❌ Gagal mengambil metadata untuk ${type}/${id}:`, err.message);
    return res.status(500).json({ error: err.message });
  }
}