import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { motion } from "framer-motion";
import Particles from "./particles";
import { ChevronDown } from "lucide-react";
import Magnet from "./Magnet"; // Import komponen Magnet

export default function Hero() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <section
      id="home"
      className={`relative min-h-180 flex flex-col items-center justify-center overflow-hidden text-center ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Background Particles */}
      <Particles
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
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Foto dengan Magnet Effect */}
        <Magnet magnetStrength={6}>
          <div className="relative w-40 h-40 md:w-96 md:h-76 rounded-full overflow-hidden cursor-pointer">
            <img
              src={isDarkMode ? "/public/img/logo1.png" : "/public/img/logo3.png"}
              alt="Ananta Firdaus"
              className="w-full h-full object-cover"
            />
          </div>
        </Magnet>

        <h1 className="text-4xl md:text-6xl font-bold mt-6">Ananta Firdaus</h1>
        <p className="text-lg mt-4 max-w-2xl mx-auto opacity-80">
          Passionate about web development, design, and technology.
        </p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 10 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
        className="absolute bottom-10 z-10"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
