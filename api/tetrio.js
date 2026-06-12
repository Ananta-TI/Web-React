const TETRIO_BASE = "https://ch.tetr.io/api";
const REQUEST_TIMEOUT = 10000;

function isSafePath(path) {
  if (!path) return false;
  if (path.includes("..")) return false;
  if (path.includes("http://")) return false;
  if (path.includes("https://")) return false;

  return /^(users|labs)\/[a-zA-Z0-9_.-]+(\/[a-zA-Z0-9_.-]+)*$/.test(path);
}

async function fetchTetrio(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${TETRIO_BASE}/${path}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "ananta-activity-card/1.0",
      },
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    return {
      status: res.status,
      data: json,
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  try {
    const path = String(req.query.path || "").trim();

    if (!isSafePath(path)) {
      return res.status(400).json({
        success: false,
        error: "Path TETR.IO tidak valid.",
      });
    }

    const result = await fetchTetrio(path);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(result.status).json(result.data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "TETR.IO API failed.",
    });
  }
}