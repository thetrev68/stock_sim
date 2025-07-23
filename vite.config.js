// vite.config.js - Updated with your existing Tailwind config + PWA improvements
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss";  // Your existing import
import autoprefixer from "autoprefixer"; // Your existing import

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(), // Your existing Tailwind config
        autoprefixer(), // Your existing autoprefixer config
      ],
    },
  },
  server: {
    headers: {
      // Reduce Cross-Origin-Opener-Policy warnings in development
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none"
    }
  },
  build: {
    rollupOptions: {
      // Ensure PWA files are included in build
      input: {
        main: "index.html"
      },
      // Copy PWA files to build output
      external: [],
    },
    // Copy static assets including PWA files
    copyPublicDir: true,
  },
  // Ensure PWA files are served correctly
  publicDir: "public"
});