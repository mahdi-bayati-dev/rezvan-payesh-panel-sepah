import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { toast } from "react-toastify";
import { AppConfig } from "@/config";

// متغیر برای نگهداری استور ریداکس
let store: any = null;

export const injectStore = (_store: any) => {
  store = _store;
  console.log("✅ [AxiosConfig] Store injected successfully.");
};

export const AUTH_MODE = (AppConfig.AUTH_MODE as "token" | "cookie") || "token";

// کدهای خطای مربوط به لایسنس
const LICENSE_ERROR_CODES = ["TRIAL_EXPIRED", "LICENSE_EXPIRED", "TAMPERED"];

const axiosInstance = axios.create({
  baseURL: AppConfig.API_URL,
  withCredentials: AUTH_MODE === "cookie",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// نمایش مود اجرایی در کنسول
console.log(
  `%c[Axios] Mode: ${AUTH_MODE.toUpperCase()} | URL: ${AppConfig.API_URL}`,
  "background: #333; color: #bada55; padding: 4px; border-radius: 4px;"
);

// ====================================================================
// 🔓 Request Interceptor
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // فقط در حالت توسعه لاگ بزن (Clean Code)
    if (import.meta.env.DEV) {
        console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    if (AUTH_MODE === "token") {
      let token: string | null = null;

      if (store) {
        const state = store.getState();
        token = state.auth.accessToken || state.auth.token;
      }

      if (!token) {
        token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) console.log("🔑 Auth Header Attached.");
      }
    }
    
    if (import.meta.env.DEV) console.groupEnd();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ====================================================================
// 🔒 Response Interceptor
// ====================================================================

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    if (import.meta.env.DEV && status) {
        console.group(`🚨 API Error [${status}]`);
        console.log("URL:", originalRequest?.url);
        console.groupEnd();
    }

    // 1. مدیریت خطای ۵۰۳
    if (status === 503) {
      if (!toast.isActive("server-error")) {
        toast.error("سرویس موقتاً در دسترس نیست.", { toastId: "server-error" });
      }
      return Promise.reject(error);
    }

    // 2. مدیریت خطای لایسنس (فقط نمایش Toast، لاجیک ریدایرکت در MainLayout است)
    const isLicenseError = 
        status === 499 || 
        (status === 403 && data && typeof data === "object" && LICENSE_ERROR_CODES.includes(data.error_code));

    if (isLicenseError) {
        const message = status === 499 
            ? "لایسنس نرم‌افزار معتبر نیست یا منقضی شده است." 
            : (data?.message || "مشکل لایسنس");

        if (!toast.isActive("license-error")) {
            toast.error(message, { toastId: "license-error", autoClose: 7000 });
        }
        // خطا را رد می‌کنیم تا Redux آن را بگیرد و هندل کند
        return Promise.reject(error);
    }

    // 3. مدیریت خطای ۴۰۱ (خروج)
    if (status === 401) {
      // اگر ۴۰۱ بود اما مربوط به لایسنس بود، نباید لاگ‌اوت کنیم (Redux هندل می‌کند)
      if (data?.error_code && LICENSE_ERROR_CODES.includes(data.error_code)) {
         return Promise.reject(error);
      }

      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        // لاگ‌اوت واقعی و استاندارد
        if (store) {
            // دیسپچ کردن اکشن لاگ‌اوت برای پاک‌سازی ریداکس
            store.dispatch({ type: "auth/clearSession" });
        } else {
            // فال‌بک
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
        }
        
        // ریدایرکت سخت به لاگین
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;