import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.query;
  const VT_KEY = process.env.VT_API_KEY;

  if (!query) {
    return res.status(400).json({ error: "Query parameter required" });
  }

  try {
    const response = await axios.get(
      "https://www.virustotal.com/api/v3/search",
      {
        params: { query: query },
        headers: { "x-apikey": VT_KEY },
      }
    );
    return res.status(200).json(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Not found in VT database" });
    }
    return res.status(500).json({ error: err.message });
  }
}