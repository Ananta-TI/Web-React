// File: /api/vt/metadata/[type].js

export default async function handler(req, res) {
  // Set cache control headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get type and id from query parameters
  const { type, id } = req.query;
  const VT_KEY = process.env.VT_API_KEY;

  if (!VT_KEY) {
    return res.status(500).json({ error: "VT_API_KEY missing" });
  }

  const allowedTypes = ['files', 'urls', 'domains', 'ip_addresses'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    console.log(`🔍 Fetching metadata for type: ${type}, id: ${id}`);
    
    const response = await fetch(
      `https://www.virustotal.com/api/v3/${type}/${encodeURIComponent(id)}`,
      {
        headers: { "x-apikey": VT_KEY },
      }
    );
    
    console.log(`✅ Metadata received for ${type}/${id}`);
    return res.status(200).json(response.data);
  } catch (err) {
    console.error(`❌ Error fetching metadata for ${type}/${id}:`, err.message);
    
    if (err.response) {
      return res.status(err.response.status).json({ 
        error: `VirusTotal API error: ${err.response.status}`,
        details: err.response.data 
      });
    }
    
    return res.status(500).json({ error: err.message });
  }
}