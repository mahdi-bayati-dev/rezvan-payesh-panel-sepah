import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// ❌ ایمپورت مستقیم store حذف شد تا چرخه وابستگی بشکند
// import { store } from "@/store";
import { toast } from "react-toastify";
import { AppConfig } from "@/config";

// تعریف متغیر برای نگهداری استور تزریق شده
let store: any = null;

// ✅ تابع تزریق استور: این تابع را در store/index.ts صدا می‌زنیم
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
  timeout: 20000,
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
// 🔓 Request Interceptor
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 🔍 شروع لاگ‌گیری برای درخواست
    console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    if (AUTH_MODE === "token") {
      // ✅ استفاده از استور تزریق شده با بررسی وجود آن
      if (store) {
        const state = store.getState();
        const token = state.auth.accessToken;

        if (token) {
            console.log("🔑 Token found in Store:", token.substring(0, 15) + "...");
        } else {
            console.warn("⚠️ Token is NULL/UNDEFINED in Store.");
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Authorization Header attached.");
        }
      } else {
          console.warn("⚠️ Redux Store is NOT injected yet! Cannot retrieve token.");
      }
    } else {
        console.log("ℹ️ Auth Mode is Cookie. No token header attached.");
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

    // 🔍 شروع لاگ‌گیری برای خطا
    console.group(`🚨 [Response Error] ${status} ${originalRequest?.url}`);

    // 🔥 بررسی ساعت سرور برای مشکل داکر
    if (error.response?.headers && error.response.headers['date']) {
        console.log("🌍 Server Time:", error.response.headers['date']);
        console.log("💻 Client Time:", new Date().toUTCString());
    }

    if (status === 403 && data) {
      const isLicenseError =
        typeof data === "object" &&
        LICENSE_ERROR_CODES.includes(data.error_code);

      if (isLicenseError) {
        console.warn(`⛔️ License Error Detected: ${data.error_code}`);
        const errorMsg =
          typeof data.message === "string"
            ? data.message
            : "لایسنس شما منقضی شده است.";

        if (!toast.isActive("license-error")) {
          toast.error(errorMsg, {
            toastId: "license-error",
            autoClose: 10000,
          });
        }

        if (!window.location.pathname.includes("/license")) {
          console.log("🔀 Redirecting to /license due to license error...");
          window.location.href = "/license";
        }
        console.groupEnd();
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.warn("🔒 Unauthorized (401) detected.");
        // ✅ استفاده از استور تزریق شده برای دیسپچ
        if (store) {
          console.log("🧹 Dispatching auth/clearSession...");
          store.dispatch({ type: "auth/clearSession" });
        } else {
            console.error("⚠️ Store missing. Cannot dispatch clearSession.");
        }
      }
    }

    console.error(
      `❌ API Error Message:`,
      error.message
    );
    console.groupEnd();
    return Promise.reject(error);
  }
);

export default axiosInstance;