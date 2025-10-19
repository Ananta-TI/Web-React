import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";

export default function GithubProfileCard({ username = "Ananta-TI" }) {
  const themeCtx = useContext(ThemeContext);
  const isDarkMode = themeCtx?.isDarkMode ?? true;
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);

  // 📡 Fetch data GitHub
  useEffect(() => {
    fetch(`https://api.github.com/users/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        fetch(data.followers_url)
          .then((res) => res.json())
          .then((f) => {
            // 👉 Acak urutan followers
            const shuffled = [...f].sort(() => Math.random() - 0.5);
            setFollowers(shuffled.slice(0, 100));
          });
      })
      .catch((err) => console.error(err));
  }, [username]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-32">
        <div
          className={`w-8 h-8 border-4 ${
            isDarkMode ? "border-indigo-400" : "border-indigo-600"
          } border-t-transparent rounded-full animate-spin`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`cursor-target flex items-center gap-4 w-85 h-50 rounded-xl p-4 transition-all duration-500 shadow-md hover:shadow-indigo-500/50
      ${
        isDarkMode
          ? "bg-zinc-800 bg-opacity-60 border border-gray-600 border-b-0"
          : "bg-gray-100 bg-opacity-80 border border-gray-800 border-b-0"
      } backdrop-blur-lg p-6 rounded-xl shadow-xl`}
    >
      {/* Avatar kiri */}
      <img
        src={profile.avatar_url}
        alt="Avatar"
        className="w-26 h-26 rounded-lg object-cover"
      />

      {/* Konten kanan */}
      <div className="flex flex-col">
        <h2
          className={`font-bold text-base ${
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
          className={`text-sm mb-1 ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {profile.company || "No company info"} • {profile.location}
        </p>

        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {profile.public_repos} repos • {followers.length} followers
        </p>

        {/* 📌 Stack followers (acak posisi tiap refresh) */}
        <div className="flex mt-2">
          {followers.map((f, idx) => (
            <img
              key={f.id}
              src={f.avatar_url}
              alt="Follower"
              className={`w-6 h-6 rounded-full border-2 -ml-2 first:ml-0 ${
                isDarkMode ? "border-stone-600" : "border-gray-700"
              }`}
              style={{ zIndex: followers.length - idx }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
