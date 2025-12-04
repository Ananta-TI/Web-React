import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { animate, createScope, spring, createDraggable } from 'animejs';

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
        <div className="flex -space-x-3 mt-2 pl-2">
  {followers.map((f, idx) => (
    <a
      key={f.id}
      href={f.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-none relative group hover:!z-50 focus:!z-50 outline-none" // Tambah focus untuk aksesibilitas
      style={{ zIndex: followers.length - idx }}
    >
      <img
        src={f.avatar_url}
        alt={f.login || "Follower"}
        // --- PERUBAHAN UTAMA ADA DI SINI ---
        className={`
          w-6 h-6 rounded-full border-2 object-cover bg-white
          transition-all duration-300 
          ease-[cubic-bezier(0.34,1.56,0.64,1)] 
          transform-gpu will-change-transform
          
          group-hover:scale-[1.6] group-hover:-translate-y-2 
          group-hover:brightness-110 group-hover:shadow-xl
          
          ${isDarkMode ? "border-stone-600 bg-stone-800" : "border-gray-700 bg-white"}
        `}
      />
      
      {/* Tooltip: Delay dihapus/dikurangi agar instan muncul saat swipe cepat */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 mb-3 
        opacity-0 group-hover:opacity-100 
        scale-90 group-hover:scale-100
        translate-y-2 group-hover:translate-y-0 
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        bg-stone-800 text-white text-[10px] px-2 py-1 rounded-md shadow-xl 
        whitespace-nowrap pointer-events-none border border-stone-600 font-medium z-50"
      >{/* Panah kecil di bawah tooltip */}
          <div className="w-2 h-2 bg-stone-800 border-stone-600 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
        {f.login}
      </div>
    </a>
  ))}
</div>


      </div>
    </div>
  );
}
