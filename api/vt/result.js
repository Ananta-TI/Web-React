import fetch from "node-fetch";

export default async function handler(req, res) {
  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    return res.status(500).json({ error: "VT_API_KEY missing" });
  }

  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Missing id parameter" });
  }

  const response = await fetch(
    `https://www.virustotal.com/api/v3/analyses/${id}`,
    {
      headers: { "x-apikey": VT_KEY },
    }
  );

  const data = await response.json();
  return res.status(response.status).json(data);
}
