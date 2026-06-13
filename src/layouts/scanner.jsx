import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { upload } from "@vercel/blob/client";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  AlertTriangle,
  BarChart2,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  Database,
  FileText,
  FileUp,
  Fingerprint,
  Globe,
  Hash,
  History,
  Info,
  Layers,
  ListFilter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Skull,
  Trash2,
  X,
} from "lucide-react";

import { ThemeContext } from "../context/ThemeContext";
import supabase from "../supabaseClient";

const MAX_FILE_SIZE = 32 * 1024 * 1024;
const MAX_HISTORY_ITEMS = 20;
const HISTORY_KEY = "scanHistory";
const HIDDEN_HISTORY_KEY = "scanHistoryHiddenIds";
const POLL_INTERVAL_MS = 4_000;
const MAX_POLL_ATTEMPTS = 35;

const CATEGORY_ORDER = {
  malicious: 0,
  suspicious: 1,
  harmless: 2,
  undetected: 3,
  timeout: 4,
  failure: 5,
  "type-unsupported": 6,
  unrated: 7,
};

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function formatDate(value) {
  if (!value) return "-";
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric > 10_000_000_000 ? numeric : numeric * 1000)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("URL wajib diisi.");

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(candidate);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error("Hanya URL HTTP dan HTTPS yang dapat dipindai.");
  }
  return parsed.toString();
}

function safeFileName(name) {
  return String(name || "uploaded-file")
    .replace(/[\\/\0\r\n]/g, "_")
    .slice(0, 160);
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (storageError) {
    console.warn(`Unable to persist ${key}:`, storageError);
    return false;
  }
}

async function parseJsonResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const preview = text.replace(/\s+/g, " ").slice(0, 180);
      throw new Error(
        `Server mengembalikan respons non-JSON (${response.status}). ${preview || "Respons kosong."}`,
      );
    }
  }

  if (!response.ok) {
    const requestError = new Error(
      data?.error || data?.message || `Request gagal dengan HTTP ${response.status}.`,
    );
    requestError.status = response.status;
    requestError.retryAfter = Number(
      data?.retryAfter || response.headers.get("retry-after") || 0,
    );
    throw requestError;
  }

  return data;
}

async function fetchJson(url, options = {}, timeoutMs = 35_000) {
  const controller = new AbortController();
  const parentSignal = options.signal;
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  const abortFromParent = () => controller.abort();
  parentSignal?.addEventListener("abort", abortFromParent, { once: true });

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });
    return await parseJsonResponse(response);
  } catch (error) {
    if (error?.name === "AbortError" && !parentSignal?.aborted) {
      throw new Error("Request melewati batas waktu.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
    parentSignal?.removeEventListener("abort", abortFromParent);
  }
}

function Toast({ message, type, isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.94 }}
          className={`fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-2xl ${
            type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {type === "success" ? (
            <Check className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CopyableText({ text, label, isCode = false }) {
  const [copied, setCopied] = useState(false);
  const value = text === 0 ? "0" : String(text || "-");

  const copy = async () => {
    if (!text && text !== 0) return;
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group flex min-w-0 items-center justify-between gap-3 rounded-lg border border-current/10 p-3">
      <div className="min-w-0">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-45">{label}</div>
        <div className={`break-all text-sm ${isCode ? "font-mono" : ""}`}>{value}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        disabled={!text && text !== 0}
        className="shrink-0 rounded-md p-2 opacity-45 transition hover:bg-blue-500/10 hover:text-blue-500 hover:opacity-100 disabled:cursor-default disabled:opacity-20"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, isDarkMode, className = "" }) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        isDarkMode ? "border-zinc-700 bg-zinc-800/40" : "border-gray-200 bg-white"
      } ${className}`}
    >
      <h3 className="mb-4 flex items-center gap-2 font-bold">
        {Icon && <Icon className="h-4 w-4 text-blue-500" />}
        {title}
      </h3>
      {children}
    </section>
  );
}

function SkeletonLoader({ isDarkMode }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className={`h-40 rounded-2xl ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`h-80 rounded-2xl ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`} />
        <div className={`h-80 rounded-2xl lg:col-span-2 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`} />
      </div>
    </div>
  );
}

function ErrorDisplay({ error, onRetry, isDarkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-8 text-center ${
        isDarkMode ? "border-red-500/30 bg-red-500/5" : "border-red-200 bg-red-50"
      }`}
    >
      <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
      <h3 className="mb-2 text-xl font-bold">Scan Failed</h3>
      <p className="mx-auto mb-5 max-w-2xl text-sm opacity-70">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-500"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </motion.div>
  );
}

function EmptyState({ isDarkMode }) {
  return (
    <div
      className={`rounded-2xl border border-dashed px-6 py-16 text-center ${
        isDarkMode ? "border-zinc-700 bg-zinc-800/20" : "border-gray-300 bg-white/50"
      }`}
    >
      <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-blue-500 opacity-75" />
      <h3 className="mb-2 text-xl font-bold">Ready to Scan</h3>
      <p className="mb-6 text-sm opacity-60">Enter a URL, upload a file, or search for a hash to begin.</p>
      <div className="flex flex-wrap justify-center gap-2 text-xs font-medium opacity-65">
        <span className="rounded-full border border-current/15 px-3 py-1.5">Scan URLs</span>
        <span className="rounded-full border border-current/15 px-3 py-1.5">Upload Files</span>
        <span className="rounded-full border border-current/15 px-3 py-1.5">Search Database</span>
      </div>
    </div>
  );
}

