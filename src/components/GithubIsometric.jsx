import React, { useEffect, useRef, useContext, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ThemeContext } from "../context/ThemeContext.jsx";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   Minimal Orbit Controls (Modified: No Zoom)
───────────────────────────────────────────── */
function createOrbitControls(camera, domElement) {
  let isPointerDown = false;
  let lastX = 0, lastY = 0;
  let spherical = { theta: -0.6, phi: 1.0 };
  const radius = () => camera.position.length();
  const MIN_PHI = 0.15, MAX_PHI = Math.PI / 2 - 0.05;

  function updateCamera() {
    const r = radius();
    camera.position.set(
      r * Math.sin(spherical.phi) * Math.sin(spherical.theta),
      r * Math.cos(spherical.phi),
      r * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    );
    camera.lookAt(0, 0, 0);
  }

  function onPointerDown(e) {
    isPointerDown = true;
    lastX = e.clientX; lastY = e.clientY;
  }
  function onPointerMove(e) {
    if (!isPointerDown) return;
    const dx = (e.clientX - lastX) * 0.008;
    const dy = (e.clientY - lastY) * 0.006;
    spherical.theta -= dx;
    spherical.phi = Math.max(MIN_PHI, Math.min(MAX_PHI, spherical.phi + dy));
    lastX = e.clientX; lastY = e.clientY;
    updateCamera();
  }
  function onPointerUp() { isPointerDown = false; }

  domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  updateCamera();

  return () => {
    domElement.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };
}

/* ─────────────────────────────────────────────
   Color helpers
───────────────────────────────────────────── */
const DARK_PALETTE = [
  "#161b22", 
  "#0e4429", 
  "#006d32", 
  "#26a641", 
  "#39d353", 
];
const LIGHT_PALETTE = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];

function levelFromCount(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 6) return 2;
  if (count <= 12) return 3;
  return 4;
}

