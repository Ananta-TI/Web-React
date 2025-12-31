import React from "react";
import { Skull, ShieldCheck, Info, Clock } from "lucide-react";

const ResultSummary = ({ result, metadata, stats, input, mode, selectedFile, isDarkMode }) => {
  const scanDate = result?.data?.attributes?.date || result?.data?.attributes?.last_analysis_date;
  
  return (
    <div className={`rounded-2xl p-6 border shadow-2xl relative overflow-hidden transition-all hover:shadow-3xl ${isDarkMode?"bg-zinc-800/60 border-zinc-700":"bg-white border-gray-200"}`}>
      <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none ${stats.malicious > 0 ? "bg-red-500" : stats.suspicious > 0 ? "bg-yellow-500" : "bg-green-500"}`}></div>
      <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDarkMode?"bg-zinc-700 text-zinc-300":"bg-gray-100 text-gray-600"}`}>{result.data.type || mode} Analysis</span>
            <span className="text-xs opacity-50 flex items-center gap-1"><Clock className="w-3 h-3"/> {scanDate ? new Date(scanDate*1000).toLocaleString() : "Just now"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold truncate mb-1" title={metadata?.attributes?.meaningful_name || input}>{mode==='file' && selectedFile ? selectedFile.name : (metadata?.attributes?.meaningful_name || input || "Scan Result")}</h2>
          <div className="text-xs font-mono opacity-50 truncate max-w-md flex items-center gap-1">
            <span>{result.data.id}</span>
            <Info className="w-3 h-3 opacity-50" title="Analysis ID"/>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-4xl font-black ${stats.malicious > 0 ? "text-red-500" : "text-green-500"}`}>{stats.malicious} <span className={`text-lg font-medium ml-1 ${isDarkMode?"text-zinc-500":"text-gray-400"}`}>/ {Object.keys(result?.data?.attributes?.results || {}).length}</span></div>
            <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Detections</div>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${stats.malicious > 0 ? "border-red-500 text-red-500" : "border-green-500 text-green-500"}`}>
            {stats.malicious > 0 ? <Skull className="w-8 h-8"/> : <ShieldCheck className="w-8 h-8"/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSummary;