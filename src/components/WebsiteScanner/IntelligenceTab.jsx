import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiEye,
  FiGlobe,
  FiRefreshCw,
  FiServer,
  FiShare2,
  FiShield,
  FiXCircle,
  FiZap,
} from "react-icons/fi";

const EMPTY_STATS = {
  malicious: 0,
  suspicious: 0,
  undetected: 0,
  harmless: 0,
};

function normalizeType(value) {
  if (value === "url" || value === "urls") return "urls";
  if (value === "file" || value === "files") return "files";
  if (value === "domain" || value === "domains") return "domains";

  if (
    value === "ip" ||
    value === "ip_address" ||
    value === "ip_addresses"
  ) {
    return "ip_addresses";
  }

  return value || "";
}

function unwrapVtData(payload) {
  let current = payload;

  for (let depth = 0; depth < 6; depth += 1) {
    if (
      current &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      Object.prototype.hasOwnProperty.call(current, "data")
    ) {
      current = current.data;
      continue;
    }

    break;
  }

  return current;
}

function getAttributes(payload) {
  const normalized = unwrapVtData(payload);

  if (
    !normalized ||
    typeof normalized !== "object" ||
    Array.isArray(normalized)
  ) {
    return {};
  }

  return normalized.attributes || normalized;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sumStats(stats) {
  return Object.values(stats || {}).reduce(
    (total, value) => total + toNumber(value),
    0,
  );
}

function percentage(value, total) {
  if (!total) return 0;
  return (toNumber(value) / total) * 100;
}

function formatDate(timestamp) {
  if (!timestamp) return "-";

  const numericTimestamp = Number(timestamp);

  const milliseconds =
    numericTimestamp > 10_000_000_000
      ? numericTimestamp
      : numericTimestamp * 1000;

  const date = new Date(milliseconds);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString();
}

function stringifyValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

function getErrorMessage(payload, fallback) {
  if (typeof payload?.error === "string") {
    return payload.error;
  }

  if (typeof payload?.error?.message === "string") {
    return payload.error.message;
  }

  if (typeof payload?.message === "string") {
    return payload.message;
  }

  return fallback;
}

async function readJsonResponse(response) {
  const rawText = await response.text();

  if (!rawText) {
    return {};
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error(
      `API mengembalikan respons non-JSON (${response.status}): ${rawText
        .replace(/\s+/g, " ")
        .slice(0, 180)}`,
    );
  }
}

function EmptyMessage({ children, isDarkMode }) {
  return (
    <div
      className={`rounded-xl border px-4 py-10 text-center text-sm ${
        isDarkMode
          ? "border-zinc-700 bg-zinc-900/40 text-zinc-400"
          : "border-gray-200 bg-gray-50 text-gray-500"
      }`}
    >
      {children}
    </div>
  );
}

export default function EnhancedIntelligenceTab({
  id,
  type,
  isDarkMode,
  backendUrl,
}) {
  const [activeTab, setActiveTab] =
    useState("overview");

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

  const normalizedType = useMemo(
    () => normalizeType(type),
    [type],
  );

  const safeId = useMemo(
    () => encodeURIComponent(String(id || "")),
    [id],
  );

  const apiBase = useMemo(
    () =>
      String(backendUrl || "").replace(/\/+$/, ""),
    [backendUrl],
  );

  const activeDataKey =
    activeTab === "threat-details"
      ? "threatDetails"
      : activeTab;

  const fetchIntelData = useCallback(
    async (key, endpoint, signal) => {
      if (!id || !endpoint) {
        return;
      }

      setLoading((previous) => ({
        ...previous,
        [key]: true,
      }));

      setError("");

      try {
        const response = await fetch(
          `${apiBase}/api/vt/advanced/${endpoint}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal,
          },
        );

        const payload =
          await readJsonResponse(response);

        if (response.status === 404) {
          setIntelData((previous) => ({
            ...previous,
            [key]: [],
          }));

          return;
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              payload,
              `Gagal mengambil ${key} (HTTP ${response.status})`,
            ),
          );
        }

        setIntelData((previous) => ({
          ...previous,
          [key]: unwrapVtData(payload),
        }));
      } catch (requestError) {
        if (requestError?.name === "AbortError") {
          return;
        }

        console.error(
          `Intelligence request failed for ${key}:`,
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : `Gagal mengambil ${key}`,
        );
      } finally {
        if (!signal?.aborted) {
          setLoading((previous) => ({
            ...previous,
            [key]: false,
          }));
        }
      }
    },
    [apiBase, id],
  );

  useEffect(() => {
    setIntelData({
      overview: null,
      detections: null,
      relationships: null,
      threatDetails: null,
      behavior: null,
      mitre: null,
      graph: null,
      analysis: null,
    });

    setError("");
    setActiveTab("overview");
  }, [id, normalizedType]);

  useEffect(() => {
    if (!id || !normalizedType) {
      return undefined;
    }

    const controller = new AbortController();

    let key = activeDataKey;
    let endpoint = "";

    if (activeTab === "overview") {
      endpoint = `${normalizedType}/${safeId}`;
    }

    if (activeTab === "detections") {
      endpoint = `${normalizedType}/${safeId}`;
    }

    if (activeTab === "relationships") {
      if (normalizedType === "urls") {
        endpoint =
          `urls/${safeId}/last_serving_ip_address`;
      } else if (normalizedType === "files") {
        endpoint =
          `files/${safeId}/contacted_domains`;
      } else if (
        normalizedType === "domains"
      ) {
        endpoint =
          `domains/${safeId}/resolutions`;
      } else if (
        normalizedType === "ip_addresses"
      ) {
        endpoint =
          `ip_addresses/${safeId}/resolutions`;
      }
    }

    if (activeTab === "threat-details") {
      key = "threatDetails";
      endpoint = `${normalizedType}/${safeId}`;
    }

    if (
      activeTab === "behavior" &&
      normalizedType === "files"
    ) {
      endpoint =
        `files/${safeId}/behaviour_summary`;
    }

    if (
      activeTab === "mitre" &&
      normalizedType === "files"
    ) {
      endpoint =
        `files/${safeId}/behaviour_mitre_trees`;
    }

    if (activeTab === "graph") {
      endpoint = "graphs";
    }

    if (activeTab === "analysis") {
      endpoint = `${normalizedType}/${safeId}`;
    }

    if (endpoint) {
      fetchIntelData(
        key,
        endpoint,
        controller.signal,
      );
    }

    return () => controller.abort();
  }, [
    activeDataKey,
    activeTab,
    fetchIntelData,
    id,
    normalizedType,
    safeId,
  ]);

  const tabButtonClass = (tabName) =>
    `flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
      activeTab === tabName
        ? isDarkMode
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
          : "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-400/30"
        : isDarkMode
          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-black border border-gray-300"
    }`;

  const renderOverview = () => {
    const data =
      unwrapVtData(intelData.overview);

    if (!data || Array.isArray(data)) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Data overview tidak tersedia.
        </EmptyMessage>
      );
    }

    const attributes =
      data.attributes || data;

    const categories =
      attributes.categories || {};

    return (
      <div className="space-y-6">
        <div
          className={`rounded-2xl border p-6 ${
            isDarkMode
              ? "border-blue-700/30 bg-gradient-to-r from-blue-900/30 to-cyan-900/30"
              : "border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50"
          }`}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="min-w-0">
              <p
                className={`mb-2 text-xs font-bold uppercase ${
                  isDarkMode
                    ? "text-zinc-400"
                    : "text-gray-600"
                }`}
              >
                {type || normalizedType} ID
              </p>

              <p className="break-all font-mono text-sm">
                {data.id || id || "-"}
              </p>
            </div>

            <div>
              <p
                className={`mb-2 text-xs font-bold uppercase ${
                  isDarkMode
                    ? "text-zinc-400"
                    : "text-gray-600"
                }`}
              >
                Type
              </p>

              <p className="text-sm font-semibold capitalize">
                {data.type ||
                  type ||
                  normalizedType ||
                  "-"}
              </p>
            </div>
          </div>
        </div>

        {normalizedType === "urls" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(attributes.url ||
              attributes.last_final_url) && (
              <div
                className={`rounded-xl border p-4 md:col-span-2 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-2 text-xs font-bold uppercase opacity-60">
                  URL
                </p>

                <p className="break-all font-mono text-sm">
                  {attributes.last_final_url ||
                    attributes.url}
                </p>
              </div>
            )}

            {attributes.title && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-2 text-xs font-bold uppercase opacity-60">
                  Page Title
                </p>

                <p className="font-semibold">
                  {attributes.title}
                </p>
              </div>
            )}

            {attributes.last_http_response_code && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-2 text-xs font-bold uppercase opacity-60">
                  HTTP Status
                </p>

                <p className="text-2xl font-bold text-green-500">
                  {
                    attributes.last_http_response_code
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {normalizedType === "domains" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {attributes.registrar && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase">
                  Registrar
                </p>

                <p className="break-words text-sm font-semibold">
                  {attributes.registrar}
                </p>
              </div>
            )}

            {attributes.creation_date && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase">
                  Created
                </p>

                <p className="text-sm">
                  {formatDate(
                    attributes.creation_date,
                  )}
                </p>
              </div>
            )}

            {attributes.reputation !==
              undefined && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase">
                  Reputation
                </p>

                <p
                  className={`text-2xl font-bold ${
                    toNumber(
                      attributes.reputation,
                    ) < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {attributes.reputation}
                </p>
              </div>
            )}
          </div>
        )}

        {normalizedType ===
          "ip_addresses" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {attributes.country && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase">
                  <FiGlobe />
                  Country
                </p>

                <p className="text-lg font-semibold">
                  {attributes.country}
                </p>
              </div>
            )}

            {attributes.asn && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase">
                  <FiServer />
                  ASN
                </p>

                <p className="text-lg font-semibold">
                  {attributes.asn}
                </p>

                {attributes.as_owner && (
                  <p className="mt-1 text-xs opacity-60">
                    {attributes.as_owner}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {normalizedType === "files" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {attributes.size !== undefined && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase">
                  Size
                </p>

                <p className="text-lg font-semibold">
                  {(
                    toNumber(attributes.size) /
                    1024
                  ).toFixed(2)}{" "}
                  KB
                </p>
              </div>
            )}

            {attributes.type_description && (
              <div
                className={`rounded-xl border p-4 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase">
                  File Type
                </p>

                <p className="text-sm">
                  {attributes.type_description}
                </p>
              </div>
            )}

            {attributes.sha256 && (
              <div
                className={`rounded-xl border p-4 md:col-span-2 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="mb-1 text-xs font-bold uppercase">
                  SHA-256
                </p>

                <p className="break-all font-mono text-xs">
                  {attributes.sha256}
                </p>
              </div>
            )}
          </div>
        )}

        {Object.keys(categories).length >
          0 && (
          <div
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-zinc-700 bg-zinc-800/50"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="mb-3 text-xs font-bold uppercase opacity-60">
              Categories
            </p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(
                ([source, category]) => (
                  <span
                    key={`${source}-${category}`}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      isDarkMode
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }`}
                    title={source}
                  >
                    {String(category)}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        {attributes.last_analysis_date && (
          <div
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-zinc-700 bg-zinc-800/50"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="mb-2 text-xs font-bold uppercase">
              Last Analysis
            </p>

            <p className="text-sm">
              {formatDate(
                attributes.last_analysis_date,
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDetectionStats = () => {
    const attributes = getAttributes(
      intelData.detections,
    );

    const stats = {
      ...EMPTY_STATS,
      ...(attributes.last_analysis_stats ||
        attributes.stats ||
        {}),
    };

    const results =
      attributes.last_analysis_results ||
      attributes.results ||
      {};

    const total = sumStats(stats);
    const resultEntries =
      Object.entries(results);

    if (
      !total &&
      resultEntries.length === 0
    ) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Data deteksi belum tersedia untuk
          objek ini.
        </EmptyMessage>
      );
    }

    const maliciousPercent = percentage(
      stats.malicious,
      total,
    );

    const suspiciousPercent = percentage(
      stats.suspicious,
      total,
    );

    const undetectedPercent = percentage(
      stats.undetected,
      total,
    );

    const harmlessPercent = percentage(
      stats.harmless,
      total,
    );

    return (
      <div className="space-y-6">
        <div
          className={`rounded-2xl border p-6 ${
            isDarkMode
              ? "border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900"
              : "border-gray-200 bg-gradient-to-br from-white to-gray-50"
          }`}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <FiBarChart2 className="text-blue-500" />
              Detection Summary
            </h3>

            <span
              className={`rounded-full px-3 py-1 font-mono text-xs ${
                stats.malicious > 0
                  ? "bg-red-500/20 text-red-500"
                  : "bg-green-500/20 text-green-500"
              }`}
            >
              {stats.malicious} Malicious
            </span>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div
              className={`rounded-xl p-4 ${
                isDarkMode
                  ? "bg-zinc-700/50"
                  : "bg-gray-100"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <FiXCircle className="text-red-500" />
                <span className="text-sm font-medium">
                  Malicious
                </span>
              </div>

              <p className="text-2xl font-bold text-red-500">
                {stats.malicious}
              </p>

              <p className="mt-1 text-xs opacity-60">
                {maliciousPercent.toFixed(1)}% of{" "}
                {total}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                isDarkMode
                  ? "bg-zinc-700/50"
                  : "bg-gray-100"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <FiAlertTriangle className="text-yellow-500" />
                <span className="text-sm font-medium">
                  Suspicious
                </span>
              </div>

              <p className="text-2xl font-bold text-yellow-500">
                {stats.suspicious}
              </p>

              <p className="mt-1 text-xs opacity-60">
                {suspiciousPercent.toFixed(1)}% of{" "}
                {total}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                isDarkMode
                  ? "bg-zinc-700/50"
                  : "bg-gray-100"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <FiEye className="text-blue-500" />

                <span className="text-sm font-medium">
                  Undetected
                </span>
              </div>

              <p className="text-2xl font-bold text-blue-500">
                {stats.undetected}
              </p>

              <p className="mt-1 text-xs opacity-60">
                {undetectedPercent.toFixed(1)}% of{" "}
                {total}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 ${
                isDarkMode
                  ? "bg-zinc-700/50"
                  : "bg-gray-100"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />

                <span className="text-sm font-medium">
                  Harmless
                </span>
              </div>

              <p className="text-2xl font-bold text-green-500">
                {stats.harmless}
              </p>

              <p className="mt-1 text-xs opacity-60">
                {harmlessPercent.toFixed(1)}% of{" "}
                {total}
              </p>
            </div>
          </div>

          <div
            className={`flex h-3 w-full overflow-hidden rounded-full ${
              isDarkMode
                ? "bg-zinc-700"
                : "bg-gray-200"
            }`}
          >
            <div
              className="h-full bg-red-500 transition-all"
              style={{
                width: `${maliciousPercent}%`,
              }}
            />

            <div
              className="h-full bg-yellow-500 transition-all"
              style={{
                width: `${suspiciousPercent}%`,
              }}
            />

            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: `${undetectedPercent}%`,
              }}
            />

            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width: `${harmlessPercent}%`,
              }}
            />
          </div>
        </div>

        {resultEntries.length > 0 && (
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? "border-zinc-700 bg-zinc-800/50"
                : "border-gray-200 bg-white"
            }`}
          >
            <h4 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <FiShield />
              Vendor Detections
            </h4>

            <div className="grid max-h-[520px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {resultEntries
                .sort(
                  (
                    [, first],
                    [, second],
                  ) => {
                    const rank = {
                      malicious: 0,
                      suspicious: 1,
                      harmless: 2,
                      undetected: 3,
                    };

                    return (
                      (rank[first?.category] ??
                        9) -
                      (rank[
                        second?.category
                      ] ?? 9)
                    );
                  },
                )
                .map(
                  ([
                    vendor,
                    vendorResult,
                  ]) => {
                    const category =
                      vendorResult?.category ||
                      "unknown";

                    return (
                      <div
                        key={vendor}
                        className={`rounded-lg border-l-4 p-3 transition-all ${
                          category ===
                          "malicious"
                            ? `border-l-red-500 ${
                                isDarkMode
                                  ? "bg-red-500/10"
                                  : "bg-red-50"
                              }`
                            : category ===
                                "suspicious"
                              ? `border-l-yellow-500 ${
                                  isDarkMode
                                    ? "bg-yellow-500/10"
                                    : "bg-yellow-50"
                                }`
                              : category ===
                                  "harmless"
                                ? `border-l-green-500 ${
                                    isDarkMode
                                      ? "bg-green-500/10"
                                      : "bg-green-50"
                                  }`
                                : `border-l-zinc-500 ${
                                    isDarkMode
                                      ? "bg-zinc-900/60"
                                      : "bg-gray-50"
                                  }`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {vendor}
                            </p>

                            <p className="mt-1 break-words text-xs opacity-60">
                              {vendorResult?.result ||
                                "No detection"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded px-2 py-1 font-mono text-[10px] uppercase ${
                              category ===
                              "malicious"
                                ? "bg-red-500/20 text-red-500"
                                : category ===
                                    "suspicious"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : category ===
                                      "harmless"
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-zinc-500/20 text-zinc-400"
                            }`}
                          >
                            {category}
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRelationships = () => {
    const normalized = unwrapVtData(
      intelData.relationships,
    );

    const dataList = Array.isArray(
      normalized,
    )
      ? normalized
      : normalized &&
          typeof normalized === "object"
        ? [normalized]
        : [];

    if (dataList.length === 0) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Tidak ada relationship data yang
          ditemukan.
        </EmptyMessage>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dataList.map((item, index) => {
          const attributes =
            item?.attributes || {};

          const itemStats =
            attributes.last_analysis_stats ||
            {};

          const malicious = toNumber(
            itemStats.malicious,
          );

          const relationshipId =
            item?.id ||
            attributes.ip_address ||
            attributes.host_name ||
            attributes.url ||
            attributes.name ||
            `Relationship ${index + 1}`;

          return (
            <div
              key={`${relationshipId}-${index}`}
              className={`rounded-xl border border-l-4 p-4 transition-all ${
                malicious > 0
                  ? isDarkMode
                    ? "border-red-500/20 border-l-red-500 bg-red-500/10"
                    : "border-red-200 border-l-red-500 bg-red-50"
                  : isDarkMode
                    ? "border-blue-500/20 border-l-blue-500 bg-blue-500/10"
                    : "border-blue-200 border-l-blue-500 bg-blue-50"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-all font-mono text-sm font-semibold">
                    {relationshipId}
                  </p>

                  <p
                    className={`mt-1 text-xs font-bold uppercase ${
                      malicious > 0
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {item?.type ||
                      "relationship"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-1 font-mono text-xs ${
                    malicious > 0
                      ? "bg-red-500/20 text-red-500"
                      : "bg-green-500/20 text-green-500"
                  }`}
                >
                  {malicious > 0
                    ? "Malicious"
                    : "No detections"}
                </span>
              </div>

              {Object.keys(itemStats).length >
                0 && (
                <p className="mt-2 text-xs opacity-70">
                  {malicious} malicious
                  detection(s)
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderThreatDetails = () => {
    const attributes = getAttributes(
      intelData.threatDetails,
    );

    const categories =
      attributes.categories || {};

    const threatNames =
      attributes.threat_names || [];

    const threatSeverity =
      attributes.threat_severity;

    const classification =
      attributes.popular_threat_classification ||
      {};

    const dnsRecords =
      attributes.last_dns_records || [];

    const reputation =
      attributes.reputation;

    const hasThreatData =
      threatSeverity ||
      Object.keys(categories).length > 0 ||
      threatNames.length > 0 ||
      Object.keys(classification).length >
        0 ||
      dnsRecords.length > 0 ||
      reputation !== undefined;

    if (!hasThreatData) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Tidak ada indikator ancaman tambahan
          untuk objek ini.
        </EmptyMessage>
      );
    }

    return (
      <div className="space-y-6">
        {(threatSeverity ||
          reputation !== undefined) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {threatSeverity && (
              <div
                className={`rounded-2xl border p-6 ${
                  isDarkMode
                    ? "border-orange-500/30 bg-orange-500/10"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <FiAlertTriangle className="text-orange-500" />
                  Threat Severity
                </h4>

                <pre className="whitespace-pre-wrap break-words text-sm text-orange-500">
                  {stringifyValue(
                    threatSeverity,
                  )}
                </pre>
              </div>
            )}

            {reputation !== undefined && (
              <div
                className={`rounded-2xl border p-6 ${
                  isDarkMode
                    ? "border-zinc-700 bg-zinc-800/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h4 className="mb-4 text-lg font-bold">
                  Reputation
                </h4>

                <p
                  className={`text-3xl font-black ${
                    toNumber(reputation) < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {reputation}
                </p>
              </div>
            )}
          </div>
        )}

        {threatNames.length > 0 && (
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? "border-red-500/20 bg-red-500/10"
                : "border-red-200 bg-red-50"
            }`}
          >
            <h4 className="mb-4 text-lg font-bold text-red-500">
              Threat Names
            </h4>

            <div className="flex flex-wrap gap-2">
              {threatNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-500"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.keys(classification).length >
          0 && (
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? "border-zinc-700 bg-zinc-800/50"
                : "border-gray-200 bg-white"
            }`}
          >
            <h4 className="mb-4 text-lg font-bold">
              Popular Threat Classification
            </h4>

            <pre
              className={`overflow-x-auto rounded-xl p-4 text-xs ${
                isDarkMode
                  ? "bg-zinc-900"
                  : "bg-gray-50"
              }`}
            >
              {JSON.stringify(
                classification,
                null,
                2,
              )}
            </pre>
          </div>
        )}

        {Object.keys(categories).length >
          0 && (
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? "border-zinc-700 bg-zinc-800/50"
                : "border-gray-200 bg-white"
            }`}
          >
            <h4 className="mb-4 text-lg font-bold">
              Threat Categories
            </h4>

            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(
                ([source, value]) => (
                  <span
                    key={`${source}-${value}`}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      isDarkMode
                        ? "border-purple-500/30 bg-purple-500/20 text-purple-300"
                        : "border-purple-200 bg-purple-100 text-purple-700"
                    }`}
                    title={source}
                  >
                    {String(value)}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        {Array.isArray(dnsRecords) &&
          dnsRecords.length > 0 && (
            <div
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? "border-zinc-700 bg-zinc-800/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h4 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <FiGlobe />
                DNS Records
              </h4>

              <div className="max-h-72 space-y-2 overflow-y-auto">
                {dnsRecords.map(
                  (record, index) => (
                    <div
                      key={`${record?.type}-${record?.value}-${index}`}
                      className={`rounded-lg border p-3 font-mono text-xs ${
                        isDarkMode
                          ? "border-zinc-700 bg-zinc-900"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <span className="font-bold text-blue-500">
                        {record?.type ||
                          "DNS"}
                      </span>

                      {": "}

                      {record?.value ||
                        stringifyValue(record)}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
      </div>
    );
  };

  const renderBehavior = () => {
    const behavior = unwrapVtData(
      intelData.behavior,
    );

    if (
      !behavior ||
      (typeof behavior === "object" &&
        Object.keys(behavior).length === 0)
    ) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Ringkasan behavior tidak tersedia
          untuk file ini.
        </EmptyMessage>
      );
    }

    return (
      <div>
        <h4 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <FiActivity />
          Behavior Summary
        </h4>

        <pre
          className={`max-h-[600px] overflow-auto rounded-xl border p-4 text-xs ${
            isDarkMode
              ? "border-zinc-700 bg-zinc-900 text-green-400"
              : "border-gray-200 bg-gray-50 text-green-700"
          }`}
        >
          {JSON.stringify(
            behavior,
            null,
            2,
          )}
        </pre>
      </div>
    );
  };

  const renderMitre = () => {
    const mitre = unwrapVtData(
      intelData.mitre,
    );

    const tacticEntries = [];

    if (
      mitre &&
      typeof mitre === "object" &&
      !Array.isArray(mitre)
    ) {
      if (Array.isArray(mitre.tactics)) {
        mitre.tactics.forEach((tactic) => {
          tacticEntries.push({
            sandbox: "Default",
            tactic,
          });
        });
      }

      Object.entries(mitre).forEach(
        ([sandbox, sandboxData]) => {
          if (
            !Array.isArray(
              sandboxData?.tactics,
            )
          ) {
            return;
          }

          sandboxData.tactics.forEach(
            (tactic) => {
              tacticEntries.push({
                sandbox,
                tactic,
              });
            },
          );
        },
      );
    }

    if (tacticEntries.length === 0) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Tidak ada MITRE ATT&amp;CK tactic
          yang terdeteksi.
        </EmptyMessage>
      );
    }

    return (
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-lg font-bold">
          <FiShield />
          MITRE ATT&amp;CK Framework
        </h4>

        {tacticEntries.map(
          (
            { sandbox, tactic },
            index,
          ) => (
            <div
              key={`${sandbox}-${tactic?.id || tactic?.name}-${index}`}
              className={`rounded-xl border border-l-4 border-l-blue-500 p-5 ${
                isDarkMode
                  ? "border-blue-500/20 bg-blue-500/10"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h5 className="font-bold text-blue-500">
                  {tactic?.name ||
                    "Unknown tactic"}

                  {tactic?.id
                    ? ` (${tactic.id})`
                    : ""}
                </h5>

                <span className="rounded bg-blue-500/10 px-2 py-1 text-[10px] uppercase text-blue-500">
                  {sandbox}
                </span>
              </div>

              {tactic?.description && (
                <p className="mb-3 text-sm opacity-70">
                  {tactic.description}
                </p>
              )}

              {Array.isArray(
                tactic?.techniques,
              ) &&
                tactic.techniques.length >
                  0 && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {tactic.techniques.map(
                      (
                        technique,
                        techniqueIndex,
                      ) => (
                        <div
                          key={`${technique?.id}-${techniqueIndex}`}
                          className={`rounded p-2 text-sm ${
                            isDarkMode
                              ? "border border-blue-700 bg-blue-900/50"
                              : "border border-blue-300 bg-blue-100"
                          }`}
                        >
                          <span className="font-mono font-bold text-blue-500">
                            {technique?.id ||
                              "-"}
                          </span>{" "}
                          -{" "}
                          {technique?.name ||
                            "Unknown technique"}
                        </div>
                      ),
                    )}
                  </div>
                )}
            </div>
          ),
        )}
      </div>
    );
  };

  const renderAnalysis = () => {
    const data = unwrapVtData(
      intelData.analysis,
    );

    const attributes =
      data?.attributes || data || {};

    const results =
      attributes.last_analysis_results ||
      attributes.results ||
      {};

    const stats =
      attributes.last_analysis_stats ||
      attributes.stats ||
      {};

    const date =
      attributes.last_analysis_date ||
      attributes.date;

    const resultEntries =
      Object.entries(results);

    const flagged = resultEntries.filter(
      ([, value]) =>
        [
          "malicious",
          "suspicious",
        ].includes(value?.category),
    );

    if (
      Object.keys(stats).length === 0 &&
      resultEntries.length === 0
    ) {
      return (
        <EmptyMessage isDarkMode={isDarkMode}>
          Hasil analysis rinci belum
          tersedia.
        </EmptyMessage>
      );
    }

    return (
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-lg font-bold">
          <FiZap />
          Full Analysis Report
        </h4>

        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(stats).map(
              ([key, value]) => (
                <div
                  key={key}
                  className={`rounded-xl p-3 text-center ${
                    isDarkMode
                      ? "bg-zinc-700/50"
                      : "bg-gray-100"
                  }`}
                >
                  <p
                    className={`text-2xl font-bold ${
                      key === "malicious"
                        ? "text-red-500"
                        : key ===
                            "suspicious"
                          ? "text-yellow-500"
                          : key ===
                              "harmless"
                            ? "text-green-500"
                            : "text-blue-500"
                    }`}
                  >
                    {value}
                  </p>

                  <p className="mt-1 text-xs font-bold uppercase opacity-60">
                    {key}
                  </p>
                </div>
              ),
            )}
          </div>
        )}

        {date && (
          <p className="text-xs opacity-60">
            Last analysis:{" "}
            {formatDate(date)}
          </p>
        )}

        {flagged.length > 0 && (
          <div
            className={`rounded-xl border p-4 ${
              isDarkMode
                ? "border-red-500/20 bg-red-500/10"
                : "border-red-200 bg-red-50"
            }`}
          >
            <h5 className="mb-3 font-bold text-red-500">
              Flagged by {flagged.length}{" "}
              engine(s)
            </h5>

            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
              {flagged.map(
                ([
                  vendor,
                  vendorResult,
                ]) => (
                  <div
                    key={vendor}
                    className={`rounded p-2 text-xs ${
                      isDarkMode
                        ? "bg-zinc-800"
                        : "bg-white"
                    }`}
                  >
                    <span className="font-bold">
                      {vendor}
                    </span>

                    <span
                      className={`ml-2 rounded px-1 text-[10px] ${
                        vendorResult?.category ===
                        "malicious"
                          ? "bg-red-500/20 text-red-500"
                          : "bg-yellow-500/20 text-yellow-600"
                      }`}
                    >
                      {vendorResult?.result ||
                        vendorResult?.category}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {resultEntries.length > 0 &&
          flagged.length === 0 && (
            <EmptyMessage
              isDarkMode={isDarkMode}
            >
              Tidak ada engine yang menandai
              objek ini sebagai malicious atau
              suspicious.
            </EmptyMessage>
          )}
      </div>
    );
  };

  const isCurrentTabLoading = Boolean(
    loading[activeDataKey],
  );

  return (
    <div
      className={`space-y-6 p-6 ${
        isDarkMode
          ? "bg-gradient-to-br from-zinc-900 to-zinc-950"
          : "bg-gray-50"
      }`}
    >
      <div className="flex gap-2 overflow-x-auto border-b border-zinc-700 pb-4">
        <button
          type="button"
          onClick={() =>
            setActiveTab("overview")
          }
          className={tabButtonClass(
            "overview",
          )}
        >
          <FiEye size={16} />
          Overview
        </button>

        {(normalizedType === "urls" ||
          normalizedType === "files") && (
          <button
            type="button"
            onClick={() =>
              setActiveTab("detections")
            }
            className={tabButtonClass(
              "detections",
            )}
          >
            <FiBarChart2 size={16} />
            Detections
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            setActiveTab("relationships")
          }
          className={tabButtonClass(
            "relationships",
          )}
        >
          <FiShare2 size={16} />
          Relationships
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "threat-details",
            )
          }
          className={tabButtonClass(
            "threat-details",
          )}
        >
          <FiAlertTriangle size={16} />
          Threats
        </button>

        {normalizedType === "files" && (
          <>
            <button
              type="button"
              onClick={() =>
                setActiveTab("behavior")
              }
              className={tabButtonClass(
                "behavior",
              )}
            >
              <FiActivity size={16} />
              Behavior
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("mitre")
              }
              className={tabButtonClass(
                "mitre",
              )}
            >
              <FiShield size={16} />
              MITRE
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() =>
            setActiveTab("analysis")
          }
          className={tabButtonClass(
            "analysis",
          )}
        >
          <FiZap size={16} />
          Analysis
        </button>
      </div>

      <div
        className={`rounded-2xl border p-6 ${
          isDarkMode
            ? "border-zinc-700 bg-zinc-800/50"
            : "border-gray-200 bg-white"
        }`}
      >
        {isCurrentTabLoading && (
          <div className="flex justify-center py-12">
            <FiRefreshCw
              className="animate-spin text-blue-500"
              size={24}
            />

            <span
              className={`ml-3 ${
                isDarkMode
                  ? "text-zinc-400"
                  : "text-gray-500"
              }`}
            >
              Mengambil data...
            </span>
          </div>
        )}

        {error &&
          !isCurrentTabLoading && (
            <div
              className={`rounded-xl border border-l-4 border-l-red-500 p-4 ${
                isDarkMode
                  ? "border-red-500/20 bg-red-500/10"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="mt-1 shrink-0 text-red-500" />

                <div>
                  <p className="font-semibold">
                    Error
                  </p>

                  <p className="mt-1 break-words text-sm">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

        {!isCurrentTabLoading &&
          !error && (
            <>
              {activeTab === "overview" &&
                renderOverview()}

              {activeTab ===
                "detections" &&
                renderDetectionStats()}

              {activeTab ===
                "relationships" &&
                renderRelationships()}

              {activeTab ===
                "threat-details" &&
                renderThreatDetails()}

              {activeTab === "behavior" &&
                renderBehavior()}

              {activeTab === "mitre" &&
                renderMitre()}

              {activeTab ===
                "analysis" &&
                renderAnalysis()}
            </>
          )}
      </div>
    </div>
  );
}