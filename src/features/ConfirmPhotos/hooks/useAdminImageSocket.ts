import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles } from "@/store/slices/authSlice";
import { requestKeys } from "./useImageRequests";
import { ROLES } from "@/constants/roles";

/**
 * هوک اختصاصی و تضمینی برای دریافت نوتیفیکیشن‌های ادمین
 */
export const useAdminImageSocket = () => {
  const queryClient = useQueryClient();
  const roles = useAppSelector(selectUserRoles) || [];

  // برای جلوگیری از پروسس تکراری ایونت‌ها (Debouncing دستی)
  const processedEventIds = useRef<Set<string>>(new Set());

  const hasAdminAccess =
    roles.includes(ROLES.SUPER_ADMIN) ||
    roles.includes(ROLES.ADMIN_L2) ||
    roles.includes(ROLES.ADMIN_L3);

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !hasAdminAccess) return;

    const channelName = "super-admin-global";
    const channel = echo.private(channelName);

    console.log(`📡 [Admin Socket] Connecting to raw channel: ${channelName}`);

    // --- هندلر اصلی پردازش پیام ---
    const handleEvent = (source: string, eventName: string, data: any) => {
      // 1. ساخت شناسه یکتا برای ایونت جهت جلوگیری از تکرار
      // از timestamp یا پرسنلی یا ترکیبی استفاده میکنیم
      const eventId = `${data.timestamp || Date.now()}-${
        data.personnel_code || "unknown"
      }`;

      // اگر این ایونت قبلا در 2 ثانیه اخیر پردازش شده، نادیده بگیر
      if (processedEventIds.current.has(eventId)) return;

      console.log(`🚀 [Admin Socket] Event Received via [${source}]`, {
        eventName,
        data,
      });

      // ثبت ایونت به عنوان پردازش شده
      processedEventIds.current.add(eventId);
      setTimeout(() => processedEventIds.current.delete(eventId), 2000);

      // 2. استخراج پیام
      const message = data.message || "درخواست جدید تصویر دریافت شد.";

      // 3. نمایش نوتیفیکیشن
      toast.info(`📸 ${message}`, {
        position: "bottom-left",
        autoClose: 7000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: `toast-${eventId}`, // جلوگیری از نمایش تکراری Toast
      });

      // 4. آپدیت لیست (Real-time)
      // باطل کردن تمام کوئری‌های مربوط به درخواست‌ها برای دریافت دیتای تازه
      console.log("🔄 [Admin Socket] Invalidating Queries...");
      queryClient.invalidateQueries({ queryKey: requestKeys.all });

      // پخش صدا (اختیاری)
      try {
        // const audio = new Audio('/assets/sounds/notification.mp3');
        // audio.play().catch(() => {});
      } catch (e) {
        console.log(e);
      }
    };

    // --- روش ۱: لیسنر استاندارد Echo (برای حالت استاندارد) ---
    const standardEventName = ".images.pending";
    channel.listen(standardEventName, (data: any) => {
      handleEvent("Standard Listener", standardEventName, data);
    });

    // --- روش ۲: لیسنر خام Pusher (تضمینی - برای حل مشکل شما) ---
    // این قسمت مستقیماً به سابسکرایبشن کانال وصل می‌شود و همه چیز را می‌شنود
    // با کمی تاخیر اجرا میکنیم تا مطمئن شویم سابسکرایبشن انجام شده
    const rawListenerTimeout = setTimeout(() => {
      if (channel.subscription) {
        channel.subscription.bind_global((eventName: string, data: any) => {
          // نادیده گرفتن ایونت‌های داخلی خود Pusher
          if (eventName.startsWith("pusher:")) return;

          // اگر اسم ایونت شامل images.pending بود (چه با نقطه چه بی نقطه)
          if (eventName.includes("images.pending")) {
            handleEvent("RAW BINDING", eventName, data);
          }
        });
        console.log(
          "🛡️ [Admin Socket] Raw 'bind_global' listener attached successfully."
        );
      }
    }, 1500);

    return () => {
      clearTimeout(rawListenerTimeout);
      channel.stopListening(standardEventName);

      if (channel.subscription) {
        channel.subscription.unbind_global();
      }
      console.log("🛑 [Admin Socket] Disconnected");
    };
  }, [hasAdminAccess, queryClient]);
};
