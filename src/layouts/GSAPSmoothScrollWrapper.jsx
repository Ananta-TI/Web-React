import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export let smootherInstance = null;

const GSAPSmoothScrollWrapper = ({ children }) => {
  const smootherRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Fungsi untuk mengecek apakah device adalah mobile
  const checkIsMobile = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // Throttle function untuk resize event
  const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  useEffect(() => {
    setIsMobile(checkIsMobile());
    
    // Inisialisasi ScrollSmoother dengan pengaturan berbeda untuk desktop dan mobile
    smootherInstance = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: isMobile ? 0.5 : 2, // Kurangi smoothness di mobile untuk performa lebih baik
      effects: !isMobile, // Nonaktifkan effects di mobile
      smoothTouch: isMobile ? 0.1 : 0, // Touch smoothing hanya di mobile
      normalizeScroll: isMobile, // Normalisasi scroll di mobile
      ignoreMobileResize: true, // Mencegah masalah resize di mobile
    });

    // Refresh ScrollTrigger saat resize dengan throttle
    const handleResize = throttle(() => {
      ScrollTrigger.refresh();
      
      // Periksa apakah device berubah dari desktop ke mobile atau sebaliknya
      const newIsMobile = checkIsMobile();
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        // Restart ScrollSmoother dengan pengaturan baru
        smootherInstance.kill();
        smootherInstance = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: newIsMobile ? 0.5 : 2,
          effects: !newIsMobile,
          smoothTouch: newIsMobile ? 0.1 : 0,
          normalizeScroll: newIsMobile,
          ignoreMobileResize: true,
        });
      }
    }, 200);
    
    window.addEventListener("resize", handleResize);
    
    // Refresh ScrollTrigger setelah komponen dimuat
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      // Hapus event listener dan instance
      window.removeEventListener("resize", handleResize);
      if (smootherInstance) {
        smootherInstance.kill();
        smootherInstance = null;
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile]);

  return (
    <div id="smooth-wrapper" ref={smootherRef}>
      <div id="smooth-content">{children}</div>
    </div>
  );
};

export default GSAPSmoothScrollWrapper;