import axios from "axios";
import { store } from "@/store";
import { toast } from "react-toastify";

// --- تنظیمات پایه ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";
  

/**
 * ایجاد اینستنس Axios با تنظیمات امنیتی جدید.
 * طبق مستندات: withCredentials: true حیاتی است.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ ارسال خودکار کوکی‌های HttpOnly
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// --- لاگ دیباگ برای توسعه ---
if (import.meta.env.DEV) {
    console.log("%c[Axios Config] Initialized with credentials: true", "color: #0ea5e9; font-weight: bold;");
}

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    // ❌ حذف شد: دیگر نیازی به ست کردن دستی هدر Authorization نیست.
    // مرورگر خودکار کوکی access_token را ارسال می‌کند.
    if (import.meta.env.DEV) {
        console.log(`%c[Request] ${config.method?.toUpperCase()} ${config.url}`, "color: #fbbf24");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
  (response) => {
    // لاگ موفقیت در حالت توسعه
    if (import.meta.env.DEV && response.config.url?.includes('/login')) {
         console.log("%c[Login Success] Cookie should be set by server.", "color: #22c55e; font-weight: bold;");
    }
    return response;
  },
  (error) => {
    // ۱. مدیریت خطای لایسنس (403 Forbidden)
    if (error.response && error.response.status === 403) {
      const data = error.response.data;
      const licenseErrorCodes = ["TRIAL_EXPIRED", "LICENSE_EXPIRED", "TAMPERED"];

      if (data && typeof data === "object" && licenseErrorCodes.includes(data.error_code)) {
        console.warn(`⛔ License Error: ${data.error_code}`);
        const errorMsg = typeof data.message === "string" ? data.message : "لایسنس شما منقضی شده است.";
        
        toast.error(errorMsg, { toastId: "license-error" });

        if (!window.location.pathname.includes("/license")) {
          window.location.href = "/license";
        }
        return Promise.reject(error);
      }
    }

    // ۲. مدیریت خطای احراز هویت (401 Unauthorized)
    if (error.response && error.response.status === 401) {
        // اگر در حال تلاش برای لاگین هستیم و 401 گرفتیم، یعنی رمز اشتباه است (نیاز به اکشن خاصی نیست)
        // اما اگر در روت‌های دیگر 401 گرفتیم، یعنی کوکی منقضی شده یا وجود ندارد.
      if (!error.config.url?.endsWith("/login")) {
        console.warn("[Auth] 401 Detected. Session expired or invalid cookie.");
        // فقط وضعیت ریداکس را پاک می‌کنیم (نیازی به پاک کردن لوکال استوریج برای توکن نیست چون توکنی نداریم)
        store.dispatch({ type: "auth/logoutClientSide" }); 
      }
    }

    const status = error.response?.status;
    const url = error.config?.url;
    console.error(`API Error [${status}] at ${url}:`, error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;