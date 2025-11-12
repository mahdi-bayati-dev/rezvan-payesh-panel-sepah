import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["laravel-echo", "pusher-js"],
  },

  // ✅ بهینه‌سازی بخش build
  build: {
    chunkSizeWarningLimit: 1000, // افزایش حد هشدار از 500 به 1000KB
    rollupOptions: {
      output: {
        // ✅ تقسیم فایل‌های بزرگ به چند chunk برای سرعت بهتر
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: [
            "@reduxjs/toolkit",
            "react-redux",
            "@tanstack/react-query",
            "react-router-dom",
          ],
        },
      },
    },
  },
});
