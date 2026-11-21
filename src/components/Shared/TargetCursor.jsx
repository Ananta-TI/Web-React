import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
} from "framer-motion";

/**
 * CustomCursor (reactbits-style)
 *
 * Ring + dot yang mengikuti kursor dengan spring physics. Saat hover ke
 * elemen `.cursor-target` (atau selector lain), ring membesar & mengikuti
 * bentuk + border-radius target (dengan padding). Semua parameter bisa di-custom.
 */
const TargetCursor = ({
  targetSelector = ".cursor-target",
  circleSize = 30,
  dotSize = 11,
  borderWidth = 2,
  mixBlendMode = "normal",
  circleStiffness = 400,
  circleDamping = 30,
  dotStiffness = 10000,
  dotDamping = 45,
  targetPadding = 7,
  elasticStretch = false,
  showOnTouch = false,
  hideDefaultCursor = true,
}) => {
  const cursorRef = useRef(null);
  const mousePosRef = useRef({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const activeTargetRef = useRef(null);
  const activeLeaveRef = useRef(null);
  const isHoveringRef = useRef(false);

  const [hover, setHover] = useState({
    active: false,
    w: circleSize,
    h: circleSize,
    r: "50%",
  });

  // Snap ukuran ke lingkaran saat kembali ke idle (tanpa morph oval/"melonjong")
  const [snapReturn, setSnapReturn] = useState(false);

  // Gate untuk elastic stretch: dimatikan saat hover & transisi kembali ke idle
  // supaya ring tidak "melonjong".
  const stretchGate = useMotionValue(1);

  // Motion values untuk posisi mouse (target spring)
  const mouseX = useMotionValue(mousePosRef.current.x);
  const mouseY = useMotionValue(mousePosRef.current.y);
  const dotMouseX = useMotionValue(mousePosRef.current.x);
  const dotMouseY = useMotionValue(mousePosRef.current.y);

  // Spring untuk ring dan dot (stiffness/damping terpisah)
  const circleX = useSpring(mouseX, {
    stiffness: circleStiffness,
    damping: circleDamping,
  });
  const circleY = useSpring(mouseY, {
    stiffness: circleStiffness,
    damping: circleDamping,
  });
  const dotX = useSpring(dotMouseX, { stiffness: dotStiffness, damping: dotDamping });
  const dotY = useSpring(dotMouseY, { stiffness: dotStiffness, damping: dotDamping });

  // Elastic stretch berdasarkan velocity
  const velX = useVelocity(circleX);
  const velY = useVelocity(circleY);
  const stretch = 0.0002;
  const scaleX = useTransform([velX, stretchGate], ([v, g]) =>
    elasticStretch && g ? 1 + Math.min(Math.abs(v) * stretch, 0.25) : 1
  );
  const scaleY = useTransform([velY, stretchGate], ([v, g]) =>
    elasticStretch && g ? 1 + Math.min(Math.abs(v) * stretch, 0.25) : 1
  );

  const updateHoverFromTarget = useCallback((target) => {
    const rect = target.getBoundingClientRect();
    const computed = window.getComputedStyle(target);
    setHover({
      active: true,
      w: rect.width,
      h: rect.height,
      r: computed.borderRadius || "0px",
    });
    mouseX.set(rect.left + rect.width / 2);
    mouseY.set(rect.top + rect.height / 2);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouch && !showOnTouch) {
      if (cursorRef.current) cursorRef.current.style.display = "none";
      return;
    }

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = "none";

    const moveHandler = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      dotMouseX.set(e.clientX);
      dotMouseY.set(e.clientY);
      if (!isHoveringRef.current) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    const enterHandler = (e) => {
      const target = e.target?.closest?.(targetSelector);
      if (!target || !cursorRef.current) return;
      if (activeTargetRef.current === target) return;

      // cleanup listener lama
      if (activeLeaveRef.current && activeTargetRef.current) {
        activeTargetRef.current.removeEventListener(
          "mouseleave",
          activeLeaveRef.current
        );
      }

      activeTargetRef.current = target;
      isHoveringRef.current = true;
      stretchGate.set(0);
      updateHoverFromTarget(target);

      const onLeave = () => {
        activeTargetRef.current = null;
        isHoveringRef.current = false;
        setHover((h) => ({ ...h, active: false }));
        mouseX.set(mousePosRef.current.x);
        mouseY.set(mousePosRef.current.y);
        stretchGate.set(0);
        setSnapReturn(true);
        setTimeout(() => {
          stretchGate.set(1);
          setSnapReturn(false);
        }, 400);
        target.removeEventListener("mouseleave", onLeave);
        activeLeaveRef.current = null;
      };
      activeLeaveRef.current = onLeave;
      target.addEventListener("mouseleave", onLeave);
    };

    const scrollHandler = () => {
      if (!isHoveringRef.current || !activeTargetRef.current) return;
      updateHoverFromTarget(activeTargetRef.current);
    };

    window.addEventListener("mousemove", moveHandler, { passive: true });
    document.addEventListener("mouseover", enterHandler, { passive: true });
    window.addEventListener("scroll", scrollHandler, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseover", enterHandler);
      window.removeEventListener("scroll", scrollHandler);
      if (activeLeaveRef.current && activeTargetRef.current) {
        activeTargetRef.current.removeEventListener(
          "mouseleave",
          activeLeaveRef.current
        );
      }
      activeTargetRef.current = null;
      activeLeaveRef.current = null;
      if (hideDefaultCursor) document.body.style.cursor = originalCursor;
    };
  }, [
    targetSelector,
    hideDefaultCursor,
    showOnTouch,
    mouseX,
    mouseY,
    dotMouseX,
    dotMouseY,
    updateHoverFromTarget,
  ]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode,
      }}
    >
      {/* Ring */}
      <motion.div
        style={{
          position: "absolute",
          x: circleX,
          y: circleY,
          translateX: "-50%",
          translateY: "-50%",
          scaleX,
          scaleY,
          transformOrigin: "center",
        }}
        animate={{
          width: hover.active ? hover.w + targetPadding * 2 : circleSize,
          height: hover.active ? hover.h + targetPadding * 2 : circleSize,
          borderRadius: hover.active ? hover.r : "50%",
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 35,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `${borderWidth}px solid white`,
            borderRadius: "inherit",
            boxSizing: "border-box",
            backgroundColor: "transparent",
          }}
        />
      </motion.div>

      {/* Dot */}
      <motion.div
        style={{
          position: "absolute",
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          backgroundColor: "white",
        }}
      />
    </div>
  );
};

export default TargetCursor;
