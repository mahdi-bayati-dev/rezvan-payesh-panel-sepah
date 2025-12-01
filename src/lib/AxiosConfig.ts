import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { store } from "@/store";
import { toast } from "react-toastify";

// ====================================================================
// ⚙️ تنظیمات پایه و هوشمند
// ====================================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";

// دریافت حالت احراز هویت از متغیر محیطی (پیش‌فرض: token)
// این متغیر در کل برنامه ایمپورت می‌شود تا همه رفتار یکسان داشته باشند
export const AUTH_MODE =
  (import.meta.env.VITE_AUTH_MODE as "token" | "cookie") || "token";

const LICENSE_ERROR_CODES = ["TRIAL_EXPIRED", "LICENSE_EXPIRED", "TAMPERED"];

/**
 * تنظیمات Axios
 * اگر مود 'cookie' باشد، withCredentials باید true باشد تا کوکی HttpOnly ارسال شود.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: AUTH_MODE === "cookie",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// لاگ وضعیت برای اطمینان در محیط توسعه
if (import.meta.env.DEV) {
  console.log(
    `%c[Axios] Initialized in ${AUTH_MODE.toUpperCase()} mode`,
    "background: #333; color: #bada55; padding: 4px; border-radius: 4px;"
  );
}

// ====================================================================
// 🔓 Request Interceptor (تزریق توکن - فقط در حالت توکن)
// ====================================================================

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // فقط اگر در حالت توکن هستیم، توکن را از ریداکس می‌خوانیم و در هدر می‌گذاریم
    if (AUTH_MODE === "token") {
      const state = store.getState();
      const token = state.auth.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // در حالت cookie، مرورگر خودش کوکی httpOnly را ارسال می‌کند و ما کاری نمی‌کنیم.

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ====================================================================
// 🔒 Response Interceptor (مدیریت خطاها - مشترک)
// ====================================================================

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    // 1. مدیریت خطای لایسنس (مشترک)
    if (status === 403 && data) {
      const isLicenseError =
        typeof data === "object" &&
        LICENSE_ERROR_CODES.includes(data.error_code);

      if (isLicenseError) {
        console.warn(`⛔️ License Error: ${data.error_code}`);
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
          window.location.href = "/license";
        }
        return Promise.reject(error);
      }
    }

    // 2. مدیریت خطای احراز هویت (401)
    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.warn("🔒 Unauthorized (401) detected.");
        // پاک کردن استیت ریداکس (مشترک برای هر دو حالت)
        store.dispatch({ type: "auth/clearSession" });
      }
    }

    console.error(
      `❌ API Error [${status}] at ${originalRequest?.url}:`,
      error.message
    );
    return Promise.reject(error);
  }
);

export default axiosInstance;
