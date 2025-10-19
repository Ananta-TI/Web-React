import { useEffect, useRef } from "react";
import { animate } from 'animejs';
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      const targetPos = -scrollPercent * 200;

      anime({
        targets: barRef.current,
        backgroundPositionX: `${targetPos}px`,
        easing: "easeOutQuad",
        duration: 300,
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={barRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "6px",
        background:
          "repeating-linear-gradient(to right, red 0 3px, #333 3px 10px)",
        backgroundSize: "200% 100%",
        filter: "drop-shadow(0 0 6px red)",
        zIndex: 9999,
      }}
    ></div>
  );
}
