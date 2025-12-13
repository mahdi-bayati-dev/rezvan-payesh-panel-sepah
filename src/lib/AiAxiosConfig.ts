import axios from "axios";
import { AppConfig } from "@/config";

// لاگ کردن آدرس پایه AI برای اطمینان
console.log("🤖 [AI Config] Base URL:", AppConfig.AI.BASE_URL);

const aiAxiosInstance = axios.create({
  baseURL: AppConfig.AI.BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // افزودن Secret Key اگر در هدر نیاز است
    ...(AppConfig.AI.SECRET ? { "X-AI-Secret": AppConfig.AI.SECRET } : {}),
  },
  timeout: 30000, // پردازش تصویر ممکن است طول بکشد
});

aiAxiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🤖 [AI Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // اگر سرویس AI هم نیاز به توکن کاربر دارد، اینجا اضافه می‌شود
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

aiAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ [AI Service Error]:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default aiAxiosInstance;