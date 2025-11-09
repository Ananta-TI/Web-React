import { ThemeProvider } from "./context/ThemeContext";
import { Routes, Route } from "react-router-dom";

import Header from "./layouts/Header";
import Footer from "./layouts/footer";
import Hero from "./components/Home/hero";
import ScrollProgress from "./components/Home/ScrollProgress";
import Hero2 from "./components/Shared/TextPressure";
import About from "./layouts/about";
import TargetCursor from "./components/Shared/TargetCursor";
import Project from "./layouts/project";
import AllProjects from "./layouts/AllProjects";
// import PrivacyPolicy from "./layouts/PrivacyPolicy.jsx";
// import PrivacyPolicy from "./layouts/PrivacyPolicy";
import Certificates from "./layouts/Certificates";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Contact from "./layouts/contact/contact.jsx";
import Timeline from "./layouts/timeline";
import Courses from "./layouts/Courses";

// import Courses from "./layouts/Courses";


import './index.css';
import './assets/tailwind.css';

function App() {
  return (
    <ThemeProvider>
      <TargetCursor spinDuration={1.1} hideDefaultCursor={true} />

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
          {/* <Route path="/courses" element={<Courses />} /> */}
<Route path="/courses" element={<Courses />} />

        <Route path="/timeline" element={<Timeline />} />
        <Route path="/all-projects" element={<AllProjects />} />
        <Route path="/certificates" element={<Certificates />} />
        {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} /> */}

      </Routes>
      
        <ScrollProgress />
      <Footer />
      <SpeedInsights />

            <Analytics />

    </ThemeProvider>
  );
}

export default App;
