import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export let smootherInstance = null;

const GSAPSmoothScrollWrapper = ({ children }) => {
  const smootherRef = useRef(null);

  useEffect(() => {
    smootherInstance = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 2,
      effects: true,
      smoothTouch: 0.1,
    });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    return () => {
      smootherInstance?.kill();
      smootherInstance = null;
      // window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
};

export default GSAPSmoothScrollWrapper;
