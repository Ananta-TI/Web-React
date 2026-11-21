import { useEffect, useRef } from "react";

/**
 * GridTrailBackground
 *
 * Pola dot-grid + trail kursor ala auxia.io
 * ("Turn every customer interaction into impact."), tapi warnanya
 * mengikuti ThemeContext seperti background hero sebelumnya:
 *
 *   dark  → latar zinc-900, dot & trail putih
 *   light → latar #faf9f9, dot & trail gelap
 *
 * Konstanta gerak (spacing, radius, snap, fade) tetap diambil
 * apa adanya dari script auxia.
 */

const DOT_SPACING = 42;
const DOT_RADIUS = 1;
const MAX_TRAIL_LENGTH = 204;
const SNAP_RADIUS = 80;
const MIN_DISTANCE_BETWEEN_POINTS = 24;
const LINE_WIDTH = 2.5;
const TOTAL_FADE_TIME = 800;

const THEMES = {
  dark: {
    dot: "rgba(255, 255, 255, 0.18)",
    trail: "255, 255, 255",
  },
  light: {
    dot: "rgba(24, 24, 27, 0.16)",
    trail: "24, 24, 27",
  },
};

export default function GridTrailBackground({
  isDarkMode = true,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const palette = isDarkMode ? THEMES.dark : THEMES.light;

    // Layer titik digambar sekali ke canvas offscreen, lalu di-blit tiap frame.
    const dotsCanvas = document.createElement("canvas");
    const dotsCtx = dotsCanvas.getContext("2d");

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let dots = [];
    let trail = [];
    let lastMoveTime = -Infinity;
    let rafId = null;
    let running = false;

    const buildDots = (w, h) => {
      dots = [];
      const offsetX = (w % DOT_SPACING) / 2;
      const offsetY = (h % DOT_SPACING) / 2;

      for (let x = offsetX; x <= w; x += DOT_SPACING) {
        for (let y = offsetY; y <= h; y += DOT_SPACING) {
          dots.push({ x, y });
        }
      }
    };

    const paintDots = () => {
      if (!dotsCtx) return;

      dotsCanvas.width = Math.max(1, Math.round(width * dpr));
      dotsCanvas.height = Math.max(1, Math.round(height * dpr));
      dotsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dotsCtx.clearRect(0, 0, width, height);
      dotsCtx.fillStyle = palette.dot;

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        dotsCtx.beginPath();
        dotsCtx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        dotsCtx.fill();
      }
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(dotsCanvas, 0, 0, width, height);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildDots(width, height);
      paintDots();
      paintStatic();

      trail = [];
      lastMoveTime = -Infinity;
    };

    const getClosestDot = (px, py) => {
      let closest = null;
      let minDist = Infinity;

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        const d = Math.hypot(dot.x - px, dot.y - py);

        if (d < minDist && d < SNAP_RADIUS) {
          minDist = d;
          closest = dot;
        }
      }

      return closest;
    };

    const addToTrail = (dot) => {
      if (!dot) return;

      const last = trail[trail.length - 1];

      if (last && last.x === dot.x && last.y === dot.y) return;
      if (
        last &&
        Math.hypot(last.x - dot.x, last.y - dot.y) <
          MIN_DISTANCE_BETWEEN_POINTS
      ) {
        return;
      }

      trail.push({ x: dot.x, y: dot.y });

      if (trail.length > MAX_TRAIL_LENGTH) {
        trail.shift();
      }
    };

    const draw = () => {
      const timeSinceMove = performance.now() - lastMoveTime;
      const trailOpacity = Math.max(0, 1 - timeSinceMove / TOTAL_FADE_TIME);

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(dotsCanvas, 0, 0, width, height);

      if (trailOpacity <= 0) {
        trail = [];
        running = false;
        rafId = null;
        return;
      }

      if (trail.length >= 2) {
        for (let i = 1; i < trail.length; i += 1) {
          const t = i / (trail.length - 1);
          const alpha = Math.pow(t, 1.5) * 0.9 * trailOpacity;
          const lineWidth = LINE_WIDTH * (0.3 + t * 0.7);

          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.strokeStyle = `rgba(${palette.trail}, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        for (let i = 0; i < trail.length; i += 1) {
          const t = i / (trail.length - 1);
          const alpha = Math.pow(t, 1.5) * 0.85 * trailOpacity;
          const radius = 3 + t * 2.5;

          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${palette.trail}, ${alpha})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      lastMoveTime = performance.now();
      addToTrail(getClosestDot(x, y));
      start();
    };

    const handlePointerLeave = () => {
      lastMoveTime = performance.now();
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);

      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
