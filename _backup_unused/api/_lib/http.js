const buckets = new Map();

export function setCommonHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  res.status(405).json({ error: `Method ${req.method} tidak diizinkan.` });
  return false;
}

export function requireSameOrigin(req, res) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!origin || !host) return true;

  try {
    if (new URL(origin).host === host) return true;
  } catch {
    // Fall through to rejection.
  }

  res.status(403).json({ error: "Origin request tidak diizinkan." });
  return false;
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

// Best-effort in-memory limiter. Use a distributed store such as Redis/Upstash
// when consistent rate limiting across multiple function instances is required.
export function rateLimit(req, res, { key = "default", limit = 30, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(req)}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  if (current.count <= limit) return true;

  res.setHeader("Retry-After", Math.max(1, Math.ceil((current.resetAt - now) / 1000)));
  res.status(429).json({ error: "Terlalu banyak request. Coba lagi sebentar." });
  return false;
}

export function getErrorMessage(error, fallback = "Terjadi kesalahan pada server.") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error.message === "string" && error.message.trim()) return error.message;
  return fallback;
}
