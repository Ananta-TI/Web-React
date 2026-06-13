import React, { useState, useEffect, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { upload } from "@vercel/blob/client";
import { ThemeContext } from "../context/ThemeContext";
import supabase from "../supabaseClient";

// Import components
import Toast from "./Shared/Toast";
import SkeletonLoader from "./Shared/SkeletonLoader";
import ErrorDisplay from "./Shared/ErrorDisplay";
import EmptyState from "./Shared/EmptyState";
import Header from "./WebsiteScanner/Header";
import InputSection from "./WebsiteScanner/InputSection";
import HistoryTab from "./WebsiteScanner/HistoryTab";
import ResultSummary from "./WebsiteScanner/ResultSummary";
import NavigationTabs from "./WebsiteScanner/NavigationTabs";
import DetectionTab from "./WebsiteScanner/DetectionTab";
import DetailsTab from "./WebsiteScanner/DetailsTab";
import IntelligenceTab from "./WebsiteScanner/IntelligenceTab";

// ============= CONFIGURATION =============
const BACKEND_CONFIG = {
  // Try to use VITE_BACKEND_URL first, then fallback
  getBackendUrl: () => {
    // Check if we're on localhost
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:5000";
    }

    // For deployed version, use Vercel API
    if (
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("netlify.app")
    ) {
      return window.location.origin; // Same origin for Vercel
    }

    // Fallback
    return import.meta.env.VITE_BACKEND_URL || window.location.origin;
  },
};

const POLLING_CONFIG = {
  maxAttempts: 60, // 5 minutes with 5s interval
  intervalMs: 5000, // 5 seconds
  timeoutMs: 300000, // 5 minutes total
};

const LOCAL_BACKEND_PATTERN =
  /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3})(?::\d+)?(?:\/|$)/i;

const getApiErrorMessage = (payload, fallback) => {
  if (typeof payload?.error === "string") return payload.error;
  if (typeof payload?.error?.message === "string") {
    return payload.error.message;
  }
  if (typeof payload?.message === "string") return payload.message;
  return fallback;
};

const readApiResponse = async (
  response,
  fallbackMessage = `Request failed (HTTP ${response.status})`,
  { allowNotFound = false } = {},
) => {
  const rawText = await response.text();
  let payload = {};

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      const compactText = rawText.replace(/\s+/g, " ").trim().slice(0, 180);
      throw new Error(
        `Server returned a non-JSON response (HTTP ${response.status})${
          compactText ? `: ${compactText}` : ""
        }`,
      );
    }
  }

  if (allowNotFound && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(payload, fallbackMessage));
  }

  return payload;
};

const sanitizeUploadName = (fileName) =>
  String(fileName || "uploaded-file")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 140) || "uploaded-file";

