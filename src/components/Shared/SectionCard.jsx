import React from "react";

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

export default SectionCard;