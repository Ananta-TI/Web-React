import { useState, useEffect, useContext, memo } from "react";
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Music2,
  Globe,
  House,
  User,
  Folder,
  Award,
  Palette,
  ScanText,
  History,
  ChevronDown,
  Gamepad2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Divide as Hamburger } from 'hamburger-react';
import GooeyNav from "../components/GooeyNav"; // Sesuaikan dengan path file kamu

// ==========================================
// OPTIMASI 1: ISOLASI KOMPONEN JAM
// ==========================================
const DigitalClock = memo(({ isDarkMode }) => {
  const [currentTime, setCurrentTime] = useState("");
  
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`text-2xl font-Calculator font-bold ${isDarkMode ? "text-black" : "text-gray-300"} mx-2`}>
      {currentTime}
    </span>
  );
});

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); 
  const [isDesktopShowcaseOpen, setIsDesktopShowcaseOpen] = useState(false); 

  const showFullNavbar = !isScrolled;

  // ==========================================
  // OPTIMASI 2: SCROLL LISTENER PINTAR
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme Transition Logic
  useEffect(() => {
    if (isThemeChanging) {
      document.body.classList.add('theme-changing');
      const root = document.documentElement;
      if (isDarkMode) {
        root.style.setProperty('--circle-bg-color', 'rgb(243,244,246)');
      } else {
        root.style.setProperty('--circle-bg-color', 'rgb(39,39,42)');
      }
    } else {
      document.body.classList.remove('theme-changing');
    }
    return () => document.body.classList.remove('theme-changing');
  }, [isThemeChanging, isDarkMode]);

  // ==========================================
  // OPTIMASI 3: PELACAKAN MOUSE HANYA SAAT SIDEBAR TERBUKA
  // ==========================================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Hanya lacak mouse jika bukan mobile DAN sidebar sedang terbuka!
    // Ini menghemat puluhan render per detik saat user melihat halaman normal.
    if (!isMobile && isOpen) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile, isOpen]);

  // Body Scroll Lock
  useEffect(() => {
    document.body.style.overflow = (isMobile && isOpen) ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, isMobile]);

  const handleToggleSidebar = () => setIsOpen((prev) => !prev);

  const handleDarkModeToggle = async (event) => {
    document.body.classList.add('is-transitioning');
    if (isThemeChanging) return;
    setIsThemeChanging(true);

    if (!document.startViewTransition) {
      setIsDarkMode((prev) => !prev);
      setIsOpen(false);
      setIsThemeChanging(false);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      setIsDarkMode((prev) => !prev);
      setIsOpen(false);
    });

    try {
      await transition.ready;
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 1000,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    } catch (error) {
      console.error("Animasi gagal:", error);
    } finally {
      setIsThemeChanging(false);
    }
    document.body.classList.remove('is-transitioning');
  };

  const handleNavigation = (link) => {
    setIsOpen(false);
    setTimeout(() => {
      if (link.startsWith("#")) {
        const element = document.querySelector(link);
        if (element) {
          const headerOffset = 10;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      } else {
        navigate(link);
      }
    }, 100);
  };

  const getViewportHeight = () => typeof window !== "undefined" ? window.innerHeight : 800;
  const initialPath = `M100 0 L100 ${getViewportHeight()} Q-100 ${getViewportHeight() / 2} 100 0`;
  const targetPath = `M100 0 L100 ${getViewportHeight()} Q100 ${getViewportHeight() / 2} 100 0`;

  const curveVariants = {
    initial: { d: initialPath },
    enter: { d: targetPath, transition: { duration: isMobile ? 0.6 : 1, ease: [0.76, 0, 0.24, 1] } },
    exit: { d: initialPath, transition: { duration: isMobile ? 0.4 : 0.8, ease: [0.76, 0, 0.24, 1] } },
  };

  return (
    <div className="relative">
      {/* Top Bar / Navbar */}
      <div 
        className={`fixed z-[60] transition-all duration-500 ease-in-out flex items-center justify-between pointer-events-none ${
          showFullNavbar 
            ? `top-0 left-0 right-0 px-6 py-5 md:px-12 md:py-6 w-full ${isDarkMode ? "bg-transparent " : "bg-transparent"}` 
            : "top-4 right-4 left-4 md:right-8 md:left-8"
        }`}
      >
        {/* Logo */}
        <span 
          onClick={() => handleNavigation("/")}
          className={`text-2xl font-bold p-0 pointer-events-auto cursor-none cursor-target transition-colors ${isDarkMode ? "text-white" : "text-zinc-800"}`}
        >
        </span>

        {/* Full Desktop Navbar Links */}
        <AnimatePresence>
          {showFullNavbar && !isMobile && (
            <motion.nav 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="hidden md:flex gap-6 lg:gap-8 items-center top-8 pointer-events-auto absolute left-1/2 -translate-x-1/2"
            >
              {/* CEK KONDISI HALAMAN: Apakah ini halaman Showcase atau bukan? */}
              {["/all-projects", "/certificates", "/Scanner", "/art", "/activity"].includes(location.pathname) ? (
                <>
                  <button
                    onClick={() => { handleNavigation("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className={`relative group px-2 py-1 text-sm font-bold uppercase tracking-widest cursor-none cursor-target transition-colors duration-300 ${
                      isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <span>Home</span>
                    <span className={`absolute bottom-0 left-1/2 w-0 h-[2px] -translate-x-1/2 transition-all duration-300 group-hover:w-full ${isDarkMode ? "bg-white" : "bg-zinc-900"}`}></span>
                  </button>
                  
                  <div className={`h-4 w-[1px] ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`}></div>
                  
                  {[
                    { name: "Certificates", link: "/certificates" },
                    { name: "All Projects", link: "/all-projects" },
                    { name: "Scanner", link: "/Scanner" },
                    { name: "Art", link: "/art" },
                    { name: "Activity", link: "/activity" },
                  ].map((item) => {
                    const isActive = location.pathname === item.link;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.link)}
                        className={`relative group px-2 py-1 text-sm font-bold uppercase tracking-widest cursor-none cursor-target transition-colors duration-300 flex items-center gap-2 ${
                          isActive 
                            ? (isDarkMode ? "text-emerald-400" : "text-emerald-600") 
                            : (isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900")
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <motion.span 
                            layoutId="activeDot"
                            className="absolute -top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          />
                        )}
                        {!isActive && (
                          <span className={`absolute bottom-0 left-1/2 w-0 h-[2px] -translate-x-1/2 transition-all duration-300 group-hover:w-full ${isDarkMode ? "bg-white" : "bg-zinc-900"}`}></span>
                        )}
                      </button>
                    );
                  })}
                </>

              ) : (
                <>
                  {[
                    { name: "Home", link: "/" },
                    { name: "About", link: "#about" },
                    { name: "Projects", link: "#projects" }
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.link)}
                      className={`relative group px-2 py-1 text-sm font-bold uppercase tracking-widest cursor-none cursor-target transition-colors duration-300 ${
                        isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className={`absolute bottom-0 left-1/2 w-0 h-[2px] -translate-x-1/2 transition-all duration-300 group-hover:w-full ${isDarkMode ? "bg-white" : "bg-zinc-900"}`}></span>
                    </button>
                  ))}

                  <div className="relative py-2">
                    <button
                      onClick={() => setIsDesktopShowcaseOpen(!isDesktopShowcaseOpen)}
                      className={`relative group px-2 py-1 flex items-center gap-1 text-sm font-bold uppercase tracking-widest cursor-none cursor-target transition-colors duration-300 ${
                        isDarkMode 
                          ? (isDesktopShowcaseOpen ? "text-white" : "text-zinc-400 hover:text-white") 
                          : (isDesktopShowcaseOpen ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900")
                      }`}
                    >
                      <span>Showcase</span>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-300 ${isDesktopShowcaseOpen ? "rotate-180" : "rotate-0"}`} 
                      />
                      <span className={`absolute bottom-0 left-1/2 w-0 h-[2px] -translate-x-1/2 transition-all duration-300 group-hover:w-full ${isDarkMode ? "bg-white" : "bg-zinc-900"}`}></span>
                    </button>

                    <AnimatePresence>
                      {isDesktopShowcaseOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(4px)" }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute top-[120%] left-1/2 -translate-x-1/2 w-56 p-2 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border ${
                            isDarkMode 
                              ? "bg-zinc-900/80 border-zinc-700/50 shadow-black/50" 
                              : "bg-white/90 border-gray-200/50 shadow-gray-200/50"
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            {[
                              { name: "Certificates", link: "/certificates", icon: <Award size={16} /> },
                              { name: "All Projects", link: "/all-projects", icon: <Folder size={16} /> },
                              { name: "Scanner", link: "/Scanner", icon: <ScanText size={16} /> },
                              { name: "Art", link: "/art", icon: <Palette size={16} /> },
                              { name: "Activity", link: "/activity", icon: <Gamepad2 size={16} /> },
                            ].map((sub, index) => (
                              <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                                key={sub.name}
                                onClick={() => {
                                  handleNavigation(sub.link);
                                  setIsDesktopShowcaseOpen(false);
                                }}
                                className={`group flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-bold tracking-wider cursor-none cursor-target transition-all duration-200 ${
                                  isDarkMode 
                                    ? "text-zinc-300 hover:bg-zinc-800 hover:text-white" 
                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                }`}
                              >
                                <span className="transform transition-transform duration-200 group-hover:translate-x-1">{sub.name}</span>
                                <span className={`transform transition-transform duration-200 group-hover:scale-110 ${isDarkMode ? "text-zinc-500 group-hover:text-emerald-400" : "text-zinc-400 group-hover:text-emerald-600"}`}>
                                  {sub.icon}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => handleNavigation("#contact")}
                    className={`relative group px-2 py-1 text-sm font-bold uppercase tracking-widest cursor-none cursor-target transition-colors duration-300 ${
                      isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <span>Contact</span>
                    <span className={`absolute bottom-0 left-1/2 w-0 h-[2px] -translate-x-1/2 transition-all duration-300 group-hover:w-full ${isDarkMode ? "bg-white" : "bg-zinc-900"}`}></span>
                  </button>
                </>
              )}

              <div className={`h-4 w-[1px] ml-2 ${isDarkMode ? "bg-zinc-700" : "bg-gray-300"}`}></div>
              
              <button
                onClick={handleDarkModeToggle}
                disabled={isThemeChanging}
                className="relative group p-1.5 cursor-none cursor-target focus:outline-none"
              >
                <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-[38px] h-[38px] transition-transform duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? "opacity-70 hover:opacity-100" : "opacity-60 hover:opacity-100"}`}>
                  <motion.g animate={{ rotate: isDarkMode ? -180 : 0 }} transition={{ duration: 0.5 }}>
                    <path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill={isDarkMode ? "white" : "black"} />
                    <path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill={isDarkMode ? "white" : "black"} />
                  </motion.g>
                  <motion.path animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.5 }} d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z" fill={isDarkMode ? "black" : "white"} />
                </svg>
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Floating Hamburger Icon */}
        <motion.div 
          initial={false}
          animate={{
            opacity: showFullNavbar && !isMobile ? 0 : 1,
            scale: showFullNavbar && !isMobile ? 0.5 : 1,
            x: showFullNavbar && !isMobile ? 40 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          whileHover={showFullNavbar && !isMobile ? {} : { scale: 1.08 }}
          whileTap={showFullNavbar && !isMobile ? {} : { scale: 0.85 }}
          className={`pointer-events-auto p-2 cursor-none cursor-target rounded-full shadow-xl ${
            showFullNavbar && !isMobile 
              ? "absolute right-12 pointer-events-none" 
              : "relative"
          } ${isDarkMode ? 'bg-zinc-100 hover:bg-white' : 'bg-zinc-900 hover:bg-zinc-800'}`}
        >
          <Hamburger
            toggled={isOpen}
            toggle={setIsOpen}
            color={isDarkMode ? '#18181b' : 'white'}
            size={20}
            duration={0.4}
            easing="ease-out"
          />
        </motion.div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:bg-black/20" onClick={handleToggleSidebar} />
      )}

      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full z-50 flex flex-row"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: isMobile ? 0.6 : 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* SVG Curve Effect */}
            <motion.svg className="w-[99px] h-full" xmlns="http://www.w3.org/2000/svg">
              <motion.path
                fill={isDarkMode ? "rgb(243,244,246)" : "rgb(39,39,42)"}
                variants={curveVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              />
            </motion.svg>

            {/* Menu Panel */}
            <div
              className={`h-full ${isMobile ? "w-screen" : "w-[480px]"} ${
                isDarkMode ? "bg-gray-100 text-gray-900" : "bg-zinc-800 text-white"
              } p-6 md:p-8 flex flex-col overflow-hidden`}
            >
              <div className="flex-none">
                <div className="flex items-center justify-between mt-8 md:mt-10 mb-5">
                  <span className="text-lg md:text-xl font-semibold tracking-wide uppercase">Navigation</span>
                  {/* PANGGIL KOMPONEN JAM OPTIMAL DI SINI */}
                  <DigitalClock isDarkMode={isDarkMode} />
                </div>
                <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800/20 dark:bg-zinc-400/20"></div>
              </div>

              <nav className="flex-1 space-y-4 md:space-y-6 ">
                {["/all-projects", "/certificates", "/Scanner", "/art", "/activity"].includes(location.pathname) ? (
                  <div className="flex flex-col space-y-6 ">
                    {[
                      { name: "Certificates", link: "/certificates", icon: <Award size={32} /> },
                      { name: "All Projects", link: "/all-projects", icon: <Folder size={32} /> },
                      { name: "Scanner", link: "/Scanner", icon: <ScanText size={32} /> },
                      { name: "Art", link: "/art", icon: <Palette size={32} /> },
                      { name: "Activity", link: "/activity", icon: <Gamepad2 size={32} /> },
                    ]
                      .filter((item) => location.pathname !== item.link)
                      .map((item, index) => (
                        <motion.button
                          key={item.name}
                          onClick={() => handleNavigation(item.link)}
                          className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl transition-transform flex items-center justify-between w-full"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                        >
                          <span>{item.name}</span>
                          {item.icon}
                        </motion.button>
                      ))}
                    <motion.button
                      onClick={() => { handleNavigation("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl pt-4 border-t border-zinc-500/20 w-full text-left"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.4 } }}
                    >
                      ← Back to Home
                    </motion.button>
                  </div>
                ) : (
                  [
                    { name: "Home", link: "#home", style: <House size={32} /> },
                    { name: "About", link: "#about", style: <User size={32} /> },
                    { name: "Projects", link: "#projects", style: <Folder size={32} /> },
                    {
                      name: "Showcase",
                      isDropdown: true,
                      style: <motion.div animate={{ rotate: isShowcaseOpen ? 180 : 0 }}><ChevronDown size={32} /></motion.div>,
                      subItems: [
                        { name: "Certificates", link: "/certificates", icon: <Award size={22} /> },
                        { name: "Scanner", link: "/Scanner", icon: <ScanText size={22} /> },
                        { name: "Art", link: "/art", icon: <Palette size={22} /> },
                        { name: "Activity", link: "/activity", icon: <Gamepad2 size={22} /> },
                      ],
                    },
                    { name: "Contact", link: "#contact", style: <Mail size={32} /> },
                  ].map((item, index) => (
                    <div key={item.name} className="flex flex-col w-full ">
                      <motion.button
                        onClick={() => item.isDropdown ? setIsShowcaseOpen(!isShowcaseOpen) : handleNavigation(item.link)}
                        className="cursor-target cursor-none relative flex items-center text-2xl md:text-4xl font-lyrae w-full py-1"
                        onMouseEnter={() => !isMobile && setHoveredLink(item.name)}
                        onMouseLeave={() => !isMobile && setHoveredLink(null)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                      >
                        <span>{item.name}</span>
                        <div className="ml-auto">{item.style}</div>
                      </motion.button>
                      <AnimatePresence>
                        {item.isDropdown && isShowcaseOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col pl-6 space-y-3 mt-2 border-l-2 border-zinc-500/30"
                          >
                            {item.subItems.map((sub) => (
                              <button key={sub.name} onClick={() => handleNavigation(sub.link)} className="flex cursor-target cursor-none items-center justify-between text-xl md:text-2xl font-lyrae text-zinc-400 hover:text-current transition-colors">
                                <span>{sub.name}</span>
                                {sub.icon}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </nav>

              <div className="flex-none mt-auto">
                <span className="block mb-2 text-sm font-bold tracking-wide uppercase">Links</span>
                <div className="h-[1px] w-full bg-zinc-800/20 dark:bg-zinc-400/20 mb-6"></div>
                <div className="flex flex-wrap gap-4 font-mono font-bold mb-8">
                  {[
                    { name: "Github", url: "https://github.com/Ananta-TI", icon: <Github size={18} /> },
                    { name: "LinkedIn", url: "https://www.linkedin.com/in/ananta-firdaus-93448328b/", icon: <Linkedin size={18} /> },
                    { name: "Instagram", url: "https://instagram.com/ntakunti_14", icon: <Instagram size={18} /> },
                    { name: "Tiktok", url: "https://tiktok.com/@ntakunti_14", icon: <Music2 size={18} /> },
                    { name: "Email", url: "mailto:anantafirdaus14@gmail.com", icon: <Mail size={18} /> },
                  ].map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      className={`relative flex items-center gap-2 cursor-target cursor-none hover:underline transition-colors ${isDarkMode ? "text-gray-900 hover:text-gray-600" : "text-white hover:text-gray-300"}`}
                      onMouseEnter={() => setHoveredLink(link.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                      animate={hoveredLink === link.name ? { x: (mousePosition.x / window.innerWidth) * 5 - 2.5, y: (mousePosition.y / window.innerHeight) * 5 - 2.5 } : { x: 0, y: 0 }}
                    >
                      {link.icon} {link.name}
                    </motion.a>
                  ))}
                </div>

                <div className="flex space-x-3 mb-2">
                  <button
                    onClick={handleDarkModeToggle}
                    disabled={isThemeChanging}
                    className={`p-2 border rounded cursor-target cursor-none transition-all hover:scale-105 active:scale-95 ${isDarkMode ? "border-gray-300" : "border-zinc-600"}`}
                  >
                    <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                      <motion.g animate={{ rotate: isDarkMode ? -180 : 0 }} transition={{ duration: 0.5 }}>
                        <path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill={isDarkMode ? "white" : "black"} />
                        <path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill={isDarkMode ? "white" : "black"} />
                      </motion.g>
                      <motion.path animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.5 }} d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z" fill={isDarkMode ? "black" : "white"} />
                    </svg>
                  </button>
                  <button className={`p-2 border rounded hover:bg-gray-200 ${isDarkMode ? "border-gray-300" : "border-zinc-600"}`}>
                    <Globe className={`w-5 h-5 ${isDarkMode ? "text-gray-900" : "text-white"}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}