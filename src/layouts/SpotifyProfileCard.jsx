import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Music, ExternalLink, RefreshCw, Disc3 } from "lucide-react";

// Mengambil credential dari .env Vite
const client_id = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const refresh_token = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN;

// Encode base64 untuk Authorization header Spotify
const basic = btoa(`${client_id}:${client_secret}`);
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

const SpotifyProfileCard = () => {
  const theme = useContext(ThemeContext);
  const isDarkMode = theme?.isDarkMode ?? true;

  const [spotifyData, setSpotifyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fungsi untuk mendapatkan Access Token baru
  const getAccessToken = async () => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
    });
    return response.json();
  };

  // 2. Fungsi utama untuk mengambil data lagu yang sedang diputar
  const fetchSpotifyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pastikan refresh token sudah diisi di .env
      if (!refresh_token) {
        throw new Error("Refresh token missing in .env");
      }

      const { access_token } = await getAccessToken();

      const response = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Jika status 204, artinya tidak ada lagu yang diputar
      if (response.status === 204 || response.status > 400) {
        setSpotifyData({ isPlaying: false });
        setIsLoading(false);
        return;
      }

      const song = await response.json();

      if (song.item === null) {
        setSpotifyData({ isPlaying: false });
        setIsLoading(false);
        return;
      }

      // Format data agar rapi masuk ke UI
      const isPlaying = song.is_playing;
      const title = song.item.name;
      const artist = song.item.artists.map((_artist) => _artist.name).join(", ");
      const albumUrl = song.item.album.images[0].url;
      const songUrl = song.item.external_urls.spotify;

      setSpotifyData({
        isPlaying,
        title,
        artist,
        albumUrl,
        songUrl,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch Spotify data");
      setSpotifyData({ isPlaying: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotifyData();
    
    // Opsional: Auto-refresh setiap 30 detik
    const interval = setInterval(fetchSpotifyData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex flex-col w-full h-full min-h-[160px] rounded-2xl p-6 transition-all duration-300 shadow-xl border overflow-hidden ${
        isDarkMode
          ? "bg-zinc-800/60 border-zinc-700/50 text-white"
          : "bg-white/80 border-gray-200 text-black"
      } backdrop-blur-xl`}
    >
      {/* Background Glow Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 blur-3xl rounded-full pointer-events-none"></div>

      {/* Header Card */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Music className="w-5 h-5 text-green-500" />
          </div>
          <span className="font-bold tracking-wide">Spotify</span>
        </div>
        <button
          onClick={fetchSpotifyData}
          disabled={isLoading}
          className={`p-1.5 rounded-md transition-all ${
            isLoading ? "animate-spin opacity-50" : "hover:rotate-180 opacity-60 hover:opacity-100"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          </div>
        ) : error ? (
          <div className="text-center text-sm opacity-60 text-red-400">
            {error}
          </div>
        ) : spotifyData?.isPlaying ? (
          <div className="flex items-center gap-4 animate-in fade-in duration-500">
            {/* Album Art */}
            <a
              href={spotifyData.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group shrink-0"
            >
              <img
                src={spotifyData.albumUrl}
                alt="Album Art"
                className="w-16 h-16 rounded-md shadow-md group-hover:opacity-80 transition-opacity object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
            </a>

            {/* Song Info */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <Disc3 className="w-3 h-3 text-green-500 animate-[spin_3s_linear_infinite]" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                  Currently Playing
                </span>
              </div>
              <a
                href={spotifyData.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-lg truncate hover:underline"
              >
                {spotifyData.title}
              </a>
              <span className={`text-sm truncate ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                {spotifyData.artist}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 opacity-60">
            <Disc3 className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="font-bold">Not Playing</span>
              <span className="text-xs">Spotify is currently paused.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyProfileCard;