import { allowMethods, rateLimit, setCommonHeaders } from "../../../server/scanner/http.js";
import { sendVtError, vtRequest } from "../../../server/scanner/virustotal.js";

// Koleksi VirusTotal yang boleh diakses lewat proxy generik ini.
// Base URL sudah dikunci ke https://www.virustotal.com/api/v3 di vtRequest,
// jadi allowlist ini hanya memastikan path yang diteruskan valid.
const ALLOWED_ROOTS = new Set([
  "urls",
  "files",
  "domains",
  "ip_addresses",
  "analyses",
  "graphs",
]);

const SAFE_SEGMENT = /^[A-Za-z0-9._~%-]+$/;

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (!allowMethods(req, res, ["GET"])) return;
  if (!rateLimit(req, res, { key: "vt-advanced", limit: 60, windowMs: 60_000 })) return;

  const rawPath = req.query?.path;
  const segments = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];

  if (segments.length === 0) {
    return res.status(400).json({ error: "Path VirusTotal wajib diisi." });
  }

  if (segments.some((seg) => seg === ".." || seg === "." || !SAFE_SEGMENT.test(seg))) {
    return res.status(400).json({ error: "Path VirusTotal tidak valid." });
  }

  if (!ALLOWED_ROOTS.has(String(segments[0]).toLowerCase())) {
    return res.status(400).json({ error: "Jenis resource VirusTotal tidak didukung." });
  }

  // Teruskan query string lain (mis. ?limit=, ?relationships=) ke VirusTotal.
  const forwardParams = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => forwardParams.append(key, String(v)));
    } else if (value !== undefined) {
      forwardParams.append(key, String(value));
    }
  }

  const vtPath = `/${segments.map((seg) => encodeURIComponent(seg)).join("/")}`;
  const queryString = forwardParams.toString();
  const target = queryString ? `${vtPath}?${queryString}` : vtPath;

  try {
    const payload = await vtRequest(target, { method: "GET" });
    return res.status(200).json(payload);
  } catch (error) {
    return sendVtError(res, error, 500, "Gagal mengambil intelligence VirusTotal.");
  }
}
