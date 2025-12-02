import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ کانفیگ صحیح برای نسخه ۴ تیلویند
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // بهینه‌سازی وابستگی‌های real-time برای جلوگیری از مشکلات بیلد
  optimizeDeps: {
    include: ['laravel-echo', 'pusher-js'],
  },
  build: {
    // افزایش محدودیت هشدار حجم باندل به ۱۶۰۰ کیلوبایت
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // ✅ استراتژی تقسیم فایل‌ها (Smart Chunking) - ترتیب بررسی‌ها بسیار مهم است
        manualChunks(id) {
          if (id.includes('node_modules')) {
            
            // ۱. ابتدا کتابخانه‌های سنگین و خاص را جدا می‌کنیم (قبل از بررسی کلمه react)
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }

            if (
              id.includes('date-fns') ||
              id.includes('jalali-moment') ||
              id.includes('react-date-object') ||
              id.includes('react-multi-date-picker')
            ) {
              return 'date-vendor';
            }

            if (
              id.includes('react-hook-form') ||
              id.includes('zod') ||
              id.includes('@hookform')
            ) {
              return 'form-vendor';
            }

            if (
              id.includes('lucide-react') ||
              id.includes('@headlessui') ||
              id.includes('react-toastify')
            ) {
              return 'ui-vendor';
            }

            if (
              id.includes('@reduxjs') ||
              id.includes('react-redux') ||
              id.includes('@tanstack') ||
              id.includes('axios')
            ) {
              return 'state-vendor';
            }

            // ۲. در آخر هسته اصلی ری‌اکت را جدا می‌کنیم
            // چون بسیاری از پکیج‌های بالا کلمه 'react' را دارند، این شرط باید آخر باشد
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'react-vendor';
            }

            // ۳. بقیه پکیج‌ها
            return 'vendor';
          }
        },
      },
    },
  },
});