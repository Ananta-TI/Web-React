import React, { useCallback, useEffect, useMemo, useState } from "react";
import DecryptedText from "../components/Shared/DecryptedText";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Zap,
  EyeOff,
  BarChart3,
  Filter,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STATUS_COLORS = {
  Harmless: "#10b981",
  Suspicious: "#f59e0b",
  Malicious: "#ef4444",
  Undetected: "#71717a",
};

const TYPE_COLORS = {
  URL: "#3b82f6",
  FILE: "#8b5cf6",
};

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function safePercentage(value, total, decimals = 0) {
  const num = safeNumber(value);
  const base = safeNumber(total);

  if (!base) return 0;

  const pct = (num / base) * 100;
  return Number(pct.toFixed(decimals));
}

function getStatus(stats = {}) {
  if (safeNumber(stats.malicious) > 0) return "Malicious";
  if (safeNumber(stats.suspicious) > 0) return "Suspicious";
  if (safeNumber(stats.harmless) > 0) return "Harmless";
  return "Undetected";
}

function buildConicGradient(stats, total, isDarkMode) {
  if (!stats.length || !total) {
    return isDarkMode ? "#27272a" : "#e4e4e7";
  }

  let current = 0;

  const parts = stats.map((item) => {
    const value = safePercentage(item.value, total, 2);
    const start = current;
    const end = current + value;

    current = end;

    const color =
      item.name === "Undetected"
        ? isDarkMode
          ? "#ffffff"
          : "#52525b"
        : STATUS_COLORS[item.name];

    return `${color} ${start}% ${end}%`;
  });

  return `conic-gradient(${parts.join(", ")})`;
}

function buildLinePoints(trend, width, height, padding) {
  if (!trend.length) return "";

  const maxTotal = Math.max(...trend.map((item) => safeNumber(item.total)), 1);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return trend
    .map((item, index) => {
      const x =
        trend.length === 1
          ? width / 2
          : padding + (index / (trend.length - 1)) * innerWidth;

      const y =
        padding + innerHeight - (safeNumber(item.total) / maxTotal) * innerHeight;

      return `${x},${y}`;
    })
    .join(" ");
}

function buildChartData(rawData) {
  const counts = {
    Harmless: 0,
    Suspicious: 0,
    Malicious: 0,
    Undetected: 0,
  };

  const typeMap = {
    url: 0,
    file: 0,
  };

  const trendMap = {};

  rawData.forEach((item) => {
    const status = getStatus(item.stats || {});
    counts[status] += 1;

    if (item.type && Object.prototype.hasOwnProperty.call(typeMap, item.type)) {
      typeMap[item.type] += 1;
    }

    const date = item.created_at?.split("T")[0];

    if (!date) return;

    if (!trendMap[date]) {
      trendMap[date] = {
        date,
        Harmless: 0,
        Suspicious: 0,
        Malicious: 0,
        Undetected: 0,
        total: 0,
      };
    }

    trendMap[date][status] += 1;
    trendMap[date].total += 1;
  });

  return {
    stats: Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    })),
    types: Object.entries(typeMap).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    })),
    trend: Object.values(trendMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
    total: rawData.length,
  };
}

