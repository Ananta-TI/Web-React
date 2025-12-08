import { useEffect, useState, useLayoutEffect, useRef, useContext } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ThemeContext } from "../context/ThemeContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ScanStatsDashboard() {
  const { isDarkMode } = useContext(ThemeContext);
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [sortedBarData, setSortedBarData] = useState([]);
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);

  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);

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

      const counts = { Harmless: 0, Suspicious: 0, Malicious: 0 };

      data.forEach((row) => {
        const status =
          row?.stats?.malicious > 0
            ? "Malicious"
            : row?.stats?.suspicious > 0
            ? "Suspicious"
            : "Harmless";

        counts[status]++;
      });

      setStatusData([
        { name: "Harmless", value: counts.Harmless, color: 0x10b981 },
        { name: "Suspicious", value: counts.Suspicious, color: 0xf59e0b },
        { name: "Malicious", value: counts.Malicious, color: 0xef4444 },
      ]);

      const t = { url: 0, file: 0 };
      data.forEach((row) => {
        if (row.type === "url") t.url++;
        else if (row.type === "file") t.file++;
      });

      setTypeData([
        { name: "URL", value: t.url, color: 0x3b82f6 },
        { name: "File", value: t.file, color: 0x8b5cf6 },
      ]);

      // Prepare sorted bar chart data - hourly activity distribution
      const hourlyStats = Array(24).fill(0).map((_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        scans: 0
      }));

      data.forEach((row) => {
        const dateField = row.created_at || row.timestamp || row.date || row.scanned_at;
        if (dateField) {
          const date = new Date(dateField);
          const hour = date.getHours();
          hourlyStats[hour].scans++;
        }
      });

      // Sort by scans (descending)
      const sortedStats = hourlyStats.sort((a, b) => b.scans - a.scans);
      
      setSortedBarData(sortedStats);
      setTotalScans(data.length);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  // Pie Chart - Status Distribution
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

    series.slices.template.states.create("hover", {
      scale: 1.05
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

    legend.labels.template.setAll({
      fontSize: 13,
      fontWeight: "500",
      fill: am5.color(isDarkMode ? 0xe4e4e7 : 0x27272a)
    });

    legend.data.setAll(series.dataItems);

    series.appear(1000, 100);

    return () => root.dispose();
  }, [statusData, isDarkMode, loading]);

  // Bar Chart - Type Overview
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
      fontSize: 13,
      fontWeight: "500",
      fill: am5.color(isDarkMode ? 0xe4e4e7 : 0x27272a)
    });
    xRenderer.grid.template.setAll({
      stroke: am5.color(isDarkMode ? 0x3f3f46 : 0xe4e4e7),
      strokeOpacity: 0.3
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
      fontSize: 12,
      fill: am5.color(isDarkMode ? 0xa1a1aa : 0x52525b)
    });
    yRenderer.grid.template.setAll({
      stroke: am5.color(isDarkMode ? 0x3f3f46 : 0xe4e4e7),
      strokeOpacity: 0.3
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      })
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
      strokeOpacity: 0,
      tooltipText: "{categoryX}: {valueY}",
      width: am5.percent(60)
    });

    series.columns.template.states.create("hover", {
      fillOpacity: 0.9
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

  // Sorted Bar Chart - Busiest Hours
  useLayoutEffect(() => {
    if (sortedBarData.length === 0 || loading) return;

    const root = am5.Root.new(chart3Ref.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panY",
        wheelY: "zoomY",
        layout: root.verticalLayout,
        paddingLeft: 0
      })
    );

    // Add scrollbar
    chart.set("scrollbarY", am5.Scrollbar.new(root, {
      orientation: "vertical"
    }));

    // Create axes
    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      fontSize: 13,
      fontWeight: "500",
      fill: am5.color(isDarkMode ? 0xe4e4e7 : 0x27272a)
    });
    yRenderer.grid.template.setAll({
      stroke: am5.color(isDarkMode ? 0x3f3f46 : 0xe4e4e7),
      strokeOpacity: 0.3
    });

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "hour",
        renderer: yRenderer
      })
    );

    yAxis.data.setAll(sortedBarData);

    const xRenderer = am5xy.AxisRendererX.new(root, {});
    xRenderer.labels.template.setAll({
      fontSize: 12,
      fill: am5.color(isDarkMode ? 0xa1a1aa : 0x52525b)
    });
    xRenderer.grid.template.setAll({
      stroke: am5.color(isDarkMode ? 0x3f3f46 : 0xe4e4e7),
      strokeOpacity: 0.3
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
        min: 0
      })
    );

    // Create series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Scans",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "scans",
        categoryYField: "hour",
        sequencedInterpolation: true,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "{categoryY}: [bold]{valueX}[/] scans"
        })
      })
    );

    // Color bars based on value
    series.columns.template.setAll({
      cornerRadiusTR: 8,
      cornerRadiusBR: 8,
      strokeOpacity: 0,
      height: am5.percent(80)
    });

    series.columns.template.adapters.add("fill", (fill, target) => {
      const value = target.dataItem?.get("valueX");
      const max = Math.max(...sortedBarData.map(d => d.scans));
      
      if (!value || max === 0) return am5.color(0x6366f1);
      
      const ratio = value / max;
      
      if (ratio > 0.7) return am5.color(0xef4444); // Red - busiest
      if (ratio > 0.4) return am5.color(0xf59e0b); // Amber - moderate
      return am5.color(0x10b981); // Green - quiet
    });

    series.columns.template.states.create("hover", {
      fillOpacity: 0.8
    });

    series.data.setAll(sortedBarData);

    // Add value labels on bars
    series.bullets.push(function() {
      return am5.Bullet.new(root, {
        locationX: 1,
        sprite: am5.Label.new(root, {
          text: "{valueX}",
          fill: am5.color(0xffffff),
          centerY: am5.p50,
          centerX: am5.p100,
          paddingRight: 10,
          fontSize: 12,
          fontWeight: "600"
        })
      });
    });

    // Add cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomY"
    }));
    cursor.lineX.set("visible", false);

    // Animate
    series.appear(1000);
    chart.appear(1000, 100);

    return () => root.dispose();
  }, [sortedBarData, isDarkMode, loading]);

  return (
    <section className={`relative w-full min-h-screen py-20 ${
      isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-gray-900"
    }`}>
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Scan Statistics
        </h2>
        <p className={`text-lg ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
          Comprehensive analysis of all scan activity
        </p>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className={`rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-3xl font-bold text-blue-500">{totalScans}</div>
            <div className={`text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              Total Scans
            </div>
          </div>
          <div className={`rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-3xl font-bold text-green-500">
              {statusData.find((d) => d.name === "Harmless")?.value || 0}
            </div>
            <div className={`text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              Harmless
            </div>
          </div>
          <div className={`rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-3xl font-bold text-amber-500">
              {statusData.find((d) => d.name === "Suspicious")?.value || 0}
            </div>
            <div className={`text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              Suspicious
            </div>
          </div>
          <div className={`rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-900/50 border border-zinc-700" : "bg-white border border-gray-200 shadow-sm"
          }`}>
            <div className="text-3xl font-bold text-red-500">
              {statusData.find((d) => d.name === "Malicious")?.value || 0}
            </div>
            <div className={`text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              Malicious
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 grid gap-8 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className={`rounded-3xl p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/50 border border-zinc-700 shadow-xl" : "bg-white border border-gray-200 shadow-lg"
        }`}>
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
            Status Distribution
          </h3>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div ref={chart1Ref} style={{ width: "100%", height: "350px" }}></div>
          )}
        </div>

        {/* Bar Chart */}
        <div className={`rounded-3xl p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/50 border border-zinc-700 shadow-xl" : "bg-white border border-gray-200 shadow-lg"
        }`}>
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
            Scan Type Overview
          </h3>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div ref={chart2Ref} style={{ width: "100%", height: "350px" }}></div>
          )}
        </div>

        {/* Sorted Bar Chart */}
        <div className={`lg:col-span-2 rounded-3xl p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-900/50 border border-zinc-700 shadow-xl" : "bg-white border border-gray-200 shadow-lg"
        }`}>
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
            Busiest Hours Ranking
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
            Hours sorted by scan activity (highest to lowest)
          </p>
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : sortedBarData.length === 0 ? (
            <div className="h-[600px] flex items-center justify-center">
              <p className={isDarkMode ? "text-zinc-400" : "text-gray-600"}>No data available</p>
            </div>
          ) : (
            <div ref={chart3Ref} style={{ width: "100%", height: "600px" }}></div>
          )}
        </div>
      </div>
    </section>
  );
}