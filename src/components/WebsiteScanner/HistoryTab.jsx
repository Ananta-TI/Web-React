import React from "react";
import { motion } from "framer-motion";
import { History, Trash2, ChevronRight, Skull, ShieldCheck } from "lucide-react";

const HistoryTab = ({ history, clearHistory, restoreHistory, isDarkMode }) => {
  return (
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
    <p>Tidak ada riwayat pada sesi ini.</p>
    <p className="text-xs mt-2">Data akan dimuat ulang dari server jika halaman di-refresh.</p>
  </div>
) : (
        <div className="grid gap-3">
          {history.map((item, idx) => (
            <div key={idx} onClick={() => restoreHistory(item)} className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${isDarkMode ? "bg-zinc-800/50 border-zinc-700 hover:border-blue-500" : "bg-white border-gray-200 hover:border-blue-400"}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${item.stats?.malicious > 0 ? "border-red-500 text-red-500" : "border-green-500 text-green-500"}`}>
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
  );
};

export default HistoryTab;