function MiniTimelineChart({ data, isDarkMode }) {
  const width = 720;
  const height = 260;
  const padding = 32;

  const points = useMemo(() => {
    return buildLinePoints(data, width, height, padding);
  }, [data]);

  const maxTotal = useMemo(() => {
    return Math.max(...data.map((item) => safeNumber(item.total)), 1);
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-zinc-500 animate-pulse">
        Initializing Neural Net...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[300px] w-full overflow-visible"
          role="img"
          aria-label="Scan trend chart"
        >
          {[0, 1, 2, 3].map((line) => {
            const y = padding + line * ((height - padding * 2) / 3);

            return (
              <line
                key={line}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke={isDarkMode ? "#27272a" : "#e4e4e7"}
                strokeDasharray="4 6"
              />
            );
          })}

          {data.map((item, index) => {
            const innerWidth = width - padding * 2;
            const innerHeight = height - padding * 2;

            const x =
              data.length === 1
                ? width / 2
                : padding + (index / (data.length - 1)) * innerWidth;

            const maliciousHeight =
              (safeNumber(item.Malicious) / maxTotal) * innerHeight;

            return (
              <g key={item.date}>
                <rect
                  x={x - 4}
                  y={height - padding - maliciousHeight}
                  width="8"
                  height={maliciousHeight}
                  rx="4"
                  fill={STATUS_COLORS.Malicious}
                  opacity="0.85"
                />

                <circle
                  cx={x}
                  cy={
                    padding +
                    innerHeight -
                    (safeNumber(item.total) / maxTotal) * innerHeight
                  }
                  r="4"
                  fill="#10b981"
                />

                {index % Math.ceil(data.length / 6 || 1) === 0 && (
                  <text
                    x={x}
                    y={height - 4}
                    textAnchor="middle"
                    fontSize="10"
                    fill={isDarkMode ? "#71717a" : "#52525b"}
                  >
                    {item.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}

          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="flex flex-wrap items-center justify-end gap-4 text-[10px] font-mono uppercase text-zinc-500">
          <LegendDot color="#10b981" label="Global Volume" />
          <LegendDot color={STATUS_COLORS.Malicious} label="Malicious" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

const ScanStatsDashboard = ({ isDarkMode = true }) => {
  const [activeTimeRange, setActiveTimeRange] = useState("all");
  const [data, setData] = useState({
    stats: [],
    types: [],
    trend: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setData(buildChartData([]));
        return;
      }

      let startDate = null;

      if (activeTimeRange !== "all") {
        startDate = new Date();
        startDate.setDate(
          startDate.getDate() - (activeTimeRange === "7d" ? 7 : 30)
        );
      }

      const url = `${SUPABASE_URL}/rest/v1/scan_history?select=type,stats,created_at`;

      const response = await fetch(
        startDate
          ? `${url}&created_at=gte.${startDate.toISOString()}`
          : url,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch scan history");
      }

      const rawData = await response.json();
      const normalizedData = Array.isArray(rawData) ? rawData : [];

      setData(buildChartData(normalizedData));
    } catch (error) {
      console.error(error);
      setData(buildChartData([]));
    } finally {
      setIsLoading(false);
    }
  }, [activeTimeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const harmlessValue =
    data.stats.find((item) => item.name === "Harmless")?.value || 0;

  const healthPercentage = safePercentage(harmlessValue, data.total);

  const donutBackground = useMemo(() => {
    return buildConicGradient(data.stats, data.total, isDarkMode);
  }, [data.stats, data.total, isDarkMode]);

  return (
    <section
      className={`w-full min-h-screen py-16 ${
        isDarkMode ? "text-zinc-100" : "text-zinc-900"
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-5xl md:text-6xl font-bold font-lyrae">
              <DecryptedText
                text="Scan Statistics"
                speed={35}
                maxIterations={28}
                sequential
                animateOn="view"
              />
            </h2>
          </div>

          <div
            className={`flex cursor-target backdrop-blur-md p-1 rounded-xl border ${
              isDarkMode
                ? "bg-zinc-800/30 border-zinc-700/50"
                : "bg-white/50 border-zinc-200"
            }`}
          >
            {["all", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTimeRange === range
                    ? "bg-indigo-600 text-white shadow-lg"
                    : isDarkMode
                    ? "text-zinc-500 hover:text-zinc-200"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatNode
            className="cursor-target"
            isDarkMode={isDarkMode}
            icon={Shield}
            label="Harmless"
            value={data.stats.find((item) => item.name === "Harmless")?.value}
            color={STATUS_COLORS.Harmless}
          />

          <StatNode
            className="cursor-target"
            isDarkMode={isDarkMode}
            icon={AlertTriangle}
            label="Suspicious"
            value={data.stats.find((item) => item.name === "Suspicious")?.value}
            color={STATUS_COLORS.Suspicious}
          />

          <StatNode
            className="cursor-target"
            isDarkMode={isDarkMode}
            icon={Zap}
            label="Malicious"
            value={data.stats.find((item) => item.name === "Malicious")?.value}
            color={STATUS_COLORS.Malicious}
          />

          <StatNode
            className="cursor-target"
            isDarkMode={isDarkMode}
            icon={EyeOff}
            label="Undetected"
            value={data.stats.find((item) => item.name === "Undetected")?.value}
            color={isDarkMode ? "#ffffff" : "#52525b"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <ChartWrapper
              isDarkMode={isDarkMode}
              title="Neural Threat Detection Timeline"
              subtitle="Detection density over temporal distribution"
              className="cursor-target"
            >
              {isLoading ? (
                <div className="flex h-[300px] items-center justify-center text-sm text-zinc-500 animate-pulse">
                  Loading scan data...
                </div>
              ) : (
                <MiniTimelineChart data={data.trend} isDarkMode={isDarkMode} />
              )}
            </ChartWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartWrapper
                className="cursor-target"
                isDarkMode={isDarkMode}
                title="Origin Protocol"
                subtitle="Vector analysis by source type"
              >
                <div className="flex items-center justify-around h-[250px]">
                  {data.types.map((type) => (
                    <div
                      key={type.name}
                      className="relative flex flex-col items-center"
                    >
                      <div
                        className={`w-12 h-40 rounded-2xl relative overflow-hidden ${
                          isDarkMode ? "bg-zinc-800/50" : "bg-zinc-200/50"
                        }`}
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{
                            height: `${safePercentage(
                              type.value,
                              data.total
                            )}%`,
                          }}
                          transition={{ duration: 1.1, ease: "easeOut" }}
                          className="absolute bottom-0 w-full rounded-t-xl"
                          style={{
                            background: `linear-gradient(to top, ${
                              type.name === "URL"
                                ? TYPE_COLORS.URL
                                : TYPE_COLORS.FILE
                            }, #a855f7)`,
                          }}
                        />
                      </div>

                      <span
                        className={`mt-4 font-mono text-[10px] font-bold uppercase ${
                          isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        }`}
                      >
                        {type.name}
                      </span>

                      <span
                        className={`text-lg font-black ${
                          isDarkMode ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {type.value}
                      </span>
                    </div>
                  ))}

                  <div className="hidden sm:block border-l border-zinc-700/30 pl-6 space-y-4 font-mono">
                    <InfoBlock label="Uptime" value="99.9%" color="text-emerald-500" />
                    <InfoBlock label="Rate" value="1.2s/req" color="text-amber-500" />
                  </div>
                </div>
              </ChartWrapper>

              <ChartWrapper
                className="cursor-target"
                isDarkMode={isDarkMode}
                title="Risk Distribution"
                subtitle="Composition of scanned entities"
              >
                <div className="h-[250px] w-full relative flex items-center justify-center">
                  <div
                    className="h-[180px] w-[180px] rounded-full relative"
                    style={{ background: donutBackground }}
                  >
                    <div
                      className={`absolute inset-[28px] rounded-full ${
                        isDarkMode ? "bg-zinc-950" : "bg-white"
                      }`}
                    />
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isDarkMode ? "text-zinc-500" : "text-zinc-400"
                      }`}
                    >
                      HEALTH
                    </span>

                    <span
                      className={`text-3xl font-black ${
                        isDarkMode ? "text-white" : "text-zinc-900"
                      }`}
                    >
                      {healthPercentage}%
                    </span>
                  </div>
                </div>
              </ChartWrapper>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div
              className={`p-6 rounded-3xl border cursor-target transition-colors duration-500 ${
                isDarkMode
                  ? "bg-zinc-900/50 border-zinc-800"
                  : "bg-white border-zinc-200 shadow-xl"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-6 flex items-center gap-2 ${
                  isDarkMode ? "text-zinc-100" : "text-zinc-800"
                }`}
              >
                <Filter size={18} className="text-indigo-500" />
                Entity Distribution
              </h3>

              <div className="space-y-4">
                {data.stats.map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800/30 border-zinc-700/30"
                        : "bg-zinc-50 border-zinc-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            item.name === "Undetected"
                              ? isDarkMode
                                ? "#ffffff"
                                : "#52525b"
                              : STATUS_COLORS[item.name],
                        }}
                      />

                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-mono font-bold ${
                        isDarkMode ? "text-zinc-200" : "text-zinc-900"
                      }`}
                    >
                      {safePercentage(item.value, data.total, 1)}%
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={`mt-8 pt-6 border-t ${
                  isDarkMode ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                <div className="flex justify-between text-xs mb-2 font-mono">
                  <span className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>
                    PROCESSING_LOAD
                  </span>

                  <span className="text-indigo-500 font-bold">99.2%</span>
                </div>

                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDarkMode ? "bg-zinc-800" : "bg-zinc-200"
                  }`}
                >
                  <div className="h-full bg-indigo-500 w-[99.2%]" />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden group shadow-2xl cursor-target">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <BarChart3 size={120} />
              </div>

              <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">
                Cumulative Analysis
              </h4>

              <p className="text-4xl font-black mb-4">
                {data.total.toLocaleString()}
              </p>

              <p className="text-xs opacity-70 leading-relaxed font-medium italic">
                Verified system entities processed across neural detection nodes
                within the temporal parameters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(ScanStatsDashboard);

function InfoBlock({ label, value, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-zinc-500 font-bold uppercase">
        {label}
      </span>

      <span className={`${color} font-bold text-sm`}>{value}</span>
    </div>
  );
}

function StatNode({
  icon: Icon,
  label,
  value,
  color,
  isDarkMode,
  className = "",
}) {
  return (
    <div
      className={`
        p-6 rounded-2xl border transition-all group
        ${
          isDarkMode
            ? "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
            isDarkMode ? "bg-zinc-800" : "bg-zinc-100"
          }`}
          style={{ color }}
        >
          <Icon size={32} />
        </div>

        <div>
          <p
            className={`text-[10px] uppercase tracking-tighter font-bold ${
              isDarkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`text-2xl font-mono font-black ${
              isDarkMode ? "text-zinc-100" : "text-zinc-900"
            }`}
          >
            {value || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChartWrapper({
  title,
  subtitle,
  children,
  isDarkMode,
  className = "",
}) {
  return (
    <div
      className={`p-8 rounded-3xl border backdrop-blur-sm relative transition-all duration-500 ${className} ${
        isDarkMode
          ? "bg-zinc-900/30 border-zinc-800/50"
          : "bg-white border-zinc-200 shadow-lg"
      }`}
    >
      <div className="mb-6">
        <h3
          className={`text-lg font-bold tracking-tight ${
            isDarkMode ? "text-zinc-100" : "text-zinc-800"
          }`}
        >
          {title}
        </h3>

        <p
          className={`text-xs font-mono italic ${
            isDarkMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
}