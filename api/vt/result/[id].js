// File: /api/vt/result/[id].js

export default async function handler(req, res) {
  // 🔥 TAMBAHKAN HEADER INI UNTUK MEMAKSA BROWSER MENGAMBIL DATA TERBARU
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    console.error("❌ VT_API_KEY tidak ditemukan di environment variables Vercel!");
    return res.status(500).json({ error: "Konfigurasi server tidak lengkap (VT_API_KEY hilang)." });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing ID" });

    console.log(`🔍 Mencari hasil scan dengan ID: ${id}`);

    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      { headers: { "x-apikey": VT_KEY } }
    );

    console.log(`📡 Respons dari VirusTotal: ${response.status}`);

    // Jika VirusTotal memberikan error, kita juga harus memberikan error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error dari VirusTotal: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `Gagal menghubungi VirusTotal (Status: ${response.status})`,
        details: errorText 
      });
    }

    const data = await response.json();
    console.log("✅ Berhasil mendapatkan data dari VirusTotal");
    
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Terjadi error di server:", err.message);
    return res.status(500).json({ error: "Terjadi kesalahan internal server.", detail: err.message });
  }
}