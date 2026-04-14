import React, { useState, useEffect, useContext, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import supabase from '../supabaseClient';

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

export default function WebsiteSecurityScanner() {
  const { isDarkMode } = useContext(ThemeContext);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // UI state
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

  const [activeTab, setActiveTab] = useState("detection");
  const [showAllVendors, setShowAllVendors] = useState(false);

  // HISTORY STATE
  const [history, setHistory] = useState([]);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const pollRef = React.useRef(null);
  const abortRef = React.useRef(null);

  // TOAST STATE
  const [toast, setToast] = useState(null);
const fetchAdvancedDetails = async (type, targetValue) => {
  try {
    setStatus(`Mengambil data intelijen untuk ${type}...`);
    let endpoint = "";

    // Tentukan endpoint berdasarkan kebutuhan
    if (type === "ip") endpoint = `ip_addresses/${targetValue}`;
    else if (type === "domain") endpoint = `domains/${targetValue}`;
    else if (type === "mitre") endpoint = `files/${targetValue}/behaviour_mitre_trees`;
    else if (type === "tactics") endpoint = `attack_tactics/${targetValue}`;
    else if (type === "graph") endpoint = `graphs/${targetValue}`;

    if (!endpoint) return;

    // Hit ke Proxy Backend kita!
    const res = await fetch(`${BACKEND_URL}/api/vt/proxy/${endpoint}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Gagal mengambil data");

    console.log(`[Advanced Info ${type}]:`, data);
    return data;
    
  } catch (err) {
    console.error("Advanced Fetch Error:", err);
    setError(err.message);
  }
};
  // 🔧 Fix Normalisasi URL Backend
  const BACKEND_URL = (
    import.meta.env.VITE_BACKEND_URL ||
    (window.location.hostname.includes("localhost")
      ? "http://localhost:5000"
      : "https://ananta-ti.vercel.app")
  ).replace(/\/+$/, "");

  // Debug log untuk memeriksa URL
  useEffect(() => {
    console.log("Backend URL:", BACKEND_URL);
    console.log("Current hostname:", window.location.hostname);
  }, []);

  // --- HISTORY LOGIC ---
  useEffect(() => {
    // 🔥 PERUBAHAN KRUSIAL: Cek sessionStorage di awal
    const isHistoryCleared = sessionStorage.getItem('historyCleared');
    if (isHistoryCleared === 'true') {
      console.log("🚫 Riwayat telah dibersihkan di sesi ini. Tidak memuat dari Supabase.");
      return; // Jangan jalankan apa-apa lagi
    }

    console.log("🚀 Memuat riwayat awal dari localStorage dan Supabase...");

    // 1. Muat dari localStorage terlebih dahulu
    const loadLocal = localStorage.getItem("scanHistory");
    if (loadLocal) {
      try {
        const localHistory = JSON.parse(loadLocal);
        setHistory(localHistory);
        console.log("✅ Berhasil memuat riwayat dari localStorage.");
      } catch (err) {
        console.error("Error parsing local history:", err);
        localStorage.removeItem("scanHistory");
      }
    }

    // 2. Lalu, muat dari Supabase dan gabungkan
    const loadSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("scan_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map((d) => ({
            ...d,
            timestamp: new Date(d.created_at).getTime(),
            id: d.vt_id || d.id
          }));
          
          setHistory((prevHistory) => {
            const combined = [...formatted, ...prevHistory];
            const unique = Array.from(new Map(combined.map(item => [item.vt_id || item.id, item])).values());
            const sortedUnique = unique.sort((a, b) => b.timestamp - a.timestamp);
            return sortedUnique.slice(0, 20);
          });
          console.log("✅ Berhasil memuat dan menggabungkan riwayat dari Supabase.");
        }
      } catch (err) {
        console.error("Error loading Supabase history:", err);
      }
    };

    loadSupabase();
  }, []); // Hanya berjalan sekali saat mount

  // Save History (diperbaiki untuk Supabase)
  const saveToHistory = async (resData, metaData, name, type) => {
    // 🔥 PERUBAHAN: Jika riwayat disimpan, hapus flag 'historyCleared' dari sessionStorage
    sessionStorage.removeItem('historyCleared');
    console.log("✅ Flag 'historyCleared' dihapus dari sessionStorage karena ada scan baru.");

    const supabaseItem = {
      vt_id: resData.data.id,
      name,
      type,
      stats: resData.data.attributes.stats,
      result: resData,
      metadata: metaData
    };

    const localItem = {
      ...supabaseItem,
      id: resData.data.id,
      timestamp: Date.now(),
    };

    try {
      await supabase.from("scan_history").insert([supabaseItem]);
      console.log("Successfully saved to Supabase");
    } catch (err) {
      console.warn("Supabase insert failed (non-blocking):", err);
    }

    const newList = [localItem, ...history].slice(0, 20);
    setHistory(newList);
    localStorage.setItem("scanHistory", JSON.stringify(newList));
  };

  const restoreHistory = (item) => {
    setResult(item.result);
    setMetadata(item.metadata);
    setShowHistoryTab(false);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // 🔥 PERUBAHAN: Fungsi clearHistory sekarang menggunakan sessionStorage
  const clearHistory = () => {
    console.log("🗑️ Membersihkan riwayat tampilan, localStorage, dan menandai di sessionStorage...");
    setHistory([]);
    localStorage.removeItem("scanHistory");
    
    // Set flag di sessionStorage agar bertahan saat refresh
    sessionStorage.setItem('historyCleared', 'true');
    
    setToast({ message: "Riwayat berhasil dibersihkan", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  // --- API HANDLERS ---
const fetchMetadata = async (type, id) => {
  try {
    let endpointType = "files";
    if (type === "url") endpointType = "urls";
    if (type === "domain") endpointType = "domains";
    if (type === "ip") endpointType = "ip_addresses";

    const res = await fetch(`${BACKEND_URL}/api/vt/${endpointType}/${id}`);

    if (!res.ok) return null;

    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
};

const startPolling = useCallback(async (analysisId, type, inputName) => {
  let attempt = 0;
  const maxAttempts = 20;
  const intervalMs = 5000;

  if (pollRef.current) clearInterval(pollRef.current);
  if (abortRef.current) abortRef.current.abort();

  abortRef.current = new AbortController();

  setProgress(0);
  setStatus("Menganalisis...");

  pollRef.current = setInterval(async () => {
    attempt++;

    try {
      const res = await fetch(`${BACKEND_URL}/api/vt/analyses/${analysisId}`);
      const data = await res.json();

      const vtStatus = data?.data?.attributes?.status;

if (!vtStatus) {
  console.warn("Status belum tersedia:", data);
  return;
}

      if (vtStatus === "queued") {
        setStatus("Masih dalam antrean...");
        return;
      }

      if (vtStatus === "running") {
        setStatus("Sedang dianalisis...");
        return;
      }

      // ✅ HANYA DI SINI AMBIL METADATA
      if (vtStatus === "completed") {
        clearInterval(pollRef.current);
        pollRef.current = null;

        setResult(data);
        setStatus("Mengambil metadata...");

        let targetId = null;

        if (type === "file") {
          targetId =
            data.meta?.file_info?.sha256 ||
            data.data?.attributes?.sha256;
        }

        if (type === "url") {
          targetId = data.meta?.url_info?.id;
        }

        if (targetId) {
          const meta = await fetchMetadata(type, targetId);
          setMetadata(meta);
        } else {
          console.warn("Metadata tidak tersedia");
        }

        setLoading(false);
        setStatus("Selesai!");
        return;
      }

      if (attempt >= maxAttempts) {
  clearInterval(pollRef.current);
  pollRef.current = null;

  setStatus("Server tidak merespons dengan benar.");
  setError("Scan tidak pernah selesai. Kemungkinan backend bermasalah.");
  setLoading(false);
  return;
}

    } catch (err) {
      clearInterval(pollRef.current);
      pollRef.current = null;

      setError("Gagal polling");
      setLoading(false);
    }
  }, intervalMs);
}, [BACKEND_URL]);



  const handleScanUrl = async () => {
    if (!input) return;

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);

    try {
      console.log("Starting scan for:", input);
      console.log("Using backend URL:", BACKEND_URL);
      
      const res = await // SCAN URL
fetch(`${BACKEND_URL}/api/vt/urls`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({ url: input }),
});

      const data = await res.json();
      const vtStatus = data?.data?.attributes?.status;

if (vtStatus === "queued") {
  setStatus("Masih dalam antrean...");
} else if (vtStatus === "running") {
  setStatus("Sedang dianalisis...");
}
      console.log("Scan response:", data);
      
      if (!res.ok) {
        console.error("Scan request failed:", res.status, data);
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      
      const analysisId = data.data?.id || data.analysis_id;
      if (!analysisId) {
        console.error("No analysis ID in response:", data);
        throw new Error("Tidak mendapatkan analysis ID.");
      }

      console.log("Got analysis ID:", analysisId);
      setAnalysisId(analysisId);
      startPolling(analysisId, "url", input);

    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Scan gagal dimulai.");
      setLoading(false);
    }
  };

  const handleScanFile = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${BACKEND_URL}/api/vt/scan-file`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
if (!data?.data) {
  console.error("Response aneh:", data);
  setError("Format response tidak valid dari server.");
  setLoading(false);
  return;
}
      setAnalysisId(data.data.id);
      startPolling(data.data.id, "file", selectedFile.name);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleSearch = async () => {
    if (!input) return;
    setLoading(true); 
    setError(""); 
    setStatus("Searching DB..."); 
    setResult(null); 
    setMetadata(null); 
    setShowHistoryTab(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/vt/search?query=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (!res.ok || !data.data || data.data.length === 0) throw new Error("Data tidak ditemukan.");

      const item = data.data[0];
      const simulatedResult = {
        data: {
          id: item.id, type: item.type,
          attributes: {
            url: input, content: { title: item.attributes.meaningful_name || item.type },
            date: item.attributes.last_analysis_date,
            stats: item.attributes.last_analysis_stats,
            results: item.attributes.last_analysis_results,
            status: "completed"
          }
        }
      };
      setResult(simulatedResult);
      setMetadata(item);
      
      saveToHistory(simulatedResult, item, input, 'search');
      
      setStatus("Selesai!");
      setLoading(false);
    } catch (err) { 
      setError(`Error: ${err.message}`); 
      setLoading(false); 
      setProgress(0); 
    }
  }

  const handleSubmit = () => {
    setActiveTab("detection");
    if (mode === "scan") handleScanUrl();
    else if (mode === "file") handleScanFile();
    else handleSearch();
  }

  const handleClear = () => {
    setInput(""); 
    setSelectedFile(null); 
    setResult(null); 
    setMetadata(null); 
    setStatus(""); 
    setError(""); 
    setProgress(0);
  }

  const handleModeChange = (newMode) => {
    if (newMode === "history") { 
      setShowHistoryTab(true); 
      setResult(null); 
    }
    else { 
      setMode(newMode); 
      setShowHistoryTab(false); 
      handleClear(); 
    }
  }

  // --- DATA PROCESSING ---
  const stats = result?.data?.attributes?.stats || {};
  const vendorObj = result?.data?.attributes?.results || {};
  const vendorList = Object.entries(vendorObj).map(([vendor, info]) => ({
    vendor, category: info?.category || "unrated", result: info?.result || info?.category || "clean"
  }));

  return (
    <div className={`${isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-zinc-900"} min-h-screen font-sans transition-colors duration-500`}>
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
            handleClear={handleClear}
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
          {error && <ErrorDisplay error={error} onRetry={handleSubmit} isDarkMode={isDarkMode} />}
          {!loading && !error && !result && !showHistoryTab && <EmptyState isDarkMode={isDarkMode} />}
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
                {activeTab === 'detection' && (
                  <DetectionTab stats={stats} vendorList={vendorList} showAllVendors={showAllVendors} setShowAllVendors={setShowAllVendors} isDarkMode={isDarkMode} />
                )}
                {activeTab === 'details' && (
                  <DetailsTab metadata={metadata} isDarkMode={isDarkMode} />
                )}
                {/* TAMBAHKAN INI */}
                {activeTab === 'intelligence' && (
                  <IntelligenceTab 
                    id={metadata?.id} 
                    type={metadata?.type} 
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