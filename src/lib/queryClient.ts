import { QueryClient } from "@tanstack/react-query";

/**
 * ایجاد یک instance از QueryClient با تنظیمات پیش‌فرض بهینه.
 * این تنظیمات در کل برنامه اعمال می‌شوند مگر اینکه در یک query خاص override شوند.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // زمان پیش‌فرض که داده‌ها "تازه" (fresh) در نظر گرفته می‌شوند.
      // در این مدت، React Query داده‌ها را از کش برمی‌گرداند بدون اینکه درخواست جدیدی به شبکه بزند.
      // مقدار ۵ دقیقه (بر حسب میلی‌ثانیه) یک شروع خوب است.
      staleTime: 1000 * 60 * 5, // 5 minutes

      // زمان پیش‌فرض که داده‌های غیرفعال (inactive) در کش باقی می‌مانند قبل از حذف شدن.
      // gcTime در v5 جایگزین cacheTime شده.
      gcTime: 1000 * 60 * 15, // 15 minutes

      // عدم تلاش مجدد خودکار در صورت خطا (می‌توانید بر اساس نیاز تغییر دهید)
      retry: false,

      // عدم فچ مجدد خودکار هنگام فوکوس شدن پنجره (می‌توانید true کنید اگر لازم است)
      refetchOnWindowFocus: false,

      // عدم فچ مجدد خودکار هنگام اتصال مجدد شبکه (معمولاً true خوب است)
      // refetchOnReconnect: true,

      // عدم فچ مجدد خودکار هنگام mount شدن کامپوننت اگر داده stale نباشد
      // refetchOnMount: true, // (پیش‌فرض true است)
    },
    mutations: {
      // می‌توانید تنظیمات پیش‌فرض برای mutation ها هم اینجا اضافه کنید
      // مثلاً مدیریت خطا یا ...
    },
  },
});
