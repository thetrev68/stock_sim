import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss"  // Correct import
import autoprefixer from "autoprefixer"; // Import autoprefixer

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(), // Call tailwindcss as a function
        autoprefixer(), // Call autoprefixer as a function
      ],
    },
  },
});