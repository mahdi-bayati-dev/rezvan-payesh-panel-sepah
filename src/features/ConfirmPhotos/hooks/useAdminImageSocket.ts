import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEcho } from "@/hook/useEcho"; // آدرس را بر اساس محل فایل useEcho تنظیم کن
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles } from "@/store/slices/authSlice";
import { requestKeys } from "./useImageRequests";
import { ROLES } from "@/constants/roles";

/**
 * هوک دریافت نوتیفیکیشن‌های ادمین
 * نسخه بهینه شده: استفاده از Observer Pattern به جای Polling
 */
export const useAdminImageSocket = () => {
  const queryClient = useQueryClient();
  const roles = useAppSelector(selectUserRoles) || [];

  // ✅ استفاده از هوک جدید: خودکار صبر می‌کند تا سوکت آماده شود
  const echoInstance = useEcho();

  const processedEventIds = useRef<Set<string>>(new Set());

  const hasAdminAccess =
    roles.includes(ROLES.SUPER_ADMIN) ||
    roles.includes(ROLES.ADMIN_L2) ||
    roles.includes(ROLES.ADMIN_L3);

  useEffect(() => {
    // شرط خروج سریع: سوکت هنوز آماده نیست یا کاربر دسترسی ندارد
    if (!echoInstance || !hasAdminAccess) return;

    const channelName = "super-admin-global";
    const channel = echoInstance.private(channelName);

    console.log(`📡 [Admin Socket] Subscribing to: ${channelName}`);

    const handleEvent = (eventName: string, incomingData: any) => {
      console.log(`🔔 [Admin Socket] Event: ${eventName}`, incomingData);

      let payload = incomingData;
      // هندلینگ داده‌های string شده (گاهی لاراول جیسون string می‌فرستد)
      if (typeof incomingData === "string") {
        try {
          payload = JSON.parse(incomingData);
        } catch (e) {
          console.error(e);
        }
      }
      payload = payload.data || payload.payload || payload;

      // Debounce ساده برای جلوگیری از نوتیفیکیشن تکراری در میلی‌ثانیه
      const uniqueKey = `${payload.timestamp || Date.now()}_${
        payload.pending_images_count || Math.random()
      }`;
      if (processedEventIds.current.has(uniqueKey)) return;

      processedEventIds.current.add(uniqueKey);
      setTimeout(() => processedEventIds.current.delete(uniqueKey), 5000);

      // نمایش پیام
      const message = payload.message || "درخواست جدید تصویر دریافت شد.";
      const count = payload.pending_images_count || 1;

      toast.info(`📸 ${message} (تعداد: ${count})`, {
        position: "bottom-left",
        autoClose: 7000,
        toastId: uniqueKey, // جلوگیری از تکرار توسط خود Toastify
        onClick: () => {
          queryClient.invalidateQueries({ queryKey: requestKeys.all });
        },
      });

      // آپدیت دیتا
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    };

    const eventVariations = [
      "images.pending",
      ".images.pending", // دات اول برای لاراول اکو مهم است
      "App\\Events\\images.pending",
      "images.new",
    ];

    eventVariations.forEach((evt) => {
      channel.listen(evt, (data: any) => handleEvent(evt, data));
    });

    return () => {
      console.log(`🛑 [Admin Socket] Leaving channel: ${channelName}`);
      eventVariations.forEach((evt) => channel.stopListening(evt));
      echoInstance.leave(channelName);
    };
  }, [hasAdminAccess, queryClient, echoInstance]); // فقط وقتی echoInstance تغییر کرد (یعنی وصل شد) اجرا می‌شود
};
