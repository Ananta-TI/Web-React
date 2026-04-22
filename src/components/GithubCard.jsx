import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { motion } from "framer-motion";

export default function GithubProfileCard({ username = "Ananta-TI" }) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        fetch(data.followers_url)
          .then((res) => res.json())
          .then((f) => {
            const shuffled = [...f].sort(() => Math.random() - 0.5);
            setFollowers(shuffled.slice(0, 100));
          });
      })
      .catch(console.error);
  }, [username]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-32">
        <div
          className={`w-8 h-8 border-4 ${
            isDarkMode ? "border-indigo-400" : "border-indigo-600"
          } border-t-transparent rounded-full animate-spin`}
        />
      </div>
    );
  }

  return (
    <div
      className={`
        cursor-target
        flex flex-col lg:flex-row
        items-center lg:items-start
        gap-4

        w-full lg:w-85
        min-h-[180px] lg:h-50

        p-4 lg:p-6
        rounded-xl
        transition-all duration-500
        shadow-md hover:shadow-indigo-500/50
        backdrop-blur-lg

        ${
          isDarkMode
            ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0"
            : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
        }
      `}
    >
      {/* Avatar */}
      <img
        src={`${profile.avatar_url}&s=80`}
        alt="Avatar"
        className="
          w-20 h-20
          lg:w-26 lg:h-26
          rounded-lg
          object-cover
          flex-shrink-0
        "
      />

      {/* Konten */}
      <div className="flex flex-col w-full text-center lg:text-left">
        <h2
          className={`font-bold text-sm lg:text-base ${
            isDarkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="hover:underline hover:text-gray-500 transition"
          >
            {profile.login}
          </a>
          <span className="ml-1">• NTA</span>
        </h2>

        <p
          className={`text-xs lg:text-sm mb-1 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {profile.company || "No company info"} •{" "}
          {profile.location || "Unknown"}
        </p>

        <p
          className={`text-xs lg:text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {profile.public_repos} repos • {followers.length} followers
        </p>


       {/* Super-Tight Followers Stack */}
        <div className="flex items-center -space-x-4 lg:-space-x-5 py-4 pl-2  justify-start">
          {followers.map((f, idx) => (
            <motion.a
              key={f.id}
              href={f.html_url}
              target="_blank"
              rel="noopener noreferrer"
              // TAMBAHKAN 'group' DI SINI
              className="relative group outline-none rounded-full cursor-none"
              style={{ zIndex: followers.length - idx }}
              whileHover={{ 
                scale: 1,           
                y: -4,             
                zIndex: 999,        
                transition: { type: "spring", stiffness: 400, damping: 12 } 
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.02 } }}
            >
              {/* AVATAR */}
              <img
                src={f.avatar_url}
                alt={f.login || "Follower"}
                className={`
                  w-8 h-8 lg:w-15 lg:h-8
                  rounded-full border-2 object-cover
                  ${isDarkMode ? "border-zinc-800 bg-zinc-800" : "border-white bg-white"}
                `}
              />

              {/* TOOLTIP */}
              <div
                className="
                  absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                  opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-200 ease-out
                  bg-zinc-800 text-white text-[10px] font-bold tracking-wide
                  px-2.5 py-1 rounded-md shadow-xl
                  whitespace-nowrap pointer-events-none
                  border border-zinc-600
                "
              >
                {f.login}
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </div>
  );
}
