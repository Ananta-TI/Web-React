import { useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const CELL_SIZE = 95;

// Radius efek mouse
const INFLUENCE_RADIUS = 280;

// Radius visual grid.
// Bisa dibuat sedikit lebih besar dari influence supaya fade lebih halus.
const VISIBILITY_RADIUS = 340;

// Hover → grid tertarik masuk
const HOVER_WARP = 25;

// Mouse down → grid terdorong keluar
const CLICK_WARP = 28;

// Background dots
const DOT_SPACING = 58;

// Cursor langsung mengikuti mouse
const CURSOR_LERP = 1;

// Smooth press
const PRESS_LERP_IN = 0.09;
const PRESS_LERP_OUT = 0.09;

// Grid opacity di luar radius.
// Makin kecil = makin tidak kelihatan.
const OUTSIDE_GRID_OPACITY = 0.018;

// Node opacity di luar radius
const OUTSIDE_NODE_OPACITY = 0.025;

// Dot texture opacity di luar radius
const OUTSIDE_DOT_OPACITY = 0.01;

// Node size
const NODE_BASE_RADIUS = 1.5;
const NODE_ACTIVE_RADIUS = 3.2;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(t) {
  t = clamp(t, 0, 1);

  return t * t * (3 - 2 * t);
}

function lerpColor(base, active, t) {
  const r = Math.round(lerp(base.r, active.r, t));
  const g = Math.round(lerp(base.g, active.g, t));
  const b = Math.round(lerp(base.b, active.b, t));
  const a = lerp(base.a, active.a, t);

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
}

// Menghitung visibility berdasarkan jarak ke mouse.
//
// 1 = sangat dekat mouse
// 0 = jauh dari mouse
function getMouseVisibility(x, y, mouse) {
  const dx = x - mouse.x;
  const dy = y - mouse.y;

  const distance = Math.sqrt(
    dx * dx +
    dy * dy
  );

  if (distance >= VISIBILITY_RADIUS) {
    return 0;
  }

  const raw =
    1 -
    distance / VISIBILITY_RADIUS;

  /*
   * smoothstep dua kali supaya:
   *
   * - dekat mouse tetap kuat
   * - mendekati pinggir radius fade lebih halus
   */
  const first =
    smoothstep(raw);

  return smoothstep(first);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function KineticGrid({
  isDarkMode = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const mouseRef = useRef({
    x: -9999,
    y: -9999,
  });

  const targetMouseRef = useRef({
    x: -9999,
    y: -9999,
  });

  const pressRef = useRef({
    current: 0,
    target: 0,
  });

  const rafRef = useRef(null);

  const sizeRef = useRef({
    w: 0,
    h: 0,
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GRID DEFORMATION
  // ───────────────────────────────────────────────────────────────────────────

  const getWarpedPoint = useCallback(
    (
      gx,
      gy,
      col,
      row,
      mouse,
      cols,
      rows,
      pressStrength
    ) => {
      // Lock sisi grid
      const edgeMargin = 1.5;

      const colPin = Math.min(
        col / edgeMargin,
        (cols - 1 - col) / edgeMargin,
        1
      );

      const rowPin = Math.min(
        row / edgeMargin,
        (rows - 1 - row) / edgeMargin,
        1
      );

      const pinFactor =
        colPin *
        colPin *
        rowPin *
        rowPin;

      const dx =
        gx - mouse.x;

      const dy =
        gy - mouse.y;

      const dist =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      // Di luar radius deformasi
      if (
        dist >= INFLUENCE_RADIUS ||
        dist <= 0 ||
        pinFactor <= 0
      ) {
        return {
          pt: {
            x: gx,
            y: gy,
          },

          proximity: 0,
        };
      }

      // ───────────────────────────────────────────────────────────────────────
      // PROXIMITY
      // ───────────────────────────────────────────────────────────────────────

      const rawProximity =
        1 -
        dist / INFLUENCE_RADIUS;

      const proximity =
        smoothstep(
          rawProximity
        ) * pinFactor;

      const angle =
        Math.atan2(
          dy,
          dx
        );

      const dirX =
        Math.cos(angle);

      const dirY =
        Math.sin(angle);

      // ───────────────────────────────────────────────────────────────────────
      // HOVER
      // ───────────────────────────────────────────────────────────────────────

      const centerSoftness =
        Math.min(
          1,
          dist / 60
        );

      const hoverFalloff =
        proximity *
        centerSoftness;

      const pressEased =
        smoothstep(
          pressStrength
        );

      const hoverWeight =
        1 -
        pressEased * 0.82;

      const hoverWarp =
        hoverFalloff *
        HOVER_WARP *
        hoverWeight;

      // ───────────────────────────────────────────────────────────────────────
      // PRESS
      // ───────────────────────────────────────────────────────────────────────

      const clickFalloff =
        Math.pow(
          proximity,
          0.78
        );

      const clickWarp =
        clickFalloff *
        CLICK_WARP *
        pressEased;

      /*
       * Hover:
       * masuk ke cursor
       *
       * Click:
       * keluar dari cursor
       */
      const offset =
        -hoverWarp +
        clickWarp;

      return {
        pt: {
          x:
            gx +
            dirX * offset,

          y:
            gy +
            dirY * offset,
        },

        proximity,
      };
    },
    []
  );

  // ───────────────────────────────────────────────────────────────────────────
  // DRAW
  // ───────────────────────────────────────────────────────────────────────────

  const draw = useCallback(
    () => {
      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) return;

      const {
        w: width,
        h: height,
      } = sizeRef.current;

      if (
        !width ||
        !height
      ) {
        return;
      }

      const mouse =
        mouseRef.current;

      const pressStrength =
        pressRef.current.current;

      // ───────────────────────────────────────────────────────────────────────
      // THEME
      // ───────────────────────────────────────────────────────────────────────

      const theme =
        isDarkMode
          ? {
              background:
                "#18181b",

              gridRGB:
                "255,255,255",

              nodeRGB:
                "255,255,255",

              glowRGB:
                "255,255,255",

              activeLineAlpha:
                0.68,

              activeNodeAlpha:
                0.95,
            }
          : {
              background:
                "#faf9f9",

              gridRGB:
                "15,15,15",

              nodeRGB:
                "15,15,15",

              glowRGB:
                "0,0,0",

              activeLineAlpha:
                0.55,

              activeNodeAlpha:
                0.85,
            };

      // ───────────────────────────────────────────────────────────────────────
      // BACKGROUND
      // ───────────────────────────────────────────────────────────────────────

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      ctx.fillStyle =
        theme.background;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      // ───────────────────────────────────────────────────────────────────────
      // BACKGROUND DOTS
      //
      // Dots sekarang ikut visibility radius mouse.
      // ───────────────────────────────────────────────────────────────────────

      for (
        let x = DOT_SPACING / 2;
        x < width;
        x += DOT_SPACING
      ) {
        for (
          let y = DOT_SPACING / 2;
          y < height;
          y += DOT_SPACING
        ) {
          const visibility =
            getMouseVisibility(
              x,
              y,
              mouse
            );

          /*
           * Luar mouse masih sangat samar.
           * Dekat mouse menjadi lebih jelas.
           */
          const opacity =
            lerp(
              OUTSIDE_DOT_OPACITY,
              0.075,
              visibility
            );

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            lerp(
              0.4,
              0.8,
              visibility
            ),
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            `rgba(${theme.gridRGB}, ${opacity})`;

          ctx.fill();
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // GRID DIMENSIONS
      // ───────────────────────────────────────────────────────────────────────

      const cols =
        Math.max(
          2,
          Math.ceil(
            width / CELL_SIZE
          )
        ) + 1;

      const rows =
        Math.max(
          2,
          Math.ceil(
            height / CELL_SIZE
          )
        ) + 1;

      const cellW =
        width /
        (cols - 1);

      const cellH =
        height /
        (rows - 1);

      const points = [];

      const proximities = [];

      // ───────────────────────────────────────────────────────────────────────
      // GENERATE GRID
      // ───────────────────────────────────────────────────────────────────────

      for (
        let row = 0;
        row < rows;
        row++
      ) {
        points[row] = [];
        proximities[row] = [];

        for (
          let col = 0;
          col < cols;
          col++
        ) {
          const {
            pt,
            proximity,
          } =
            getWarpedPoint(
              col * cellW,
              row * cellH,
              col,
              row,
              mouse,
              cols,
              rows,
              pressStrength
            );

          points[row][col] =
            pt;

          proximities[row][col] =
            proximity;
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // DRAW SEGMENT
      // ───────────────────────────────────────────────────────────────────────

      const drawSegment = (
        p1,
        p2,
        prox1,
        prox2
      ) => {
        const centerX =
          (p1.x + p2.x) / 2;

        const centerY =
          (p1.y + p2.y) / 2;

        /*
         * Ini yang membuat grid hanya jelas
         * di sekitar cursor.
         */
        const visibility =
          getMouseVisibility(
            centerX,
            centerY,
            mouse
          );

        const proximity =
          (prox1 + prox2) / 2;

        const pressEased =
          smoothstep(
            pressStrength
          );

        // Sedikit boost karena warp
        const interactionBoost =
          smoothstep(
            proximity
          );

        const activeAlpha =
          clamp(
            theme.activeLineAlpha +
              interactionBoost *
                0.15 +
              pressEased *
                0.05,
            0,
            1
          );

        /*
         * Luar radius = OUTSIDE_GRID_OPACITY
         *
         * Dekat cursor = activeAlpha
         */
        const opacity =
          lerp(
            OUTSIDE_GRID_OPACITY,
            activeAlpha,
            visibility
          );

        ctx.beginPath();

        ctx.moveTo(
          p1.x,
          p1.y
        );

        ctx.lineTo(
          p2.x,
          p2.y
        );

        ctx.strokeStyle =
          `rgba(${theme.gridRGB}, ${opacity})`;

        ctx.lineWidth =
          lerp(
            0.65,
            1.35,
            visibility
          );

        ctx.stroke();
      };

      ctx.lineCap =
        "butt";

      // ───────────────────────────────────────────────────────────────────────
      // HORIZONTAL
      // ───────────────────────────────────────────────────────────────────────

      for (
        let row = 0;
        row < rows;
        row++
      ) {
        for (
          let col = 0;
          col < cols - 1;
          col++
        ) {
          drawSegment(
            points[row][col],
            points[row][col + 1],

            proximities[row][col],
            proximities[row][col + 1]
          );
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // VERTICAL
      // ───────────────────────────────────────────────────────────────────────

      for (
        let col = 0;
        col < cols;
        col++
      ) {
        for (
          let row = 0;
          row < rows - 1;
          row++
        ) {
          drawSegment(
            points[row][col],
            points[row + 1][col],

            proximities[row][col],
            proximities[row + 1][col]
          );
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // NODES
      // ───────────────────────────────────────────────────────────────────────

      for (
        let row = 0;
        row < rows;
        row++
      ) {
        for (
          let col = 0;
          col < cols;
          col++
        ) {
          const point =
            points[row][col];

          const proximity =
            proximities[row][col];

          const visibility =
            getMouseVisibility(
              point.x,
              point.y,
              mouse
            );

          const interaction =
            smoothstep(
              proximity
            );

          const pressEased =
            smoothstep(
              pressStrength
            );

          const intensity =
            clamp(
              visibility +
                interaction *
                  0.2 +
                pressEased *
                  interaction *
                  0.08,
              0,
              1
            );

          // ─────────────────────────────────────────────────────────────────
          // NODE RADIUS
          // ─────────────────────────────────────────────────────────────────

          const radius =
            lerp(
              NODE_BASE_RADIUS,
              NODE_ACTIVE_RADIUS,
              intensity
            );

          // ─────────────────────────────────────────────────────────────────
          // NODE OPACITY
          // ─────────────────────────────────────────────────────────────────

          const nodeOpacity =
            lerp(
              OUTSIDE_NODE_OPACITY,
              theme.activeNodeAlpha,
              visibility
            );

          // ─────────────────────────────────────────────────────────────────
          // GLOW
          // ─────────────────────────────────────────────────────────────────

          if (
            visibility >
            0.35
          ) {
            const glowRadius =
              radius +
              lerp(
                1,
                7,
                visibility
              );

            const gradient =
              ctx.createRadialGradient(
                point.x,
                point.y,
                radius * 0.25,

                point.x,
                point.y,
                glowRadius
              );

            gradient.addColorStop(
              0,
              `rgba(${theme.glowRGB}, ${
                visibility * 0.2
              })`
            );

            gradient.addColorStop(
              1,
              `rgba(${theme.glowRGB}, 0)`
            );

            ctx.beginPath();

            ctx.arc(
              point.x,
              point.y,
              glowRadius,
              0,
              Math.PI * 2
            );

            ctx.fillStyle =
              gradient;

            ctx.fill();
          }

          // ─────────────────────────────────────────────────────────────────
          // NODE
          // ─────────────────────────────────────────────────────────────────

          ctx.beginPath();

          ctx.arc(
            point.x,
            point.y,
            radius,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            `rgba(${theme.nodeRGB}, ${nodeOpacity})`;

          ctx.fill();
        }
      }
    },
    [
      getWarpedPoint,
      isDarkMode,
    ]
  );

  // ───────────────────────────────────────────────────────────────────────────
  // ANIMATION
  // ───────────────────────────────────────────────────────────────────────────

  const animate =
    useCallback(
      () => {
        const mouse =
          mouseRef.current;

        const target =
          targetMouseRef.current;

        // Cursor
        mouse.x =
          lerp(
            mouse.x,
            target.x,
            CURSOR_LERP
          );

        mouse.y =
          lerp(
            mouse.y,
            target.y,
            CURSOR_LERP
          );

        // ─────────────────────────────────────────────────────────────────────
        // PRESS
        // ─────────────────────────────────────────────────────────────────────

        const press =
          pressRef.current;

        const pressSpeed =
          press.target >
          press.current
            ? PRESS_LERP_IN
            : PRESS_LERP_OUT;

        press.current =
          lerp(
            press.current,
            press.target,
            pressSpeed
          );

        if (
          Math.abs(
            press.current -
              press.target
          ) < 0.0005
        ) {
          press.current =
            press.target;
        }

        draw();

        rafRef.current =
          requestAnimationFrame(
            animate
          );
      },
      [draw]
    );

  // ───────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const container =
      containerRef.current;

    const canvas =
      canvasRef.current;

    if (
      !container ||
      !canvas
    ) {
      return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SIZE
    // ─────────────────────────────────────────────────────────────────────────

    const setSize = () => {
      const rect =
        container.getBoundingClientRect();

      const width =
        rect.width;

      const height =
        rect.height;

      const dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          2
        );

      canvas.width =
        Math.floor(
          width * dpr
        );

      canvas.height =
        Math.floor(
          height * dpr
        );

      canvas.style.width =
        `${width}px`;

      canvas.style.height =
        `${height}px`;

      const ctx =
        canvas.getContext(
          "2d"
        );

      if (ctx) {
        ctx.setTransform(
          dpr,
          0,
          0,
          dpr,
          0,
          0
        );
      }

      sizeRef.current = {
        w: width,
        h: height,
      };
    };

    setSize();

    const resizeObserver =
      new ResizeObserver(
        setSize
      );

    resizeObserver.observe(
      container
    );

    // ─────────────────────────────────────────────────────────────────────────
    // LOCAL POINTER
    // ─────────────────────────────────────────────────────────────────────────

    const getLocalPointer = (
      event
    ) => {
      const rect =
        container.getBoundingClientRect();

      return {
        x:
          event.clientX -
          rect.left,

        y:
          event.clientY -
          rect.top,

        rect,
      };
    };

    // ─────────────────────────────────────────────────────────────────────────
    // MOVE
    // ─────────────────────────────────────────────────────────────────────────

    const onPointerMove = (
      event
    ) => {
      const {
        x,
        y,
        rect,
      } =
        getLocalPointer(
          event
        );

      const inside =
        x >= 0 &&
        x <= rect.width &&
        y >= 0 &&
        y <= rect.height;

      if (inside) {
        targetMouseRef.current =
          {
            x,
            y,
          };
      } else {
        targetMouseRef.current =
          {
            x: -9999,
            y: -9999,
          };

        pressRef.current.target =
          0;
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // DOWN
    // ─────────────────────────────────────────────────────────────────────────

    const onPointerDown = (
      event
    ) => {
      const {
        x,
        y,
        rect,
      } =
        getLocalPointer(
          event
        );

      const inside =
        x >= 0 &&
        x <= rect.width &&
        y >= 0 &&
        y <= rect.height;

      if (!inside) return;

      targetMouseRef.current =
        {
          x,
          y,
        };

      pressRef.current.target =
        0.88;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // UP
    // ─────────────────────────────────────────────────────────────────────────

    const onPointerUp = () => {
      pressRef.current.target =
        0;
    };

    const onPointerCancel = () => {
      pressRef.current.target =
        0;
    };

    const onWindowBlur = () => {
      pressRef.current.target =
        0;
    };

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────────────────────

    window.addEventListener(
      "pointermove",
      onPointerMove,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "pointerdown",
      onPointerDown
    );

    window.addEventListener(
      "pointerup",
      onPointerUp
    );

    window.addEventListener(
      "pointercancel",
      onPointerCancel
    );

    window.addEventListener(
      "blur",
      onWindowBlur
    );

    rafRef.current =
      requestAnimationFrame(
        animate
      );

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "pointermove",
        onPointerMove
      );

      window.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      window.removeEventListener(
        "pointerup",
        onPointerUp
      );

      window.removeEventListener(
        "pointercancel",
        onPointerCancel
      );

      window.removeEventListener(
        "blur",
        onWindowBlur
      );

      if (
        rafRef.current
      ) {
        cancelAnimationFrame(
          rafRef.current
        );
      }
    };
  }, [animate]);

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 h-full w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Vignette */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDarkMode
            ? "bg-[radial-gradient(circle_at_center,transparent_45%,rgba(24,24,27,0.04)_75%,rgba(24,24,27,0.35)_100%)]"
            : "bg-[radial-gradient(circle_at_center,transparent_45%,rgba(250,249,249,0.04)_75%,rgba(250,249,249,0.35)_100%)]"
        }`}
      />
    </div>
  );
}