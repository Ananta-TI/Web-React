import { allowMethods, rateLimit, setCommonHeaders } from "../_lib/http.js";
import { sendVtError, vtRequest } from "../_lib/virustotal.js";

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("URL wajib diisi.");

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(candidate);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("Scanner hanya menerima URL HTTP atau HTTPS.");
  }

  return url.toString();
}

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["POST"])) return;
  if (!rateLimit(req, res, { key: "vt-url-scan", limit: 15, windowMs: 60_000 })) return;

  try {
    const normalizedUrl = normalizeUrl(req.body?.url);
    const body = new URLSearchParams({ url: normalizedUrl });

    const payload = await vtRequest("/urls", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    return res.status(200).json({
      data: payload.data,
      normalizedUrl,
    });
  } catch (error) {
    return sendVtError(res, error, 400, "Scan URL gagal dimulai.");
  }
}
