import React, { useEffect, useRef, useContext, useState } from "react";
import { motion } from "framer-motion";
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

  // Refs untuk Gyroscope Paralaks (X & Z axis)
  const gyroTarget = useRef({ x: 0, z: 0 });
  const gyroCurrent = useRef({ x: 0, z: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null); 
  const [contributions, setContributions] = useState(null);
  const [tooltip, setTooltip] = useState(null); 

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
          } else {
            run = 0;
          }
        }

        for (let i = recent.length - 1; i >= 0; i--) {
          if (recent[i].count > 0) {
            current++;
            currentStart = recent[i].date;
          } else {
            break;
          }
        }

        const today = recent[recent.length - 1].date;
        const weekAgo = recent[Math.max(0, recent.length - 7)].date;
        const yearAgo = recent[0].date;

        setStats({ 
          total, 
          thisWeek: last7, 
          bestDay: best.count, 
          bestDate: best.date, 
          longestStreak: longest, 
          currentStreak: current, 
          avg,
          dateRange: formatDateRange(yearAgo, today),
          weekRange: formatDateRange(weekAgo, today),
          longestRange: longest > 0 ? formatDateRange(longestStart, longestEnd) : "-",
          currentRange: current > 0 ? formatDateRange(currentStart, today) : "-"
        });

        const activeDaysOnly = recent.filter(d => d.count > 0);
        
        const packedWeeks = [];
        for (let i = 0; i < activeDaysOnly.length; i += 7) {
          packedWeeks.push({ days: activeDaysOnly.slice(i, i + 7) });
        }

        setContributions(packedWeeks);
        setLoading(false);
      })
      .catch((e) => {
        console.error("GithubIsometric fetch error:", e);
        setError(`Failed to load contributions: ${e.message}`);
        setLoading(false);
      });
  }, [username]);

  /* ── 2. Build / rebuild Three.js scene ── */
  useEffect(() => {
    if (!contributions || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
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
    
    camera.position.set(-10, 20, 25); 
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.3 : 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, isDarkMode ? 1.5 : 1.2);
    sun.position.set(20, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 150;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
    fill.position.set(-20, 20, -20);
    scene.add(fill);

    const PALETTE = isDarkMode ? DARK_PALETTE : LIGHT_PALETTE;
    const CELL = 1.2;
    const GAP = 0.3;
    const STEP = CELL + GAP;
    const weeks = contributions;
    const numWeeks = Math.max(weeks.length, 1);
    const offsetX = -(numWeeks * STEP) / 2;
    const offsetZ = -(7 * STEP) / 2;

    const gridPlaneGeo = new THREE.PlaneGeometry(numWeeks * STEP, 7 * STEP);
    const gridPlaneMat = new THREE.MeshStandardMaterial({ 
      color: 0x0d1117, 
      roughness: 0.8,
      metalness: 0.2
    });
    const gridPlane = new THREE.Mesh(gridPlaneGeo, gridPlaneMat);
    gridPlane.rotation.x = -Math.PI / 2;
    gridPlane.position.y = -0.1;
    gridPlane.receiveShadow = true;
    scene.add(gridPlane);

    const gridLines = new THREE.GridHelper(numWeeks * STEP, numWeeks, 0x30363d, 0x30363d);
    gridLines.position.y = -0.09;
    gridLines.scale.set(1, 1, (7 * STEP) / (numWeeks * STEP)); 
    scene.add(gridLines);

    const meshGroups = [];
    const barGroup = new THREE.Group();

    weeks.forEach((week, wi) => {
      week.days.forEach((day, di) => {
        const level = levelFromCount(day.count);
        const height = level * 2.0 + 0.5;
        const color = PALETTE[level];

        const geo = new THREE.BoxGeometry(CELL, height, CELL);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.3,
          metalness: 0.1,
          emissive: new THREE.Color(color).multiplyScalar(level > 0 ? 0.4 : 0.0),
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const x = offsetX + wi * STEP + (STEP/2);
        const z = offsetZ + di * STEP + (STEP/2);
        mesh.position.set(x, height / 2 - 0.1, z);
        
        mesh.userData = { 
          date: day.date, 
          count: day.count, 
          level,
          baseY: mesh.position.y,
          baseRotX: 0,
          baseRotZ: 0
        };
        
        barGroup.add(mesh);
        meshGroups.push(mesh);
      });
    });

    scene.add(barGroup);

    // ─────────────────────────────────────────────
    // EVENT LISTENERS: Gyroscope & Scroll
    // ─────────────────────────────────────────────
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = currentScroll - lastScrollY.current;
      
      if (Math.abs(delta) > 0) {
        currentDirection.current = delta > 0 ? -1 : 1;
        targetSpeed.current = (currentDirection.current * baseSpeed) - (delta * 0.0015);
      }
      lastScrollY.current = currentScroll;
    };

    const handleOrientation = (event) => {
      if (event.beta !== null && event.gamma !== null) {
        const tiltFrontBack = (event.beta - 45) * 0.003; 
        const tiltLeftRight = event.gamma * 0.003;
        
        gyroTarget.current.x = Math.max(-0.3, Math.min(0.3, tiltFrontBack));
        gyroTarget.current.z = Math.max(-0.3, Math.min(0.3, tiltLeftRight));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh = null;

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshGroups);
      
      if (hits.length > 0) {
        hoveredMesh = hits[0].object;
        const { date, count } = hoveredMesh.userData;
        setTooltip({ 
          x: e.clientX - canvas.getBoundingClientRect().left, 
          y: e.clientY - canvas.getBoundingClientRect().top, 
          date, 
          count 
        });
        document.body.style.cursor = 'pointer';
      } else {
        hoveredMesh = null;
        setTooltip(null);
        document.body.style.cursor = 'default';
      }
    }
    
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchstart", (e) => onMouseMove(e.touches[0]), { passive: true });

    const cleanupControls = createOrbitControls(camera, canvas);

    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return; // Mencegah glitch saat baru render
      
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      
      if (w < 768) {
        camera.position.set(-15, 30, 45); 
      } else {
        camera.position.set(-10, 20, 25); 
      }
      
      // INI KUNCI FIX-NYA: Paksa kamera nengok ke tengah lagi setelah pindah posisi!
      camera.lookAt(0, 0, 0);
      
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001; 
      
      meshGroups.forEach(mesh => {
        if (mesh === hoveredMesh) {
          mesh.rotation.x = Math.sin(time * 10) * 0.15;
          mesh.rotation.z = Math.cos(time * 10) * 0.15;
        } else {
          mesh.rotation.x += (mesh.userData.baseRotX - mesh.rotation.x) * 0.1;
          mesh.rotation.z += (mesh.userData.baseRotZ - mesh.rotation.z) * 0.1;
        }
      });

      gyroCurrent.current.x += (gyroTarget.current.x - gyroCurrent.current.x) * 0.05;
      gyroCurrent.current.z += (gyroTarget.current.z - gyroCurrent.current.z) * 0.05;

      const defaultSpeed = currentDirection.current * baseSpeed;
      targetSpeed.current += (defaultSpeed - targetSpeed.current) * 0.05;
      currentSpeed.current += (targetSpeed.current - currentSpeed.current) * 0.1;
      
      scene.rotation.x = gyroCurrent.current.x;
      scene.rotation.z = gyroCurrent.current.z;
      scene.rotation.y += currentSpeed.current;

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
      ro.disconnect();
      renderer.dispose();
      document.body.style.cursor = 'default';
    };
  }, [contributions, isDarkMode]);

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
              className="w-8 h-8 border-[3px] rounded-full border-green-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <span className="text-xs text-zinc-400">Loading contributions…</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {stats && !loading && (
          <>
            <motion.div 
              className="absolute top-2 right-2 md:top-6 md:right-6 z-10 flex flex-col pointer-events-none origin-top-right scale-[0.7] md:scale-100"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-zinc-200 mb-2 drop-shadow-md">Contributions</h3>
              <div className="bg-[#161b22]/90 backdrop-blur-md border border-zinc-700/60 rounded-xl p-4 shadow-2xl flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-[#39d353]">{stats.total}</div>
                  <div className="text-[11px] text-zinc-300 font-semibold mt-1">Total</div>
                  <div className="text-[10px] text-zinc-500">{stats.dateRange}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#39d353]">{stats.thisWeek}</div>
                  <div className="text-[11px] text-zinc-300 font-semibold mt-1">This week</div>
                  <div className="text-[10px] text-zinc-500">{stats.weekRange}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#39d353]">{stats.bestDay}</div>
                  <div className="text-[11px] text-zinc-300 font-semibold mt-1">Best day</div>
                  <div className="text-[10px] text-zinc-500">{new Date(stats.bestDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                </div>
              </div>
              <div className="text-right text-[10px] text-zinc-500 mt-2 font-medium">
                Average: <span className="text-[#39d353] font-bold">{stats.avg}</span> / day
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-8 left-2 md:bottom-10 md:left-6 z-10 flex flex-col pointer-events-none origin-bottom-left scale-[0.7] md:scale-100"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-zinc-200 mb-2 drop-shadow-md">Streaks</h3>
              <div className="bg-[#161b22]/90 backdrop-blur-md border border-zinc-700/60 rounded-xl p-4 shadow-2xl flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-[#39d353]">{stats.longestStreak} <span className="text-sm">days</span></div>
                  <div className="text-[11px] text-zinc-300 font-semibold mt-1">Longest</div>
                  <div className="text-[10px] text-zinc-500">{stats.longestRange}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#39d353]">{stats.currentStreak} <span className="text-sm">days</span></div>
                  <div className="text-[11px] text-zinc-300 font-semibold mt-1">Current</div>
                  <div className="text-[10px] text-zinc-500">{stats.currentRange}</div>
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
            className="pointer-events-none absolute z-50 text-xs px-3 py-2 rounded-lg shadow-xl bg-zinc-800 text-zinc-100 border border-zinc-600 transition-opacity duration-75"
            style={{
              left: tooltip.x + 14,
              top: tooltip.y - 36,
              whiteSpace: "nowrap",
            }}
          >
            <span className="text-[#39d353] font-bold">{tooltip.count} contribution{tooltip.count !== 1 ? "s" : ""}</span>
            <span className="ml-1.5 text-zinc-400">on {tooltip.date}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 text-[9px] md:text-[11px] select-none text-zinc-500 opacity-80 pointer-events-none text-center">
            Tilt device · Scroll to spin · Hover to interact
          </div>
        )}
      </div>
    </motion.div>
  );
}