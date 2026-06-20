import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// On GitHub Actions, CI=true — serve from /influencex/ (the repo name)
const base = process.env.CI ? "/influencex/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
