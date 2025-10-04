import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route } from "react-router-dom";

import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import Hero from "./components/Home/hero";
import Hero2 from "./components/Shared/TextPressure";
import About from "./layouts/about";
import TargetCursor from "./components/Shared/TargetCursor";
import Project from "./layouts/project";
import AllProjects from "./layouts/AllProjects";
import Certificates from "./layouts/Certificates";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import './index.css';
import './assets/tailwind.css';

function App() {
  return (
    <ThemeProvider>
      <TargetCursor spinDuration={4.1} hideDefaultCursor={true} />
      <Header />

      <Routes>
        {/* Halaman utama */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Hero2 />
              <About />
              <Project />
            </>
          }
        />

        {/* Halaman All Projects */}
        <Route path="/all-projects" element={<AllProjects />} />
        <Route path="/certificates" element={<Certificates />} />
      </Routes>

      <Footer />
      <SpeedInsights />

            <Analytics />

    </ThemeProvider>
  );
}

export default App;
