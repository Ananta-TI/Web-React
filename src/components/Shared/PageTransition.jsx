import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";

const PageTransitionContext = createContext(null);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function PageTransitionProvider({ children }) {
  const { isDarkMode } = useContext(ThemeContext);
  const reduceMotion = useReducedMotion();

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [label, setLabel] = useState("ANANTA");

  const isTransitioningRef = useRef(false);

  const transitionTo = useCallback(
    async (callback, nextLabel = "ANANTA") => {
      if (reduceMotion) {
        callback?.();
        return;
      }

      if (isTransitioningRef.current) return;

      isTransitioningRef.current = true;

      setLabel(nextLabel);
      setIsActive(true);
      setPhase("cover");

      window.lenis?.stop?.();

      await wait(780);

      callback?.();

      requestAnimationFrame(() => {
        window.lenis?.scrollTo?.(0, { immediate: true });
        window.scrollTo(0, 0);
      });

      await wait(240);

      setPhase("reveal");

      await wait(850);

      setIsActive(false);
      setPhase("idle");

      window.lenis?.start?.();

      isTransitioningRef.current = false;
    },
    [reduceMotion]
  );

  const panelColor = isDarkMode ? "bg-[#faf9f9]" : "bg-zinc-900";
  const textColor = isDarkMode ? "text-black" : "text-white";



  const lineColor = isDarkMode ? "bg-black/10" : "bg-white/15";

  return (
    <PageTransitionContext.Provider value={{ transitionTo, isActive }}>
      {children}

      <AnimatePresence>
        {isActive && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden"
            initial={false}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`absolute inset-0 ${panelColor}`}
              style={{
                willChange: "clip-path",
              }}
              initial={{
                clipPath: "circle(0% at 50% 100%)",
              }}
              animate={
                phase === "cover"
                  ? {
                      clipPath: "circle(155% at 50% 50%)",
                    }
                  : {
                      clipPath: "circle(0% at 50% 50%)",
                    }
              }
              transition={{
                duration: phase === "cover" ? 0.78 : 0.85,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              <motion.div
                className={`absolute left-1/2 top-1/2 h-[50vw] w-[50vw] max-h-[720px] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl `}
                initial={{
                  opacity: 0,
                  scale: 0.45,
                }}
                animate={
                  phase === "cover"
                    ? {
                        opacity: [0, 1, 0.65],
                        scale: [0.45, 1, 1.2],
                      }
                    : {
                        opacity: [0.65, 0.3, 0],
                        scale: [1.2, 1.38, 1.6],
                      }
                }
                transition={{
                  duration: phase === "cover" ? 0.72 : 0.78,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />

              <motion.div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-lyrae text-3xl md:text-6xl tracking-[0.3em] ${textColor}`}
                initial={{
                  opacity: 0,
                  y: 34,
                  scale: 0.94,
                  filter: "blur(14px)",
                }}
                animate={
                  phase === "cover"
                    ? {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }
                    : {
                        opacity: 0,
                        y: -30,
                        scale: 1.05,
                        filter: "blur(10px)",
                      }
                }
                transition={{
                  duration: phase === "cover" ? 0.55 : 0.52,
                  ease: [0.76, 0, 0.24, 1],
                }}
              >
                {label}
              </motion.div>

              <motion.div
                className={`absolute left-1/2 top-1/2 h-px w-[min(520px,70vw)] -translate-x-1/2 translate-y-16 ${lineColor}`}
                initial={{
                  scaleX: 0,
                  opacity: 0,
                }}
                animate={
                  phase === "cover"
                    ? {
                        scaleX: 1,
                        opacity: 1,
                      }
                    : {
                        scaleX: 0,
                        opacity: 0,
                      }
                }
                transition={{
                  duration: 0.45,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider"
    );
  }

  return context;
}