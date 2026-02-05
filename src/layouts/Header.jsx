import { useState, useEffect, useContext } from "react";
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  Music2,
  Menu,
  X,
  Globe,
  House,
  User,
  Folder,
  Award,
  History,
  ScanText 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Divide as Hamburger } from 'hamburger-react'

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const [currentTime, setCurrentTime] = useState("");
  const [isThemeChanging, setIsThemeChanging] = useState(false);

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
useEffect(() => {
  if (isThemeChanging) {
    document.body.classList.add('theme-changing');
    // Atur warna lingkaran berdasarkan tema baru
    const root = document.documentElement;
    if (isDarkMode) { // Ini adalah nilai tema SEBELUM berubah
      root.style.setProperty('--circle-bg-color', 'rgb(243,244,246)'); // Warna terang
    } else {
      root.style.setProperty('--circle-bg-color', 'rgb(39,39,42)'); // Warna gelap
    }
  } else {
    document.body.classList.remove('theme-changing');
  }
  
  // Bersihkan saat komponen unmount
  return () => {
    document.body.classList.remove('theme-changing');
  };
}, [isThemeChanging, isDarkMode]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e) => {
      if (!isMobile) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const handleToggleSidebar = () => setIsOpen((prev) => !prev);

const handleDarkModeToggle = async (event) => {
  document.body.classList.add('is-transitioning'); // Tambah class
    // 1. Cegah spam klik
    if (isThemeChanging) return;
    setIsThemeChanging(true);

    // 2. Cek support browser
    if (!document.startViewTransition) {
      setIsDarkMode((prev) => !prev);
      setIsOpen(false);
      setIsThemeChanging(false);
      return;
    }

    // 3. Ambil koordinat tombol untuk titik tengah lingkaran
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // 4. Hitung radius terjauh agar lingkaran memenuhi layar
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 5. Mulai Transisi
    const transition = document.startViewTransition(() => {
      // Perubahan state terjadi DI SINI
      setIsDarkMode((prev) => !prev);
      setIsOpen(false); 
    });

    // 6. Tunggu DOM siap, lalu jalankan animasi
    try {
      await transition.ready;

      // LOGIKA YANG DIPERBAIKI:
      // Kita selalu menganimasikan view BARU (::view-transition-new)
      // agar clip-path membesar dari 0 ke Full.
      // Tidak peduli itu dark->light atau light->dark, efeknya sama: "Expand"
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
          pseudoElement: "::view-transition-new(root)", // Kuncinya di sini
        }
      );
    } catch (error) {
      console.error("Animasi gagal:", error);
    } finally {
      setIsThemeChanging(false);
    }
    document.body.classList.remove('is-transitioning'); // Hapus class
  };

  const handleNavigation = (link) => {
    setIsOpen(false);
    
    // Delay sedikit untuk animasi close
    setTimeout(() => {
      if (link.startsWith("#")) {
        // Smooth scroll ke section
        const element = document.querySelector(link);
        if (element) {
          const headerOffset = 10;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else {
        // Navigate ke route lain
        navigate(link);
      }
    }, 100); // Sesuaikan dengan durasi animasi close
  };

  const getViewportHeight = () => {
    return typeof window !== "undefined" ? window.innerHeight : 800;
  };

  const initialPath = `M100 0 L100 ${getViewportHeight()} Q-100 ${
    getViewportHeight() / 2
  } 100 0`;
  const targetPath = `M100 0 L100 ${getViewportHeight()} Q100 ${
    getViewportHeight() / 2
  } 100 0`;

  const curveVariants = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: isMobile ? 0.6 : 1, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: initialPath,
      transition: { duration: isMobile ? 0.4 : 0.8, ease: [0.76, 0, 0.24, 1] },
    },
  };

  return (
    <div className="relative">
      {/* Top Bar */}
      <div className="fixed flex items-center justify-between right-4 left-4 z-[60] md:right-4 md:left-4">
        <span
          className={`text-2xl font-bold p-0 ${
            isDarkMode ? "text-white" : "text-zinc-800"
          }`}
        >
          {/* Logo */}
        </span>
        <div
          className={`p-2 mt-1 cursor-none pointer-none cursor-target rounded-full transition-colors ${
            isDarkMode ? 'bg-gray-100' : 'bg-zinc-800'
          }`}
        >
          <Hamburger
            className="hover:cursor-none hover:pointer-none cursor-target"
            toggled={isOpen}
            toggle={setIsOpen}
            color={isDarkMode ? '#18181b' : 'white'}
            duration={0.4}
            easing="ease-in"/>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:bg-black/20"
          onClick={handleToggleSidebar}
        />
      )}

      {/* Sidebar dengan Curve */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 h-full z-50 flex flex-row"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{
              duration: isMobile ? 0.6 : 0.8,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* SVG Curve */}
            <motion.svg
              className="w-[99px] h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
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
                isDarkMode
                  ? "bg-gray-100 text-gray-900"
                  : "bg-zinc-800 text-white"
              } p-6 md:p-8 flex flex-col overflow-y-auto`}
            >
              <div className="flex items-center justify-between mt-8 md:mt-10 mb-5">
                <span className="text-lg md:text-xl font-semibold tracking-wide uppercase">
                  Navigation
                </span>
                <span
                  className={`text-2xl font-Calculator font-bold ${
                    isDarkMode ? "text-black" : "text-gray-300"
                  } mx-2`}
                >
                  {currentTime}
                </span>
              </div>

              <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"></div>

              {/* Navigation Links */}
              <nav className="mt-6 md:mt-10 mb-1 space-y-6 md:space-y-8">
                {["/all-projects", "/certificates","/Scanner"].includes(
                  location.pathname
                ) ? (
                  <>
                    {location.pathname !== "/certificates" && (
                      <motion.button
                        onClick={() => handleNavigation("/certificates")}
                        className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform flex items-center justify-between gap-2 w-full text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.2 },
                        }}
                      >
                        <span>Certificates</span>
                        <Award size={32} strokeWidth={2} />
                      </motion.button>
                    )}

                    {location.pathname !== "/all-projects" && (
                      <motion.button
                        onClick={() => handleNavigation("/all-projects")}
                        className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform flex items-center justify-between gap-2 w-full text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.2 },
                        }}
                      >
                        <span>All Projects</span>
                        <Folder size={32} strokeWidth={2} />
                      </motion.button>
                    )}
                    
                    {location.pathname !== "/Scanner" && (
                      <motion.button
                        onClick={() => handleNavigation("/Scanner")}
                        className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform flex items-center justify-between gap-2 w-full text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.2 },
                        }}
                      >
                        <span>Scanner</span>
                        <ScanText size={32} strokeWidth={2} />
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => {
                        handleNavigation("/");
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }}
                      className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform w-full text-left"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
                    >
                      ← Back to Home
                    </motion.button>
                  </>
                ) : (
                  [
                    {
                      name: "Home",
                      link: "#home",
                      style: <House size={32} strokeWidth={2} />,
                    },
                    {
                      name: "About",
                      link: "#about",
                      style: <User size={32} strokeWidth={2} />,
                    },
                    {
                      name: "Projects",
                      link: "#projects",
                      style: <Folder size={32} strokeWidth={2} />,
                    },
                    {
                      name: "Certificates",
                      link: "/certificates",
                      style: <Award size={32} strokeWidth={2} />,
                    },
                    {
                      name: "Scanner",
                      link: "/Scanner",
                      style: <ScanText  size={32} strokeWidth={2} />,
                    },
                    {
                      name: "Contact",
                      link: "#contact",
                      style: <Mail size={32} />,
                    },
                  ].map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavigation(item.link)}
                      className="cursor-target cursor-none relative flex items-center text-2xl md:text-4xl font-lyrae touch-manipulation active:scale-95 transition-transform w-full text-left"
                      onMouseEnter={() =>
                        !isMobile && setHoveredLink(item.name)
                      }
                      onMouseLeave={() => !isMobile && setHoveredLink(null)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.1 },
                      }}
                    >
                      <span>{item.name}</span>
                      <div className="ml-auto">{item.style}</div>
                    </motion.button>
                  ))
                )}
              </nav>

              {/* Social Links */}
              <div className="mt-20 sm:mt-40">
                <span className="block mb-2 text-sm font-bold tracking-wide uppercase">
                  Links
                </span>
                <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"></div>
                <div className="flex flex-wrap gap-4 font-mono font-bold">
                  {[
                    {
                      name: "Github",
                      url: "https://github.com/Ananta-TI",
                      icon: <Github size={18} />,
                    },
                    {
                      name: "LinkedIn",
                      url: "https://www.linkedin.com/in/ananta-firdaus-93448328b/",
                      icon: <Linkedin size={18} />,
                    },
                    {
                      name: "Instagram",
                      url: "https://instagram.com/ntakunti_14",
                      icon: <Instagram size={18} />,
                    },
                    {
                      name: "Tiktok",
                      url: "https://tiktok.com/@ntakunti_14",
                      icon: <Music2 size={18} />,
                    },
                    {
                      name: "Email",
                      url: "mailto:anantafirdaus14@gmail.com?subject=Portfolio%20Inquiry&body=Halo%20Ananta,%0A%0ASaya%20melihat%20portfolio%20anda%20dan%20ingin%20berdiskusi%20lebih%20lanjut.",
                      icon: <Mail size={18} />,
                    },
                  ].map((link) => (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`relative flex items-center gap-2 cursor-target cursor-none hover:underline transition-colors ${
                        isDarkMode
                          ? "text-gray-900 hover:text-gray-600"
                          : "text-white hover:text-gray-300"
                      }`}
                      onMouseEnter={() => setHoveredLink(link.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                      animate={
                        hoveredLink === link.name
                          ? {
                              x:
                                (mousePosition.x / window.innerWidth) * 5 - 2.5,
                              y:
                                (mousePosition.y / window.innerHeight) * 5 -
                                2.5,
                            }
                          : { x: 0, y: 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                      }}
                    >
                      {link.icon}
                      {link.name}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex mt-auto space-x-3">
                <button
                 onClick={handleDarkModeToggle}
  disabled={isThemeChanging}
  className={`theme-toggle-btn p-2 border rounded cursor-target cursor-none transition-all hover:scale-105 active:scale-95 ${ // Tambahkan kelas theme-toggle-btn
    isThemeChanging ? "opacity-50 cursor-not-allowed" : ""
  }`}
  style={{
    borderColor: isDarkMode ? "#d1d5db" : "#52525b",
    backgroundColor: isDarkMode ? "transparent" : "transparent",
  }}
>
                  <svg
                    viewBox="0 0 240 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                  >
                    <motion.g
                      animate={{ rotate: isDarkMode ? -180 : 0 }}
                      transition={{ ease: "easeInOut", duration: 0.5 }}
                    >
                      <path
                        d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5"
                        fill={isDarkMode ? "white" : "black"}
                      />
                      <path
                        d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5"
                        fill={isDarkMode ? "white" : "black"}
                      />
                    </motion.g>
                    <motion.path
                      animate={{ rotate: isDarkMode ? 180 : 0 }}
                      transition={{ ease: "easeInOut", duration: 0.5 }}
                      d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z"
                      fill={isDarkMode ? "black" : "white"}
                    />
                  </svg>
                </button>
                <button
                  className={`p-2 border rounded hover:bg-gray-200 ${
                    isDarkMode ? "border-gray-300" : "border-zinc-600"
                  }`}
                >
                  <Globe
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-900" : "text-white"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}