// File: /api/vt/result/[id].js

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    console.error("❌ VT_API_KEY tidak ditemukan!");
    return res.status(500).json({ error: "Konfigurasi server tidak lengkap (VT_API_KEY hilang)." });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing ID" });

    console.log(`🔍 Mencari hasil scan dengan ID: ${id}`);

    const vtResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      { headers: { "x-apikey": VT_KEY } }
    );

    if (!vtResponse.ok) {
      const errorText = await vtResponse.text();
      return res.status(vtResponse.status).json({ 
        error: `Gagal menghubungi VirusTotal (Status: ${vtResponse.status})`,
        details: errorText 
      });
    }

    const data = await vtResponse.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Terjadi error di server:", err.message);
    return res.status(500).json({ error: "Terjadi kesalahan internal server.", detail: err.message });
  }
}