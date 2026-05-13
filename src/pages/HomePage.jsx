import { lazy, Suspense } from "react";
import Hero from "../components/Home/hero";

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

      <Suspense fallback={<SectionFallback height="45vh" />}>
        <Hero2 />
      </Suspense>

      <Suspense fallback={<SectionFallback height="100vh" />}>
        <About />
      </Suspense>

      <Suspense fallback={<SectionFallback height="100vh" />}>
        <Project />
      </Suspense>
    </>
  );
}