import { useContext, useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { FolderOpen, X } from "lucide-react";
import { createPortal } from "react-dom";

const Art = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [filteredArt, setFilteredArt] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

// ✅ Data art
const Art = [
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
];

  useEffect(() => {
    if (selectedCert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCert]);
// Di dalam AllProjects.jsx
useEffect(() => {
  // Delay 100ms memberikan waktu bagi konten untuk ter-render sempurna
  const timer = setTimeout(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Gunakan instant agar tidak balapan dengan smooth scroll
    });
  }, 100);

  return () => clearTimeout(timer);
}, []);
  // 🔝 Scroll ke atas saat halaman dibuka
  useEffect(() => {
    window.scrollTo(0,0);
    setFilteredArt(shuffleArray(Art));
    
    // Trigger animasi waterfall setelah komponen dimuat
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // 🔮 Variants animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  // Varians untuk efek waterfall
  const waterfallVariants = {
    hidden: { 
      opacity: 0,
      y: -50,
      scale: 0.8,
      rotateZ: Math.random() * 10 - 5 // Rotasi acak antara -5 dan 5 derajat
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateZ: 0,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease untuk efek jatuh yang lebih natural
      }
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  function shuffleArray(arr) {
    return arr
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* ===== Header ===== */}
      <div
        className={`top-0 z-40 backdrop-blur-lg border-b ${
          isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-[#faf9f9] border-gray-400"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span className="font-medium">
                {filteredArt.length} Art
              </span>
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4">
              Art & Design
            </h1>
            <p
              className={`text-lg font-mono ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}
            >
When code stops, creation begins. Exploring the intersection of logic and digital art.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ===== Art Masonry with Waterfall Effect ===== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="columns-1 sm:columns-2 lg:columns-3 gap-2 space-y-2"
        >
          <AnimatePresence>
            {filteredArt.map((cert, index) => (
              <motion.div
                key={index}
                variants={waterfallVariants}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition duration-300 cursor-target"
                style={{
                  // Delay untuk efek waterfall bertahap
                  transitionDelay: `${index * 0.05}s`,
                }}
              >
                {/* Image */}
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full rounded-t-xl transition-transform duration-500 hover:scale-[1.02]"
                    onClick={() => setSelectedCert(cert)}
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ===== Modal Preview with Advanced 3D Tilt ===== */}
      {createPortal(
        selectedCert && (
          <TiltedModal
            cert={selectedCert}
            onClose={() => setSelectedCert(null)}
            isDarkMode={isDarkMode}
          />
        ),
        document.body
      )}
    </motion.div>
  );
};

const TiltedModal = ({ cert, onClose, isDarkMode }) => {
  const ref = useRef(null);

  // Konfigurasi animasi spring biar halus
  const springConfig = { damping: 30, stiffness: 100, mass: 2 };

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);
  const scale = useSpring(1, springConfig);

  const [lastY, setLastY] = useState(0);
  const rotateAmplitude = 12;
  const scaleOnHover = 1.05;

  // 🎮 Handle pergerakan mouse
  function handleMouse(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    rotateX.set(rotationX);
    rotateY.set(rotationY);
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  // 📱 Gyroscope handler
  useEffect(() => {
    function handleOrientation(event) {
      const { beta, gamma } = event; // beta = x-axis (tilt up/down), gamma = y-axis (tilt left/right)
      if (beta == null || gamma == null) return;

      // Batasi sudut agar tidak terlalu ekstrem
      const limitedBeta = Math.max(-10, Math.min(10, beta));
      const limitedGamma = Math.max(-10, Math.min(10, gamma));

      const gyroX = (limitedBeta / 10) * -rotateAmplitude;
      const gyroY = (limitedGamma / 10) * rotateAmplitude;

      rotateX.set(gyroX);
      rotateY.set(gyroY);
    }

    // Minta izin untuk akses sensor (khusus iOS)
    if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) {
      DeviceOrientationEvent.requestPermission().then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        }
      });
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Klik luar -> tutup modal
    >
      <figure
        ref={ref}
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: "1000px" }}
        onMouseMove={handleMouse}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-zinc-800/70 text-white p-2 rounded-full hover:bg-zinc-700 transition z-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Efek Tilt */}
        <motion.div
          className="relative"
          style={{
            rotateX,
            rotateY,
            scale,
            transformStyle: "preserve-3d",
          }}
        >
          <motion.img
            src={cert.image}
            alt={cert.title}
            className="max-w-5xl w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl will-change-transform"
            style={{ transform: "translateZ(0)" }}
          />
        </motion.div>
      </figure>
    </motion.div>
  );
};

export default Art;