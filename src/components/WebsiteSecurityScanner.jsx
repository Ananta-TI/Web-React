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

// ============= CONFIGURATION =============
const BACKEND_CONFIG = {
  // Try to use VITE_BACKEND_URL first, then fallback
  getBackendUrl: () => {
    // Check if we're on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }

    // For deployed version, use Vercel API
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('netlify.app')) {
      return window.location.origin; // Same origin for Vercel
    }

    // Fallback
    return import.meta.env.VITE_BACKEND_URL || window.location.origin;
  }
};

const POLLING_CONFIG = {
  maxAttempts: 60,           // 5 minutes with 5s interval
  intervalMs: 5000,          // 5 seconds
  timeoutMs: 300000          // 5 minutes total
};

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
  const abortRef = React.useRef(null);
  const pollTimeoutRef = React.useRef(null);

  // Get backend URL
  const BACKEND_URL = BACKEND_CONFIG.getBackendUrl();

  // ============= LOGGING =============
  useEffect(() => {
    console.log('🚀 Scanner initialized');
    console.log('Backend URL:', BACKEND_URL);
    console.log('Dark Mode:', isDarkMode);
    console.log('Hostname:', window.location.hostname);
  }, [BACKEND_URL, isDarkMode]);

  // ============= CLEANUP =============
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ============= HISTORY MANAGEMENT =============
  useEffect(() => {
    const loadHistory = async () => {
      const isHistoryCleared = sessionStorage.getItem('historyCleared') === 'true';
      if (isHistoryCleared) {
        console.log('🚫 History cleared in this session');
        return;
      }

      // Load from localStorage
      const localHistory = localStorage.getItem("scanHistory");
      if (localHistory) {
        try {
          const parsed = JSON.parse(localHistory);
          setHistory(Array.isArray(parsed) ? parsed : []);
          console.log('✅ Loaded history from localStorage');
        } catch (err) {
          console.error('Error parsing localStorage:', err);
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
          console.warn('Supabase history load error:', supabaseErr);
          return;
        }

        if (data?.length > 0) {
          const formatted = data.map((d) => ({
            ...d,
            timestamp: new Date(d.created_at).getTime(),
            id: d.vt_id || d.id
          }));

          setHistory(prevHistory => {
            const combined = [...formatted, ...prevHistory];
            const unique = Array.from(
              new Map(combined.map(item => [item.vt_id || item.id, item])).values()
            );
            const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);
            return sorted.slice(0, 20);
          });
          console.log('✅ Loaded history from Supabase');
        }
      } catch (err) {
        console.warn('Supabase load error:', err);
      }
    };

    loadHistory();
  }, []);

  // ============= UTILITY FUNCTIONS =============
  const saveToHistory = async (resData, metaData, name, scanType) => {
    sessionStorage.removeItem('historyCleared');

    const supabaseItem = {
      vt_id: resData.data.id,
      name,
      type: scanType,
      stats: resData.data.attributes?.stats || {},
      result: resData,
      metadata: metaData,
      created_at: new Date().toISOString()
    };

    const localItem = {
      ...supabaseItem,
      id: resData.data.id,
      timestamp: Date.now()
    };

    // Save to Supabase (non-blocking)
    try {
      await supabase.from("scan_history").insert([supabaseItem]);
      console.log('✅ Saved to Supabase');
    } catch (err) {
      console.warn('⚠️ Supabase save error:', err);
    }

    // Save to localStorage
    const newList = [localItem, ...history].slice(0, 20);
    setHistory(newList);
    localStorage.setItem("scanHistory", JSON.stringify(newList));
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const clearHistory = () => {
    console.log('🗑️ Clearing history');
    setHistory([]);
    localStorage.removeItem("scanHistory");
    sessionStorage.setItem('historyCleared', 'true');
    showToast('History cleared', 'success');
  };

  const restoreHistory = (item) => {
    setResult(item.result);
    setMetadata(item.metadata);
    setShowHistoryTab(false);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // ============= API CALLS =============

  /**
   * Fetch metadata for a given ID
   */
  const fetchMetadata = async (type, id) => {
    if (!type || !id) {
      console.warn('fetchMetadata: Missing type or id', { type, id });
      return null;
    }

    try {
      setStatus('Fetching detailed metadata...');

      // Map type
      const typeMap = {
        'file': 'file',
        'url': 'url',
        'domain': 'domain',
        'ip': 'ip'
      };

      const mappedType = typeMap[type] || type;
      const params = new URLSearchParams({ id });
      
      const url = `${BACKEND_URL}/api/vt/metadata/${mappedType}?${params}`;
      console.log('📥 Fetching metadata:', url);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (res.status === 404) {
        console.warn('Metadata not found for:', id);
        return null;
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Metadata fetch error:', res.status, errorData);
        return null;
      }

      const data = await res.json();
      console.log('✅ Metadata fetched:', data);
      return data.data || data;

    } catch (err) {
      console.error('❌ fetchMetadata error:', err.message);
      return null;
    }
  };

  /**
   * Start polling for analysis results
   */
  const startPolling = useCallback((id, scanType, inputName) => {
    console.log('🔄 Starting polling for:', id, 'Type:', scanType);

    let attempt = 0;
    let isCompleted = false;

    // Cleanup previous polling
    if (pollRef.current) clearInterval(pollRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    // Set timeout for max polling duration
    pollTimeoutRef.current = setTimeout(() => {
      console.error('⏱️ Polling timeout exceeded');
      if (pollRef.current) clearInterval(pollRef.current);
      
      setLoading(false);
      setError('Analysis took too long. Please try again.');
      setProgress(0);
      setStatus('');
    }, POLLING_CONFIG.timeoutMs);

    // Start polling
    pollRef.current = setInterval(async () => {
      if (isCompleted) return;

      attempt++;
      const progressPercent = Math.min((attempt / POLLING_CONFIG.maxAttempts) * 100, 90);
      setProgress(progressPercent);

      try {
        const url = `${BACKEND_URL}/api/vt/result/${id}`;
        console.log(`[${attempt}/${POLLING_CONFIG.maxAttempts}] Polling:`, url);

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.warn(`Poll failed (${res.status}):`, errorData);
          return; // Continue polling
        }

        const data = await res.json();
        const vtStatus = data.data?.attributes?.status;

        if (!vtStatus) {
          console.warn('No status in response:', data);
          return; // Continue polling
        }

        console.log('Status:', vtStatus, 'Attempt:', attempt);

        // Handle different statuses
        if (vtStatus === 'queued') {
          setStatus(`Queued (${attempt}/${POLLING_CONFIG.maxAttempts})...`);
          return;
        }

        if (vtStatus === 'running') {
          setStatus(`Analyzing (${attempt}/${POLLING_CONFIG.maxAttempts})...`);
          return;
        }

        if (vtStatus === 'completed') {
          console.log('✅ Analysis completed!');
          isCompleted = true;
          
          // Stop polling
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
          }

          // Update UI
          setProgress(90);
          setStatus('Fetching metadata...');
          setResult(data);

          // Fetch metadata
          // For URL scans: VT analysis response contains meta.url_info.id which is
          // the SHA-256 hash of the URL — this is the correct ID for /api/vt/metadata/url
          // For file scans: use sha256 from attributes
          // Fallback: use the analysis id itself
          let targetId = id;

          if (scanType === 'file') {
            targetId = data.data?.attributes?.sha256 || id;
          }

          if (scanType === 'url') {
            // meta.url_info.id is the URL identifier (sha256 of the url)
            targetId = data.meta?.url_info?.id || id;
          }

          console.log('Fetching metadata for:', targetId, 'Type:', scanType);

          const meta = await fetchMetadata(scanType, targetId);
          if (meta) {
            setMetadata(meta);
          }

          // Save to history
          await saveToHistory(data, meta, inputName, scanType);

          setProgress(100);
          setStatus('✅ Scan completed!');
          setLoading(false);

          // Clear status after delay
          setTimeout(() => setStatus(''), 2000);
          return;
        }

      } catch (err) {
        console.error(`Poll attempt ${attempt} error:`, err.message);
      }

      // Check max attempts
      if (attempt >= POLLING_CONFIG.maxAttempts) {
        console.error('❌ Max polling attempts reached');
        if (pollRef.current) clearInterval(pollRef.current);
        
        setLoading(false);
        setError('Analysis timeout. VirusTotal server may be slow.');
        setProgress(0);
        setStatus('');
      }
    }, POLLING_CONFIG.intervalMs);

  }, [BACKEND_URL]);

  /**
   * Handle URL scan
   */
  const handleScanUrl = async () => {
    if (!input.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);
    setProgress(0);

    try {
      console.log('🔍 Scanning URL:', input);
      setStatus('Submitting URL...');

      const url = `${BACKEND_URL}/api/vt/scan`;
      console.log('📤 POST to:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: input.trim() })
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Scan error:', errorData);
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Scan response:', data);

      if (!data.data?.id) {
        throw new Error('No analysis ID received');
      }

      setAnalysisId(data.data.id);
      setProgress(10);
      setStatus('Analysis queued, waiting for results...');

      // Start polling
      startPolling(data.data.id, 'url', input.trim());

    } catch (err) {
      console.error('❌ Scan error:', err.message);
      setError(err.message);
      setLoading(false);
      setProgress(0);
      setStatus('');
    }
  };

  /**
   * Handle file scan
   */
  const handleScanFile = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    // Validate file size (650MB max)
    const maxSize = 650 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File too large. Maximum size: 650MB. Your file: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);
    setProgress(0);

    try {
      console.log('📁 Scanning file:', selectedFile.name, `(${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`);
      setStatus('Uploading file...');

      const formData = new FormData();
      formData.append('file', selectedFile);

      const url = `${BACKEND_URL}/api/vt/scan-file`;
      console.log('📤 POST to:', url);

      const res = await fetch(url, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('File scan error:', errorData);
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('File scan response:', data);

      if (!data.data?.id) {
        throw new Error('No analysis ID received');
      }

      setAnalysisId(data.data.id);
      setProgress(20);
      setStatus('File uploaded, waiting for analysis...');

      // Start polling
      startPolling(data.data.id, 'file', selectedFile.name);

    } catch (err) {
      console.error('❌ File scan error:', err.message);
      setError(err.message);
      setLoading(false);
      setProgress(0);
      setStatus('');
    }
  };

  /**
   * Handle search
   */
  const handleSearch = async () => {
    if (!input.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setMetadata(null);
    setShowHistoryTab(false);
    setProgress(0);

    try {
      console.log('🔎 Searching for:', input);
      setStatus('Searching database...');

      const url = `${BACKEND_URL}/api/vt/search?query=${encodeURIComponent(input.trim())}`;
      console.log('📥 GET from:', url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('Search results:', data);

      if (!data.data || data.data.length === 0) {
        throw new Error('No results found in VirusTotal database');
      }

      const item = data.data[0];
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
              harmless: 0
            },
            results: item.attributes?.last_analysis_results || {},
            status: 'completed'
          }
        }
      };

      setResult(simulatedResult);
      setMetadata(item);
      setProgress(100);
      setStatus('Search complete!');

      // Save to history
      await saveToHistory(simulatedResult, item, input.trim(), 'search');

      setLoading(false);
      setTimeout(() => setStatus(''), 2000);

    } catch (err) {
      console.error('❌ Search error:', err.message);
      setError(err.message);
      setLoading(false);
      setProgress(0);
      setStatus('');
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
    harmless: 0
  };

  const vendorObj = result?.data?.attributes?.results || {};
  const vendorList = Object.entries(vendorObj)
    .filter(([vendor]) => vendor && vendor.trim() !== "")
    .map(([vendor, info]) => ({
      vendor,
      category: info?.category || "undetected",
      result: info?.result || info?.category || "clean"
    }));

  // ============= RENDER =============
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
                  <DetectionTab 
                    stats={stats} 
                    vendorList={vendorList} 
                    showAllVendors={showAllVendors} 
                    setShowAllVendors={setShowAllVendors} 
                    isDarkMode={isDarkMode} 
                  />
                )}
                {activeTab === 'details' && (
                  <DetailsTab metadata={metadata} isDarkMode={isDarkMode} />
                )}
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