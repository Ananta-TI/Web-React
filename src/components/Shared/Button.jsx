import { useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function RevealButton({
  children,
  href,
  to,
  type = "button", // Tambahkan type (default ke button)
  variant = "secondary",
  size = "md",
  className = "",
}) {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const buttonRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  const getStyles = () => {
    if (variant === "primary") {
      return {
        wrapper: isDarkMode
          ? "border-blue-500 hover:border-blue-400"
          : "border-blue-600 hover:border-blue-700",
        circle: isDarkMode ? "bg-blue-500" : "bg-blue-600",
        initialColor: isDarkMode ? "#60a5fa" : "#2563eb",
        hoverColor: "#ffffff",
      };
    }
    return {
      wrapper: isDarkMode
        ? "border-white/30 hover:border-white/80"
        : "border-black/30 hover:border-black/80",
      circle: isDarkMode ? "bg-white" : "bg-black",
      initialColor: isDarkMode ? "#ffffff" : "#000000",
      hoverColor: isDarkMode ? "#000000" : "#ffffff",
    };
  };

  const currentStyle = getStyles();

  const handleMouseEnter = (event) => {
    if (!circleRef.current || !textRef.current || !buttonRef.current) return;
    gsap.killTweensOf([circleRef.current, textRef.current]);
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    gsap.set(circleRef.current, { x, y, xPercent: -50, yPercent: -50, scale: 0, opacity: 1 });
    gsap.to(circleRef.current, { scale: 1, duration: 1, ease: "power3.out" });
    gsap.to(textRef.current, { color: currentStyle.hoverColor, duration: 0.2 });
  };

  const handleMouseLeave = (event) => {
    if (!circleRef.current || !textRef.current || !buttonRef.current) return;
    gsap.killTweensOf([circleRef.current, textRef.current]);

    gsap.to(circleRef.current, {
      scale: 0,
      opacity: 1,
      duration: 0.45,
      ease: "power3.inOut",
      onComplete: () => gsap.set(circleRef.current, { opacity: 0 }),
    });
    gsap.to(textRef.current, { color: currentStyle.initialColor, duration: 0.45, ease: "power3.inOut" });
  };

  const Element = to ? Link : "a";
  const elementProps = to ? { to } : { href, target: "_blank", rel: "noreferrer" };

  return (
    <Element
      {...elementProps}
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        group relative isolate inline-flex shrink-0 items-center justify-center
        overflow-hidden rounded-full border bg-transparent
        font-bold uppercase leading-none tracking-[0.1em]
        transition-[border-color,box-shadow,transform] duration-300
        active:translate-y-[1px]
        ${size === "sm" ? "min-h-[42px] px-5 py-2.5 text-[11px]" : 
          size === "lg" ? "min-h-[60px] px-9 py-4 text-[13px] sm:px-10 sm:py-5" : 
          "min-h-[52px] px-7 py-3.5 text-[12px] sm:px-8 sm:py-4"}
        ${currentStyle.wrapper}
        ${className}
        !flex !box-border
      `}
    >
      <span
        ref={circleRef}
        className={`pointer-events-none absolute left-0 top-0 z-0 rounded-full opacity-0 ${currentStyle.circle}`}
        style={{ width: "250%", paddingBottom: "250%", transform: "translate(-50%, -50%) scale(0)" }}
      />
      <span ref={textRef} className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap" style={{ color: currentStyle.initialColor }}>
        {children}
      </span>
    </Element>
  );
}