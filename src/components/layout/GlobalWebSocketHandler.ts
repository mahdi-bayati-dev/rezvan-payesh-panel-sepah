import { useEffect } from "react";
import { useAppSelector } from "@/hook/reduxHooks";
import { type RootState } from "@/store";
import { initEcho, disconnectEcho } from "@/lib/echoService";

/**
 * این کامپوننت "فقط" مسئول مدیریت اتصال و قطع اتصال است.
 * هیچ لاجیک بیزینسی (مثل گوش دادن به ایونت‌ها) نباید اینجا باشد.
 */
export const GlobalWebSocketHandler = () => {
  const userToken = useAppSelector((state: RootState) => state.auth.accessToken);
  const authCheckStatus = useAppSelector((state: RootState) => state.auth.initialAuthCheckStatus);

  useEffect(() => {
    let isMounted = true;

    // ۱. شرط اتصال: توکن داریم + وضعیت احراز هویت "موفق" است
    const shouldConnect = userToken && authCheckStatus === "succeeded";

    if (shouldConnect) {
      // تایم‌اوت کوچک برای اطمینان از اینکه سایر پروسه‌های لاگین تمام شده‌اند
      const timer = setTimeout(() => {
        if (isMounted) {
          initEcho(userToken);
        }
      }, 500);

      return () => {
          clearTimeout(timer);
      };
    } 
    
    // ۲. اگر شرط برقرار نیست (مثلا کاربر لاگ‌اوت کرد)، قطع کن
    if (!userToken || authCheckStatus === 'failed') {
        disconnectEcho();
    }

    // ۳. Cleanup: وقتی کامپوننت unmount میشه یا توکن عوض میشه،
    // برای اطمینان اتصال قبلی رو قطع نمی‌کنیم مگر اینکه واقعا لاگ‌اوت شده باشه.
    // اما disconnectEcho خودش هندل میکنه که الکی قطع نکنه.
    
  }, [userToken, authCheckStatus]);

  return null;
};