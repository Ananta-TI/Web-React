import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Code,
  Clock,
  Globe,
  Github,
  Zap,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { usePageTransition } from "../components/Shared/PageTransition";
import "../index.css";

const Projects = () => {
  const theme = useContext(ThemeContext);

  const isDarkMode =
    theme?.isDarkMode ?? true;

  const navigate =
    useNavigate();

  const {
    transitionTo,
  } = usePageTransition();

  // ───────────────────────────────────────────────────────────────────────────
  // REFS
  // ───────────────────────────────────────────────────────────────────────────

  const buttonRef =
    useRef(null);

  const circleRef =
    useRef(null);

  const floatingImgRef =
    useRef(null);

  const floatingLabelRef =
    useRef(null);

  const titleRefs =
    useRef([]);

  const categoryRefs =
    useRef([]);

  // ───────────────────────────────────────────────────────────────────────────
  // STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [
    isMounted,
    setIsMounted,
  ] = useState(false);

  const [
    isHoverCapable,
    setIsHoverCapable,
  ] = useState(false);

  const [
    isHoveringList,
    setIsHoveringList,
  ] = useState(false);

  const [
    hoveredIndex,
    setHoveredIndex,
  ] = useState(0);

  const [
    selectedProject,
    setSelectedProject,
  ] = useState(null);

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // PROJECT DATA
  // ───────────────────────────────────────────────────────────────────────────

  const projects = [
    {
      id: 1,
      title: "Fashion-Trend",

      description:
        "An AI-powered fashion trend prediction web application built with React, Vite, Tailwind CSS, TensorFlow.js, and Framer Motion. This application allows users to upload fashion product images, analyzes them using a CNN model running directly in the browser, and displays prediction results such as product category, confidence score, trend score, trend status, and top prediction insights.",

      demo:
        "https://fash-trend.vercel.app/",

      repo:
        "https://github.com/Ananta-TI/Fashion-Trend.git",

      tags: [
        "React",
        "Vite",
        "TensorFlow.js",
        "Tailwind",
        "Framer Motion",
      ],

      category:
        "Web Development",

      location:
        "Indonesia",

      image:
        "/img/FashTrend.png",

      cover:
        "/img/cover/12.png",

      year:
        "2026",

      status:
        "Completed",

      featured:
        true,
    },

    {
      id: 2,

      title:
        "Question Legal",

      description:
        "An AI-powered legal assistant chatbot specializing in Indonesian child protection laws. Built using a fine-tuned SBERT semantic search architecture, it delivers accurate, real-time constitutional insights and legal guidance through an elegant, responsive editorial-style interface.",

      demo:
        "https://question-legal.vercel.app/",

      repo:
        "https://github.com/Ananta-TI/chatbot-legal.git",

      tags: [
        "React",
        "Vite",
        "Tailwind",
        "Framer Motion",
      ],

      category:
        "Web Development",

      location:
        "Indonesia",

      image:
        "/img/Chatbot.png",

      cover:
        "/img/cover/15.png",

      year:
        "2026",

      featured:
        true,

      status:
        "Completed",
    },

    {
      id: 3,

      title:
        "Qrion Official Website",

      description:
        "The official company profile website for Qrion, an Indonesian EdTech platform specializing in digital transformation for schools and Islamic boarding schools (pesantren). It showcases an integrated digital ecosystem—including billing, attendance, cashless e-wallet systems, and POS solutions—through a modern and responsive interface designed to streamline educational administration.",

      demo:
        "https://qrion.id/",

      repo:
        null,

      tags: [
        "React",
        "Vite",
        "Tailwind",
        "Framer Motion",
      ],

      category:
        "Web Development",

      location:
        "Indonesia",

      image:
        "/img/qrion.png",

      cover:
        "/img/cover/18.png",

      year:
        "2026",

      featured:
        true,

      status:
        "Completed",
    },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ───────────────────────────────────────────────────────────────────────────

  const getProjectDate = (
    project
  ) => {
    if (project?.date) {
      const date =
        new Date(
          project.date
        );

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return date.toLocaleDateString();
      }
    }

    return (
      project?.year ||
      "2026"
    );
  };

  const getProjectYear = (
    project
  ) => {
    if (
      project?.year
    ) {
      return project.year;
    }

    if (
      project?.date
    ) {
      const date =
        new Date(
          project.date
        );

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return String(
          date.getFullYear()
        );
      }
    }

    return "2026";
  };

  const getProjectDifficulty = (
    project
  ) => {
    return (
      project?.difficulty ||
      project?.category ||
      "Project"
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // MOUNT
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // CHECK HOVER CAPABILITY
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      );

    const updateHoverCapability =
      () => {
        setIsHoverCapable(
          mediaQuery.matches
        );

        if (
          !mediaQuery.matches
        ) {
          setIsHoveringList(
            false
          );
        }
      };

    updateHoverCapability();

    if (
      mediaQuery.addEventListener
    ) {
      mediaQuery.addEventListener(
        "change",
        updateHoverCapability
      );
    } else {
      mediaQuery.addListener(
        updateHoverCapability
      );
    }

    return () => {
      if (
        mediaQuery.removeEventListener
      ) {
        mediaQuery.removeEventListener(
          "change",
          updateHoverCapability
        );
      } else {
        mediaQuery.removeListener(
          updateHoverCapability
        );
      }
    };
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // PROJECT HOVER
  //
  // IMPORTANT:
  //
  // Tidak ada lagi:
  // - loop getBoundingClientRect
  // - scroll detection
  // - detectProjectUnderCursor
  // - itemRefs
  //
  // Hover langsung dari masing-masing <li>.
  // ───────────────────────────────────────────────────────────────────────────

  const handleEnter = (
    index
  ) => {
    if (
      !isHoverCapable
    ) {
      return;
    }

    setHoveredIndex(
      index
    );

    setIsHoveringList(
      true
    );

    const title =
      titleRefs.current[
        index
      ];

    const category =
      categoryRefs.current[
        index
      ];

    if (title) {
      gsap.to(
        title,
        {
          x: 40,

          duration:
            0.55,

          ease:
            "power3.out",

          overwrite:
            "auto",
        }
      );
    }

    if (category) {
      gsap.to(
        category,
        {
          x: -40,

          duration:
            0.55,

          ease:
            "power3.out",

          overwrite:
            "auto",
        }
      );
    }
  };

  const handleLeave = (
    index
  ) => {
    if (
      !isHoverCapable
    ) {
      return;
    }

    const title =
      titleRefs.current[
        index
      ];

    const category =
      categoryRefs.current[
        index
      ];

    if (title) {
      gsap.to(
        title,
        {
          x: 0,

          duration:
            0.45,

          ease:
            "power3.out",

          overwrite:
            "auto",
        }
      );
    }

    if (category) {
      gsap.to(
        category,
        {
          x: 0,

          duration:
            0.45,

          ease:
            "power3.out",

          overwrite:
            "auto",
        }
      );
    }
  };

  const resetListHover =
    () => {
      setIsHoveringList(
        false
      );

      const targets = [
        ...titleRefs.current,
        ...categoryRefs.current,
      ].filter(Boolean);

      if (
        targets.length
      ) {
        gsap.to(
          targets,
          {
            x: 0,

            duration:
              0.35,

            ease:
              "power3.out",

            overwrite:
              "auto",
          }
        );
      }
    };

  // ───────────────────────────────────────────────────────────────────────────
  // FLOATING PROJECT PREVIEW
  //
  // Hanya satu mousemove listener.
  //
  // quickTo lebih ringan dibanding menjalankan gsap.to
  // setiap mousemove.
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      !isHoverCapable ||
      !floatingImgRef.current ||
      !floatingLabelRef.current
    ) {
      return;
    }

    gsap.set(
      floatingImgRef.current,
      {
        left: 0,
        top: 0,
      }
    );

    gsap.set(
      floatingLabelRef.current,
      {
        left: 0,
        top: 0,
      }
    );

    const xImg =
      gsap.quickTo(
        floatingImgRef.current,
        "left",
        {
          duration:
            0.75,

          ease:
            "power3",
        }
      );

    const yImg =
      gsap.quickTo(
        floatingImgRef.current,
        "top",
        {
          duration:
            0.75,

          ease:
            "power3",
        }
      );

    const xLabel =
      gsap.quickTo(
        floatingLabelRef.current,
        "left",
        {
          duration:
            0.4,

          ease:
            "power3",
        }
      );

    const yLabel =
      gsap.quickTo(
        floatingLabelRef.current,
        "top",
        {
          duration:
            0.4,

          ease:
            "power3",
        }
      );

    const onMouseMove = (
      event
    ) => {
      xImg(
        event.clientX
      );

      yImg(
        event.clientY
      );

      xLabel(
        event.clientX
      );

      yLabel(
        event.clientY
      );
    };

    window.addEventListener(
      "mousemove",
      onMouseMove,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        onMouseMove
      );
    };
  }, [
    isHoverCapable,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // VIEW ALL PROJECTS BUTTON
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      !buttonRef.current ||
      !circleRef.current
    ) {
      return;
    }

    const btn =
      buttonRef.current;

    const circle =
      circleRef.current;

    gsap.set(
      circle,
      {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
      }
    );

    if (
      !isHoverCapable
    ) {
      return;
    }

    const xMove =
      gsap.quickTo(
        circle,
        "x",
        {
          duration:
            0.4,

          ease:
            "power3",
        }
      );

    const yMove =
      gsap.quickTo(
        circle,
        "y",
        {
          duration:
            0.4,

          ease:
            "power3",
        }
      );

    const moveCircle = (
      event
    ) => {
      const rect =
        btn.getBoundingClientRect();

      xMove(
        event.clientX -
          rect.left
      );

      yMove(
        event.clientY -
          rect.top
      );
    };

    const enter = (
      event
    ) => {
      const rect =
        btn.getBoundingClientRect();

      gsap.set(
        circle,
        {
          x:
            event.clientX -
            rect.left,

          y:
            event.clientY -
            rect.top,
        }
      );

      gsap.to(
        circle,
        {
          scale: 1,
          opacity: 1,

          duration:
            0.4,

          ease:
            "power3.out",
        }
      );
    };

    const leave = () => {
      gsap.to(
        circle,
        {
          scale: 0,
          opacity: 0,

          duration:
            0.4,

          ease:
            "power3.out",
        }
      );
    };

    btn.addEventListener(
      "mousemove",
      moveCircle
    );

    btn.addEventListener(
      "mouseenter",
      enter
    );

    btn.addEventListener(
      "mouseleave",
      leave
    );

    return () => {
      btn.removeEventListener(
        "mousemove",
        moveCircle
      );

      btn.removeEventListener(
        "mouseenter",
        enter
      );

      btn.removeEventListener(
        "mouseleave",
        leave
      );
    };
  }, [
    isHoverCapable,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // MODAL / LENIS
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (
      !window.lenis
    ) {
      return;
    }

    if (showModal) {
      window.lenis.stop();
    } else {
      window.lenis.start();
    }

    return () => {
      window.lenis?.start();
    };
  }, [
    showModal,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // OPEN MODAL
  // ───────────────────────────────────────────────────────────────────────────

  const openProjectModal = (
    project,
    event
  ) => {
    event.preventDefault();

    resetListHover();

    setSelectedProject(
      project
    );

    setShowModal(
      true
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CLOSE MODAL
  // ───────────────────────────────────────────────────────────────────────────

  const closeModal =
    () => {
      setShowModal(
        false
      );

      setTimeout(
        () => {
          setSelectedProject(
            null
          );
        },
        300
      );
    };

  // ───────────────────────────────────────────────────────────────────────────
  // ALL PROJECTS
  // ───────────────────────────────────────────────────────────────────────────

  const goToAllProjects =
    () => {
      transitionTo(
        () => {
          navigate(
            "/all-projects"
          );
        },
        "PROJECTS"
      );
    };

  // ───────────────────────────────────────────────────────────────────────────
  // FLOATING PREVIEW ANIMATION
  // ───────────────────────────────────────────────────────────────────────────

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
        duration:
          0.4,

        ease: [
          0.76,
          0,
          0.24,
          1,
        ],
      },
    },

    closed: {
      scale: 0,
      x: "-50%",
      y: "-50%",

      transition: {
        duration:
          0.35,

        ease: [
          0.32,
          0,
          0.67,
          0,
        ],
      },
    },
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <section
      id="projects"
      className={`relative min-h-[100svh] w-full py-14 transition-colors duration-500 sm:py-20 md:py-12 ${
        isDarkMode
          ? "bg-zinc-900 text-white"
          : "bg-[#FAF9F9] text-black"
      }`}
    >
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* PROJECT LIST */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-7 pl-1 sm:mb-10 sm:pl-4">
          <h5
            className={`text-xs font-medium uppercase tracking-[0.2em] md:text-sm ${
              isDarkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Recent work
          </h5>
        </div>

        <ul
          className="m-0 w-full list-none space-y-4 p-0 md:space-y-0"
          onMouseLeave={
            isHoverCapable
              ? resetListHover
              : undefined
          }
        >
          {projects.map(
            (
              project,
              index
            ) => (
              <li
                key={
                  project.id
                }
                onMouseEnter={
                  isHoverCapable
                    ? () =>
                        handleEnter(
                          index
                        )
                    : undefined
                }
                onMouseLeave={
                  isHoverCapable
                    ? () =>
                        handleLeave(
                          index
                        )
                    : undefined
                }
                className={`relative w-full overflow-hidden rounded-3xl border md:rounded-none md:border-0 ${
                  isDarkMode
                    ? "border-white/10 bg-white/[0.04] md:bg-transparent"
                    : "border-black/10 bg-zinc-50 md:bg-transparent"
                }`}
              >
                {/* Line */}
                <div
                  className={`absolute left-0 top-0 hidden h-[1px] w-full md:block ${
                    isDarkMode
                      ? "bg-white/10"
                      : "bg-black/10"
                  }`}
                />

                <a
                  href={
                    project.demo ||
                    "#"
                  }
                  onClick={(
                    event
                  ) =>
                    openProjectModal(
                      project,
                      event
                    )
                  }
                  className="block cursor-pointer px-4 py-4 md:flex md:cursor-none md:flex-row md:items-center md:justify-between md:px-8 md:py-16"
                >
                  {/* Mobile image */}
                  <div className="mb-4 overflow-hidden rounded-2xl md:hidden">
                    <img
                      src={
                        project.image
                      }
                      alt={
                        project.title
                      }
                      className="aspect-[16/10] w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Title */}
                  <div
                    ref={(
                      element
                    ) => {
                      titleRefs.current[
                        index
                      ] =
                        element;
                    }}
                    className="pointer-events-none will-change-transform"
                  >
                    <h4 className="max-w-full break-words font-lyrae text-[2.15rem] leading-[0.95] tracking-tight antialiased sm:text-5xl md:text-6xl lg:text-[80px] xl:text-[90px]">
                      {
                        project.title
                      }
                    </h4>
                  </div>

                  {/* Category */}
                  <div
                    ref={(
                      element
                    ) => {
                      categoryRefs.current[
                        index
                      ] =
                        element;
                    }}
                    className="pointer-events-none mt-4 will-change-transform md:mt-0"
                  >
                    <p
                      className={`font-lyrae text-sm antialiased md:text-base ${
                        isDarkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      {
                        project.category
                      }
                    </p>

                    {/* Mobile badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          isDarkMode
                            ? "bg-white/10 text-zinc-300"
                            : "bg-black/5 text-zinc-700"
                        }`}
                      >
                        {
                          project.status
                        }
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          isDarkMode
                            ? "bg-white/10 text-zinc-300"
                            : "bg-black/5 text-zinc-700"
                        }`}
                      >
                        {getProjectYear(
                          project
                        )}
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
            )
          )}

          <div
            className={`hidden h-[1px] w-full md:block ${
              isDarkMode
                ? "bg-white/10"
                : "bg-black/10"
            }`}
          />
        </ul>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* VIEW ALL */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      <div className="container relative z-10 mx-auto mt-12 px-4 text-center sm:mt-20 md:mt-24">
        <Button
          ref={
            buttonRef
          }
          variant="outline"
          onClick={
            goToAllProjects
          }
          className={`group relative w-full max-w-[300px] cursor-pointer overflow-hidden rounded-full border px-6 py-6 text-xs uppercase tracking-[0.15em] transition-colors duration-300 sm:text-sm md:w-auto md:max-w-none md:cursor-target md:rounded-md md:px-10 md:py-8 ${
            isDarkMode
              ? "border-white/20 hover:bg-transparent"
              : "border-black/20 hover:bg-transparent"
          }`}
        >
          <span
            ref={
              circleRef
            }
            className={`absolute left-0 top-0 hidden aspect-square w-[250%] cursor-none rounded-full md:block ${
              isDarkMode
                ? "bg-white"
                : "bg-black"
            }`}
            style={{
              transform:
                "scale(0)",

              opacity:
                0,
            }}
          />

          <span
            className={`relative z-10 font-lyrae font-bold transition-colors duration-300 ${
              isDarkMode
                ? "text-white md:group-hover:text-black"
                : "text-black md:group-hover:text-white"
            }`}
          >
            View All Projects
          </span>
        </Button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* PROJECT COUNT */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      <div className="container relative z-10 mx-auto mt-8 px-4 text-center sm:mt-12">
        <div
          className={`inline-flex max-w-full items-center justify-center gap-2 rounded-full border px-4 py-3 shadow-lg sm:px-6 ${
            isDarkMode
              ? "border-zinc-700 bg-zinc-800 text-zinc-300"
              : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          <Zap className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />

          <span className="font-mono text-xs font-bold leading-relaxed sm:text-base">
            <span className="text-[#F55247]">
              {
                projects.length
              }{" "}
              Projects
            </span>

            {" • "}

            <span className="text-[#FFA828]">
              {
                projects.filter(
                  (
                    project
                  ) =>
                    project.demo
                ).length
              }{" "}
              Live Demos
            </span>
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* FLOATING PREVIEW */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      {isMounted &&
        isHoverCapable &&
        createPortal(
          <>
            {/* Image */}
            <motion.div
              ref={
                floatingImgRef
              }
              variants={
                scaleAnim
              }
              initial="initial"
              animate={
                isHoveringList &&
                !showModal
                  ? "enter"
                  : "closed"
              }
              style={{
                position:
                  "fixed",

                top: 0,
                left: 0,

                width:
                  "400px",

                height:
                  "400px",

                pointerEvents:
                  "none",

                overflow:
                  "hidden",

                borderRadius:
                  "8px",

                zIndex:
                  40,
              }}
            >
              {/*
                Sama seperti AllProjects.

                Container tidak dibuat projects.length * 100%.
                Setiap image = 100% tinggi preview.

                Kita hanya geser top sesuai hoveredIndex.
              */}
              <div
                className="relative h-full w-full"
                style={{
                  top: `${
                    hoveredIndex *
                    -100
                  }%`,

                  transition:
                    isHoveringList
                      ? "top 0.5s cubic-bezier(0.76, 0, 0.24, 1)"
                      : "none",
                }}
              >
                {projects.map(
                  (
                    project
                  ) => (
                    <div
                      key={`preview-${project.id}`}
                      className="h-full w-full"
                    >
                      <img
                        src={
                          project.cover ||
                          project.image
                        }
                        alt={
                          project.title
                        }
                        loading="eager"
                        className="block h-full w-full object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            </motion.div>

            {/* View label */}
            <motion.div
              ref={
                floatingLabelRef
              }
              variants={
                scaleAnim
              }
              initial="initial"
              animate={
                isHoveringList &&
                !showModal
                  ? "enter"
                  : "closed"
              }
              style={{
                position:
                  "fixed",

                top: 0,
                left: 0,

                width:
                  "72px",

                height:
                  "72px",

                borderRadius:
                  "50%",

                background:
                  "#2563eb",

                color:
                  "#fff",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                fontSize:
                  "13px",

                fontWeight:
                  400,

                pointerEvents:
                  "none",

                zIndex:
                  50,

                letterSpacing:
                  "0.03em",
              }}
            >
              View
            </motion.div>
          </>,
          document.body
        )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* PROJECT MODAL */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      {isMounted &&
        createPortal(
          <AnimatePresence>
            {showModal &&
              selectedProject && (
                <motion.div
                  className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  onClick={
                    closeModal
                  }
                >
                  {/* Backdrop */}
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                  {/* Modal */}
                  <motion.div
                    initial={{
                      opacity:
                        0,

                      scale:
                        0.95,

                      y: 20,
                    }}
                    animate={{
                      opacity:
                        1,

                      scale:
                        1,

                      y: 0,
                    }}
                    exit={{
                      opacity:
                        0,

                      scale:
                        0.95,

                      y: 20,
                    }}
                    transition={{
                      duration:
                        0.3,

                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    className={`relative max-h-[88svh] w-full max-w-3xl overflow-y-auto rounded-3xl shadow-2xl sm:rounded-xl ${
                      isDarkMode
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={(
                      event
                    ) =>
                      event.stopPropagation()
                    }
                  >
                    {/* Hero image */}
                    <div className="relative h-52 overflow-hidden rounded-t-3xl sm:h-80 sm:rounded-t-xl">
                      <img
                        src={
                          selectedProject.image
                        }
                        alt={
                          selectedProject.title
                        }
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Close */}
                      <button
                        type="button"
                        onClick={
                          closeModal
                        }
                        className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/80"
                        aria-label="Close project modal"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      {/* Title */}
                      <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
                        <span className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:hidden">
                          {
                            selectedProject.category
                          }
                        </span>

                        <h3 className="mb-2 font-lyrae text-4xl font-bold leading-none tracking-tight text-white sm:text-6xl">
                          {
                            selectedProject.title
                          }
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-8">
                      {/* Meta */}
                      <div className="mb-6 grid grid-cols-1 gap-3 font-mono text-xs sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:text-sm">
                        <span
                          className={`flex items-center gap-2 rounded-2xl px-3 py-2 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0 ${
                            isDarkMode
                              ? "bg-white/5 text-gray-400"
                              : "bg-black/5 text-gray-500"
                          }`}
                        >
                          <Calendar className="h-4 w-4 shrink-0" />

                          {getProjectDate(
                            selectedProject
                          )}
                        </span>

                        <span className="flex items-center gap-2 rounded-2xl bg-yellow-500/10 px-3 py-2 text-yellow-500 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
                          <Code className="h-4 w-4 shrink-0" />

                          {getProjectDifficulty(
                            selectedProject
                          )}
                        </span>

                        <span className="flex items-center gap-2 rounded-2xl bg-green-500/10 px-3 py-2 text-green-500 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
                          <Clock className="h-4 w-4 shrink-0" />

                          {selectedProject.status ||
                            "Completed"}
                        </span>
                      </div>

                      {/* Overview */}
                      <h4 className="mb-3 text-xl font-bold">
                        Overview
                      </h4>

                      <p
                        className={`mb-8 font-mono text-sm leading-7 sm:text-base ${
                          isDarkMode
                            ? "text-gray-300"
                            : "text-gray-600"
                        }`}
                      >
                        {
                          selectedProject.description
                        }
                      </p>

                      {/* Tags */}
                      <div className="mb-8 flex flex-wrap gap-2 sm:mb-10">
                        {selectedProject.tags?.map(
                          (
                            tag
                          ) => (
                            <span
                              key={
                                tag
                              }
                              className={`rounded-full border px-3 py-1.5 font-mono text-xs sm:px-4 sm:text-sm ${
                                isDarkMode
                                  ? "border-white/10 bg-white/5 text-gray-300"
                                  : "border-black/10 bg-black/5 text-gray-700"
                              }`}
                            >
                              {
                                tag
                              }
                            </span>
                          )
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                        {selectedProject.demo && (
                          <a
                            href={
                              selectedProject.demo
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-white transition duration-300 hover:bg-blue-700 sm:w-auto"
                          >
                            <Globe className="h-4 w-4" />

                            Live Demo
                          </a>
                        )}

                        {selectedProject.repo && (
                          <a
                            href={
                              selectedProject.repo
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-8 py-3 transition duration-300 sm:w-auto ${
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
    </section>
  );
};

export default Projects;