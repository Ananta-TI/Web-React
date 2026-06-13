import { allowMethods, rateLimit, setCommonHeaders } from "../../../server/scanner/http.js";
import { sendVtError, vtRequest } from "../../../server/scanner/virustotal.js";

function getResource(analysis) {
  const attributes = analysis?.attributes || {};
  const meta = attributes.meta || {};

  const fileId = meta.file_info?.sha256 || meta.file_info?.sha1 || meta.file_info?.md5;
  if (fileId) {
    return { kind: "file", endpoint: "files", id: fileId };
  }

  const urlId = meta.url_info?.id;
  if (urlId) {
    return { kind: "url", endpoint: "urls", id: urlId };
  }

  return null;
}

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["GET"])) return;
  if (!rateLimit(req, res, { key: "vt-result", limit: 120, windowMs: 60_000 })) return;

  const id = String(req.query?.id || "").trim();
  if (!id) return res.status(400).json({ error: "Analysis ID tidak valid." });

  try {
    const payload = await vtRequest(`/analyses/${encodeURIComponent(id)}`, { method: "GET" });
    return res.status(200).json({
      ...payload,
      resource: getResource(payload.data),
    });
  } catch (error) {
    return sendVtError(res, error, 500, "Gagal mengambil hasil analisis.");
  }
}
