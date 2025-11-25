import { useEffect } from "react";
import { useAppSelector } from "@/hook/reduxHooks";
import { type RootState } from "@/store";
import { initEcho, disconnectEcho } from "@/lib/echoService";
import { selectIsLoggedIn } from "@/store/slices/authSlice";

/**
 * مدیریت اتصال سوکت به صورت ایزوله.
 * این کامپوننت هوشمندانه بر اساس کانفیگ پروژه (توکن یا کوکی) اتصال را برقرار می‌کند.
 */
export const GlobalWebSocketHandler = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const token = useAppSelector((state: RootState) => state.auth.accessToken);
  const authCheckStatus = useAppSelector(
    (state: RootState) => state.auth.initialAuthCheckStatus
  );

  useEffect(() => {
    let isMounted = true;

    // شرط اتصال: وضعیت بررسی اولیه "موفق" باشد + کاربر لاگین باشد
    const shouldConnect = isLoggedIn && authCheckStatus === "succeeded";

    if (shouldConnect) {
      const timer = setTimeout(() => {
        if (isMounted) {
          // تابع initEcho را صدا می‌زنیم.
          // اگر مود token باشد، token مقدار دارد و استفاده می‌شود.
          // اگر مود cookie باشد، token نال است و مشکلی پیش نمی‌آید.
          initEcho(token);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }

    // قطع اتصال در صورت خروج
    if (!isLoggedIn || authCheckStatus === "failed") {
      disconnectEcho();
    }
    
  }, [isLoggedIn, authCheckStatus, token]); 

  return null;
};