// File: /api/test.js
// FIXED VERSION - Comprehensive test endpoint

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const VT_KEY = process.env.VT_API_KEY;
  const isVTKeySet = !!VT_KEY;
  const keyPreview = isVTKeySet 
    ? `${VT_KEY.substring(0, 10)}...${VT_KEY.substring(VT_KEY.length - 5)}`
    : 'NOT SET';

  // Test VT API connectivity if key is set
  let vtStatus = {
    connected: false,
    message: 'API Key not configured'
  };

  if (isVTKeySet) {
    try {
      const testResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'GET',
        headers: {
          'x-apikey': VT_KEY,
          'accept': 'application/json'
        },
        timeout: 5000
      });

      if (testResponse.status === 401 || testResponse.status === 403) {
        vtStatus = {
          connected: false,
          message: 'API Key invalid or expired',
          status: testResponse.status
        };
      } else if (testResponse.ok) {
        vtStatus = {
          connected: true,
          message: 'API Key valid and connected',
          status: testResponse.status
        };
      } else {
        vtStatus = {
          connected: false,
          message: `Unexpected status: ${testResponse.status}`,
          status: testResponse.status
        };
      }
    } catch (err) {
      vtStatus = {
        connected: false,
        message: `Connection error: ${err.message}`
      };
    }
  }

  return res.status(200).json({
    message: '✅ API Test Active',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'production',
      vercelEnv: process.env.VERCEL_ENV || 'unknown'
    },
    vt_api: {
      configured: isVTKeySet,
      key_preview: keyPreview,
      status: vtStatus
    },
    api_endpoints: {
      'POST /api/vt/scan': 'Scan URL - Body: { url: string }',
      'POST /api/vt/scan-file': 'Scan File - FormData: { file: File }',
      'GET /api/vt/result/[id]': 'Get Analysis Result',
      'GET /api/vt/metadata/[type]?id=[id]': 'Get Metadata - Types: file, url, domain, ip',
      'GET /api/vt/search?query=[query]': 'Search in VT Database',
      'GET /api/vt/advanced/[...path]': 'Advanced API Access'
    },
    health: {
      api_up: true,
      vt_accessible: vtStatus.connected
    }
  });
}