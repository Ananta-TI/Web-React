import React, { useState, useContext } from "react"; // Added useContext to the import
import { Check, Copy } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import Toast from "./Toast";

const CopyableText = ({ text, label, isCode = false }) => {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  
  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToast({ message: `${label} copied!`, type: "success" });
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Copy failed:", err);
      setToast({ message: "Failed to copy", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <>
      <div className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${
          isDarkMode ? "bg-zinc-900/50 border-zinc-700 hover:border-blue-500/50" : "bg-gray-50 border-gray-200 hover:border-blue-300"
      }`}>
        <div className="flex flex-col min-w-0 flex-1 mr-2">
          <span className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>
              {label}
          </span>
          <span className={`text-xs sm:text-sm truncate font-medium ${isCode ? "font-mono" : ""} ${isDarkMode ? "text-zinc-200" : "text-gray-800"}`}>
              {text || "-"}
          </span>
        </div>
        <button onClick={handleCopy} className={`p-1.5 rounded-md transition-colors ${
            copied ? "text-green-500 bg-green-500/10" : isDarkMode ? "text-zinc-500 hover:text-white hover:bg-zinc-700" : "text-gray-400 hover:text-black hover:bg-gray-200"
        }`} aria-label={`Copy ${label}`}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <Toast message={toast?.message} type={toast?.type} isVisible={!!toast} />
    </>
  );
};

export default CopyableText;