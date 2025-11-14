import { useEffect } from "react";
// هوک‌های Redux برای خواندن وضعیت احراز هویت
import { useAppSelector } from "@/hook/reduxHooks"; // مسیر هوک Redux شما
import { type RootState } from "@/store"; // مسیر RootState شما
// [اصلاح] توابع سرویس Echo حالا از مسیر سراسری خوانده می‌شوند
import { initEcho, disconnectEcho } from "@/lib/echoService"; // <-- مسیر اصلاح شد

export const GlobalWebSocketHandler = () => {
  // ۱. توکن کاربر را از Redux دریافت کنید
  const userToken = useAppSelector(
    (state: RootState) => state.auth.accessToken
  );

  // ۲. [نکته کلیدی] وضعیت بررسی توکن را نیز دریافت کنید
  const authCheckStatus = useAppSelector(
    (state: RootState) => state.auth.initialAuthCheckStatus
  );

  useEffect(() => {
    // ۳. [منطق بهینه شده]
    // فقط زمانی وصل شو که هم توکن داشته باشیم و هم سرور آن را "succeeded" (موفق) اعلام کرده باشد
    if (userToken && authCheckStatus === "succeeded") {
      console.log(
        "[GlobalWebSocketHandler] توکن معتبر شناسایی شد، در حال راه‌اندازی Echo..."
      );
      initEcho(userToken);
    }

    // ۴. [منطق بهینه شده]
    // در هر حالتی که توکن نداریم یا بررسی توکن "failed" (ناموفق) بود، اتصال را قطع کن
    if (!userToken || authCheckStatus === "failed") {
      console.log(
        "[GlobalWebSocketHandler] کاربر احراز هویت نشده یا توکن نامعتبر است، در حال قطع اتصال Echo..."
      );
      disconnectEcho();
    }

    // این افکت به هر دو متغیر حساس است
  }, [userToken, authCheckStatus]);

  // این کامپوننت هیچ چیزی رندر نمی‌کند
  return null;
};
