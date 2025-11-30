import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import {
  Search, FolderOpen, ShieldCheck, AlertTriangle, Skull, Loader2,
  BarChart2, ListFilter, Calendar, FileUp, Globe, Database, X,
  FileText, Hash, Clock, Fingerprint, Cpu, Layers, Copy, Check, 
  History, Trash2, ChevronRight // Icon baru
} from "lucide-react";
import { PieChart } from '@mui/x-charts/PieChart';

// -------------------------
// Helper: Copyable Text
// -------------------------
const CopyableText = ({ text, label, isCode = false }) => {
  const [copied, setCopied] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${
        isDarkMode ? "bg-zinc-900/50 border-zinc-700 hover:border-blue-500/50" : "bg-gray-50 border-gray-200 hover:border-blue-300"
    }`}>
      <div className="flex flex-col min-w-0 flex-1 mr-2">
        <span className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>
            {label}
        </span>
        <span className={`text-xs sm:text-sm truncate font-medium ${isCode ? "font-mono" : ""} ${isDarkMode ? "text-zinc-200" : "text-gray-800"}`}>
            {text || "-"}
        </span>
      </div>
      <button onClick={handleCopy} className={`p-1.5 rounded-md transition-colors ${
          copied ? "text-green-500 bg-green-500/10" : isDarkMode ? "text-zinc-500 hover:text-white hover:bg-zinc-700" : "text-gray-400 hover:text-black hover:bg-gray-200"
      }`}>
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

// -------------------------
// Helper: Section Card
// -------------------------
const SectionCard = ({ title, icon: Icon, children, isDarkMode }) => (
  <div className={`mb-6 rounded-xl border overflow-hidden ${isDarkMode ? "bg-zinc-800/40 border-zinc-700" : "bg-white border-gray-200"}`}>
    <div className={`px-4 py-3 border-b flex items-center gap-2 font-semibold text-sm ${
        isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-gray-50 border-gray-200 text-gray-700"
    }`}>
      {Icon && <Icon className="w-4 h-4 text-blue-500" />} {title}
    </div>
    <div className="p-4 grid grid-cols-1 gap-3">
        {children}
    </div>
  </div>
);

// -------------------------
// Main Component
// -------------------------
export default function WebsiteSecurityScanner() {
  const { isDarkMode } = useContext(ThemeContext);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // UI state
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState("scan");
  
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState(null);
  
  const [result, setResult] = useState(null);     
  const [metadata, setMetadata] = useState(null); 
  
  const [activeTab, setActiveTab] = useState("detection"); 
  const [showAllVendors, setShowAllVendors] = useState(false);
  
  // HISTORY STATE
  const [history, setHistory] = useState([]);
  const [showHistoryTab, setShowHistoryTab] = useState(false); // Toggle tampilan tab history

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ||

(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"

? "http://localhost:5000"
: "https://ananta-ti.vercel.app");
  // --- HISTORY LOGIC ---
  
  // Load History saat pertama kali buka
  useEffect(() => {
    const saved = localStorage.getItem("scanHistory");
    if (saved) {
        setHistory(JSON.parse(saved));
    }
  }, []);

  // Fungsi Simpan ke History
  const saveToHistory = (resData, metaData, inputName, type) => {
    const newItem = {
        id: resData.data.id,
        timestamp: Date.now(),
        name: inputName, // URL atau Nama File
        type: type,
        stats: resData.data.attributes.stats, // { malicious: 2, harmless: 50... }
        result: resData,    // Simpan full result biar bisa direstore
        metadata: metaData  // Simpan full metadata
    };

    // Tambah ke paling atas, batasi max 20 item
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem("scanHistory", JSON.stringify(newHistory));
  };

  // Fungsi Restore History
  const restoreHistory = (item) => {
      setResult(item.result);
      setMetadata(item.metadata);
      setActiveTab("detection");
      setShowHistoryTab(false); // Kembali ke view result
      window.scrollTo({ top: 300, behavior: "smooth" }); // Scroll ke result
  };

  const clearHistory = () => {
      setHistory([]);
      localStorage.removeItem("scanHistory");
  };

  // --- API HANDLERS ---

  async function fetchMetadata(type, id) {
    try {
        let endpointType = 'files';
        if (type === 'url') endpointType = 'urls';
        else if (type === 'domain') endpointType = 'domains';
        else if (type === 'ip-address') endpointType = 'ip_addresses';

        const res = await fetch(`${BACKEND_URL}/api/vt/metadata/${endpointType}/${id}`);
        const data = await res.json();
        if(res.ok) return data.data;
        return null;
    } catch (err) {
        console.error("Gagal ambil metadata:", err);
        return null;
    }
  }

  async function pollResult(id, type, inputName) {
    const maxRetries = 40; const delayMs = 3000;
    for (let i = 0; i < maxRetries; i++) {
      setStatus(`Menganalisis... (${i + 1}/${maxRetries})`);
      try {
        const res = await fetch(`${BACKEND_URL}/api/vt/result/${id}`);
        const data = await res.json();
        
        if (data?.data?.attributes?.status === "completed") {
            setResult(data);
            setStatus("Mengambil detail...");
            
            let targetId = null;
            if (type === 'file') targetId = data.meta?.file_info?.sha256;
            else if (type === 'url') targetId = data.meta?.url_info?.id;

            let meta = null;
            if (targetId) {
                meta = await fetchMetadata(type, targetId);
                setMetadata(meta);
            }
            
            // SIMPAN KE HISTORY
            saveToHistory(data, meta, inputName, type);
            
            setStatus("Selesai!");
            setLoading(false);
            return;
        }
      } catch (err) { console.error(err); }
      await new Promise(r => setTimeout(r, delayMs));
    }
    setLoading(false); setStatus("⏱ Timeout.");
  }

  async function handleScanUrl() {
    if (!input) return;
    setLoading(true); setStatus("Mengirim URL..."); setResult(null); setMetadata(null); setShowHistoryTab(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/vt/scan`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAnalysisId(data.data.id);
      await pollResult(data.data.id, 'url', input);
    } catch (err) { setStatus(`❌ Error: ${err.message}`); setLoading(false); }
  }

  async function handleScanFile() {
    if (!selectedFile) return;
    setLoading(true); setStatus("Mengupload File..."); setResult(null); setMetadata(null); setShowHistoryTab(false);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${BACKEND_URL}/api/vt/scan-file`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAnalysisId(data.data.id);
      await pollResult(data.data.id, 'file', selectedFile.name);
    } catch (err) { setStatus(`❌ Error: ${err.message}`); setLoading(false); }
  }

  async function handleSearch() {
    if (!input) return;
    setLoading(true); setStatus("Searching DB..."); setResult(null); setMetadata(null); setShowHistoryTab(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/vt/search?query=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (!res.ok || !data.data || data.data.length === 0) throw new Error("Data tidak ditemukan.");
      
      const item = data.data[0];
      const simulatedResult = {
        data: {
            id: item.id, type: item.type,
            attributes: {
                url: input, content: { title: item.attributes.meaningful_name || item.type },
                date: item.attributes.last_analysis_date,
                stats: item.attributes.last_analysis_stats,
                results: item.attributes.last_analysis_results,
                status: "completed"
            }
        }
      };
      setResult(simulatedResult);
      setMetadata(item);
      
      // Simpan ke History untuk Search juga
      saveToHistory(simulatedResult, item, input, 'search');

      setStatus("Selesai!");
      setLoading(false);
    } catch (err) { setStatus(`❌ Error: ${err.message}`); setLoading(false); }
  }

  const handleSubmit = () => {
    setActiveTab("detection");
    if (mode === "scan") handleScanUrl();
    else if (mode === "file") handleScanFile();
    else handleSearch();
  }

  const handleClear = () => {
    setInput(""); setSelectedFile(null); setResult(null); setMetadata(null); setStatus("");
  }

  // --- DATA PROCESSING ---
  const stats = result?.data?.attributes?.stats || {};
  const scanDate = result?.data?.attributes?.date;
  
  const vendorObj = result?.data?.attributes?.results || {};
  const vendorList = Object.entries(vendorObj).map(([vendor, info]) => ({
      vendor, category: info?.category || "unrated", result: info?.result || "clean"
  }));
  const sortedVendors = vendorList.sort((a, b) => (a.category === 'malicious' ? -1 : 1));

  const pieData = [
    { name: "Harmless", value: stats.harmless || 0, color: "#22c55e" }, 
    { name: "Suspicious", value: stats.suspicious || 0, color: "#f59e0b" }, 
    { name: "Malicious", value: stats.malicious || 0, color: "#ef4444" }, 
    { name: "Undetected", value: stats.undetected || 0, color: "#6b7280" }, 
  ].filter(d => d.value > 0);

  return (
    <div className={`${isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-zinc-900"} min-h-screen font-sans transition-colors duration-500`}>
      

      {/* HEADER */}
      {/* ===== Header ===== */}
<div
  className={`top-0 z-40  backdrop-blur-lg border-b ${
    isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-[#faf9f9] border-gray-400"
  }`}
>
  <div className="container mx-auto px-4  sm:px-6 lg:px-8 py-6">

    {/* Info Bar */}
    <div className="flex items-center mt-10 mb-20 justify-between ">

      {/* Branding Box */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isDarkMode
            ? "bg-none text-zinc-300"
            : "bg-none text-gray-600  border-gray-200"
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-red-500" />
        <span className="font-medium">
          SecurityScanner <span className="text-red-600">Ultimate</span>
        </span>
      </div>

      {/* Mode Switcher */}
      <div
        className={` flex gap-1 p-1 cursor-target cursor-none rounded-lg border ${
          isDarkMode ? "bg-none border-zinc-700" : "bg-none border-gray-300"
        }`}
      >
        {[
          { id: "scan", icon: Globe },
          { id: "file", icon: FileUp },
          { id: "search", icon: Database },
          { id: "history", icon: History }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (m.id === "history") {
                setShowHistoryTab(true);
                setResult(null);
              } else {
                setMode(m.id);
                setShowHistoryTab(false);
                handleClear();
              }
            }}
            className={`p-2 rounded-md cursor-none transition-all ${
              (m.id === "history" && showHistoryTab) ||
              (mode === m.id && !showHistoryTab)
                ? "bg-sky-600 text-white shadow"
                : isDarkMode
                ? "text-zinc-400 hover:bg-zinc-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <m.icon className="w-4 h-4 cursor-none" />
          </button>
        ))}
      </div>
    </div>

    {/* Title Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
        Security Scanner
      </h1>
      <p
        className={`text-lg font-mono ${
          isDarkMode ? "text-zinc-400" : "text-gray-600"
        }`}
      >
        Scan URL, file, atau hash dengan lebih mudah dan cepat.
      </p>
    </motion.div>
  </div>
  
</div>


      <div className="container mx-auto px-4 py-10 max-w-5xl">
        
        {/* --- TAMPILAN UTAMA (INPUT SCANNER) --- */}
        {!showHistoryTab && (
            <div className="max-w-3xl mx-auto mb-12">
                {/* <div className="text-center mb-8">
                     <h1 className="text-4xl font-bold mb-2 font-lyrae"><DecryptedText text="Deep Threat Analysis" animateOn="view" speed={100}/></h1>
                     <p className={`text-sm ${isDarkMode?"text-zinc-500":"text-gray-500"}`}>Analyze Files, URLs, Domains, IPs with Engine 2.0</p>
                </div> */}

                <div className={`p-1.5 rounded-2xl border flex gap-2 shadow-xl ${isDarkMode?"bg-zinc-800 border-zinc-700":"bg-white border-gray-200"}`}>
                    <div className="flex-1">
                        {mode === 'file' ? (
                            <div className="relative w-full h-full">
                                 <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" id="file-upload" />
                                 <label htmlFor="file-upload" className={`w-full h-full px-4 py-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-opacity-50 transition-colors ${isDarkMode?"hover:bg-zinc-700":"hover:bg-gray-50"}`}>
                                     <div className={`p-2 rounded-lg ${isDarkMode?"bg-zinc-700":"bg-gray-100"}`}><FileUp className="w-5 h-5 text-blue-500"/></div>
                                     <span className={`text-sm font-medium truncate ${!selectedFile && "opacity-50"}`}>
                                         {selectedFile ? selectedFile.name : "Click to browse file (Max 32MB)"}
                                     </span>
                                 </label>
                                 {selectedFile && <button onClick={()=>setSelectedFile(null)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500/10 rounded-full text-red-500"><X className="w-4 h-4"/></button>}
                            </div>
                        ) : (
                            <div className="relative h-full flex items-center">
                                <div className="absolute left-4 opacity-50"><Search className="w-5 h-5"/></div>
                                <input 
                                    value={input} onChange={(e)=>setInput(e.target.value)}
                                    className="w-full h-full pl-12 pr-4 bg-transparent outline-none font-medium placeholder:opacity-50"
                                    placeholder={mode==='scan' ? "https://malicious-site.com" : "Hash, IP, or Domain..."}
                                    onKeyPress={(e)=>e.key==='Enter'&&handleSubmit()}
                                />
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading || (mode==='file'?!selectedFile:!input)}
                        className={`px-8 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                            loading || (mode==='file'?!selectedFile:!input) ? "bg-zinc-600 opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                        }`}>
                        {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "SCAN"}
                    </button>
                    
                </div>
                {status && <div className="text-center mt-4 text-xs font-mono text-zinc-500 animate-pulse">{status}</div>}
            </div>
            
        )}

        {/* --- TAMPILAN HISTORY --- */}
        {showHistoryTab && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6 text-blue-500"/> Scan History</h2>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-500 bg-red-500/10 hover:bg-red-500/20 transition">
                            <Trash2 className="w-4 h-4"/> Clear All
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-20 opacity-50 border rounded-2xl border-dashed">
                        <History className="w-12 h-12 mx-auto mb-3"/>
                        <p>No scan history yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {history.map((item, idx) => (
                            <div key={idx} onClick={() => restoreHistory(item)} 
                                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${
                                isDarkMode ? "bg-zinc-800/50 border-zinc-700 hover:border-blue-500" : "bg-white border-gray-200 hover:border-blue-400"
                            }`}>
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                        item.stats?.malicious > 0 ? "border-red-500 text-red-500" : "border-green-500 text-green-500"
                                    }`}>
                                        {item.stats?.malicious > 0 ? <Skull className="w-5 h-5"/> : <ShieldCheck className="w-5 h-5"/>}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold truncate max-w-md">{item.name}</div>
                                        <div className="text-xs opacity-50 flex items-center gap-2">
                                            <span className="uppercase font-bold tracking-wider">{item.type}</span>
                                            <span>•</span>
                                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className={`font-bold ${item.stats?.malicious > 0 ? "text-red-500":"text-green-500"}`}>
                                            {item.stats?.malicious > 0 ? `${item.stats.malicious} Detections` : "Clean"}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition"/>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        )}

        {/* --- RESULT SECTION --- */}
        <AnimatePresence>
        {result && !showHistoryTab && (
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="space-y-6">
                
                {/* 1. Summary Header Card */}
                <div className={`rounded-2xl p-6 border shadow-2xl relative overflow-hidden ${isDarkMode?"bg-zinc-800/60 border-zinc-700":"bg-white border-gray-200"}`}>
                     {/* Background Glow */}
                     <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${
                         stats.malicious > 0 ? "bg-red-500" : stats.suspicious > 0 ? "bg-yellow-500" : "bg-green-500"
                     }`}></div>

                     <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                         <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-2">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDarkMode?"bg-zinc-700 text-zinc-300":"bg-gray-100 text-gray-600"}`}>
                                     {result.data.type || mode} Analysis
                                 </span>
                                 <span className="text-xs opacity-50 flex items-center gap-1"><Clock className="w-3 h-3"/> {scanDate ? new Date(scanDate*1000).toLocaleString() : "Just now"}</span>
                             </div>
                             <h2 className="text-2xl sm:text-3xl font-bold truncate mb-1" title={metadata?.attributes?.meaningful_name || input}>
                                 {mode==='file' && selectedFile ? selectedFile.name : (metadata?.attributes?.meaningful_name || input || "Scan Result")}
                             </h2>
                             <div className="text-xs font-mono opacity-50 truncate max-w-md">{result.data.id}</div>
                         </div>

                         {/* Score Badge */}
                         <div className="flex items-center gap-4">
                             <div className="text-right">
                                 <div className={`text-4xl font-black ${stats.malicious > 0 ? "text-red-500" : "text-green-500"}`}>
                                     {stats.malicious}
                                     <span className={`text-lg font-medium ml-1 ${isDarkMode?"text-zinc-500":"text-gray-400"}`}>/ {vendorList.length}</span>
                                 </div>
                                 <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Detections</div>
                             </div>
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                                 stats.malicious > 0 ? "border-red-500 text-red-500" : "border-green-500 text-green-500"
                             }`}>
                                 {stats.malicious > 0 ? <Skull className="w-8 h-8"/> : <ShieldCheck className="w-8 h-8"/>}
                             </div>
                         </div>
                     </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="flex justify-center">
                     <div className={`p-1 rounded-xl flex gap-1 border ${isDarkMode?"bg-zinc-900 border-zinc-700":"bg-gray-100 border-gray-200"}`}>
                         {['detection', 'details'].map(tab => (
                             <button key={tab} onClick={()=>setActiveTab(tab)}
                                 className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                     activeTab===tab ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                 }`}>
                                 {tab}
                             </button>
                         ))}
                     </div>
                </div>

                {/* 3. Content Area */}
                <div className="min-h-[500px]">
                    
                    {/* --- TAB DETECTION --- */}
                    {activeTab === 'detection' && (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Chart */}
                            <div className={`lg:col-span-1 rounded-2xl p-6 border ${isDarkMode?"bg-zinc-800/40 border-zinc-700":"bg-white border-gray-200"}`}>
                                <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500"/> Engine Summary</h3>
                                <div className="h-48 flex justify-center items-center">
                                    <PieChart series={[{ data: pieData.map((e,i)=>({id:i, value:e.value, color:e.color})), innerRadius: 60, paddingAngle: 2 }]} height={200} slotProps={{ legend: { hidden: true } }} />
                                </div>
                                <div className="mt-6 space-y-2">
                                    {pieData.map(d=>(
                                        <div key={d.name} className="flex justify-between text-sm items-center">
                                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/> {d.name}</div>
                                            <span className="font-bold opacity-70">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Vendor List */}
                            <div className={`lg:col-span-2 rounded-2xl p-0 border overflow-hidden flex flex-col ${isDarkMode?"bg-zinc-800/40 border-zinc-700":"bg-white border-gray-200"}`}>
                                <div className={`px-6 py-4 border-b font-bold flex justify-between items-center ${isDarkMode?"border-zinc-700":"border-gray-200"}`}>
                                    <div className="flex items-center gap-2"><ListFilter className="w-4 h-4 text-blue-500"/> Security Vendors</div>
                                    <div className="text-xs opacity-50">{vendorList.length} Engines</div>
                                </div>
                                <div className="flex-1 overflow-y-auto max-h-[500px] p-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(showAllVendors ? sortedVendors : sortedVendors.slice(0, 16)).map((v,i)=>(
                                            <div key={i} className={`p-3 rounded-lg border flex items-center justify-between group hover:shadow-md transition-all ${
                                                isDarkMode?"bg-zinc-900/50 border-zinc-700/50":"bg-gray-50 border-gray-100"
                                            }`}>
                                                <span className="text-sm font-medium">{v.vendor}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                                                    v.category==='malicious'?"bg-red-500/10 text-red-500":
                                                    v.category==='suspicious'?"bg-yellow-500/10 text-yellow-500":
                                                    v.category==='harmless'?"bg-green-500/10 text-green-500":"bg-gray-500/10 text-gray-500"
                                                }`}>
                                                    {v.category==='malicious' && <Skull className="w-3 h-3"/>}
                                                    {v.result || v.category}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {vendorList.length > 16 && (
                                        <button onClick={()=>setShowAllVendors(!showAllVendors)} className="w-full mt-2 py-3 text-sm text-blue-500 font-medium hover:bg-blue-500/10 rounded-lg transition-colors">
                                            {showAllVendors ? "Show Less" : `View All ${vendorList.length} Vendors`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- TAB DETAILS (THE ULTIMATE VIEW) --- */}
                    {activeTab === 'details' && (
                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                            {!metadata ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500"/>
                                    <p>Fetching deep metadata object...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    
                                    {/* 1. Basic Properties (Hashes) */}
                                    <div className="lg:col-span-2">
                                        <SectionCard title="Basic Properties" icon={Hash} isDarkMode={isDarkMode}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <CopyableText label="MD5" text={metadata.attributes.md5} isCode />
                                                <CopyableText label="SHA-1" text={metadata.attributes.sha1} isCode />
                                                <CopyableText label="SHA-256" text={metadata.attributes.sha256} isCode />
                                                <CopyableText label="Vhash" text={metadata.attributes.vhash} isCode />
                                                <CopyableText label="Authentihash" text={metadata.attributes.authentihash} isCode />
                                                <CopyableText label="Imphash" text={metadata.attributes.imphash} isCode />
                                                <CopyableText label="SSDEEP" text={metadata.attributes.ssdeep} isCode />
                                                <CopyableText label="File Type" text={metadata.attributes.type_description} />
                                                <CopyableText label="Magic" text={metadata.attributes.magic} />
                                                <CopyableText label="File Size" text={metadata.attributes.size ? `${(metadata.attributes.size/1024).toFixed(2)} KB` : "-"} />
                                            </div>
                                        </SectionCard>
                                    </div>

                                    {/* 2. History */}
                                    <SectionCard title="History" icon={Clock} isDarkMode={isDarkMode}>
                                        <div className="space-y-1">
                                            <CopyableText label="Creation Time" text={metadata.attributes.creation_date ? new Date(metadata.attributes.creation_date*1000).toUTCString() : "-"} />
                                            <CopyableText label="First Submission" text={metadata.attributes.first_submission_date ? new Date(metadata.attributes.first_submission_date*1000).toUTCString() : "-"} />
                                            <CopyableText label="Last Analysis" text={metadata.attributes.last_analysis_date ? new Date(metadata.attributes.last_analysis_date*1000).toUTCString() : "-"} />
                                        </div>
                                    </SectionCard>

                                    {/* 3. Names */}
                                    <SectionCard title="Names" icon={FileText} isDarkMode={isDarkMode}>
                                        <div className={`text-xs p-3 rounded-lg max-h-40 overflow-y-auto ${isDarkMode?"bg-zinc-900/50 text-zinc-400":"bg-gray-50 text-gray-600"}`}>
                                            {metadata.attributes.names?.map((n, i) => (
                                                <div key={i} className="mb-1 pb-1 border-b border-dashed border-current/10 last:border-0 last:mb-0">{n}</div>
                                            )) || "No names found"}
                                        </div>
                                    </SectionCard>

                                    {/* 4. Signature Info */}
                                    {metadata.attributes.signature_info && (
                                        <div className="lg:col-span-2">
                                            <SectionCard title="Signature Info" icon={Fingerprint} isDarkMode={isDarkMode}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <CopyableText label="Product" text={metadata.attributes.signature_info.product} />
                                                    <CopyableText label="Description" text={metadata.attributes.signature_info.description} />
                                                    <CopyableText label="Original Name" text={metadata.attributes.signature_info.original_name} />
                                                    <CopyableText label="Copyright" text={metadata.attributes.signature_info.copyright} />
                                                    <CopyableText label="Signers" text={metadata.attributes.signature_info.signers_details?.map(s=>s.name).join("; ")} />
                                                    <div className={`p-2 rounded border text-center text-xs font-bold uppercase ${metadata.attributes.signature_info.verified ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                                        {metadata.attributes.signature_info.verified ? "Signature Verified" : "Invalid Signature"}
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        </div>
                                    )}

                                    {/* 5. Portable Executable Info */}
                                    {metadata.attributes.pe_info && (
                                        <div className="lg:col-span-2">
                                            <SectionCard title="Portable Executable Info" icon={Cpu} isDarkMode={isDarkMode}>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                                    <CopyableText label="Target Machine" text={metadata.attributes.pe_info.machine_type} />
                                                    <CopyableText label="Entry Point" text={metadata.attributes.pe_info.entry_point} isCode />
                                                    <CopyableText label="Sections Count" text={metadata.attributes.pe_info.sections?.length} />
                                                </div>
                                                
                                                {/* Sections Table Simplified */}
                                                <h4 className="text-xs font-bold uppercase opacity-50 mb-2 mt-4 flex items-center gap-1"><Layers className="w-3 h-3"/> Sections</h4>
                                                <div className={`overflow-x-auto rounded-lg border ${isDarkMode?"border-zinc-700":"border-gray-200"}`}>
                                                    <table className="w-full text-xs text-left">
                                                        <thead className={isDarkMode?"bg-zinc-700":"bg-gray-100"}>
                                                            <tr><th className="p-2">Name</th><th className="p-2">Virtual Size</th><th className="p-2">Entropy</th><th className="p-2">MD5</th></tr>
                                                        </thead>
                                                        <tbody>
                                                            {metadata.attributes.pe_info.sections?.map((s,i)=>(
                                                                <tr key={i} className={`border-b last:border-0 ${isDarkMode?"border-zinc-700/50":"border-gray-100"}`}>
                                                                    <td className="p-2 font-mono text-blue-500">{s.name}</td>
                                                                    <td className="p-2">{s.virtual_size}</td>
                                                                    <td className="p-2">{s.entropy?.toFixed(2)}</td>
                                                                    <td className="p-2 font-mono opacity-50">{s.md5}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </SectionCard>
                                        </div>
                                    )}

                                </div>
                            )}
                        </motion.div>
                    )}

                </div>
            </motion.div>
        )}
        </AnimatePresence>

      </div>
    </div>
  );
}