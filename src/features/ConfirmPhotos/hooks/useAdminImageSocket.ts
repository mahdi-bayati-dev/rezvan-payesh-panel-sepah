import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles } from "@/store/slices/authSlice";
import { requestKeys } from "./useImageRequests";
import { ROLES } from "@/constants/roles";
import type Echo from "laravel-echo";

/**
 * هوک دریافت نوتیفیکیشن‌های ادمین (درخواست‌های جدید)
 * نسخه فیکس شده: حل مشکل بیلد (تغییر echo به echoInstance)
 */
export const useAdminImageSocket = () => {
  const queryClient = useQueryClient();
  const roles = useAppSelector(selectUserRoles) || [];

  // ✅ فیکس: استفاده از استیت برای نگه داشتن اینستنس سوکت پس از لود شدن
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);

  const processedEventIds = useRef<Set<string>>(new Set());

  const hasAdminAccess =
    roles.includes(ROLES.SUPER_ADMIN) ||
    roles.includes(ROLES.ADMIN_L2) ||
    roles.includes(ROLES.ADMIN_L3);

  /**
   * ۱. اثر جانبی برای انتظار اتصال سوکت
   * مشکل قبلی: هوک قبل از اینکه سوکت وصل شود اجرا می‌شد و خارج می‌شد.
   * راه حل: چک کردن دوره‌ای تا زمانی که getEcho مقدار برگرداند.
   */
  useEffect(() => {
    // اگر همین الان وصل است، ست کن و تمام
    const initialEcho = getEcho();
    if (initialEcho) {
      setEchoInstance(initialEcho);
      return;
    }

    // اگر نه، هر ۵۰۰ میلی‌ثانیه چک کن (Polling)
    const intervalId = setInterval(() => {
      const echo = getEcho();
      if (echo) {
        console.log("🔌 [Admin Socket] Echo instance found via polling.");
        setEchoInstance(echo);
        clearInterval(intervalId); // پیدا شد، تایمر را متوقف کن
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  /**
   * ۲. اتصال به کانال و گوش دادن به ایونت‌ها
   * حالا به جای getEcho() از echoInstance استفاده می‌کنیم که مطمئنیم پر است.
   */
  useEffect(() => {
    // تا زمانی که سوکت وصل نشده یا دسترسی نداریم، کاری نکن
    if (!echoInstance || !hasAdminAccess) return;

    const channelName = "super-admin-global";
    const channel = echoInstance.private(channelName);

    console.log(`📡 [Admin Socket] Subscribing to: ${channelName}`);

    // --- تابع هندلر مرکزی ---
    const handleEvent = (eventName: string, incomingData: any) => {
      console.log(
        `🔔 [Admin Socket] Event Received: ${eventName}`,
        incomingData
      );

      // الف) پارس کردن دیتا
      let payload = incomingData;
      if (typeof incomingData === "string") {
        try {
          payload = JSON.parse(incomingData);
        } catch (e) {
          console.error("⚠️ [Admin Socket] JSON Parse Error:", e);
        }
      }

      // ب) نرمال‌سازی
      payload = payload.data || payload.payload || payload;

      // ج) جلوگیری از تکرار
      const uniqueKey = `${payload.timestamp || Date.now()}_${
        payload.pending_images_count || "evt"
      }`;

      if (processedEventIds.current.has(uniqueKey)) return;

      processedEventIds.current.add(uniqueKey);
      setTimeout(() => processedEventIds.current.delete(uniqueKey), 5000);

      // د) نمایش پیام
      const message = payload.message || "درخواست جدید تصویر دریافت شد.";
      const count = payload.pending_images_count || 1;

      toast.info(`📸 ${message} (تعداد: ${count})`, {
        position: "bottom-left",
        autoClose: 7000,
        toastId: uniqueKey,
        onClick: () => {
          queryClient.invalidateQueries({ queryKey: requestKeys.all });
        },
      });

      // ه) آپدیت لیست
      console.log("🔄 [Admin Socket] Invalidating Queries...");
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    };

    // --- لیست ایونت‌ها ---
    const eventVariations = [
      "images.pending",
      ".images.pending",
      "App\\Events\\images.pending",
      "images.new",
      "images.created",
    ];

    eventVariations.forEach((evt) => {
      channel.listen(evt, (data: any) => handleEvent(evt, data));
    });

    return () => {
      console.log(`🛑 [Admin Socket] Unsubscribing form: ${channelName}`);
      eventVariations.forEach((evt) => channel.stopListening(evt));
      // ✅ فیکس: تغییر echo به echoInstance
      echoInstance.leave(channelName);
    };
  }, [hasAdminAccess, queryClient, echoInstance]); // ✅ echoInstance به وابستگی‌ها اضافه شد
};
