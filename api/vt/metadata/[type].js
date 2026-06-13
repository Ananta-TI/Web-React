import { allowMethods, rateLimit, setCommonHeaders } from "../../_lib/http.js";
import { sendVtError, vtRequest } from "../../_lib/virustotal.js";

const TYPE_MAP = {
  file: "files",
  files: "files",
  url: "urls",
  urls: "urls",
  domain: "domains",
  domains: "domains",
  ip: "ip_addresses",
  "ip-address": "ip_addresses",
  ip_addresses: "ip_addresses",
};

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["GET"])) return;
  if (!rateLimit(req, res, { key: "vt-metadata", limit: 60, windowMs: 60_000 })) return;

  const endpoint = TYPE_MAP[String(req.query?.type || "").toLowerCase()];
  const id = String(req.query?.id || "").trim();

  if (!endpoint) return res.status(400).json({ error: "Jenis metadata tidak didukung." });
  if (!id) return res.status(400).json({ error: "ID metadata wajib diisi melalui query ?id=..." });

  try {
    const payload = await vtRequest(`/${endpoint}/${encodeURIComponent(id)}`, { method: "GET" });
    return res.status(200).json(payload);
  } catch (error) {
    return sendVtError(res, error, 500, "Gagal mengambil metadata.");
  }
}
