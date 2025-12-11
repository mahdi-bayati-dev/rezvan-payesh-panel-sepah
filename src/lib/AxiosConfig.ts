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
    // 🔍 شروع لاگ‌گیری
    console.groupCollapsed(`🚀 [Request] ${config.method?.toUpperCase()} ${config.url}`);

    if (AUTH_MODE === "token") {
      let token: string | null = null;

      if (store) {
        const state = store.getState();
        token = state.auth.accessToken || state.auth.token;
      }

      if (!token) {
        token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
            console.warn("⚠️ Token read from LocalStorage (Redux was empty/slow).");
        }
      }

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

    // مدیریت خطای ۵۰۳
    if (status === 503) {
      console.error("🚨 503 Service Unavailable");
      if (!toast.isActive("server-error")) {
        toast.error("سرویس موقتاً در دسترس نیست. لطفاً چند لحظه دیگر تلاش کنید.", {
            toastId: "server-error"
        });
      }
    }

    // ✅ مدیریت خطای لایسنس (۴۹۹ و ۴۰۳ خاص)
    const isLicenseError = 
        status === 499 || 
        (status === 403 && data && typeof data === "object" && LICENSE_ERROR_CODES.includes(data.error_code));

    if (isLicenseError) {
      console.warn(`⛔️ License Error Triggered (Status: ${status})`);
      
      const message = status === 499 
          ? "لایسنس نرم‌افزار معتبر نیست یا منقضی شده است." 
          : (data?.message || "لایسنس منقضی شده است");

      // نمایش پیام خطا فقط اگر قبلاً نمایش داده نشده باشد
      if (!toast.isActive("license-error")) {
        toast.error(message, {
          toastId: "license-error",
          autoClose: 10000,
        });
      }

      const onLicensePage = window.location.pathname.includes("/license");

      // 🔴 سناریوی اول: کاربر در صفحه لایسنس نیست -> باید ریدایرکت شود
      if (!onLicensePage) {
        console.warn("🔀 Redirecting to /license page (Halting App Logic)...");
        window.location.href = "/license";
        // بازگرداندن پرامیس معلق برای جلوگیری از اجرای کدهای بعدی تا زمان رفرش صفحه
        return new Promise(() => {});
      } 
      
      // 🟢 سناریوی دوم: کاربر در صفحه لایسنس است (مثلاً رفرش کرده)
      else {
        console.warn("🛡️ License Error on License Page. Handling specifically to allow rendering.");

        // ۱. اگر درخواست `/me` (چک لاگین) فیل شده باشد:
        // نباید بگذاریم فیل شود، چون ProtectedRoute کاربر را به لاگین می‌فرستد.
        // یک آبجکت کاربری موقت برمی‌گردانیم تا صفحه لود شود.
        if (originalRequest?.url?.endsWith("/me") || originalRequest?.url?.endsWith("me")) {
             console.log("✅ Mocking /me response to prevent logout loop.");
             return {
                 data: { 
                    id: -1, 
                    user_name: "License Locked", 
                    email: "system@locked", 
                    roles: [], // نقش خالی
                    employee: null 
                 },
                 status: 200,
                 statusText: "OK",
                 headers: {},
                 config: originalRequest!,
             };
        }

        // ۲. اگر درخواست `/license` (دریافت اطلاعات لایسنس) ۴۹۹ داده باشد:
        // ما نیاز داریم بادی (Body) همین ارور را به کامپوننت برسانیم (چون Installation ID داخلش است).
        // پس ارور را تبدیل به موفقیت (200) می‌کنیم تا axios آن را throw نکند.
        if (originalRequest?.url?.endsWith("/license")) {
             console.log("✅ Converting /license error to success to render form data.");
             return {
                 data: data, // دیتای خطای سرور را به عنوان دیتای موفق پاس می‌دهیم
                 status: 200,
                 statusText: "OK",
                 headers: error.response?.headers || {},
                 config: originalRequest!,
             };
        }

        // ۳. برای سایر درخواست‌ها در صفحه لایسنس (مثلاً نوتیفیکیشن‌ها)، می‌گذاریم فیل شوند
        return Promise.reject(error);
      }
    }

    // مدیریت خطای ۴۰۱ (خروج)
    if (status === 401) {
      // یک لایه محافظتی اضافه: اگر ۴۰۱ بود اما کد خطای لایسنس داشت
      if (data && typeof data === "object" && LICENSE_ERROR_CODES.includes(data.error_code)) {
         console.warn("🛡️ 401 received but it's a License Error. Redirecting instead of Logout.");
         window.location.href = "/license";
         return new Promise(() => {}); // فریز کردن
      }

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