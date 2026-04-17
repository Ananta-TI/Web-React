// File: /api/vt/metadata/[type].js
// FIXED VERSION - Proper error handling dan CORS

export default async function handler(req, res) {
  // Set comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract type and id from query parameters
    const { type, id } = req.query;
    const VT_KEY = process.env.VT_API_KEY;

    // Validasi
    if (!VT_KEY) {
      console.error('VT_API_KEY missing');
      return res.status(500).json({ 
        error: 'VT_API_KEY not configured on server',
        details: 'Server configuration error'
      });
    }

    if (!type || !id) {
      return res.status(400).json({ 
        error: 'type and id parameters required' 
      });
    }

    // Map type ke endpoint yang benar
    const typeMap = {
      'file': 'files',
      'files': 'files',
      'url': 'urls',
      'urls': 'urls',
      'domain': 'domains',
      'domains': 'domains',
      'ip': 'ip_addresses',
      'ip_address': 'ip_addresses',
      'ip_addresses': 'ip_addresses'
    };

    const mappedType = typeMap[type?.toLowerCase()];
    if (!mappedType) {
      return res.status(400).json({ 
        error: `Invalid type: ${type}. Allowed: file, url, domain, ip` 
      });
    }

    const url = `https://www.virustotal.com/api/v3/${mappedType}/${encodeURIComponent(id)}`;

    console.log(`[Metadata] Fetching ${mappedType}/${id}`);

    const response = await fetch(url, {
      headers: { 
        'x-apikey': VT_KEY,
        'accept': 'application/json'
      },
      timeout: 30000
    });

    // Handle different response statuses
    if (response.status === 404) {
      return res.status(404).json({ 
        error: `${mappedType} not found in VirusTotal database`,
        id: id
      });
    }

    if (response.status === 401 || response.status === 403) {
      console.error('VT API Key invalid or expired');
      return res.status(401).json({ 
        error: 'API key invalid or expired' 
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`VT API error: ${response.status}`, errorData);
      return res.status(response.status).json({ 
        error: `VirusTotal API error: ${response.status}`,
        details: errorData 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('[Metadata Error]:', err.message);
    return res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
}