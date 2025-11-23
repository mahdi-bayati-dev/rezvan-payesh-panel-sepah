import { useEffect } from "react";
import { useAppSelector } from "@/hook/reduxHooks";
import { type RootState } from "@/store";
import { initEcho, disconnectEcho } from "@/lib/echoService";

/**
 * این کامپوننت "فقط" مسئول مدیریت اتصال و قطع اتصال است.
 * هیچ لاجیک بیزینسی (مثل گوش دادن به ایونت‌ها) نباید اینجا باشد.
 * * ✅ توجه: پس از انتقال به HttpOnly Cookie، دیگر accessToken از Redux خوانده نمی‌شود.
 * شرط اتصال صرفاً موفقیت‌آمیز بودن احراز هویت اولیه و وجود کاربر است.
 */
export const GlobalWebSocketHandler = () => {
  // ✅ اصلاح: حذف فراخوانی state.auth.accessToken
  const authCheckStatus = useAppSelector((state: RootState) => state.auth.initialAuthCheckStatus);
  const user = useAppSelector((state: RootState) => state.auth.user); // [جدید] وجود کاربر را چک می‌کنیم

  useEffect(() => {
    let isMounted = true;

    // ۱. شرط اتصال: احراز هویت "موفق" است و اطلاعات کاربر لود شده است
    const shouldConnect = authCheckStatus === "succeeded" && !!user;

    if (shouldConnect) {
      // تایم‌اوت کوچک برای اطمینان از اینکه سایر پروسه‌های لاگین تمام شده‌اند
      const timer = setTimeout(() => {
        if (isMounted) {
          // ✅ فراخوانی بدون توکن
          initEcho(); 
        }
      }, 500);

      return () => {
          clearTimeout(timer);
      };
    } 
    
    // ۲. اگر شرط برقرار نیست (مثلا کاربر لاگ‌اوت کرد)، قطع کن
    // ✅ چک کردن براساس وضعیت کاربر
    if (!user || authCheckStatus === 'failed') {
        disconnectEcho();
    }

    // ۳. Cleanup: وقتی کامپوننت unmount میشه یا کاربر عوض میشه.
    
  }, [authCheckStatus, user]); // ✅ به‌روزرسانی وابستگی‌ها

  return null;
};