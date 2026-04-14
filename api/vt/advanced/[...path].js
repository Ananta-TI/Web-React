import axios from 'axios';

export default async function handler(req, res) {
  // CORS Handling (Jika diperlukan di Vercel)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vercel menangkap path dinamis sebagai array
  // Contoh: ['files', '12345', 'behaviour_mitre_trees']
  const { path, ...queryParams } = req.query;
  
  if (!path) {
    return res.status(400).json({ error: "Path is required" });
  }

  // Gabungkan array menjadi string URL yang valid untuk VT
  const vtPath = Array.isArray(path) ? path.join('/') : path;
  const url = `https://www.virustotal.com/api/v3/${vtPath}`;

  try {
    // Siapkan konfigurasi dinamis yang menyesuaikan GET/POST
    const config = {
      method: req.method,
      url: url,
      headers: {
        "x-apikey": process.env.VT_API_KEY,
        "content-type": req.headers["content-type"] || "application/json",
      },
      params: queryParams, // Membawa parameter query (misal ?limit=10)
      ...(req.method !== 'GET' && { data: req.body }) // Membawa body jika POST
    };

    const response = await axios(config);
    res.status(200).json(response.data);
    
  } catch (err) {
    console.error(`[VT Advanced Proxy Error] ${vtPath}:`, err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: err.message });
  }
}