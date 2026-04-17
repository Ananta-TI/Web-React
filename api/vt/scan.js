// File: /api/vt/scan.js
// FIXED VERSION - Proper URL validation dan response handling

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    console.error('VT_API_KEY missing');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'VT_API_KEY not set'
    });
  }

  try {
    // Get URL from body
    let url = req.body?.url;

    // If body is string (urlencoded), parse it
    if (typeof req.body === 'string') {
      const params = new URLSearchParams(req.body);
      url = params.get('url');
    }

    if (!url) {
      return res.status(400).json({ 
        error: 'URL parameter required',
        example: { url: 'https://example.com' }
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        url: url 
      });
    }

    console.log(`[Scan] Submitting URL: ${url}`);

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('url', url);

    // Submit to VirusTotal
    const response = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': VT_KEY,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      timeout: 30000
    });

    // Handle VT response
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

    // Validate response structure
    if (!data?.data?.id) {
      console.error('Unexpected VT response:', data);
      return res.status(500).json({ 
        error: 'Unexpected response format from VirusTotal',
        data: data 
      });
    }

    console.log(`[Scan] Analysis ID: ${data.data.id}`);

    return res.status(200).json({
      success: true,
      data: {
        id: data.data.id,
        type: 'url',
        url: url,
        attributes: {
          status: data.data.attributes?.status || 'queued'
        }
      }
    });

  } catch (err) {
    console.error('[Scan Error]:', err.message);
    return res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
}