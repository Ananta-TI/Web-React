// File: /api/vt/advanced/[...path].js
// FIXED VERSION - Proper dynamic routing dan error handling

import axios from 'axios';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    // Extract path from query
    const { path, ...queryParams } = req.query;

    if (!path || path.length === 0) {
      return res.status(400).json({ 
        error: 'Path is required',
        example: '/api/vt/advanced/files/[hash]/behaviour_mitre_trees'
      });
    }

    // Convert path array to string
    const vtPath = Array.isArray(path) ? path.join('/') : path;
    const url = `https://www.virustotal.com/api/v3/${vtPath}`;

    console.log(`[Advanced] ${req.method} ${vtPath}`);

    // Build axios config
    const config = {
      method: req.method.toLowerCase(),
      url: url,
      headers: {
        'x-apikey': VT_KEY,
        'accept': 'application/json',
        'content-type': req.headers['content-type'] || 'application/json'
      },
      params: queryParams || {},
      timeout: 30000
    };

    // Add body if not GET/DELETE
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.body) {
      config.data = typeof req.body === 'string' 
        ? JSON.parse(req.body) 
        : req.body;
    }

    // Make request to VT
    const response = await axios(config);

    return res.status(response.status).json({
      success: true,
      data: response.data.data || response.data
    });

  } catch (err) {
    console.error('[Advanced Error]:', err.message);

    // Handle axios errors
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({ 
        error: 'Invalid API key' 
      });
    }

    if (err.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Resource not found' 
      });
    }

    if (err.response) {
      return res.status(err.response.status).json({
        error: 'VirusTotal API error',
        status: err.response.status,
        details: err.response.data
      });
    }

    return res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
}