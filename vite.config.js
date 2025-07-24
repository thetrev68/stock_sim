// vite.config.js - Updated with proper module resolution and build config
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
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
      input: {
        main: "index.html"
      },
      external: [],
      preserveEntrySignatures: "exports-only"
    },
    copyPublicDir: true,
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  publicDir: "public"
});