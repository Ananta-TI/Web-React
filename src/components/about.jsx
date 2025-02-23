// import { useContext } from "react";
// import { motion } from "framer-motion";
// import DecryptedText from "./DecryptedText";
// import { ThemeContext } from "./ThemeContext";
// import { TextReveal } from "./text-reveal"; // Import TextReveal

// const About = () => {
//   const { isDarkMode } = useContext(ThemeContext);

//   return (
//     <section
//       id="About"
//       className={`relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-24 transition-colors duration-500 ${
//         isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-black"
//       }`}
//     >
//       {/* Judul "About Me" dengan efek decrypt */}
//       <motion.h2
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1, ease: "easeOut" }}
//         className="text-7xl md:text-7xl font-bold "
//       >
//         <DecryptedText
//           text="About Me"
//           speed={100}
//           maxIterations={105}
//           sequential
//           animateOn="view"
//         />
//       </motion.h2>

//       {/* Paragraf dengan efek TextReveal */}
//       <div className="max-w-900 text-center">
//         <TextReveal
//           text="Hi there! 👋🏼 I’m Ananta Firdaus, a frontend developer who loves crafting sleek and interactive user interfaces. I aim for efficiency while blending design with functionality.

//           Currently, I’m studying Informatics Engineering at Politeknik Caltex Riau, focusing on React.js and frontend development. My goal is to create seamless digital experiences that feel intuitive and engaging."
//           className="text-lg md:text-xl text-gray-300 leading-relaxed"
//         />
//       </div>
//     </section>
//   );
// };

// export default About;
