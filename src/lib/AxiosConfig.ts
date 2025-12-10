import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
// import { toast } from "react-toastify";
import { AppConfig } from "@/config";

let store: any = null;

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

// ====================================================================
// 🔓 Request Interceptor
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);

    if (AUTH_MODE === "token") {
      let token: string | null = null;

      if (store) {
        const state = store.getState();
        token = state.auth.accessToken || state.auth.token;
      }

      // Fallback to LocalStorage
      if (!token) {
        token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log("🔑 Auth Header Attached.");
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

    // لاگ کردن خطای 503 (خیلی مهم برای وضعیت فعلی شما)
    if (status === 503) {
      console.error("🚨 Server 503 Error: Backend is down or restarting.");
    }

    if (status === 403 && data) {
      // لاجیک لایسنس دست نخورد
      const isLicenseError =
        typeof data === "object" &&
        LICENSE_ERROR_CODES.includes(data.error_code);

      if (isLicenseError) {
        // ... (کد لایسنس)
        return Promise.reject(error);
      }
    }

    // 🛑 تغییرات دیباگ برای مشکل 401
    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.error("🛑 401 Unauthorized Detected!");
        console.warn(
          "⚠️ Debug Mode: Auto-logout is DISABLED. Token remains in localStorage."
        );

        // 👇👇👇 همه کارهای مخرب را کامنت کردم 👇👇👇

        // localStorage.removeItem("token");
        // localStorage.removeItem("accessToken");

        // if (store) {
        //   store.dispatch({ type: "auth/clearSession" });
        // }

        // if (!window.location.pathname.includes("/login")) {
        //      window.location.href = "/login";
        // }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
