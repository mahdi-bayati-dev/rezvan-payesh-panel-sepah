import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { userKeys } from "@/features/User/hooks/hook";
import type Echo from "laravel-echo";

/**
 * هوک دریافت نتیجه تایید/رد عکس پروفایل
 * نسخه فیکس شده: حل مشکل Race Condition و هندلینگ JSON
 */
export const useImageNotificationSocket = () => {
  const user = useAppSelector(selectUser);
  const queryClient = useQueryClient();

  // ✅ اضافه شدن استیت برای نگهداری اینستنس سوکت
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);
  
  const processedEventIds = useRef<Set<string>>(new Set());

  /**
   * ۱. اثر جانبی برای انتظار اتصال سوکت (Polling)
   * دقیقاً مثل هوک ادمین، اینجا هم صبر می‌کنیم تا سوکت آماده شود.
   */
  useEffect(() => {
    // اگر همین الان وصل است
    const initialEcho = getEcho();
    if (initialEcho) {
      setEchoInstance(initialEcho);
      return;
    }

    // اگر نه، چک کردن دوره‌ای
    const intervalId = setInterval(() => {
      const echo = getEcho();
      if (echo) {
        console.log("🔌 [User Socket] Echo instance found via polling.");
        setEchoInstance(echo);
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  /**
   * ۲. لاجیک اصلی اتصال به کانال‌ها
   * وابسته به echoInstance (که حالا مطمئنیم پر شده)
   */
  useEffect(() => {
    if (!user || !echoInstance) return;

    // کانال‌های احتمالی
    const channelNames = [
      `App.User.${user.id}`, 
      `App.Models.User.${user.id}`, 
    ];

    console.log("📡 [User Socket] Connecting channels:", channelNames);

    // --- تابع هندلر مرکزی ---
    const handleEvent = (eventName: string, incomingData: any) => {
      console.log(`🚀 [User Socket] Event: ${eventName}`, incomingData);

      // الف) پارس کردن دیتا
      let payload = incomingData;

      if (typeof incomingData === "string") {
        try {
          payload = JSON.parse(incomingData);
        } catch (e) {
          console.error("⚠️ [User Socket] JSON Parse Error 1", e);
        }
      } 
      else if (incomingData?.data && typeof incomingData.data === "string") {
        try {
          payload = { ...incomingData, ...JSON.parse(incomingData.data) };
        } catch (e) {
          console.error("⚠️ [User Socket] JSON Parse Error 2", e);
        }
      }

      // ب) جلوگیری از تکرار
      const uniqueId = `${eventName}-${JSON.stringify(payload.message || payload)}`;
      if (processedEventIds.current.has(uniqueId)) return;

      processedEventIds.current.add(uniqueId);
      setTimeout(() => processedEventIds.current.delete(uniqueId), 3000);

      // ج) استخراج وضعیت و پیام
      // هندلینگ حالتی که status داخل payload.data باشد یا مستقیم در payload
      const status = payload.status || payload.data?.status; 
      const message = payload.message || payload.data?.message;

      // د) نمایش نوتیفیکیشن
      const isRejected = status === "rejected" || status === "error" || String(eventName).toLowerCase().includes("rejected");
      const isApproved = status === "approved" || String(eventName).toLowerCase().includes("approved");

      if (isRejected) {
        toast.error(message || "تصویر تایید نشد.", { toastId: uniqueId });
      } else if (isApproved) {
        toast.success(message || "تصویر تایید شد.", { toastId: uniqueId });
        
        // رفرش کردن اطلاعات کاربر
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        if (message) toast.info(message, { toastId: uniqueId });
      }
    };

    // لیست نام‌های احتمالی ایونت
    const eventVariations = [
      "image.status",
      ".image.status",
      "App\\Events\\image.status",
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
    ];

    // اتصال
    channelNames.forEach((channelName) => {
      const channel = echoInstance.private(channelName);

      eventVariations.forEach((evt) => {
        channel.listen(evt, (data: any) => handleEvent(evt, data));
      });
    });

    return () => {
      console.log("🛑 [User Socket] Disconnecting channels");
      channelNames.forEach((name) => echoInstance.leave(name));
    };
  }, [user, queryClient, echoInstance]); // ✅ echoInstance به عنوان وابستگی
};