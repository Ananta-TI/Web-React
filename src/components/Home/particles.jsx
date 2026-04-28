import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const int = parseInt(hex, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
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
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const Particles = ({
  particleCount = 200, particleSpread = 10, speed = 0.1, particleColors = defaultColors,
  moveParticlesOnHover = false, particleHoverFactor = 1, alphaParticles = false,
  particleBaseSize = 100, sizeRandomness = 1, cameraDistance = 20, disableRotation = false, className,
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const geometryRef = useRef(null);
  const programRef = useRef(null);
  const targetColorsRef = useRef(null);
  const animStateRef = useRef({ speed, disableRotation, moveParticlesOnHover, particleHoverFactor });

  useEffect(() => {
    animStateRef.current = { speed, disableRotation, moveParticlesOnHover, particleHoverFactor };
  }, [speed, disableRotation, moveParticlesOnHover, particleHoverFactor]);

  useEffect(() => {
    if (targetColorsRef.current && particleColors) {
      const targets = targetColorsRef.current;
      const palette = particleColors;
      for (let i = 0; i < particleCount; i++) {
        const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
        targets.set(col, i * 3);
      }
    }
  }, [particleColors, particleCount]);

  useEffect(() => {
    if (programRef.current) {
      programRef.current.uniforms.uSpread.value = particleSpread;
      programRef.current.uniforms.uBaseSize.value = particleBaseSize;
      programRef.current.uniforms.uSizeRandomness.value = sizeRandomness;
      programRef.current.uniforms.uAlphaParticles.value = alphaParticles ? 1 : 0;
    }
  }, [particleSpread, particleBaseSize, sizeRandomness, alphaParticles]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // OPTIMASI: Cek apakah Partikel terlihat di layar
    let isVisible = true;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const renderer = new Renderer({ depth: false, alpha: true, dpr: Math.min(window.devicePixelRatio, 1.5) });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, false);
    resize();

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      };
    };
    if (moveParticlesOnHover && !(/Android|iPhone/i.test(navigator.userAgent))) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const targetColors = new Float32Array(count * 3);
    const palette = particleColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
      targetColors.set(col, i * 3);
    }
    targetColorsRef.current = targetColors;

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    geometryRef.current = geometry;

    const program = new Program(gl, {
      vertex, fragment, transparent: true, depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
      },
    });
    programRef.current = program;

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t) => {
      animationFrameId = requestAnimationFrame(update);
      
      // JIKA DI LUAR LAYAR, STOP HITUNG & RENDER! (CPU & GPU AMAN)
      if (!isVisible) {
        lastTime = t;
        return; 
      }

      const delta = t - lastTime;
      lastTime = t;
      const state = animStateRef.current;
      elapsed += delta * state.speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (state.moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * state.particleHoverFactor;
        particles.position.y = -mouseRef.current.y * state.particleHoverFactor;
      }

      if (!state.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * state.speed;
      }

      // Transisi Lerp Warna
      if (geometryRef.current && targetColorsRef.current) {
        const currentColors = geometryRef.current.attributes.color.data;
        const targets = targetColorsRef.current;
        let needsColorUpdate = false;
        for (let i = 0; i < currentColors.length; i++) {
          const diff = targets[i] - currentColors[i];
          if (Math.abs(diff) > 0.005) {
            currentColors[i] += diff * 0.05;
            needsColorUpdate = true;
          }
        }
        if (needsColorUpdate) geometryRef.current.attributes.color.needsUpdate = true;
      }

      renderer.render({ scene: particles, camera });
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      geometryRef.current = null;
      programRef.current = null;
      targetColorsRef.current = null;
    };
  }, [particleCount, cameraDistance]); 

  return (
    <div
      ref={containerRef}
      className={`particles-container ${className}`}
      style={{ width: '100%', height: '100%', position: 'absolute' }}
    />
  );
};

export default Particles;