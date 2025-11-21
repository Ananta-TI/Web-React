import React, { createContext, useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import {
  Github,
  ExternalLink,
  Globe,
  Search,
  FolderOpen,
  Star,
  Calendar,
  Monitor,
  Server,
  Smartphone,
  Database,
  Palette,
  Layers,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Skull,
  Loader2,
  BarChart2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// -------------------------
// Helper components
// -------------------------
const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div
    className={`p-4 sm:p-6 rounded-xl text-center ${colorClass} backdrop-blur-sm border border-white/8`}
  >
    <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
    <div className="text-xl sm:text-2xl font-bold mb-1">{value}</div>
    <div className="text-xs sm:text-sm opacity-80">{label}</div>
  </div>
);

// -------------------------
// Main component
// -------------------------
export default function WebsiteSecurityScanner() {
  const { isDarkMode, toggle } = useContext(ThemeContext);
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
    const maxRetries = 40;  // Naik dari 20 (total ~200s)
    const delayMs = 5000;   // Naik dari 3000
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
        setStatus(`❌ Error during polling: ${err.message}`);
        return;  // Hentikan polling jika error fatal
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    setStatus("⏱ Timeout: hasil belum tersedia. Coba lagi nanti atau periksa VirusTotal langsung.");
  }

  function parseVendors(resultData) {
    const obj = resultData?.data?.attributes?.results || {};
    return Object.entries(obj).map(([vendor, info]) => ({
      vendor,
      category: info?.category || "unrated",
      engine_name: info?.engine_name || "",
    }));
  }
const handleBackToHome = () => {
    navigate('/');
  };
  const stats = result?.data?.attributes?.stats || {};
  const vendorList = parseVendors(result || {});
const categoryPriority = {
  malicious: 1,
  suspicious: 2,
  harmless: 3,
  undetected: 4,
  unrated: 5,
};

const sortedVendors = vendorList.sort((a, b) => {
  const priA = categoryPriority[a.category] || 99;
  const priB = categoryPriority[b.category] || 99;
  return priA - priB;
});

  const pieData = [
    { name: "Harmless", value: stats.harmless || 0, color: "#22c55e" },
    { name: "Suspicious", value: stats.suspicious || 0, color: "#f59e0b" },
    { name: "Malicious", value: stats.malicious || 0, color: "#ef4444" },
    { name: "Undetected", value: stats.undetected || 0, color: "#6b7280" },
  ];

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

          {/* <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={`px-3 py-2 rounded-md text-sm sm:text-base ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-100"
              }`}
            >
              Toggle Theme
            </button>
          </div> */}
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
            Scan any URL using VirusTotal and show detailed vendor results.
          </p>
        </motion.div>

        {/* input + actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400"
              }`}
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleScan}
              disabled={loading || !input}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                loading || !input
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
              }}
              className={`px-3 sm:px-4 py-3 rounded-xl transition-colors text-sm sm:text-base ${
                isDarkMode
                  ? "bg-zinc-700/30 hover:bg-zinc-600/40"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Clear
            </button>
          </div>
        </div>

        {status && (
          <p
            className={`text-sm text-center mb-6 transition-colors ${
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
    className={`rounded-2xl p-5 sm:p-7 shadow-xl border transition-colors duration-500 ${
      isDarkMode
        ? "bg-zinc-800/50 border-gray-700"
        : "bg-white border-gray-300"
    }`}
  >

    {/* HEADER */}
    <div className="flex flex-col lg:flex-row justify-between gap-5 mb-8">
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs sm:text-sm truncate ${
            isDarkMode ? "text-zinc-300" : "text-gray-600"
          }`}
        >
          {result?.data?.attributes?.url}
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold mt-1 truncate">
          {result?.data?.attributes?.content?.title || result?.data?.id}
        </h2>

        <div
          className={`text-sm mt-2 ${
            isDarkMode ? "text-zinc-400" : "text-gray-700"
          }`}
        >
          Status:{" "}
          <span className="font-semibold text-blue-500">
            {result?.data?.attributes?.status}
          </span>
        </div>
      </div>

      {/* <div className="flex items-start lg:items-center">
        <a
          href={`https://www.virustotal.com/gui/url/${encodeURIComponent(
            analysisId
          )}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Lihat di VirusTotal
        </a>
      </div> */}
    </div>

    {/* GRID: STATS + PIE */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

      {/* Stats */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">

        {/* Stat Item Template */}
        {[
          { label: "Harmless", value: stats.harmless, color: "green" },
          { label: "Suspicious", value: stats.suspicious, color: "yellow" },
          { label: "Malicious", value: stats.malicious, color: "red" },
          { label: "Undetected", value: stats.undetected, color: "gray" },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl text-center ${
              isDarkMode
                ? `bg-${item.color}-900/30 text-${item.color}-400`
                : `bg-${item.color}-100 text-${item.color}-700`
            }`}
          >
            <div className="text-2xl font-bold">
              {item.value ?? "N/A"}
            </div>
            <div
              className={`text-xs sm:text-sm mt-1 ${
                isDarkMode ? "text-zinc-300" : "text-gray-800"
              }`}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div
        className={`rounded-xl p-4 flex justify-center items-center ${
          isDarkMode ? "bg-zinc-800" : "bg-gray-200"
        }`}
      >
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              outerRadius={70}
              innerRadius={35}
              paddingAngle={3}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* VENDOR TABLE */}
    <h3 className="text-lg font-semibold mb-3">Security Vendors' Analysis</h3>

    <div
      className={`rounded-lg border overflow-hidden ${
        isDarkMode
          ? "bg-zinc-700 border-gray-700"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead
            className={`${
              isDarkMode
                ? "bg-zinc-800 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <tr>
              <th className="text-left px-4 py-2">Vendor</th>
              <th className="text-left px-4 py-2">Result</th>
            </tr>
          </thead>

          <tbody>
{sortedVendors.map((v, i) => (
              <tr
                key={i}
                className={`border-b ${
                  isDarkMode
                    ? "border-gray-800 hover:bg-gray-800/40"
                    : "border-gray-300 hover:bg-gray-200"
                }`}
              >
                <td className="px-4 py-2">{v.vendor}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    v.category === "harmless"
                      ? "text-green-400"
                      : v.category === "malicious"
                      ? "text-red-400"
                      : v.category === "suspicious"
                      ? "text-yellow-400"
                      : isDarkMode
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {v.category}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              className={`transition-colors ${
                isDarkMode ? "text-zinc-400" : "text-gray-500"
              }`}
            >
              Masukkan URL dan klik <strong>Scan</strong> untuk memulai analisis.
            </div>
          </motion.div>
        )}

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <StatCard
            label="Total Scans"
            value={result ? 1 : 0}
            icon={FolderOpen}
            colorClass={isDarkMode ? "bg-zinc-800/50" : "bg-white"}
          />
          <StatCard
            label="Harmless"
            value={stats.harmless ?? 0}
            icon={ShieldCheck}
            colorClass={"bg-green-900/20"}
          />
          <StatCard
            label="Suspicious"
            value={stats.suspicious ?? 0}
            icon={AlertTriangle}
            colorClass={"bg-yellow-900/20"}
          />
          <StatCard
            label="Malicious"
            value={stats.malicious ?? 0}
            icon={Skull}
            colorClass={"bg-red-900/20"}
          />
        </div>
      </div>
    

    </div>
  );
}
