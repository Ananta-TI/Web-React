import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { ThemeContext } from "../context/ThemeContext";
import DecryptedText from "../components/Shared/DecryptedText";
import { 
  TrendingUp, 
  Activity, 
  Shield, 
  AlertTriangle, 
  BarChart3,
  Zap,
  Layers,
  EyeOff
} from "lucide-react";
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ScanStatsDashboard() {
  const { isDarkMode } = useContext(ThemeContext);
  
  // State Data
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [statusTrendData, setStatusTrendData] = useState([]); // New state for status trend data
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTimeRange, setActiveTimeRange] = useState('all');
  const [chartError, setChartError] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [activeTimeRange]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setChartError(false);
    
    try {
      const now = new Date();
      let startDate = new Date();
      
      switch (activeTimeRange) {
        case 'all':
          startDate = null;
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        default:
          startDate = null;
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
      const counts = { Harmless: 0, Suspicious: 0, Malicious: 0, Undetected: 0 };
     data.forEach((row) => {
  // Ambil angka dari stats
  const m = row?.stats?.malicious || 0;
  const s = row?.stats?.suspicious || 0;
  const h = row?.stats?.harmless || 0;
  const u = row?.stats?.undetected || 0;

  let status;
  
  if (m > 0) {
    status = "Malicious";
  } else if (s > 0) {
    status = "Suspicious";
  } else if (h > 0) {
    // PRIORITASKAN HARMLESS DI SINI
    status = "Harmless";
  } else if (u > 0) {
    // Undetected hanya jika Harmless juga 0
    status = "Undetected";
  } else {
    status = "Harmless"; // Default tetap harmless jika semua nol
  }

  counts[status]++;
  // ... sisa logika timeline
});

      setStatusData([
        { name: "Harmless", value: counts.Harmless, itemStyle: { color: "#10b981" } },
        { name: "Suspicious", value: counts.Suspicious, itemStyle: { color: "#f59e0b" } },
        { name: "Malicious", value: counts.Malicious, itemStyle: { color: "#ef4444" } },
        { name: "Undetected", value: counts.Undetected, itemStyle: { color: "#6b7280" } },
      ]);

      // 2. OLAH DATA: Type Counts (Bar Chart)
      const t = { url: 0, file: 0 };
      data.forEach((row) => {
        if (row.type === "url") t.url++;
        else if (row.type === "file") t.file++;
      });

      setTypeData([
        { name: "URL", value: t.url, itemStyle: { color: "#3b82f6" } },
        { name: "File", value: t.file, itemStyle: { color: "#8b5cf6" } },
      ]);

      // 3. OLAH DATA: Trend Timeline for Type (Area Chart)
      const urlTimelineMap = {};
      const fileTimelineMap = {};
      
      data.forEach((item) => {
        const dateStr = item.created_at || item.timestamp || item.date;
        if (!dateStr) return;

        const dateObj = new Date(dateStr);
        dateObj.setHours(0, 0, 0, 0); 
        const timestamp = dateObj.getTime();

        if (item.type === "url") {
          urlTimelineMap[timestamp] = (urlTimelineMap[timestamp] || 0) + 1;
        } else if (item.type === "file") {
          fileTimelineMap[timestamp] = (fileTimelineMap[timestamp] || 0) + 1;
        }
      });

      const allDates = new Set([
        ...Object.keys(urlTimelineMap),
        ...Object.keys(fileTimelineMap)
      ]);

      const sortedTrend = Array.from(allDates)
        .map((dateStr) => ({
          date: new Date(parseInt(dateStr)).toLocaleDateString(),
          urlCount: urlTimelineMap[dateStr] || 0,
          fileCount: fileTimelineMap[dateStr] || 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setTrendData(sortedTrend);

      // 4. OLAH DATA: Status Trend Timeline (New Area Chart)
      const statusTimelineMap = {};
      
data.forEach((item) => {
        const dateStr = item.created_at || item.timestamp || item.date;
        if (!dateStr) return;

        const dateObj = new Date(dateStr);
        dateObj.setHours(0, 0, 0, 0); 
        const timestamp = dateObj.getTime();

        if (!statusTimelineMap[timestamp]) {
          statusTimelineMap[timestamp] = { Harmless: 0, Suspicious: 0, Malicious: 0, Undetected: 0 };
        }

        // --- LOGIKA PERBAIKAN ---
        let status;
        const stats = item?.stats;

        if (stats?.malicious > 0) {
          status = "Malicious";
        } else if (stats?.suspicious > 0) {
          status = "Suspicious";
        } else if (stats?.harmless > 0) {
          // Jika ada antivirus yang bilang aman, masuk Harmless
          status = "Harmless";
        } else if (stats?.undetected > 0) {
          // Jika tidak ada yang bilang aman/bahaya, baru masuk Undetected
          status = "Undetected";
        } else {
          status = "Harmless"; // Default fallback
        }
        
        statusTimelineMap[timestamp][status]++;
      });

      const allStatusDates = Object.keys(statusTimelineMap);
      
      const sortedStatusTrend = allStatusDates
        .map((dateStr) => ({
          date: new Date(parseInt(dateStr)).toLocaleDateString(),
          harmlessCount: statusTimelineMap[dateStr].Harmless || 0,
          suspiciousCount: statusTimelineMap[dateStr].Suspicious || 0,
          maliciousCount: statusTimelineMap[dateStr].Malicious || 0,
          undetectedCount: statusTimelineMap[dateStr].Undetected || 0,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setStatusTrendData(sortedStatusTrend);
      setTotalScans(data.length);

    } catch (error) {
      console.error("Error fetching stats:", error);
      setChartError(true);
    } finally {
      setLoading(false);
    }
  }, [activeTimeRange]);

  // --- ECHARTS OPTIONS ---
   const pieChartOption = useMemo(() => {
    const total = statusData.reduce((sum, item) => sum + item.value, 0);
    
    return {
      backgroundColor: 'transparent',
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        textStyle: { color: isDarkMode ? '#e4e4e7' : '#374151' },
        itemGap: 20,
        icon: 'circle'
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: {
            text: total.toString(),
            fontSize: 36,
            fontWeight: 'bold',
            fill: isDarkMode ? '#e4e4e7' : '#111827',
            textAlign: 'center'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '52%',
          style: {
            text: 'Total Scans',
            fontSize: 14,
            fill: isDarkMode ? '#9ca3af' : '#6b7280',
            textAlign: 'center'
          }
        }
      ],
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['50%', '45%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 8,
            borderColor: isDarkMode ? '#1f2937' : '#fff',
            borderWidth: 2,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 5
          },
          label: { 
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            fontSize: 12,
            color: isDarkMode ? '#e4e4e7' : '#111827'
          },
          labelLine: {
            length: 15,
            length2: 10,
            maxSurfaceAngle: 80
          },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' },
            itemStyle: { 
              shadowBlur: 20, 
              shadowOffsetX: 0, 
              shadowColor: 'rgba(0, 0, 0, 0.5)',
              borderWidth: 3
            }
          },
          animationType: 'expansion',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return Math.random() * 200;
          },
          data: statusData,
        }
      ]
    };
  }, [statusData, isDarkMode]);

  const barChartOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDarkMode ? '#374151' : '#ffffff',
      borderColor: 'transparent',
      textStyle: { color: isDarkMode ? '#e4e4e7' : '#111827' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: typeData.map(d => d.name),
      axisLine: { lineStyle: { color: isDarkMode ? '#4b5563' : '#d1d5db' } },
      axisTick: { show: false },
      axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: isDarkMode ? '#374151' : '#e5e7eb' } },
      axisLabel: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
    },
    series: [
      {
        type: 'bar',
        data: typeData,
        itemStyle: {
          borderRadius: [8, 8, 0, 0]
        }
      }
    ]
  }), [typeData, isDarkMode]);

  // Updated area chart to show status trends over time
  const areaChartOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        borderColor: 'transparent',
        textStyle: { color: isDarkMode ? '#e4e4e7' : '#111827' },
        extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-radius: 8px;',
        formatter: function(params) {
          let result = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].axisValue}</div>`;
          params.forEach(param => {
            result += `<div style="display:flex;align-items:center;">
              <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>
              ${param.seriesName}: ${param.value}
            </div>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Harmless', 'Suspicious', 'Malicious', 'Undetected'],
        textStyle: { color: isDarkMode ? '#e4e4e7' : '#374151' },
        bottom: '0%',
        itemGap: 20
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomLock: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          preventDefaultMouseMove: true,
          filterMode: 'filter',
          throttle: 50,
          rangeMode: ['percent', 'percent']
        },
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: statusTrendData.map(d => d.date),
        axisLine: { lineStyle: { color: isDarkMode ? '#4b5563' : '#d1d5db' } },
        axisTick: { show: false },
        axisLabel: { 
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: 10,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { 
          lineStyle: { 
            color: isDarkMode ? '#374151' : '#e5e7eb',
            type: 'dashed'
          } 
        },
        axisLabel: { 
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Harmless',
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          sampling: 'lttb',
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(16, 185, 129, 0.5)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          itemStyle: {
            color: '#10b981',
            borderColor: isDarkMode ? '#1f2937' : '#fff',
            borderWidth: 2
          },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]),
            shadowColor: 'rgba(16, 185, 129, 0.2)',
            shadowBlur: 20
          },
          emphasis: {
            itemStyle: {
              color: '#10b981',
              borderColor: isDarkMode ? '#1f2937' : '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(16, 185, 129, 0.8)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 0.7)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
              ])
            }
          },
          data: statusTrendData.map(d => d.harmlessCount),
          animationDuration: 2000,
          animationEasing: 'cubicOut',
          progressive: 1000,
          progressiveThreshold: 3000
        },
        {
          name: 'Suspicious',
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          sampling: 'lttb',
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(245, 158, 11, 0.5)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          itemStyle: {
            color: '#f59e0b',
            borderColor: isDarkMode ? '#1f2937' : '#fff',
            borderWidth: 2
          },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.5)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
            ]),
            shadowColor: 'rgba(245, 158, 11, 0.2)',
            shadowBlur: 20
          },
          emphasis: {
            itemStyle: {
              color: '#f59e0b',
              borderColor: isDarkMode ? '#1f2937' : '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(245, 158, 11, 0.8)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 158, 11, 0.7)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.1)' }
              ])
            }
          },
          data: statusTrendData.map(d => d.suspiciousCount),
          animationDuration: 2000,
          animationEasing: 'cubicOut',
          animationDelay: 300,
          progressive: 1000,
          progressiveThreshold: 3000
        },
        {
          name: 'Malicious',
          type: 'line',
          smooth: true,
          smoothMonotone: 'x',
          sampling: 'lttb',
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(239, 68, 68, 0.5)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          itemStyle: {
            color: '#ef4444',
            borderColor: isDarkMode ? '#1f2937' : '#fff',
            borderWidth: 2
          },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239, 68, 68, 0.5)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
            ]),
            shadowColor: 'rgba(239, 68, 68, 0.2)',
            shadowBlur: 20
          },
          emphasis: {
            itemStyle: {
              color: '#ef4444',
              borderColor: isDarkMode ? '#1f2937' : '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(239, 68, 68, 0.8)'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(239, 68, 68, 0.7)' },
                { offset: 1, color: 'rgba(239, 68, 68, 0.1)' }
              ])
            }
          },
          data: statusTrendData.map(d => d.maliciousCount),
          animationDuration: 2000,
          animationEasing: 'cubicOut',
          animationDelay: 600,
          progressive: 1000,
          progressiveThreshold: 3000
        },
    {
  name: 'Undetected',
  type: 'line',
  smooth: true,
  smoothMonotone: 'x',
  sampling: 'lttb',
  symbol: 'circle',
  symbolSize: 8,
  lineStyle: {
    width: 3,
    // Efek Silver Glow
    shadowColor: isDarkMode ? 'rgba(161, 161, 170, 0.4)' : 'rgba(113, 113, 122, 0.3)', 
    shadowBlur: 10,
    shadowOffsetY: 5,
    color: isDarkMode ? '#d4d4d8' : '#71717a' // Zinc 300 (Dark) atau Zinc 600 (Light)
  },
  itemStyle: {
    color: isDarkMode ? '#f4f4f5' : '#52525b', // Zinc 100 atau Zinc 700
    borderColor: isDarkMode ? '#18181b' : '#fff',
    borderWidth: 2
  },
  areaStyle: { 
    // Gradien dari Abu-abu Terang ke Transparan
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { 
        offset: 0, 
        color: isDarkMode ? 'rgba(161, 161, 170, 0.3)' : 'rgba(113, 113, 122, 0.2)' 
      },
      { 
        offset: 1, 
        color: 'transparent' 
      }
    ]),
    shadowColor: 'rgba(161, 161, 170, 0.1)',
    shadowBlur: 20
  },
  emphasis: {
    itemStyle: {
      color: '#fff',
      borderColor: '#a1a1aa',
      borderWidth: 3,
      shadowBlur: 15,
      shadowColor: 'rgba(255, 255, 255, 0.5)'
    },
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(161, 161, 170, 0.5)' },
        { offset: 1, color: 'rgba(161, 161, 170, 0.1)' }
      ])
    }
  },
  data: statusTrendData.map(d => d.undetectedCount),
  animationDuration: 2000,
  animationEasing: 'cubicOut',
  animationDelay: 600,
  progressive: 1000,
  progressiveThreshold: 3000
}
        

      ]
    };
  }, [statusTrendData, isDarkMode]);

  return (
    <section className={`relative w-full min-h-screen py-12 sm:py-20 overflow-hidden ${
      isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-gray-900"
    }`}>
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

        {/* Stats Cards */}
        <div className="mt-8 grid font-mono font-bold grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"> 
          {/* <StatCard icon={Activity} label="Total Scans" value={totalScans} color="blue" isDarkMode={isDarkMode} /> */}
          <StatCard icon={Shield} label="Harmless" value={statusData.find((d) => d.name === "Harmless")?.value || 0} color="green" isDarkMode={isDarkMode} />
          <StatCard icon={AlertTriangle} label="Suspicious" value={statusData.find((d) => d.name === "Suspicious")?.value || 0} color="amber" isDarkMode={isDarkMode} />
          <StatCard icon={Zap} label="Malicious" value={statusData.find((d) => d.name === "Malicious")?.value || 0} color="red" isDarkMode={isDarkMode} />
          <StatCard icon={EyeOff} label="Undetected" value={statusData.find((d) => d.name === "Undetected")?.value || 0} color="silver" isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Chart containers */}
      <div className="container mx-auto px-4 sm:px-6 grid gap-6 lg:grid-cols-2 relative z-10"> 
        {/* Pie Chart (Status) */}
        <ChartContainer
          title="Status Distribution"
          icon={BarChart3}
          iconColor="blue-purple"
          loading={loading}
          error={chartError}
          onRetry={fetchStats}
          isDarkMode={isDarkMode}
        >
          <ReactECharts 
            option={pieChartOption} 
            style={{ height: '350px' }}
            loading={loading}
            notMerge={true}
          />
        </ChartContainer>

        {/* Bar Chart (Type) */}
        <ChartContainer
          title="Scan Type Overview"
          icon={Layers}
          iconColor="purple-pink"
          loading={loading}
          error={chartError}
          onRetry={fetchStats}
          isDarkMode={isDarkMode}
        >
          <ReactECharts 
            option={barChartOption} 
            style={{ height: '350px' }}
            loading={loading}
            notMerge={true}
          />
        </ChartContainer>

        {/* Status Trend Chart */}
        <div className={`lg:col-span-2 group relative overflow-hidden rounded-xl sm:rounded-3xl p-6 sm:p-8 transform hover:shadow-2xl transition-all duration-300 ${
          isDarkMode ? "bg-zinc-800/50 border border-zinc-700 shadow-xl" : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0 shadow-lg backdrop-blur-sm"
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-tr-full"></div>
          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-semibold font-lyrae mb-2 flex items-center gap-2">
              <IconWrapper color="indigo-purple">
                <TrendingUp className="w-4 h-4" />
              </IconWrapper>
              Status Trend Timeline
            </h3>
            <p className={`text-xs sm:text-sm font-mono mb-4 sm:mb-6 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              {activeTimeRange === 'all' ? 'Complete status trend timeline separated by scan result' : 'Recent status trend timeline separated by scan result'}
            </p>
            
            {loading ? <ChartSkeleton isDarkMode={isDarkMode} /> : chartError ? <ErrorDisplay onRetry={fetchStats} isDarkMode={isDarkMode} /> : statusTrendData.length === 0 ? <NoDataDisplay isDarkMode={isDarkMode} /> : 
              <ReactECharts 
                option={areaChartOption} 
                style={{ height: '450px' }}
                loading={loading}
                notMerge={true}
                onEvents={{
                  dataZoom: (params) => {
                    console.log('Zoom event:', params);
                  }
                }}
              />
            }
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Helper Components (tidak berubah) ---
const StatCard = ({ icon: Icon, label, value, color, isDarkMode }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    silver: "from-gray-400 to-gray-500"
  };
  
  return (
    <div className={`group cursor-target relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 ${
      isDarkMode ? "bg-zinc-800/50 border border-zinc-700" : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0 shadow-lg backdrop-blur-sm"
    }`}>
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colorClasses[color]}/20 to-transparent rounded-bl-full`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>{value}</div>
        <div className={`text-xs sm:text-sm mt-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>{label}</div>
      </div>
    </div>
  );
};

