import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import {
  X,
  Github,
  Globe,
  Search,
  FolderOpen,
  Layers,
  Database,
  Palette,
  Smartphone,
  Monitor,
  Server,
  Calendar,
  Code,
  Clock,
  LayoutList,
  Grid3X3,
} from "lucide-react";

import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";

const allProjects = [
  {
    title: "My First Web",
    description:
      "A fundamental project marking the beginning of my web development journey. It focuses on implementing semantic HTML5 structures, CSS3 styling, and basic interactivity using Vanilla JavaScript.",
    demo: "https://ananta-ti.github.io/my-first-web/",
    repo: "https://github.com/Ananta-TI/my-first-web.git",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "Portfolio",
    location: "Indonesia",
    image: "/img/first-web.png",
    cover: "/img/cover/1.png",
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
    tags: ["HTML", "CSS", "JavaScript", "Bootstrap"],
    category: "Portfolio",
    location: "Indonesia",
    image: "/img/my-second-web.png",
    cover: "/img/cover/7.png",
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
    location: "Riau, Indonesia",
    image: "/img/Kabestu.png",
    cover: "/img/cover/5.png",
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
    location: "Indonesia",
    image: "/img/Sedap.png",
    cover: "/img/cover/3.png",
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
    location: "Indonesia",
    image: "/img/ReactInventory.png",
    cover: "/img/cover/2.png",
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
    location: "Indonesia",
    image: "/img/MathDash.png",
    cover: "/img/cover/6.png",
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
    location: "Riau, Indonesia",
    image: "/img/Book-Request.png",
    cover: "/img/cover/4.png",
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
    tags: ["React", "Vite", "Framer Motion", "Tailwind", "Gsap"],
    category: "Portfolio",
    location: "Indonesia",
    image: "/img/web-react.png",
    cover: "/img/cover/10.png",
    year: "2025",
    status: "Completed",
    featured: true,
  },
  {
    title: "POSEIDON - WebGIS Riau",
    description:
      "WebGIS Riau v1.0 Digital Map of Flood and Inundation Distribution. A geospatial visualization platform that maps flood- and inundation-prone areas in Riau Province based on historical data and field surveys.",
    demo: "https://gis-project-khaki.vercel.app/",
    repo: "https://github.com/Ananta-TI/GIS-Project.git",
    tags: ["React", "Vite", "Framer Motion", "Tailwind", "Gsap"],
    category: "Web Development",
    location: "Riau, Indonesia",
    image: "/img/Poseidon.png",
    cover: "/img/cover/9.png",
    year: "2025",
    status: "In Progress",
    featured: true,
  },
  {
    title: "NtaKit-Dev",
    description:
      "A comprehensive development toolkit that includes a collection of reusable React components, utilities, and hooks. It is designed to accelerate development and maintain consistency across projects.",
    demo: "https://ntakit.vercel.app/",
    repo: "https://github.com/Ananta-TI/NtaKit.git",
    tags: ["React", "Vite", "Framer Motion", "Tailwind", "Gsap"],
    category: "Web Development",
    location: "Indonesia",
    image: "/img/NtaKitt.png",
    cover: "/img/cover/8.png",
    year: "2026",
    status: "In Progress",
    featured: true,
  },
];

function getCategoryIcon(category) {
  switch (category) {
    case "Web Development":
      return <Monitor className="h-4 w-4" />;
    case "Web Application":
      return <Server className="h-4 w-4" />;
    case "Mobile App":
      return <Smartphone className="h-4 w-4" />;
    case "Education":
      return <Database className="h-4 w-4" />;
    case "Design":
      return <Palette className="h-4 w-4" />;
    default:
      return <Layers className="h-4 w-4" />;
  }
}

function getStatusStyle(status) {
  switch (status) {
    case "Completed":
      return "text-green-500";
    case "In Progress":
      return "text-yellow-500";
    case "Planning":
      return "text-blue-500";
    default:
      return "text-zinc-500";
  }
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);

    update();

    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isDesktop;
}

