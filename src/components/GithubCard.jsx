import React, { useEffect, useState, useContext, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { Github, Users, Code, MapPin, Building2, Link as LinkIcon, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GithubProfileCard({ username = "Ananta-TI" }) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredFollower, setHoveredFollower] = useState(null);
  const cardRef = useRef(null);

  // Fetch data GitHub
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error('User not found');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        return fetch(data.followers_url);
      })
      .then((res) => res.json())
      .then((f) => {
        // Acak urutan followers
        const shuffled = [...f].sort(() => Math.random() - 0.5);
        setFollowers(shuffled.slice(0, 12)); // Tampilkan 12 followers
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  // Animasi untuk container card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-full ${
              isDarkMode ? "border-indigo-400" : "border-indigo-600"
            } border-t-transparent border-4 animate-spin`}
          ></div>
          <Github className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`cursor-target flex items-center gap-4 w-80 h-32 rounded-xl p-4 transition-all duration-500 shadow-md hover:shadow-indigo-500/50
        ${isDarkMode
          ? "bg-zinc-800 bg-opacity-60 border border-gray-600"
          : "bg-gray-100 bg-opacity-80 border border-gray-200"
        } backdrop-blur-lg p-6 rounded-xl shadow-xl`}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <Github className={`w-8 h-8 mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={`mt-2 px-3 py-1 text-xs rounded-md ${
              isDarkMode 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            } transition-colors`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5 }}
      className={`cursor-target flex items-center gap-4 w-85 h-50 rounded-xl p-4 transition-all duration-500 shadow-md hover:shadow-indigo-500/50
      ${
        isDarkMode
          ? "bg-zinc-800 bg-opacity-60 border border-gray-600"
          : "bg-gray-100 bg-opacity-80 border border-gray-200"
      } backdrop-blur-lg p-6 rounded-xl shadow-xl`}
    >
      {/* Avatar kiri */}
      <div className="relative">
        <img
          src={profile.avatar_url}
          alt="Avatar"
          className="w-24 h-24 rounded-xl object-cover shadow-lg"
        />
        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
          isDarkMode ? "bg-zinc-700" : "bg-white"
        }`}>
          <Github className="w-3 h-3" />
        </div>
      </div>

      {/* Konten kanan */}
      <div className="flex flex-col flex-1">
        <h2
          className={`font-bold text-base flex items-center ${
            isDarkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-indigo-500 transition flex items-center gap-1"
          >
            {profile.login}
            <LinkIcon className="w-3 h-3" />
          </a>
          <span className="ml-1 text-indigo-500">• NTA</span>
        </h2>

        <div className="flex items-center gap-2 text-sm mb-1">
          {profile.company && (
            <>
              <Building2 className={`w-3 h-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              <span className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {profile.company}
              </span>
            </>
          )}
          {profile.location && (
            <>
              <MapPin className={`w-3 h-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
              <span className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                {profile.location}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Code className={`w-3 h-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {profile.public_repos}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className={`w-3 h-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {followers.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className={`w-3 h-3 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {profile.followers}
            </span>
          </div>
        </div>

        {/* Stack followers dengan animasi */}
        <div className="flex -space-x-3 mt-2 pl-2">
          <AnimatePresence>
            {followers.slice(0, 50).map((f, idx) => (
              <motion.a
                key={f.id}
                href={f.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-none relative group hover:!z-50 focus:!z-50 outline-none"
                style={{ zIndex: followers.length - idx }}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: idx * 0.05, 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300
                }}
                whileHover={{ 
                  scale: 1.8, 
                  y: -8,
                  zIndex: 50,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setHoveredFollower(f.id)}
                onHoverEnd={() => setHoveredFollower(null)}
              >
                <img
                  src={f.avatar_url}
                  alt={f.login || "Follower"}
                  className={`
                    w-8 h-8 rounded-full border-2 object-cover
                    ${isDarkMode ? "border-stone-600 bg-stone-800" : "border-gray-300 bg-white"}
                  `}
                />
                
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredFollower === f.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                        bg-stone-800 text-white text-xs px-2 py-1 rounded-md shadow-xl 
                        whitespace-nowrap pointer-events-none border border-stone-600 font-medium z-50"
                    >
                      <div className="w-2 h-2 bg-stone-800 border-l border-t border-stone-600 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                      {f.login}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.a>
            ))}
          </AnimatePresence>
          
          {followers.length > 100 && (
            <div className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
              ${isDarkMode ? "border-stone-600 bg-stone-800 text-gray-300" : "border-gray-300 bg-white text-gray-700"}
            `}>
              +{followers.length - 100}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}