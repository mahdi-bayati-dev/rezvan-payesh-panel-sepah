import axios from "axios";
import { store } from "@/store"; // ۱. ایمپورت store برای دسترسی به state (روش پیشرفته‌تر)

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://payesh.eitebar.ir/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request Interceptor:
axiosInstance.interceptors.request.use(
  (config) => {
    // ۲. خواندن توکن از Redux state (روش بهتر از localStorage مستقیم)
    const token = store.getState().auth.accessToken; // دسترسی به state از store

    // ۳. اگر توکن وجود داشت، هدر Authorization را اضافه کن
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "Starting Request:",
      config.method?.toUpperCase(),
      config.url,
      token ? "with token" : "without token"
    );
    return config;
  },
  (error) => {
    console.error("Request Error Interceptor:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor (بدون تغییر زیاد، فقط لاگ‌اوت در 401 را می‌توان فعال کرد)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response Received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "Response Error Interceptor:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );

    // ۴. مدیریت خطای 401 برای Bearer Token
    if (error.response && error.response.status === 401) {
      console.warn(
        "Unauthorized request detected (401). Token might be invalid or expired. Logging out..."
      );
      // ۵. dispatch کردن اکشن clearToken یا logoutUser از store
      // (برای جلوگیری از loop، چک کنید که درخواست اصلی login نبوده باشد)
      if (!error.config.url?.endsWith("/login")) {
        store.dispatch({ type: "auth/clearToken" }); // dispatch اکشن ساده برای پاک کردن توکن
        // یا
        // import { logoutUser } from '@/store/slices/authSlice';
        // store.dispatch(logoutUser()); // dispatch کردن thunk لاگ‌اوت
        // window.location.href = '/login'; // ریدایرکت مستقیم (کمتر توصیه می‌شود)
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
