import { useNavigate } from "react-router-dom"; // tambahkan import ini di atas
import { useContext } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import {
  Github,
  ExternalLink,
  Globe,
  Code,
  Database,
  Palette,
} from "lucide-react";
import "../index.css";

const Projects = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true; // Default dark mode jika context belum tersedia
  const navigate = useNavigate(); // inisialisasi useNavigate

  // Daftar Project dengan gambar preview
  const projects = [
    {
      title: "My First Web",
      description:
        "Website pertamaku yang dibuat untuk mempelajari dasar-dasar HTML, CSS Tailwind, dan JavaScript.Mengusung desain sederhana namun responsif, proyek ini menjadi pijakan awal perjalananku di dunia pengembangan web.",
      demo: "https://ananta-ti.github.io/my-first-web/",
      repo: null,
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web Development",
      image: "/img/first-web.png",
      color: "from-blue-500 to-cyan-500",
    },
    // {
    //   title: "My Second Web",
    //   description:
    //     "Versi lanjutan dari proyek pertamaku, kali ini dengan tampilan yang lebih modern menggunakan Bootstrap.Fokus pada struktur layout yang rapi dan pengalaman pengguna yang lebih dinamis di berbagai perangkat. cuman masi perlu sedikit perbaikan nih.",
    //   demo: "https://ananta-ti.github.io/my-second-web/",
    //   repo: null,
    //   tags: ["HTML", "CSS", "JavaScript"],
    //   category: "Web Development",
    //   image: "img/my-second-web.png",
    //   color: "from-purple-500 to-pink-500",
    // },
    {
      title: "KABESTU",
      description: "website company profile dari sebuah perusahaan besi dengan fitur lengkap dan antarmuka yang user-friendly.",
      demo: null,
      repo: "https://github.com/Ananta-TI/besi.git",
      tags: ["laravel, Bootstrap", "MySQL"],
      category: "Web Development",
      image: "img/Kabestu.png",
      color: "from-green-500 to-teal-500"
    },
   {
  title: "Sedap",
  description:
    "Platform kuliner berbasis React yang menampilkan produk makanan lokal Indonesia dengan UI modern dan responsif. Mendukung eksplorasi camilan tradisional, makanan sehat, hingga kuliner kekinian, sekaligus mendorong pertumbuhan UMKM kuliner.",
  demo: "https://react-nta.vercel.app/guest",
  repo: null,
  tags: ["React", "Tailwind", "UI/UX"],
  category: "Web Development",
  image: "/img/Sedap.png", // cukup ini
  color: "from-orange-500 to-red-500",
}
    ,
    {
      title: "React Inventory",
      description:
        "Sistem inventory management yang dibangun dengan React dan modern UI untuk efisiensi bisnis.",
      demo: "https://react-inventory-roan.vercel.app/",
      repo: null,
      tags: ["React", "Inventory", "Management"],
      category: "Web Application",
      image: "img/ReactInventory.png",
      color: "from-indigo-500 to-blue-500",
    },
    // {
    //   title: "MathDash Pro",
    //   description: "Dashboard matematika interaktif untuk menghitung nilai FPB dan KPK.",
    //   demo: "https://mathdash-pro.vercel.app/",
    //   repo: null,
    //   tags: ["React", "Math", "Education"],
    //   category: "Education",
    //   image: "img/MathDash.png",
    //   color: "from-yellow-500 to-orange-500"
    // },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
    id="projects"
    className={`w-full min-h-screen py-16 sm:py-20 transition-colors duration-500 ${
      isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
    }`}
  >
    {/* Heading */}
    <div className="container mx-auto px-5 sm:px-8 mb-12 sm:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold font-lyrae mb-4 sm:mb-6">
          <DecryptedText
            text="My Projects"
            speed={100}
            maxIterations={105}
            sequential
            animateOn="view"
          />
        </h2>
        <p
          className={`text-sm sm:text-base md:text-lg font-mono leading-relaxed ${
            isDarkMode ? "text-zinc-400" : "text-gray-600"
          }`}
        >
          Koleksi project yang telah saya kembangkan menggunakan berbagai teknologi modern
        </p>
      </motion.div>
    </div>

    {/* Project Cards */}
    <div className="container mx-auto px-5 sm:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8"
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            className={`group relative overflow-hidden rounded-3xl ${
              isDarkMode ? "bg-zinc-800/50" : "bg-white"
            } backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500`}
          >
            {/* Gambar */}
            <div className="relative h-40 sm:h-48 md:h-64 overflow-hidden rounded-xl">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <span
                  className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                    isDarkMode
                      ? "bg-zinc-900/80 text-zinc-200"
                      : "bg-white/90 text-gray-700"
                  } backdrop-blur-sm border border-white/20`}
                >
                  {project.category}
                </span>
              </div>
            </div>

            {/* Konten */}
            <div className="p-5 sm:p-8">
              <h3
                className={`text-2xl sm:text-3xl font-lyrae mb-2 sm:mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {project.title}
              </h3>
              <p
                className={`text-sm sm:text-base font-mono leading-relaxed mb-4 ${
                  isDarkMode ? "text-zinc-400" : "text-gray-600"
                }`}
              >
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className={`px-2 py-[3px] sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-md font-mono ${
                      isDarkMode
                        ? "bg-zinc-700 text-zinc-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Tombol */}
              <div className="flex flex-col sm:flex-row gap-3">
                {project.demo && (
                  <motion.a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative z-10 overflow-hidden flex justify-center items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-[17px] font-lyrae font-bold rounded-lg border transition-all duration-500
                      ${
                        isDarkMode
                          ? "text-gray-100 border-gray-100/20 hover:text-zinc-900 before:bg-gray-100 after:bg-gray-100"
                          : "text-gray-800 border-gray-800/20 hover:text-white before:bg-gray-800 after:bg-gray-800"
                      }`}
                  >
                    <Globe className="w-4 sm:w-5 h-4 sm:h-5" />
                    Live Demo
                  </motion.a>
                )}
                {project.repo && (
                  <motion.a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex justify-center items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-mono text-sm sm:text-base transition-all duration-300 ${
                      isDarkMode
                        ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Github className="w-4 h-4" /> View Code
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* Tombol View All */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="container mx-auto px-5 sm:px-8 mt-10 sm:mt-14 text-center"
    >
      <button
        onClick={() => navigate("/all-projects")}
        className={`relative px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-[17px] uppercase font-lyrae font-semibold rounded-lg border transition-all duration-500 overflow-hidden ${
          isDarkMode
            ? "text-gray-100 hover:text-zinc-900 border-gray-100/20 before:bg-gray-100 after:bg-gray-100"
            : "text-gray-800 hover:text-white border-gray-800/20 before:bg-gray-800 after:bg-gray-800"
        }`}
      >
        View All Projects
      </button>
    </motion.div>
  </section>
  );
};

export default Projects;