function formatDateRange(startDate, endDate) {
  const options = { month: 'short', day: 'numeric' };
  const start = new Date(startDate).toLocaleDateString('en-US', options);
  const end = new Date(endDate).toLocaleDateString('en-US', options);
  return `${start} → ${end}`;
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function GithubIsometric({ username = "Ananta-TI" }) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const frameRef = useRef(null);

  // Refs rotasi utama (Y-axis)
  const baseSpeed = 0.002; 
  const currentDirection = useRef(1); 
  const currentSpeed = useRef(baseSpeed); 
  const targetSpeed = useRef(baseSpeed);
  const lastScrollY = useRef(0);

  // 🔥 Ref untuk menyimpan posisi rotasi absolut secara permanen
  const currentRotationY = useRef(0);

  // Refs untuk Gyroscope Paralaks
  const gyroTarget = useRef({ x: 0, z: 0 });
  const gyroCurrent = useRef({ x: 0, z: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null); 
  
  // State data utama
  const [allDays, setAllDays] = useState([]);
  
  // Kontrol UI
  const [showEmptyDays, setShowEmptyDays] = useState(false); 
  const [isRotating, setIsRotating] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltip, setTooltip] = useState(null); 
  
  // 🔥 MENGGUNAKAN REF UNTUK MENGHINDARI REMOUNT TIGA.JS
  const showEmptyDaysRef = useRef(showEmptyDays);
  const isRotatingRef = useRef(true);
  const isMobileRef = useRef(false);

  useEffect(() => {
    showEmptyDaysRef.current = showEmptyDays;
  }, [showEmptyDays]);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      isMobileRef.current = mobile;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- LOGIKA PARALLAX YANG SUPER SMOOTH ---
  const { scrollY } = useScroll();
  
  const yContribRaw = useTransform(scrollY, [0, 1000], [0, 450]);
  const yContribSmooth = useSpring(yContribRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const yStreaksRaw = useTransform(scrollY, [0, 1000], [0, -450]);
  const yStreaksSmooth = useSpring(yStreaksRaw, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* ── 1. Fetch data ── */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const currentYear = new Date().getFullYear();
    const prevYear = currentYear - 1;

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${prevYear}&y=${currentYear}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const days = Array.isArray(data.contributions) ? data.contributions : [];
        if (days.length === 0) throw new Error("No contribution data");

        days.sort((a, b) => a.date.localeCompare(b.date));
        const recent = days.slice(-730);

        const total = recent.reduce((s, d) => s + d.count, 0);
        const best = recent.reduce((a, b) => (b.count > a.count ? b : a), recent[0]);
        const last7 = recent.slice(-7).reduce((s, d) => s + d.count, 0);
        const activeDays = recent.filter((d) => d.count > 0).length;
        const avg = (total / Math.max(1, activeDays)).toFixed(2);

        let longest = 0, current = 0, run = 0;
        let longestStart = "", longestEnd = "", currentStart = "";
        let tempStart = "";

        for (const d of recent) {
          if (d.count > 0) {
            if (run === 0) tempStart = d.date;
            run++; 
            if (run > longest) {
              longest = run;
              longestStart = tempStart;
              longestEnd = d.date;
            }
          } else { run = 0; }
        }

        for (let i = recent.length - 1; i >= 0; i--) {
          if (recent[i].count > 0) {
            current++;
            currentStart = recent[i].date;
          } else { break; }
        }

        const today = recent[recent.length - 1].date;
        const weekAgo = recent[Math.max(0, recent.length - 7)].date;
        const yearAgo = recent[0].date;

        setStats({ 
          total, thisWeek: last7, bestDay: best.count, bestDate: best.date, 
          longestStreak: longest, currentStreak: current, avg,
          dateRange: formatDateRange(yearAgo, today), weekRange: formatDateRange(weekAgo, today),
          longestRange: longest > 0 ? formatDateRange(longestStart, longestEnd) : "-",
          currentRange: current > 0 ? formatDateRange(currentStart, today) : "-"
        });

        setAllDays(recent);
        setLoading(false);
      })
      .catch((e) => {
        console.error("GithubIsometric fetch error:", e);
        setError(`Failed to load contributions: ${e.message}`);
        setLoading(false);
      });
  }, [username]);


  /* ── 2. Build Persistent Three.js scene ── */
  useEffect(() => {
    if (allDays.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    if (rendererRef.current) rendererRef.current.dispose();
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0); 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.3 : 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, isDarkMode ? 1.5 : 1.2);
    sun.position.set(20, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 150;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
    fill.position.set(-20, 20, -20);
    scene.add(fill);

    const PALETTE = isDarkMode ? DARK_PALETTE : LIGHT_PALETTE;
    const CELL = 1.2;
    const GAP = 0.3;
    const STEP = CELL + GAP;

    // 🔥 PRE-CALCULATE DUA LAYOUT SEKALIGUS
    const activeDaysOnly = allDays.filter(d => d.count > 0);
    const numWeeksFull = Math.max(Math.ceil(allDays.length / 7), 1);
    const numWeeksPacked = Math.max(Math.ceil(activeDaysOnly.length / 7), 1);

    const offsetXFull = -(numWeeksFull * STEP) / 2;
    const offsetZFull = -(7 * STEP) / 2;

    const offsetXPacked = -(numWeeksPacked * STEP) / 2;
    const offsetZPacked = -(7 * STEP) / 2;

    const gridWidthFull = numWeeksFull * STEP;
    const gridWidthPacked = numWeeksPacked * STEP;

    // Grid Floor
    const gridPlaneGeo = new THREE.PlaneGeometry(1, 7 * STEP); // Base 1 untuk scale mulus
    const gridPlaneMat = new THREE.MeshStandardMaterial({ 
      color: isDarkMode ? 0x0d1117 : 0xe1e4e8,
      roughness: 0.8, metalness: 0.2
    });
    const gridPlane = new THREE.Mesh(gridPlaneGeo, gridPlaneMat);
    gridPlane.rotation.x = -Math.PI / 2;
    gridPlane.position.y = -0.1;
    gridPlane.receiveShadow = true;
    gridPlane.scale.x = showEmptyDaysRef.current ? gridWidthFull : gridWidthPacked;
    scene.add(gridPlane);

    // Grid Lines
    const gridLinesGeo = new THREE.PlaneGeometry(1, 7 * STEP, Math.max(1, numWeeksFull), 7);
    const gridLinesMat = new THREE.MeshBasicMaterial({ 
      color: isDarkMode ? 0x30363d : 0xd1d5da, 
      wireframe: true, transparent: true, opacity: 0.5 
    });
    const gridLines = new THREE.Mesh(gridLinesGeo, gridLinesMat);
    gridLines.rotation.x = -Math.PI / 2;
    gridLines.position.y = -0.09;
    gridLines.scale.x = showEmptyDaysRef.current ? gridWidthFull : gridWidthPacked;
    scene.add(gridLines);

    const meshGroups = [];
    const barGroup = new THREE.Group();
    let packedIndex = 0;

    allDays.forEach((day, i) => {
      // Posisi Full (365 hari)
      const wi_full = Math.floor(i / 7);
      const di_full = i % 7;
      const x_full = offsetXFull + wi_full * STEP + (STEP/2);
      const z_full = offsetZFull + di_full * STEP + (STEP/2);

      // Posisi Packed (Hanya hari aktif)
      let x_packed = x_full;
      let z_packed = z_full;
      let isPackedActive = false;

      if (day.count > 0) {
        const wi_packed = Math.floor(packedIndex / 7);
        const di_packed = packedIndex % 7;
        x_packed = offsetXPacked + wi_packed * STEP + (STEP/2);
        z_packed = offsetZPacked + di_packed * STEP + (STEP/2);
        isPackedActive = true;
        packedIndex++;
      }

      const level = levelFromCount(day.count);
      const height = level * 2.0 + 0.5;
      const color = PALETTE[level];

      const geo = new THREE.BoxGeometry(CELL, height, CELL);
      // 🔥 Geser titik sumbu ke bawah, jadi saat mengecil dia tenggelam
      geo.translate(0, height / 2, 0); 

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.3, metalness: 0.1,
        emissive: new THREE.Color(color).multiplyScalar(level > 0 ? 0.4 : 0.0),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true; mesh.receiveShadow = true;

      const startIsFull = showEmptyDaysRef.current;
      mesh.position.set(
        startIsFull ? x_full : (isPackedActive ? x_packed : x_full),
        0, 
        startIsFull ? z_full : (isPackedActive ? z_packed : z_full)
      );
      
      // 🔥 Set skala awal di SEMUA sumbu (X, Y, Z)
      const initialScale = startIsFull ? 1 : (isPackedActive ? 1 : 0.001);
      mesh.scale.set(initialScale, initialScale, initialScale);

      // Simpan rute target ke dalam memori kotak
      mesh.userData = { 
        date: day.date, count: day.count, level,
        x_full, z_full, x_packed, z_packed, isPackedActive,
        baseRotX: 0, baseRotZ: 0
      };
      
      barGroup.add(mesh);
      meshGroups.push(mesh);
    });

    scene.add(barGroup);

    // Initial Camera
    const initialZoom = showEmptyDaysRef.current ? 2.15 : Math.max(0.4, numWeeksPacked / 20);
    const w = canvas.clientWidth;
    if (w < 768) {
      camera.position.set(-15 * initialZoom, 30 * initialZoom, 45 * initialZoom); 
    } else {
      camera.position.set(-10 * initialZoom, 20 * initialZoom, 25 * initialZoom); 
    }

    // ─────────────────────────────────────────────
    // EVENT LISTENERS
    // ─────────────────────────────────────────────
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (isMobileRef.current) return; 
      const delta = window.scrollY - lastScrollY.current;
      if (Math.abs(delta) > 0) {
        currentDirection.current = delta > 0 ? -1 : 1;
        targetSpeed.current = (currentDirection.current * baseSpeed) - (delta * 0.0015);
      }
      lastScrollY.current = window.scrollY;
    };

    const handleOrientation = (event) => {
      if (isMobileRef.current || event.beta === null || event.gamma === null) return;
      gyroTarget.current.x = Math.max(-0.3, Math.min(0.3, (event.beta - 45) * 0.003));
      gyroTarget.current.z = Math.max(-0.3, Math.min(0.3, event.gamma * 0.003));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh = null;

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshGroups);
      
      if (hits.length > 0) {
        hoveredMesh = hits[0].object;
        setTooltip({ x: clientX - rect.left, y: clientY - rect.top, date: hoveredMesh.userData.date, count: hoveredMesh.userData.count });
        document.body.style.cursor = 'pointer';
      } else {
        hoveredMesh = null; setTooltip(null); document.body.style.cursor = 'default';
      }
    }
    
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchstart", onMouseMove, { passive: true });

    const cleanupControls = createOrbitControls(camera, canvas);

    const ro = new ResizeObserver(() => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw === 0 || ch === 0) return; 
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001; 
      
      const isFull = showEmptyDaysRef.current;

      // 🔥 1. MORPHING GRID & LANTAI
      const targetGridWidth = isFull ? gridWidthFull : gridWidthPacked;
      gridPlane.scale.x += (targetGridWidth - gridPlane.scale.x) * 0.08;
      gridLines.scale.x += (targetGridWidth - gridLines.scale.x) * 0.08;

      // 🔥 2. MORPHING KOTAK-KOTAK (SLIDE & SHRINK ALL AXES)
      meshGroups.forEach(mesh => {
        // Ambil tujuan target sesuai state toggle saat ini
        const targetX = isFull ? mesh.userData.x_full : mesh.userData.x_packed;
        const targetZ = isFull ? mesh.userData.z_full : mesh.userData.z_packed;
        
        // Target skala untuk SEMUA sumbu
        const targetScale = isFull ? 1 : (mesh.userData.isPackedActive ? 1 : 0.001);

        // Slide Posisi
        mesh.position.x += (targetX - mesh.position.x) * 0.08;
        mesh.position.z += (targetZ - mesh.position.z) * 0.08;
        
        // Shrink Skala (X, Y, Z mengecil bersamaan)
        mesh.scale.x += (targetScale - mesh.scale.x) * 0.08;
        mesh.scale.y += (targetScale - mesh.scale.y) * 0.08;
        mesh.scale.z += (targetScale - mesh.scale.z) * 0.08;

        // Efek Hover rotasi kecil (hanya jika sedang full scale agar tidak aneh)
        if (mesh === hoveredMesh && mesh.scale.y > 0.5) {
          mesh.rotation.x = Math.sin(time * 10) * 0.15;
          mesh.rotation.z = Math.cos(time * 10) * 0.15;
        } else {
          mesh.rotation.x += (mesh.userData.baseRotX - mesh.rotation.x) * 0.1;
          mesh.rotation.z += (mesh.userData.baseRotZ - mesh.rotation.z) * 0.1;
        }
      });

      // 🔥 3. MORPHING KAMERA (ZOOM OTOMATIS)
      const targetZoom = isFull ? 2.15 : Math.max(0.4, numWeeksPacked / 20);
      const targetRadius = canvas.clientWidth < 768 
        ? Math.hypot(-15 * targetZoom, 30 * targetZoom, 45 * targetZoom) 
        : Math.hypot(-10 * targetZoom, 20 * targetZoom, 25 * targetZoom);
      
      const currentRadius = camera.position.length();
      camera.position.setLength(currentRadius + (targetRadius - currentRadius) * 0.05);

      // Gyro Paralaks
      if (!isMobileRef.current) {
        gyroCurrent.current.x += (gyroTarget.current.x - gyroCurrent.current.x) * 0.05;
        gyroCurrent.current.z += (gyroTarget.current.z - gyroCurrent.current.z) * 0.05;
        scene.rotation.x = gyroCurrent.current.x;
        scene.rotation.z = gyroCurrent.current.z;
      } else {
        scene.rotation.x = 0; scene.rotation.z = 0;
      }

      // Main Spin
      if (isRotatingRef.current) {
        targetSpeed.current += ((currentDirection.current * baseSpeed) - targetSpeed.current) * 0.05;
        currentSpeed.current += (targetSpeed.current - currentSpeed.current) * 0.1;
        currentRotationY.current += currentSpeed.current; 
      }
      scene.rotation.y = currentRotationY.current;

      renderer.render(scene, camera);
    }
    animate();
    frameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
      cleanupControls();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("deviceorientation", handleOrientation);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchstart", onMouseMove);
      ro.disconnect();
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, [allDays, isDarkMode]); 

  /* ── Classes Dinamis ── */
  const textTitle = isDarkMode ? "text-zinc-200" : "text-gray-800";
  const cardBg = isDarkMode ? "bg-[#161b22]/90 border-zinc-700/60" : "bg-white/90 border-gray-200";
  const textNumber = isDarkMode ? "text-[#39d353]" : "text-[#26a641]";
  const textLabel = isDarkMode ? "text-zinc-300" : "text-gray-600";
  const textSub = isDarkMode ? "text-zinc-500" : "text-gray-400";
  const tooltipStyle = isDarkMode ? "bg-zinc-800 text-zinc-100 border-zinc-600" : "bg-white text-gray-800 border-gray-200";
  const hintStyle = isDarkMode ? "text-zinc-500" : "text-gray-400";

  return (
    <motion.div
      className="relative w-full rounded-2xl overflow-hidden bg-transparent"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      <div className="relative w-full h-[400px] md:h-[600px]">
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <motion.div
              className={`w-8 h-8 border-[3px] rounded-full ${isDarkMode ? "border-green-500" : "border-green-600"} border-t-transparent`}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <span className={`text-xs ${hintStyle}`}>Loading contributions…</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="absolute top-2 left-2 md:top-6 md:left-6 z-20 flex flex-col gap-2">
            <motion.button
              onClick={() => setShowEmptyDays(!showEmptyDays)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md border shadow-md transition-all cursor-pointer select-none
                ${isDarkMode 
                   ? (!showEmptyDays ? "bg-[#39d353]/20 text-[#39d353] border-[#39d353]/50 hover:bg-[#39d353]/30" : "bg-[#161b22]/90 text-zinc-400 border-zinc-700/60 hover:text-zinc-200") 
                   : (!showEmptyDays ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" : "bg-white/90 text-gray-500 border-gray-200 hover:text-gray-700")
                }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {showEmptyDays ? "Hide Empty Days" : "Show Empty Days"}
            </motion.button>

            <motion.button
              onClick={() => setIsRotating(!isRotating)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md border shadow-md transition-all cursor-pointer select-none
                ${isDarkMode 
                   ? (!isRotating ? "bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30" : "bg-[#161b22]/90 text-zinc-400 border-zinc-700/60 hover:text-zinc-200") 
                   : (!isRotating ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" : "bg-white/90 text-gray-500 border-gray-200 hover:text-gray-700")
                }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isRotating ? "Pause Rotation" : "Resume Rotation"}
            </motion.button>
          </div>
        )}

        {stats && !loading && (
          <>
            <motion.div 
              style={{ y: isMobile ? 0 : yContribSmooth }} 
              className="absolute top-2 right-2 md:top-6 md:right-6 z-10 flex flex-col pointer-events-none origin-top-right scale-[0.7] md:scale-100"
              initial={{ opacity: 0, x: 100 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring", damping: 15 }}
            >
              <h3 className={`text-sm font-semibold mb-2 drop-shadow-md ${textTitle}`}>Contributions</h3>
              <div className={`backdrop-blur-md border rounded-xl p-4 shadow-2xl flex gap-6 ${cardBg}`}>
                <div>
                  <div className={`text-2xl font-bold ${textNumber}`}>{stats.total}</div>
                  <div className={`text-[11px] font-semibold mt-1 ${textLabel}`}>Total</div>
                  <div className={`text-[10px] ${textSub}`}>{stats.dateRange}</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textNumber}`}>{stats.thisWeek}</div>
                  <div className={`text-[11px] font-semibold mt-1 ${textLabel}`}>This week</div>
                  <div className={`text-[10px] ${textSub}`}>{stats.weekRange}</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textNumber}`}>{stats.bestDay}</div>
                  <div className={`text-[11px] font-semibold mt-1 ${textLabel}`}>Best day</div>
                  <div className={`text-[10px] ${textSub}`}>{new Date(stats.bestDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                </div>
              </div>
              <div className={`text-right text-[10px] mt-2 font-medium ${textSub}`}>
                Average: <span className={`font-bold ${textNumber}`}>{stats.avg}</span> / day
              </div>
            </motion.div>

            <motion.div 
              style={{ y: isMobile ? 0 : yStreaksSmooth }} 
              className="absolute bottom-8 left-2 md:bottom-10 md:left-6 z-10 flex flex-col pointer-events-none origin-bottom-left scale-[0.7] md:scale-100"
              initial={{ opacity: 0, x: -100 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring", damping: 15 }}
            >
              <h3 className={`text-sm font-semibold mb-2 drop-shadow-md ${textTitle}`}>Streaks</h3>
              <div className={`backdrop-blur-md border rounded-xl p-4 shadow-2xl flex gap-6 ${cardBg}`}>
                <div>
                  <div className={`text-2xl font-bold ${textNumber}`}>{stats.longestStreak} <span className="text-sm">days</span></div>
                  <div className={`text-[11px] font-semibold mt-1 ${textLabel}`}>Longest</div>
                  <div className={`text-[10px] ${textSub}`}>{stats.longestRange}</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${textNumber}`}>{stats.currentStreak} <span className="text-sm">days</span></div>
                  <div className={`text-[11px] font-semibold mt-1 ${textLabel}`}>Current</div>
                  <div className={`text-[10px] ${textSub}`}>{stats.currentRange}</div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
          style={{ display: loading || error ? "none" : "block", touchAction: "none" }}
        />

        {tooltip && (
          <div
            className={`pointer-events-none absolute z-50 text-xs px-3 py-2 rounded-lg shadow-xl border transition-opacity duration-75 ${tooltipStyle}`}
            style={{ left: tooltip.x + 14, top: tooltip.y - 36, whiteSpace: "nowrap" }}
          >
            <span className={`font-bold ${textNumber}`}>{tooltip.count} contribution{tooltip.count !== 1 ? "s" : ""}</span>
            <span className={`ml-1.5 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>on {tooltip.date}</span>
          </div>
        )}

        {!loading && !error && (
          <div className={`absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 text-[9px] md:text-[11px] select-none opacity-80 pointer-events-none text-center ${hintStyle}`}>
            {isMobile ? "Scroll to spin · Tap to interact" : "Tilt device · Scroll to spin · Hover to interact"}
          </div>
        )}
      </div>
    </motion.div>
  );
}