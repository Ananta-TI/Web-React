import { useEffect, useState, useContext, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import DecryptedText from "../components/Shared/DecryptedText";
import { motion } from "framer-motion";
import { 
  Shield, AlertTriangle, Zap, EyeOff, 
  BarChart3, Filter
} from "lucide-react";
import { 
  Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Line, Bar
} from 'recharts';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const COLORS = {
  Harmless: "#10b981",
  Suspicious: "#f59e0b",
  Malicious: "#ef4444",
  Undetected: "#ffffff",
  URL: "#3b82f6",
  FILE: "#8b5cf6"
};

// --- HELPER PENGAMAN ---
// Mencegah error "Received NaN" jika data belum siap
const safePercentage = (value, total, decimals = 0) => {
  if (!total || total === 0) return 0;
  const num = Number(value) || 0;
  const pct = (num / total) * 100;
  return isNaN(pct) ? 0 : (decimals === 0 ? Math.round(pct) : pct.toFixed(decimals));
};

export default function ScanStatsDashboard() {
  const { isDarkMode } = useContext(ThemeContext);
  const [activeTimeRange, setActiveTimeRange] = useState('all');
  const [data, setData] = useState({ stats: [], types: [], trend: [], total: 0 });
  
  // --- STATE PENGAMAN RENDER ---
  // Grafik tidak akan dirender sampai komponen benar-benar "nempel" di layar
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      let startDate = null;
      if (activeTimeRange !== 'all') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - (activeTimeRange === '7d' ? 7 : 30));
      }

      const url = `${SUPABASE_URL}/rest/v1/scan_history?select=type,stats,created_at`;
      const res = await fetch(startDate ? `${url}&created_at=gte.${startDate.toISOString()}` : url, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const rawData = await res.json();

      const counts = { Harmless: 0, Suspicious: 0, Malicious: 0, Undetected: 0 };
      const typeMap = { url: 0, file: 0 };
      const trendMap = {};

      rawData.forEach(item => {
        const s = item.stats || {};
        const status = s.malicious > 0 ? "Malicious" : s.suspicious > 0 ? "Suspicious" : s.harmless > 0 ? "Harmless" : "Undetected";
        
        counts[status]++;
        if (item.type) typeMap[item.type]++;

        const date = item.created_at?.split('T')[0];
        if (!trendMap[date]) trendMap[date] = { date, Harmless: 0, Suspicious: 0, Malicious: 0, Undetected: 0, total: 0 };
        trendMap[date][status]++;
        trendMap[date].total++;
      });

      setData({
        stats: Object.entries(counts).map(([name, value]) => ({ name, value })),
        types: Object.entries(typeMap).map(([name, value]) => ({ name: name.toUpperCase(), value })),
        trend: Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date)),
        total: rawData.length
      });
    } catch (e) {
      console.error(e);
    }
  }, [activeTimeRange]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const axisColor = isDarkMode ? '#71717a' : '#52525b';
  const gridColor = isDarkMode ? '#27272a' : '#e4e4e7';

  // JIKA BELUM MOUNTED, TAMPILKAN PLACEHOLDER KOSONG (SOLUSI ERROR WIDTH -1)
  if (!isMounted) return <div className="w-full min-h-screen" />;

  return (
    <section className={`w-full min-h-screen py-16 transition-colors duration-500 ${isDarkMode ? "text-zinc-100" : "text-zinc-900"}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-6xl font-bold font-lyrae">
              <DecryptedText text="Scan Statistics"
               speed={100}
               maxIterations={105}
               sequential
               animateOn="view" />
            </h2>
          </div>
          
          <div className={`flex cursor-target backdrop-blur-md p-1 rounded-xl border ${isDarkMode ? "bg-zinc-800/30 border-zinc-700/50" : "bg-white/50 border-zinc-200"}`}>
            {['all', '7d', '30d'].map(r => (
              <button 
                key={r} 
                onClick={() => setActiveTimeRange(r)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTimeRange === r 
                    ? "bg-indigo-600 text-white shadow-lg" 
                    : isDarkMode ? "text-zinc-500 hover:text-zinc-200" : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatNode className="cursor-target" isDarkMode={isDarkMode} icon={Shield} label="Harmless" value={data.stats.find(s => s.name === "Harmless")?.value} color={COLORS.Harmless} />
          <StatNode className="cursor-target" isDarkMode={isDarkMode} icon={AlertTriangle} label="Suspicious" value={data.stats.find(s => s.name === "Suspicious")?.value} color={COLORS.Suspicious} />
          <StatNode className="cursor-target" isDarkMode={isDarkMode} icon={Zap} label="Malicious" value={data.stats.find(s => s.name === "Malicious")?.value} color={COLORS.Malicious} />
          <StatNode className="cursor-target" isDarkMode={isDarkMode} icon={EyeOff} label="Undetected" value={data.stats.find(s => s.name === "Undetected")?.value} color={COLORS.Undetected} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Timeline Chart */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <ChartWrapper isDarkMode={isDarkMode} title="Neural Threat Detection Timeline" subtitle="Detection density over temporal distribution">
              <div className="h-[400px] w-full mt-4" style={{ minHeight: '400px' }}>
                {data.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.trend}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} tick={{fill: axisColor}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: axisColor}} />
                      <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                      <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px', color: axisColor}} />
                      <Area type="monotone" dataKey="total" fill="url(#areaGradient)" stroke="#10b981" strokeWidth={2} name="Global Volume" />
                      <Bar dataKey="Malicious" fill={COLORS.Malicious} barSize={8} radius={[4, 4, 0, 0]} name="Malicious" />
                      <Line type="stepAfter" dataKey="Suspicious" stroke={COLORS.Suspicious} strokeWidth={2} dot={false} name="Suspicious" />
                      <Line type="stepAfter" dataKey="Undetected" stroke={COLORS.Undetected} strokeWidth={2} dot={false} name="Undetected" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm animate-pulse">Initializing Neural Net...</div>
                )}
              </div>
            </ChartWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              {/* Origin Protocol */}
              <ChartWrapper className="cursor-target" isDarkMode={isDarkMode} title="Origin Protocol" subtitle="Vector analysis by source type">
                <div className="flex items-center justify-around h-[250px] ">
                  {data.types.map((type) => (
                    <div key={type.name} className="relative flex flex-col items-center">
                      <div className={`w-12 h-40 rounded-2xl relative overflow-hidden ${isDarkMode ? "bg-zinc-800/50" : "bg-zinc-200/50"}`}>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${safePercentage(type.value, data.total)}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="absolute bottom-0 w-full rounded-t-xl"
                          style={{ 
                            background: `linear-gradient(to top, ${type.name === 'URL' ? COLORS.URL : COLORS.FILE}, #a855f7)`,
                            boxShadow: `0 0 20px ${type.name === 'URL' ? COLORS.URL : COLORS.FILE}60`
                          }}
                        />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, #000 5px)' }} />
                      </div>
                      <span className={`mt-4 font-mono text-[10px] font-bold uppercase ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}>
                        {type.name}
                      </span>
                      <span className={`text-lg font-black ${isDarkMode ? "text-white" : "text-zinc-900"}`}>{type.value}</span>
                    </div>
                  ))}
                  <div className="hidden sm:block border-l border-zinc-700/30 pl-6 space-y-4 font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Uptime</span>
                      <span className="text-emerald-500 font-bold text-sm">99.9%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Rate</span>
                      <span className="text-amber-500 font-bold text-sm">1.2s/req</span>
                    </div>
                  </div>
                </div>
              </ChartWrapper>

              {/* Risk Distribution - DENGAN SAFE PERCENTAGE */}
              <ChartWrapper className="cursor-target" isDarkMode={isDarkMode} title="Risk Distribution" subtitle="Composition of scanned entities">
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={data.stats} 
                        innerRadius={70} 
                        outerRadius={90} 
                        paddingAngle={8} 
                        dataKey="value" 
                        stroke="none"
                      >
                        {data.stats.map((entry) => (
                          <Cell key={entry.name} fill={COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}>
                      HEALTH
                    </span>
                    <span className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                      {safePercentage(data.stats.find(s => s.name === "Harmless")?.value, data.total)}%
                    </span>
                  </div>
                </div>
              </ChartWrapper>
            </div>
          </div>

          {/* Sidebar Feed */}
          <div className="lg:col-span-4 space-y-6 ">
            <div className={`p-6 rounded-3xl border cursor-target transition-colors duration-500 ${isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl"}`}>
              <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? "text-zinc-100" : "text-zinc-800"}`}>
                <Filter size={18} className="text-indigo-500" />
                Entity Distribution
              </h3>
              <div className="space-y-4">
                {data.stats.map(s => (
                  <div key={s.name} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isDarkMode ? "bg-zinc-800/30 border-zinc-700/30" : "bg-zinc-50 border-zinc-200 shadow-sm"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[s.name] }} />
                      <span className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>{s.name}</span>
                    </div>
                    {/* DENGAN SAFE PERCENTAGE */}
                    <span className={`text-sm font-mono font-bold ${isDarkMode ? "text-zinc-200" : "text-zinc-900"}`}>
                      {safePercentage(s.value, data.total, 1)}%
                    </span>
                  </div>
                ))}
              </div>
              <div className={`mt-8 pt-6 border-t ${isDarkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="flex justify-between text-xs mb-2 font-mono">
                  <span className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>PROCESSING_LOAD</span>
                  <span className="text-indigo-500 font-bold">99.2%</span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? "bg-zinc-800" : "bg-zinc-200"}`}>
                  <div className="h-full bg-indigo-500 w-[99.2%]" />
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden group shadow-2xl cursor-target">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                  <BarChart3 size={120} />
               </div>
               <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Cumulative Analysis</h4>
               <p className="text-4xl font-black mb-4">{data.total.toLocaleString()}</p>
               <p className="text-xs opacity-70 leading-relaxed font-medium italic">Verified system entities processed across neural detection nodes within the temporal parameters.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatNode({ icon: Icon, label, value, color, isDarkMode, className = "" }) {
  return (
    <div className={`
      p-6 rounded-2xl border transition-all group 
      ${isDarkMode ? "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"}
      ${className}
    `}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${isDarkMode ? "bg-zinc-800" : "bg-zinc-100"}`} style={{ color }}>
          <Icon size={32} />
        </div>
        <div>
          <p className={`text-[10px] uppercase tracking-tighter font-bold ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}>{label}</p>
          <p className={`text-2xl font-mono font-black ${isDarkMode ? "text-zinc-100" : "text-zinc-900"}`}>{value || 0}</p>
        </div>
      </div>
    </div>
  );
}

function ChartWrapper({ title, subtitle, children, isDarkMode , className = ""}) {
  return (
    <div className={`p-8 rounded-3xl border backdrop-blur-sm relative transition-all duration-500 ${className} ${isDarkMode ? "bg-zinc-900/30 border-zinc-800/50" : "bg-white border-zinc-200 shadow-lg"}`}>
      <div className="mb-6">
        <h3 className={`text-lg font-bold tracking-tight ${isDarkMode ? "text-zinc-100" : "text-zinc-800"}`}>{title}</h3>
        <p className={`text-xs font-mono italic ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, isDarkMode }) {
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md ${isDarkMode ? "bg-zinc-950/90 border-zinc-700 text-zinc-100" : "bg-white/95 border-zinc-200 text-zinc-900"}`}>
        <p className={`text-xs font-bold mb-3 border-b pb-2 ${isDarkMode ? "border-zinc-800" : "border-zinc-100"}`}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-8 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: p.color || p.fill}} />
              <span className="text-[10px] uppercase font-bold opacity-70">{p.name}</span>
            </div>
            <span className="text-xs font-mono font-bold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}