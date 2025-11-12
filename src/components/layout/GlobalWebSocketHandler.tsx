import { useEffect } from 'react';
// هوک‌های Redux برای خواندن وضعیت احراز هویت
import { useAppSelector } from '@/hook/reduxHooks'; // مسیر هوک Redux شما
import { type RootState } from '@/store'; // مسیر RootState شما
// توابع سرویس Echo
import { initEcho, disconnectEcho } from '@/features/reports/services/echoService'; // مسیر سرویس Echo

/**
 * این کامپوننت هیچ UI رندر نمی‌کند.
 * وظیفه آن مدیریت چرخه حیات (lifecycle) اتصال WebSocket بر اساس
 * وضعیت احراز هویت (توکن) در Redux است.
 */
export const GlobalWebSocketHandler = () => {
  // ۱. توکن کاربر را از Redux دریافت کنید
  const userToken = useAppSelector((state: RootState) => state.auth.accessToken);

  // ۲. [نکته کلیدی] وضعیت بررسی توکن را نیز دریافت کنید
  // این وضعیت به ما می‌گوید که آیا سرور توکن را تایید کرده است یا خیر
  const authCheckStatus = useAppSelector((state: RootState) => state.auth.initialAuthCheckStatus);

  useEffect(() => {
    // ۳. [منطق بهینه شده]
    // فقط زمانی وصل شو که هم توکن داشته باشیم و هم سرور آن را "succeeded" (موفق) اعلام کرده باشد
    if (userToken && authCheckStatus === "succeeded") {
      console.log('[GlobalWebSocketHandler] توکن معتبر شناسایی شد، در حال راه‌اندازی Echo...');
      initEcho(userToken);
    }

    // ۴. [منطق بهینه شده]
    // در هر حالتی که توکن نداریم یا بررسی توکن "failed" (ناموفق) بود، اتصال را قطع کن
    if (!userToken || authCheckStatus === "failed") {
      console.log('[GlobalWebSocketHandler] کاربر احراز هویت نشده یا توکن نامعتبر است، در حال قطع اتصال Echo...');
      disconnectEcho();
    }

    // این افکت به هر دو متغیر حساس است
  }, [userToken, authCheckStatus]);

  // این کامپوننت هیچ چیزی رندر نمی‌کند
  return null;
};