import { useState, useEffect } from "react";
import { Menu, X, Moon, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function MinimalistSidebarRight() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);

  // Mengatur mode berdasarkan localStorage saat halaman dimuat
  useEffect(() => {
    const savedMode = localStorage.getItem("theme");
    if (savedMode === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Event listener untuk menangkap posisi mouse
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Menambahkan event listener mouse move
    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup event listener saat komponen dibuang
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Fungsi untuk toggle antara dark dan light mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 left-4 flex items-center justify-between z-60">
        {/* Logo dengan teks yang berubah berdasarkan mode */}
        <span className={`text-2xl font-bold p-10 ${isDarkMode ? "text-white" : "text-zinc-800"}`}>
          {/* <img 
            src={isDarkMode ? "/public/img/logo2.png" : "/public/img/logo2.png"} 
            alt="LogoNama" 
            className="h-20"
          /> */}
          
          {/* Teks logo yang berubah */}
          <span>
            {isDarkMode ? "N T A" : "N T A"}
          </span>
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 focus:outline-none">

          <motion.div
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1 : 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-2 rounded-full ring-0 ring-gray-300 ring-opacity-30"
          >
            {isOpen ? (
              <X className="w-15 h-15 p-2 rounded-full bg-gray-800 text-white" />
            ) : (
              <Menu className="w-15 h-15 p-2 rounded-full bg-gray-800 text-white" />
            )}
          </motion.div>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Animasi buka/tutup sidebar */}
      <motion.div
        className={`fixed top-0 right-0 h-full w-120 z-50 ${isDarkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"} border-l border-gray-300 p-8 flex flex-col`}
        initial={{ translateX: "100%" }}
        animate={{ translateX: isOpen ? "0%" : "100%" }}
        exit={{ translateX: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-center mt-30 mb-5">
          <span className="text-xl font-semibold uppercase tracking-wide">
            Navigation
          </span>
        </div>
        <div
          data-orientation="horizontal"
          role="none"
          className="shrink-0 h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"
        ></div>

        {/* Menu Utama */}
        <nav className="space-y-8 mb-1 mt-10">
          {["Home", "About", "Projects", "Contact"].map((item) => (
            <motion.a
              key={item}
              href="#"
              className="block text-6xl font-light"
              onMouseEnter={() => setHoveredLink(item)}  // Set hover link
              onMouseLeave={() => setHoveredLink(null)}  // Reset hover link
              style={{
                transform: hoveredLink === item
                  ? `translateX(${(mousePosition.x / window.innerWidth) * 50 - 50}px) translateY(${(mousePosition.y / window.innerHeight) * 50 - 20}px)`
                  : "none",
                transition: "transform 0.1s ease-out"
              }}
            >
              {item}
            </motion.a>
          ))}
        </nav>

        {/* Links Tambahan */}
        <div className="mt-40">
          <span className="text-sm font-bold uppercase tracking-wide block mb-2">
            Links
          </span>
          <div
            data-orientation="horizontal"
            role="none"
            className="shrink-0 h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"
          ></div>
          <div className="flex flex-wrap gap-4 text-sm">
            {["Github", "LinkedIn", "Instagram", "Tiktok", "Email"].map((link) => (
              <motion.a
                key={link}
                href="#"
                className="hover:underline"
                onMouseEnter={() => setHoveredLink(link)}  // Set hover link
                onMouseLeave={() => setHoveredLink(null)}  // Reset hover link
                style={{
                  transform: hoveredLink === link
                    ? `translateX(${(mousePosition.x / window.innerWidth) * 20 - 20}px) translateY(${(mousePosition.y / window.innerHeight) * 20 - 20}px)`
                    : "none",
                  transition: "transform 0.1s ease-out"
                }}
              >
                {link}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Tombol Dark Mode */}
        <div className="mt-auto flex space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded border border-gray-300 hover:bg-gray-200"
          >
            <Moon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded border border-gray-300 hover:bg-gray-200">
            <Globe className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
