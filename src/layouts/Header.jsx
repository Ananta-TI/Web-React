import { useState, useEffect, useContext } from "react";
import { Menu, X, Moon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

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
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // Prevent body scroll when menu is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  const handleToggleSidebar = () => setIsOpen((prev) => !prev);
  const handleDarkModeToggle = () => setIsDarkMode((prev) => !prev);

  // Path untuk animasi curve - responsive untuk mobile
  const getViewportHeight = () => {
    return typeof window !== 'undefined' ? window.innerHeight : 800;
  };

  const initialPath = `M100 0 L100 ${getViewportHeight()} Q-100 ${getViewportHeight() / 2} 100 0`;
  const targetPath = `M100 0 L100 ${getViewportHeight()} Q100 ${getViewportHeight() / 2} 100 0`;

  const curveVariants = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: isMobile ? 0.6 : 1, ease: [0.76, 0, 0.24, 1] }
    },
    exit: {
      d: initialPath,
      transition: { duration: isMobile ? 0.4 : 0.8, ease: [0.76, 0, 0.24, 1] }
    }
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
          <img
            src={isDarkMode ? "../img/logo1.png" : "../img/logo3.png"}
            alt="Ananta Firdaus"
            className="object-cover h-12 w-auto md:h-20 md:w-30"
          />
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
              ease: [0.76, 0, 0.24, 1] 
            }}
          >
            {/* SVG Curve - Hidden on mobile for better performance */}
            {!isMobile && (
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
            )}

            {/* Menu Panel */}
            <div
              className={`h-full ${
                isMobile ? 'w-screen' : 'w-[480px]'
              } ${
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
                {[
                  { name: "Home", link: "#home" },
                  { name: "About", link: "#About" },
                  { name: "Projects", link: "#projects" },
                  { name: "Contact", link: "#contact" }
                ].map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.link}
                    onClick={(e) => {
                      e.preventDefault();
                      const section = document.querySelector(item.link);
                      if (section) {
                        section.scrollIntoView({
                          behavior: "smooth",
                          block: "start"
                        });
                      }
                      setIsOpen(false);
                    }}
                    className="cursor-target cursor-none relative block text-2xl md:text-4xl font-light touch-manipulation active:scale-95 transition-transform"
                    onMouseEnter={() => !isMobile && setHoveredLink(item.name)}
                    onMouseLeave={() => !isMobile && setHoveredLink(null)}
                    animated={
                      !isMobile && hoveredLink === item.name
                        ? {
                            x: (mousePosition.x / window.innerWidth) * 10 - 5,
                            y: (mousePosition.y / window.innerHeight) * 10 - 5
                          }
                        : { x: 0, y: 0 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 10
                    }}
                    // Mobile tap animations
                    whileTap={isMobile ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </nav>

              {/* Social Links */}
              <div className="mt-20 sm:mt-40">
                <span className="block  mb-2 text-sm font-bold tracking-wide uppercase">
                  Links
                </span>
                <div className="h-[1px] w-full mt-2 mb-6 bg-zinc-800 dark:bg-zinc-400"></div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {["Github", "LinkedIn", "Instagram", "Tiktok", "Email"].map(
                    (link) => (
                      <motion.a
                        key={link}
                        href="#"
                        className="relative cursor-target cursor-none"
                        onMouseEnter={() => setHoveredLink(link)}
                        onMouseLeave={() => setHoveredLink(null)}
                        animate={
                          hoveredLink === link
                            ? {
                                x:
                                  (mousePosition.x / window.innerWidth) * 5 -
                                  2.5,
                                y:
                                  (mousePosition.y / window.innerHeight) * 5 -
                                  2.5
                              }
                            : { x: 0, y: 0 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 10
                        }}
                      >
                        {link}
                      </motion.a>
                    )
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex mt-auto space-x-3">
                <button
                  onClick={handleDarkModeToggle}
                  className="p-2 border rounded"
                >
                  <Moon />
                </button>
                <button className="p-2 border border-gray-300 rounded hover:bg-gray-200">
                  <Globe className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}