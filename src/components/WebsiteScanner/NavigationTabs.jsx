import React from "react";

const NavigationTabs = ({ activeTab, setActiveTab, isDarkMode }) => {
  return (
    <div className="flex justify-center">
      <div className={`p-1 rounded-xl flex gap-1 border ${isDarkMode?"bg-zinc-900 border-zinc-700":"bg-gray-100 border-gray-200"}`}>
        {['detection', 'details'].map(tab => (
          <button 
            key={tab} 
            onClick={()=>setActiveTab(tab)} 
            className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab===tab 
                ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;