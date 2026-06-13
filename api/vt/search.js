import { allowMethods, rateLimit, setCommonHeaders } from "../_lib/http.js";
import { sendVtError, vtRequest } from "../_lib/virustotal.js";

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["GET"])) return;
  if (!rateLimit(req, res, { key: "vt-search", limit: 30, windowMs: 60_000 })) return;

  const query = String(req.query?.query || "").trim();
  if (!query) return res.status(400).json({ error: "Hash, IP, domain, atau URL wajib diisi." });
  if (query.length > 2048) return res.status(400).json({ error: "Query terlalu panjang." });

  try {
    const params = new URLSearchParams({ query, limit: "5" });
    const payload = await vtRequest(`/search?${params.toString()}`, { method: "GET" });

    // Return raw objects. The old endpoint manually rebuilt attributes and
    // accidentally threw away last_analysis_results, which made the vendor
    // list look empty even when VirusTotal had data.
    return res.status(200).json({
      data: Array.isArray(payload.data) ? payload.data : [],
      meta: payload.meta || null,
    });
  } catch (error) {
    return sendVtError(res, error, 500, "Pencarian VirusTotal gagal.");
  }
}
