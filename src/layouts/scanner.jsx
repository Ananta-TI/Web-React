import React, { createContext, useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import {
  ExternalLink,
  Search,
  FolderOpen,
  ShieldCheck,
  AlertTriangle,
  Skull,
  Loader2,
  BarChart2,
  ListFilter,
  Calendar, // Icon baru untuk tanggal
  Activity, // Icon baru untuk method
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// -------------------------
// Helper components
// -------------------------

// Helper function untuk mendapatkan warna dan ikon berdasarkan kategori
const getCategoryDetails = (category, isDarkMode) => {
  switch (category) {
    case "harmless":
      return {
        icon: ShieldCheck,
        colorClass: isDarkMode
          ? "bg-green-600/20 text-green-400"
          : "bg-green-100 text-green-700",
        ringColor: "ring-green-500",
        dotColor: "bg-green-500",
      };
    case "suspicious":
      return {
        icon: AlertTriangle,
        colorClass: isDarkMode
          ? "bg-yellow-600/20 text-yellow-400"
          : "bg-yellow-100 text-yellow-700",
        ringColor: "ring-yellow-500",
        dotColor: "bg-yellow-500",
      };
    case "malicious":
      return {
        icon: Skull,
        colorClass: isDarkMode
          ? "bg-red-600/20 text-red-400"
          : "bg-red-100 text-red-700",
        ringColor: "ring-red-500",
        dotColor: "bg-red-500",
      };
    case "undetected":
    case "unrated":
    default:
      return {
        icon: Search,
        colorClass: isDarkMode
          ? "bg-gray-600/20 text-gray-400"
          : "bg-gray-100 text-gray-700",
        ringColor: "ring-gray-500",
        dotColor: "bg-gray-500",
      };
  }
};

const StatCard = ({ label, value, icon: Icon, colorClass, isDarkMode }) => {
  const finalColorClass = colorClass || (isDarkMode ? "bg-zinc-800/50" : "bg-white");

  return (
    <div
      className={`p-4 sm:p-6 rounded-xl text-center backdrop-blur-sm border transition-colors duration-300 ${finalColorClass} ${
        isDarkMode ? "border-white/10" : "border-gray-200"
      }`}
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
      <div className="text-xl sm:text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs sm:text-sm opacity-80">{label}</div>
    </div>
  );
};


// Custom Tooltip untuk Recharts
const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`p-2 rounded shadow-lg backdrop-blur-md text-sm ${
          isDarkMode
            ? "bg-zinc-700/70 border border-zinc-600 text-white"
            : "bg-white/90 border border-gray-300 text-zinc-900"
        }`}
      >
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p>{`Count: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};


// -------------------------
// Main component
// -------------------------
export default function WebsiteSecurityScanner() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // UI state
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  const [result, setResult] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Dynamic backend URL detection
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://ananta-ti.vercel.app");

  // submit URL to backend
  async function handleScan() {
    if (!input) return;
    setLoading(true);
    setStatus("Mengirim URL ke VirusTotal...");
    setResult(null);
    setAnalysisId(null);
    try {
      console.log("🔍 Scanning URL:", input);
      console.log("🌐 Backend URL:", BACKEND_URL);
      
      const res = await fetch(`${BACKEND_URL}/api/vt/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
      });
      
      console.log("📡 Response status:", res.status);
      
      const data = await res.json();
      console.log("📦 Response data:", data);
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${data.message || "Failed to scan"}`);
      }
      
      // VirusTotal returns nested structure: { data: { id: "..." } }
      const analysisId = data.data?.id; // karena backend mengembalikan format VT asli
      
      if (!analysisId) {
        console.error("❌ Full response:", JSON.stringify(data, null, 2));
        throw new Error(`No analysis ID returned. Backend response: ${JSON.stringify(data)}`);
      }
      
      setAnalysisId(analysisId);
      setStatus("URL diterima. Menunggu hasil analisis...");
      // poll
      await pollResult(analysisId);
    } catch (err) {
      console.error("❌ Scan error:", err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function pollResult(id) {
    const maxRetries = 40;  // total ~200s
    const delayMs = 5000;   // 5 detik
    for (let i = 0; i < maxRetries; i++) {
      setStatus(`Menunggu hasil... (${i + 1}/${maxRetries})`);
      try {
        console.log(`🔄 Polling attempt ${i + 1}: Fetching ${BACKEND_URL}/api/vt/result/${id}`);
        const res = await fetch(`${BACKEND_URL}/api/vt/result/${id}`);
        console.log(`📡 Poll response status: ${res.status}`);
        if (res.ok) {
          const data = await res.json();
          console.log(`📦 Poll response data:`, data);
          const statusAttr = data?.data?.attributes?.status;
          console.log(`🔍 Status attribute: ${statusAttr}`);
          if (statusAttr === "completed") {
            setResult(data);
            setStatus("✅ Analisis selesai!");
            return;
          } else if (statusAttr === "queued" || statusAttr === "in-progress") {
            // Lanjutkan polling jika masih dalam proses
            console.log("⏳ Analysis still in progress, continuing poll...");
          } else {
            // Jika status lain (e.g., failed), hentikan dengan error
            throw new Error(`Analysis failed with status: ${statusAttr}`);
          }
        } else {
          console.error(`❌ Poll failed with status ${res.status}: ${res.statusText}`);
          // Jika error 404 atau 429 (rate limit), hentikan polling
          if (res.status === 404) {
            throw new Error("Analysis ID not found. Check if scan was successful.");
          } else if (res.status === 429) {
            throw new Error("Rate limit exceeded. Try again later.");
          }
        }
      } catch (err) {
        console.error("❌ Poll error:", err);
        setLoading(false); // Hentikan loader
        setStatus(`❌ Error during polling: ${err.message}`);
        return;  // Hentikan polling jika error fatal
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    setLoading(false); // Hentikan loader jika timeout
    setStatus("⏱ Timeout: hasil belum tersedia. Coba lagi nanti atau periksa VirusTotal langsung.");
  }

  // --- UPDATED PARSER ---
  // Menambahkan method dan result (detail) sesuai dokumentasi
  function parseVendors(resultData) {
    const obj = resultData?.data?.attributes?.results || {};
    return Object.entries(obj).map(([vendor, info]) => ({
      vendor,
      category: info?.category || "unrated",
      engine_name: info?.engine_name || vendor,
      method: info?.method || "unknown", // e.g., "blacklist", "monitor"
      result: info?.result || "clean",   // e.g., "phishing site", "clean"
    }));
  }
  
  const stats = result?.data?.attributes?.stats || {};
  const scanDate = result?.data?.attributes?.date; // Unix timestamp
  const vendorList = parseVendors(result || {});
  
  const categoryPriority = {
    malicious: 1,
    suspicious: 2,
    harmless: 3,
    undetected: 4,
    unrated: 5,
  };

  // Urutkan berdasarkan prioritas dan kemudian nama vendor
  const sortedVendors = vendorList.sort((a, b) => {
    const priA = categoryPriority[a.category] || 99;
    const priB = categoryPriority[b.category] || 99;
    if (priA !== priB) {
      return priA - priB;
    }
    return a.vendor.localeCompare(b.vendor);
  });

  const pieData = [
    { name: "Harmless", value: stats.harmless || 0, color: "#22c55e" }, // Green
    { name: "Suspicious", value: stats.suspicious || 0, color: "#f59e0b" }, // Amber
    { name: "Malicious", value: stats.malicious || 0, color: "#ef4444" }, // Red
    { name: "Undetected", value: stats.undetected || 0, color: "#6b7280" }, // Gray
  ].filter(d => d.value > 0); 
  
  // URL VirusTotal untuk analisis yang sedang berlangsung
  const vtAnalysisUrl = analysisId 
    ? `https://www.virustotal.com/gui/url/${result?.data?.attributes?.content?.url || input}/detection` 
    : null;

  // Format Date Helper
  const formatScanDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
      } min-h-screen transition-colors duration-500`}
    >
      {/* Header */}
      <div
        className={`top-0 z-40 backdrop-blur-lg border-b ${
          isDarkMode
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-white/90 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
          <div
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-zinc-800 text-zinc-300"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <div className="font-medium text-sm sm:text-base">Website Security</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 transition-colors duration-500 ${
          isDarkMode ? "text-white" : "text-zinc-900"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4">
            <DecryptedText
              text="Website Security Scanner"
              speed={100}
              maxIterations={105}
              sequential
              animateOn="view"
            />
          </h1>
          <p
            className={`text-base sm:text-lg ${
              isDarkMode ? "text-zinc-400" : "text-gray-600"
            }`}
          >
            Scan any URL using **VirusTotal** and show detailed vendor results.
          </p>
        </motion.div>

        {/* input + actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-zinc-400" : "text-gray-400"
              }`}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 text-sm sm:text-base ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleScan}
              disabled={loading || !input}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all text-sm sm:text-base text-white ${
                loading || !input
                  ? "bg-blue-800/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/30"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  Memproses...
                </div>
              ) : (
                "Scan"
              )}
            </button>
            <button
              onClick={() => {
                setInput("");
                setResult(null);
                setAnalysisId(null);
                setStatus("");
                setShowAll(false);
              }}
              disabled={loading}
              className={`px-3 sm:px-4 py-3 rounded-xl transition-colors text-sm sm:text-base ${
                isDarkMode
                  ? "bg-zinc-700/30 hover:bg-zinc-600/40 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-zinc-900"
              }`}
            >
              Clear
            </button>
          </div>
        </div>

        {status && (
          <p
            className={`text-sm text-center mb-6 transition-colors font-mono max-w-4xl mx-auto ${
              isDarkMode ? "text-zinc-400" : "text-gray-500"
            }`}
          >
            {status}
          </p>
        )}

        {/* RESULT CARD */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-5 sm:p-8 shadow-2xl transition-colors duration-500 max-w-4xl mx-auto ${
              isDarkMode
                ? "bg-zinc-800/80 border border-zinc-700/70"
                : "bg-white border border-gray-300/80 shadow-gray-300/50"
            }`}
          >
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8 border-b pb-5 border-dashed border-current/20">
              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs sm:text-sm truncate ${
                    isDarkMode ? "text-zinc-400" : "text-gray-600"
                  }`}
                >
                  {result?.data?.attributes?.url}
                </div>

                <h2 className="text-xl sm:text-3xl font-bold font-lyrae mt-1 truncate text-blue-400">
                  {result?.data?.attributes?.content?.title || "URL Scan Result"}
                </h2>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                    {/* Analysis ID */}
                    <div
                    className={`text-sm flex items-center gap-2 ${
                        isDarkMode ? "text-zinc-400" : "text-gray-700"
                    }`}
                    >
                        <BarChart2 className="w-4 h-4" />
                        <span className="font-medium">ID:</span> 
                        <span className="font-mono text-xs break-all opacity-80">
                            {analysisId ? `${analysisId.substring(0, 12)}...` : "-"}
                        </span>
                    </div>

                    {/* Scan Date - Ditambahkan */}
                    <div
                    className={`text-sm flex items-center gap-2 ${
                        isDarkMode ? "text-zinc-400" : "text-gray-700"
                    }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Analyzed:</span> 
                        <span className="text-xs">
                            {formatScanDate(scanDate)}
                        </span>
                    </div>
                </div>
              </div>

             
            </div>

            {/* GRID: STATS + PIE */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
              {/* Stats & Summary (2/5) */}
              <div className="lg:col-span-3">
                <h3 className="text-xl font-semibold mb-4">Summary by Category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Stat Items */}
                  {[
                    { label: "Malicious", value: stats.malicious, category: "malicious" },
                    { label: "Suspicious", value: stats.suspicious, category: "suspicious" },
                    { label: "Harmless", value: stats.harmless, category: "harmless" },
                    { label: "Undetected", value: stats.undetected, category: "undetected" },
                  ].map((item, idx) => {
                    const { colorClass, icon: Icon } = getCategoryDetails(item.category, isDarkMode);
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl text-center transition-colors duration-300 ${colorClass}`}
                      >
                        <div className="text-3xl font-extrabold flex items-center justify-center gap-2 mb-1">
                          <Icon className="w-5 h-5" />
                          {item.value ?? 0}
                        </div>
                        <div
                          className={`text-xs sm:text-sm mt-1 font-medium ${
                            isDarkMode ? "text-zinc-300" : "text-gray-800"
                          }`}
                        >
                          {item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pie Chart (2/5) */}
              <div className="lg:col-span-2 flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-4 text-center">Engine Distribution</h3>
                <div
                  className={`rounded-xl p-4 w-full flex justify-center items-center ${
                    isDarkMode ? "bg-zinc-800/60" : "bg-gray-100"
                  }`}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={3}
                        fill="#8884d8" // Fallback fill color
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} stroke={isDarkMode ? "#27272a" : "#ffffff"} strokeWidth={2}/>
                        ))}
                      </Pie>
                      <Tooltip 
                        content={<CustomTooltip isDarkMode={isDarkMode} />} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Pie Chart Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-sm">
                    {pieData.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span>{entry.name} ({entry.value})</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>

            {/* VENDOR TABLE - UPDATED with Method & Detail */}
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 border-t pt-5 border-dashed border-current/20">
                <ListFilter className="w-5 h-5" />
                Vendor Scan Results
            </h3>

            <div
              className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead
                    className={`${
                      isDarkMode
                        ? "bg-zinc-700 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Vendor</th>
                      <th className="text-left px-4 py-3 font-semibold">Method</th>
                      <th className="text-left px-4 py-3 font-semibold">Details</th>
                      <th className="text-left px-4 py-3 font-semibold">Result</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(showAll ? sortedVendors : sortedVendors.slice(0, 10)).map((v, i) => {
                      const { dotColor } = getCategoryDetails(v.category, isDarkMode);
                      return (
                        <tr key={i} className={`border-b transition-colors duration-300 ${
                          isDarkMode
                            ? "border-zinc-700/50 hover:bg-zinc-700/40"
                            : "border-gray-300/80 hover:bg-gray-200"
                        }`}>
                          {/* 1. Vendor Name */}
                          <td className="px-4 py-3 whitespace-nowrap">{v.vendor}</td>

                          {/* 2. Method (Added) */}
                          <td className="px-4 py-3">
                             <span className={`px-2 py-1 rounded-md text-xs font-mono lowercase ${
                                isDarkMode ? "bg-zinc-600/50 text-zinc-300" : "bg-gray-300/50 text-gray-700"
                             }`}>
                                {v.method}
                             </span>
                          </td>

                          {/* 3. Detailed Result (Added) */}
                          <td className={`px-4 py-3 truncate max-w-[200px] ${
                                v.result === "clean" || v.result === "unrated" 
                                ? "opacity-50 italic" 
                                : isDarkMode ? "text-red-300 font-medium" : "text-red-700 font-medium"
                             }`}>
                             {v.result}
                          </td>

                          {/* 4. Category (Existing) */}
                          <td className={`px-4 py-3 font-medium flex items-center gap-2 capitalize ${
                            isDarkMode ? "text-white" : "text-zinc-900"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                            {v.category}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {vendorList.length > 10 && (
                <div className={`text-center py-3 border-t ${isDarkMode ? "border-zinc-700/50" : "border-gray-300/80"}`}>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      isDarkMode
                        ? "bg-zinc-600 hover:bg-zinc-500 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-zinc-900"
                    }`}
                  >
                    {showAll ? "Show Less" : `Show All (${vendorList.length})`}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div
              className={`transition-colors text-xl font-medium ${
                isDarkMode ? "text-zinc-400" : "text-gray-500"
              }`}
            >
              Masukkan URL dan klik **Scan** untuk memulai analisis.
            </div>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-zinc-600" : "text-gray-400"}`}>
                *Powered by VirusTotal API*
            </p>
          </motion.div>
        )}

        {/* Stats summary (Bottom Section) */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-6 border-t border-dashed border-current/20">
          <StatCard
            label="Total Vendors"
            value={vendorList.length || 0}
            icon={FolderOpen}
            colorClass={isDarkMode ? "bg-zinc-800/50" : "bg-white"}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Harmless Reports"
            value={stats.harmless ?? 0}
            icon={ShieldCheck}
            colorClass={getCategoryDetails("harmless", isDarkMode).colorClass}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Suspicious Reports"
            value={stats.suspicious ?? 0}
            icon={AlertTriangle}
            colorClass={getCategoryDetails("suspicious", isDarkMode).colorClass}
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Malicious Reports"
            value={stats.malicious ?? 0}
            icon={Skull}
            colorClass={getCategoryDetails("malicious", isDarkMode).colorClass}
            isDarkMode={isDarkMode}
          />
        <StatCard
        label="Detection Ratio"
        value={`${stats.malicious + stats.suspicious}/${vendorList.length}`}
        icon={BarChart2}
        colorClass={isDarkMode ? "bg-zinc-800/50" : "bg-white"}
        isDarkMode={isDarkMode}
        />
        </div>
      </div>
    </div>
  );
}