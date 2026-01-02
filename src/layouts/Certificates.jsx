import { useContext, useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { FolderOpen, X } from "lucide-react";
import { createPortal } from "react-dom";

const Certificates = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);

  // ✅ Data sertifikat
 const certificates = [
  { image: "sertifikat/1.jpg",  year: "2024" },
  { image: "sertifikat/2.jpg",  year: "2025" },
  { image: "sertifikat/3.jpeg",  year: "2025" },
  { image: "sertifikat/4.jpeg",  year: "2025" },
  { image: "sertifikat/5.jpeg",  year: "2025" },
  { image: "sertifikat/6.jpeg",  year: "2025" },
  { image: "sertifikat/7.jpg",  year: "2025" },
  { image: "sertifikat/8.png",  year: "2025" },
  { image: "sertifikat/9.png",  year: "2025" },
  { image: "sertifikat/10.png", year: "2025" },
  { image: "sertifikat/11.jpg", year: "2025" },
  { image: "sertifikat/12.jpg", year: "2025" },
  { image: "sertifikat/13.jpg", year: "2025" },
  { image: "sertifikat/14.jpg", year: "2025" },
  { image: "sertifikat/15.png", year: "2025" },
  { image: "sertifikat/16.png", year: "2025" },
  { image: "sertifikat/17.png", year: "2025" },
  { image: "sertifikat/18.png", year: "2025" },
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

  // 🔝 Scroll ke atas saat halaman dibuka
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
setFilteredCertificates(shuffleArray(certificates));
  }, []);

  // 🔮 Variants animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // exit={{ opacity: 0, y: -20 }}
      // transition={{ duration: 0.4, ease: "easeInOut" }}
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
                {filteredCertificates.length} Certificates
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
              Certificates
            </h1>
            <p
              className={`text-lg font-mono ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              A collection of certificates from courses, trainings, and competitions that I have completed.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ===== Certificates Masonry ===== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="columns-1 sm:columns-2 lg:columns-3 gap-2 space-y-2"
        >
          {filteredCertificates.map((cert, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition duration-300 cursor-target"
            >
              {/* Image */}
              <div className="relative w-full h-full overflow-hidden ">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full rounded-t-xl transition-transform duration-500 hover:scale-[1.02] "
                  onClick={() => setSelectedCert(cert)}
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
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
        // onClick={(e) => e.stopPropagation()} // Klik gambar -> tidak close
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

export default Certificates;