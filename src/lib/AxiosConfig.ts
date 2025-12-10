import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// import { store } from "@/store"; // حذف شد برای جلوگیری از چرخه
import { toast } from "react-toastify";
import { AppConfig } from "@/config";

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

if (import.meta.env.DEV) {
  console.log(
    `%c[Axios] Initialized in ${AUTH_MODE.toUpperCase()} mode with URL: ${
      AppConfig.API_URL
    }`,
    "background: #333; color: #bada55; padding: 4px; border-radius: 4px;"
  );
}

// ====================================================================
// 🔓 Request Interceptor (اصلاح شده برای Race Condition)
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔍 شروع لاگ‌گیری برای درخواست
    console.groupCollapsed(
      `🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`
    );

    if (AUTH_MODE === "token") {
      let token: string | null = null;

      // ۱. ابتدا تلاش می‌کنیم از ریداکس بخوانیم
      if (store) {
        const state = store.getState();
        token = state.auth.accessToken || state.auth.token;
        if (token) {
          console.log("✅ Token found in Redux Store.");
        }
      }

      // ۲. 🚨 بخش حیاتی (FIX): اگر در ریداکس نبود، مستقیم از LocalStorage می‌خوانیم
      // این همان جایی است که مشکل Race Condition را حل می‌کند.
      if (!token) {
        // چک کردن هر دو نام معمول برای اطمینان
        token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
          console.warn(
            "⚠️ Token missing in Redux (Race Condition detected), reading from LocalStorage directly."
          );
        }
      }

      // ۳. تزریق توکن به هدر
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Auth Header Attached.");
      } else {
        console.warn(
          "❌ No Token found in Redux OR LocalStorage. Request sent as Guest."
        );
      }
    }

    console.groupEnd();
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

    console.group(`🚨 [Response Error] ${status} ${originalRequest?.url}`);

    // لاگ کردن ساعت سرور برای اطمینان
    if (error.response?.headers && error.response.headers["date"]) {
      console.log("🌍 Server Time:", error.response.headers["date"]);
    }

    if (status === 403 && data) {
      const isLicenseError =
        typeof data === "object" &&
        LICENSE_ERROR_CODES.includes(data.error_code);

      if (isLicenseError) {
        console.warn(`⛔️ License Error: ${data.error_code}`);
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
        console.groupEnd();
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.warn("🔒 Unauthorized (401) detected. Executing logout...");

        // پاک کردن توکن‌ها
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");

        // دیسپچ کردن اکشن خروج
        if (store) {
          store.dispatch({ type: "auth/clearSession" });
        }

        // ریدایرکت به لاگین
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    console.error(`❌ Error Message:`, error.message);
    console.groupEnd();
    return Promise.reject(error);
  }
);

export default axiosInstance;
