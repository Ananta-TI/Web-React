export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, id } = req.query;
  const VT_KEY = process.env.VT_API_KEY;

  const allowedTypes = ['files', 'urls', 'domains', 'ip_addresses'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  try {
    const axios = require("axios");
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/${type}/${encodeURIComponent(id)}`,
      {
        headers: { "x-apikey": VT_KEY },
      }
    );
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}