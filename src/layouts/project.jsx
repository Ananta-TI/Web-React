import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import LayeredAnimations from "../components/Home/LayeredAnimations";
import {
  Github,
  ExternalLink,
  Globe,
  Code,
  Database,
  Palette,
  Search,
  Filter,
  X,
  Calendar,
  User,
  ChevronDown,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";
import "../index.css";

const Projects = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;
  const navigate = useNavigate();
  const waveRef = useRef(null);
  gsap.registerPlugin(ScrollTrigger);
  const imageRefs = useRef([]);
  
  // State for filtering, sorting, and modal
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTech, setSelectedTech] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // List of Projects with Preview Images
  const projects = [
    {
      id: 1,
      title: "My First Web",
      description:
        "My very first website built to learn the fundamentals of HTML, CSS, Tailwind, and JavaScript. Featuring a simple yet responsive design, this project marked the beginning of my journey into web development.",
      demo: "https://ananta-ti.github.io/my-first-web/",
      repo: null,
      tags: ["HTML", "CSS", "JavaScript"],
      category: "Web Development",
      image: "/img/first-web.png",
      date: "2023-01-15",
      difficulty: "Beginner",
      featured: true,
      status: "Completed",
    },
    {
      id: 2,
      title: "Sedap",
      description:
        "A React-based culinary platform showcasing local Indonesian food products with a modern and responsive UI. It allows users to explore traditional snacks, healthy meals, and contemporary cuisines while supporting local culinary SMEs.",
      demo: "https://react-nta.vercel.app/guest",
      repo: null,
      tags: ["React", "Tailwind", "UI/UX"],
      category: "Web Development",
      image: "/img/Sedap.png",
      date: "2023-05-20",
      difficulty: "Intermediate",
      featured: true,
      status: "Completed",
    },
    {
      id: 3,
      title: "React Inventory",
      description:
        "An inventory management system built with React and a modern interface, designed to improve business efficiency and data organization.",
      demo: "https://react-inventory-roan.vercel.app/",
      repo: null,
      tags: ["React", "Inventory", "Management"],
      category: "Web Application",
      image: "img/ReactInventory.png",
      date: "2023-08-10",
      difficulty: "Intermediate",
      featured: false,
      status: "In Progress",
    },
  ];
  
  // Extract unique categories and technologies for filters
  const categories = ["All", ...new Set(projects.map(p => p.category))];
  const technologies = ["All", ...new Set(projects.flatMap(p => p.tags))];
  
  // Initialize filtered projects
  useEffect(() => {
    let result = [...projects];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        project =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(project => project.category === selectedCategory);
    }
    
    // Filter by technology
    if (selectedTech !== "All") {
      result = result.filter(project => project.tags.includes(selectedTech));
    }
    
    // Sort projects
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "difficulty":
        const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
        result.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      default:
        break;
    }
    
    setFilteredProjects(result);
  }, [searchTerm, selectedCategory, selectedTech, sortBy]);
  
  // Initialize filtered projects on mount
  useEffect(() => {
    setFilteredProjects(projects);
  }, []);
  
  useEffect(() => {
    if (!imageRefs.current.length) return;

    imageRefs.current.forEach((img) => {
      if (!img) return;

      gsap.fromTo(
        img.querySelector("img"),
        { yPercent: -20 },
        {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [filteredProjects]);
  
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
  
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };
  
  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedProject(null), 300);
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "text-green-500";
      case "Intermediate":
        return "text-yellow-500";
      case "Advanced":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-green-500";
      case "In Progress":
        return "text-blue-500";
      case "Planned":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <section
      id="projects"
      className={`relative w-full min-h-screen py-20 transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
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
            A collection of projects that I have developed using various modern
            technologies.
          </p>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-30">
        {filteredProjects.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
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
                <div className="relative h-40 sm:h-52 md:h-64 lg:h-140 overflow-hidden rounded-xl">
                  <div
                    ref={(el) => (imageRefs.current[index] = el)}
                    className="relative h-64 sm:h-72 md:h-80 lg:h-150 overflow-hidden rounded-t-3xl"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-[100%] object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Featured Badge */}
                  {project.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    </div>
                  )}
                  
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
                    className={`text-lg font-mono leading-relaxed line-clamp-3 mb-4 ${
                      isDarkMode ? "text-zinc-400" : "text-gray-600"
                    }`}
                  >
                    {project.description}
                  </p>
                  
                  {/* Project Meta */}
                  <div className="flex items-center gap-4 mb-4 text-sm font-mono">
                    <span className={`flex items-center gap-1 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                      <Calendar className="w-4 h-4" />
                      {new Date(project.date).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 ${getDifficultyColor(project.difficulty)}`}>
                      <Code className="w-4 h-4" />
                      {project.difficulty}
                    </span>
                    <span className={`flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      <Clock className="w-4 h-4" />
                      {project.status}
                    </span>
                  </div>

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
        px-3 py-1 text-[17px] border-t-0 font-lyrae font-bold
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
            ? `text-gray-100 before:bg-gray-100 after:bg-gray-100
               hover:text-zinc-900 border-gray-100/20`
            : `text-gray-800 before:bg-gray-800 after:bg-zinc-800
               hover:text-white border-gray-800/20`
        }
      `}
                      >
                        <Globe className="w-5 h-5 relative z-20 transition-transform duration-300 group-hover:rotate-12" />
                        <span className="relative z-20 pointer-events-none">
                          Live Demo
                        </span>
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
        ) : (
          <div className="text-center py-12">
            <p className={`text-xl font-mono ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
              No projects found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedTech("All");
              }}
              className={`mt-4 px-6 py-2 rounded-lg font-mono text-sm ${
                isDarkMode
                  ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } transition-colors duration-300`}
            >
              Reset Filters
            </button>
          </div>
        )}
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
        : `text-gray-800 before:bg-gray-800 after:bg-zinc-800
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
          <span className="font-bold font-mono">
            <span className="text-[#F55247]">{filteredProjects.length} Projects</span> •{" "}
            <span className="text-[#FFA828]">
              {filteredProjects.filter((p) => p.demo).length} Live Demos
            </span>
          </span>
        </div>
        <div className="w-full flex justify-between items-start">
          <div className="flex-shrink-0">
            <LayeredAnimations />
          </div>
        </div>
      </motion.div>
      
      {/* Project Details Modal */}
      <AnimatePresence>
        {showModal && selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
            
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${
                isDarkMode ? "bg-zinc-800 text-white" : "bg-white text-black"
              } shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-2xl">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                
                <button
                  onClick={closeModal}
                  className={`absolute top-4 right-4 p-2 rounded-full ${
                    isDarkMode ? "bg-zinc-900/80 text-white" : "bg-white/80 text-black"
                  } backdrop-blur-sm`}
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-3xl sm:text-4xl font-lyrae text-white mb-2">
                    {selectedProject.title}
                  </h3>
                  <div className="flex items-center gap-4 text-white text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedProject.date).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 ${getDifficultyColor(selectedProject.difficulty)}`}>
                      <Code className="w-4 h-4" />
                      {selectedProject.difficulty}
                    </span>
                    <span className={`flex items-center gap-1 ${getStatusColor(selectedProject.status)}`}>
                      <Clock className="w-4 h-4" />
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-3">About this project</h4>
                  <p className={`font-mono leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}>
                    {selectedProject.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-3">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className={`px-3 py-1 rounded-full text-sm font-mono ${
                          isDarkMode
                            ? "bg-zinc-700 text-zinc-300"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {selectedProject.demo && (
                    <a
                      href={selectedProject.demo}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-mono font-medium ${
                        isDarkMode
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      } transition-colors duration-300`}
                    >
                      <Globe className="w-5 h-5" />
                      View Live Demo
                    </a>
                  )}
                  
                  {selectedProject.repo && (
                    <a
                      href={selectedProject.repo}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-mono font-medium ${
                        isDarkMode
                          ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      } transition-colors duration-300`}
                    >
                      <Github className="w-5 h-5" />
                      View Repository
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;