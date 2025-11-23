import axios from "axios";
// import { store } from "@/store";
import { toast } from "react-toastify";

// ✅ نکته مهم: اگر در Vercel این کد اجرا شود (که HTTPS است)، 
// و VITE_API_BASE_URL با HTTP شروع شود، Mixed Content رخ می‌دهد.
// حتماً متغیر محیطی VITE_API_BASE_URL در Vercel باید با HTTPS تنظیم شود.
// اگر متغیر محیطی تنظیم نشده باشد، مقدار پیش‌فرض "http" لود می‌شود.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // ✅ مهم: این خط تضمین می‌کند که مرورگر کوکی‌های HttpOnly را با درخواست‌ها ارسال می‌کند
  withCredentials: true,
});

// Request Interceptor
// ✅ ساده‌سازی: نیازی به خواندن توکن از Redux و تنظیم هدر Authorization نیست، چون مرورگر HttpOnly Cookie را خودکار می‌فرستد.
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = store.getState().auth.accessToken; // حذف شد
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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

      if (
        data &&
        typeof data === "object" &&
        licenseErrorCodes.includes(data.error_code)
      ) {
        console.warn(`⛔ License Error: ${data.error_code}`);

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

        return Promise.reject(error);
      }
    }

    // ۲. مدیریت خطای احراز هویت (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      if (!error.config.url?.endsWith("/login")) {
        // بهترین رویکرد این است که این مدیریت وضعیت را به Redux Thunk (checkAuthStatus) بسپاریم.
        console.warn("Unauthorized (401) detected. Relying on Redux/Thunks to reset user state.");
      }
    }

    const status = error.response?.status;
    const url = error.config?.url;
    console.error(`API Error [${status}] at ${url}:`, error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;