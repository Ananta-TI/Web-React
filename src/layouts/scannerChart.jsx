import { useEffect, useState, useLayoutEffect, useRef, useContext } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ThemeContext } from "../context/ThemeContext";
import DecryptedText from "../components/Shared/DecryptedText";
import { 
  TrendingUp, 
  Activity, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Globe, 
  BarChart3,
  Zap,
  Sparkles,
  Layers
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ScanStatsDashboard() {
  const { isDarkMode } = useContext(ThemeContext);
  
  // State Data
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTimeRange, setActiveTimeRange] = useState('all'); // Changed from '24h' to 'all'
  const [chartError, setChartError] = useState(false);

  // Refs for Chart Containers
  const chart1Ref = useRef(null); // Pie
  const chart2Ref = useRef(null); // Bar Type
  const chart3Ref = useRef(null); // Area Pulse (Trend)

  useEffect(() => {
    fetchStats();
  }, [activeTimeRange]);

  async function fetchStats() {
    setLoading(true);
    setChartError(false);
    
    try {
      // Calculate date range based on activeTimeRange
      const now = new Date();
      let startDate = new Date();
      
      switch (activeTimeRange) {
        case 'all':
          // Don't set any date filter - get all data
          startDate = null;
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate = null; // Default to all data
      }
      
      let url = `${SUPABASE_URL}/rest/v1/scan_history?select=*`;
      if (startDate) {
        const startDateStr = startDate.toISOString();
        url += `&created_at=gte.${startDateStr}`;
      }
      
      const response = await fetch(url, {
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

      // 3. OLAH DATA: Trend Timeline (Area Chart)
      const timelineMap = {};
      data.forEach((item) => {
        const dateStr = item.created_at || item.timestamp || item.date;
        if (!dateStr) return;

        const dateObj = new Date(dateStr);
        // Group by day instead of hour for better visualization with all data
        dateObj.setHours(0, 0, 0, 0); 
        const timestamp = dateObj.getTime();

        timelineMap[timestamp] = (timelineMap[timestamp] || 0) + 1;
      });

      // Convert to array and sort by time
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
      setChartError(true);
    } finally {
      setLoading(false);
    }
  }

  // --- CHART 1: PIE CHART (Status) ---
  useLayoutEffect(() => {
    if (statusData.length === 0 || loading || chartError) return;

    let root = null;
    try {
      root = am5.Root.new(chart1Ref.current);
      if (!root) {
        console.error("Failed to create am5 root");
        return;
      }
      
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          layout: root.verticalLayout,
          innerRadius: am5.percent(50),
          radius: am5.percent(90)
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
        tooltipText: "{category}: {value}",
        shadowColor: am5.color(0x000000),
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowOpacity: 0.2
      });

      series.data.setAll(statusData);
      statusData.forEach((item, index) => {
        series.slices.getIndex(index).set("fill", am5.color(item.color));
      });

      // Add legend with enhanced styling
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          marginTop: 15
        })
      );
      
      legend.labels.template.setAll({ 
        fill: am5.color(isDarkMode ? 0xe4e4e7 : 0x27272a),
        fontSize: 12
      });
      
      legend.markers.template.setAll({
        width: 12,
        height: 12,
        cornerRadius: 3
      });
      
      legend.data.setAll(series.dataItems);

      series.appear(1000, 100);
      
      return () => {
        if (root) root.dispose();
      };
    } catch (error) {
      console.error("Error creating pie chart:", error);
      setChartError(true);
      if (root) root.dispose();
    }
  }, [statusData, isDarkMode, loading, chartError]);

  // --- CHART 2: BAR CHART (Type) ---
  useLayoutEffect(() => {
    if (typeData.length === 0 || loading || chartError) return;

    let root = null;
    try {
      root = am5.Root.new(chart2Ref.current);
      if (!root) {
        console.error("Failed to create am5 root");
        return;
      }
      
      root.setThemes([am5themes_Animated.new(root)]);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          layout: root.verticalLayout
        })
      );

      // Add background gradient
      chart.plotContainer.get("background").setAll({
        fillGradient: am5.LinearGradient.new(root, {
          stops: [
            { color: am5.color(isDarkMode ? 0x1e293b : 0xf8fafc), opacity: 0.2 },
            { color: am5.color(isDarkMode ? 0x334155 : 0xf1f5f9), opacity: 0.2 }
          ],
          rotation: 90
        }),
        fillOpacity: 0.5
      });

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
        width: am5.percent(60),
        shadowColor: am5.color(0x000000),
        shadowBlur: 5,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        shadowOpacity: 0.2
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
      
      return () => {
        if (root) root.dispose();
      };
    } catch (error) {
      console.error("Error creating bar chart:", error);
      setChartError(true);
      if (root) root.dispose();
    }
  }, [typeData, isDarkMode, loading, chartError]);

  // --- CHART 3: AREA PULSE CHART (Trend/Timeline) ---
  useLayoutEffect(() => {
    if (loading || chartError) return;
    
    let root = null;
    try {
      root = am5.Root.new(chart3Ref.current);
      if (!root) {
        console.error("Failed to create am5 root");
        return;
      }
      
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

      // Add background gradient
      chart.plotContainer.get("background").setAll({
        fillGradient: am5.LinearGradient.new(root, {
          stops: [
            { color: am5.color(isDarkMode ? 0x1e293b : 0xf8fafc), opacity: 0.2 },
            { color: am5.color(isDarkMode ? 0x334155 : 0xf1f5f9), opacity: 0.2 }
          ],
          rotation: 90
        }),
        fillOpacity: 0.5
      });

      // Cursor
      const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
        behavior: "none"
      }));
      cursor.lineY.set("visible", false);

      // Axis X (Time) - Adjust base interval based on data range
      const baseInterval = activeTimeRange === 'all' 
        ? { timeUnit: "day", count: 1 } 
        : { timeUnit: "hour", count: 1 };

      const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.2,
          baseInterval: baseInterval,
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

      // Axis Y (Count)
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {})
        })
      );

      yAxis.get("renderer").labels.template.setAll({
        fill: am5.color(isDarkMode ? 0xa1a1aa : 0x52525b),
        fontSize: 12,
      });

      // Series with enhanced gradient
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

      // Enhanced styling with neon effect
      series.strokes.template.setAll({
        strokeWidth: 3,
        stroke: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6),
        shadowColor: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6),
        shadowBlur: 10,
        shadowOpacity: 0.5,
      });

      series.fills.template.setAll({
        fillOpacity: 1,
        visible: true,
        fillGradient: am5.RadialGradient.new(root, {
          stops: [
            { color: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6), opacity: 0.6 },
            { color: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6), opacity: 0.1 },
          ],
          rotation: 90,
        }),
      });

      // Add bullet points
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: am5.color(isDarkMode ? 0x6366f1 : 0x3b82f6),
            stroke: am5.color(isDarkMode ? 0x1e293b : 0xf8fafc),
            strokeWidth: 2
          })
        });
      });

      series.data.setAll(trendData);

      series.appear(1000);
      chart.appear(1000, 100);
      
      return () => {
        if (root) root.dispose();
      };
    } catch (error) {
      console.error("Error creating area chart:", error);
      setChartError(true);
      if (root) root.dispose();
    }
  }, [trendData, isDarkMode, loading, chartError, activeTimeRange]);

  return (
    <section className={`relative w-full min-h-screen py-12 sm:py-20 overflow-hidden ${
      isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-gray-900"
    }`}>
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? "bg-purple-600" : "bg-blue-400"
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? "bg-blue-600" : "bg-purple-400"
        }`}></div>
      </div> */}

      <div className="container mx-auto px-4 cursor-none sm:px-6 text-center mb-8 sm:mb-12 relative z-10"> 
        <h2 className={`text-4xl sm:text-5xl font-bold font-lyrae mb-2 sm:mb-4  ${
          isDarkMode 
            ? "text-white" 
            : "text-black"
        } bg-clip-text`}> 
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

        {/* Time range selector */}
        <div className="flex justify-center cursor-none mt-6 mb-8">
          <div className={`inline-flex cursor-target cursor-none rounded-lg p-1 ${
            isDarkMode ? "bg-zinc-800" : "bg-white shadow-md"
          }`}>
            {['all', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTimeRange === range
                    ? isDarkMode 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : isDarkMode
                      ? "text-zinc-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range === 'all' ? 'All Days' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards with enhanced design */}
        <div className="mt-8 grid font-mono font-bold grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"> 
          {/* Card Total */}
          <div className={`group relative cursor-target overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
          }`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <Activity className="w-4 h-4" />
                </div>
                {/* <span className="text-xs font-medium text-blue-500">+12%</span> */}
              </div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">{totalScans}</div>
              <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Total Scans</div>
            </div>
          </div>
          
          {/* Card Harmless */}
          <div className={`group cursor-target relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
          }`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <Shield className="w-4 h-4" />
                </div>
                {/* <span className="text-xs font-medium text-green-500">+8%</span> */}
              </div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {statusData.find((d) => d.name === "Harmless")?.value || 0}
              </div>
              <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Harmless</div>
            </div>
          </div>
          
          {/* Card Suspicious */}
          <div className={`group cursor-target relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
          }`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                {/* <span className="text-xs font-medium text-amber-500">+5%</span> */}
              </div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {statusData.find((d) => d.name === "Suspicious")?.value || 0}
              </div>
              <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Suspicious</div>
            </div>
          </div>
          
          {/* Card Malicious */}
          <div className={`group cursor-target relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
            isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
          }`}>
            <div className="absolute  top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <Zap className="w-4 h-4" />
                </div>
                {/* <span className="text-xs font-medium text-red-500">+2%</span> */}
              </div>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                {statusData.find((d) => d.name === "Malicious")?.value || 0}
              </div>
              <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Malicious</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart containers with enhanced design */}
      <div className="container mx-auto px-4 sm:px-6 grid gap-6 lg:grid-cols-2 relative z-10"> 
        {/* Pie Chart (Status) */}
        <div className={`group relative overflow-hidden rounded-xl sm:rounded-3xl p-6 sm:p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-800/50 border border-zinc-700 shadow-xl" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-semibold font-lyrae mb-4 sm:mb-6 flex items-center gap-2"> 
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <BarChart3 className="w-4 h-4" />
              </div>
              Status Distribution
            </h3>
            {loading ? (
              <div className="h-[300px] sm:h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : chartError ? (
              <div className="h-[300px] sm:h-[350px] flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Failed to load chart data</p>
                <button 
                  onClick={fetchStats}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div ref={chart1Ref} style={{ width: "100%", height: "350px" }}></div>
            )}
          </div>
        </div>

        {/* Bar Chart (Type) */}
        <div className={`group relative overflow-hidden rounded-xl sm:rounded-3xl p-6 sm:p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-800/50 border border-zinc-700 shadow-xl" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-semibold font-lyrae mb-4 sm:mb-6 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Layers className="w-4 h-4" />
              </div>
              Scan Type Overview
            </h3>
            {loading ? (
              <div className="h-[300px] sm:h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : chartError ? (
              <div className="h-[300px] sm:h-[350px] flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Failed to load chart data</p>
                <button 
                  onClick={fetchStats}
                  className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div ref={chart2Ref} style={{ width: "100%", height: "350px" }}></div>
            )}
          </div>
        </div>

        {/* Activity Pulse Chart */}
        <div className={`lg:col-span-2 group relative overflow-hidden rounded-xl sm:rounded-3xl p-6 sm:p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-800/50 border border-zinc-700 shadow-xl" : "bg-white/80 border border-gray-200 shadow-lg backdrop-blur-sm"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-tr-full"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-semibold font-lyrae mb-2 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              Activity Pulse
            </h3>
            <p className={`text-xs sm:text-sm font-mono mb-4 sm:mb-6 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              {activeTimeRange === 'all' ? 'Complete scan frequency timeline' : 'Real-time scan frequency timeline'}
            </p>
            
            {loading ? (
              <div className="h-[350px] sm:h-[450px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-500"></div>
              </div>
            ) : chartError ? (
              <div className="h-[350px] sm:h-[450px] flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Failed to load chart data</p>
                <button 
                  onClick={fetchStats}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Retry
                </button>
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
      </div>
    </section>
  );
}