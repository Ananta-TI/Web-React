import { useContext } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import { TextReveal } from "../components/Shared/TextReveal";
import GithubGraph from "../components/GithubGraph";
import GithubCard from "../components/GithubCard";
import { AnimatedBeamDemo } from "../components/AnimatedBeamDemo";
import ExperienceList from "../components/Home/ExperienceList";
import "../index.css";

const About = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true; // Default dark mode jika context belum tersedia

  return (
    <section
      id="About"
      className={`w-full min-h-screen overflow-hidden flex-col items-center transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
      }`}
    >
    
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mx-auto px-6 md:px-12 lg:px-20"
      >
        {/* About Me Section */}
        <h2 className="text-4xl mt-10 px-60 md:text-7xl font-lyrae font-bold transition-colors duration-500">
          <DecryptedText
            text="About Me"
            speed={100}
            maxIterations={105}
            sequential
            animateOn="view"
          />
        </h2>

        <TextReveal
          className="relative text-2xl leading-relaxed font-mono transition-colors duration-500 font"
          text="Hi there! 👋 I’m Ananta Firdaus, a frontend developer with a unique combination of traits—I’m both a perfectionist and lazy. I always strive for the most efficient way to achieve high-quality results. Currently studying Informatics Engineering at Politeknik Caltex Riau, I have a strong foundation in logical thinking and structured problem-solving. However, my passion lies in crafting elegant and interactive user interfaces, ensuring that every design is not only visually appealing but also intuitive and seamless. Lately, I’ve been diving deeper into React.js, exploring dynamic UI development and smooth animations to create engaging digital experiences. My goal is to bridge aesthetics and functionality, making technology feel effortless for users."
        />
      </motion.div>
      {/* Experience Section */}
      <h2 className="text-4xl -mt-30 px-80 md:text-5xl font-lyrae font-bold transition-colors duration-500">
        <DecryptedText
          text="Experience"
          speed={100}
          maxIterations={105}
          sequential
          animateOn="view"
        />
      </h2>
      <div className="mt-10  px-6 md:px-12 lg:px-80">
        <ExperienceList />
      </div>{" "}

      <div className="flex items-center justify-center mb-6 mt-2 gap-4">

      <GithubCard username="Ananta-TI" />
      <GithubGraph />
      </div>
 <div className="dark">
      <AnimatedBeamDemo />
    </div>
        </section>
  );
};

export default About;
