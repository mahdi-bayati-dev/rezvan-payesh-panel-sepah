import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // تعریف @ به عنوان پوشه src
    },
  },
  // به Vite می‌گوید که این پکیج‌های CJS را پیش-باندل کند
  // تا در سرور توسعه (dev server) مشکلی ایجاد نکنند
  optimizeDeps: {
    include: ["laravel-echo", "pusher-js"],
  },
});
