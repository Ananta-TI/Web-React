import React, { useState } from "react";
import { Search, Globe, FileUp, Database, History, Loader2, X, ScanLine, Network, Server } from "lucide-react";

const InputSection = ({ 
  mode, input, setInput, selectedFile, setSelectedFile, 
  loading, status, progress, handleSubmit, onModeChange, 
  showHistoryTab, isDarkMode 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const tabs = [
    { id: "scan", icon: Globe, label: "URL Scanner", color: "text-emerald-500" },
    { id: "file", icon: FileUp, label: "File Upload", color: "text-blue-500" },
    { id: "search", icon: Database, label: "Universal Search", color: "text-purple-500" }, // IP/Domain/Hash
    { id: "history", icon: History, label: "History", color: "text-orange-500" }
  ];

  // Helper untuk mendeteksi tipe input di mode Search
  const getInputIcon = () => {
    if (mode === 'scan') return <Globe className="w-5 h-5" />;
    if (mode === 'search') {
      const val = input.trim();
      // Regex sederhana untuk deteksi visual
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(val);
      const isHash = /^[a-fA-F0-9]{32,64}$/.test(val);
      
      if (isIP) return <Server className="w-5 h-5 text-orange-500"/>; // IP Icon
      if (isHash) return <ScanLine className="w-5 h-5 text-purple-500"/>; // Hash Icon
      if (val.includes('.')) return <Network className="w-5 h-5 text-blue-500"/>; // Domain Icon
      return <Search className="w-5 h-5" />;
    }
    return <Search className="w-5 h-5" />;
  };

  const getPlaceholder = () => {
    if (mode === 'scan') return "Enter URL (e.g., http://example.com)...";
    if (mode === 'search') return "Enter IP, Domain, or File Hash...";
    return "Search...";
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 px-4">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-6">
        <div className={`p-1.5 rounded-xl border inline-flex gap-1 shadow-sm overflow-x-auto max-w-full ${isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-gray-200"}`}>
          {tabs.map((m) => {
            const isActive = (m.id === "history" && showHistoryTab) || (mode === m.id && !showHistoryTab);
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                  ${isActive 
                    ? `${isDarkMode ? "bg-zinc-800 text-white shadow-lg ring-1 ring-zinc-700" : "bg-zinc-900 text-white shadow-md"} scale-[1.02]` 
                    : `${isDarkMode ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`
                  }
                `}
              >
                <m.icon className={`w-4 h-4 ${isActive ? "text-current" : m.color}`} />
                <span className="whitespace-nowrap">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Container */}
      <div className={`
        relative group rounded-3xl border-2 transition-all duration-300
        ${isDragOver ? "border-blue-500 scale-[1.01]" : isDarkMode ? "border-zinc-700 hover:border-zinc-600" : "border-gray-200 hover:border-blue-300"}
        ${isDarkMode ? "bg-zinc-900/50" : "bg-white/80"}
        backdrop-blur-xl shadow-2xl
      `}>
        {/* Glow Effect */}
        <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity duration-500 blur-xl ${loading ? "opacity-20 animate-pulse" : "group-hover:opacity-10"}`}></div>

        <div className="relative p-2 flex flex-col md:flex-row gap-2">
          {/* Input Area */}
          <div className="flex-1 min-h-[60px] relative flex items-center">
            {mode === 'file' ? (
              // FILE UPLOAD (Sama seperti sebelumnya)
              <div className="w-full h-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                <input type="file" id="file-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                {!selectedFile ? (
                  <label htmlFor="file-upload" className={`w-full h-full min-h-[60px] rounded-xl border-2 border-dashed flex items-center justify-center gap-3 cursor-pointer transition-colors ${isDarkMode ? "border-zinc-700 hover:border-blue-500 hover:bg-zinc-800/50" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50"}`}>
                    <FileUp className="w-5 h-5 text-blue-500" />
                    <span className={`text-sm font-semibold ${isDarkMode ? "text-zinc-200" : "text-gray-700"}`}>Click or Drag File</span>
                  </label>
                ) : (
                  <div className={`w-full h-full p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-blue-50 border-blue-200"}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileUp className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                )}
              </div>
            ) : (
              // TEXT INPUT (URL / IP / DOMAIN / HASH)
              <div className="w-full relative h-full flex items-center">
                 <div className="absolute left-4 text-zinc-500">
                    {getInputIcon()}
                 </div>
                 <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`w-full h-14 pl-12 pr-4 bg-transparent outline-none text-lg font-medium transition-colors placeholder:text-zinc-500 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  placeholder={getPlaceholder()}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (mode === 'file' ? !selectedFile : !input)}
            className={`md:w-32 h-14 md:h-auto rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${loading || (mode === 'file' ? !selectedFile : !input) ? "bg-zinc-600/50 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"}`}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><ScanLine className="w-5 h-5" /><span>SCAN</span></>}
          </button>
        </div>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-700/50 overflow-hidden rounded-b-3xl">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className={`h-6 text-center mt-2 transition-opacity duration-300 ${status ? "opacity-100" : "opacity-0"}`}>
        {status && <span className="text-sm font-mono text-zinc-500">{status}</span>}
      </div>
    </div>
  );
};

export default InputSection;