const previewVariants = {
  initial: {
    scale: 0,
    x: "-50%",
    y: "-50%",
  },
  enter: {
    scale: 1,
    x: "-50%",
    y: "-50%",
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  closed: {
    scale: 0,
    x: "-50%",
    y: "-50%",
    transition: {
      duration: 0.4,
      ease: [0.32, 0, 0.67, 0],
    },
  },
};

export default function AllProjects() {
  const theme = useContext(ThemeContext);

  const isDarkMode = theme?.isDarkMode ?? true;
  const isDesktop = useIsDesktop();

  const floatingImgRef = useRef(null);
  const floatingLabelRef = useRef(null);
  const titleRefs = useRef([]);
  const metaRefs = useRef([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [isHoveringList, setIsHoveringList] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  const effectiveViewMode = isDesktop ? viewMode : "grid";

  const categories = useMemo(() => {
    return ["All", ...new Set(allProjects.map((project) => project.category))];
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = allProjects;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((project) => project.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();

      filtered = filtered.filter((project) => {
        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const resetListHover = () => {
    setIsHoveringList(false);
    setHoveredIndex(0);

    titleRefs.current.forEach((element) => {
      if (element) {
        gsap.to(element, {
          x: 0,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });

    metaRefs.current.forEach((element) => {
      if (element) {
        gsap.to(element, {
          x: 0,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsHoveringList(false);
    setHoveredIndex(0);

    requestAnimationFrame(() => {
      titleRefs.current.forEach((element) => {
        if (element) {
          gsap.set(element, { x: 0 });
        }
      });

      metaRefs.current.forEach((element) => {
        if (element) {
          gsap.set(element, { x: 0 });
        }
      });
    });
  }, [searchTerm, selectedCategory, effectiveViewMode]);

  useEffect(() => {
    if (
      !isDesktop ||
      effectiveViewMode !== "list" ||
      !floatingImgRef.current ||
      !floatingLabelRef.current
    ) {
      return;
    }

    gsap.set(floatingImgRef.current, {
      left: 0,
      top: 0,
    });

    gsap.set(floatingLabelRef.current, {
      left: 0,
      top: 0,
    });

    const xImg = gsap.quickTo(floatingImgRef.current, "left", {
      duration: 0.75,
      ease: "power3",
    });

    const yImg = gsap.quickTo(floatingImgRef.current, "top", {
      duration: 0.75,
      ease: "power3",
    });

    const xLabel = gsap.quickTo(floatingLabelRef.current, "left", {
      duration: 0.4,
      ease: "power3",
    });

    const yLabel = gsap.quickTo(floatingLabelRef.current, "top", {
      duration: 0.4,
      ease: "power3",
    });

    const onMouseMove = (event) => {
      xImg(event.clientX);
      yImg(event.clientY);
      xLabel(event.clientX);
      yLabel(event.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isDesktop, effectiveViewMode, filteredProjects.length]);

  const handleEnter = (index) => {
    setHoveredIndex(index);
    setIsHoveringList(true);

    if (!isDesktop || effectiveViewMode !== "list") return;

    const title = titleRefs.current[index];
    const meta = metaRefs.current[index];

    if (title) {
      gsap.to(title, {
        x: 24,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
    }

    if (meta) {
      gsap.to(meta, {
        x: -18,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const handleLeave = (index) => {
    if (!isDesktop || effectiveViewMode !== "list") return;

    const title = titleRefs.current[index];
    const meta = metaRefs.current[index];

    if (title) {
      gsap.to(title, {
        x: 0,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
    }

    if (meta) {
      gsap.to(meta, {
        x: 0,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    window.lenis?.stop?.();
  };

  const closeModal = () => {
    setSelectedProject(null);
    window.lenis?.start?.();
  };

  useEffect(() => {
    return () => {
      window.lenis?.start?.();
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      <div
        className={`top-0 z-40 border-b backdrop-blur-lg transition-colors duration-500 ${
          isDarkMode
            ? "bg-zinc-900/80 border-zinc-800"
            : "bg-[#faf9f9] border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                isDarkMode
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-[#faf9f9] text-gray-600 border border-gray-200"
              }`}
            >
              <FolderOpen className="h-5 w-5" />
              <span className="font-medium">{filteredProjects.length} Projects</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-4 mt-20 font-lyrae text-4xl font-bold sm:text-5xl lg:text-6xl">
              <DecryptedText
                text="All Projects"
                speed={100}
                maxIterations={105}
                sequential
                animateOn="view"
              />
            </h1>

            <p
              className={`font-mono text-base sm:text-lg ${
                isDarkMode ? "text-zinc-400" : "text-gray-600"
              }`}
            >
              A complete exploration of all the projects I have developed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-4"
          >
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${
                  isDarkMode ? "text-zinc-400" : "text-gray-400"
                }`}
              />

              <input
                type="text"
                placeholder="Search projects, tags, location, or technologies..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={`w-full rounded-lg border py-3 pl-10 pr-4 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                    : "bg-white border-gray-300 text-black placeholder-gray-500"
                }`}
              />
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2 pb-2 sm:pb-0">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 font-medium transition-all duration-300 ${
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

              {isDesktop && (
                <div
                  className={`flex w-fit rounded-full border p-1 ${
                    isDarkMode
                      ? "border-white/10 bg-white/5"
                      : "border-black/10 bg-black/5"
                  }`}
                >
                  {[
                    { id: "list", label: "List", icon: LayoutList },
                    { id: "grid", label: "Grid", icon: Grid3X3 },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isActive = viewMode === mode.id;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          resetListHover();
                          setViewMode(mode.id);
                        }}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 font-mono text-sm font-bold transition-all ${
                          isActive
                            ? isDarkMode
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : isDarkMode
                            ? "text-zinc-400 hover:text-white"
                            : "text-zinc-600 hover:text-black"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {effectiveViewMode === "list" ? (
        <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div
            className={`hidden border-b pb-4 text-xs uppercase tracking-[0.18em] lg:grid lg:grid-cols-[1.15fr_1.75fr] lg:gap-8 ${
              isDarkMode
                ? "border-white/[0.08] text-zinc-500"
                : "border-black/[0.12] text-zinc-500"
            }`}
          >
            <span>Project</span>

            <div className="grid grid-cols-[0.55fr_0.85fr_0.35fr] gap-8">
              <span>Status</span>
              <span>Services</span>
              <span className="text-right">Year</span>
            </div>
          </div>

          <motion.ul layout className="list-none p-0" onMouseLeave={resetListHover}>
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.li
                  key={project.title}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                  className={`group relative border-b ${
                    isDarkMode ? "border-white/[0.08]" : "border-black/[0.12]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openProjectModal(project)}
                    className="grid w-full grid-cols-1 gap-4 py-7 text-left lg:grid-cols-[1.15fr_1.75fr] lg:items-center lg:gap-8 lg:py-9"
                  >
                    <div
                      ref={(element) => {
                        titleRefs.current[index] = element;
                      }}
                      className="pointer-events-none min-w-0 will-change-transform"
                    >
                      <h2 className="font-lyrae text-[clamp(2.15rem,5.8vw,4.9rem)] font-bold leading-[0.95] tracking-tight transition-opacity duration-300 group-hover:opacity-80">
                        {project.title}
                      </h2>

                      <p
                        className={`mt-4 max-w-xl font-mono text-sm leading-6 lg:hidden ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {project.description}
                      </p>
                    </div>

                    <div
                      ref={(element) => {
                        metaRefs.current[index] = element;
                      }}
                      className="pointer-events-none grid gap-3 font-mono text-sm will-change-transform lg:grid-cols-[0.55fr_0.85fr_0.35fr] lg:gap-8"
                    >
                      <div className={getStatusStyle(project.status)}>
                        <span className="lg:hidden">Status: </span>
                        {project.status}
                      </div>

                      <div className={isDarkMode ? "text-zinc-400" : "text-zinc-600"}>
                        <span className="lg:hidden">Services: </span>
                        {project.tags.slice(0, 3).join(" / ")}
                      </div>

                      <div
                        className={`lg:text-right ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        <span className="lg:hidden">Year: </span>
                        {project.year}
                      </div>
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>

          {filteredProjects.length === 0 && (
            <div
              className={`py-20 text-center font-mono ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              No projects found.
            </div>
          )}
        </section>
      ) : (
        <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <motion.div
            layout
            className="grid grid-cols-1 gap-x-14 gap-y-16 lg:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.article
                  key={project.title}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group cursor-target"
                >
                  <button
                    type="button"
                    onClick={() => openProjectModal(project)}
                    className="w-full text-left"
                  >
                    <div
                      className={`relative mb-8 aspect-[1.18/1] w-full overflow-hidden ${
                        isDarkMode ? "bg-zinc-800" : "bg-[#eeeeee]"
                      }`}
                    >
                      <img
                        src={project.cover || project.image}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
                      />

                      <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          isDarkMode
                            ? "bg-black/10 group-hover:bg-black/0"
                            : "bg-white/5 group-hover:bg-white/0"
                        }`}
                      />
                    </div>

                    <div className="mb-5">
                      <h4
                        className={`font-lyrae text-[clamp(2rem,4vw,3.35rem)] font-bold leading-none tracking-tight ${
                          isDarkMode ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {project.title}
                      </h4>

                      <div
                        className={`mt-5 h-px w-full ${
                          isDarkMode ? "bg-white/15" : "bg-black/15"
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-6 font-mono text-sm">
                      <p
                        className={`min-w-0 truncate ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {project.tags.slice(0, 3).join(" & ")}
                      </p>

                      <p
                        className={`shrink-0 ${
                          isDarkMode ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {project.year}
                      </p>
                    </div>
                  </button>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProjects.length === 0 && (
            <div
              className={`py-20 text-center font-mono ${
                isDarkMode ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              No projects found.
            </div>
          )}
        </section>
      )}

      {isDesktop &&
        effectiveViewMode === "list" &&
        createPortal(
          <>
            <motion.div
              ref={floatingImgRef}
              variants={previewVariants}
              initial="initial"
              animate={
                effectiveViewMode === "list" &&
                isHoveringList &&
                filteredProjects.length > 0
                  ? "enter"
                  : "closed"
              }
              className="pointer-events-none fixed left-0 top-0 z-[60] h-[320px] w-[420px] overflow-hidden rounded-lg shadow-2xl"
            >
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(filteredProjects.length, 1) * 100}%`,
                  transform: `translateY(-${
                    (hoveredIndex / Math.max(filteredProjects.length, 1)) * 100
                  }%)`,
                  transition:
                    "transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)",
                }}
              >
                {filteredProjects.map((project) => (
                  <div
                    key={project.title}
                    style={{
                      width: "100%",
                      height: `${100 / Math.max(filteredProjects.length, 1)}%`,
                    }}
                  >
                    <img
                      src={project.cover || project.image}
                      alt={project.title}
                      className="block h-full w-full object-cover"
                      loading="eager"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              ref={floatingLabelRef}
              variants={previewVariants}
              initial="initial"
              animate={
                effectiveViewMode === "list" &&
                isHoveringList &&
                filteredProjects.length > 0
                  ? "enter"
                  : "closed"
              }
              className="pointer-events-none fixed left-0 top-0 z-[70] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-blue-600 text-sm font-bold tracking-wide text-white"
            >
              View
            </motion.div>
          </>,
          document.body
        )}

      {createPortal(
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(event) => event.stopPropagation()}
                className={`relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl shadow-2xl ${
                  isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
                }`}
              >
                <div className="relative h-64 overflow-hidden rounded-t-2xl sm:h-80">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <button
                    type="button"
                    onClick={closeModal}
                    className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                    aria-label="Close project modal"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-lyrae text-4xl font-bold leading-none text-white sm:text-6xl">
                      {selectedProject.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex flex-wrap gap-4 font-mono text-xs sm:text-sm">
                    <span
                      className={`flex items-center gap-1 ${
                        isDarkMode ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      {selectedProject.year}
                    </span>

                    <span className="flex items-center gap-1 text-blue-500">
                      <Code className="h-4 w-4" />
                      {selectedProject.category}
                    </span>

                    <span
                      className={`flex items-center gap-1 ${getStatusStyle(
                        selectedProject.status
                      )}`}
                    >
                      <Clock className="h-4 w-4" />
                      {selectedProject.status}
                    </span>
                  </div>

                  <h4 className="mb-3 text-xl font-bold">Overview</h4>

                  <p
                    className={`mb-8 font-mono text-sm leading-7 sm:text-base ${
                      isDarkMode ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {selectedProject.description}
                  </p>

                  <div className="mb-10 flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-4 py-1.5 font-mono text-sm ${
                          isDarkMode
                            ? "border-white/10 bg-white/5 text-zinc-300"
                            : "border-black/10 bg-black/5 text-zinc-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    {selectedProject.demo && (
                      <a
                        href={selectedProject.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 font-bold text-white transition hover:bg-blue-700"
                      >
                        <Globe className="h-4 w-4" />
                        Live Demo
                      </a>
                    )}

                    {selectedProject.repo && (
                      <a
                        href={selectedProject.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 rounded-full border px-8 py-3 font-bold transition ${
                          isDarkMode
                            ? "border-white/20 hover:bg-white/10"
                            : "border-black/20 hover:bg-black/5"
                        }`}
                      >
                        <Github className="h-4 w-4" />
                        Repository
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}