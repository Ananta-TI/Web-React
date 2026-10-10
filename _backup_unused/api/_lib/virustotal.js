import { getErrorMessage } from "./http.js";

const VT_BASE_URL = "https://www.virustotal.com/api/v3";

function requireApiKey() {
  const apiKey = process.env.VT_API_KEY || process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    throw new Error("VT_API_KEY belum dikonfigurasi di Environment Variables Vercel.");
  }
  return apiKey;
}

function messageFromPayload(payload, status) {
  return (
    payload?.error?.message ||
    payload?.message ||
    `VirusTotal mengembalikan HTTP ${status}.`
  );
}

function parseRetryAfter(value) {
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds);

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 1000));
  }

  return 0;
}

export async function vtRequest(path, options = {}, timeoutMs = 30_000) {
  const apiKey = requireApiKey();
  const headers = new Headers(options.headers || {});
  headers.set("x-apikey", apiKey);
  headers.set("Accept", "application/json");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${VT_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const raw = await response.text();
    let payload = null;

    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { raw };
      }
    }

    if (!response.ok) {
      const error = new Error(messageFromPayload(payload, response.status));
      error.status = response.status;
      error.payload = payload;
      error.retryAfter = parseRetryAfter(response.headers.get("retry-after"));
      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("VirusTotal tidak merespons sebelum batas waktu habis.");
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function apiStatus(error, fallback = 500) {
  const status = Number(error?.status);
  if (status >= 400 && status <= 599) return status;
  return fallback;
}

export function sendVtError(res, error, fallbackStatus, fallbackMessage) {
  const retryAfter = Number(error?.retryAfter || 0);
  if (retryAfter > 0) res.setHeader("Retry-After", String(retryAfter));

  return res.status(apiStatus(error, fallbackStatus)).json({
    error: getErrorMessage(error, fallbackMessage),
    ...(retryAfter > 0 ? { retryAfter } : {}),
  });
}