function categoryClass(category) {
  if (category === "malicious") return "bg-red-500/10 text-red-500";
  if (category === "suspicious") return "bg-yellow-500/10 text-yellow-500";
  if (category === "harmless") return "bg-green-500/10 text-green-500";
  return "bg-gray-500/10 text-gray-500";
}

function buildMetadataEndpoint(type) {
  if (["file", "files"].includes(type)) return "files";
  if (["url", "urls"].includes(type)) return "urls";
  if (["domain", "domains"].includes(type)) return "domains";
  if (["ip", "ip-address", "ip_addresses"].includes(type)) return "ip_addresses";
  return null;
}

function deriveResourceFromSearch(item) {
  const endpoint = buildMetadataEndpoint(item?.type);
  return endpoint && item?.id ? { endpoint, id: item.id, kind: item.type } : null;
}

function mergeHistory(remoteItems, localItems, hiddenIds) {
  const hidden = new Set(hiddenIds);
  const map = new Map();

  [...remoteItems, ...localItems].forEach((item) => {
    const id = item?.vt_id || item?.id;
    if (!id || hidden.has(String(id))) return;
    if (!map.has(String(id))) map.set(String(id), item);
  });

  return [...map.values()]
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
    .slice(0, MAX_HISTORY_ITEMS);
}

