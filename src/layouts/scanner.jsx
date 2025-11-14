import React, { createContext, useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
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
    className={`p-6 rounded-xl text-center ${colorClass} backdrop-blur-sm border border-white/8`}
  >
    <Icon className="w-8 h-8 mx-auto mb-2" />
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-80">{label}</div>
  </div>
);

// -------------------------
// Main component
// -------------------------
export default function WebsiteSecurityScanner() {
  const { isDarkMode, toggle } = useContext(ThemeContext);

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
      const analysisId = data.data?.id || data.id;
      
      if (!analysisId) {
        console.error("❌ Full response:", JSON.stringify(data, null, 2));
        throw new Error(`No analysis ID returned. Backend response: ${JSON.stringify(data)}`);
      }
      
      setAnalysisId(analysisId);
      setStatus("URL diterima. Menunggu hasil analisis...");
      // poll
      await pollResult(data.id);
    } catch (err) {
      console.error("❌ Scan error:", err);
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }
  async function pollResult(id) {
    const maxRetries = 20;
    const delayMs = 3000;
    for (let i = 0; i < maxRetries; i++) {
      setStatus(`Menunggu hasil... (${i + 1}/${maxRetries})`);
      try {
        const res = await fetch(`${BACKEND_URL}/api/vt/result/${id}`);
        if (res.ok) {
          const data = await res.json();
          const statusAttr = data?.data?.attributes?.status;
          if (statusAttr === "completed") {
            setResult(data);
            setStatus("✅ Analisis selesai!");
            return;
          }
        }
      } catch (err) {
        console.error("poll error", err);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    setStatus("⏱ Timeout: hasil belum tersedia. Coba lagi nanti.");
  }

  function parseVendors(resultData) {
    const obj = resultData?.data?.attributes?.results || {};
    return Object.entries(obj).map(([vendor, info]) => ({
      vendor,
      category: info?.category || "unrated",
      engine_name: info?.engine_name || "",
    }));
  }

  const stats = result?.data?.attributes?.stats || {};
  const vendorList = parseVendors(result || {});

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-zinc-800 text-zinc-300"
                : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <div className="font-medium">Website Security</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={`px-3 py-2 rounded-md ${
                isDarkMode ? "bg-zinc-800" : "bg-gray-100"
              }`}
            >
              Toggle Theme
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-500 ${
          isDarkMode ? "text-white" : "text-zinc-900"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <DecryptedText
              text="Website Security Scanner"
              speed={80}
              maxIterations={80}
              sequential
            />
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-zinc-400" : "text-gray-600"
            }`}
          >
            Scan any URL using VirusTotal and show detailed vendor results.
          </p>
        </motion.div>

        {/* input + actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-zinc-400" : "text-gray-400"
              }`}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 ${
                isDarkMode
                  ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                  : "bg-white border-gray-300 text-black placeholder-gray-400"
              }`}
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={loading || !input}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                loading || !input
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
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
              className={`px-4 py-3 rounded-xl transition-colors ${
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
            className={`rounded-2xl p-6 shadow-lg border transition-colors duration-500 ${
              isDarkMode
                ? "bg-[#1e293b] border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-zinc-300" : "text-gray-600"
                  }`}
                >
                  {result?.data?.attributes?.url}
                </div>
                <h2 className="text-2xl font-semibold mt-1">
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

              <div className="flex gap-4 items-center">
                <a
                  href={`https://www.virustotal.com/gui/url/${encodeURIComponent(
                    analysisId
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4" /> Lihat di VirusTotal
                </a>
              </div>
            </div>

            {/* Stats and chart */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  className={`p-3 rounded-xl text-center ${
                    isDarkMode
                      ? "bg-green-900/30 text-green-400"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.harmless ?? "N/A"}</div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-zinc-300" : "text-green-800"
                    }`}
                  >
                    Harmless
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl text-center ${
                    isDarkMode
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.suspicious ?? "N/A"}</div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-zinc-300" : "text-yellow-800"
                    }`}
                  >
                    Suspicious
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl text-center ${
                    isDarkMode
                      ? "bg-red-900/30 text-red-400"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.malicious ?? "N/A"}</div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-zinc-300" : "text-red-800"
                    }`}
                  >
                    Malicious
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl text-center ${
                    isDarkMode
                      ? "bg-gray-700/30 text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  <div className="text-2xl font-bold">{stats.undetected ?? 0}</div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-zinc-300" : "text-gray-800"
                    }`}
                  >
                    Undetected
                  </div>
                </div>
              </div>

              <div
                className={`h-48 rounded-xl flex justify-center items-center transition-colors ${
                  isDarkMode ? "bg-[#0f1724]" : "bg-gray-200"
                }`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={45}
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

            {/* Vendor table */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Security Vendors' Analysis
              </h3>
              <div
                className={`rounded-lg overflow-hidden border transition-colors ${
                  isDarkMode
                    ? "bg-[#0f1724] border-gray-700"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <table className="w-full text-sm">
                  <thead
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <tr>
                      <th className="text-left px-3 py-2">Vendor</th>
                      <th className="text-left px-3 py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorList.map((v, i) => (
                      <tr
                        key={i}
                        className={`border-b transition-colors ${
                          isDarkMode
                            ? "border-gray-800 hover:bg-gray-800/50"
                            : "border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <td className="px-3 py-2">{v.vendor}</td>
                        <td
                          className={`px-3 py-2 font-medium ${
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