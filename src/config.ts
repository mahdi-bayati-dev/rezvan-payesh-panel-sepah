// src/config.ts

/**
 * تابع کمکی برای دریافت مقدار از کانفیگ runtime (window) یا buildtime (env)
 * اولویت با Runtime Config است.
 */
const getEnv = (key: keyof Window["globalConfig"], importMetaVal: any) => {
  if (
    typeof window !== "undefined" &&
    window.globalConfig &&
    window.globalConfig[key]
  ) {
    return window.globalConfig[key];
  }
  return importMetaVal;
};

export const AppConfig = {
  // تنظیمات اصلی API
  API_URL: getEnv(
    "VITE_API_BASE_URL",
    import.meta.env.VITE_API_BASE_URL
  ) as string,
  STORAGE_URL: getEnv(
    "VITE_STORAGE_BASE_URL",
    import.meta.env.VITE_STORAGE_BASE_URL
  ) as string,

  // تنظیمات سرویس هوش مصنوعی (AI)
  AI: {
    BASE_URL: getEnv(
      "VITE_API_BASE_AI_URL",
      import.meta.env.VITE_API_BASE_AI_URL
    ) as string,
    SECRET: getEnv(
      "VITE_AI_SERVICE_SECRET",
      import.meta.env.VITE_AI_SERVICE_SECRET
    ) as string,
  },

  // تنظیمات احراز هویت
  AUTH_MODE: getEnv("VITE_AUTH_MODE", import.meta.env.VITE_AUTH_MODE) as string,

  // تنظیمات سوکت (Pusher/Soketi)
  PUSHER: {
    APP_KEY: getEnv(
      "VITE_PUSHER_APP_KEY",
      import.meta.env.VITE_PUSHER_APP_KEY
    ) as string,
    CLUSTER: getEnv(
      "VITE_PUSHER_APP_CLUSTER",
      import.meta.env.VITE_PUSHER_APP_CLUSTER
    ) as string,
    HOST: getEnv(
      "VITE_PUSHER_HOST",
      import.meta.env.VITE_PUSHER_HOST
    ) as string,
    PORT: Number(
      getEnv("VITE_PUSHER_PORT", import.meta.env.VITE_PUSHER_PORT || 6001)
    ),
    SCHEME: getEnv(
      "VITE_PUSHER_SCHEME",
      import.meta.env.VITE_PUSHER_SCHEME || "http"
    ) as string,
  },
};
