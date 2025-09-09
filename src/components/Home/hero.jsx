import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import Particles from "./particles";
import { ChevronDown } from "lucide-react";
import Magnet from "./magnet"; // Import komponen Magnet

export default function Hero() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <section
      id="home"
      className={`relative min-h-180 flex flex-col items-center justify-center overflow-hidden text-center sm:px-6 lg:px-8 ${
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
        className="absolute inset-0 z-20 w-full h-full"
      />

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Foto dengan Magnet Effect */}
        <Magnet magnetStrength={4}>
          <div className="relative w-40 h-40 overflow-hidden rounded-full cursor-pointer md:w-96 md:h-76">
            <img
              src={isDarkMode ? "../img/logo1.png" : "../img/logo3.png"}
              alt="Ananta Firdaus"
              className="object-cover w-full h-full "
            />
          </div>
        </Magnet>

        <h1 className="mt-6 text-9xl font-MailBox md:text-9xl">Ananta Firdaus</h1>
        <p className=" mx-auto mt-4 text-2xl opacity-80 font-mono">
          Passionate about web development, design, and technology.
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
    </section>
  );
}
