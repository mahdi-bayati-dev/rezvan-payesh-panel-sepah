import axios, { type AxiosResponse, AxiosError } from "axios";
import { AppConfig } from "@/config"; // ✅ ایمپورت کانفیگ مرکزی
import { AUTH_MODE } from "./AxiosConfig"; // استفاده از تنظیم مشترک مود احراز هویت

// ۱. دریافت آدرس پایه سرویس هوش مصنوعی از AppConfig (نه مستقیم از env)
const AI_BASE_URL = AppConfig.AI.BASE_URL;

// لاگ وضعیت در محیط توسعه
if (import.meta.env.DEV) {
  console.log("🤖 AI Service URL:", AI_BASE_URL);
}

if (!AI_BASE_URL) {
  console.warn("⚠️ AI Base URL is missing in configuration!");
}

/**
 * 💡 اینستنس اختصاصی برای سرویس‌های AI
 * این اینستنس جدا از بک‌ند اصلی است تا تنظیمات و مدیریت خطای مستقل داشته باشد.
 */
const aiAxiosInstance = axios.create({
  baseURL: AI_BASE_URL, // ✅ استفاده از آدرس داینامیک
  withCredentials: AUTH_MODE === "cookie",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    // اگر توکن خاصی برای AI نیاز بود، اینجا اضافه می‌شود
    // 'X-AI-Secret': AppConfig.AI.SECRET
  },
  // معمولاً سرویس‌های AI پاسخ‌دهی کندتری دارند، تایم‌اوت را کمی بیشتر می‌گیریم
  timeout: 40000,
});

// ====================================================================
// 🔒 Response Interceptor (مدیریت خطاهای خاص AI)
// ====================================================================
aiAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // اینجا می‌توانی خطاهای خاص سرویس AI را هندل کنی
    // مثلاً اگر سرویس AI پایین بود، فقط یک وارنینگ ساده بدهی و کاربر را لاگ‌اوت نکنی

    const originalRequest = error.config;
    const status = error.response?.status;

    console.error(
      `🤖 AI Service Error [${status}] at ${originalRequest?.url}:`,
      error.message
    );

    return Promise.reject(error);
  }
);

export default aiAxiosInstance;
