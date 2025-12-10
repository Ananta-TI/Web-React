import { useEffect, useState, useLayoutEffect, useRef, useContext } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ThemeContext } from "../context/ThemeContext";
import DecryptedText from "../components/Shared/DecryptedText";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ScanStatsDashboard() {
  const { isDarkMode } = useContext(ThemeContext);
  
  // State Data
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [trendData, setTrendData] = useState([]); // State baru untuk data Timeline
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs untuk Container Chart
  const chart1Ref = useRef(null); // Pie
  const chart2Ref = useRef(null); // Bar Type
  const chart3Ref = useRef(null); // Area Pulse (Trend)

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/scan_history?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();

      // 1. OLAH DATA: Status Counts (Pie Chart)
      const counts = { Harmless: 0, Suspicious: 0, Malicious: 0 };
      data.forEach((row) => {
        const status =
          row?.stats?.malicious > 0 ? "Malicious"
          : row?.stats?.suspicious > 0 ? "Suspicious"
          : "Harmless";
        counts[status]++;
      });

      setStatusData([
        { name: "Harmless", value: counts.Harmless, color: 0x10b981 },
        { name: "Suspicious", value: counts.Suspicious, color: 0xf59e0b },
        { name: "Malicious", value: counts.Malicious, color: 0xef4444 },
      ]);

      // 2. OLAH DATA: Type Counts (Bar Chart)
      const t = { url: 0, file: 0 };
      data.forEach((row) => {
        if (row.type === "url") t.url++;
        else if (row.type === "file") t.file++;
      });

      setTypeData([
        { name: "URL", value: t.url, color: 0x3b82f6 },
        { name: "File", value: t.file, color: 0x8b5cf6 },
      ]);

      // 3. OLAH DATA: Trend Timeline (Area Chart - NEW LOGIC)
      const timelineMap = {};
      data.forEach((item) => {
        // Cek field tanggal yang tersedia
        const dateStr = item.created_at || item.timestamp || item.date;
        if (!dateStr) return;

        const dateObj = new Date(dateStr);
        // Kita group per Jam (set menit/detik ke 0)
        dateObj.setMinutes(0, 0, 0); 
        const timestamp = dateObj.getTime();

        timelineMap[timestamp] = (timelineMap[timestamp] || 0) + 1;
      });

      // Convert ke array dan sort berdasarkan waktu
      const sortedTrend = Object.keys(timelineMap)
        .map((key) => ({
          date: parseInt(key),
          value: timelineMap[key],
        }))
        .sort((a, b) => a.date - b.date);
      
      setTrendData(sortedTrend);
      setTotalScans(data.length);

    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  // --- CHART 1: PIE CHART (Status) ---
  useLayoutEffect(() => {
    if (statusData.length === 0 || loading) return;

    const root = am5.Root.new(chart1Ref.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50)
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "name",
        alignLabels: false
      })
    );

    series.labels.template.setAll({
      textType: "circular",
      centerX: 0,
      centerY: 0,
      fontSize: 12,
      fill: am5.color(isDarkMode ? 0xffffff : 0x000000)
    });

    series.slices.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(isDarkMode ? 0x27272a : 0xffffff),
      cornerRadius: 5,
      tooltipText: "{category}: {value}"
    });

    series.data.setAll(statusData);
    statusData.forEach((item, index) => {
      series.slices.getIndex(index).set("fill", am5.color(item.color));
    });

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15
      })
    );
    legend.labels.template.setAll({ fill: am5.color(isDarkMode ? 0xe4e4e7 : 0x27272a) });
    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);
    return () => root.dispose();
  }, [statusData, isDarkMode, loading]);

  // --- CHART 2: BAR CHART (Type) ---
  useLayoutEffect(() => {
    if (typeData.length === 0 || loading) return;

    const root = am5.Root.new(chart2Ref.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none"
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {});
    xRenderer.labels.template.setAll({
      fill: am5.color(isDarkMode ? 0xe4e4e7 : 0x27272a),
      fontSize: 12
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "name",
        renderer: xRenderer
      })
    );
    xAxis.data.setAll(typeData);

    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      fill: am5.color(isDarkMode ? 0xa1a1aa : 0x52525b),
      fontSize: 12
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { renderer: yRenderer })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        categoryXField: "name"
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 8,
      cornerRadiusTR: 8,
      tooltipText: "{categoryX}: {valueY}",
      width: am5.percent(60)
    });

    series.columns.template.adapters.add("fill", (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const index = series.dataItems.indexOf(dataItem);
        return am5.color(typeData[index].color);
      }
      return fill;
    });

    series.data.setAll(typeData);
    series.appear(1000);
    return () => root.dispose();
  }, [typeData, isDarkMode, loading]);


  // --- CHART 3: AREA PULSE CHART (Trend/Timeline) - LOGIC BARU ---
  // 
  useLayoutEffect(() => {
    // Render chart meskipun data kosong (tampilkan grid kosong) atau tunggu data
    if (loading) return;
    
    const root = am5.Root.new(chart3Ref.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        layout: root.verticalLayout,
        paddingLeft: 0
      })
    );

    // Cursor (Garis putus-putus saat hover)
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    // Axis X (Waktu/Date)
    const xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.2,
        baseInterval: { timeUnit: "hour", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50
        }),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    xAxis.get("renderer").labels.template.setAll({
      fill: am5.color(isDarkMode ? 0xa1a1aa : 0x52525b),
      fontSize: 12,
    });

    // Axis Y (Jumlah Scan)
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    yAxis.get("renderer").labels.template.setAll({
      fill: am5.color(isDarkMode ? 0xa1a1aa : 0x52525b),
      fontSize: 12,
    });

    // Series (Smoothed Line + Gradient Fill)
    const series = chart.series.push(
      am5xy.SmoothedXLineSeries.new(root, {
        name: "Scans",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "[bold]{valueY}[/] Scans",
        })
      })
    );

    // Styling Series (Neon Effect)
    series.strokes.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6), // Indigo/Blue
      shadowColor: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6),
      shadowBlur: 10,
      shadowOpacity: 0.5,
    });

    series.fills.template.setAll({
      fillOpacity: 1,
      visible: true,
      fillGradient: am5.LinearGradient.new(root, {
        stops: [
          { color: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6), opacity: 0.5 },
          { color: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6), opacity: 0.05 },
        ],
        rotation: 90,
      }),
    });

    // Set Data
    series.data.setAll(trendData);

    // Animate
    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, [trendData, isDarkMode, loading]);

  return (
    <section className={`relative w-full min-h-screen py-12 sm:py-20 ${
      isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-gray-900"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-12"> 
        <h2 className={`text-4xl sm:text-5xl font-bold font-lyrae mb-2 sm:mb-4 ${isDarkMode ? "text-white" : "text-black"}`}> 
          <DecryptedText
            text="Scan Statistics"
            speed={100}
            maxIterations={105}
            sequential
            animateOn="view"
          />
        </h2>
        <p className={`text-base sm:text-lg font-mono ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
          Comprehensive analysis of all scan activity
        </p>

        {/* Stats Cards: Gunakan grid-cols-2 untuk mobile kecil agar tidak terlalu panjang ke bawah */}
        <div className="mt-8 grid font-mono grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"> 
          {/* Card Total */}
          <div className={`rounded-xl sm:rounded-2xl cursor-target p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-2xl sm:text-3xl font-bold font-lyrae text-blue-500">{totalScans}</div>
            <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Total Scans</div>
          </div>
          {/* Card Harmless */}
          <div className={`rounded-xl sm:rounded-2xl cursor-target p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-2xl sm:text-3xl font-lyrae font-bold text-green-500">
              {statusData.find((d) => d.name === "Harmless")?.value || 0}
            </div>
            <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Harmless</div>
          </div>
          {/* Card Suspicious */}
          <div className={`rounded-xl sm:rounded-2xl cursor-target p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-2xl sm:text-3xl font-lyrae font-bold text-amber-500">
              {statusData.find((d) => d.name === "Suspicious")?.value || 0}
            </div>
            <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Suspicious</div>
          </div>
          {/* Card Malicious */}
          <div className={`rounded-xl sm:rounded-2xl cursor-target p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-2xl sm:text-3xl font-lyrae font-bold text-red-500">
              {statusData.find((d) => d.name === "Malicious")?.value || 0}
            </div>
            <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Malicious</div>
          </div>
        </div>
      </div>

      {/* Chart containers: Gunakan grid-cols-1 di mobile, dan lg:grid-cols-2 di layar besar */}
      <div className="container mx-auto px-4 sm:px-6 grid gap-6 lg:grid-cols-2"> 
        {/* Pie Chart (Status) */}
        <div className={`rounded-xl sm:rounded-3xl p-6 sm:p-8 cursor-target transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/50 border border-zinc-700 shadow-xl" : "bg-white border border-gray-200 shadow-lg"
        }`}>
          <h3 className="text-xl sm:text-2xl font-lyrae font-semibold mb-4 sm:mb-6 flex items-center gap-2"> 
            <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
            Status Distribution
          </h3>
          {loading ? (
            <div className="h-[300px] sm:h-[350px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div ref={chart1Ref} style={{ width: "100%", height: "350px" }}></div>
          )}
        </div>

        {/* Bar Chart (Type) */}
        <div className={`rounded-xl sm:rounded-3xl p-6 sm:p-8 cursor-target transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/50 border border-zinc-700 shadow-xl" : "bg-white border border-gray-200 shadow-lg"
        }`}>
          <h3 className="text-xl sm:text-2xl font-lyrae font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
            Scan Type Overview
          </h3>
          {loading ? (
            <div className="h-[300px] sm:h-[350px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div ref={chart2Ref} style={{ width: "100%", height: "350px" }}></div>
          )}
        </div>

        {/* --- CHART 3: NEW ACTIVITY PULSE (Area Chart) --- */}
        <div className={`lg:col-span-2 rounded-xl sm:rounded-3xl p-6 sm:p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/50 border border-zinc-700 shadow-xl" : "bg-white border border-gray-200 shadow-lg"
        }`}>
          <h3 className="text-xl sm:text-2xl font-lyrae font-semibold mb-2 flex items-center gap-2">
            <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></span>
            Activity Pulse
          </h3>
          <p className={`text-xs sm:text-sm font-mono mb-4 sm:mb-6 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
            Real-time scan frequency timeline
          </p>
          
          {loading ? (
            <div className="h-[350px] sm:h-[450px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : trendData.length === 0 ? (
            <div className="h-[350px] sm:h-[450px] flex items-center justify-center">
               <p className={isDarkMode ? "text-zinc-400" : "text-gray-600"}>No activity recorded yet</p>
            </div>
          ) : (
            <div ref={chart3Ref} style={{ width: "100%", height: "450px" }}></div>
          )}
        </div>
      </div>
    </section>
  );
}