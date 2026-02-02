import { useContext } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import { TextReveal } from "../components/Shared/TextReveal";
import GithubGraph from "../components/GithubGraph";
import GithubCard from "../components/GithubCard";
// import WakaTimeCard from "../components/WakaTimeCard.jsx";
import { AnimatedBeamDemo } from "../components/AnimatedBeamDemo";
import ExperienceList from "../components/Home/ExperienceList";
import Tetris from "./TetrioProfileCard.jsx";
import SteamProfileCard from "./SteamProfileCard";
import DiscordProfileCard from "./DiscordProfileCard.jsx";
import ScannerChart from "./scannerChart.jsx";

import "../index.css";

const About = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  return (
    <section
      id="about"
      className={`relative w-full min-h-screen overflow-hidden flex-col items-center transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-[#faf9f9] text-black"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mx-auto px-4 sm:px-6 md:px-12 lg:px-20"
      >
        <h2 className="text-3xl sm:text-4xl mt-6 sm:mt-10 px-4 sm:px-8 md:px-20 lg:px-60 md:text-7xl font-lyrae font-bold transition-colors duration-500">
          <DecryptedText
            text="About Me"
            speed={100}
            maxIterations={105}
            sequential
            animateOn="view"
          />
        </h2>

        {/* --- PERBAIKAN DI SINI --- */}
        {/* Bungkus TextReveal dengan div relative + z-10 */}
        <div className="relative z-10">
            <TextReveal
            className="relative lg:-mb-25 -mt-7 sm:-mb-10 sm:text-lg md:text-2xl leading-relaxed font-mono transition-colors duration-500 px-2 sm:px-4 md:px-0"
            text="Hi there! 👋 I'm **Ananta** **Firdaus**, a **frontend** **developer** with a unique combination of traits—I'm both a **perfectionist** **and** **lazy**. I always strive for the most **efficient way** to achieve high-quality results. Currently studying **Informatics** **Engineering** at **Politeknik** **Caltex** **Riau**, I have a strong foundation in logical thinking and structured problem-solving. However, my passion lies in crafting elegant and interactive user interfaces, ensuring that every design is not only visually appealing but also intuitive and seamless. Lately, I've been diving deeper into **React.js**, exploring **dynamic** **UI **development** and **smooth **animations** to create engaging digital experiences. My goal is to bridge **aesthetics** and **functionality**, making technology feel effortless for users."
            />
        </div>

      </motion.div>

      {/* Sisa konten sama... */}
      <h2 className="text-3xl -mb-10 sm:mt-20 px-4 sm:px-8 md:px-20 lg:px-80 md:text-5xl font-lyrae font-bold transition-colors duration-500">
        <DecryptedText
          text="Experience"
          speed={100}
          maxIterations={105}
          sequential
          animateOn="view"
        />
      </h2>

      <div className="mt-15 sm:mt-10 px-4 sm:px-6 md:px-12 lg:px-80">
        <ExperienceList />
      </div>

      <div
        className="w-full max-w-7xl mx-auto px-4 mt-1 grid gap-6
                grid-cols-1 lg:grid-cols-4 auto-rows-[minmax(120px,auto)]"
      >
        <div className="lg:col-span-1">
          <GithubCard username="Ananta-TI" />
        </div>
        <div className="lg:col-span-3 ">
          <GithubGraph />
        </div>
      </div>

      <div
        className="w-full max-w-7xl mx-auto px-4 mt-1
                grid grid-cols-1 lg:grid-cols-7 gap-2 auto-rows-[minmax(120px,auto)]">
        <div className="col-span-1 lg:col-span-3">
          <Tetris />
        </div>
        <div className="col-span-1 lg:col-span-4">
          <SteamProfileCard 
            steamIds={["76561199745356826", "76561199166544214","76561198773672138"]}
          />
        </div>
      </div>

      <div className="dark px-4 sm:px-0">
        <AnimatedBeamDemo />
      </div>

      <div className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-20">
        <ScannerChart />
      </div>
    </section>
  );
};

export default About;