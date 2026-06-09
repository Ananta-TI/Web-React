import { useContext, useEffect, useMemo, useRef, useState, memo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { FolderOpen, X } from "lucide-react";
import { createPortal } from "react-dom";
import DecryptedText from "../components/Shared/DecryptedText";

const ART_ITEMS = [
  { image: "art/1.jpg", year: "2024" },
  { image: "art/2.jpg", year: "2025" },
  { image: "art/3.jpg", year: "2025" },
  { image: "art/4.jpg", year: "2025" },
  { image: "art/5.jpg", year: "2025" },
  { image: "art/6.jpg", year: "2025" },
  { image: "art/7.jpg", year: "2025" },
  { image: "art/8.jpg", year: "2025" },
  { image: "art/9.jpg", year: "2025" },
  { image: "art/10.jpg", year: "2025" },
  { image: "art/11.jpg", year: "2025" },
  { image: "art/12.jpg", year: "2025" },
  { image: "art/13.jpg", year: "2025" },
  { image: "art/14.jpg", year: "2025" },
  { image: "art/15.jpg", year: "2025" },
  { image: "art/16.jpg", year: "2025" },
  { image: "art/17.jpg", year: "2025" },
  { image: "art/18.jpg", year: "2025" },
  { image: "art/19.jpg", year: "2025" },
  { image: "art/20.jpg", year: "2025" },
  { image: "art/21.jpg", year: "2025" },
  { image: "art/22.jpg", year: "2025" },
  { image: "art/23.jpg", year: "2024" },
  { image: "art/24.jpg", year: "2025" },
  { image: "art/25.jpg", year: "2025" },
  { image: "art/26.jpg", year: "2025" },
  { image: "art/27.jpg", year: "2025" },
  { image: "art/28.jpg", year: "2025" },
  { image: "art/29.jpg", year: "2025" },
  { image: "art/30.jpg", year: "2025" },
  { image: "art/31.jpg", year: "2025" },
  { image: "art/32.jpg", year: "2025" },
  { image: "art/33.jpg", year: "2025" },
  { image: "art/34.jpg", year: "2025" },
  { image: "art/35.jpg", year: "2025" },
  { image: "art/36.jpg", year: "2025" },
  { image: "art/37.jpg", year: "2025" },
  { image: "art/38.jpg", year: "2025" },
  { image: "art/39.jpg", year: "2025" },
  { image: "art/40.jpg", year: "2025" },
  { image: "art/41.jpg", year: "2025" },
  { image: "art/42.jpg", year: "2025" },
  { image: "art/43.jpg", year: "2025" },
  { image: "art/44.jpg", year: "2025" },
  { image: "art/45.jpg", year: "2025" },
  { image: "art/46.jpg", year: "2025" },
  { image: "art/47.jpg", year: "2025" },
  { image: "art/48.jpg", year: "2025" },
  { image: "art/49.jpg", year: "2025" },
  { image: "art/50.jpg", year: "2025" },
  { image: "art/51.jpg", year: "2025" },
  { image: "art/52.jpg", year: "2025" },
  { image: "art/53.jpg", year: "2025" },
  { image: "art/54.jpg", year: "2025" },
  { image: "art/55.jpg", year: "2025" },
  { image: "art/56.jpg", year: "2026" },
];

function shuffleArt(items) {
  return items
    .map((item, index) => ({
      ...item,
      id: `${item.image}-${index}`,
      title: `Art ${index + 1}`,
      randomSort: Math.random(),
      randomRotate: Math.random() * 4 - 2,
      randomY: Math.random() * 22 + 12,
    }))
    .sort((a, b) => a.randomSort - b.randomSort)
    .map((item, index) => ({
      ...item,
      order: index,
    }));
}

const Art = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  const shouldReduceMotion = useReducedMotion();

  const [selectedArt, setSelectedArt] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isHoverCapable, setIsHoverCapable] = useState(false);

  const filteredArt = useMemo(() => {
    return shuffleArt(ART_ITEMS);
  }, []);

  useEffect(() => {
    setIsMounted(true);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    const frame = requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateHoverCapability = () => {
      setIsHoverCapable(mediaQuery.matches);
    };

    updateHoverCapability();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateHoverCapability);
    } else {
      mediaQuery.addListener(updateHoverCapability);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateHoverCapability);
      } else {
        mediaQuery.removeListener(updateHoverCapability);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedArt) {
      document.body.style.overflow = "hidden";
      window.lenis?.stop();
    } else {
      document.body.style.overflow = "";
      window.lenis?.start();
    }

    return () => {
      document.body.style.overflow = "";
      window.lenis?.start();
    };
  }, [selectedArt]);

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.15 }
        : {
            staggerChildren: 0.025,
            delayChildren: 0.05,
          },
    },
  };

  const cardVariants = {
    hidden: (art) => ({
      opacity: 0,
      y: shouldReduceMotion ? 0 : -art.randomY,
      scale: shouldReduceMotion ? 1 : 0.96,
      rotateZ: shouldReduceMotion ? 0 : art.randomRotate,
      filter: shouldReduceMotion ? "blur(0px)" : "blur(8px)",
    }),
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateZ: 0,
      filter: "blur(0px)",
      transition: shouldReduceMotion
        ? { duration: 0.15 }
        : {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          },
    },
  };

  return (
    <motion.main
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      <header
        className={`relative z-20 border-b backdrop-blur-xl ${
          isDarkMode
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-[#faf9f9]/90 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-12">
          <div className="mb-8 flex items-center justify-center sm:justify-start">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm ${
                isDarkMode
                  ? "bg-zinc-800 text-zinc-300 border border-white/5"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span className="font-medium">{filteredArt.length} Art</span>
            </div>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-4xl text-center"
          >
            <h1 className="mb-5 font-lyrae text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl">
              <DecryptedText
                text="Art & Design"
                speed={60}
                maxIterations={28}
                sequential
                animateOn="view"
              />
            </h1>

            <p
              className={`mx-auto max-w-2xl text-sm leading-relaxed sm:text-base md:text-lg font-mono ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              When code stops, creation begins. Exploring the intersection of
              logic and digital art.
            </p>
          </motion.div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="columns-1 gap-1 space-y-3 sm:columns-2 lg:columns-3 xl:columns-4"
        >
          {filteredArt.map((art, index) => (
            <ArtCard
              key={art.id}
              art={art}
              index={index}
              isDarkMode={isDarkMode}
              isHoverCapable={isHoverCapable}
              shouldReduceMotion={shouldReduceMotion}
              variants={cardVariants}
              onOpen={() => setSelectedArt(art)}
            />
          ))}
        </motion.div>
      </section>

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {selectedArt && (
              <ArtModal
                art={selectedArt}
                onClose={() => setSelectedArt(null)}
                isHoverCapable={isHoverCapable}
                shouldReduceMotion={shouldReduceMotion}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </motion.main>
  );
};

const ArtCard = memo(function ArtCard({
  art,
  index,
  isDarkMode,
  isHoverCapable,
  shouldReduceMotion,
  variants,
  onOpen,
}) {
  return (
    <motion.button
      type="button"
      custom={art}
      variants={variants}
      whileHover={
        isHoverCapable && !shouldReduceMotion
          ? {
              y: -6,
              transition: { duration: 0.2, ease: "easeOut" },
            }
          : undefined
      }
      onClick={onOpen}
      className={`group mb-1 block w-full break-inside-avoid overflow-hidden rounded-2xl border text-left shadow-sm outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isDarkMode
          ? "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
          : "border-black/10 bg-white hover:bg-zinc-50"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={art.image}
          alt={art.title}
          className="block h-auto w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.015] cursor-target cursor-none"
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index < 4 ? "high" : "auto"}
          draggable="false"
        />

        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
            {/* <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-950 shadow-sm backdrop-blur">
              {art.year}
            </span> */}

            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur">
              Preview
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
});

const ArtModal = ({ art, onClose, isHoverCapable, shouldReduceMotion }) => {
  const modalRef = useRef(null);

  const springConfig = {
    damping: 22,
    stiffness: 140,
    mass: 0.8,
  };

  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);
  const scale = useSpring(1, springConfig);

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  const handleMouseMove = (event) => {
    if (!isHoverCapable || shouldReduceMotion || !modalRef.current) return;

    const rect = modalRef.current.getBoundingClientRect();

    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    const rotateAmount = 7;

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmount);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmount);
    scale.set(1.015);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close art preview"
        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <X className="h-5 w-5" />
      </button>

      <motion.figure
        ref={modalRef}
        className="relative flex max-h-[90svh] w-full max-w-6xl items-center justify-center"
        style={{ perspective: "1000px" }}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 18 }}
        animate={shouldReduceMotion ? false : { opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onClick={(event) => event.stopPropagation()}
      >
        <motion.img
          src={art.image}
          alt={art.title}
          className="max-h-[88svh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
          style={
            isHoverCapable && !shouldReduceMotion
              ? {
                  rotateX,
                  rotateY,
                  scale,
                  transformStyle: "preserve-3d",
                }
              : undefined
          }
          draggable="false"
        />
      </motion.figure>
    </motion.div>
  );
};

export default Art;