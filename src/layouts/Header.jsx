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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { animate, svg, stagger } from "https://esm.sh/animejs";

// import { createAnimation } from "./ThemeBtn"; // Import function untuk animasi

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  animate(svg.createDrawable(".line"), {
    draw: ["0 0", "0 1", "1 1"],
    ease: "inOutQuad",
    duration: 2000,
    delay: stagger(100),
    loop: true,
  });
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

  const handleDarkModeToggle = () => {
    // Custom animasi blur circle
    const customAnimation = `
      ::view-transition-group(root) {
        animation-timing-function: var(--expo-out);
      }

      ::view-transition-new(root) {
        mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>') center / 0 no-repeat;
        animation: scale 1s;
        animation-fill-mode: both;
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        animation-fill-mode: both;
        z-index: -1;
      }

      .dark::view-transition-new(root) {
        animation: scale 1s;
        animation-fill-mode: both;
      }

      @keyframes scale {
        to {
          mask-size: 200vmax;
        }
      }
    `;

    // Inject CSS animation
    const styleId = "theme-transition-styles";
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = customAnimation;

    // Gunakan View Transition API jika tersedia
    if (!document.startViewTransition) {
      setIsDarkMode((prev) => !prev);
      setIsOpen(false); // <- Tutup sidebar
      return;
    }

    document.startViewTransition(() => {
      setIsDarkMode((prev) => !prev);
      setIsOpen(false);
    });
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
          {/* <img
            src={isDarkMode ? "../img/logo123.png" : "../img/logo123.png"}
            alt="Ananta Firdaus"
            className="object-cover h-12 w-auto md:h-20 md:w-20"
          /> */}
        </span>
        <button
          onClick={handleToggleSidebar}
          className="p-2 text-gray-600 focus:outline-none touch-manipulation"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="p-2 rounded-full cursor-none cursor-target"
          >
            {isOpen ? (
              <X className="w-10 h-10 md:w-13 md:h-13 p-2 text-white rounded-full bg-zinc-800" />
            ) : (
              <Menu className="w-10 h-10 md:w-13 md:h-13 p-2 text-white rounded-full bg-zinc-800" />
            )}
          </motion.div>
        </button>
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
              </div>

              <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"></div>

              {/* Navigation Links */}
              <nav className="mt-6 md:mt-10 mb-1 space-y-6 md:space-y-8">
                {["/all-projects", "/certificates","/timeline"].includes(
                  location.pathname
                ) ? (
                  <>
                    {location.pathname !== "/certificates" && (
                      <motion.a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/certificates");
                          setIsOpen(false);
                        }}
                        className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform flex items-center justify-between gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.2 },
                        }}
                      >
                        <span>Certificates</span>
                        <img
                          src="/svg/badge-4.svg"
                          alt="Badge 4"
                          className={`w-12 h-12 ${isDarkMode ? "invert" : ""}`}
                        />
                      </motion.a>
                    )}

                    {location.pathname !== "/all-projects" && (
                      <motion.a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/all-projects");
                          setIsOpen(false);
                        }}
                        className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform flex items-center justify-between gap-2 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.2 },
                        }}
                      >
                        <span>All Projects</span>
                        <img
                          src="/svg/work-7.svg"
                          alt="Badge 4"
                          className={`w-12 h-12 line ${
                            isDarkMode ? "invert" : ""
                          }`}
                        />
                      </motion.a>
                    )}
                    {location.pathname !== "/timeline" && (
                      <motion.a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/timeline");
                          setIsOpen(false);
                        }}
                        className="cursor-target cursor-none relative text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform flex items-center justify-between gap-2 w-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: 0.2 },
                        }}
                      >
                        <span>Timeline</span>
                        <img
                          src="/svg/work-7.svg"
                          alt="Badge 4"
                          className={`w-12 h-12 line ${
                            isDarkMode ? "invert" : ""
                          }`}
                        />
                      </motion.a>
                    )}

                    <motion.a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/");
                        setIsOpen(false);
                      }}
                      className="cursor-target cursor-none relative block text-2xl font-lyrae md:text-4xl touch-manipulation active:scale-95 transition-transform"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    >
                      ← Back to Home
                    </motion.a>
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
                      name: "Timeline",
                      link: "/timeline",
                      style: <History size={32} strokeWidth={2} />,
                    },
                    {
                      name: "Contact",
                      link: "#contact",
                      style: <Mail size={32} />,
                    },
                  ].map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.link}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.link.startsWith("#")) {
                          const section = document.querySelector(item.link);
                          if (section) {
                            section.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        } else {
                          navigate(item.link);
                        }
                        setIsOpen(false);
                      }}
                      className="cursor-target cursor-none relative flex items-center text-2xl md:text-4xl font-lyrae touch-manipulation active:scale-95 transition-transform"
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
                      <div className="ml-auto ">{item.style}</div>
                    </motion.a>
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
                    ,
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
                  className="p-2 border rounded cursor-target cursor-none transition-all hover:scale-105 active:scale-95"
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
