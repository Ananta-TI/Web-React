import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const Header = ({ isDarkMode }) => {
  return (
    <div className={`top-0 z-40 backdrop-blur-lg border-b ${isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-[#faf9f9] border-gray-400"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mt-10 mb-2 justify-between">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? "bg-none text-zinc-300" : "bg-none text-gray-600"}`}>
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="font-medium">SecurityScanner <span className="text-red-600">Ultimate</span></span>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3">Security Scanner</h1>
          <p className={`text-lg font-mono ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Scan URL, file, atau hash dengan lebih mudah dan cepat.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Header;