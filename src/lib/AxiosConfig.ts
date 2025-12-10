import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// ❌ ایمپورت مستقیم store حذف شد تا چرخه وابستگی بشکند
import { toast } from "react-toastify";
import { AppConfig } from "@/config";

// تعریف متغیر برای نگهداری استور تزریق شده
let store: any = null;

// ✅ تابع تزریق استور
export const injectStore = (_store: any) => {
  store = _store;
  if (import.meta.env.DEV) {
    console.log("✅ [AxiosConfig] Store injected successfully.");
  }
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
  timeout: 30000, // تایم‌اوت ۳۰ ثانیه برای اطمینان
});

// ====================================================================
// 🔓 Request Interceptor (Fix Race Condition)
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // فقط برای دیباگ در محیط توسعه یا اگر می‌خواهید لاگ‌ها را ببینید
    // console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);

    if (AUTH_MODE === "token") {
      let token: string | null = null;

      // ۱. اولویت اول: تلاش برای خواندن از ریداکس
      if (store) {
        const state = store.getState();
        token = state.auth.accessToken || state.auth.token;
        if (token && import.meta.env.DEV) {
          // console.log("✅ Token found in Redux Store.");
        }
      }

      // ۲. ✅✅✅ راه حل نهایی (Race Condition Fix)
      // اگر توکن در ریداکس نبود (چون هنوز آپدیت نشده)، مستقیم از LocalStorage می‌خوانیم
      if (!token) {
        token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
          console.warn(
            "⚠️ Race Condition Avoided: Token read directly from localStorage."
          );
        }
      }

      // ۳. تزریق توکن به هدر
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // اگر واقعاً توکنی نیست (کاربر مهمان)
        // console.warn("ℹ️ No token found anywhere. Sending as Guest.");
      }
    }

    // console.groupEnd();
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

    // لاگ خطای سرور (مخصوصاً ۵۰۳ یا ۴۰۱)
    if (status) {
      console.group(`🚨 API Error [${status}]`);
      console.log("URL:", originalRequest?.url);
      console.log("Message:", error.message);
      console.groupEnd();
    }

    // ۱. هندل کردن خطای لایسنس
    if (status === 403 && data) {
      const isLicenseError =
        typeof data === "object" &&
        LICENSE_ERROR_CODES.includes(data.error_code);

      if (isLicenseError) {
        if (!toast.isActive("license-error")) {
          toast.error(
            typeof data.message === "string"
              ? data.message
              : "لایسنس منقضی شده است",
            {
              toastId: "license-error",
              autoClose: 10000,
            }
          );
        }
        if (!window.location.pathname.includes("/license")) {
          window.location.href = "/license";
        }
        return Promise.reject(error);
      }
    }

    // ۲. هندل کردن خطای ۴۰۱ (فقط اگر در صفحه لاگین نیستیم)
    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.warn("🔒 401 Unauthorized - Session Expired / Invalid Token");

        // پاک کردن توکن‌ها برای جلوگیری از لوپ
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");

        // دیسپچ خروج
        if (store) {
          store.dispatch({ type: "auth/clearSession" });
        }

        // ریدایرکت به لاگین
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