// ============= MAIN COMPONENT =============
export default function WebsiteSecurityScanner() {
  const { isDarkMode } = useContext(ThemeContext);

  // ============= STATE =============
  // UI State
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState("scan");

  // Loading State
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // Result State
  const [analysisId, setAnalysisId] = useState(null);
  const [result, setResult] = useState(null);
  const [metadata, setMetadata] = useState(null);

  // UI Tabs
  const [activeTab, setActiveTab] = useState("detection");
  const [showAllVendors, setShowAllVendors] = useState(false);
  const [showHistoryTab, setShowHistoryTab] = useState(false);

  // History State
  const [history, setHistory] = useState([]);

  // Toast State
  const [toast, setToast] = useState(null);

  // Refs for cleanup
  const pollRef = React.useRef(null);
  const pollTimeoutRef = React.useRef(null);

  // Get backend URL
  const BACKEND_URL = BACKEND_CONFIG.getBackendUrl();

  // ============= LOGGING =============
  useEffect(() => {
    console.log("🚀 Scanner initialized");
    console.log("Backend URL:", BACKEND_URL);
    console.log("Dark Mode:", isDarkMode);
    console.log("Hostname:", window.location.hostname);
  }, [BACKEND_URL, isDarkMode]);

  // ============= CLEANUP =============
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  // ============= HISTORY MANAGEMENT =============
  useEffect(() => {
    const loadHistory = async () => {
      const isHistoryCleared =
        sessionStorage.getItem("historyCleared") === "true";
      if (isHistoryCleared) {
        console.log("🚫 History cleared in this session");
        return;
      }

      // Load from localStorage
      const localHistory = localStorage.getItem("scanHistory");
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          setHistory(Array.isArray(parsed) ? parsed : []);
          console.log("✅ Loaded history from localStorage");
        } catch (err) {
          console.error("Error parsing localStorage:", err);
          localStorage.removeItem("scanHistory");
        }
      }

      // Load from Supabase
      try {
        const { data, error: supabaseErr } = await supabase
          .from("scan_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (supabaseErr) {
          console.warn("Supabase history load error:", supabaseErr);
          return;
        }

        if (data?.length > 0) {
          const formatted = data.map((d) => ({
            ...d,
            timestamp: new Date(d.created_at).getTime(),
            id: d.vt_id || d.id,
          }));

          setHistory((prevHistory) => {
            const combined = [...formatted, ...prevHistory];
            const unique = Array.from(
              new Map(
                combined.map((item) => [item.vt_id || item.id, item]),
              ).values(),
            );
            const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);
            return sorted.slice(0, 20);
          });
          console.log("✅ Loaded history from Supabase");
        }
      } catch (err) {
        console.warn("Supabase load error:", err);
      }
    };

    loadHistory();
  }, []);

  // ============= UTILITY FUNCTIONS =============
  const saveToHistory = async (resData, metaData, name, scanType) => {
    sessionStorage.removeItem("historyCleared");

    const supabaseItem = {
      vt_id: resData.data.id,
      name,
      type: scanType,
      stats: resData.data.attributes?.stats || {},
      result: resData,
      metadata: metaData,
      created_at: new Date().toISOString(),
    };

    const localItem = {
      ...supabaseItem,
      id: resData.data.id,
      timestamp: Date.now(),
    };

    // Save to Supabase (non-blocking)
    try {
      await supabase.from("scan_history").insert([supabaseItem]);
      console.log("✅ Saved to Supabase");
    } catch (err) {
      console.warn("⚠️ Supabase save error:", err);
    }

    // Save to localStorage without relying on a stale history closure.
    setHistory((previousHistory) => {
      const combined = [localItem, ...previousHistory];
      const unique = Array.from(
        new Map(
          combined.map((item) => [
            item.vt_id || item.id || item.timestamp,
            item,
          ]),
        ).values(),
      );
      const newList = unique
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 20);

      localStorage.setItem("scanHistory", JSON.stringify(newList));
      return newList;
    });
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearHistory = () => {
    console.log("🗑️ Clearing history");
    setHistory([]);
    localStorage.removeItem("scanHistory");
    sessionStorage.setItem("historyCleared", "true");
    showToast("History cleared", "success");
  };

  const restoreHistory = (item) => {
    const restoredType = item?.metadata?.type || item?.type;

    setResult(item.result);
    setMetadata(item.metadata);
    setInput(item?.name || "");
    setSelectedFile(null);
    setMode(
      restoredType === "file"
        ? "file"
        : restoredType === "url"
          ? "scan"
          : "search",
    );
    setActiveTab("detection");
    setError("");
    setShowHistoryTab(false);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // ============= API CALLS =============

  /**
   * Fetch metadata for a given ID
   */
  const fetchMetadata = async (type, id) => {
    if (!type || !id) {
      console.warn("fetchMetadata: Missing type or id", { type, id });
      return null;
    }

    try {
      setStatus("Fetching detailed metadata...");

      const typeMap = {
        file: "file",
        url: "url",
        domain: "domain",
        ip: "ip",
        ip_address: "ip",
      };

      const mappedType = typeMap[type] || type;
      const params = new URLSearchParams({ id: String(id) });
      const url = `${BACKEND_URL}/api/vt/metadata/${mappedType}?${params}`;

      console.log("📥 Fetching metadata:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = await readApiResponse(
        response,
        `Metadata request failed (HTTP ${response.status})`,
        { allowNotFound: true },
      );

      if (!payload) {
        console.warn("Metadata not found for:", id);
        return null;
      }

      const metadataResult = payload.data || payload;
      console.log("✅ Metadata fetched:", metadataResult);
      return metadataResult;
    } catch (metadataError) {
      console.error("❌ fetchMetadata error:", metadataError);
      return null;
    }
  };

  /**
   * Start polling for analysis results
   */
  const startPolling = (id, scanType, inputName) => {
    console.log("🔄 Starting polling for:", id, "Type:", scanType);

    let attempt = 0;
    let stopped = false;

    const clearPolling = () => {
      stopped = true;

      if (pollRef.current) {
        clearTimeout(pollRef.current);
        pollRef.current = null;
      }

      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };

    if (pollRef.current) clearTimeout(pollRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    pollTimeoutRef.current = setTimeout(() => {
      if (stopped) return;

      clearPolling();
      setLoading(false);
      setError("Analysis took too long. Please try again.");
      setProgress(0);
      setStatus("");
    }, POLLING_CONFIG.timeoutMs);

    const poll = async () => {
      if (stopped) return;

      attempt += 1;
      setProgress(
        Math.min(20 + (attempt / POLLING_CONFIG.maxAttempts) * 70, 90),
      );

      try {
        const url = `${BACKEND_URL}/api/vt/result/${encodeURIComponent(id)}`;
        console.log(`[${attempt}/${POLLING_CONFIG.maxAttempts}] Polling:`, url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        let payload;

        try {
          payload = await readApiResponse(
            response,
            `Result polling failed (HTTP ${response.status})`,
          );
        } catch (pollError) {
          if (response.status === 404 || response.status === 429) {
            console.warn(
              `Polling temporarily unavailable (${response.status}):`,
              pollError.message,
            );
          } else {
            throw pollError;
          }
        }

        if (payload) {
          const vtStatus = payload.data?.attributes?.status;

          if (vtStatus === "queued") {
            setStatus(`Queued (${attempt}/${POLLING_CONFIG.maxAttempts})...`);
          } else if (vtStatus === "running") {
            setStatus(
              `Analyzing (${attempt}/${POLLING_CONFIG.maxAttempts})...`,
            );
          } else if (vtStatus === "completed") {
            clearPolling();

            setProgress(90);
            setStatus("Fetching metadata...");
            setResult(payload);

            let targetId = id;

            if (scanType === "file") {
              targetId =
                payload.meta?.file_info?.sha256 ||
                payload.data?.attributes?.sha256 ||
                id;
            } else if (scanType === "url") {
              targetId =
                payload.meta?.url_info?.id ||
                payload.data?.attributes?.url_info?.id ||
                id;
            }

            const metadataResult = await fetchMetadata(scanType, targetId);

            setMetadata(metadataResult);
            await saveToHistory(payload, metadataResult, inputName, scanType);

            setProgress(100);
            setStatus("✅ Scan completed!");
            setLoading(false);
            setTimeout(() => setStatus(""), 2000);
            return;
          } else if (vtStatus) {
            console.warn("Unknown VirusTotal status:", vtStatus);
          } else {
            console.warn("No status in polling response:", payload);
          }
        }
      } catch (pollError) {
        console.error(`Poll attempt ${attempt} error:`, pollError);
      }

      if (attempt >= POLLING_CONFIG.maxAttempts) {
        clearPolling();
        setLoading(false);
        setError(
          "Analysis timeout. VirusTotal server may be slow or rate-limited.",
        );
        setProgress(0);
        setStatus("");
        return;
      }

      pollRef.current = setTimeout(poll, POLLING_CONFIG.intervalMs);
    };

    pollRef.current = setTimeout(poll, 1200);
  };

  /**
   * Handle URL scan
   */
  const handleScanUrl = async () => {
    const targetUrl = input.trim();

    if (!targetUrl) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);
    setProgress(0);

    try {
      setStatus("Submitting URL...");

      const response = await fetch(`${BACKEND_URL}/api/vt/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const payload = await readApiResponse(
        response,
        `URL scan failed (HTTP ${response.status})`,
      );

      if (!payload.data?.id) {
        throw new Error("No analysis ID received");
      }

      setAnalysisId(payload.data.id);
      setProgress(10);
      setStatus("Analysis queued, waiting for results...");
      startPolling(payload.data.id, "url", targetUrl);
    } catch (scanError) {
      console.error("❌ URL scan error:", scanError);
      setError(
        scanError instanceof Error ? scanError.message : "URL scan failed",
      );
      setLoading(false);
      setProgress(0);
      setStatus("");
    }
  };

  /**
   * Handle file scan
   */
  const handleScanFile = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    const usesLegacyLocalBackend = LOCAL_BACKEND_PATTERN.test(BACKEND_URL);
    const maxSize = usesLegacyLocalBackend
      ? 650 * 1024 * 1024
      : 32 * 1024 * 1024;
    const maxSizeLabel = usesLegacyLocalBackend ? "650MB" : "32MB";

    if (selectedFile.size <= 0) {
      setError("The selected file is empty");
      return;
    }

    if (selectedFile.size > maxSize) {
      setError(
        `File too large. Maximum size: ${maxSizeLabel}. Your file: ${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(2)}MB`,
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);
    setProgress(0);

    try {
      let response;

      if (usesLegacyLocalBackend) {
        setStatus("Uploading file to local scanner...");

        const formData = new FormData();
        formData.append("file", selectedFile);

        response = await fetch(`${BACKEND_URL}/api/vt/scan-file`, {
          method: "POST",
          body: formData,
        });
      } else {
        setStatus("Preparing secure upload...");
        setProgress(5);

        const blobResult = await upload(
          `scanner/${Date.now()}-${sanitizeUploadName(selectedFile.name)}`,
          selectedFile,
          {
            access: "private",
            handleUploadUrl: `${BACKEND_URL}/api/blob/upload`,
            clientPayload: JSON.stringify({
              purpose: "virus-total-scan",
              size: selectedFile.size,
            }),
            multipart: selectedFile.size >= 5 * 1024 * 1024,
          },
        );

        if (!blobResult?.url) {
          throw new Error("Temporary upload did not return a Blob URL");
        }

        setProgress(15);
        setStatus("Sending file to VirusTotal...");

        response = await fetch(`${BACKEND_URL}/api/vt/scan-file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            blobUrl: blobResult.url,
            fileName: selectedFile.name,
          }),
        });
      }

      const payload = await readApiResponse(
        response,
        `File scan failed (HTTP ${response.status})`,
      );

      if (!payload.data?.id) {
        throw new Error("No analysis ID received");
      }

      setAnalysisId(payload.data.id);
      setProgress(20);
      setStatus("File uploaded, waiting for analysis...");
      startPolling(payload.data.id, "file", selectedFile.name);
    } catch (scanError) {
      console.error("❌ File scan error:", scanError);
      setError(
        scanError instanceof Error ? scanError.message : "File scan failed",
      );
      setLoading(false);
      setProgress(0);
      setStatus("");
    }
  };

  /**
   * Handle search
   */
  const handleSearch = async () => {
    const query = input.trim();

    if (!query) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);
    setProgress(0);

    try {
      setStatus("Searching database...");

      const response = await fetch(
        `${BACKEND_URL}/api/vt/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      const payload = await readApiResponse(
        response,
        `Search failed (HTTP ${response.status})`,
      );

      if (!Array.isArray(payload.data) || payload.data.length === 0) {
        throw new Error("No results found in VirusTotal database");
      }

      const item = payload.data[0];
      const itemType = item.type === "ip_address" ? "ip" : item.type;
      const simulatedResult = {
        success: true,
        data: {
          id: item.id,
          type: item.type,
          attributes: {
            stats: item.attributes?.last_analysis_stats || {
              malicious: 0,
              suspicious: 0,
              undetected: 0,
              harmless: 0,
            },
            results: item.attributes?.last_analysis_results || {},
            status: "completed",
          },
        },
      };

      setResult(simulatedResult);
      setMetadata(item);
      setProgress(100);
      setStatus("Search complete!");

      await saveToHistory(simulatedResult, item, query, itemType || "search");

      setLoading(false);
      setTimeout(() => setStatus(""), 2000);
    } catch (searchError) {
      console.error("❌ Search error:", searchError);
      setError(
        searchError instanceof Error ? searchError.message : "Search failed",
      );
      setLoading(false);
      setProgress(0);
      setStatus("");
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    setActiveTab("detection");

    if (mode === "scan") {
      handleScanUrl();
    } else if (mode === "file") {
      handleScanFile();
    } else if (mode === "search") {
      handleSearch();
    }
  };

  /**
   * Clear all inputs
   */
  const handleClear = () => {
    setInput("");
    setSelectedFile(null);
    setResult(null);
    setMetadata(null);
    setStatus("");
    setError("");
    setProgress(0);
  };

  /**
   * Handle mode change
   */
  const handleModeChange = (newMode) => {
    if (newMode === "history") {
      setShowHistoryTab(true);
      setResult(null);
    } else {
      setMode(newMode);
      setShowHistoryTab(false);
      handleClear();
    }
  };

  // ============= DATA PROCESSING =============
  const stats = result?.data?.attributes?.stats || {
    malicious: 0,
    suspicious: 0,
    undetected: 0,
    harmless: 0,
  };

  const vendorObj = result?.data?.attributes?.results || {};
  const vendorList = Object.entries(vendorObj)
    .filter(([vendor]) => vendor && vendor.trim() !== "")
    .map(([vendor, info]) => ({
      vendor,
      category: info?.category || "undetected",
      result: info?.result || info?.category || "clean",
    }));

  // ============= RENDER =============
  return (
    <div
      className={`${isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-zinc-900"} min-h-screen font-sans transition-colors duration-500`}
    >
      <Header isDarkMode={isDarkMode} />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <InputSection
          mode={mode}
          input={input}
          setInput={setInput}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          loading={loading}
          status={status}
          progress={progress}
          handleSubmit={handleSubmit}
          onModeChange={handleModeChange}
          showHistoryTab={showHistoryTab}
          isDarkMode={isDarkMode}
        />

        {showHistoryTab && (
          <HistoryTab
            history={history}
            clearHistory={clearHistory}
            restoreHistory={restoreHistory}
            isDarkMode={isDarkMode}
          />
        )}

        <AnimatePresence>
          {loading && <SkeletonLoader isDarkMode={isDarkMode} />}
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={handleSubmit}
              isDarkMode={isDarkMode}
            />
          )}
          {!loading && !error && !result && !showHistoryTab && (
            <EmptyState isDarkMode={isDarkMode} />
          )}

          {result && !showHistoryTab && (
            <div className="space-y-6">
              <ResultSummary
                result={result}
                metadata={metadata}
                stats={stats}
                input={input}
                mode={mode}
                selectedFile={selectedFile}
                isDarkMode={isDarkMode}
              />

              <NavigationTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isDarkMode={isDarkMode}
              />

              <div className="min-h-[500px]">
                {activeTab === "detection" && (
                  <DetectionTab
                    stats={stats}
                    vendorList={vendorList}
                    showAllVendors={showAllVendors}
                    setShowAllVendors={setShowAllVendors}
                    isDarkMode={isDarkMode}
                  />
                )}
                {activeTab === "details" && (
                  <DetailsTab metadata={metadata} isDarkMode={isDarkMode} />
                )}
                {activeTab === "intelligence" && (
                  <IntelligenceTab
                    id={metadata?.id || result?.data?.id}
                    type={metadata?.type || result?.data?.type || mode}
                    isDarkMode={isDarkMode}
                    backendUrl={BACKEND_URL}
                  />
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <Toast message={toast?.message} type={toast?.type} isVisible={!!toast} />
    </div>
  );
}
