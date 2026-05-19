import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const SOURCE_MODULES = import.meta.glob("/src/**/*.{js,jsx,ts,tsx,css}", {
  query: "?raw",
  import: "default",
  eager: true,
});

const ZODIACS = [
  {
    id: "aries",
    name: "ARIES",
    symbol: "♈",
    code: "ZOD-01",
    latin: "THE RAM",
    status: "ASCENDING",
    points: [
      [95, 145, 4],
      [130, 108, 3],
      [170, 120, 5],
      [205, 96, 3],
      [242, 118, 4],
      [276, 94, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  {
    id: "taurus",
    name: "TAURUS",
    symbol: "♉",
    code: "ZOD-02",
    latin: "THE BULL",
    status: "LOCKED",
    points: [
      [78, 164, 3],
      [120, 126, 5],
      [160, 142, 3],
      [202, 116, 5],
      [244, 154, 3],
      [276, 112, 4],
      [210, 82, 3],
      [132, 88, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [3, 6],
      [1, 7],
    ],
  },
  {
    id: "gemini",
    name: "GEMINI",
    symbol: "♊",
    code: "ZOD-03",
    latin: "THE TWINS",
    status: "SYNCHRONIZED",
    points: [
      [115, 76, 4],
      [115, 128, 3],
      [108, 182, 4],
      [96, 226, 3],
      [225, 72, 4],
      [222, 130, 3],
      [230, 182, 4],
      [246, 224, 3],
      [116, 128, 3],
      [222, 130, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [5, 6],
      [6, 7],
      [0, 4],
      [8, 9],
      [2, 6],
    ],
  },
  {
    id: "cancer",
    name: "CANCER",
    symbol: "♋",
    code: "ZOD-04",
    latin: "THE CRAB",
    status: "MAPPING",
    points: [
      [104, 116, 3],
      [146, 154, 4],
      [184, 132, 3],
      [220, 164, 5],
      [258, 136, 3],
      [170, 202, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
    ],
  },
  {
    id: "leo",
    name: "LEO",
    symbol: "♌",
    code: "ZOD-05",
    latin: "THE LION",
    status: "AMPLIFIED",
    points: [
      [76, 170, 3],
      [116, 132, 4],
      [154, 112, 3],
      [196, 126, 5],
      [236, 98, 3],
      [276, 128, 4],
      [220, 176, 3],
      [164, 202, 4],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [3, 6],
      [6, 7],
      [7, 0],
    ],
  },
  {
    id: "virgo",
    name: "VIRGO",
    symbol: "♍",
    code: "ZOD-06",
    latin: "THE MAIDEN",
    status: "STABILIZED",
    points: [
      [78, 116, 3],
      [116, 150, 4],
      [154, 132, 3],
      [194, 166, 4],
      [238, 146, 3],
      [282, 176, 5],
      [214, 220, 3],
      [146, 214, 4],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [3, 6],
      [6, 7],
      [7, 1],
    ],
  },
  {
    id: "libra",
    name: "LIBRA",
    symbol: "♎",
    code: "ZOD-07",
    latin: "THE SCALES",
    status: "BALANCED",
    points: [
      [92, 176, 4],
      [132, 136, 3],
      [180, 120, 5],
      [228, 136, 3],
      [270, 176, 4],
      [128, 216, 3],
      [232, 216, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [4, 6],
      [5, 6],
    ],
  },
  {
    id: "scorpio",
    name: "SCORPIO",
    symbol: "♏",
    code: "ZOD-08",
    latin: "THE SCORPION",
    status: "CHARGED",
    points: [
      [68, 130, 3],
      [108, 152, 4],
      [150, 138, 3],
      [190, 164, 4],
      [230, 144, 3],
      [270, 174, 5],
      [294, 134, 3],
      [260, 104, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },
  {
    id: "sagittarius",
    name: "SAGITTARIUS",
    symbol: "♐",
    code: "ZOD-09",
    latin: "THE ARCHER",
    status: "TARGETING",
    points: [
      [84, 210, 3],
      [126, 168, 4],
      [166, 128, 3],
      [216, 92, 5],
      [272, 74, 3],
      [222, 148, 3],
      [260, 190, 4],
      [172, 198, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5],
      [5, 6],
      [1, 7],
    ],
  },
  {
    id: "capricorn",
    name: "CAPRICORN",
    symbol: "♑",
    code: "ZOD-10",
    latin: "THE GOAT",
    status: "CALIBRATING",
    points: [
      [74, 140, 3],
      [114, 112, 4],
      [158, 132, 3],
      [200, 118, 4],
      [246, 148, 3],
      [284, 192, 5],
      [218, 218, 3],
      [152, 194, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 2],
    ],
  },
  {
    id: "aquarius",
    name: "AQUARIUS",
    symbol: "♒",
    code: "ZOD-11",
    latin: "THE WATER BEARER",
    status: "STREAMING",
    points: [
      [70, 116, 3],
      [110, 144, 4],
      [150, 116, 3],
      [190, 144, 4],
      [230, 116, 3],
      [270, 144, 4],
      [90, 190, 3],
      [132, 216, 4],
      [174, 190, 3],
      [216, 216, 4],
      [258, 190, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
    ],
  },
  {
    id: "pisces",
    name: "PISCES",
    symbol: "♓",
    code: "ZOD-12",
    latin: "THE FISHES",
    status: "ORBITING",
    points: [
      [88, 108, 4],
      [122, 76, 3],
      [160, 104, 4],
      [132, 146, 3],
      [184, 164, 3],
      [228, 128, 4],
      [268, 158, 3],
      [236, 200, 4],
      [192, 218, 3],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 4],
      [3, 4],
    ],
  },
];

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function analyzeSourceModules() {
  const entries = Object.entries(SOURCE_MODULES || {});
  const files = entries.map(([path]) => path);
  const sourceTexts = entries.map(([, content]) => String(content || ""));
  const allSource = sourceTexts.join("\n");

  const routeMatches = [];
  const routePatterns = [
    /path\s*=\s*["'`]([^"'`]+)["'`]/g,
    /navigate\(\s*["'`]([^"'`]+)["'`]/g,
    /to\s*=\s*["'`]([^"'`]+)["'`]/g,
    /href\s*=\s*["'`]([^"'`]+)["'`]/g,
  ];

  routePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(allSource)) !== null) {
      const value = match[1];

      if (
        value &&
        value.startsWith("/") &&
        !value.startsWith("/img") &&
        !value.startsWith("/assets") &&
        !value.includes(".")
      ) {
        routeMatches.push(value);
      }
    }
  });

  const assetMatches = [];
  const assetPattern = /\/(?:img|images|assets|icons|video|videos)\/[^"'`)\s]+/g;
  let assetMatch;

  while ((assetMatch = assetPattern.exec(allSource)) !== null) {
    assetMatches.push(assetMatch[0]);
  }

  const techMap = {
    React: "react",
    Vite: "vite",
    Tailwind: "tailwind",
    GSAP: "gsap",
    "Framer Motion": "framer-motion",
    Supabase: "supabase",
    Router: "react-router-dom",
    Lenis: "lenis",
    Lucide: "lucide-react",
    Three: "three",
  };

  const techStack = Object.entries(techMap)
    .filter(([, token]) => allSource.toLowerCase().includes(token))
    .map(([label]) => label);

  const componentFiles = entries.filter(([path, content]) => {
    const text = String(content || "");

    return (
      /\.(jsx|tsx)$/.test(path) ||
      /export\s+default\s+function\s+[A-Z]/.test(text) ||
      /const\s+[A-Z][A-Za-z0-9_]*\s*=\s*\(/.test(text)
    );
  });

  const cssFiles = files.filter((file) => /\.css$/.test(file));
  const hookCount = (allSource.match(/use[A-Z][A-Za-z0-9_]+/g) || []).length;
  const animationCount = (
    allSource.match(/gsap|motion\.|AnimatePresence|@keyframes/g) || []
  ).length;

  return {
    files,
    filesCount: files.length,
    componentCount: componentFiles.length,
    cssCount: cssFiles.length,
    routes: uniqueList(routeMatches),
    assetRefs: uniqueList(assetMatches),
    techStack: uniqueList(techStack),
    hookCount,
    animationCount,
  };
}

const SOURCE_SUMMARY = analyzeSourceModules();

function getInitialTelemetry() {
  return {
    title: "Loading document",
    host: "runtime pending",
    path: "/",
    theme: "pending",
    viewport: "0x0",
    domNodes: 0,
    links: 0,
    scripts: 0,
    stylesheets: 0,
    imagesTotal: 0,
    imagesLoaded: 0,
    resourceTotal: 0,
    jsResources: 0,
    cssResources: 0,
    imgResources: 0,
    routeCount: SOURCE_SUMMARY.routes.length,
    loadTime: "N/A",
    memory: "N/A",
    connection: "N/A",
    downlink: "N/A",
    scrollPercent: "0%",
    detectedRoutes: SOURCE_SUMMARY.routes.slice(0, 8),
  };
}

function collectRuntimeTelemetry(isDarkMode) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return getInitialTelemetry();
  }

  const anchors = Array.from(document.querySelectorAll("a[href]"));

  const sameOriginRoutes = anchors
    .map((anchor) => {
      try {
        const url = new URL(anchor.href);

        if (url.origin !== window.location.origin) return null;

        return url.pathname;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter((path) => !path.includes("."));

  const detectedRoutes = uniqueList([
    ...SOURCE_SUMMARY.routes,
    ...sameOriginRoutes,
  ]);

  const images = Array.from(document.images || []);

  const resources =
    typeof performance !== "undefined" && performance.getEntriesByType
      ? performance.getEntriesByType("resource")
      : [];

  const navigation =
    typeof performance !== "undefined" && performance.getEntriesByType
      ? performance.getEntriesByType("navigation")[0]
      : null;

  const scrollMax =
    document.documentElement.scrollHeight - window.innerHeight;

  const scrollPercent =
    scrollMax > 0
      ? `${Math.round((window.scrollY / scrollMax) * 100)}%`
      : "0%";

  const memoryInfo =
    typeof performance !== "undefined" ? performance.memory : null;

  const memory =
    memoryInfo && memoryInfo.usedJSHeapSize
      ? `${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)} MB`
      : "N/A";

  const connectionInfo =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    null;

  return {
    title: document.title || "Untitled",
    host: window.location.host,
    path: window.location.pathname,
    theme: isDarkMode ? "dark / bg-zinc-900" : "light / #faf9f9",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    domNodes: document.querySelectorAll("*").length,
    links: anchors.length,
    scripts: document.scripts.length,
    stylesheets: document.styleSheets.length,
    imagesTotal: images.length,
    imagesLoaded: images.filter((image) => image.complete).length,
    resourceTotal: resources.length,
    jsResources: resources.filter(
      (entry) => entry.initiatorType === "script" || entry.name.endsWith(".js")
    ).length,
    cssResources: resources.filter(
      (entry) =>
        entry.initiatorType === "css" ||
        entry.initiatorType === "link" ||
        entry.name.endsWith(".css")
    ).length,
    imgResources: resources.filter(
      (entry) =>
        entry.initiatorType === "img" ||
        /\.(png|jpg|jpeg|webp|gif|svg|avif)$/i.test(entry.name)
    ).length,
    routeCount: detectedRoutes.length,
    loadTime: navigation
      ? `${Math.round(safeNumber(navigation.duration, 0))}ms`
      : "N/A",
    memory,
    connection: connectionInfo?.effectiveType || "N/A",
    downlink: connectionInfo?.downlink
      ? `${connectionInfo.downlink}mbps`
      : "N/A",
    scrollPercent,
    detectedRoutes: detectedRoutes.slice(0, 8),
  };
}

function buildTypingLines(site, fps, zodiac) {
  const tech = SOURCE_SUMMARY.techStack.slice(0, 5).join(", ") || "runtime";
  const routePreview = site.detectedRoutes?.slice(0, 3).join(", ") || site.path;

  return [
    `const activeRoute = "${site.path}";`,
    `const sourceFiles = ${SOURCE_SUMMARY.filesCount};`,
    `const components = ${SOURCE_SUMMARY.componentCount};`,
    `const techStack = "${tech}";`,
    `const constellation = "${zodiac.name} / ${zodiac.symbol}";`,
    `const routes = "${routePreview}";`,
    `scanDOM({ nodes: ${site.domNodes}, links: ${site.links}, images: "${site.imagesLoaded}/${site.imagesTotal}" });`,
    `monitorResources({ js: ${site.jsResources}, css: ${site.cssResources}, total: ${site.resourceTotal} });`,
    `hydrateTheme("${site.theme}");`,
    `renderTelemetry({ fps: ${fps}, memory: "${site.memory}", load: "${site.loadTime}" });`,
  ];
}

function buildLogPool(site, fps, zodiac) {
  const tech = SOURCE_SUMMARY.techStack.slice(0, 4).join(" / ") || "No stack";
  const routes = site.detectedRoutes?.length || 0;
  const assets = SOURCE_SUMMARY.assetRefs.length + site.imagesTotal;

  return [
    `[SRC] ${SOURCE_SUMMARY.filesCount} source files indexed`,
    `[COMP] ${SOURCE_SUMMARY.componentCount} React components detected`,
    `[ROUTE] ${routes} routes mapped / active ${site.path}`,
    `[ASSET] ${assets} asset references + DOM images`,
    `[DOM] ${site.domNodes} nodes mounted`,
    `[IMG] ${site.imagesLoaded}/${site.imagesTotal} images loaded`,
    `[RES] ${site.jsResources} JS / ${site.cssResources} CSS resources`,
    `[PERF] load ${site.loadTime} / fps ${fps}`,
    `[THEME] ${site.theme}`,
    `[NET] ${site.connection} / ${site.downlink}`,
    `[ZOD] ${zodiac.code} ${zodiac.name} constellation active`,
    `[STACK] ${tech}`,
  ];
}

function HologramConstellation({ zodiac }) {
  return (
    <svg viewBox="0 0 360 300" className="jarvis-zodiac-svg">
      <defs>
        <radialGradient id={`zodiac-glow-${zodiac.id}`}>
          <stop offset="0%" stopColor="rgba(var(--fg), 0.78)" />
          <stop offset="48%" stopColor="rgba(var(--fg), 0.2)" />
          <stop offset="100%" stopColor="rgba(var(--fg), 0)" />
        </radialGradient>
      </defs>

      <circle cx="180" cy="150" r="112" className="jarvis-zodiac-orbit" />
      <circle
        cx="180"
        cy="150"
        r="78"
        className="jarvis-zodiac-orbit jarvis-zodiac-orbit-soft"
      />

      {zodiac.lines.map(([from, to], index) => {
        const start = zodiac.points[from];
        const end = zodiac.points[to];

        return (
          <line
            key={`${from}-${to}-${index}`}
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
            className="jarvis-zodiac-line"
          />
        );
      })}

      {zodiac.points.map(([x, y, size], index) => (
        <g key={`${zodiac.id}-${index}`}>
          <circle
            cx={x}
            cy={y}
            r={size * 4.4}
            fill={`url(#zodiac-glow-${zodiac.id})`}
            className="jarvis-zodiac-star-glow"
          />
          <circle
            cx={x}
            cy={y}
            r={size}
            className="jarvis-zodiac-star"
            style={{
              animationDelay: `${index * 0.14}s`,
            }}
          />
        </g>
      ))}

      <text x="180" y="164" textAnchor="middle" className="jarvis-zodiac-symbol">
        {zodiac.symbol}
      </text>
    </svg>
  );
}

function MiniPanel({ title, value, meter = 52 }) {
  const clamped = Math.max(6, Math.min(100, meter));

  return (
    <div className="jarvis-panel">
      <div className="jarvis-panel-title">{title}</div>
      <div className="jarvis-panel-value">{value}</div>
      <div className="jarvis-panel-meter">
        <span style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default function CommandFieldBackground({ className = "" }) {
  const { isDarkMode } = useContext(ThemeContext);

  const rootRef = useRef(null);
  const zodiacRef = useRef(null);
  const rafRef = useRef(null);
  const telemetryIntervalRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const zodiacIntervalRef = useRef(null);
  const logIntervalRef = useRef(null);
  const fpsFrameRef = useRef(null);

  const typingLinesRef = useRef([]);
  const logPoolRef = useRef([]);

  const [activeZodiac, setActiveZodiac] = useState(0);
  const [typedCode, setTypedCode] = useState("");
  const [siteData, setSiteData] = useState(getInitialTelemetry);
  const [fps, setFps] = useState(60);
  const [logs, setLogs] = useState(() => {
    const stamp = new Date().toLocaleTimeString("id-ID", { hour12: false });

    return [
      `${stamp} [SRC] ${SOURCE_SUMMARY.filesCount} source files indexed`,
      `${stamp} [COMP] ${SOURCE_SUMMARY.componentCount} components detected`,
      `${stamp} [ROUTE] ${SOURCE_SUMMARY.routes.length} source routes mapped`,
      `${stamp} [ASSET] ${SOURCE_SUMMARY.assetRefs.length} source asset references`,
      `${stamp} [STACK] ${
        SOURCE_SUMMARY.techStack.join(" / ") || "runtime pending"
      }`,
    ];
  });

  const zodiac = ZODIACS[activeZodiac];

  const palette = isDarkMode
    ? {
        bg: "#18181b",
        fg: "255,255,255",
        fade: "24,24,27",
      }
    : {
        bg: "#faf9f9",
        fg: "0,0,0",
        fade: "250,249,249",
      };

  const statusRows = useMemo(
    () => [
      ["ROUTE", siteData.path],
      ["THEME", isDarkMode ? "DARK" : "LIGHT"],
      ["FILES", SOURCE_SUMMARY.filesCount],
      ["COMPONENTS", SOURCE_SUMMARY.componentCount],
      ["ZODIAC", `${zodiac.code} ${zodiac.name}`],
      ["FPS", fps],
    ],
    [siteData.path, isDarkMode, zodiac.code, zodiac.name, fps]
  );

  useEffect(() => {
    typingLinesRef.current = buildTypingLines(siteData, fps, zodiac);
    logPoolRef.current = buildLogPool(siteData, fps, zodiac);
  }, [siteData, fps, zodiac]);

  useEffect(() => {
    const updateTelemetry = () => {
      setSiteData(collectRuntimeTelemetry(isDarkMode));
    };

    updateTelemetry();

    telemetryIntervalRef.current = window.setInterval(updateTelemetry, 1400);

    window.addEventListener("resize", updateTelemetry);
    window.addEventListener("scroll", updateTelemetry, { passive: true });

    const lenis = window.lenis;

    if (lenis?.on) {
      lenis.on("scroll", updateTelemetry);
    }

    return () => {
      window.clearInterval(telemetryIntervalRef.current);
      window.removeEventListener("resize", updateTelemetry);
      window.removeEventListener("scroll", updateTelemetry);

      if (lenis?.off) {
        lenis.off("scroll", updateTelemetry);
      }
    };
  }, [isDarkMode]);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();

    const loop = (now) => {
      frames += 1;

      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }

      fpsFrameRef.current = requestAnimationFrame(loop);
    };

    fpsFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (fpsFrameRef.current) {
        cancelAnimationFrame(fpsFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const zodiacDock = zodiacRef.current;

    if (!root || !zodiacDock) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const setDefaultMouse = () => {
      const rect = root.getBoundingClientRect();

      root.style.setProperty("--mouse-x", `${rect.width * 0.5}px`);
      root.style.setProperty("--mouse-y", `${rect.height * 0.45}px`);

      targetX = 0;
      targetY = 0;
    };

    const handlePointerMove = (event) => {
      const rect = root.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;

      root.style.setProperty("--mouse-x", `${localX}px`);
      root.style.setProperty("--mouse-y", `${localY}px`);

      targetX = (event.clientX / window.innerWidth - 0.5) * 22;
      targetY = (event.clientY / window.innerHeight - 0.5) * 16;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      root.style.setProperty("--scroll-y", `${scrollY * 0.035}px`);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;

      if (!prefersReducedMotion) {
        zodiacDock.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    setDefaultMouse();
    handleScroll();
    animate();

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", setDefaultMouse);

    const lenis = window.lenis;

    if (lenis?.on) {
      lenis.on("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", setDefaultMouse);

      if (lenis?.off) {
        lenis.off("scroll", handleScroll);
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    zodiacIntervalRef.current = window.setInterval(() => {
      setActiveZodiac((current) => (current + 1) % ZODIACS.length);
    }, 3400);

    return () => {
      window.clearInterval(zodiacIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let pauseId = null;

    typingIntervalRef.current = window.setInterval(() => {
      const lines = typingLinesRef.current.length
        ? typingLinesRef.current
        : buildTypingLines(siteData, fps, zodiac);

      const line = lines[lineIndex % lines.length] || "";

      if (charIndex < line.length) {
        setTypedCode(line.slice(0, charIndex + 1));
        charIndex += 1;
      } else if (!pauseId) {
        pauseId = window.setTimeout(() => {
          charIndex = 0;
          lineIndex = (lineIndex + 1) % lines.length;
          setTypedCode("");
          pauseId = null;
        }, 520);
      }
    }, 34);

    return () => {
      window.clearInterval(typingIntervalRef.current);

      if (pauseId) {
        window.clearTimeout(pauseId);
      }
    };
  }, []);

  useEffect(() => {
    let cursor = 0;

    logIntervalRef.current = window.setInterval(() => {
      const pool = logPoolRef.current.length
        ? logPoolRef.current
        : buildLogPool(siteData, fps, zodiac);

      const stamp = new Date().toLocaleTimeString("id-ID", {
        hour12: false,
      });

      const next = pool[cursor % pool.length];
      cursor += 1;

      setLogs((current) => {
        const updated = [`${stamp} ${next}`, ...current];
        return updated.slice(0, 9);
      });
    }, 740);

    return () => {
      window.clearInterval(logIntervalRef.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={[
        "pointer-events-none absolute inset-0 overflow-hidden",
        isDarkMode ? "bg-zinc-900" : "bg-[#faf9f9]",
        className,
      ].join(" ")}
      style={{
        "--mouse-x": "50%",
        "--mouse-y": "45%",
        "--scroll-y": "0px",
        "--bg": palette.bg,
        "--fg": palette.fg,
        "--fade": palette.fade,
      }}
    >
      <style>
        {`
          @keyframes jarvisGridMove {
            from { background-position: 0 0, 0 0; }
            to { background-position: 80px 80px, 80px 80px; }
          }

          @keyframes jarvisGridMoveLarge {
            from { background-position: 0 0, 0 0; }
            to { background-position: 240px 240px, 240px 240px; }
          }

          @keyframes jarvisRingSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes jarvisRingSpinReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }

          @keyframes jarvisPulse {
            0%, 100% { opacity: 0.28; transform: scale(1); }
            50% { opacity: 0.64; transform: scale(1.025); }
          }

          @keyframes jarvisDataStream {
            from { transform: translateX(-12%); }
            to { transform: translateX(12%); }
          }

          @keyframes jarvisBlink {
            0%, 45% { opacity: 1; }
            46%, 100% { opacity: 0; }
          }

          @keyframes jarvisStarPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.55); }
          }

          @keyframes jarvisConstellationFloat {
            0%, 100% { transform: translateY(0) rotateX(0deg); }
            50% { transform: translateY(-8px) rotateX(6deg); }
          }

          .jarvis-grid {
            background-image:
              linear-gradient(to right, rgba(var(--fg), 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(var(--fg), 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
            animation: jarvisGridMove 20s linear infinite;
          }

          .jarvis-grid-large {
            background-image:
              linear-gradient(to right, rgba(var(--fg), 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(var(--fg), 0.1) 1px, transparent 1px);
            background-size: 160px 160px;
            animation: jarvisGridMoveLarge 36s linear infinite reverse;
          }

          .jarvis-perspective {
            transform: perspective(900px) rotateX(62deg) translateY(calc(-12% + var(--scroll-y)));
            transform-origin: center top;
          }

          .jarvis-terminal {
            border: 1px solid rgba(var(--fg), 0.13);
            background:
              linear-gradient(135deg, rgba(var(--fg), 0.035), transparent),
              rgba(var(--bg), 0.42);
            backdrop-filter: blur(10px);
          }

          .jarvis-panel {
            border: 1px solid rgba(var(--fg), 0.12);
            background: rgba(var(--bg), 0.38);
            backdrop-filter: blur(10px);
            padding: 0.85rem;
            min-height: 5.8rem;
          }

          .jarvis-panel-title {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.62rem;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(var(--fg), 0.42);
            margin-bottom: 0.65rem;
          }

          .jarvis-panel-value {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 0.78rem;
            color: rgba(var(--fg), 0.78);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .jarvis-panel-meter {
            height: 0.25rem;
            background: rgba(var(--fg), 0.08);
            margin-top: 0.85rem;
            overflow: hidden;
          }

          .jarvis-panel-meter span {
            display: block;
            height: 100%;
            background: rgba(var(--fg), 0.32);
          }

          .jarvis-ring-a {
            animation: jarvisRingSpin 18s linear infinite;
          }

          .jarvis-ring-b {
            animation: jarvisRingSpinReverse 12s linear infinite;
          }

          .jarvis-ring-c {
            animation: jarvisRingSpin 8s linear infinite;
          }

          .jarvis-pulse {
            animation: jarvisPulse 4s ease-in-out infinite;
          }

          .jarvis-stream {
            animation: jarvisDataStream 8s ease-in-out infinite alternate;
          }

          .jarvis-cursor {
            animation: jarvisBlink 0.8s steps(1) infinite;
          }

          .jarvis-zodiac-svg {
            width: min(21vw, 19rem);
            height: min(31vh, 20rem);
            overflow: visible;
            filter: drop-shadow(0 0 14px rgba(var(--fg), 0.18));
            transform-origin: center;
            animation: jarvisConstellationFloat 4.8s ease-in-out infinite;
          }

          .jarvis-zodiac-line {
            stroke: rgba(var(--fg), 0.46);
            stroke-width: 1.25;
            stroke-linecap: round;
            stroke-dasharray: 7 8;
          }

          .jarvis-zodiac-star {
            fill: rgba(var(--fg), 0.88);
            transform-box: fill-box;
            transform-origin: center;
            animation: jarvisStarPulse 2.2s ease-in-out infinite;
          }

          .jarvis-zodiac-star-glow {
            opacity: 0.75;
          }

          .jarvis-zodiac-orbit {
            fill: none;
            stroke: rgba(var(--fg), 0.12);
            stroke-width: 1;
            stroke-dasharray: 6 10;
          }

          .jarvis-zodiac-orbit-soft {
            stroke: rgba(var(--fg), 0.07);
          }

          .jarvis-zodiac-symbol {
            font-size: 4.3rem;
            font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
            fill: rgba(var(--fg), 0.11);
          }

          @media (prefers-reduced-motion: reduce) {
            .jarvis-grid,
            .jarvis-grid-large,
            .jarvis-ring-a,
            .jarvis-ring-b,
            .jarvis-ring-c,
            .jarvis-pulse,
            .jarvis-stream,
            .jarvis-cursor,
            .jarvis-zodiac-svg,
            .jarvis-zodiac-star {
              animation: none !important;
            }
          }
        `}
      </style>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(760px circle at var(--mouse-x) var(--mouse-y), rgba(var(--fg), 0.09), transparent 60%),
            linear-gradient(135deg, var(--bg) 0%, var(--bg) 48%, var(--bg) 100%)
          `,
        }}
      />

      <div className="jarvis-perspective absolute inset-x-[-10%] top-[14%] h-[90%] opacity-65">
        <div className="jarvis-grid absolute inset-0" />
        <div className="jarvis-grid-large absolute inset-0" />
      </div>

      <div
        className="absolute left-1/2 top-1/2 z-[2] h-[62vh] w-[44vw] -translate-x-1/2 -translate-y-1/2 rounded-[40%] blur-xl"
        style={{
          background:
            "radial-gradient(circle, rgba(var(--fade), 0.94) 0%, rgba(var(--fade), 0.84) 46%, rgba(var(--fade), 0) 72%)",
        }}
      />

      <div
        className="absolute left-[6%] top-[11%] z-[3] hidden w-[23rem] rounded-xl p-4 md:block jarvis-terminal"
        style={{ color: "rgba(var(--fg), 0.8)" }}
      >
        <div
          className="mb-3 flex items-center justify-between border-b pb-2 font-mono text-[10px] uppercase tracking-[0.24em] opacity-70"
          style={{ borderColor: "rgba(var(--fg), 0.12)" }}
        >
          <span>{siteData.title}</span>
          <span>{siteData.host}</span>
        </div>

        <div className="font-mono text-[11px] leading-6">
          <div style={{ color: "rgba(var(--fg),0.46)" }}>
            route: {siteData.path}
          </div>

          <div style={{ color: "rgba(var(--fg),0.46)" }}>
            stack: {SOURCE_SUMMARY.techStack.slice(0, 4).join(" / ") || "none"}
          </div>

          <div
            className="mt-3 break-words"
            style={{ color: "rgba(var(--fg),0.82)" }}
          >
            {"> "}
            {typedCode}
            <span className="jarvis-cursor">▌</span>
          </div>
        </div>
      </div>

      <div
        className="absolute left-[6%] top-[52%] z-[3] hidden w-[23rem] rounded-xl p-4 lg:block jarvis-terminal"
        style={{ color: "rgba(var(--fg), 0.78)" }}
      >
        <div
          className="mb-3 border-b pb-2 font-mono text-[10px] uppercase tracking-[0.24em] opacity-70"
          style={{ borderColor: "rgba(var(--fg), 0.12)" }}
        >
          Runtime Logs / Real Web Telemetry
        </div>

        <div className="space-y-2 font-mono text-[10px] leading-4">
          {logs.map((log, index) => (
            <div
              key={`${log}-${index}`}
              className="truncate"
              style={{
                opacity: 1 - index * 0.075,
              }}
            >
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-[6%] top-[10%] z-[3] hidden w-[22rem] space-y-3 lg:block">
        {statusRows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b py-2 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ borderColor: "rgba(var(--fg),0.1)" }}
          >
            <span style={{ color: "rgba(var(--fg),0.38)" }}>{label}</span>

            <span
              className="max-w-[13rem] truncate text-right"
              style={{ color: "rgba(var(--fg),0.78)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <div
        ref={zodiacRef}
        className="absolute right-[6.5%] top-[33%] z-[3] hidden h-[17rem] w-[22rem] items-center justify-center lg:flex"
      >
        <div
          className="absolute inset-0 rounded-full border opacity-50"
          style={{ borderColor: "rgba(var(--fg), 0.11)" }}
        />

        <div
          className="absolute h-[16rem] w-[16rem] rounded-full border jarvis-ring-a"
          style={{ borderColor: "rgba(var(--fg), 0.11)" }}
        />

        <div
          className="absolute h-[11rem] w-[11rem] rounded-full border jarvis-ring-b"
          style={{ borderColor: "rgba(var(--fg), 0.18)" }}
        />

        <div
          className="absolute h-[7rem] w-[7rem] rounded-full border jarvis-ring-c"
          style={{ borderColor: "rgba(var(--fg), 0.12)" }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-1 text-center font-mono uppercase tracking-[0.32em]">
            <div
              className="text-[9px]"
              style={{ color: "rgba(var(--fg),0.36)" }}
            >
              {zodiac.code}
            </div>

            <div
              className="text-xs"
              style={{ color: "rgba(var(--fg),0.72)" }}
            >
              {zodiac.name}
            </div>

            <div
              className="text-[8px]"
              style={{ color: "rgba(var(--fg),0.28)" }}
            >
              {zodiac.latin} / {zodiac.status}
            </div>
          </div>

          <div className="relative">
            <HologramConstellation zodiac={zodiac} />

            <div
              className="jarvis-pulse absolute inset-0 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(var(--fg), 0.1), transparent 62%)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute right-[6%] bottom-[13%] z-[3] hidden w-[22rem] grid-cols-2 gap-3 lg:grid">
        <MiniPanel
          title="Routes"
          value={siteData.routeCount}
          meter={siteData.routeCount * 14}
        />

        <MiniPanel
          title="Components"
          value={SOURCE_SUMMARY.componentCount}
          meter={SOURCE_SUMMARY.componentCount * 5}
        />

        <MiniPanel
          title="Assets"
          value={SOURCE_SUMMARY.assetRefs.length + siteData.imagesTotal}
          meter={(SOURCE_SUMMARY.assetRefs.length + siteData.imagesTotal) * 4}
        />

        <MiniPanel title="DOM Nodes" value={siteData.domNodes} meter={70} />

        <MiniPanel title="JS Files" value={siteData.jsResources} meter={58} />

        <MiniPanel title="CSS Files" value={siteData.cssResources} meter={42} />
      </div>

      <div className="absolute bottom-[8%] left-0 right-0 z-[1] hidden h-24 overflow-hidden md:block">
        <div className="jarvis-stream flex h-full w-[130%] -translate-x-[8%] items-end gap-1 px-8">
          {Array.from({ length: 140 }).map((_, index) => (
            <span
              key={index}
              className="block w-px"
              style={{
                height: `${
                  14 +
                  ((index * 17 +
                    SOURCE_SUMMARY.filesCount +
                    siteData.resourceTotal) %
                    68)
                }%`,
                background:
                  index % 5 === 0
                    ? "rgba(var(--fg),0.28)"
                    : "rgba(var(--fg),0.09)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute left-[6%] bottom-[7%] z-[3] hidden font-mono text-[10px] uppercase tracking-[0.24em] md:block"
        style={{ color: "rgba(var(--fg),0.24)" }}
      >
        Source {SOURCE_SUMMARY.filesCount} / Components{" "}
        {SOURCE_SUMMARY.componentCount} / Hooks {SOURCE_SUMMARY.hookCount}
      </div>

      <div
        className="absolute right-[6%] bottom-[7%] z-[3] hidden font-mono text-[10px] uppercase tracking-[0.24em] md:block"
        style={{ color: "rgba(var(--fg),0.24)" }}
      >
        Load {siteData.loadTime} / FPS {fps} / Scroll {siteData.scrollPercent}
      </div>

      <div
        className="absolute z-[2] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          left: "var(--mouse-x)",
          top: "var(--mouse-y)",
          background:
            "radial-gradient(circle, rgba(var(--fg), 0.045), transparent 62%)",
        }}
      />

      <div
        className="absolute z-[3] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-60"
        style={{
          left: "var(--mouse-x)",
          top: "var(--mouse-y)",
          borderColor: "rgba(var(--fg), 0.12)",
        }}
      >
        <div
          className="absolute left-1/2 top-[-2rem] h-8 w-px -translate-x-1/2"
          style={{ background: "rgba(var(--fg), 0.12)" }}
        />

        <div
          className="absolute bottom-[-2rem] left-1/2 h-8 w-px -translate-x-1/2"
          style={{ background: "rgba(var(--fg), 0.12)" }}
        />

        <div
          className="absolute left-[-2rem] top-1/2 h-px w-8 -translate-y-1/2"
          style={{ background: "rgba(var(--fg), 0.12)" }}
        />

        <div
          className="absolute right-[-2rem] top-1/2 h-px w-8 -translate-y-1/2"
          style={{ background: "rgba(var(--fg), 0.12)" }}
        />
      </div>

      <div
        className="absolute inset-0 z-[4]"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(var(--fade), 0.42) 0%, rgba(var(--fade), 0.26) 30%, transparent 58%)",
        }}
      />

      <div
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, transparent 0%, transparent 46%, rgba(var(--fade), 0.78) 100%)",
        }}
      />

      <div
        className="absolute inset-0 z-[6]"
        style={{
          background: isDarkMode
            ? "linear-gradient(to bottom, rgba(24,24,27,0.02), rgba(24,24,27,0.76))"
            : "linear-gradient(to bottom, rgba(250,249,249,0.02), rgba(250,249,249,0.72))",
        }}
      />
    </div>
  );
}