const IconWrapper = ({ children, color }) => {
  const colorClasses = {
    "blue-purple": "from-blue-500 to-purple-600",
    "purple-pink": "from-purple-500 to-pink-600",
    "indigo-purple": "from-indigo-500 to-purple-600",
    "silver": "from-gray-400 to-gray-500"
  };
  
  return (
    <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
      {children}
    </div>
  );
};

const ChartContainer = ({ title, icon: Icon, iconColor, loading, error, onRetry, children, isDarkMode }) => (
  <div className={`group relative overflow-hidden rounded-xl sm:rounded-3xl p-6 sm:p-8 transform hover:shadow-2xl transition-all duration-300 ${
    isDarkMode ? "bg-zinc-800/50 border border-zinc-700 shadow-xl" : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0 shadow-lg backdrop-blur-sm"
  }`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full"></div>
    <div className="relative z-10">
      <h3 className="text-xl sm:text-2xl font-semibold font-lyrae mb-4 sm:mb-6 flex items-center gap-2">
        <IconWrapper color={iconColor}>
          <Icon className="w-4 h-4" />
        </IconWrapper>
        {title}
      </h3>
      {loading ? <ChartSkeleton isDarkMode={isDarkMode} /> : error ? <ErrorDisplay onRetry={onRetry} isDarkMode={isDarkMode} /> : children}
    </div>
  </div>
);

const ChartSkeleton = ({ isDarkMode }) => (
  <div className={`animate-pulse rounded-xl h-96 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}></div>
);

const ErrorDisplay = ({ onRetry, isDarkMode }) => (
  <div className="h-[350px] flex flex-col items-center justify-center">
    <div className="text-red-500 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Failed to load chart data</p>
    <button onClick={onRetry} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Retry</button>
  </div>
);

const NoDataDisplay = ({ isDarkMode }) => (
  <div className="h-[350px] sm:h-[450px] flex items-center justify-center">
     <p className={isDarkMode ? "text-zinc-400" : "text-gray-600"}>No activity recorded yet</p>
  </div>
);