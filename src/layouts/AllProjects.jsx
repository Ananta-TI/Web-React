import { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import {
  Github,
  ExternalLink,
  Globe,
  Code,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Star,
  Eye,
  FolderOpen,
  Layers,
  Database,
  Palette,
  Smartphone,
  Monitor,
  Server,
  Zap
} from "lucide-react";

const AllProjects = () => {
  const theme = useContext(ThemeContext);
  const navigate = useNavigate();
  const isDarkMode = theme?.isDarkMode ?? true;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState([]);
// Full project data
const allProjects = [
  {
    title: "My First Web",
    description:
      "A fundamental project marking the beginning of my web development journey. It focuses on implementing semantic HTML5 structures, CSS3 styling, and basic interactivity using Vanilla JavaScript.",
    demo: "https://ananta-ti.github.io/my-first-web/",
    repo: "https://github.com/Ananta-TI/my-first-web.git",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "Portfolio",
    image: "img/first-web.png",
    color: "from-blue-500 to-cyan-500",
    year: "2023",
    status: "Completed",
    featured: false,
  },
  {
    title: "My Second Web",
    description:
      "An exploration into streamlining development workflows using the Bootstrap framework. This project emphasizes complex grid layout systems and modern, mobile-first UI components.",
    demo: "https://ananta-ti.github.io/second-web/",
    repo: "https://github.com/Ananta-TI/second-web.git",
    tags: ["HTML", "CSS", "JavaScript","Bootstrap"],
    category: "Portfolio",
    image: "img/my-second-web.png",
    color: "from-purple-500 to-pink-500",
    year: "2023",
    status: "Completed",
    featured: false,
  },
  {
    title: "KABESTU - Company Profile",
    description:
      "A professional company profile for a steel manufacturing business. Built with Laravel for dynamic content management, ensuring high performance and stability for corporate requirements.",
    demo: null,
    repo: "https://github.com/Ananta-TI/besi.git",
    tags: ["Laravel", "PHP", "MySQL", "Bootstrap"],
    category: "Web Development",
    image: "img/Kabestu.png",
    color: "from-green-500 to-teal-500",
    year: "2023",
    status: "Completed",
    featured: false,
  },
  {
    title: "Sedap - Indonesian Culinary",
    description:
      "A React-based catalog platform showcasing Indonesian cuisine. Designed to empower local MSMEs with a visually appealing UI and intuitive user navigation.",
    demo: "https://react-nta.vercel.app/guest",
    repo: "https://github.com/Ananta-TI/React-Nta.git",
    tags: ["React", "Tailwind CSS", "API Integration"],
    category: "Web Development",
    image: "img/Sedap.png",
    color: "from-orange-500 to-red-500",
    year: "2024",
    status: "Completed",
    featured: true,
  },
  {
    title: "Smart Inventory System",
    description:
      "An inventory management solution built to enhance operational efficiency. It features real-time stock tracking and a clean, data-driven analytical dashboard.",
    demo: "https://react-inventory-roan.vercel.app/",
    repo: "https://github.com/Ananta-TI/react-inventory.git",
    tags: ["React", "Context API", "Dashboard", "Tailwind"],
    category: "Web Development",
    image: "img/ReactInventory.png",
    color: "from-indigo-500 to-blue-500",
    year: "2024",
    status: "Completed",
    featured: true,
  },
  {
    title: "MathDash Pro",
    description:
      "An interactive educational application for calculating GCF and LCM. It helps students master numerical logic through a visual, engaging, and highly responsive interface.",
    demo: "https://mathdash-pro.vercel.app/",
    repo: "https://github.com/Ananta-TI/mathdash.git",
    tags: ["React", "Education", "Logic", "Algorithms"],
    category: "Education",
    image: "img/MathDash.png",
    color: "from-yellow-500 to-orange-500",
    year: "2024",
    status: "In Progress",
    featured: true,
  },
  {
    title: "PCR Book-Request System",
    description:
      "A request and management system for the PCR campus library. It features multi-role access (Student, Staff, Librarian) to streamline the document validation process.",
    demo: null,
    repo: "https://github.com/Ananta-TI/Book-requests.git",
    tags: ["React", "Management", "Library System", "Authentication"],
    category: "Web Development",
    image: "img/Book-Request.png",
    color: "from-rose-500 to-red-600",
    year: "2024",
    status: "In Progress",
    featured: true,
  },
  {
    title: "ANANTA-TI PORTFOLIO v2",
    description:
      "A digital hub that encapsulates my professional growth. Leverages Framer Motion for smooth animations and Vite for lightning-fast loading performance.",
    demo: "https://ananta-ti.vercel.app/",
    repo: "https://github.com/Ananta-TI/Web-React.git",
    tags: ["React", "Vite", "Framer Motion", "Tailwind","Gsap"],
    category: "Portfolio",
    image: "img/web-react.png",
    color: "from-blue-600 to-cyan-500",
    year: "2025",
    status: "Completed",
    featured: true,
  },
];


  // Get unique categories
  const categories = ["All", ...new Set(allProjects.map(project => project.category))];

  // Filter projects based on search and category
  useEffect(() => {
    let filtered = allProjects;
  window.scrollTo({ top: 0, behavior: "smooth" });
    if (selectedCategory !== "All") {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedCategory]);

  const handleBackToHome = () => {
    navigate('/');
  };

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
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Web Development': return <Monitor className="w-4 h-4" />;
      case 'Web Application': return <Server className="w-4 h-4" />;
      case 'Mobile App': return <Smartphone className="w-4 h-4" />;
      case 'Education': return <Database className="w-4 h-4" />;
      case 'Design': return <Palette className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'In Progress': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Planning': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
    }`}>
      {/* Header Section */}
      <div className={` top-0 z-40 backdrop-blur-lg border-b transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-[#faf9f9] border-gray-200"
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
           


            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-[#faf9f9] text-gray-600 border border-gray-200"
            }`}>
              <FolderOpen className="w-5 h-5" />
              <span className="font-medium">{filteredProjects.length} Projects</span>
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
              <DecryptedText
                text="All Projects"
                speed={100}
                maxIterations={105}
                sequential
                animateOn="view"
              />
            </h1>
            <p className={`text-lg font-mono ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>

A complete exploration of all the projects I have developed            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 cursor-none"
          >
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-zinc-400" : "text-gray-400"
              }`} />
              <input
                type="text"
                placeholder="Search projects, tags, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    : "bg-white border-gray-300 text-black placeholder-gray-500"
                }`}
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 pb-2 sm:pb-0 cursor-none ">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 cursor-target cursor-none ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {category !== "All" && getCategoryIcon(category)}
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className={`group relative overflow-hidden rounded-2xl ${
                isDarkMode
                  ? "bg-zinc-800/50 border border-zinc-700/50"
                  : "bg-white border border-gray-200"
              } backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500`}
            >
              {/* Featured Badge */}
              {project.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" />
                    Featured
                  </div>
                </div>
              )}

              {/* Project Image/Preview */}
             <div className="relative h-40 sm:h-52 md:h-64 lg:h-50 overflow-hidden rounded-xl">
  <img
    src={project.image}
    alt={project.title}
    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    loading="lazy"
  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                    <div className="text-center text-white">
                      <Github className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <p className="text-lg font-mono">Repository</p>
                    </div>
                  </div>
                )

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? "bg-zinc-900/80 text-zinc-200"
                      : "bg-white/90 text-gray-700"
                  } backdrop-blur-sm border border-white/20`}>
                    {getCategoryIcon(project.category)}
                    {project.category}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                {/* Title & Year */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-2xl font-lyrae font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {project.title}
                  </h3>
                  <div className={`flex items-center gap-1 text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                    <Calendar className="w-3 h-3" />
                    {project.year}
                  </div>
                </div>

                {/* Description */}
                <p className={`text-lg font-mono leading-relaxed mb-4 ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-2 py-1 text-xs rounded-md font-medium ${
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
                <div className="flex gap-3 cursor-target cursor-none">
                  {project.demo && (
                    <motion.a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center cursor-none justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
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
                      className={`${
                        project.demo ? "px-3" : "flex-1 justify-center cursor-none"
                      } flex items-center gap-2 py-2.5 ${
                        isDarkMode
                          ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      } rounded-lg font-medium text-sm transition-all duration-300`}
                    >
                      <Github className="w-4 h-4 cursor-none" />
                      {!project.demo && "View Code"}
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Search className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-zinc-600" : "text-gray-400"}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? "text-zinc-300" : "text-gray-600"}`}>
              No projects found
            </h3>
            <p className={`text-sm ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}>
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {[
  { label: "Total Projects", value: allProjects.length, icon: FolderOpen, color: "text-blue-500" },
  { label: "Completed", value: allProjects.filter(p => p.status === "Completed").length, icon: Zap, color: "text-green-500" },
  { label: "Live Demos", value: allProjects.filter(p => p.demo).length, icon: Globe, color: "text-purple-500" },
  { label: "Featured", value: allProjects.filter(p => p.featured).length, icon: Star, color: "text-yellow-500" }
].map((stat, index) => (
  <div
    key={index}
    className={`p-6 rounded-xl text-center ${
      isDarkMode
        ? "bg-zinc-800/50 border border-zinc-700/50"
        : "bg-white border border-gray-200"
    } backdrop-blur-sm`}
  >
    <stat.icon
      className={`w-8 h-8 mx-auto mb-2 ${stat.color}`}
    />
    <div
      className={`text-2xl font-bold mb-1 ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
    >
      {stat.value}
    </div>
    <div
      className={`text-sm ${
        isDarkMode ? "text-zinc-400" : "text-gray-600"
      }`}
    >
      {stat.label}
    </div>
  </div>
))}

        </motion.div>
      </div>
    </div>
  );
};

export default AllProjects;