import axios from "axios";
import { store } from "@/store";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ۱. مدیریت خطای لایسنس (403 Forbidden)
    if (error.response && error.response.status === 403) {
      const data = error.response.data;

      const licenseErrorCodes = [
        "TRIAL_EXPIRED",
        "LICENSE_EXPIRED",
        "TAMPERED",
      ];

      // چک کردن ایمن برای وجود کد خطا
      if (
        data &&
        typeof data === "object" &&
        licenseErrorCodes.includes(data.error_code)
      ) {
        // [FIX] به جای لاگ کردن کل دیتا، فقط رشته‌ها را لاگ می‌کنیم تا خطای primitive رخ ندهد
        console.warn(`⛔ License Error: ${data.error_code}`);

        // [FIX] مطمئن می‌شویم پیامی که به toast می‌دهیم حتماً رشته است
        const errorMsg =
          typeof data.message === "string"
            ? data.message
            : "لایسنس شما منقضی شده است. لطفاً اقدام به تمدید نمایید.";

        toast.error(errorMsg, {
          toastId: "license-error",
        });

        if (!window.location.pathname.includes("/license")) {
          window.location.href = "/license";
        }

        // خطا را ریجکت می‌کنیم اما آبجکت خطا را دستکاری نمی‌کنیم تا Axios بهم نریزد
        return Promise.reject(error);
      }
    }

    // ۲. مدیریت خطای احراز هویت (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      if (!error.config.url?.endsWith("/login")) {
        // [FIX] لاگ ساده
        console.warn("Unauthorized (401) detected. Clearing token.");
        store.dispatch({ type: "auth/clearToken" });
      }
    }

    // [FIX] اگر بخواهیم خطای کلی را لاگ کنیم، فقط مسیج را لاگ می‌کنیم
    const status = error.response?.status;
    const url = error.config?.url;
    console.error(`API Error [${status}] at ${url}:`, error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;
