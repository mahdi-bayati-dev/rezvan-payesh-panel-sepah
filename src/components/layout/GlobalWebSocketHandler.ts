import { useEffect } from "react";
import { useAppSelector } from "@/hook/reduxHooks";
import { type RootState } from "@/store";
import { initEcho, disconnectEcho } from "@/lib/echoService";
import { selectIsLoggedIn } from "@/store/slices/authSlice";

/**
 * مدیریت چرخه حیات سوکت (Life-Cycle Management)
 * وظیفه: فقط اتصال و قطع اتصال بر اساس وضعیت کاربر.
 */
export const GlobalWebSocketHandler = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const token = useAppSelector((state: RootState) => state.auth.accessToken);
  const authCheckStatus = useAppSelector(
    (state: RootState) => state.auth.initialAuthCheckStatus
  );

  useEffect(() => {
    // شرط اتصال: احراز هویت تمام شده باشد + کاربر لاگین باشد
    const shouldConnect = isLoggedIn && authCheckStatus === "succeeded";

    if (shouldConnect) {
      // یک تاخیر کوچک برای اطمینان از هیدراته شدن کامل Redux (اختیاری اما امن)
      const timer = setTimeout(() => {
        console.log("🔄 [GlobalSocket] Initializing connection...");
        initEcho(token);
      }, 100); // زمان را از 500 به 100 کاهش دادیم چون سیستم Event-Driven شده

      return () => clearTimeout(timer);
    }

    // اگر کاربر لاگ‌اوت کرد یا مشکلی پیش آمد، سوکت قطع شود
    if (!isLoggedIn || authCheckStatus === "failed") {
      disconnectEcho();
    }
  }, [isLoggedIn, authCheckStatus, token]);

  return null;
};
