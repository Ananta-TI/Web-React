import React, { useContext } from "react"; // Added useContext to the import
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

const Toast = ({ message, type, isVisible }) => {
    const theme = useContext(ThemeContext);
    const isDarkMode = theme?.isDarkMode ?? true;
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {type === "success" ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;