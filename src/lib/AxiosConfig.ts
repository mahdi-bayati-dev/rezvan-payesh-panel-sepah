import axios from "axios";
import { toast } from "react-toastify";

// آدرس پایه API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // ✅ حیاتی: کوکی‌های HttpOnly را ارسال می‌کند
  withCredentials: true,
});

// --- لاگ کردن درخواست‌ها ---
axiosInstance.interceptors.request.use(
  (config) => {
    // [LOG] برای درخواست‌های محافظت‌شده، لاگ می‌گیریم
    if (config.url && config.url !== '/login' && config.url !== '/me') {
        console.log(`[DIAGNOSTIC] Sending Request to: ${config.url}`);
        // در اینجا مرورگر باید کوکی را به صورت خودکار به هدر 'Cookie' اضافه کند
        // ما نمی‌توانیم هدر 'Cookie' را در جاوااسکریپت ببینیم، اما می‌توانیم وجود 'withCredentials' را تایید کنیم.
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- لاگ کردن پاسخ‌ها ---
axiosInstance.interceptors.response.use(
  (response) => {
    // [LOG] بررسی پاسخ لاگین برای هدر Set-Cookie
    if (response.config.url === '/login') {
        console.log("=========================================");
        console.log("✅ [LOGIN SUCCESS DIAGNOSTIC]");
        console.log("=========================================");
        
        // مرورگرها اجازه دسترسی به هدر 'Set-Cookie' را مستقیماً در JS نمی‌دهند،
        // اما وجود سایر هدرها و موفقیت لاگین را تایید می‌کنیم.
        
        // اگر در اینجا هدر 'access-control-allow-credentials: true' را در پاسخ سرور (CORS) داشته باشیم،
        // یعنی تنظیمات کراس‌سایت درست است.
        const allowCredentials = response.headers['access-control-allow-credentials'];
        console.log(`CORS Credentials Check: ${allowCredentials}`); // باید 'true' باشد
        
        console.log("نتیجه: مرورگر باید کوکی HttpOnly را ذخیره کند.");
        console.log("=========================================");
    }
    
    return response;
  },
  (error) => {
    const isLogin = error.config?.url === '/login';
    
    // [LOG] خطای 401: اگر لاگین نیست، یعنی کوکی ارسال نشده است
    if (error.response && error.response.status === 401 && !isLogin) {
        console.error("=========================================");
        console.error("❌ [401 ERROR DIAGNOSTIC]");
        console.error("=========================================");
        console.error(`Status 401 received at URL: ${error.config.url}`);
        
        // اینجا به دلیل HttpOnly، نمی‌توانیم هدرهای درخواست (Request Headers) را ببینیم.
        // اما 401 به معنی قطعی عدم ارسال کوکی توسط مرورگر است.
        
        console.error("نتیجه: مرورگر کوکی 'access_token' را در درخواست محافظت‌شده ارسال نکرده است.");
        console.error("تنها دلیل ممکن: کوکی در مرحله 'login' توسط مرورگر رد شده است (احتمالا به دلیل Secure/SameSite/Trust Proxy).");
        console.error("=========================================");
    }

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
      if (!isLogin) {
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