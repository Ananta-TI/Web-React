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

      <DeferredSection rootMargin="800px" minHeight="45vh">
        <Suspense fallback={<SectionFallback height="45vh" />}>
          <Hero2 />
        </Suspense>
      </DeferredSection>

      <DeferredSection rootMargin="700px" minHeight="80vh">
        <Suspense fallback={<SectionFallback height="80vh" />}>
          <About />
        </Suspense>
      </DeferredSection>

      <DeferredSection rootMargin="700px" minHeight="90vh">
        <Suspense fallback={<SectionFallback height="90vh" />}>
          <Project />
        </Suspense>
      </DeferredSection>
    </>
  );
}