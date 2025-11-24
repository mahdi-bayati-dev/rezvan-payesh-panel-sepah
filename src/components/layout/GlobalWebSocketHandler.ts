import { useEffect } from "react";
import { useAppSelector } from "@/hook/reduxHooks";
import { type RootState } from "@/store";
import { initEcho, disconnectEcho } from "@/lib/echoService";
import { selectIsLoggedIn } from "@/store/slices/authSlice";

/**
 * مدیریت اتصال سوکت برای معماری HttpOnly.
 * تفاوت اصلی: دیگر منتظر "token" نمی‌مانیم، بلکه منتظر وضعیت "isAuthenticated" می‌مانیم.
 */
export const GlobalWebSocketHandler = () => {
  // به جای توکن، از وضعیت لاگین استفاده می‌کنیم
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const authCheckStatus = useAppSelector(
    (state: RootState) => state.auth.initialAuthCheckStatus
  );

  useEffect(() => {
    let isMounted = true;

    // شرط اتصال: وضعیت احراز هویت موفق باشد و کاربر لاگین باشد
    const shouldConnect = isLoggedIn && authCheckStatus === "succeeded";

    if (shouldConnect) {
      // تایم‌اوت کوتاه برای اطمینان از استیبل بودن وضعیت
      const timer = setTimeout(() => {
        if (isMounted) {
          // تابع initEcho دیگر ورودی توکن نمی‌گیرد
          initEcho();
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }

    // اگر کاربر لاگ‌اوت کرد یا وضعیت نامشخص بود، سوکت قطع شود
    if (!isLoggedIn || authCheckStatus === "failed") {
      disconnectEcho();
    }
  }, [isLoggedIn, authCheckStatus]);

  return null;
};
