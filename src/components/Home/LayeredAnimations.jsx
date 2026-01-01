import { useEffect, useRef, useContext, useState } from "react";
import { createTimeline, utils, spring } from "animejs";
import { ThemeContext } from "../../context/ThemeContext";

export default function LayeredAnimations() {
  const containerRef = useRef(null);
  const { isDarkMode } = useContext(ThemeContext);
  const [showAnimation, setShowAnimation] = useState(true);

  const darkColors = ["#ef4444", "#facc15", "#22c55e", "#0ea5e9"];
  const lightColor = "#000000";

  useEffect(() => {
    const handleResize = () => {
      // ❌ Jangan tampilkan jika lebar layar < 768px
      setShowAnimation(window.innerWidth >= 768);
    };

    handleResize(); // cek pertama kali saat mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showAnimation) return; // ⛔ jangan jalanin animasi di mobile

    const shapeEls = containerRef.current.querySelectorAll(".shape");
    const triangleEl = containerRef.current.querySelector("polygon");
    const points = triangleEl.getAttribute("points").split(" ").map(v => +v);
    const eases = ["inOutQuad", "inOutCirc", "inOutSine", spring()];

    const createKeyframes = (value) => {
      const keyframes = [];
      for (let i = 0; i < 100; i++) {
        keyframes.push({
          to: value,
          ease: utils.randomPick(eases),
          duration: utils.random(300, 1600),
        });
      }
      return keyframes;
    };

    const animateShape = (el) => {
      const circleEl = el.querySelector("circle");
      const rectEl = el.querySelector("rect");
      const polyEl = el.querySelector("polygon");

      const animation = createTimeline({
        onComplete: () => animateShape(el),
      })
        .add(el, {
          translateX: createKeyframes(() => utils.random(-4, 4) + "rem"),
          translateY: createKeyframes(() => utils.random(-4, 4) + "rem"),
          rotate: createKeyframes(() => utils.random(-180, 180)),
        }, 0);

      if (circleEl) {
        animation.add(circleEl, {
          r: createKeyframes(() => utils.random(24, 56)),
        }, 0);
      }

      if (rectEl) {
        animation.add(rectEl, {
          width: createKeyframes(() => utils.random(56, 96)),
          height: createKeyframes(() => utils.random(56, 96)),
        }, 0);
      }

      if (polyEl) {
        animation.add(polyEl, {
          points: createKeyframes(() => {
            const s = utils.random(0.9, 1.6, 3);
            return `
              ${points[0] * s} ${points[1] * s}
              ${points[2] * s} ${points[3] * s}
              ${points[4] * s} ${points[5] * s}
            `;
          }),
        }, 0);
      }

      animation.init();
    };

    shapeEls.forEach((el) => animateShape(el));
  }, [showAnimation]);

  const getGlow = (color) =>
    isDarkMode
      ? `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 0px ${color}) drop-shadow(0 0 10px ${color})`
      : "none";

  // 🚀 kalau di mobile (showAnimation === false), return null
  if (!showAnimation) return null;

  return (
    <div
      ref={containerRef}
      className="layered-animations absolute flex justify-center items-center"
    >
      {/* Small Shapes */}
      {[0, 1, 2].map((i) => {
        const color = isDarkMode ? darkColors[i % darkColors.length] : lightColor;
        return (
          <svg
            key={`small-${i}`}
            className="small shape"
            viewBox="0 0 96 96"
            style={{
              stroke: color,
              fill: color,
              filter: getGlow(color),
            }}
          >
            {i === 0 && <rect width="48" height="48" x="24" y="24" />}
            {i === 1 && (
              <polygon
                points="48 17.28 86.4 80.11584 9.6 80.11584"
              />
            )}
            {i === 2 && <circle cx="48" cy="48" r="32" />}
          </svg>
        );
      })}

      {/* Large Shapes */}
      {[0, 1, 2].map((i) => {
        const color = isDarkMode ? darkColors[i % darkColors.length] : lightColor;
        return (
          <svg
            key={`large-${i}`}
            className="shape"
            viewBox="0 0 96 96"
            style={{
              stroke: color,
              fill: "transparent",
              filter: getGlow(color),
            }}
          >
            {i === 0 && <circle cx="48" cy="48" r="28" />}
            {i === 1 && <rect width="48" height="48" x="24" y="24" />}
            {i === 2 && (
              <polygon
                points="48 17.28 86.4 80.11584 9.6 80.11584"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}
