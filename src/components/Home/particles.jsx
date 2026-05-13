import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
  let value = hex.replace(/^#/, "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const int = parseInt(value, 16);

  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;

  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;

    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;

    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if (uAlphaParticles < 0.5) {
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

function getIsCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

const Particles = ({
  particleCount = 120,
  particleSpread = 10,
  speed = 0.08,
  particleColors = defaultColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 90,
  sizeRandomness = 3,
  cameraDistance = 20,
  disableRotation = false,
  className = "",
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef(null);

  const geometryRef = useRef(null);
  const programRef = useRef(null);
  const targetColorsRef = useRef(null);

  const animStateRef = useRef({
    speed,
    disableRotation,
    moveParticlesOnHover,
    particleHoverFactor,
  });

  useEffect(() => {
    animStateRef.current = {
      speed,
      disableRotation,
      moveParticlesOnHover,
      particleHoverFactor,
    };
  }, [speed, disableRotation, moveParticlesOnHover, particleHoverFactor]);

  useEffect(() => {
    if (!targetColorsRef.current || !particleColors?.length) return;

    const targets = targetColorsRef.current;
    const palette = particleColors;

    for (let i = 0; i < particleCount; i += 1) {
      const color = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      targets.set(color, i * 3);
    }
  }, [particleColors, particleCount]);

  useEffect(() => {
    if (!programRef.current) return;

    programRef.current.uniforms.uSpread.value = particleSpread;
    programRef.current.uniforms.uBaseSize.value = particleBaseSize;
    programRef.current.uniforms.uSizeRandomness.value = sizeRandomness;
    programRef.current.uniforms.uAlphaParticles.value = alphaParticles ? 1 : 0;
  }, [particleSpread, particleBaseSize, sizeRandomness, alphaParticles]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isCoarsePointer = getIsCoarsePointer();
    const safeParticleCount = Math.max(
      20,
      Math.min(isCoarsePointer ? 70 : 150, particleCount)
    );

    const renderer = new Renderer({
      depth: false,
      alpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.15 : 1.4),
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    let resizeRaf = 0;

    const updateBounds = () => {
      boundsRef.current = container.getBoundingClientRect();
    };

    const resize = () => {
      if (resizeRaf) return;

      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;

        const width = container.clientWidth || 1;
        const height = container.clientHeight || 1;

        renderer.setSize(width, height);
        camera.perspective({
          aspect: gl.canvas.width / gl.canvas.height,
        });

        updateBounds();
      });
    };

    let resizeObserver;

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", resize, { passive: true });
    }

    resize();

    const handlePointerMove = (event) => {
      const rect = boundsRef.current;
      if (!rect || rect.width === 0 || rect.height === 0) return;

      mouseRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
    };

    if (moveParticlesOnHover && !isCoarsePointer) {
      container.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      container.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
    }

    const positions = new Float32Array(safeParticleCount * 3);
    const randoms = new Float32Array(safeParticleCount * 4);
    const colors = new Float32Array(safeParticleCount * 3);
    const targetColors = new Float32Array(safeParticleCount * 3);

    const palette = particleColors?.length ? particleColors : defaultColors;

    for (let i = 0; i < safeParticleCount; i += 1) {
      let x;
      let y;
      let z;
      let len;

      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);

      const radius = Math.cbrt(Math.random());

      positions.set([x * radius, y * radius, z * radius], i * 3);

      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        i * 4
      );

      const color = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);

      colors.set(color, i * 3);
      targetColors.set(color, i * 3);
    }

    targetColorsRef.current = targetColors;

    const geometry = new Geometry(gl, {
      position: {
        size: 3,
        data: positions,
      },
      random: {
        size: 4,
        data: randoms,
      },
      color: {
        size: 3,
        data: colors,
      },
    });

    geometryRef.current = geometry;

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
    });

    programRef.current = program;

    const particles = new Mesh(gl, {
      mode: gl.POINTS,
      geometry,
      program,
    });

    let animationFrameId = 0;
    let isRunning = false;
    let isVisible = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const renderFrame = (time) => {
      if (!isRunning) return;

      animationFrameId = window.requestAnimationFrame(renderFrame);

      if (!isVisible) {
        lastTime = time;
        return;
      }

      const delta = time - lastTime;
      lastTime = time;

      const state = animStateRef.current;
      elapsed += delta * state.speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (state.moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * state.particleHoverFactor;
        particles.position.y = -mouseRef.current.y * state.particleHoverFactor;
      }

      if (!state.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.08;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.12;
        particles.rotation.z += 0.007 * state.speed;
      }

      if (geometryRef.current && targetColorsRef.current) {
        const currentColors = geometryRef.current.attributes.color.data;
        const targets = targetColorsRef.current;
        let needsColorUpdate = false;

        for (let i = 0; i < currentColors.length; i += 1) {
          const diff = targets[i] - currentColors[i];

          if (Math.abs(diff) > 0.005) {
            currentColors[i] += diff * 0.05;
            needsColorUpdate = true;
          }
        }

        if (needsColorUpdate) {
          geometryRef.current.attributes.color.needsUpdate = true;
        }
      }

      renderer.render({
        scene: particles,
        camera,
      });
    };

    const startLoop = () => {
      if (isRunning) return;

      isRunning = true;
      lastTime = performance.now();
      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    const stopLoop = () => {
      isRunning = false;

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          updateBounds();
          startLoop();
        } else {
          stopLoop();
        }
      },
      {
        root: null,
        rootMargin: "120px",
        threshold: 0,
      }
    );

    observer.observe(container);

    const initialRect = container.getBoundingClientRect();
    const initiallyVisible =
      initialRect.bottom >= 0 &&
      initialRect.top <= window.innerHeight &&
      initialRect.right >= 0 &&
      initialRect.left <= window.innerWidth;

    if (initiallyVisible) {
      isVisible = true;
      startLoop();
    }

    return () => {
      stopLoop();

      observer.disconnect();

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }

      if (resizeRaf) {
        window.cancelAnimationFrame(resizeRaf);
      }

      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);

      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }

      geometryRef.current = null;
      programRef.current = null;
      targetColorsRef.current = null;
    };
  }, [particleCount, cameraDistance]);

  return (
    <div
      ref={containerRef}
      className={`particles-container ${className}`}
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        pointerEvents: moveParticlesOnHover ? "auto" : "none",
      }}
    />
  );
};

export default Particles;