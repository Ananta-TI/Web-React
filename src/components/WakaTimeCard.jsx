import React, { useState, useEffect, useContext, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  Code2,
  Clock,
  Terminal,
  ExternalLink,
  RefreshCw,
  Monitor,
  AlertCircle,
  Trophy,
  Calendar,
  Layers,
  Cpu,
  Activity,
  FolderGit2,
  Package,
  HardDrive,
  Sparkles,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Palette bahasa (dipakai untuk warna bar)
// ─────────────────────────────────────────────────────────────
const LANGUAGE_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  CSS: "#38bdf8",
  SCSS: "#f472b6",
  Markdown: "#a1a1aa",
  SQL: "#f97316",
  Python: "#3b82f6",
  Bash: "#22c55e",
  PowerShell: "#0ea5e9",
  HTML: "#ef4444",
  JSON: "#f59e0b",
  Prisma: "#8b5cf6",
  Vue: "#42b883",
  Go: "#06b6d4",
  Rust: "#f97316",
  Java: "#e11d48",
  Other: "#71717a",
};

const FALLBACK_COLORS = [
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#06b6d4",
];

function langColor(name, index = 0) {
  return (
    LANGUAGE_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

// "451 hrs 47 mins" -> { value: "451", unit: "hrs 47 mins" }
function splitDuration(text) {
  if (!text) return { value: "0", unit: "hrs" };
  const parts = String(text).trim().split(/\s+/);
  if (parts.length <= 1) return { value: parts[0], unit: "hrs" };
  return { value: parts[0], unit: parts.slice(1).join(" ") };
}

function formatMoney(value) {
  const n = Number(value) || 0;
  if (n <= 0) return null;
  if (n < 1) return `$${n.toFixed(2)}`;
  if (n < 100) return `$${n.toFixed(1)}`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function formatCompact(value) {
  const n = Number(value) || 0;
  if (n <= 0) return null;
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

function formatDay(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRange(range) {
  // WakaTime kadang mengirim string ("last_7_days"), bukan objek range.
  if (!range || typeof range !== "object") return null;
  const start = range.start_date
    ? new Date(`${range.start_date}T00:00:00`)
    : null;
  const end = range.end_date ? new Date(`${range.end_date}T00:00:00`) : null;
  if (
    !start ||
    !end ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return range.text || null;
  }
  const fmt = (d) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)} ${end.getFullYear()}`;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label, hint, right }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon size={13} className="opacity-50" />
        <span className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
          {label}
        </span>
        {hint && (
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-30">
            {hint}
          </span>
        )}
      </div>
      {right}
    </div>
  );
}

function Bar({ percent, color, height = "h-1.5", track = "bg-white/10" }) {
  const width = Math.max(Number(percent) || 0, 2.5);
  return (
    <div className={`w-full ${height} overflow-hidden rounded-full ${track}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(width, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Chip({ children, tone = "default" }) {
  const tones = {
    default: "border-zinc-500/20 bg-zinc-500/10",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
    emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  };
  return (
    <span
      className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tones[tone] || tones.default}`}
    >
      {children}
    </span>
  );
}

function EmptyRow({ label }) {
  return (
    <p className="text-[11px] font-medium opacity-30">Belum ada data {label}.</p>
  );
}

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────

const WakatimeProfileCard = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllDeps, setShowAllDeps] = useState(false);

  const fetchWakaStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/wakatime");

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            "Server mengembalikan HTML. Pastikan file api/wakatime.js sudah terdeploy."
          );
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const json = await response.json();
      if (json?.data) {
        setStats(json.data);
      } else {
        throw new Error("Data tidak valid.");
      }
    } catch (err) {
      console.error("WakaTime Fetch Error:", err);
      setError(err.message || "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWakaStats();
  }, [fetchWakaStats]);

  // ── state: loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div
        className={`w-full min-h-[420px] rounded-2xl border animate-pulse ${
          isDarkMode
            ? "bg-zinc-800/40 border-zinc-700"
            : "bg-gray-100 border-gray-200"
        }`}
      >
        <div className="space-y-4 p-6">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-xl bg-white/10" />
            <div className="h-20 rounded-xl bg-white/10" />
            <div className="h-20 rounded-xl bg-white/10" />
          </div>
          <div className="h-10 w-full rounded-xl bg-white/10" />
          <div className="h-28 w-full rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  // ── state: error ────────────────────────────────────────────
  if (error) {
    return (
      <div
        className={`relative flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border p-6 backdrop-blur-xl ${
          isDarkMode
            ? "bg-zinc-800/60 border-red-500/20 text-white"
            : "bg-white border-red-200 text-black"
        }`}
      >
        <AlertCircle className="mb-2 h-8 w-8 text-red-400" />
        <p className="mb-4 max-w-xl break-words text-center text-xs font-medium opacity-70">
          {error}
        </p>
        <button
          onClick={fetchWakaStats}
          className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition-all"
        >
          <RefreshCw size={14} /> Coba Lagi
        </button>
      </div>
    );
  }

  // ── derived data ────────────────────────────────────────────
  const allTime = splitDuration(stats?.total_all_time);
  const week = splitDuration(stats?.total_7_days);
  const daily = splitDuration(stats?.daily_average);

  const languages = stats?.languages ?? [];
  const editors = stats?.editors ?? [];
  const categories = stats?.categories ?? [];
  const operatingSystems = stats?.operating_systems ?? [];
  const machines = stats?.machines ?? [];
  const projects = stats?.projects ?? [];
  const dependencies = stats?.dependencies ?? [];
  const rangeText = formatRange(stats?.range);
  const visibleDependencies = showAllDeps
    ? dependencies
    : dependencies.slice(0, 12);

  const shell = isDarkMode
    ? "bg-zinc-900/70 border-zinc-700/60 text-zinc-100"
    : "bg-white/90 border-gray-200 text-gray-900";
  const inner = isDarkMode
    ? "bg-black/20 border-white/5"
    : "bg-gray-50/80 border-black/5";
  const divider = isDarkMode ? "bg-white/5" : "bg-black/5";
  const track = isDarkMode ? "bg-white/10" : "bg-black/10";
  const chipBase = isDarkMode
    ? "border-white/10 bg-white/[0.04]"
    : "border-black/5 bg-gray-50";

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-xl font-sans transition-all duration-300 sm:p-6 ${shell}`}
    >
      {/* glow dekoratif */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-50">
          <Terminal size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Coding Stats
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
              live
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWakaStats}
            title="Refresh"
            className="p-1 opacity-30 transition hover:opacity-100"
          >
            <RefreshCw size={14} />
          </button>
          <a
            href="https://wakatime.com"
            target="_blank"
            rel="noreferrer"
            title="WakaTime"
            className="p-1 opacity-30 transition hover:opacity-100"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* ── HERO STATS ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className={`rounded-xl border p-4 ${inner}`}>
            <div className="mb-1.5 flex items-center gap-1.5 opacity-45">
              <Clock size={11} />
              <span className="text-[9px] font-black uppercase tracking-[0.14em]">
                Total All-time
              </span>
            </div>
            <p className="text-3xl font-black leading-none tracking-tighter sm:text-4xl">
              {allTime.value}
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide opacity-50">
                {allTime.unit}
              </span>
            </p>
          </div>

          <div className={`rounded-xl border p-4 ${inner}`}>
            <div className="mb-1.5 flex items-center gap-1.5 opacity-45">
              <Calendar size={11} />
              <span className="text-[9px] font-black uppercase tracking-[0.14em]">
                This Week
              </span>
            </div>
            <p className="text-2xl font-black leading-none tracking-tighter text-indigo-400">
              {week.value}
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide opacity-50">
                {week.unit}
              </span>
            </p>
          </div>

          <div className={`rounded-xl border p-4 ${inner}`}>
            <div className="mb-1.5 flex items-center gap-1.5 opacity-45">
              <Activity size={11} />
              <span className="text-[9px] font-black uppercase tracking-[0.14em]">
                Daily Average
              </span>
            </div>
            <p className="text-2xl font-black leading-none tracking-tighter text-emerald-400">
              {daily.value}
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide opacity-50">
                {daily.unit}
              </span>
            </p>
          </div>
        </div>

        {/* ── BEST DAY + RANGE ───────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {stats?.best_day && (
            <div
              className={`flex flex-1 items-center gap-3 rounded-xl border p-3 ${
                isDarkMode
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <Trophy className="h-4 w-4 shrink-0 text-amber-400" />
              <div className="min-w-0 text-[11px]">
                <span className="opacity-60">Best day: </span>
                <span className="font-bold">
                  {formatDay(stats.best_day.date)}
                </span>
                <span className="mx-2 opacity-30">|</span>
                <span className="font-bold text-amber-400">
                  {stats.best_day.text}
                </span>
              </div>
            </div>
          )}

          {rangeText && (
            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-40 ${
                stats?.best_day ? "" : "px-1"
              }`}
            >
              {rangeText}
            </span>
          )}
        </div>

        {stats?.partial && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[10px] font-medium text-amber-300">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>
              Sebagian data gagal diambil — pastikan scope token mencakup{" "}
              <code>read_stats</code>.
            </span>
          </div>
        )}

        {/* ── LANGUAGES ──────────────────────────────────────── */}
        <section>
          <SectionTitle
            icon={Code2}
            label="Languages"
            hint={`${languages.length} total`}
            right={
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider opacity-40">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  AI
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Manual
                </span>
              </div>
            }
          />

          {languages.length === 0 ? (
            <EmptyRow label="bahasa" />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang, index) => {
                const ai = Number(lang.ai_coding_seconds) || 0;
                const manual = Number(lang.manual_coding_seconds) || 0;
                const total = ai + manual || 1;
                const manualShare = (manual / total) * 100;
                const hasManual = manual > 0;

                return (
                  <div key={lang.name} className="min-w-0">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="truncate text-[11px] font-bold">
                        {lang.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold tabular-nums opacity-50">
                        {lang.text === "0 secs" ? "—" : lang.text}
                      </span>
                    </div>

                    <div className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}>
                      <div
                        className="flex h-full overflow-hidden rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            Math.max(lang.percent, 2.5),
                            100
                          )}%`,
                          backgroundColor: langColor(lang.name, index),
                        }}
                      >
                        {hasManual && (
                          <span
                            className="h-full bg-emerald-400/90"
                            style={{ width: `${manualShare}%` }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider opacity-35">
                      <span>{lang.digital}</span>
                      <span>{Number(lang.percent).toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className={`h-px w-full ${divider}`} />

        {/* ── EDITORS ────────────────────────────────────────── */}
        <section>
          <SectionTitle
            icon={Monitor}
            label="Editors"
            hint={`${editors.length} total`}
          />

          {editors.length === 0 ? (
            <EmptyRow label="editor" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {editors.map((editor, index) => {
                const cost = formatMoney(editor.ai_model_total_cost);
                const lines = formatCompact(editor.ai_additions);
                const sessions = Number(editor.ai_sessions) || 0;

                return (
                  <div
                    key={editor.name}
                    className={`min-w-0 rounded-xl border p-3 ${inner}`}
                  >
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className="truncate text-[11px] font-bold">
                        {editor.name}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold tabular-nums opacity-50">
                        {editor.text}
                      </span>
                    </div>

                    <Bar
                      percent={editor.percent}
                      color={langColor(editor.name, index + 3)}
                      height="h-1.5"
                      track={track}
                    />

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-35">
                        {Number(editor.percent).toFixed(2)}%
                      </span>
                      {sessions > 0 && <Chip tone="indigo">{sessions} sesi</Chip>}
                      {lines && <Chip tone="emerald">+{lines} baris</Chip>}
                      {cost && <Chip tone="amber">{cost} AI</Chip>}
                      {Number(editor.human_additions) > 0 && (
                        <Chip>{editor.human_additions} manual</Chip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── ENVIRONMENT (OS + kategori) ─────────────────────── */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border p-3 ${inner}`}>
            <SectionTitle icon={Cpu} label="Operating System" />
            {operatingSystems.length === 0 ? (
              <EmptyRow label="OS" />
            ) : (
              <div className="space-y-2">
                {operatingSystems.map((os) => (
                  <div key={os.name}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="truncate text-[10px] font-bold">
                        {os.name}
                      </span>
                      <span className="shrink-0 text-[9px] font-bold opacity-40">
                        {os.text}
                      </span>
                    </div>
                    <Bar
                      percent={os.percent}
                      color="#818cf8"
                      height="h-1"
                      track={track}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`rounded-xl border p-3 ${inner}`}>
            <SectionTitle icon={Layers} label="Categories" />
            {categories.length === 0 ? (
              <EmptyRow label="kategori" />
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name}>
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="truncate text-[10px] font-bold">
                        {category.name}
                      </span>
                      <span className="shrink-0 text-[9px] font-bold opacity-40">
                        {category.text}
                      </span>
                    </div>
                    <Bar
                      percent={category.percent}
                      color="#f472b6"
                      height="h-1"
                      track={track}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── PROJECTS ───────────────────────────────────────── */}
        {projects.length > 0 && (
          <section>
            <SectionTitle
              icon={FolderGit2}
              label="Projects"
              hint={`${projects.length} total`}
            />
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {projects.map((project) => (
                <div key={project.name} className="min-w-0">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="truncate text-[10px] font-bold">
                      {project.name}
                    </span>
                    <span className="shrink-0 text-[9px] font-bold tabular-nums opacity-45">
                      {project.text}
                    </span>
                  </div>
                  <Bar
                    percent={project.percent}
                    color="#22d3ee"
                    height="h-1"
                    track={track}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── DEPENDENCIES ───────────────────────────────────── */}
        {dependencies.length > 0 && (
          <section>
            <SectionTitle
              icon={Package}
              label="Dependencies"
              hint={`${dependencies.length} total`}
            />
            <div className="flex flex-wrap gap-1.5">
              {visibleDependencies.map((dep) => (
                <span
                  key={dep.name}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold ${chipBase}`}
                >
                  <span className="max-w-[9rem] truncate">{dep.name}</span>
                  <span className="tabular-nums opacity-40">
                    {Number(dep.percent).toFixed(1)}%
                  </span>
                </span>
              ))}
            </div>

            {dependencies.length > 12 && (
              <button
                onClick={() => setShowAllDeps((prev) => !prev)}
                className={`mt-2 w-full rounded-lg border py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                  isDarkMode
                    ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.08]"
                    : "border-black/5 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {showAllDeps
                  ? "Sembunyikan"
                  : `Tampilkan semua (${dependencies.length})`}
              </button>
            )}
          </section>
        )}

        {/* ── MACHINES ───────────────────────────────────────── */}
        {machines.length > 0 && (
          <section>
            <SectionTitle
              icon={HardDrive}
              label="Machines"
              hint={`${machines.length} total`}
            />
            <div className="flex flex-wrap gap-1.5">
              {machines.map((machine) => (
                <span
                  key={machine.name}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold ${chipBase}`}
                >
                  <span className="truncate">{machine.name}</span>
                  <span className="tabular-nums opacity-40">
                    {machine.text}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div
        className={`mt-6 flex items-center justify-between border-t pt-3 ${
          isDarkMode ? "border-white/5" : "border-black/5"
        }`}
      >
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider opacity-30">
          <Sparkles size={10} />
          WakaTime · last 7 days
        </span>
        <a
          href="https://wakatime.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="text-[9px] font-black uppercase tracking-wider opacity-30 transition hover:opacity-80"
        >
          Dashboard →
        </a>
      </div>
    </div>
  );
};

export default WakatimeProfileCard;
