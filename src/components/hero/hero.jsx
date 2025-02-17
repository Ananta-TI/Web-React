import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative w-full h-screen bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col justify-center items-center text-center h-full text-white px-6">
        <motion.h1
          className="text-5xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Welcome to My Website
        </motion.h1>
        <motion.p
          className="text-xl mb-6 max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Im a passionate developer, and this is my personal portfolio where I share my projects and journey.
        </motion.p>
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg transition duration-300"
          initial={{ y: -30 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          Explore More
        </motion.button>
      </div>
    </div>
  );
}
