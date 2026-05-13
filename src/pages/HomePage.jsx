import { lazy, Suspense } from "react";
import Hero from "../components/Home/hero";
import DeferredSection from "../components/Shared/DeferredSection";

const Hero2 = lazy(() => import("../components/Shared/TextPressure"));
const About = lazy(() => import("../layouts/about"));
const Project = lazy(() => import("../layouts/project"));

function SectionFallback({ height = "50vh" }) {
  return (
    <div
      className="w-full bg-background"
      style={{ minHeight: height }}
      aria-hidden="true"
    />
  );
}

export default function HomePage({ isAppLoading }) {
  return (
    <>
      <Hero isAppLoading={isAppLoading} />

      <DeferredSection id="intro-motion" rootMargin="800px" minHeight="45vh">
        <Suspense >
          <Hero2 />
        </Suspense>
      </DeferredSection>

      <DeferredSection id="about-wrapper" rootMargin="900px" minHeight="80vh">
        <Suspense >
          <About />
        </Suspense>
      </DeferredSection>

      <Suspense >
        <Project />
      </Suspense>
    </>
  );
}