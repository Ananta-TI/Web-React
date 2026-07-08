import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { createPortal } from "react-dom";
import { X, Calendar, Code, Clock, Globe, Github, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { usePageTransition } from "../components/Shared/PageTransition";
import "../index.css";

const Projects = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const navigate = useNavigate();
  const { transitionTo } = usePageTransition();

  const sectionRef = useRef(null);
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const activeIndexRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0, ready: false });
  const scrollFrameRef = useRef(null);

  const buttonRef = useRef(null);
  const circleRef = useRef(null);
  const floatingImgRef = useRef(null);
  const floatingLabelRef = useRef(null);

  const titleRefs = useRef([]);
  const categoryRefs = useRef([]);

  const [isMounted, setIsMounted] = useState(false);
  const [isHoverCapable, setIsHoverCapable] = useState(false);
  const [isHoveringList, setIsHoveringList] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const projects = [
    {
      id: 1,
      title: "Fashion-Trend",
      description:
        "An AI-powered fashion trend prediction web application built with React, Vite, Tailwind CSS, TensorFlow.js, and Framer Motion. This application allows users to upload fashion product images, analyzes them using a CNN model running directly in the browser, and displays prediction results such as product category, confidence score, trend score, trend status, and top prediction insights.",
      demo: "https://fash-trend.vercel.app/",
      repo: "https://github.com/Ananta-TI/Fashion-Trend.git",
      tags: ["React", "Vite", "TensorFlow.js", "Tailwind", "Framer Motion"],
      category: "Web Development",
      location: "Indonesia",
      image: "/img/FashTrend.png",
      cover: "/img/cover/12.png",
      year: "2026",
      status: "Completed",
      featured: true,
    },
    {
      id: 2,
      title: "Indonesian Culinary",
      description:
        "A React-based culinary platform showcasing local Indonesian food products with a modern and responsive UI. It allows users to explore traditional snacks, healthy meals, and contemporary cuisines while supporting local culinary SMEs.",
      demo: "https://react-nta.vercel.app/guest",
      repo: "https://github.com/Ananta-TI/React-Nta.git",
      tags: ["React", "Tailwind", "UI/UX"],
      category: "Web Development",
      image: "/img/Sedap2.png",
      date: "2023-05-20",
      difficulty: "Intermediate",
      featured: true,
      status: "Completed",
    },
    {
      id: 3,
      title: "Asetra Inventory",
      description:
        "An inventory management system built with React and a modern interface, designed to improve business efficiency and data organization.",
      demo: "https://asetra-inventory.vercel.app/",
      repo: "https://github.com/Ananta-TI/react-inventory.git",
      tags: ["React", "Inventory", "Management"],
      category: "Web Application",
      image: "/img/react-inventory2.png",
      date: "2023-08-10",
      difficulty: "Intermediate",
      featured: true,
      status: "In Progress",
    },
  ];

  const getProjectDate = (project) => {
    if (project?.date) {
      const date = new Date(project.date);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }

    return project?.year || "2026";
  };

  const getProjectYear = (project) => {
    if (project?.year) return project.year;

    if (project?.date) {
      const date = new Date(project.date);

      if (!Number.isNaN(date.getTime())) {
        return String(date.getFullYear());
      }
    }

    return "2026";
  };

  const getProjectDifficulty = (project) => {
    return project?.difficulty || project?.category || "Project";
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const updateHoverCapability = () => {
      setIsHoverCapable(mediaQuery.matches);

      if (!mediaQuery.matches) {
        clearProjectHover();
      }
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

  const handleEnter = (index) => {
    if (!isHoverCapable) return;

    const title = titleRefs.current[index];
    const category = categoryRefs.current[index];

    if (!title || !category) return;

    gsap.to(title, {
      x: 40,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(category, {
      x: -40,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const handleLeave = (index) => {
    const title = titleRefs.current[index];
    const category = categoryRefs.current[index];

    if (!title || !category) return;

    gsap.to(title, {
      x: 0,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });

    gsap.to(category, {
      x: 0,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const activateProjectHover = (index) => {
    if (!isHoverCapable) return;
    if (index === null || index === undefined) return;

    if (activeIndexRef.current === index) {
      setIsHoveringList(true);
      return;
    }

    if (activeIndexRef.current !== null) {
      handleLeave(activeIndexRef.current);
    }

    activeIndexRef.current = index;
    setHoveredIndex(index);
    setIsHoveringList(true);
    handleEnter(index);
  };

  const clearProjectHover = () => {
    if (activeIndexRef.current !== null) {
      handleLeave(activeIndexRef.current);
    }

    activeIndexRef.current = null;
    setIsHoveringList(false);
  };

  const syncFloatingPreviewPosition = () => {
    if (!isHoverCapable || !lastPointerRef.current.ready) return;

    const { x, y } = lastPointerRef.current;

    if (floatingImgRef.current) {
      gsap.set(floatingImgRef.current, {
        left: x,
        top: y,
      });
    }

    if (floatingLabelRef.current) {
      gsap.set(floatingLabelRef.current, {
        left: x,
        top: y,
      });
    }
  };

  const detectProjectUnderCursor = () => {
    if (!isHoverCapable || showModal || !lastPointerRef.current.ready) return;

    const { x, y } = lastPointerRef.current;
    const list = listRef.current;

    if (!list) return;

    const listRect = list.getBoundingClientRect();

    const isInsideList =
      x >= listRect.left &&
      x <= listRect.right &&
      y >= listRect.top &&
      y <= listRect.bottom;

    if (!isInsideList) {
      clearProjectHover();
      return;
    }

    let matchedIndex = null;

    itemRefs.current.forEach((item, index) => {
      if (!item) return;

      const rect = item.getBoundingClientRect();

      const isInsideItem =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;

      if (isInsideItem) {
        matchedIndex = index;
      }
    });

    if (matchedIndex === null) {
      clearProjectHover();
      return;
    }

    syncFloatingPreviewPosition();
    activateProjectHover(matchedIndex);
  };

  const handlePointerMove = (event) => {
    if (!isHoverCapable) return;

    lastPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      ready: true,
    };

    detectProjectUnderCursor();
  };

  const handleScrollHoverCheck = () => {
    if (!isHoverCapable) return;

    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      detectProjectUnderCursor();
    });
  };

  useEffect(() => {
    if (!isHoverCapable) {
      clearProjectHover();
      return;
    }

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScrollHoverCheck, { passive: true });

    const lenis = window.lenis;

    if (lenis?.on) {
      lenis.on("scroll", handleScrollHoverCheck);
    }

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("scroll", handleScrollHoverCheck);

      if (lenis?.off) {
        lenis.off("scroll", handleScrollHoverCheck);
      }

      if (scrollFrameRef.current) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [showModal, isHoverCapable]);

  useEffect(() => {
    if (!buttonRef.current || !circleRef.current) return;

    const btn = buttonRef.current;
    const circle = circleRef.current;

    gsap.set(circle, {
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 0,
    });

    if (!isHoverCapable) return;

    const xMove = gsap.quickTo(circle, "x", {
      duration: 0.4,
      ease: "power3",
    });

    const yMove = gsap.quickTo(circle, "y", {
      duration: 0.4,
      ease: "power3",
    });

    const moveCircle = (event) => {
      const rect = btn.getBoundingClientRect();

      xMove(event.clientX - rect.left);
      yMove(event.clientY - rect.top);
    };

    const enter = (event) => {
      const rect = btn.getBoundingClientRect();

      gsap.set(circle, {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });

      gsap.to(circle, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const leave = () => {
      gsap.to(circle, {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    btn.addEventListener("mousemove", moveCircle);
    btn.addEventListener("mouseenter", enter);
    btn.addEventListener("mouseleave", leave);

    return () => {
      btn.removeEventListener("mousemove", moveCircle);
      btn.removeEventListener("mouseenter", enter);
      btn.removeEventListener("mouseleave", leave);
    };
  }, [isHoverCapable]);

  useEffect(() => {
    if (!window.lenis) return;

    if (showModal) {
      window.lenis.stop();
    } else {
      window.lenis.start();
    }

    return () => {
      window.lenis?.start();
    };
  }, [showModal]);

  useEffect(() => {
    if (!isHoverCapable) return;
    if (!floatingImgRef.current || !floatingLabelRef.current) return;

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
  }, [isHoverCapable]);

  const openProjectModal = (project, event) => {
    event.preventDefault();

    clearProjectHover();
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);

    setTimeout(() => {
      setSelectedProject(null);
    }, 300);
  };

  const goToAllProjects = () => {
    transitionTo(() => {
      navigate("/all-projects");
    }, "PROJECTS");
  };

  const scaleAnim = {
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

  return (
    <section
      ref={sectionRef}
      id="projects"
      className={`relative w-full min-h-[100svh] py-14 sm:py-20 md:py-12 transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#FAF9F9] text-black"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-7 sm:mb-10 pl-1 sm:pl-4">
          <h5
            className={`text-xs md:text-sm uppercase tracking-[0.2em] font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Recent work
          </h5>
        </div>

        <ul
          ref={listRef}
          className="w-full m-0 p-0 list-none space-y-4 md:space-y-0"
          onMouseLeave={isHoverCapable ? clearProjectHover : undefined}
        >
          {projects.map((project, index) => (
            <li
              key={project.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              onMouseEnter={
                isHoverCapable ? () => activateProjectHover(index) : undefined
              }
              className={`relative w-full overflow-hidden rounded-3xl md:rounded-none border md:border-0 ${
                isDarkMode
                  ? "border-white/10 bg-white/[0.04] md:bg-transparent"
                  : "border-black/10 bg-zinc-50 md:bg-transparent"
              }`}
            >
              <div
                className={`hidden md:block absolute top-0 left-0 w-full h-[1px] ${
                  isDarkMode ? "bg-white/10" : "bg-black/10"
                }`}
              />

              <a
                href={project.demo || "#"}
                onClick={(event) => openProjectModal(project, event)}
                className="block cursor-pointer px-4 py-4 md:cursor-none md:flex md:flex-row md:items-center md:justify-between md:py-16 md:px-8"
              >
                <div className="md:hidden mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div
                  ref={(element) => {
                    titleRefs.current[index] = element;
                  }}
                  className="pointer-events-none will-change-transform"
                >
                  <h4 className="max-w-full break-words text-[2.15rem] leading-[0.95] tracking-tight antialiased font-lyrae sm:text-5xl md:text-6xl lg:text-[80px] xl:text-[90px]">
                    {project.title}
                  </h4>
                </div>

                <div
                  ref={(element) => {
                    categoryRefs.current[index] = element;
                  }}
                  className="mt-4 pointer-events-none will-change-transform md:mt-0"
                >
                  <p
                    className={`text-sm md:text-base font-lyrae antialiased ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {project.category}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isDarkMode
                          ? "bg-white/10 text-zinc-300"
                          : "bg-black/5 text-zinc-700"
                      }`}
                    >
                      {project.status}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isDarkMode
                          ? "bg-white/10 text-zinc-300"
                          : "bg-black/5 text-zinc-700"
                      }`}
                    >
                      {getProjectYear(project)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        isDarkMode
                          ? "bg-white/10 text-zinc-300"
                          : "bg-black/5 text-zinc-700"
                      }`}
                    >
                      Detail
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}

          <div
            className={`hidden md:block w-full h-[1px] ${
              isDarkMode ? "bg-white/10" : "bg-black/10"
            }`}
          />
        </ul>
      </div>

      <div className="container mx-auto px-4 mt-12 sm:mt-20 md:mt-24 text-center relative z-10">
        <Button
          ref={buttonRef}
          variant="outline"
          onClick={goToAllProjects}
          className={`group relative overflow-hidden cursor-pointer md:cursor-target rounded-full md:rounded-md w-full max-w-[300px] md:w-auto md:max-w-none px-6 md:px-10 py-6 md:py-8 uppercase text-xs sm:text-sm tracking-[0.15em] border transition-colors duration-300 ${
            isDarkMode
              ? "border-white/20 hover:bg-transparent"
              : "border-black/20 hover:bg-transparent"
          }`}
        >
          <span
            ref={circleRef}
            className={`hidden md:block absolute top-0 left-0 w-[250%] rounded-full aspect-square cursor-none ${
              isDarkMode ? "bg-white" : "bg-black"
            }`}
            style={{
              transform: "scale(0)",
              opacity: 0,
            }}
          />

          <span
            className={`relative z-10 transition-colors duration-300 font-lyrae font-bold ${
              isDarkMode
                ? "text-white md:group-hover:text-black"
                : "text-black md:group-hover:text-white"
            }`}
          >
            View All Projects
          </span>
        </Button>
      </div>

      <div className="container mx-auto px-4 mt-8 sm:mt-12 text-center relative z-10">
        <div
          className={`inline-flex max-w-full items-center justify-center gap-2 rounded-full px-4 py-3 sm:px-6 ${
            isDarkMode
              ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
              : "bg-white text-gray-600 border border-gray-200"
          } shadow-lg`}
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />

          <span className="font-bold font-mono text-xs leading-relaxed sm:text-base">
            <span className="text-[#F55247]">{projects.length} Projects</span>{" "}
            •{" "}
            <span className="text-[#FFA828]">
              {projects.filter((project) => project.demo).length} Live Demos
            </span>
          </span>
        </div>
      </div>

      {isMounted &&
        isHoverCapable &&
        createPortal(
          <>
            <motion.div
              ref={floatingImgRef}
              variants={scaleAnim}
              initial="initial"
              animate={isHoveringList ? "enter" : "closed"}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "400px",
                height: "400px",
                pointerEvents: "none",
                overflow: "hidden",
                borderRadius: "8px",
                zIndex: 40,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${projects.length * 100}%`,
                  transform: `translateY(-${
                    (hoveredIndex / projects.length) * 100
                  }%)`,
                  transition:
                    "transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)",
                }}
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      width: "100%",
                      height: `${100 / projects.length}%`,
                    }}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              ref={floatingLabelRef}
              variants={scaleAnim}
              initial="initial"
              animate={isHoveringList ? "enter" : "closed"}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 400,
                pointerEvents: "none",
                zIndex: 50,
                letterSpacing: "0.03em",
              }}
            >
              View
            </motion.div>
          </>,
          document.body,
        )}

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {showModal && selectedProject && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
              >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: 20,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative w-full max-w-3xl max-h-[88svh] overflow-y-auto rounded-3xl sm:rounded-xl shadow-2xl ${
                    isDarkMode
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="relative h-52 overflow-hidden rounded-t-3xl sm:h-80 sm:rounded-t-xl">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/80 transition-colors backdrop-blur-md"
                      aria-label="Close project modal"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
                      <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:hidden">
                        {selectedProject.category}
                      </span>

                      <h3 className="text-3xl sm:text-5xl font-light text-white mb-2 tracking-tight leading-none">
                        {selectedProject.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 sm:p-8">
                    <div className="grid grid-cols-1 gap-3 mb-6 text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm">
                      <span
                        className={`flex items-center gap-2 rounded-2xl px-3 py-2 sm:rounded-none sm:px-0 sm:py-0 ${
                          isDarkMode
                            ? "bg-white/5 text-gray-400 sm:bg-transparent"
                            : "bg-black/5 text-gray-500 sm:bg-transparent"
                        }`}
                      >
                        <Calendar className="w-4 h-4 shrink-0" />
                        {getProjectDate(selectedProject)}
                      </span>

                      <span className="flex items-center gap-2 rounded-2xl px-3 py-2 text-yellow-500 bg-yellow-500/10 sm:bg-transparent sm:rounded-none sm:px-0 sm:py-0">
                        <Code className="w-4 h-4 shrink-0" />
                        {getProjectDifficulty(selectedProject)}
                      </span>

                      <span className="flex items-center gap-2 rounded-2xl px-3 py-2 text-green-500 bg-green-500/10 sm:bg-transparent sm:rounded-none sm:px-0 sm:py-0">
                        <Clock className="w-4 h-4 shrink-0" />
                        {selectedProject.status || "Completed"}
                      </span>
                    </div>

                    <h4 className="text-xl font-medium mb-3">Overview</h4>

                    <p
                      className={`font-light leading-relaxed mb-8 text-sm sm:text-base ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {selectedProject.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
                      {selectedProject.tags?.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1.5 text-xs sm:px-4 sm:text-sm rounded-full font-light border ${
                            isDarkMode
                              ? "border-white/10 text-gray-300 bg-white/5"
                              : "border-black/10 text-gray-700 bg-black/5"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {selectedProject.demo && (
                        <a
                          href={selectedProject.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
                        >
                          <Globe className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}

                      {selectedProject.repo && (
                        <a
                          href={selectedProject.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 rounded-full border transition duration-300 ${
                            isDarkMode
                              ? "border-white/20 hover:bg-white/10"
                              : "border-black/20 hover:bg-black/5"
                          }`}
                        >
                          <Github className="w-4 h-4" />
                          Repository
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
};

export default Projects;