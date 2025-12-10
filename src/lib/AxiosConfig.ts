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
  console.log("📦 [Axios] Store Injected Successfully");
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
    // 🕵️‍♂️ لاگ دقیق برای بررسی وضعیت توکن قبل از ارسال
    // console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    if (AUTH_MODE === "token") {
      // ✅ استفاده از استور تزریق شده با بررسی وجود آن
      if (store) {
        const state = store.getState();
        
        // 🔍 بررسی دقیق استور برای پیدا کردن مشکل احتمالی نام‌گذاری
        // console.log("State Auth Snapshot:", state.auth);
        
        const token = state.auth.accessToken;

        if (token) {
            // console.log("🔑 Token FOUND in Redux. Attaching to header...");
            if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } else {
            console.warn("⚠️ Token is MISSING in Redux State:", state.auth);
        }
      } else {
          console.warn("⚠️ Store is NOT injected yet. Request might fail.");
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

    // لاگ دقیق خطا برای دیباگ ۴۰۱
    if (status === 401) {
        console.group("🛑 [Axios] 401 Unauthorized Error");
        console.log("Requested URL:", originalRequest?.url);
        
        // اگر توکن فرستاده بودیم ولی ۴۰۱ گرفتیم، یعنی سرور آن را نگرفته یا قبول نکرده
        console.log("Request Headers Sent:", originalRequest?.headers);
        
        if (store) {
            console.log("Current Token in Store:", store.getState().auth.accessToken);
        }
        console.groupEnd();
    }

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

    if (status === 401) {
      if (originalRequest?.url && !originalRequest.url.endsWith("/login")) {
        console.warn("🔒 Unauthorized (401) detected. Clearing session...");
        // ✅ استفاده از استور تزریق شده برای دیسپچ
        if (store) {
          store.dispatch({ type: "auth/clearSession" });
        }
      }
    }

    // console.error(
    //   `❌ API Error [${status}] at ${originalRequest?.url}:`,
    //   error.message
    // );
    return Promise.reject(error);
  }
);

export default axiosInstance;