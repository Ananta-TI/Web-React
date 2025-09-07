import { useContext } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import { Github, ExternalLink, Globe, Code, Database, Palette } from "lucide-react";
import "../index.css";

const Projects = () => {
  const { isDarkMode = true } = useContext(ThemeContext) ?? {};

  // Daftar Project dengan gambar preview
  const projects = [
    {
      title: "My First Web",
      description: "Website pertama yang saya buat untuk belajar HTML, CSS, dan JavaScript dasar dengan desain modern dan responsif.",
      demo: "https://ananta-ti.github.io/my-first-web/",
      repo: null,
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web Development",
      image: "/api/placeholder/400/250",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "My Second Web", 
      description: "Pengembangan lebih lanjut dengan desain yang lebih modern dan responsif menggunakan framework terbaru.",
      demo: "https://ananta-ti.github.io/my-second-web/",
      repo: null,
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web Development", 
      image: "/api/placeholder/400/250",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Besi App",
      description: "Aplikasi mobile untuk manajemen inventory besi dengan fitur lengkap dan antarmuka yang user-friendly.",
      demo: null,
      repo: "https://github.com/Ananta-TI/besi.git",
      tags: ["Mobile", "Flutter", "Dart"],
      category: "Mobile Development",
      image: "/api/placeholder/400/250", 
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Guest Dashboard",
      description: "Dashboard untuk manajemen tamu dengan antarmuka yang user-friendly dan fitur real-time monitoring.",
      demo: "https://react-nta.vercel.app/guest",
      repo: null,
      tags: ["React", "Dashboard", "UI/UX"],
      category: "Dashboard",
      image: "/api/placeholder/400/250",
      color: "from-orange-500 to-red-500" 
    },
    {
      title: "React Inventory",
      description: "Sistem inventory management yang dibangun dengan React dan modern UI untuk efisiensi bisnis.",
      demo: "https://react-inventory-roan.vercel.app/",
      repo: null,
      tags: ["React", "Inventory", "Management"],
      category: "Web Application",
      image: "/api/placeholder/400/250",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "MathDash Pro",
      description: "Dashboard matematika interaktif dengan berbagai tool dan kalkulator untuk pembelajaran yang efektif.",
      demo: "https://mathdash-pro.vercel.app/",
      repo: null,
      tags: ["React", "Math", "Education"],
      category: "Education",
      image: "/api/placeholder/400/250",
      color: "from-yellow-500 to-orange-500"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section
      id="projects"
      className={`w-full min-h-screen py-20 transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900" : "bg-gray-50"
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <DecryptedText
              text="My Projects"
              speed={100}
              maxIterations={105}
              sequential
              animateOn="view"
            />
          </h2>
          <p className={`text-lg sm:text-xl max-w-3xl mx-auto ${
            isDarkMode ? "text-zinc-400" : "text-gray-600"
          }`}>
            Koleksi project yang telah saya kembangkan menggunakan berbagai teknologi modern
          </p>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-20">
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
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className={`group relative overflow-hidden rounded-2xl ${
                isDarkMode 
                  ? "bg-zinc-800/50 border border-zinc-700/50" 
                  : "bg-white border border-gray-200"
              } backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500`}
            >
              {/* Project Image/Preview */}
              <div className="relative h-48 sm:h-190 overflow-hidden">
                {project.demo ? (
                  <iframe
                    src={project.demo}
                    title={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <Github className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-medium">Repository</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isDarkMode 
                      ? "bg-zinc-900/80 text-zinc-200" 
                      : "bg-white/90 text-gray-700"
                  } backdrop-blur-sm border border-white/20`}>
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-9">
                {/* Title */}
                <h3 className={`text-xl font-bold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {project.title}
                </h3>

                {/* Description */}
                <p className={`text-sm leading-relaxed mb-4 ${
                  isDarkMode ? "text-zinc-400" : "text-gray-600"
                }`}>
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium ${
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      <Globe className="w-4 h-4" />
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
                      className={`${project.demo ? 'px-3' : 'flex-1 justify-center'} flex items-center gap-2 py-2.5 ${
                        isDarkMode
                          ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      } rounded-lg font-medium text-sm transition-all duration-300`}
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

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center"
      >
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
          isDarkMode 
            ? "bg-zinc-800 text-zinc-300 border border-zinc-700" 
            : "bg-white text-gray-600 border border-gray-200"
        } shadow-lg`}>
          <Code className="w-5 h-5" />
          <span className="font-medium">
            {projects.length} Projects • {projects.filter(p => p.demo).length} Live Demos
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;