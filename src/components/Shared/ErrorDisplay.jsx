import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorDisplay = ({ error, onRetry, isDarkMode }) => (
    <div className="max-w-3xl mx-auto">
        <div className={`p-6 rounded-xl border flex items-start gap-4 ${
            isDarkMode ? "bg-red-500/5 border-red-500/30" : "bg-red-50 border-red-200"
        }`}>
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${isDarkMode ? "text-red-400" : "text-red-800"}`}>Scan Failed</h3>
                <p className={`text-sm mb-4 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>{error}</p>
                <button
                    onClick={onRetry}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        isDarkMode ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                >
                    <RefreshCw className="w-4 h-4" /> Try Again
                </button>
            </div>
        </div>
    </div>
);

export default ErrorDisplay;