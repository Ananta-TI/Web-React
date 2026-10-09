import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),

    mode === "analyze" &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
        open: true,
      }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 700,

//     rollupOptions: {
//       output: {
// //         manualChunks(id) {
// //   const normalizedId = id.replaceAll("\\", "/");

// //   if (!normalizedId.includes("/node_modules/")) return;

// //   if (
// //     normalizedId.includes("/node_modules/react/") ||
// //     normalizedId.includes("/node_modules/react-dom/") ||
// //     normalizedId.includes("/node_modules/scheduler/")
// //   ) {
// //     return "react-vendor";
// //   }

// //   if (
// //     normalizedId.includes("/node_modules/react-router/") ||
// //     normalizedId.includes("/node_modules/react-router-dom/")
// //   ) {
// //     return "router-vendor";
// //   }

// //   if (normalizedId.includes("/node_modules/lucide-react/")) {
// //     return "icons-vendor";
// //   }

// //   if (normalizedId.includes("/node_modules/framer-motion/")) {
// //     return "framer-vendor";
// //   }

// //   if (
// //     normalizedId.includes("/node_modules/gsap/") ||
// //     normalizedId.includes("/node_modules/lenis/")
// //   ) {
// //     return "motion-vendor";
// //   }

// //   if (normalizedId.includes("/node_modules/three/")) {
// //     return "three-vendor";
// //   }

// //   if (normalizedId.includes("/node_modules/ogl/")) {
// //     return "ogl-vendor";
// //   }

// //   if (
// //     normalizedId.includes("/node_modules/@mui/") ||
// //     normalizedId.includes("/node_modules/@emotion/")
// //   ) {
// //     return "mui-vendor";
// //   }

// //   return "vendor";
// // }
//       },
//     },
  },

  // NOTE: tidak ada dev-proxy untuk /api di sini.
  // Semua panggilan /api/* (vt, steam, tetrio, wakatime, blob) dilayani oleh
  // Vercel Functions di ./api. Untuk pengembangan dengan API, jalankan:
  //   npm run dev:full   (vercel dev)
  // Proxy blanket ke host eksternal (mis. ch.tetr.io) hanya akan membajak
  // request API lokal dan merusak scanner + kartu aktivitas di `npm run dev`.
}));