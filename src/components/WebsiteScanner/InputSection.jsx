import React from "react";
import { Search, Globe, FileUp, Database, History, Loader2, X } from "lucide-react";

const InputSection = ({ 
  mode, 
  input, 
  setInput, 
  selectedFile, 
  setSelectedFile, 
  loading, 
  status, 
  progress, 
  handleSubmit,
  handleClear,
  onModeChange,
  showHistoryTab,
  isDarkMode 
}) => {
  return (
    <>
      <div className="max-w-3xl mx-auto mb-12">
        <div className={`p-1.5 rounded-2xl border flex gap-2 shadow-xl ${isDarkMode?"bg-zinc-800 border-zinc-700":"bg-white border-gray-200"}`}>
          <div className="flex-1">
            {mode === 'file' ? (
              <div className="relative w-full h-full">
                <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
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
                  value={input}
                  onChange={(e)=>setInput(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-transparent outline-none font-medium placeholder:opacity-50"
                  placeholder={mode==='scan' ? "https://malicious-site.com" : "Hash, IP, or Domain..."}
                  onKeyDown={(e)=>e.key==='Enter'&&handleSubmit()}
                />
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || (mode==='file'?!selectedFile:!input)}
            className={`px-8 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
              loading || (mode==='file'?!selectedFile:!input) ? "bg-zinc-600 opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
            }`}>
            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "SCAN"}
          </button>
        </div>
        {status && !loading && (
          <div className="text-center mt-4 text-xs font-mono text-zinc-500 animate-pulse">{status}</div>
        )}
        {progress > 0 && (
          <div className="w-full bg-zinc-700 rounded-full h-2 mt-4">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      <div className={`flex justify-center mb-8`}>
        <div className={`flex gap-1 p-1 cursor-target rounded-lg border ${isDarkMode ? "bg-none border-zinc-700" : "bg-none border-gray-300"}`}>
          {[
            { id: "scan", icon: Globe, label: "URL" },
            { id: "file", icon: FileUp, label: "File" },
            { id: "search", icon: Database, label: "Search" },
            { id: "history", icon: History, label: "History" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`p-2 rounded-md transition-all flex items-center gap-2 sm:gap-0 ${
                (m.id === "history" && showHistoryTab) || (mode === m.id && !showHistoryTab)
                  ? "bg-sky-600 text-white shadow"
                  : isDarkMode ? "text-zinc-400 hover:bg-zinc-700" : "text-gray-500 hover:bg-gray-100"
              }`}
              aria-label={`${m.label} Mode`}
            >
              <m.icon className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default InputSection;