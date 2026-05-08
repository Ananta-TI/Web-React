import { useState, useEffect } from "react";

function formatDateRange(startDate, endDate) {
  const options = { month: "short", day: "numeric" };
  const start = new Date(startDate).toLocaleDateString("en-US", options);
  const end = new Date(endDate).toLocaleDateString("en-US", options);
  return `${start} → ${end}`;
}

export function useGithubStats(username) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [allDays, setAllDays] = useState([]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    // 🔧 FIX 1: Tambah parameter tahun agar data sama dengan react-github-calendar
    const currentYear = new Date().getFullYear();
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${currentYear - 1}&y=${currentYear}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const days = Array.isArray(data.contributions)
          ? data.contributions
          : [];
        if (days.length === 0) throw new Error("No contribution data");

        days.sort((a, b) => a.date.localeCompare(b.date));

        // 🔧 FIX 2: Hitung 53 minggu ke belakang dari hari ini (sama seperti grafik asli GitHub)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const graphStart = new Date(today);
        graphStart.setDate(graphStart.getDate() - 371); // 53 minggu = 371 hari
        graphStart.setDate(graphStart.getDate() - graphStart.getDay()); // Mundur ke hari Minggu
        
        // Filter hanya data yang ada di range grafik
        const recent = days.filter(d => {
          const [y, m, dd] = d.date.split('-').map(Number);
          const date = new Date(y, m - 1, dd);
          return date >= graphStart && date <= today;
        });

        if (recent.length === 0) throw new Error("No contribution data in range");

        const total = recent.reduce((s, d) => s + d.count, 0);
        const best = recent.reduce(
          (a, b) => (b.count > a.count ? b : a),
          recent[0]
        );
        const last7 = recent.slice(-7).reduce((s, d) => s + d.count, 0);
        const activeDays = recent.filter((d) => d.count > 0).length;
        const avg = (total / Math.max(1, activeDays)).toFixed(2);

        let longest = 0, current = 0, run = 0;
        let longestStart = "", longestEnd = "", currentStart = "", tempStart = "";

        for (const d of recent) {
          if (d.count > 0) {
            if (run === 0) tempStart = d.date;
            run++;
            if (run > longest) {
              longest = run;
              longestStart = tempStart;
              longestEnd = d.date;
            }
          } else {
            run = 0;
          }
        }

        for (let i = recent.length - 1; i >= 0; i--) {
          if (recent[i].count > 0) {
            current++;
            currentStart = recent[i].date;
          } else {
            break;
          }
        }

        const todayStr = recent[recent.length - 1].date;
        const weekAgoDate = recent[Math.max(0, recent.length - 7)].date;
        const yearAgoDate = recent[0].date;

        setStats({
          total,
          thisWeek: last7,
          bestDay: best.count,
          bestDate: best.date,
          longestStreak: longest,
          currentStreak: current,
          avg,
          dateRange: formatDateRange(yearAgoDate, todayStr),
          weekRange: formatDateRange(weekAgoDate, todayStr),
          longestRange:
            longest > 0 ? formatDateRange(longestStart, longestEnd) : "-",
          currentRange:
            current > 0 ? formatDateRange(currentStart, todayStr) : "-",
        });

        setAllDays(recent);
        setLoading(false);
      })
      .catch((e) => {
        console.error("useGithubStats fetch error:", e);
        setError(`Failed to load contributions: ${e.message}`);
        setLoading(false);
      });
  }, [username]);

  return { loading, error, stats, allDays };
}