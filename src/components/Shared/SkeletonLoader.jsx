import React from "react";

const SkeletonLoader = ({ isDarkMode }) => (
    <div className="max-w-3xl mx-auto">
        <div className={`p-6 rounded-xl border ${isDarkMode ? "bg-zinc-800/40 border-zinc-700" : "bg-white border-gray-200"}`}>
            <div className="animate-pulse space-y-3">
                <div className={`h-4 rounded w-3/4 ${isDarkMode ? "bg-zinc-700" : "bg-gray-200"}`}></div>
                <div className={`h-3 rounded w-1/2 ${isDarkMode ? "bg-zinc-700" : "bg-gray-200"}`}></div>
                <div className={`h-3 rounded w-2/3 ${isDarkMode ? "bg-zinc-700" : "bg-gray-200"}`}></div>
            </div>
        </div>
    </div>
);

export default SkeletonLoader;