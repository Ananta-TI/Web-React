import React, { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ContactTitle({ title }) {
  const el = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".title-text",
        { opacity: 0, y: "1.5rem" },
        {
          opacity: 1,
          duration: 1.5,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el.current,
            start: "top 60%",
            end: "bottom 60%",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={el} className="py-24 text-center text-5xl font-bold ">
      <p className="title-text text-zinc-200 dark:text-zinc-800">{title}</p>
    </div>
  );
}