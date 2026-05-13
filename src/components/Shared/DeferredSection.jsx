import { useEffect, useRef, useState } from "react";

export default function DeferredSection({
  children,
  rootMargin = "600px",
  minHeight = "50vh",
  className = "",
  id,
}) {
  const ref = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const handleForceRender = (event) => {
      const targetId = event.detail?.id;

      if (id && targetId === id) {
        setShouldRender(true);
      }
    };

    window.addEventListener("force-render-section", handleForceRender);

    return () => {
      window.removeEventListener("force-render-section", handleForceRender);
    };
  }, [id]);

  useEffect(() => {
    if (shouldRender) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <section
      id={id}
      ref={ref}
      className={className}
      style={{ minHeight: shouldRender ? undefined : minHeight }}
    >
      {shouldRender ? children : null}
    </section>
  );
}