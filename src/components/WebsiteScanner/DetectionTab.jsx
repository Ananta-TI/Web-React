import React from "react";
import { motion } from "framer-motion";
import { BarChart2, ListFilter, Skull } from "lucide-react";
import { PieChart } from '@mui/x-charts/PieChart';

const DetectionTab = ({ stats, vendorList, showAllVendors, setShowAllVendors, isDarkMode }) => {
  const pieData = [
    { name: "Harmless", value: stats.harmless || 0, color: "#22c55e" },
    { name: "Suspicious", value: stats.suspicious || 0, color: "#f59e0b" },
    { name: "Malicious", value: stats.malicious || 0, color: "#ef4444" },
    { name: "Undetected", value: stats.undetected || 0, color: "#6b7280" },
  ].filter(d => d.value > 0);

  const sortedVendors = vendorList.sort((a, b) => {
    if (a.category === 'malicious' && b.category !== 'malicious') return -1;
    if (b.category === 'malicious' && a.category !== 'malicious') return 1;
    return a.vendor.localeCompare(b.vendor);
  });

  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart */}
      <div className={`lg:col-span-1 rounded-2xl p-6 border ${isDarkMode?"bg-zinc-800/40 border-zinc-700":"bg-white border-gray-200"}`}>
        <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500"/> Engine Summary</h3>
        <div className="h-48 flex justify-center items-center">
          <PieChart 
            series={[{
              data: pieData.map((e,i)=>({id:i, value:e.value, color:e.color})), 
              innerRadius: 60, 
              paddingAngle: 2 
            }]} 
            height={200} 
            slotProps={{ legend: { hidden: true } }} 
          />
        </div>
        <div className="mt-6 space-y-2">
          {pieData.map(d=>(
            <div key={d.name} className="flex justify-between text-sm items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/> 
                {d.name}
              </div>
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
              <div key={i} className={`p-3 rounded-lg border flex items-center justify-between group hover:shadow-md transition-all ${isDarkMode?"bg-zinc-900/50 border-zinc-700/50":"bg-gray-50 border-gray-100"}`}>
                <span className="text-sm font-medium">{v.vendor}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                  v.category==='malicious'?"bg-red-500/10 text-red-500":
                  v.category==='suspicious'?"bg-yellow-500/10 text-yellow-500":
                  v.category==='harmless'?"bg-green-500/10 text-green-500":
                  "bg-gray-500/10 text-gray-500"
                }`}>
                  {v.category==='malicious' && <Skull className="w-3 h-3"/>}{v.result || v.category}
                </span>
              </div>
            ))}
          </div>
          {vendorList.length > 16 && (
            <button 
              onClick={()=>setShowAllVendors(!showAllVendors)} 
              className="w-full mt-2 py-3 text-sm text-blue-500 font-medium hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              {showAllVendors ? "Show Less" : `View All ${vendorList.length} Vendors`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DetectionTab;