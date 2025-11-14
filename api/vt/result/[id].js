export default async function handler(req, res) {
  console.log("🔍 Fetching result for ID:", req.query.id);  // Tambah log
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const VT_KEY = process.env.VT_API_KEY;
  if (!VT_KEY) {
    return res.status(500).json({ error: "VT_API_KEY missing" });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing ID" });

    const response = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${id}`,
      { headers: { "x-apikey": VT_KEY } }
    );
 console.log("📡 VT Response status:", response.status);  // Tambah log
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
