import { useContext } from "react";
import { motion } from "framer-motion";
import DecryptedText from "../components/Shared/DecryptedText";
import { ThemeContext } from "../context/ThemeContext";
import CardSwap, { Card } from "../components/CardSwap";
import { Github, ExternalLink } from "lucide-react";
import "../index.css";

const About = () => {
  const { isDarkMode = true } = useContext(ThemeContext) ?? {};

  return (
    <section
      id="about"
      className={`w-full min-h-screen overflow-hidden transition-colors duration-500 ${
        isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* ---- Section Heading ---- */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mx-auto px-6 md:px-12 lg:px-20"
      >
        <h2 className="text-4xl mt-10 mb-10 px-4 md:px-20 lg:px-60 md:text-7xl font-lyrae font-bold">
          <DecryptedText
            text="Projects"
            speed={100}
            maxIterations={105}
            sequential
            animateOn="view"
          />
        </h2>
      </motion.div>

      {/* ---- Showcase Container ---- */}
      <div className="flex justify-center px-6 md:px-20 lg:px-32 pb-24">
        <div className="relative w-full rounded-3xl border border-zinc-700 bg-[#0a0215] shadow-inner overflow-hidden">
          {/* Action Buttons */}
          <div className="absolute top-6 left-6 flex gap-3 z-20">
            <a
              href="https://github.com/your-repo"
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub repo"
              className="rounded-full bg-zinc-100 p-2 text-zinc-800 transition hover:bg-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <Github className="w-6 h-6 md:w-7 md:h-7" />
            </a>
            <a
              href="https://your-live-demo.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Open live demo"
              className="rounded-full bg-zinc-100 p-2 text-zinc-800 transition hover:bg-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ExternalLink className="w-6 h-6 md:w-7 md:h-7" />
            </a>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-center gap-12 px-8 md:px-16 py-20">
            {/* ---- Left: Description ---- */}
            <div className="w-full md:w-1/2 max-w-md">
              <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                Card stacks have never
                <br />
                looked so good
              </h3>
              <p className="mt-4 text-base md:text-lg text-zinc-400">
                Just look at it go!
              </p>
            </div>

            {/* ---- Right: Animated Card Stack ---- */}
            <div className="relative w-full md:w-1/2">
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
              >
                {/* Card 1 */}
                <Card>
                  <div data-label="Smooth">
                    <div className="flex flex-col gap-4 items-center text-center p-4">
                      <p className="text-xl font-semibold flex items-center gap-2">
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 512 512"
                          className="w-6 h-6"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
                        </svg>
                        Smooth
                      </p>
                      <video
                        autoPlay
                        loop
                        playsInline
                        muted
                        className="rounded-xl w-full max-w-md"
                      >
                        <source
                          src="https://cdn.dribbble.com/userupload/7053861/file/original-7956be57144058795db6bb24875bdab9.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </Card>

                {/* Card 2 */}
                <Card>
                  <div data-label="Reliable">
                    <div className="flex flex-col gap-4 items-center text-center p-4">
                      <p className="text-xl font-semibold flex items-center gap-2">
                        <svg
                          stroke="currentColor"
                          fill="currentColor"
                          strokeWidth="0"
                          viewBox="0 0 640 512"
                          className="w-6 h-6"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z" />
                        </svg>
                        Reliable
                      </p>
                      <video
                        autoPlay
                        loop
                        playsInline
                        muted
                        className="rounded-xl w-full max-w-md"
                      >
                        <source
                          src="https://cdn.dribbble.com/userupload/7078020/file/original-b071e9063d9e3ba86a85a61b9d5a7c42.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </Card>

                {/* Card 3 */}
                <Card>
                  <div
                  
                    data-label="Customizable"
                  >
                    <div className="flex flex-col gap-4 items-center text-center p-4">
                      <p className="text-xl font-semibold flex items-center gap-2 text-white">
                        <svg className="w-6 h-6" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z" /></svg>
                        Customizable
                      </p>
                      <video autoPlay loop playsInline muted className="rounded-xl w-full max-w-md">
                        <source
                          src="https://cdn.dribbble.com/userupload/7098541/file/original-0b063b12ca835421580e6034368ad95a.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
