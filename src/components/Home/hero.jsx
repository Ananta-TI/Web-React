import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import Particles from "./particles";
import LiquidEther from './LiquidEther';

import { ChevronDown } from "lucide-react";
import Magnet from "./magnet"; // Import komponen Magnet


export default function Hero() {
  const { isDarkMode } = useContext(ThemeContext);
window.scrollTo(0, 0);

  return (
    <section
      id="home"
      className={`relative min-h-180 flex flex-col items-center justify-center overflow-hidden text-center sm:px-6 lg:px-8 ${
isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      {/* Background Particles */}
      {/* <Particles
        particleCount={200}
        particleSpread={8}
        speed={0.1}
        particleColors={["#ffffff", "#ffffff", "#ffffff"]}
        moveParticlesOnHover={true}
        particleHoverFactor={2}
        alphaParticles={true}
        particleBaseSize={120}
        sizeRandomness={5.2}
        cameraDistance={25}
        disableRotation={false}
        className="absolute inset-0 z-20 w-full h-full"
      /> */}


<div style={{ width: '100%', height: 800, position: 'absolute' }}>
  <LiquidEther
    colors={[ '#171717', '#fff', '#fff' ]}
    mouseForce={20}
    cursorSize={100}
    isViscous={false}
    viscous={30}
    iterationsViscous={32}
    iterationsPoisson={32}
    resolution={0.5}
    isBounce={false}
    autoDemo={true}
    autoSpeed={0.5}
    autoIntensity={2.2}
    takeoverDuration={0.25}
    autoResumeDelay={3000}
    autoRampDuration={0.6}
  />
</div>

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Foto dengan Magnet Effect */}
        <Magnet magnetStrength={4}>
          <div className="relative w-70 h-40 overflow-hidden  cursor-pointer md:w-96 md:h-76">
            <img
  key={isDarkMode}
  src={isDarkMode ? "../img/logo1.png" : "../img/logo3.png"}
  alt="Ananta Firdaus"
  style={{
    animation: "scale-in-hor-center 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
  }}
  className="object-cover w-full h-full"
/>


          </div>
        </Magnet>

        <h1 className="mt-6 text-9xl font-MailBox md:text-9xl">@nanta Firdaus</h1>
        <p className=" mx-auto mt-4 text-lg opacity-80 font-mono">
          Developing and designing the next generation of web applications.
        </p>
      </motion.div>

          {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 10 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        className="absolute z-10 bottom-10"
      >
        <ChevronDown size={32} />
      </motion.div>

      {/* Bottom Gradient Separator */}
      <div
        className={`absolute bottom-0 left-0 w-full h-40 z-30 pointer-events-none ${
          isDarkMode
            ? "bg-gradient-to-b from-transparent to-zinc-900"
            : "bg-gradient-to-b from-transparent to-[#faf9f9]"
        }`}
      />
    </section>
  );
}
