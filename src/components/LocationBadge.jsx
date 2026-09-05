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
        "mt-[3px] block text-left",
        "text-[8px] font-semibold leading-none tracking-[0.06em]",
        "sm:mt-1 sm:text-[10px]",
        "md:text-[11px]",
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
    : "rgba(24,24,27,0.62)";

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
      globe.style.transform = `
        translate(-50%, -50%)
        rotateZ(-14deg)
        rotateX(20deg)
        rotateY(${angle}deg)
      `;
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
      {
        threshold: 0.1,
      }
    );

    const handleWheel = (event) => {
      boostSpin(event.deltaY);
    };

    const handleTouchStart = (event) => {
      touchYRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      const currentY = event.touches[0].clientY;

      const delta =
        touchYRef.current - currentY;

      if (Math.abs(delta) > 2) {
        boostSpin(delta);
      }

      touchYRef.current = currentY;
    };

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };

    observer.observe(badge);

    window.addEventListener("wheel", handleWheel, {
      passive: true,
    });

    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    window.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    animate();

    return () => {
      observer.disconnect();

      cancelAnimationFrame(rafRef.current);

      clearTimeout(timeoutRef.current);

      window.removeEventListener("wheel", handleWheel);

      window.removeEventListener("touchstart", handleTouchStart);

      window.removeEventListener("touchmove", handleTouchMove);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
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
      <div
        className="
          relative
          h-[68px] w-[164px]
          xs:h-[72px] xs:w-[174px]
          sm:h-[88px] sm:w-[210px]
          md:h-[100px] md:w-[240px]
          lg:h-[114px] lg:w-[275px]
        "
      >
        {/* Main Badge Shape */}
        <svg
          viewBox="0 0 300 121"
          xmlns="http://www.w3.org/2000/svg"
          className="
            absolute inset-0
            h-full w-full
            drop-shadow-[0_10px_25px_rgba(0,0,0,0.18)]
            sm:drop-shadow-[0_16px_35px_rgba(0,0,0,0.2)]
            lg:drop-shadow-[0_18px_40px_rgba(0,0,0,0.22)]
          "
          preserveAspectRatio="none"
        >
          <path
            d="
              M239.633657,0
              C272.770742,0 299.633657,26.862915 299.633657,60
              C299.633657,93.137085 272.770742,120 239.633657,120
              L0,120
              L0,0
              L239.633657,0
              Z

              M239.633657,18.7755102
              C216.866,18.7755102 198.409167,37.232343 198.409167,60
              C198.409167,82.767657 216.866,101.22449 239.633657,101.22449
              C262.401314,101.22449 280.858147,82.767657 280.858147,60
              C280.858147,37.232343 262.401314,18.7755102 239.633657,18.7755102
              Z
            "
            fill={shapeColor}
            className="transition-colors duration-500"
          />
        </svg>

        {/* Text */}
        <div
          className="
            absolute
            left-[16%]
            top-1/2
            flex
            -translate-y-1/2
            flex-col
            items-start
            text-left

            sm:left-[17%]
          "
        >
          <p
            className="
              m-0
              flex flex-col
              items-start
              gap-0
              text-left

              text-[11px]
              font-bold
              leading-[1.02]
              tracking-[-0.035em]

              sm:text-[14px]
              sm:leading-[1.04]

              md:text-[16px]

              lg:text-[18px]
            "
            style={{
              color: textColor,
            }}
          >
            <span
              style={{
                color: mutedText,
              }}
            >
              Located
            </span>

            <span>in the</span>

            <span>Indonesia</span>
          </p>

          <DigitalClock
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Globe Area */}
        <div
          className="
            absolute
            right-[6.5%]
            top-1/2
            aspect-square
            w-[27.5%]
            -translate-y-1/2
            rounded-full
          "
        >
          {/* Circle Background */}
          <div
            className="
              absolute
              inset-0
              rounded-full
              transition-colors
              duration-500
            "
            style={{
              background: circleBg,
            }}
          />

          {/* Globe */}
          <div
            ref={globeRef}
            className="
              absolute
              left-1/2
              top-1/2
              aspect-square

              w-[48%]
              sm:w-[52%]
              lg:w-[54%]
            "
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
                  border: `1.4px solid ${globeLine}`,

                  transform,

                  transition:
                    "border-color 0.5s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
