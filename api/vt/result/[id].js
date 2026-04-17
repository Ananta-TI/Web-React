// File: /api/vt/result/[id].js
// FIXED VERSION - Proper status handling dan response format

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    console.error('VT_API_KEY not configured');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'VT_API_KEY not set'
    });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Analysis ID required' });
    }

    console.log(`[Result] Fetching analysis: ${id}`);

    // Fetch analysis result from VirusTotal
    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: { 
          'x-apikey': VT_KEY,
          'accept': 'application/json'
        },
        timeout: 30000
      }
    );

    // Handle VT response
    if (response.status === 404) {
      return res.status(404).json({ 
        error: 'Analysis not found',
        id: id 
      });
    }

    if (response.status === 401 || response.status === 403) {
      console.error('VT API Key invalid');
      return res.status(401).json({ 
        error: 'Invalid API key' 
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`VT API error: ${response.status}`, errorText);
      return res.status(response.status).json({ 
        error: `VirusTotal error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();

    // Validate response
    if (!data?.data?.attributes) {
      console.error('Unexpected response structure:', data);
      return res.status(500).json({ 
        error: 'Invalid response from VirusTotal' 
      });
    }

    // Return enriched response
    const result = {
      success: true,
      data: {
        id: data.data.id,
        type: data.data.type,
        attributes: {
          status: data.data.attributes.status,
          stats: data.data.attributes.stats || {
            malicious: 0,
            suspicious: 0,
            undetected: 0,
            harmless: 0
          },
          results: data.data.attributes.results || {},
          date: data.data.attributes.date,
          url: data.data.attributes.url,
          // For file analysis
          sha256: data.data.attributes.sha256,
          // For domain/ip analysis
          last_dns_records: data.data.attributes.last_dns_records,
          categories: data.data.attributes.categories
        }
      },
      meta: data.meta || {}
    };

    console.log(`[Result] Status: ${result.data.attributes.status}`);

    return res.status(200).json(result);

  } catch (err) {
    console.error('[Result Error]:', err.message);
    return res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
}