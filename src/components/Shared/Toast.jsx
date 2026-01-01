import React, { useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react"
import { ThemeContext } from "../../context/ThemeContext"

const ICONS = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  loading: Loader2,
}

const Toast = ({ message, type = "info", isVisible }) => {
  const theme = useContext(ThemeContext)
  const isDarkMode = theme?.isDarkMode ?? true
  const Icon = ICONS[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`
fixed top-4 left-1/2 -translate-x-1/2
            flex items-center gap-3
            px-4 py-3 rounded-xl border shadow-lg
            backdrop-blur-md
            ${
              isDarkMode
                ? "bg-zinc-900/90 border-zinc-800 text-zinc-100"
                : "bg-white/90 border-zinc-200 text-zinc-900"
            }
          `}
        >
          <Icon
            className={`w-4 h-4 ${
              type === "success" && "text-emerald-500"
            } ${
              type === "info" && "text-blue-500"
            } ${
              type === "warning" && "text-amber-500"
            } ${
              type === "error" && "text-red-500"
            } ${
              type === "loading" && "animate-spin text-zinc-400"
            }`}
          />

          <span className="text-sm font-medium leading-snug">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
