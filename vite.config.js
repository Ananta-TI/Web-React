import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // Pakai ini saat mau analisis bundle.
    // Kalau sudah mau deploy final, boleh comment visualizer ini.
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      open: true,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    chunkSizeWarningLimit: 1200,

    // Jangan aktifkan sourcemap untuk deploy final.
    // Aktifkan true hanya saat debugging production error.
    sourcemap: false,
  },

  server: {
    proxy: {
      "/api": {
        target: "https://ch.tetr.io",
        changeOrigin: true,
        rewrite: (urlPath) => urlPath.replace(/^\/api/, ""),
      },
    },
  },
});