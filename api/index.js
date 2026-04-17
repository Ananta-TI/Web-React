// File: /api/index.js
// FIXED VERSION - Proper health check

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isVTKeyConfigured = !!process.env.VT_API_KEY;

  return res.status(200).json({ 
    message: 'VirusTotal Scanner API Active',
    status: 'ok',
    endpoints: {
      scan_url: 'POST /api/vt/scan',
      scan_file: 'POST /api/vt/scan-file',
      get_result: 'GET /api/vt/result/[id]',
      get_metadata: 'GET /api/vt/metadata/[type]?id=[id]',
      search: 'GET /api/vt/search?query=[query]',
      advanced: 'GET/POST /api/vt/advanced/[...path]'
    },
    vt_api_configured: isVTKeyConfigured,
    timestamp: new Date().toISOString()
  });
}