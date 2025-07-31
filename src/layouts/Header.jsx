import { useState, useEffect, useContext } from "react";
import { Menu, X, Moon, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext"; // Pakai Context langsung

export default function MinimalistSidebarRight() {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext); // Ambil dari Context

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleToggleSidebar = () => setIsOpen((prev) => !prev);
  const handleDarkModeToggle = () => setIsDarkMode((prev) => !prev);

  return (
    <div className="relative">
      <div className="fixed flex items-center justify-between right-4 left-4 z-60">
        <span className={`text-2xl font-bold p-0 ${isDarkMode ? "text-white" : "text-zinc-800"}`}>
        <img
            src={isDarkMode ? "../img/logo1.png" : "../img/logo3.png"}
            alt="Ananta Firdaus"
            className="object-cover h-20 w-30"
          />        </span>
        <button onClick={handleToggleSidebar} className="p-2 text-gray-600 focus:outline-none">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-2 rounded-full"
          >
            {isOpen ? (
              <X className="w-13 h-13 p-2 text-white rounded-full  bg-zinc-800" />
            ) : (
              <Menu className="w-13 h-13 p-2 text-white rounded-full bg-zinc-800" />
            )}
          </motion.div>
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={handleToggleSidebar} />}

      <motion.div
        className={`fixed top-0 right-0 h-full w-120 z-50 ${isDarkMode ? "bg-zinc-800 text-white" : "bg-gray-100 text-gray-900"}  p-8 flex flex-col`}
        initial={{ translateX: "100%" }}
        animate={{ translateX: isOpen ? "0%" : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between mt-10 mb-5">
          <span className="text-xl font-semibold tracking-wide uppercase">Navigation</span>
        </div>

        <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"></div>

        <nav className="mt-10 mb-1 space-y-8">
  {[
    { name: "Home", link: "#home" },
    { name: "About", link: "#About" }, // Ubah dari "#About" ke "#about" (harus konsisten)
    { name: "Projects", link: "#projects" },
    { name: "Contact", link: "#contact" },
  ].map((item) => (
    <motion.a
      key={item.name}
      href={item.link}
      onClick={(e) => {
        e.preventDefault(); // Hindari default jump langsung
        const section = document.querySelector(item.link);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setIsOpen(false); // Tutup sidebar setelah klik
      }}
      className="relative cursor-target block text-4xl font-light"
      onMouseEnter={() => setHoveredLink(item.name)}
      onMouseLeave={() => setHoveredLink(null)}
      animate={hoveredLink === item.name ? {
        x: (mousePosition.x / window.innerWidth) * 10 - 5,
        y: (mousePosition.y / window.innerHeight) * 10 - 5
      } : { x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
      {item.name}
    </motion.a>
  ))}
</nav>


        <div className="mt-40">
          <span className="block mb-2 text-sm font-bold tracking-wide uppercase">Links</span>
          <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"></div>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              "Github",
              "LinkedIn",
              "Instagram",
              "Tiktok",
              "Email"
            ].map((link) => (
              <motion.a
                key={link}
                href="#"
                className="relative cursor-target "
                onMouseEnter={() => setHoveredLink(link)}
                onMouseLeave={() => setHoveredLink(null)}
                animate={hoveredLink === link ? {
                  x: (mousePosition.x / window.innerWidth) * 5 - 2.5,
                  y: (mousePosition.y / window.innerHeight) * 5 - 2.5
                } : { x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
              >
                {link}
              </motion.a>
            ))}
          </div>
        </div>

        <div className="flex mt-auto space-x-3">
          <button onClick={handleDarkModeToggle} className="p-2 border rounded">
            <Moon />
          </button>
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-200">
            <Globe className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
