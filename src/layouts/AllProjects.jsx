import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion"; // Tambahkan AnimatePresence
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
    year: "2022",
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
    year: "2022",
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
    year: "2024",
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
    year: "2025",
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
    year: "2025",
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
  {
    title: "POSEIDON - WebGIS Riau",
    description:
      "WebGIS Riau v1.0 Digital Map of Flood and Inundation Distribution.A geospatial visualization platform that maps flood- and inundation-prone areas in Riau Province based on historical data and field surveys.",
    demo: "https://gis-project-khaki.vercel.app/",
    repo: "https://github.com/Ananta-TI/GIS-Project.git",
    tags: ["React", "Vite", "Framer Motion", "Tailwind","Gsap"],
    category: "Web Development",
    image: "img/Poseidon.png",
    color: "from-blue-600 to-cyan-500",
    year: "2025",
    status: "In Progress",
    featured: true,
  },
  // {
  //   title: "NANTAGACOR88 - Online Gambling",
  //   description:
  //     "A React-based web project that simulates an interactive gacha/slot system with animations, visual effects, and probability mechanisms. It serves as a demonstration of advanced React techniques and engaging UI design.",
  //   demo: "https://nantagacor88.vercel.app/",
  //   repo: "https://github.com/Ananta-TI/nantaGacor88.git",
  //   tags: ["React", "Vite", "Framer Motion", "Tailwind"],
  //   category: "Web Development",
  //   image: "img/nantagacor88.png",
  //   color: "from-blue-600 to-cyan-500",
  //   year: "2026",
  //   status: "In Progress",
  //   featured: true,
  // },
];


  // Get unique categories
  const categories = ["All", ...new Set(allProjects.map(project => project.category))];
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
  // Filter projects based on search and category
// ✅ 1. Gunakan useEffect khusus untuk mount pertama kali
useEffect(() => {
  window.scrollTo(0, 0);
}, []); // Array kosong artinya hanya jalan sekali saat halaman dibuka

// ✅ 2. Filter projects (Hapus window.scrollTo dari sini)
useEffect(() => {
  let filtered = allProjects;
  // window.scrollTo(0,0); <--- HAPUS INI agar saat ngetik/filter tidak mental ke atas
  
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-lyrae mb-4 mt-20">
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
    layout
    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
  >
    <AnimatePresence mode="popLayout">
      {filteredProjects.map((project) => (
        <motion.div
          key={project.title}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          // EFEK HOVER FRAMER MOTION
          whileHover={{ 
            y: -10,
            transition: { type: "spring", stiffness: 400, damping: 25 }
          }}
          className={`group relative overflow-hidden rounded-2xl border ${
            isDarkMode
              ? "bg-zinc-800/40 border-zinc-700/50"
              : "bg-white border-gray-200"
          } backdrop-blur-md shadow-lg hover:shadow-2xl transition-shadow duration-500`}
        >
          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4 z-20">
              <motion.div 
                initial={{ rotate: -10 }}
                whileHover={{ rotate: 0, scale: 1.1 }}
                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg"
              >
                <Star className="w-3 h-3 fill-current" />
                Featured
              </motion.div>
            </div>
          )}

          {/* Project Image Container */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <motion.img
              src={project.image}
              alt={project.title}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            
            {/* Badges on Image */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
               <span className={`px-2 py-1 rounded-md text-[10px] font-bold border backdrop-blur-md ${getStatusColor(project.status)}`}>
                {project.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Project Content */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-xl font-bold font-lyrae tracking-tight ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                {project.title}
              </h3>
              <span className={`text-xs font-mono px-2 py-1 rounded ${isDarkMode ? "bg-zinc-700 text-zinc-400" : "bg-zinc-100 text-zinc-500"}`}>
                {project.year}
              </span>
            </div>
            
            <p className={`text-sm font-mono line-clamp-2 mb-4 leading-relaxed ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.tags.map((tag) => (
                <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  isDarkMode ? "border-zinc-700 bg-zinc-800/50 text-zinc-400" : "border-zinc-200 bg-zinc-50 text-zinc-500"
                }`}>
                  {tag}
                </span>
              ))}
            </div>

            {/* ACTION BUTTONS DENGAN LOGO */}
            <div className="flex gap-3 cursor-none ">
              {project.demo && (
                <motion.a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center cursor-none cursor-target justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Live Demo
                </motion.a>
              )}
              
              {project.repo && (
                <motion.a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center justify-center cursor-none cursor-target gap-2 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    project.demo ? "px-4" : "flex-1"
                  } ${
                    isDarkMode 
                    ? "border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700" 
                    : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Github className="w-4 h-4" />
                  {!project.demo && "View Source"}
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </motion.div>
</div>
    </div>
  );
};

export default AllProjects;