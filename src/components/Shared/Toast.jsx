import React, { useContext } from "react"
import { createPortal } from "react-dom" // Tambahkan ini
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Info, AlertTriangle, XCircle, Loader2 } from "lucide-react"
import { ThemeContext } from "../../context/ThemeContext"

const ICONS = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  loading: Loader2,
}

const Toast = ({ message, type = "info", isVisible }) => {
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: true }
  const Icon = ICONS[type]

  // Render hanya jika di sisi client
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: -20, x: "-50%", scale: 0.95 }}
          className={`
            fixed top-10 left-1/2 z-[9999]
            flex items-center gap-3
            px-4 py-3 rounded-xl border shadow-2xl
            backdrop-blur-md min-w-[200px]
            ${isDarkMode
                ? "bg-zinc-900/95 border-zinc-700 text-zinc-100"
                : "bg-white/95 border-zinc-200 text-zinc-900"
            }
          `}
        >
          <Icon className={`w-4 h-4 ${
              type === "success" ? "text-emerald-500" :
              type === "info" ? "text-blue-500" :
              type === "warning" ? "text-amber-500" :
              type === "error" ? "text-red-500" : "text-zinc-400 animate-spin"
            }`}
          />
          <span className="text-sm font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body // Toast dipindah ke body agar selalu di paling depan
  )
}

export default Toast