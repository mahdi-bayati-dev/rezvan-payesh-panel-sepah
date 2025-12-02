import { useEffect, useState } from "react";
import Echo from "laravel-echo";
import { getEcho, onEchoReady } from "@/lib/echoService";

/**
 * این هوک تضمین می‌کند که شما همیشه یک نسخه آماده (Ready) از Echo را دریافت می‌کنید.
 * دیگر نیازی به چک کردن دستی یا استفاده از setInterval نیست.
 */
export const useEcho = () => {
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(() =>
    getEcho()
  );

  useEffect(() => {
    // اگر از قبل وجود دارد، نیازی به کاری نیست
    if (echoInstance) return;

    // اشتراک در رویداد آماده‌سازی سوکت
    // به محض اینکه initEcho در GlobalHandler اجرا شود، این کال‌بک صدا زده می‌شود
    onEchoReady((echo) => {
      console.log("✅ [useEcho] Socket instance received via observer.");
      setEchoInstance(echo);
    });
  }, [echoInstance]);

  return echoInstance;
};
