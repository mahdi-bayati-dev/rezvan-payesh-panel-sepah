import axios from "axios";
import { AppConfig } from "@/config";

// ایجاد نمونه Axios با تنظیمات پایه
const axiosInstance = axios.create({
  baseURL: AppConfig.API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000, // افزایش تایم‌اوت به 20 ثانیه برای محیط‌های کند داکر
});

// ----------------------------------------------------------------------
// 1️⃣ Request Interceptor (بررسی درخواست قبل از ارسال)
// ----------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // شروع لاگ‌گیری گروهی برای تمیزی کنسول
    console.groupCollapsed(
      `🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`
    );

    // ۱. بررسی وجود توکن در حافظه
    const token = localStorage.getItem("token");

    if (token) {
      // ۲. اگر توکن هست، لاگ می‌گیریم که داریم آن را می‌فرستیم
      console.log("✅ Token found in localStorage.");
      // نمایش ۵ کاراکتر اول توکن برای اطمینان از درست بودن فرمت
      console.log("🔑 Token Preview:", token.substring(0, 10) + "...");

      // ۳. الحاق توکن به هدر
      config.headers.Authorization = `Bearer ${token}`;

      // ۴. بررسی نهایی هدر
      console.log("headers being sent:", config.headers);
    } else {
      // ⚠ هشدار: توکن وجود ندارد
      console.warn(
        "⚠️ No token found in localStorage! Sending request without Auth."
      );
    }

    console.groupEnd();
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------
// 2️⃣ Response Interceptor (بررسی پاسخ دریافتی)
// ----------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => {
    // پاسخ موفق (200-299)
    // console.log(`✅ [API Success] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // بررسی خطای ۴۰۱ (احراز هویت)
    if (error.response && error.response.status === 401) {
      console.group(`🔒 [401 UNAUTHORIZED DETECTED]`);
      console.error("URL:", originalRequest.url);
      console.error(
        "Message:",
        error.response.data?.message || "Unauthenticated"
      );

      // 🔥 تست مهم: آیا ساعتی که سرور در هدر پاسخ داده با ساعت ما یکی است؟
      // اگر اختلاف زیاد باشد، توکن به دلیل Time Skew رد می‌شود.
      const serverDate = error.response.headers["date"];
      console.warn("🌍 Server Time (from header):", serverDate);
      console.warn("💻 Client Time:", new Date().toUTCString());

      console.groupEnd();

      // 🛑🛑🛑 نکته مهم برای دیباگ:
      // من خط‌های زیر را کامنت کردم تا وقتی ۴۰۱ می‌گیری، سریعاً ریدایرکت نشوی
      // و بتوانی لاگ‌ها را بخوانی. بعد از حل مشکل، این‌ها را از کامنت در بیاور.

      /*
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      */

      console.info("ℹ️ Auto-logout logic is currently DISABLED for debugging.");
    } else if (error.code === "ERR_NETWORK") {
      // خطای شبکه (معمولا CORS یا آدرس اشتباه)
      console.error(
        "🚨 [Network Error] Possible CORS issue or Wrong Base URL."
      );
      console.error("Check VITE_API_BASE_URL:", AppConfig.API_URL);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
