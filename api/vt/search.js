// File: api/vt/search.js
import axios from 'axios';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    return res.status(500).json({ error: 'VT_API_KEY missing' });
  }

  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    const response = await axios.get(
      'https://www.virustotal.com/api/v3/search',
      {
        params: { query },
        headers: { 'x-apikey': VT_KEY },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('VT SEARCH ERROR:', err.response?.data || err.message);
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Not found in VT database' });
    }
    return res.status(500).json({ error: err.message });
  }
}