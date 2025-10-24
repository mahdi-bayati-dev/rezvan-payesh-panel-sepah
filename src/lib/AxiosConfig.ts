import axios from "axios";

// ۱. خواندن آدرس پایه API از متغیر محیطی
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ۲. ساخت یک instance جدید از Axios با تنظیمات پیش‌فرض
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // (HttpOnly)
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


// Request Interceptor:
axiosInstance.interceptors.request.use(
  (config) => {
    // در اینجا می‌توانید تنظیمات config را قبل از ارسال تغییر دهید
    // مثلاً:
    // const token = localStorage.getItem('some_other_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    console.log("Starting Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    // مدیریت خطای پیش از ارسال درخواست
    console.error("Request Error Interceptor:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor:
// می‌توانید پاسخ‌های دریافتی یا خطاها را به صورت سراسری مدیریت کنید
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response Received:", response.status, response.config.url);
    return response; // پاسخ را برای استفاده بعدی برگردان
  },
  (error) => {
    console.error(
      "Response Error Interceptor:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );

    // مثال: مدیریت خطای 401 (Unauthorized) به صورت سراسری
    if (error.response && error.response.status === 401) {
      // کاربر احراز هویت نشده یا کوکی منقضی شده است
      console.warn(
        "Unauthorized request detected (401). Redirecting to login..."
      );
      // در اینجا می‌توانید کاربر را به صفحه لاگین هدایت کنید
      // یا یک اکشن Redux برای لاگ‌اوت dispatch کنید
      // window.location.href = '/login'; // (روش ساده اما باعث رفرش کامل می‌شود)
      // store.dispatch(logout()); // (اگر به store دسترسی دارید)
    }

    // خطا را برای مدیریت در catch مربوط به createAsyncThunk برگردان
    return Promise.reject(error);
  }
);

// ۴. اکسپورت instance پیکربندی شده برای استفاده در سایر فایل‌ها
export default axiosInstance;
