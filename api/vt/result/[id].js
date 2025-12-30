// File: api/vt/result/[id].js
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
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    const response = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      {
        headers: { 'x-apikey': VT_KEY },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.error('VT RESULT ERROR:', err.response?.data || err.message);
    return res.status(500).json({ error: err.message });
  }
}