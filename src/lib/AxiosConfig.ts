import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { toast } from "react-toastify";
import { AppConfig } from "@/config";

// متغیر برای نگهداری استور ریداکس
let store: any = null;

// ✅ تابع تزریق استور
export const injectStore = (_store: any) => {
  store = _store;
  console.log("✅ [AxiosConfig] Store injected successfully.");
};

export const AUTH_MODE = (AppConfig.AUTH_MODE as "token" | "cookie") || "token";

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

// نمایش مود اجرایی در کنسول جهت اطمینان
console.log(
  `%c[Axios] Mode: ${AUTH_MODE.toUpperCase()} | URL: ${AppConfig.API_URL}`,
  "background: #333; color: #bada55; padding: 4px; border-radius: 4px;"
);

// ====================================================================
// 🔓 Request Interceptor
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔍 شروع لاگ‌گیری
    console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);

    if (AUTH_MODE === "token") {
      let token: string | null = null;

      // ۱. تلاش برای خواندن از ریداکس
      if (store) {
        const state = store.getState();
        token = state.auth.accessToken || state.auth.token;
      }

      // ۲. فال‌بک: خواندن از LocalStorage
      if (!token) {
        token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
            console.warn("⚠️ Token read from LocalStorage (Redux was empty/slow).");
        }
      }

      // ۳. ست کردن هدر
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Auth Header Attached.");
      } else {
        console.warn("❌ No Token found! Sending as Guest.");
      }
    }
    
    console.groupEnd();
    return config;
  },
  (error) => {
    console.error("❌ Request Setup Error:", error);
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

    // 🔍 شروع لاگ‌گیری خطا
    if (status) {
        console.group(`🚨 API Error [${status}]`);
        console.log("URL:", originalRequest?.url);
        
        if (error.response?.headers && error.response.headers['date']) {
            console.log("🌍 Server Time:", error.response.headers['date']);
        }
    }

    // مدیریت خطای ۵۰۳ (سرویس در دسترس نیست)
    if (status === 503) {
      console.error("🚨 503 Service Unavailable");
      if (!toast.isActive("server-error")) {
        toast.error("سرویس موقتاً در دسترس نیست. لطفاً چند لحظه دیگر تلاش کنید.", {
            toastId: "server-error"
        });
      }
    }

    // ✅ مدیریت خطای لایسنس (۴۰۳ و ۴۹۹ طبق نظر بک‌اند)
    // اگر ۴۹۹ آمد -> قطعا خطای لایسنس است
    // اگر ۴۰۳ آمد -> چک میکنیم آیا کد خطا مربوط به لایسنس است یا خیر
    const isLicenseError = 
        status === 499 || 
        (status === 403 && data && typeof data === "object" && LICENSE_ERROR_CODES.includes(data.error_code));

    if (isLicenseError) {
      console.warn(`⛔️ License Error Triggered (Status: ${status})`);
      
      const message = status === 499 
          ? "لایسنس نرم‌افزار معتبر نیست یا منقضی شده است." 
          : (data?.message || "لایسنس منقضی شده است");

      if (!toast.isActive("license-error")) {
        toast.error(message, {
          toastId: "license-error",
          autoClose: 10000,
        });
      }

      // اگر کاربر الان در صفحه لایسنس نیست، او را ریدایرکت کن
      if (!window.location.pathname.includes("/license")) {
        console.warn("🔀 Redirecting to /license page...");
        window.location.href = "/license";
      }
      
      if (status) console.groupEnd();
      return Promise.reject(error);
    }

    // مدیریت خطای ۴۰۱ (خروج)
    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.warn("🔒 Unauthorized (401). Valid Token Rejected or Expired.");
        console.warn("🔄 Executing Auto-Logout...");
        
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        
        if (store) {
          store.dispatch({ type: "auth/clearSession" });
        }
        
        if (!window.location.pathname.includes("/login")) {
             window.location.href = "/login";
        }
      }
    }

    if (status) console.groupEnd();
    return Promise.reject(error);
  }
);

export default axiosInstance;