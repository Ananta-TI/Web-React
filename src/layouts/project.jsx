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
        "Website pertama yang saya buat untuk belajar HTML, CSS Tailwind, dan JavaScript dasar dengan desain modern dan responsif.",
      demo: "https://ananta-ti.github.io/my-first-web/",
      repo: null,
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web Development",
      image: "/img/first-web.png",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "My Second Web",
      description:
        "Pengembangan lebih lanjut dengan desain yang lebih modern dan responsif menggunakan Bootstrap.",
      demo: "https://ananta-ti.github.io/my-second-web/",
      repo: null,
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web Development",
      image: "img/my-second-web.png",
      color: "from-purple-500 to-pink-500",
    },
    // {
    //   title: "KABESTU",
    //   description: "website company profile dari sebuah perusahaan besi dengan fitur lengkap dan antarmuka yang user-friendly.",
    //   demo: null,
    //   repo: "https://github.com/Ananta-TI/besi.git",
    //   tags: ["laravel, Bootstrap", "MySQL"],
    //   category: "Web Development",
    //   image: "img/Kabestu.png",
    //   color: "from-green-500 to-teal-500"
    // },
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
      className={`w-full min-h-screen py-20 transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Section Heading */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-6">
            <DecryptedText
              text="My Projects"
              speed={100}
              maxIterations={105}
              sequential
              animateOn="view"
            />
          </h2>
          <p
            className={`relative text-base sm:text-lg md:text-2xl leading-relaxed font-mono transition-colors duration-500 font px-2 sm:px-4 md:px-0 ${
              isDarkMode ? "text-zinc-400" : "text-gray-600"
            }`}
          >
            Koleksi project yang telah saya kembangkan menggunakan berbagai
            teknologi modern
          </p>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-30">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className={`group relative overflow-hidden rounded-3xl ${
                isDarkMode
                  ? "bg-zinc-800/50 border-none "
                  : "bg-white border-none "
              } backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500`}
            >
              {/* Project Image/Preview */}
<div className="relative h-40 sm:h-52 md:h-64 lg:h-152 overflow-hidden rounded-xl">
  <img
    src={project.image}
    alt={project.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    loading="lazy"
  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${project.color} flex items-center justify-center`}
                  >
                    <div className="text-center text-white">
                      <Github className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-medium">Repository</p>
                    </div>
                  </div>
                )

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isDarkMode
                        ? "bg-zinc-900/80 text-zinc-200"
                        : "bg-white/90 text-gray-700"
                    } backdrop-blur-sm border border-white/20`}
                  >
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-9">
                {/* Title */}
                <h3
                  className={`text-4xl font-lyrae mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {project.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-lg font-mono leading-relaxed mb-4 ${
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
                      className={`px-2.5 py-1 text-xs rounded-md font-mono ${
                        isDarkMode
                          ? "bg-zinc-700 text-zinc-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
  {project.demo && (
    <motion.a
      href={project.demo}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative z-10 overflow-hidden inline-flex items-center gap-3
        px-3 py-1 text-[27px] border-t-0 font-lyrae font-bold
        rounded-lg border 
        bg-transparent transition-all duration-500
        cursor-none cursor-target

        /* ::before - top line animation */
        before:content-[''] before:absolute before:top-0 before:right-0
        before:h-[2px] before:w-0
        before:transition-all before:duration-500 before:z-[-1]

        /* ::after - background fill animation */
        after:content-[''] after:absolute after:left-0 after:bottom-0
        after:h-0 after:w-full
        after:transition-all after:duration-400 after:z-[-2]

        /* Hover effects */
        hover:before:w-full
        hover:after:h-full hover:after:delay-200

        ${
          isDarkMode
            ? `text-blue-500 before:bg-gray-100 after:bg-gray-100
               hover:text-zinc-900 border-gray-100/20`
            : `text-gray-800 before:bg-gray-800 after:bg-gray-800
               hover:text-white border-gray-800/20`
        }
      `}
    >
      <Globe className="w-5 h-5 relative z-20 transition-transform duration-300 group-hover:rotate-12" />
      <span className="relative z-20 pointer-events-none">Live Demo</span>
    </motion.a>
  )}
                  {project.repo && (
                    <motion.a
                      href={project.repo}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`${
                        project.demo ? "px-3" : "flex-1 justify-center"
                      } flex items-center gap-2 py-2.5 ${
                        isDarkMode
                          ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      } rounded-lg font-mono text-sm transition-all duration-300`}
                    >
                      <Github className="w-4 h-4" />
                      {!project.demo && "View Code"}
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Tombol ke All Projects */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center"
      >
        <button
          onClick={() => navigate("/all-projects")}
          className={`
    relative px-8 py-4 text-[17px] uppercase border-b-0 font-lyrae font-semibold rounded-lg
     bg-transparent transition-all duration-500 overflow-hidden
    cursor-none cursor-target z-10
    before:content-[''] before:absolute before:right-0 before:top-0
    before:h-[2px] before:w-0 before:transition-all before:duration-500 before:z-[-1]
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0 after:w-full
    after:transition-all after:duration-400 after:z-[-2]
    hover:before:w-full
    hover:after:h-full hover:after:delay-200
    ${
      isDarkMode
        ? `text-gray-100 before:bg-gray-100 after:bg-gray-100
           hover:text-zinc-900 border border-gray-100/20`
        : `text-gray-800 before:bg-gray-800 after:bg-gray-800
           hover:text-white border border-gray-800/20`
    }
  `}
        >
          <span className="relative z-20 pointer-events-none">
            View All Projects
          </span>
        </button>
      </motion.div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center"
      >
        <div
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
            isDarkMode
              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
              : "bg-white text-gray-600 border border-gray-200"
          } shadow-lg`}
        >
          <Code className="w-5 h-5" />
          <span className="font-medium">
            {projects.length} Projects • {projects.filter((p) => p.demo).length}{" "}
            Live Demos
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;
