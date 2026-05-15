import React, { memo, useEffect, useRef, useState } from "react";

const DigitalClock = memo(function DigitalClock({ isDarkMode }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      setTime(formatter.format(new Date()).replace(/\./g, ":"));
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={[
        "mt-1 block text-left text-[10px] font-semibold leading-none tracking-[0.08em]",
        "sm:text-[11px]",
        isDarkMode ? "text-zinc-700" : "text-zinc-300",
      ].join(" ")}
    >
      {time} WIB
    </span>
  );
});

export default function LocationBadge({
  isDarkMode = false,
  className = "",
}) {
  const badgeRef = useRef(null);
  const globeRef = useRef(null);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);
  const touchYRef = useRef(0);

  const shapeColor = isDarkMode ? "#e4e4e7" : "#1C1D20";
  const circleBg = isDarkMode
    ? "rgba(24,24,27,0.16)"
    : "rgba(255,255,255,0.18)";
  const textColor = isDarkMode ? "#18181b" : "#ffffff";
  const mutedText = isDarkMode
    ? "rgba(24,24,27,0.68)"
    : "rgba(255,255,255,0.78)";
  const globeLine = isDarkMode
    ? "rgba(255,255,255,0.88)"
    : "rgba(24,24,27,0.62) ";

  useEffect(() => {
    const badge = badgeRef.current;
    const globe = globeRef.current;

    if (!badge || !globe) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      globe.style.transform =
        "translate(-50%, -50%) rotateZ(-14deg) rotateX(20deg) rotateY(0deg)";
      return;
    }

    let angle = 0;
    let direction = 1;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const setTransform = () => {
      globe.style.transform = `translate(-50%, -50%) rotateZ(-14deg) rotateX(20deg) rotateY(${angle}deg)`;
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      if (!isVisible || !isTabVisible) return;

      angle += 0.32 * direction;
      setTransform();
    };

    const boostSpin = (delta) => {
      if (!isVisible || !isTabVisible) return;

      direction = delta > 0 ? 1 : -1;
      angle += direction * 5.5;
      setTransform();

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        cancelAnimationFrame(rafRef.current);
        animate();
      }, 260);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    const handleWheel = (event) => {
      boostSpin(event.deltaY);
    };

    const handleTouchStart = (event) => {
      touchYRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      const currentY = event.touches[0].clientY;
      const delta = touchYRef.current - currentY;

      if (Math.abs(delta) > 2) {
        boostSpin(delta);
      }

      touchYRef.current = currentY;
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    observer.observe(badge);

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animate();

    return () => {
      observer.disconnect();

      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);

      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const circles = [
    "rotateY(0deg)",
    "rotateY(60deg)",
    "rotateY(120deg)",
    "rotateX(90deg)",
    "rotateX(90deg) translateZ(11px) scale(0.72)",
    "rotateX(90deg) translateZ(-11px) scale(0.72)",
  ];

  return (
    <div
      ref={badgeRef}
      aria-label="Located in Indonesia, current WIB time"
      className={[
        "pointer-events-none relative inline-flex select-none",
        className,
      ].join(" ")}
    >
      <div className="relative h-[92px] w-[218px] sm:h-[104px] sm:w-[250px] lg:h-[114px] lg:w-[275px]">
        <svg
          viewBox="0 0 300 121"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
          preserveAspectRatio="none"
        >
          <path
            d="M239.633657,0 C272.770742,0 299.633657,26.862915 299.633657,60 C299.633657,93.137085 272.770742,120 239.633657,120 L0,120 L0,0 L239.633657,0 Z M239.633657,18.7755102 C216.866,18.7755102 198.409167,37.232343 198.409167,60 C198.409167,82.767657 216.866,101.22449 239.633657,101.22449 C262.401314,101.22449 280.858147,82.767657 280.858147,60 C280.858147,37.232343 262.401314,18.7755102 239.633657,18.7755102 Z"
            fill={shapeColor}
            className="transition-colors duration-500"
          />
        </svg>

        <div className="absolute left-[17%] top-1/2 flex -translate-y-1/2 flex-col items-start text-left">
          <p
            className="m-0 flex flex-col items-start gap-[1px] text-left text-[15px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[17px] lg:text-[18px]"
            style={{ color: textColor }}
          >
            <span style={{ color: mutedText }}>Located</span>
            <span>in the</span>
            <span>Indonesia</span>
          </p>

          <DigitalClock isDarkMode={isDarkMode} />
        </div>

        <div className="absolute right-[6.4%] top-1/2 aspect-square w-[27.8%] -translate-y-1/2 rounded-full">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: circleBg }}
          />

          <div
            ref={globeRef}
            className="absolute left-1/2 top-1/2 aspect-square w-[54%]"
            style={{
              transform:
                "translate(-50%, -50%) rotateZ(-14deg) rotateX(20deg) rotateY(0deg)",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {circles.map((transform, index) => (
              <div
                key={index}
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${globeLine}`,
                  transform,
                  transition: "border-color 0.5s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}