import React, { useState, useEffect } from "react";
import {
  FiActivity,
  FiShare2,
  FiShield,
  FiAlertTriangle,
  FiBarChart2,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiGlobe,
  FiServer,
  FiZap,
  FiMap,
} from "react-icons/fi";

export default function EnhancedIntelligenceTab({
  id,
  type,
  isDarkMode,
  backendUrl,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [intelData, setIntelData] = useState({
    overview: null,
    detections: null,
    relationships: null,
    threatDetails: null,
    behavior: null,
    mitre: null,
    graph: null,
    analysis: null,
  });

  const [loading, setLoading] = useState({});
  const [error, setError] = useState("");

  // Normalisasi tipe object
  const normalizeType = (t) => {
    if (t === "url") return "urls";
    if (t === "file") return "files";
    if (t === "domain") return "domains";
    if (t === "ip_address" || t === "ip") return "ip_addresses";
    return t;
  };

  const normalizedType = normalizeType(type);

  // Fetch Intelligence Data dengan endpoint yang berbeda
  const fetchIntelData = async (key, endpoint) => {
    if (!id) return;

    setLoading((prev) => ({ ...prev, [key]: true }));
    setError("");

    try {
      const res = await fetch(`${backendUrl}/api/vt/${endpoint}`);
      const data = await res.json();

      if (res.status === 404) {
        setIntelData((prev) => ({ ...prev, [key]: [] }));
        setLoading((prev) => ({ ...prev, [key]: false }));
        return;
      }

      if (!res.ok) {
        throw new Error(data.error?.message || `Gagal fetch ${key}`);
      }

      setIntelData((prev) => ({ ...prev, [key]: data.data || data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Load semua data yang dibutuhkan saat tab berubah atau ID berubah
  useEffect(() => {
    if (!id) return;

    // OVERVIEW - Info umum object
    if (activeTab === "overview") {
      if (normalizedType === "urls") {
        fetchIntelData("overview", `urls/${id}`);
      } else if (normalizedType === "files") {
        fetchIntelData("overview", `files/${id}`);
      } else if (normalizedType === "domains") {
        fetchIntelData("overview", `domains/${id}`);
      } else if (normalizedType === "ip_addresses") {
        fetchIntelData("overview", `ip_addresses/${id}`);
      }
    }

    // DETECTIONS - Hasil scan dari berbagai engine
    if (activeTab === "detections") {
      if (normalizedType === "urls") {
        fetchIntelData("detections", `urls/${id}`);
      } else if (normalizedType === "files") {
        fetchIntelData("detections", `files/${id}`);
      }
    }

    // RELATIONSHIPS - IP contacted, domains, resolutions, etc
    if (activeTab === "relationships") {
      if (normalizedType === "urls") {
        fetchIntelData("relationships", `urls/${id}/last_serving_ip_address`);
      } else if (normalizedType === "files") {
        fetchIntelData("relationships", `files/${id}/contacted_domains`);
      } else if (normalizedType === "domains") {
        fetchIntelData("relationships", `domains/${id}/resolutions`);
      } else if (normalizedType === "ip_addresses") {
        fetchIntelData("relationships", `ip_addresses/${id}/resolutions`);
      }
    }

    // THREAT DETAILS - Kategori threat, detections
    if (activeTab === "threat-details") {
      if (normalizedType === "domains") {
        fetchIntelData("threatDetails", `domains/${id}`);
      } else if (normalizedType === "ip_addresses") {
        fetchIntelData("threatDetails", `ip_addresses/${id}`);
      } else if (normalizedType === "urls") {
        fetchIntelData("threatDetails", `urls/${id}`);
      }
    }

    // BEHAVIOR - File behavior summary
    if (activeTab === "behavior" && normalizedType === "files") {
      fetchIntelData("behavior", `files/${id}/behaviour_summary`);
    }

    // MITRE ATT&CK - Taktik dan teknik serangan
    if (activeTab === "mitre" && normalizedType === "files") {
      fetchIntelData("mitre", `files/${id}/behaviour_mitre_trees`);
    }

    // GRAPH - Relationship graph
    if (activeTab === "graph") {
      fetchIntelData("graph", `graphs`);
    }

    // ANALYSIS - Detailed last analysis data (read-only GET endpoints)
    // NOTE: /analyse is POST-only (triggers a new scan) — we use the object
    // endpoint directly which returns last_analysis_results + stats
    if (activeTab === "analysis") {
      if (normalizedType === "urls") {
        fetchIntelData("analysis", `urls/${id}`);
      } else if (normalizedType === "files") {
        fetchIntelData("analysis", `files/${id}`);
      } else if (normalizedType === "domains") {
        fetchIntelData("analysis", `domains/${id}`);
      } else if (normalizedType === "ip_addresses") {
        fetchIntelData("analysis", `ip_addresses/${id}`);
      }
    }
  }, [activeTab, id, type, backendUrl]);

  // Tab Button Styling
  const tabButtonClass = (tabName) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      activeTab === tabName
        ? isDarkMode
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
          : "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-400/30"
        : isDarkMode
        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
        : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-black border border-gray-300"
    }`;

  // Render Detection Stats
  const renderDetectionStats = () => {
    if (!intelData.detections) return null;

    const stats = intelData.detections?.last_analysis_stats || {
      malicious: 0,
      suspicious: 0,
      undetected: 0,
      harmless: 0,
    };

    const total =
      stats.malicious + stats.suspicious + stats.undetected + stats.harmless;
    const maliciousPercent = total ? ((stats.malicious / total) * 100).toFixed(1) : 0;
    const harmlessPercent = total ? ((stats.harmless / total) * 100).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        {/* Detection Summary Card */}
        <div
          className={`p-6 rounded-2xl border ${
            isDarkMode
              ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700"
              : "bg-gradient-to-br from-white to-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FiBarChart2 className="text-blue-500" />
              Detection Summary
            </h3>
            <span className={`text-xs px-3 py-1 rounded-full font-mono ${
              stats.malicious > 0
                ? "bg-red-500/20 text-red-500"
                : "bg-green-500/20 text-green-500"
            }`}>
              {stats.malicious} Malicious
            </span>
          </div>

          {/* Detection Ratio Bars */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-700/50" : "bg-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <FiXCircle className="text-red-500" />
                <span className="text-sm font-medium">Malicious</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{stats.malicious}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                {maliciousPercent}% of {total}
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-700/50" : "bg-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="text-yellow-500" />
                <span className="text-sm font-medium">Suspicious</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">{stats.suspicious}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                Detection Results
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-700/50" : "bg-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <FiEye className="text-blue-500" />
                <span className="text-sm font-medium">Undetected</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{stats.undetected}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                Not Flagged
              </p>
            </div>

            <div className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-700/50" : "bg-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <FiCheckCircle className="text-green-500" />
                <span className="text-sm font-medium">Harmless</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.harmless}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                {harmlessPercent}% Safe
              </p>
            </div>
          </div>

          {/* Detection Bar */}
          <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? "bg-zinc-700" : "bg-gray-200"}`}>
            <div className="flex h-full">
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${maliciousPercent}%` }}
              />
              <div
                className="bg-yellow-500 transition-all"
                style={{ width: `${(stats.suspicious / total) * 100}%` }}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${(stats.undetected / total) * 100}%` }}
              />
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${harmlessPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vendor Detections */}
        {intelData.detections?.last_analysis_results && (
          <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"}`}>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiShield /> Vendor Detections
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {Object.entries(intelData.detections.last_analysis_results).map(
                ([vendor, result]) => (
                  <div
                    key={vendor}
                    className={`p-3 rounded-lg border-l-4 transition-all ${
                      result.category === "malicious"
                        ? `border-l-red-500 ${isDarkMode ? "bg-red-500/10" : "bg-red-50"}`
                        : result.category === "suspicious"
                        ? `border-l-yellow-500 ${isDarkMode ? "bg-yellow-500/10" : "bg-yellow-50"}`
                        : `border-l-green-500 ${isDarkMode ? "bg-green-500/10" : "bg-green-50"}`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{vendor}</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                          {result.result || "Clean"}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded font-mono ${
                          result.category === "malicious"
                            ? "bg-red-500/30 text-red-500"
                            : result.category === "suspicious"
                            ? "bg-yellow-500/30 text-yellow-600"
                            : "bg-green-500/30 text-green-500"
                        }`}
                      >
                        {result.category}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Relationships
  const renderRelationships = () => {
    if (!intelData.relationships) return null;

    const dataList = Array.isArray(intelData.relationships)
      ? intelData.relationships
      : [intelData.relationships];

    if (dataList.length === 0 || !dataList[0]?.id) {
      return (
        <p className={`text-center py-8 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
          Tidak ada relationship data yang ditemukan
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataList.map((item, idx) => {
          const isMalicious =
            item.attributes?.last_analysis_stats?.malicious > 0;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-l-4 transition-all ${
                isMalicious
                  ? `border-l-red-500 ${isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`
                  : `border-l-blue-500 ${isDarkMode ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate font-semibold">
                    {item.id}
                  </p>
                  <p className={`text-xs mt-1 uppercase font-bold ${isMalicious ? "text-red-500" : "text-blue-500"}`}>
                    {item.type}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-mono whitespace-nowrap ml-2 ${
                    isMalicious
                      ? "bg-red-500/30 text-red-500"
                      : "bg-green-500/30 text-green-500"
                  }`}
                >
                  {isMalicious ? "⚠️ Malicious" : "✓ Clean"}
                </span>
              </div>
              {item.attributes?.last_analysis_stats && (
                <div className="text-xs mt-2 space-y-1">
                  <p>{item.attributes.last_analysis_stats.malicious} detections</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Threat Details
  const renderThreatDetails = () => {
    if (!intelData.threatDetails) return null;

    const data = intelData.threatDetails;
    const categories = data.last_dns_records || data.threat_severity;

    return (
      <div className="space-y-6">
        {/* Threat Severity */}
        {data.threat_severity && (
          <div
            className={`p-6 rounded-2xl border ${
              isDarkMode
                ? "bg-orange-500/10 border-orange-500/30"
                : "bg-orange-50 border-orange-200"
            }`}
          >
            <h4 className="font-bold text-lg flex items-center gap-2 mb-4">
              <FiAlertTriangle className="text-orange-500" />
              Threat Severity
            </h4>
            <p className="text-2xl font-bold text-orange-500">
              {data.threat_severity}
            </p>
          </div>
        )}

        {/* Categories */}
        {data.categories && (
          <div
            className={`p-6 rounded-2xl border ${
              isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"
            }`}
          >
            <h4 className="font-bold text-lg mb-4">Threat Categories</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.categories).map(([cat, value]) => (
                <span
                  key={cat}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDarkMode
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  {cat}: {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last DNS Records */}
        {data.last_dns_records && (
          <div
            className={`p-6 rounded-2xl border ${
              isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"
            }`}
          >
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiGlobe /> DNS Records
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.isArray(data.last_dns_records) ? (
                data.last_dns_records.map((record, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg font-mono text-xs ${
                      isDarkMode ? "bg-zinc-900 border border-zinc-700" : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {record.type}: {record.value}
                  </div>
                ))
              ) : (
                <pre className={`p-3 rounded-lg text-xs overflow-x-auto ${isDarkMode ? "bg-zinc-900" : "bg-gray-50"}`}>
                  {JSON.stringify(data.last_dns_records, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Behavior
  const renderBehavior = () => {
    if (!intelData.behavior) return null;

    return (
      <div>
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FiActivity /> Behavior Summary
        </h4>
        <pre
          className={`p-4 rounded-xl text-xs overflow-x-auto border ${
            isDarkMode
              ? "bg-zinc-900 text-green-400 border-zinc-700"
              : "bg-gray-50 text-green-700 border-gray-200"
          }`}
        >
          {JSON.stringify(intelData.behavior, null, 2)}
        </pre>
      </div>
    );
  };

  // Render MITRE ATT&CK
  const renderMitre = () => {
    if (!intelData.mitre) return null;

    const tactics = intelData.mitre.zenbox?.tactics || [];

    return (
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <FiShield /> MITRE ATT&CK Framework
        </h4>
        {tactics.length > 0 ? (
          tactics.map((tactic, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border-l-4 border-l-blue-500 ${
                isDarkMode
                  ? "bg-blue-500/10 border border-blue-500/20"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <h5 className="font-bold text-blue-600 mb-2">
                {tactic.name} ({tactic.id})
              </h5>
              <p className={`text-sm mb-3 ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}>
                {tactic.description}
              </p>
              {tactic.techniques && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tactic.techniques.map((tech, tIdx) => (
                    <div
                      key={tIdx}
                      className={`p-2 rounded text-sm ${
                        isDarkMode
                          ? "bg-blue-900/50 border border-blue-700"
                          : "bg-blue-100 border border-blue-300"
                      }`}
                    >
                      <span className="font-mono font-bold text-blue-500">
                        {tech.id}
                      </span>{" "}
                      - {tech.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className={`text-center py-6 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Tidak ada MITRE tactics yang terdeteksi
          </p>
        )}
      </div>
    );
  };

  // Render Analysis
  const renderAnalysis = () => {
    if (!intelData.analysis) return null;

    const attrs = intelData.analysis.attributes || intelData.analysis;
    const results = attrs.last_analysis_results || attrs.results || {};
    const stats = attrs.last_analysis_stats || attrs.stats || {};
    const date = attrs.last_analysis_date || attrs.date;

    const resultEntries = Object.entries(results);
    const malicious = resultEntries.filter(([, v]) => v.category === "malicious");
    const suspicious = resultEntries.filter(([, v]) => v.category === "suspicious");
    const clean = resultEntries.filter(([, v]) =>
      v.category === "harmless" || v.category === "undetected"
    );

    return (
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <FiZap /> Full Analysis Report
        </h4>

        {/* Stats summary */}
        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats).map(([key, val]) => (
              <div
                key={key}
                className={`p-3 rounded-xl text-center ${isDarkMode ? "bg-zinc-700/50" : "bg-gray-100"}`}
              >
                <p className={`text-2xl font-bold ${
                  key === "malicious" ? "text-red-500" :
                  key === "suspicious" ? "text-yellow-500" :
                  key === "harmless" ? "text-green-500" : "text-blue-500"
                }`}>{val}</p>
                <p className="text-xs uppercase font-bold mt-1 opacity-60">{key}</p>
              </div>
            ))}
          </div>
        )}

        {date && (
          <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Last analysis: {new Date(date * 1000).toLocaleString()}
          </p>
        )}

        {/* Malicious & suspicious results */}
        {(malicious.length > 0 || suspicious.length > 0) && (
          <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200"}`}>
            <h5 className="font-bold text-red-500 mb-3">⚠️ Flagged by {malicious.length + suspicious.length} engines</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {[...malicious, ...suspicious].map(([vendor, res]) => (
                <div key={vendor} className={`p-2 rounded text-xs ${isDarkMode ? "bg-zinc-800" : "bg-white"}`}>
                  <span className="font-bold">{vendor}</span>
                  <span className={`ml-2 px-1 rounded text-[10px] ${
                    res.category === "malicious" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-600"
                  }`}>{res.result || res.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {resultEntries.length === 0 && (
          <p className={`text-center py-6 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            No analysis results available
          </p>
        )}
      </div>
    );
  };

  // Render Overview
  const renderOverview = () => {
    if (!intelData.overview) return null;

    const data = intelData.overview;
    const attrs = data.attributes || {};

    return (
      <div className="space-y-6">
        {/* Header Info */}
        <div
          className={`p-6 rounded-2xl border ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-700/30"
              : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className={`text-xs uppercase font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                {type} ID
              </p>
              <p className="font-mono text-sm break-all">{data.id}</p>
            </div>
            <div>
              <p className={`text-xs uppercase font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                Type
              </p>
              <p className="text-sm font-semibold capitalize">{data.type}</p>
            </div>
          </div>
        </div>

        {/* URL/Domain/IP Specific Info */}
        {normalizedType === "urls" && attrs.title && (
          <div
            className={`p-6 rounded-2xl border ${
              isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"
            }`}
          >
            <p className={`text-sm uppercase font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              Page Title
            </p>
            <p className="text-lg font-semibold">{attrs.title}</p>
          </div>
        )}

        {normalizedType === "domains" && attrs.last_http_response_code && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
            >
              <p className="text-xs uppercase font-bold mb-1">HTTP Code</p>
              <p className="text-2xl font-bold">{attrs.last_http_response_code}</p>
            </div>
            {attrs.categories && (
              <div
                className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
              >
                <p className="text-xs uppercase font-bold mb-2">Categories</p>
                <div className="space-y-1">
                  {Object.entries(attrs.categories).map(([cat, val]) => (
                    <p key={cat} className="text-xs">
                      <span className="font-semibold">{cat}:</span> {val}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {normalizedType === "ip_addresses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attrs.country && (
              <div
                className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
              >
                <p className="text-xs uppercase font-bold mb-1 flex items-center gap-2">
                  <FiGlobe /> Country
                </p>
                <p className="text-lg font-semibold">{attrs.country}</p>
              </div>
            )}
            {attrs.asn && (
              <div
                className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
              >
                <p className="text-xs uppercase font-bold mb-1 flex items-center gap-2">
                  <FiServer /> ASN
                </p>
                <p className="text-lg font-semibold">{attrs.asn}</p>
              </div>
            )}
          </div>
        )}

        {normalizedType === "files" && attrs.size && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
            >
              <p className="text-xs uppercase font-bold mb-1">Size</p>
              <p className="text-lg font-semibold">
                {(attrs.size / 1024).toFixed(2)} KB
              </p>
            </div>
            {attrs.type_description && (
              <div
                className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
              >
                <p className="text-xs uppercase font-bold mb-1">Type</p>
                <p className="text-xs">{attrs.type_description}</p>
              </div>
            )}
            {attrs.sha256 && (
              <div
                className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
              >
                <p className="text-xs uppercase font-bold mb-1">SHA256</p>
                <p className="font-mono text-xs truncate">{attrs.sha256.slice(0, 16)}...</p>
              </div>
            )}
          </div>
        )}

        {/* Last Analysis Date */}
        {attrs.last_analysis_date && (
          <div
            className={`p-4 rounded-xl ${isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-gray-200"}`}
          >
            <p className="text-xs uppercase font-bold mb-2">Last Analysis</p>
            <p className="text-sm">
              {new Date(attrs.last_analysis_date * 1000).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? "bg-gradient-to-br from-zinc-900 to-zinc-950" : "bg-gray-50"}`}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-700 overflow-x-auto">
        <button onClick={() => setActiveTab("overview")} className={tabButtonClass("overview")}>
          <FiEye size={16} />
          Overview
        </button>
        {(normalizedType === "urls" || normalizedType === "files") && (
          <button onClick={() => setActiveTab("detections")} className={tabButtonClass("detections")}>
            <FiBarChart2 size={16} />
            Detections
          </button>
        )}
        <button onClick={() => setActiveTab("relationships")} className={tabButtonClass("relationships")}>
          <FiShare2 size={16} />
          Relationships
        </button>
        <button onClick={() => setActiveTab("threat-details")} className={tabButtonClass("threat-details")}>
          <FiAlertTriangle size={16} />
          Threats
        </button>
        {normalizedType === "files" && (
          <>
            <button onClick={() => setActiveTab("behavior")} className={tabButtonClass("behavior")}>
              <FiActivity size={16} />
              Behavior
            </button>
            <button onClick={() => setActiveTab("mitre")} className={tabButtonClass("mitre")}>
              <FiShield size={16} />
              MITRE
            </button>
          </>
        )}
        <button onClick={() => setActiveTab("analysis")} className={tabButtonClass("analysis")}>
          <FiZap size={16} />
          Analysis
        </button>
      </div>

      {/* Content Area */}
      <div className={`rounded-2xl border ${isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"} p-6`}>
        {loading[activeTab] && (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <FiRefreshCw className="text-blue-500" size={24} />
            </div>
            <span className={`ml-3 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
              Mengambil data...
            </span>
          </div>
        )}

        {error && !loading[activeTab] && (
          <div className={`p-4 rounded-xl border-l-4 border-l-red-500 ${isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-red-500 mt-1" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading[activeTab] && !error && (
          <>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "detections" && renderDetectionStats()}
            {activeTab === "relationships" && renderRelationships()}
            {activeTab === "threat-details" && renderThreatDetails()}
            {activeTab === "behavior" && renderBehavior()}
            {activeTab === "mitre" && renderMitre()}
            {activeTab === "analysis" && renderAnalysis()}
          </>
        )}
      </div>
    </div>
  );
}