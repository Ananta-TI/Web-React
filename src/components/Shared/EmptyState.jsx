import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Globe, FileUp, Database } from "lucide-react";

const EmptyState = ({ isDarkMode }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-12 text-center">
        <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? "bg-zinc-800/50" : "bg-gray-100"
        }`}>
            <ShieldCheck className="w-12 h-12 text-zinc-500" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Ready to Scan</h3>
        <p className={`mb-8 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>Enter a URL, upload a file, or search for a hash to begin.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className={`p-4 rounded-lg border ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Scan URLs</p>
            </div>
            <div className={`p-4 rounded-lg border ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                <FileUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Upload Files</p>
            </div>
            <div className={`p-4 rounded-lg border ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                <Database className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Search Database</p>
            </div>
        </div>
    </motion.div>
);

export default EmptyState;