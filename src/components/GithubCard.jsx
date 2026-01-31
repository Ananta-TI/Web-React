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

        {/* Followers */}
        <div className="flex -space-x-3 mt-3 pl-2 justify-center lg:justify-start">
          {followers.map((f, idx) => (
            <a
              key={f.id}
              href={f.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group hover:!z-50 focus:!z-50 outline-none"
              style={{ zIndex: followers.length - idx }}
            >
              <img
                src={f.avatar_url}
                alt={f.login || "Follower"}
                className={`
                  w-7 h-7
                  lg:w-10 lg:h-6

                  rounded-full
                  border
                  object-cover
                  transform-gpu will-change-transform

                  transition-all duration-700 ease-out delay-200
                  group-hover:scale-[1.8]
                  group-hover:-translate-y-2
                  group-hover:z-50
                  group-hover:duration-300
                  group-hover:delay-0
                  group-hover:ease-[cubic-bezier(0.34,1.56,0.64,1)]

                  ${
                    isDarkMode
                      ? "border-stone-600 bg-stone-800"
                      : "border-gray-700 bg-white"
                  }
                `}
              />

              <div
                className="
                  absolute bottom-8 left-1/2 -translate-x-1/2
                  opacity-0 group-hover:opacity-100
                  scale-90 group-hover:scale-100
                  translate-y-2 group-hover:translate-y-0
                  transition-all duration-200
                  bg-stone-800 text-white text-[10px]
                  px-2 py-1 rounded-md shadow-xl
                  whitespace-nowrap pointer-events-none
                  border border-stone-600 z-50
                "
              >
                <div className="w-2 h-2 bg-stone-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-l border-b border-stone-600" />
                {f.login}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