export default function WebsiteSecurityScanner() {
  const { isDarkMode } = useContext(ThemeContext);
  const backendUrl = useMemo(() => {
    const configured = import.meta.env.VITE_BACKEND_URL?.trim();
    const fallback = typeof window !== "undefined" ? window.location.origin : "";
    return (configured || fallback).replace(/\/+$/, "");
  }, []);

  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState("scan");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [analysisId, setAnalysisId] = useState(null);
  const [result, setResult] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState("");
  const [activeTab, setActiveTab] = useState("detection");
  const [showAllVendors, setShowAllVendors] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [toast, setToast] = useState(null);

  const abortRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    window.clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3_000);
  }, []);

  const stopActiveRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      stopActiveRequest();
      window.clearTimeout(toastTimerRef.current);
    };
  }, [stopActiveRequest]);

  useEffect(() => {
    const localItems = loadJson(HISTORY_KEY, []);
    const hiddenIds = loadJson(HIDDEN_HISTORY_KEY, []);
    setHistory(mergeHistory([], localItems, hiddenIds));

    let cancelled = false;

    async function loadSupabaseHistory() {
      try {
        const { data, error: supabaseError } = await supabase
          .from("scan_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(MAX_HISTORY_ITEMS);

        if (supabaseError) throw supabaseError;
        if (cancelled) return;

        const remoteItems = (data || []).map((item) => ({
          ...item,
          id: item.vt_id || item.id,
          timestamp: new Date(item.created_at || Date.now()).getTime(),
        }));

        setHistory(mergeHistory(remoteItems, localItems, hiddenIds));
      } catch (historyError) {
        console.warn("Supabase history unavailable:", historyError);
      }
    }

    loadSupabaseHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveToHistory = useCallback(async (resData, metaData, name, type) => {
    const id = resData?.data?.id;
    if (!id) return;

    const stats = resData?.data?.attributes?.stats || {};
    const localItem = {
      vt_id: id,
      id,
      name,
      type,
      stats,
      result: resData,
      metadata: metaData,
      timestamp: Date.now(),
    };

    setHistory((previous) => {
      const hiddenIds = loadJson(HIDDEN_HISTORY_KEY, []).filter((hiddenId) => String(hiddenId) !== String(id));
      saveJson(HIDDEN_HISTORY_KEY, hiddenIds);

      const next = mergeHistory([], [localItem, ...previous], hiddenIds);
      saveJson(HISTORY_KEY, next);
      return next;
    });

    try {
      const { error: supabaseError } = await supabase.from("scan_history").insert([
        {
          vt_id: id,
          name,
          type,
          stats,
          result: resData,
          metadata: metaData,
        },
      ]);

      if (supabaseError && supabaseError.code !== "23505") throw supabaseError;
    } catch (historyError) {
      console.warn("Supabase insert failed; local history remains available:", historyError);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory((current) => {
      const oldHidden = loadJson(HIDDEN_HISTORY_KEY, []);
      const nextHidden = [...new Set([...oldHidden, ...current.map((item) => String(item.vt_id || item.id))])].slice(-200);
      saveJson(HIDDEN_HISTORY_KEY, nextHidden);
      try {
        localStorage.removeItem(HISTORY_KEY);
      } catch (storageError) {
        console.warn("Unable to clear local scan history:", storageError);
      }
      return [];
    });
    showToast("History cleared");
  }, [showToast]);

  const fetchMetadata = useCallback(
    async (resource, signal) => {
      if (!resource?.endpoint || !resource?.id) return null;
      setMetadataLoading(true);
      setMetadataError("");

      try {
        const payload = await fetchJson(
          `${backendUrl}/api/vt/metadata/${resource.endpoint}?id=${encodeURIComponent(resource.id)}`,
          { signal },
        );
        return payload?.data || null;
      } catch (metadataFetchError) {
        if (metadataFetchError?.name !== "AbortError") {
          setMetadataError(metadataFetchError.message || "Metadata tidak tersedia.");
        }
        return null;
      } finally {
        setMetadataLoading(false);
      }
    },
    [backendUrl],
  );

  const startPolling = useCallback(
    async (id, type, displayName, initialProgress = 10) => {
      stopActiveRequest();
      const controller = new AbortController();
      abortRef.current = controller;

      setProgress(initialProgress);
      setStatus("VirusTotal sedang menganalisis...");

      try {
        let delayBeforeNextAttempt = 0;

        for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
          if (delayBeforeNextAttempt > 0) {
            await sleep(delayBeforeNextAttempt, controller.signal);
          }
          delayBeforeNextAttempt = POLL_INTERVAL_MS;

          let payload;
          try {
            payload = await fetchJson(
              `${backendUrl}/api/vt/result/${encodeURIComponent(id)}?_=${Date.now()}`,
              { signal: controller.signal },
            );
          } catch (requestError) {
            if (requestError?.status === 429 && attempt < MAX_POLL_ATTEMPTS) {
              const retrySeconds = Math.max(5, Number(requestError.retryAfter || 15));
              delayBeforeNextAttempt = retrySeconds * 1000;
              setStatus(`Batas request VirusTotal tercapai. Mencoba lagi dalam ${retrySeconds} detik...`);
              continue;
            }
            throw requestError;
          }

          const analysis = payload?.data;
          const analysisStatus = analysis?.attributes?.status;
          const attemptProgress = Math.min(
            94,
            initialProgress + Math.round((attempt / MAX_POLL_ATTEMPTS) * (94 - initialProgress)),
          );
          setProgress(attemptProgress);
          setStatus(
            analysisStatus === "queued"
              ? `Menunggu antrean VirusTotal (${attempt}/${MAX_POLL_ATTEMPTS})...`
              : `Menganalisis (${attempt}/${MAX_POLL_ATTEMPTS})...`,
          );

          if (analysisStatus !== "completed") continue;

          const meta = await fetchMetadata(payload.resource, controller.signal);
          if (controller.signal.aborted) return;

          setResult(payload);
          setMetadata(meta);
          setProgress(100);
          setStatus("Selesai!");
          setLoading(false);
          setShowAllVendors(false);
          await saveToHistory(payload, meta, displayName, type);
          window.setTimeout(() => setProgress(0), 800);
          abortRef.current = null;
          return;
        }

        throw new Error("Analisis belum selesai setelah batas polling. Coba buka ulang beberapa saat lagi.");
      } catch (pollError) {
        if (pollError?.name === "AbortError") return;
        setError(pollError.message || "Gagal mengambil hasil scan.");
        setLoading(false);
        setStatus("");
        setProgress(0);
        abortRef.current = null;
      }
    },
    [backendUrl, fetchMetadata, saveToHistory, stopActiveRequest],
  );

  const resetResultState = useCallback(() => {
    stopActiveRequest();
    setResult(null);
    setMetadata(null);
    setMetadataError("");
    setMetadataLoading(false);
    setAnalysisId(null);
    setError("");
    setStatus("");
    setProgress(0);
    setLoading(false);
    setShowAllVendors(false);
    setActiveTab("detection");
  }, [stopActiveRequest]);

  const handleScanUrl = useCallback(async () => {
    let normalized;
    try {
      normalized = normalizeUrl(input);
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    resetResultState();
    setLoading(true);
    setStatus("Mengirim URL ke VirusTotal...");
    setProgress(5);
    setShowHistoryTab(false);

    try {
      const payload = await fetchJson(`${backendUrl}/api/vt/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      const id = payload?.data?.id;
      if (!id) throw new Error("Analysis ID tidak ditemukan pada respons server.");

      setInput(payload.normalizedUrl || normalized);
      setAnalysisId(id);
      await startPolling(id, "url", payload.normalizedUrl || normalized, 10);
    } catch (scanError) {
      setError(scanError.message || "Scan URL gagal dimulai.");
      setLoading(false);
      setStatus("");
      setProgress(0);
    }
  }, [backendUrl, input, resetResultState, startPolling]);

  const handleScanFile = useCallback(async () => {
    if (!selectedFile) return;
    if (selectedFile.size <= 0) {
      setError("File kosong tidak dapat dipindai.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Ukuran file melebihi batas 32 MB VirusTotal.");
      return;
    }

    resetResultState();
    setLoading(true);
    setStatus("Mengunggah file sementara dengan koneksi privat...");
    setProgress(2);
    setShowHistoryTab(false);

    try {
      const temporaryBlob = await upload(
        `scanner/${Date.now()}-${safeFileName(selectedFile.name)}`,
        selectedFile,
        {
          access: "private",
          handleUploadUrl: `${backendUrl}/api/blob/upload`,
          clientPayload: JSON.stringify({
            purpose: "virus-total-scan",
            size: selectedFile.size,
          }),
          onUploadProgress: ({ percentage }) => {
            const safePercentage = Number.isFinite(percentage) ? percentage : 0;
            setProgress(Math.min(38, 2 + Math.round(safePercentage * 0.36)));
          },
        },
      );

      setStatus("Mengirim file ke VirusTotal...");
      setProgress((current) => Math.max(current, 40));

      const payload = await fetchJson(
        `${backendUrl}/api/vt/scan-file`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blobUrl: temporaryBlob.url,
            fileName: selectedFile.name,
          }),
        },
        60_000,
      );

      const id = payload?.data?.id;
      if (!id) throw new Error("Analysis ID file tidak ditemukan pada respons server.");

      setAnalysisId(id);
      await startPolling(id, "file", selectedFile.name, 45);
    } catch (scanError) {
      setError(scanError.message || "Scan file gagal dimulai.");
      setLoading(false);
      setStatus("");
      setProgress(0);
    }
  }, [backendUrl, resetResultState, selectedFile, startPolling]);

  const handleSearch = useCallback(async () => {
    const query = input.trim();
    if (!query) return;

    resetResultState();
    setLoading(true);
    setStatus("Searching VirusTotal database...");
    setProgress(15);
    setShowHistoryTab(false);

    try {
      const payload = await fetchJson(`${backendUrl}/api/vt/search?query=${encodeURIComponent(query)}`);
      const item = payload?.data?.[0];
      if (!item) throw new Error("Data tidak ditemukan.");

      const attributes = item.attributes || {};
      const simulatedResult = {
        data: {
          id: item.id,
          type: item.type,
          attributes: {
            status: "completed",
            date: attributes.last_analysis_date,
            stats: attributes.last_analysis_stats || {},
            results: attributes.last_analysis_results || {},
            meta: {},
          },
        },
        resource: deriveResourceFromSearch(item),
      };

      setResult(simulatedResult);
      setMetadata(item);
      setLoading(false);
      setStatus("Selesai!");
      setProgress(100);
      await saveToHistory(simulatedResult, item, query, "search");
      window.setTimeout(() => setProgress(0), 800);
    } catch (searchError) {
      setError(searchError.message || "Pencarian gagal.");
      setLoading(false);
      setStatus("");
      setProgress(0);
    }
  }, [backendUrl, input, resetResultState, saveToHistory]);

  const handleSubmit = useCallback(() => {
    setActiveTab("detection");
    if (mode === "scan") void handleScanUrl();
    else if (mode === "file") void handleScanFile();
    else void handleSearch();
  }, [handleScanFile, handleScanUrl, handleSearch, mode]);

  const handleClear = useCallback(() => {
    resetResultState();
    setInput("");
    setSelectedFile(null);
  }, [resetResultState]);

  const restoreHistory = useCallback((item) => {
    stopActiveRequest();
    const restoredMode = item.type === "file" ? "file" : item.type === "search" ? "search" : "scan";
    setMode(restoredMode);
    setInput(item.name || "");
    setSelectedFile(null);
    setResult(item.result || null);
    setMetadata(item.metadata || null);
    setMetadataError("");
    setMetadataLoading(false);
    setError("");
    setStatus("");
    setProgress(0);
    setLoading(false);
    setShowHistoryTab(false);
    setActiveTab("detection");
    setShowAllVendors(false);
    window.scrollTo({ top: 300, behavior: "smooth" });
  }, [stopActiveRequest]);

  const retryMetadata = useCallback(async () => {
    const resource = result?.resource;
    if (!resource) return;

    stopActiveRequest();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const nextMetadata = await fetchMetadata(resource, controller.signal);
      if (nextMetadata) setMetadata(nextMetadata);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [fetchMetadata, result, stopActiveRequest]);

  const stats = result?.data?.attributes?.stats || {};
  const scanDate = result?.data?.attributes?.date || result?.data?.attributes?.last_analysis_date;
  const vendorObject = result?.data?.attributes?.results || {};

  const sortedVendors = useMemo(
    () =>
      Object.entries(vendorObject)
        .map(([vendor, info]) => ({
          vendor,
          category: info?.category || "unrated",
          result: info?.result || info?.category || "clean",
        }))
        .sort((a, b) => {
          const categoryDifference = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
          return categoryDifference || a.vendor.localeCompare(b.vendor);
        }),
    [vendorObject],
  );

  const pieData = useMemo(
    () =>
      [
        { name: "Harmless", value: Number(stats.harmless || 0), color: "#22c55e" },
        { name: "Suspicious", value: Number(stats.suspicious || 0), color: "#f59e0b" },
        { name: "Malicious", value: Number(stats.malicious || 0), color: "#ef4444" },
        { name: "Undetected", value: Number(stats.undetected || 0), color: "#6b7280" },
        { name: "Timeout", value: Number(stats.timeout || 0), color: "#64748b" },
      ].filter((item) => item.value > 0),
    [stats],
  );

  const metadataAttributes = metadata?.attributes || {};
  const resultType = result?.resource?.kind || result?.data?.type || mode;
  const displayName =
    metadataAttributes.meaningful_name ||
    metadataAttributes.title ||
    selectedFile?.name ||
    input ||
    "Scan Result";

  const isSubmitDisabled =
    loading || (mode === "file" ? !selectedFile : input.trim().length === 0);

  const modeItems = [
    { id: "scan", icon: Globe, label: "URL" },
    { id: "file", icon: FileUp, label: "File" },
    { id: "search", icon: Database, label: "Search" },
    { id: "history", icon: History, label: "History" },
  ];

  return (
    <div
      className={`${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-zinc-900"
      } min-h-screen font-sans transition-colors duration-500`}
    >
      <Toast message={toast?.message} type={toast?.type} isVisible={Boolean(toast)} />

      <header
        className={`border-b backdrop-blur-lg ${
          isDarkMode ? "border-zinc-800 bg-zinc-900/80" : "border-gray-300 bg-[#faf9f9]/90"
        }`}
      >
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-16 mt-10 flex items-center justify-between gap-4 sm:mb-20">
            <div className="flex items-center gap-2 rounded-lg px-2 py-2 sm:px-4">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium sm:text-base">
                SecurityScanner <span className="text-red-600">Ultimate</span>
              </span>
            </div>

            <nav
              className={`flex gap-1 rounded-lg border p-1 ${
                isDarkMode ? "border-zinc-700" : "border-gray-300"
              }`}
              aria-label="Scanner mode"
            >
              {modeItems.map((item) => {
                const active =
                  (item.id === "history" && showHistoryTab) ||
                  (item.id === mode && !showHistoryTab);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "history") {
                        stopActiveRequest();
                        setShowHistoryTab(true);
                        setResult(null);
                        setLoading(false);
                        setError("");
                        setStatus("");
                        setProgress(0);
                      } else {
                        setMode(item.id);
                        setShowHistoryTab(false);
                        handleClear();
                      }
                    }}
                    className={`flex items-center gap-2 rounded-md p-2 transition-all ${
                      active
                        ? "bg-sky-600 text-white shadow"
                        : isDarkMode
                          ? "text-zinc-400 hover:bg-zinc-800"
                          : "text-gray-500 hover:bg-gray-100"
                    }`}
                    aria-label={`${item.label} Mode`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden text-xs font-medium sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Security Scanner
            </h1>
            <p className={`font-mono text-base sm:text-lg ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              Scan URL, file, atau hash dengan lebih mudah dan cepat.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-10">
        {!showHistoryTab && (
          <div className="mx-auto mb-12 max-w-3xl">
            <div
              className={`flex gap-2 rounded-2xl border p-1.5 shadow-xl ${
                isDarkMode ? "border-zinc-700 bg-zinc-800" : "border-gray-200 bg-white"
              }`}
            >
              <div className="min-w-0 flex-1">
                {mode === "file" ? (
                  <div className="relative h-full w-full">
                    <input
                      id="file-upload"
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setError("");
                        if (file && file.size > MAX_FILE_SIZE) {
                          setSelectedFile(null);
                          setError("Ukuran file melebihi batas 32 MB.");
                          event.target.value = "";
                          return;
                        }
                        setSelectedFile(file);
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex h-full w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                        isDarkMode ? "hover:bg-zinc-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`rounded-lg p-2 ${isDarkMode ? "bg-zinc-700" : "bg-gray-100"}`}>
                        <FileUp className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm font-medium ${!selectedFile ? "opacity-50" : ""}`}>
                          {selectedFile?.name || "Click to browse file (Max 32MB)"}
                        </div>
                        {selectedFile && (
                          <div className="mt-0.5 text-[11px] opacity-45">{formatBytes(selectedFile.size)}</div>
                        )}
                      </div>
                    </label>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-red-500 hover:bg-red-500/10"
                        aria-label="Remove selected file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative flex h-full items-center">
                    <Search className="absolute left-4 h-5 w-5 opacity-50" />
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      className="h-full w-full bg-transparent py-4 pl-12 pr-10 font-medium outline-none placeholder:opacity-50"
                      placeholder={mode === "scan" ? "https://example.com" : "Hash, IP, URL, or Domain..."}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !isSubmitDisabled) handleSubmit();
                      }}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {input && !loading && (
                      <button
                        type="button"
                        onClick={() => setInput("")}
                        className="absolute right-3 rounded-full p-1 opacity-45 hover:bg-current/10 hover:opacity-100"
                        aria-label="Clear input"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`min-w-[84px] rounded-xl px-5 font-bold text-white transition-all sm:min-w-[112px] sm:px-8 ${
                  isSubmitDisabled
                    ? "cursor-not-allowed bg-zinc-600 opacity-50"
                    : "bg-blue-600 shadow-lg hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/30 active:scale-95"
                }`}
              >
                {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "SCAN"}
              </button>
            </div>

            {status && !error && (
              <div className="mt-4 text-center font-mono text-xs text-zinc-500">{status}</div>
            )}

            {progress > 0 && (
              <div className={`mt-4 h-2 overflow-hidden rounded-full ${isDarkMode ? "bg-zinc-700" : "bg-gray-200"}`}>
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={false}
                  animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            )}

            {analysisId && loading && (
              <div className="mt-2 truncate text-center font-mono text-[10px] opacity-35">Analysis ID: {analysisId}</div>
            )}
          </div>
        )}

        {showHistoryTab && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Scan History</h2>
                <p className="mt-1 text-sm opacity-50">Riwayat lokal dan sinkronisasi Supabase terbaru.</p>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="flex items-center gap-2 rounded-lg border border-red-500/25 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className={`rounded-2xl border border-dashed py-20 text-center ${isDarkMode ? "border-zinc-700" : "border-gray-300"}`}>
                <History className="mx-auto mb-3 h-12 w-12 opacity-25" />
                <p className="font-medium opacity-50">No scan history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => {
                  const malicious = Number(item.stats?.malicious || 0);
                  return (
                    <button
                      type="button"
                      key={item.vt_id || item.id}
                      onClick={() => restoreHistory(item)}
                      className={`group flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                        isDarkMode ? "border-zinc-700 bg-zinc-800/50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                            malicious > 0 ? "border-red-500 text-red-500" : "border-green-500 text-green-500"
                          }`}
                        >
                          {malicious > 0 ? <Skull className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold sm:max-w-md">{item.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs opacity-45">
                            <span className="font-bold uppercase tracking-wider">{item.type}</span>
                            <span>•</span>
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                        <div className="hidden text-right sm:block">
                          <div className={`font-bold ${malicious > 0 ? "text-red-500" : "text-green-500"}`}>
                            {malicious > 0 ? `${malicious} Detections` : "Clean"}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 opacity-30 transition group-hover:opacity-100" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}

        <AnimatePresence mode="wait">
          {loading && !showHistoryTab && <SkeletonLoader key="loading" isDarkMode={isDarkMode} />}

          {!loading && error && !showHistoryTab && (
            <ErrorDisplay key="error" error={error} onRetry={handleSubmit} isDarkMode={isDarkMode} />
          )}

          {!loading && !error && !result && !showHistoryTab && (
            <EmptyState key="empty" isDarkMode={isDarkMode} />
          )}

          {!loading && result && !showHistoryTab && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <section
                className={`relative overflow-hidden rounded-2xl border p-6 shadow-2xl ${
                  isDarkMode ? "border-zinc-700 bg-zinc-800/60" : "border-gray-200 bg-white"
                }`}
              >
                <div
                  className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-[100px] ${
                    Number(stats.malicious || 0) > 0
                      ? "bg-red-500"
                      : Number(stats.suspicious || 0) > 0
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                />
                <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "bg-zinc-700 text-zinc-300" : "bg-gray-100 text-gray-600"}`}>
                        {resultType} Analysis
                      </span>
                      <span className="flex items-center gap-1 text-xs opacity-50">
                        <Clock className="h-3 w-3" />
                        {formatDate(scanDate)}
                      </span>
                    </div>
                    <h2 className="mb-1 truncate text-2xl font-bold sm:text-3xl" title={displayName}>
                      {displayName}
                    </h2>
                    <div className="flex max-w-xl items-center gap-1 truncate font-mono text-xs opacity-50">
                      <span className="truncate">{result.data.id}</span>
                      <Info className="h-3 w-3 shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-3xl font-black ${Number(stats.malicious || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                        {Number(stats.malicious || 0)}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-45">Malicious</div>
                    </div>
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                        Number(stats.malicious || 0) > 0
                          ? "border-red-500 text-red-500"
                          : "border-green-500 text-green-500"
                      }`}
                    >
                      {Number(stats.malicious || 0) > 0 ? (
                        <Skull className="h-8 w-8" />
                      ) : (
                        <ShieldCheck className="h-8 w-8" />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-center">
                <div className={`flex gap-1 rounded-xl border p-1 ${isDarkMode ? "border-zinc-700 bg-zinc-900" : "border-gray-200 bg-gray-100"}`}>
                  {["detection", "details"].map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-lg px-6 py-2 text-sm font-bold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        activeTab === tab
                          ? isDarkMode
                            ? "bg-zinc-700 text-blue-400 shadow-sm"
                            : "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[500px]">
                {activeTab === "detection" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <section className={`rounded-2xl border p-6 lg:col-span-1 ${isDarkMode ? "border-zinc-700 bg-zinc-800/40" : "border-gray-200 bg-white"}`}>
                      <h3 className="mb-6 flex items-center gap-2 font-bold">
                        <BarChart2 className="h-4 w-4 text-blue-500" />
                        Engine Summary
                      </h3>
                      <div className="flex h-48 items-center justify-center">
                        {pieData.length > 0 ? (
                          <PieChart
                            series={[
                              {
                                data: pieData.map((item, index) => ({ id: index, value: item.value, color: item.color })),
                                innerRadius: 60,
                                paddingAngle: 2,
                              },
                            ]}
                            height={200}
                            slotProps={{ legend: { hidden: true } }}
                          />
                        ) : (
                          <div className="text-center text-sm opacity-45">No engine statistics returned.</div>
                        )}
                      </div>
                      <div className="mt-6 space-y-2">
                        {pieData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </div>
                            <span className="font-bold opacity-70">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className={`flex overflow-hidden rounded-2xl border lg:col-span-2 ${isDarkMode ? "border-zinc-700 bg-zinc-800/40" : "border-gray-200 bg-white"}`}>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className={`flex items-center justify-between border-b px-6 py-4 font-bold ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                          <div className="flex items-center gap-2">
                            <ListFilter className="h-4 w-4 text-blue-500" />
                            Security Vendors
                          </div>
                          <div className="text-xs opacity-50">{sortedVendors.length} Engines</div>
                        </div>
                        <div className="max-h-[500px] flex-1 overflow-y-auto p-2">
                          {sortedVendors.length > 0 ? (
                            <>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {(showAllVendors ? sortedVendors : sortedVendors.slice(0, 16)).map((vendor) => (
                                  <div
                                    key={vendor.vendor}
                                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-all hover:shadow-md ${
                                      isDarkMode ? "border-zinc-700/50 bg-zinc-900/50" : "border-gray-100 bg-gray-50"
                                    }`}
                                  >
                                    <span className="truncate text-sm font-medium" title={vendor.vendor}>{vendor.vendor}</span>
                                    <span className={`flex max-w-[55%] shrink-0 items-center gap-1 truncate rounded px-2 py-0.5 text-[10px] font-bold uppercase ${categoryClass(vendor.category)}`} title={String(vendor.result)}>
                                      {vendor.category === "malicious" && <Skull className="h-3 w-3 shrink-0" />}
                                      <span className="truncate">{vendor.result}</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {sortedVendors.length > 16 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllVendors((current) => !current)}
                                  className="mt-2 w-full rounded-lg py-3 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-500/10"
                                >
                                  {showAllVendors ? "Show Less" : `View All ${sortedVendors.length} Vendors`}
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex min-h-64 items-center justify-center px-4 text-center text-sm opacity-45">
                              Vendor results are unavailable for this object.
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === "details" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {metadataLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-500" />
                        <p>Fetching deep metadata...</p>
                      </div>
                    ) : metadataError && !metadata ? (
                      <div className={`rounded-2xl border p-10 text-center ${isDarkMode ? "border-yellow-500/30 bg-yellow-500/5" : "border-yellow-200 bg-yellow-50"}`}>
                        <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-yellow-500" />
                        <h3 className="mb-2 font-bold">Metadata unavailable</h3>
                        <p className="mx-auto mb-5 max-w-xl text-sm opacity-65">{metadataError}</p>
                        {result.resource && (
                          <button type="button" onClick={() => void retryMetadata()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500">
                            <RefreshCw className="h-4 w-4" />
                            Retry Metadata
                          </button>
                        )}
                      </div>
                    ) : !metadata ? (
                      <div className="py-20 text-center opacity-50">No metadata available for this result.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SectionCard title="Basic Properties" icon={Hash} isDarkMode={isDarkMode} className="lg:col-span-2">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <CopyableText label="Object ID" text={metadata.id} isCode />
                            <CopyableText label="Object Type" text={metadata.type} />
                            {metadataAttributes.md5 && <CopyableText label="MD5" text={metadataAttributes.md5} isCode />}
                            {metadataAttributes.sha1 && <CopyableText label="SHA-1" text={metadataAttributes.sha1} isCode />}
                            {metadataAttributes.sha256 && <CopyableText label="SHA-256" text={metadataAttributes.sha256} isCode />}
                            {metadataAttributes.vhash && <CopyableText label="Vhash" text={metadataAttributes.vhash} isCode />}
                            {metadataAttributes.authentihash && <CopyableText label="Authentihash" text={metadataAttributes.authentihash} isCode />}
                            {metadataAttributes.imphash && <CopyableText label="Imphash" text={metadataAttributes.imphash} isCode />}
                            {metadataAttributes.ssdeep && <CopyableText label="SSDEEP" text={metadataAttributes.ssdeep} isCode />}
                            {metadataAttributes.type_description && <CopyableText label="File Type" text={metadataAttributes.type_description} />}
                            {metadataAttributes.magic && <CopyableText label="Magic" text={metadataAttributes.magic} />}
                            {metadataAttributes.size !== undefined && <CopyableText label="File Size" text={formatBytes(metadataAttributes.size)} />}
                            {metadataAttributes.url && <CopyableText label="URL" text={metadataAttributes.url} isCode />}
                            {metadataAttributes.last_final_url && <CopyableText label="Last Final URL" text={metadataAttributes.last_final_url} isCode />}
                            {metadataAttributes.reputation !== undefined && <CopyableText label="Reputation" text={metadataAttributes.reputation} />}
                            {metadataAttributes.country && <CopyableText label="Country" text={metadataAttributes.country} />}
                            {metadataAttributes.network && <CopyableText label="Network" text={metadataAttributes.network} isCode />}
                            {metadataAttributes.registrar && <CopyableText label="Registrar" text={metadataAttributes.registrar} />}
                          </div>
                        </SectionCard>

                        <SectionCard title="History" icon={Clock} isDarkMode={isDarkMode}>
                          <div className="space-y-3">
                            <CopyableText label="Creation Time" text={formatDate(metadataAttributes.creation_date)} />
                            <CopyableText label="First Submission" text={formatDate(metadataAttributes.first_submission_date)} />
                            <CopyableText label="Last Submission" text={formatDate(metadataAttributes.last_submission_date)} />
                            <CopyableText label="Last Analysis" text={formatDate(metadataAttributes.last_analysis_date)} />
                          </div>
                        </SectionCard>

                        <SectionCard title="Names / Categories" icon={FileText} isDarkMode={isDarkMode}>
                          <div className={`max-h-64 overflow-y-auto rounded-lg p-3 text-xs ${isDarkMode ? "bg-zinc-900/50 text-zinc-400" : "bg-gray-50 text-gray-600"}`}>
                            {Array.isArray(metadataAttributes.names) && metadataAttributes.names.length > 0 ? (
                              metadataAttributes.names.map((name, index) => (
                                <div key={`${name}-${index}`} className="mb-1 border-b border-dashed border-current/10 pb-1 last:mb-0 last:border-0">
                                  {name}
                                </div>
                              ))
                            ) : metadataAttributes.categories && Object.keys(metadataAttributes.categories).length > 0 ? (
                              Object.entries(metadataAttributes.categories).map(([vendor, category]) => (
                                <div key={vendor} className="mb-2 border-b border-dashed border-current/10 pb-2 last:mb-0 last:border-0">
                                  <div className="font-bold opacity-65">{vendor}</div>
                                  <div>{String(category)}</div>
                                </div>
                              ))
                            ) : (
                              "No names or categories found"
                            )}
                          </div>
                        </SectionCard>

                        {metadataAttributes.signature_info && (
                          <SectionCard title="Signature Info" icon={Fingerprint} isDarkMode={isDarkMode} className="lg:col-span-2">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <CopyableText label="Product" text={metadataAttributes.signature_info.product} />
                              <CopyableText label="Description" text={metadataAttributes.signature_info.description} />
                              <CopyableText label="Original Name" text={metadataAttributes.signature_info.original_name} />
                              <CopyableText label="Copyright" text={metadataAttributes.signature_info.copyright} />
                              <CopyableText
                                label="Signers"
                                text={metadataAttributes.signature_info.signers_details?.map((signer) => signer.name).filter(Boolean).join("; ")}
                              />
                              <div className={`rounded border p-3 text-center text-xs font-bold uppercase ${metadataAttributes.signature_info.verified ? "border-green-500/20 bg-green-500/10 text-green-500" : "border-red-500/20 bg-red-500/10 text-red-500"}`}>
                                {metadataAttributes.signature_info.verified ? "Signature Verified" : "Invalid / Unverified Signature"}
                              </div>
                            </div>
                          </SectionCard>
                        )}

                        {metadataAttributes.pe_info && (
                          <SectionCard title="Portable Executable Info" icon={Cpu} isDarkMode={isDarkMode} className="lg:col-span-2">
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <CopyableText label="Target Machine" text={metadataAttributes.pe_info.machine_type} />
                              <CopyableText label="Entry Point" text={metadataAttributes.pe_info.entry_point} isCode />
                              <CopyableText label="Sections Count" text={metadataAttributes.pe_info.sections?.length} />
                            </div>
                            {Array.isArray(metadataAttributes.pe_info.sections) && metadataAttributes.pe_info.sections.length > 0 && (
                              <div className="overflow-x-auto rounded-lg border border-current/10">
                                <table className="w-full min-w-[640px] text-left text-xs">
                                  <thead className={isDarkMode ? "bg-zinc-900/60" : "bg-gray-50"}>
                                    <tr>
                                      <th className="px-3 py-2">Section</th>
                                      <th className="px-3 py-2">Virtual Address</th>
                                      <th className="px-3 py-2">Virtual Size</th>
                                      <th className="px-3 py-2">Raw Size</th>
                                      <th className="px-3 py-2">Entropy</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {metadataAttributes.pe_info.sections.map((section, index) => (
                                      <tr key={`${section.name || "section"}-${index}`} className="border-t border-current/10">
                                        <td className="px-3 py-2 font-mono">{section.name || "-"}</td>
                                        <td className="px-3 py-2 font-mono">{section.virtual_address ?? "-"}</td>
                                        <td className="px-3 py-2">{formatBytes(section.virtual_size)}</td>
                                        <td className="px-3 py-2">{formatBytes(section.raw_size)}</td>
                                        <td className="px-3 py-2">{section.entropy ?? "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </SectionCard>
                        )}

                        {metadataAttributes.whois && (
                          <SectionCard title="WHOIS" icon={Globe} isDarkMode={isDarkMode} className="lg:col-span-2">
                            <pre className={`max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg p-4 text-xs ${isDarkMode ? "bg-zinc-950/70 text-zinc-300" : "bg-gray-50 text-gray-700"}`}>
                              {metadataAttributes.whois}
                            </pre>
                          </SectionCard>
                        )}

                        <SectionCard title="Raw Metadata Overview" icon={Layers} isDarkMode={isDarkMode} className="lg:col-span-2">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <CopyableText label="Tags" text={metadataAttributes.tags?.join(", ")} />
                            <CopyableText label="Popular Threat Label" text={metadataAttributes.popular_threat_classification?.suggested_threat_label} />
                            <CopyableText label="Times Submitted" text={metadataAttributes.times_submitted} />
                            <CopyableText label="Unique Sources" text={metadataAttributes.unique_sources} />
                            <CopyableText label="Last HTTP Response Code" text={metadataAttributes.last_http_response_code} />
                            <CopyableText label="Last HTTP Content Length" text={formatBytes(metadataAttributes.last_http_response_content_length)} />
                          </div>
                        </SectionCard>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
