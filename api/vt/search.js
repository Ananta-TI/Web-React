// File: /api/vt/search.js
// FIXED VERSION - Proper search handling dan error management

import axios from 'axios';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache search results for 1 hour

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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
    const { query, limit = 10 } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: 'Query parameter required',
        example: '?query=example.com'
      });
    }

    console.log(`[Search] Query: ${query}`);

    // Search in VirusTotal
    const response = await axios.get(
      'https://www.virustotal.com/api/v3/search',
      {
        params: { 
          query: query.trim(),
          limit: Math.min(parseInt(limit) || 10, 40) // Max 40
        },
        headers: { 
          'x-apikey': VT_KEY,
          'accept': 'application/json'
        },
        timeout: 30000
      }
    );

    // Handle response
    if (!response.data?.data) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No results found'
      });
    }

    const results = Array.isArray(response.data.data) 
      ? response.data.data 
      : [response.data.data];

    console.log(`[Search] Found ${results.length} results`);

    // Format results
    const formattedResults = results.map(item => ({
      id: item.id,
      type: item.type,
      attributes: {
        meaningful_name: item.attributes?.meaningful_name || item.id,
        last_analysis_date: item.attributes?.last_analysis_date,
        last_analysis_stats: item.attributes?.last_analysis_stats || {
          malicious: 0,
          suspicious: 0,
          undetected: 0,
          harmless: 0
        },
        reputation: item.attributes?.reputation || 0,
        // URL specific
        url: item.attributes?.url,
        // File specific
        sha256: item.attributes?.sha256,
        size: item.attributes?.size,
        // Domain/IP specific
        categories: item.attributes?.categories
      }
    }));

    return res.status(200).json({
      success: true,
      data: formattedResults,
      count: formattedResults.length
    });

  } catch (err) {
    console.error('[Search Error]:', err.message);

    // Handle axios errors
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(401).json({ 
        error: 'Invalid API key' 
      });
    }

    if (err.response?.status === 404) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No results found'
      });
    }

    return res.status(500).json({ 
      error: 'Search failed',
      message: err.message 
    });
  }
}