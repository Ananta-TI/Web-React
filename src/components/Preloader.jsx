import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

const words = [
  "Hello",        // Inggris
  "Bonjour",      // Prancis
  "Ciao",         // Italia
  "Olà",          // Portugis (Old style/Typo) -> Bisa diganti "Olá" atau "Hola"
  "やあ",         // Jepang (Yaa - Informal)
  "Hallå",        // Swedia
  "Guten tag",    // Jerman
  "Hallo",        // Belanda/Indo
  "你好",         // Mandarin (Nǐ hǎo)
  "Hola",         // Spanyol
  "Привет",       // Rusia (Privet)
  "नमस्ते",       // Hindi (Namaste)
  "안녕하세요",    // Korea (Annyeonghaseyo)
  "مرحبا",        // Arab (Marhaban)
  "Sawasdee",     // Thailand
  "Merhaba",      // Turki
];
export default function Preloader() {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
    
    const resize = () => {
        setDimension({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (index === words.length - 1) return;
    const timeout = setTimeout(
      () => setIndex(index + 1),
      index === 0 ? 1000 : 120
    );
    return () => clearTimeout(timeout);
  }, [index]);

  const bgColor = isDarkMode ? "#faf9f9" : "#141516";
  const textColor = isDarkMode ? "#000000" : "#ffffff";
  const dotColor = isDarkMode ? "bg-black" : "bg-white";

  // --- CONFIG CURVE ---
  // Tentukan seberapa dalam lengkungannya (misal 300px)
  const curveHeight = 300; 

  const initialPath = `M0 0 L${dimension.width} 0 Q${dimension.width/2} 0 0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 Q${dimension.width/2} ${curveHeight} 0 0`;

  return (
    <motion.div
      className="fixed inset-0 z-[9999]  flex items-center justify-center pointer-events-none transition-colors duration-500"
      style={{ 
          backgroundColor: bgColor, 
          color: textColor 
      }}
      initial={{ y: 0 }}
      exit={{ 
          // FIX UTAMA DISINI:
          // Jangan cuma -100vh. Tapi - (Layar + Ekor + Sedikit Buffer)
          // Ini memastikan seluruh "buntut" SVG benar-benar lewat dari layar atas sebelum di-unmount.
          y: -(dimension.height + curveHeight + 100), 
          
          transition: { 
              duration: 1.2, // Sedikit diperlambat biar enak dilihat swipe-nya
              ease: [0.76, 0, 0.24, 1], 
              delay: 0.2 
          }
      }}
    >
      {dimension.width > 0 && (
        <>
            <motion.div 
                className="flex items-center  text-4xl md:text-6xl font-light tracking-tighter relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
                <span className={`w-3 h-3 rounded-full mr-3 animate-pulse ${dotColor}`}/>
                {words[index]}
            </motion.div>

            {/* EKOR SVG */}
            <svg 
                className="absolute top-full left-0 w-full pointer-events-none"
                style={{ 
                    // Tinggi SVG harus minimal setinggi curveHeight, lebihkan dikit biar aman
                    height: curveHeight + 100, 
                    fill: bgColor,
                    transition: "fill 0.5s ease"
                }} 
            >
                <motion.path 
                    variants={{
                        initial: { d: initialPath },
                        exit: { 
                            d: targetPath, 
                            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 } 
                        }
                    }}
                    initial="initial"
                    exit="exit"
                />
            </svg>
        </>
      )}
    </motion.div>
  );
}