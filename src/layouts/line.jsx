"use client";
import { useRef, useEffect } from "react";

export default function Line() {
  const path = useRef(null);
  let progress = 0;
  let x = 0.5;
  let time = Math.PI / 2;
  let reqId = null;

  useEffect(() => {
    setPath(progress);
    const handleResize = () => setPath(progress);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const setPath = (progress) => {
    const width = window.innerWidth;
    if (path.current) {
      path.current.setAttribute(
        "d",
        `M0 200 Q${width * x} ${200 + progress}, ${width} 200`
      );
    }
  };

  const lerp = (x, y, a) => x * (1 - a) + y * a;

  const manageMouseEnter = () => {
    if (reqId) {
      cancelAnimationFrame(reqId);
      resetAnimation();
    }
  };

  const manageMouseMove = (e) => {
    const { movementY, clientX } = e;
    const pathBound = path.current?.getBoundingClientRect();

    if (pathBound) {
      x = (clientX - pathBound.left) / pathBound.width;
      progress += movementY;
      setPath(progress);
    }
  };

  const manageMouseLeave = () => animateOut();

  const animateOut = () => {
    const newProgress = progress * Math.sin(time);
    progress = lerp(progress, 0, 0.025);
    time += 0.2;
    setPath(newProgress);

    if (Math.abs(progress) > 0.75) {
      reqId = requestAnimationFrame(animateOut);
    } else {
      resetAnimation();
    }
  };

  const resetAnimation = () => {
    time = Math.PI / 2;
    progress = 0;
  };

  return (
    <div className="relative w-full h-[300px]">
      <div
        onMouseEnter={manageMouseEnter}
        onMouseMove={manageMouseMove}
        onMouseLeave={manageMouseLeave}
        className="absolute inset-0 z-10 h-[100px]"
      ></div>

      <svg className="absolute inset-0 w-full h-full">
        <path
          ref={path}
          className="stroke-current text-zinc-500 stroke-[2.5px] fill-none"
        ></path>
      </svg>
    </div>
  );
}
