import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { userKeys } from "@/features/User/hooks/hook";

/**
 * هوک هوشمند و تضمینی برای دریافت نتیجه تایید/رد عکس پروفایل
 * مجهز به تکنیک Raw Binding برای رفع مشکل نام‌گذاری ایونت‌ها
 */
export const useImageNotificationSocket = () => {
  const user = useAppSelector(selectUser);
  const queryClient = useQueryClient();

  // جلوگیری از نمایش تکراری (Deduplication)
  const processedEventIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const echo = getEcho();
    if (!user || !echo) return;

    // ۱. لیست کانال‌های احتمالی کاربر
    // طبق اسکرین‌شات شما: App.User.{id} کانال صحیح است، اما برای اطمینان هر دو را چک می‌کنیم
    const channelNames = [
      `App.User.${user.id}`, // کانال مشاهده شده در اسکرین‌شات
      `App.Models.User.${user.id}`, // استاندارد جدید لاراول
    ];

    console.log("📡 [User Socket] Connecting to channels:", channelNames);

    // --- تابع پردازش مرکزی پیام ---
    const handleSocketData = (source: string, eventName: string, data: any) => {
      // ساخت شناسه یکتا برای جلوگیری از پردازش تکراری
      const uniqueId = `${eventName}-${JSON.stringify(data)}`; // یا استفاده از timestamp اگر موجود باشد

      if (processedEventIds.current.has(uniqueId)) return;

      console.log(`🚀 [User Socket] Event Caught via [${source}]`, {
        eventName,
        data,
      });

      // ثبت در حافظه موقت
      processedEventIds.current.add(uniqueId);
      setTimeout(() => processedEventIds.current.delete(uniqueId), 2000);

      // نرمال‌سازی دیتا (استخراج از لایه‌های مختلف)
      const rawData = data.data || data.request || data;
      const status = rawData.status || data.status;
      const message = rawData.message || data.message;

      // اگر هیچ پیامی نبود، احتمالا ایونت مربوط به ما نیست
      if (!status && !message) return;

      // منطق تشخیص وضعیت
      const isApproved =
        status === "approved" ||
        status === "approve" ||
        String(eventName).toLowerCase().includes("approved");

      const isRejected =
        status === "rejected" ||
        status === "reject" ||
        String(eventName).toLowerCase().includes("rejected");

      if (isRejected) {
        toast.error(message || "متاسفانه تصویر پروفایل شما رد شد.", {
          toastId: uniqueId,
        });
      } else if (isApproved) {
        toast.success(message || "تبریک! تصویر پروفایل شما تایید شد.", {
          toastId: uniqueId,
        });

        // رفرش کردن کش کاربر برای نمایش عکس جدید
        console.log("🔄 [User Socket] Refreshing User Profile...");
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        // پیام‌های عمومی
        if (message) toast.info(message, { toastId: uniqueId });
      }
    };

    channelNames.forEach((channelName) => {
      const channel = echo.private(channelName);

      // --- روش تضمینی: Raw Binding ---
      // این قسمت مستقیماً به هسته Pusher وصل می‌شود
      setTimeout(() => {
        if (channel.subscription) {
          channel.subscription.bind_global((eventName: string, data: any) => {
            // ایونت‌های سیستمی Pusher را نادیده بگیر
            if (eventName.startsWith("pusher:")) return;
            if (eventName.startsWith("internal:")) return;

            // لاگ کردن همه چیز برای دیباگ (فقط در کنسول)
            console.log(
              `🕵️ [User Socket DEBUG] Raw Event on ${channelName}:`,
              eventName,
              data
            );

            // فیلتر کردن ایونت‌های مربوط به عکس
            // اگر کلمه image یا profile یا notification در اسم ایونت یا دیتا بود، پردازش کن
            const isRelevant =
              eventName.toLowerCase().includes("image") ||
              eventName.toLowerCase().includes("profile") ||
              eventName.includes("Notification") ||
              (data &&
                (data.status === "approved" || data.status === "rejected"));

            if (isRelevant) {
              handleSocketData("RAW BINDING", eventName, data);
            }
          });
        }
      }, 1000);

      // --- روش استاندارد (برای اطمینان) ---
      // لیست ایونت‌های رایج را هم گوش می‌دهیم
      const commonEvents = [
        ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
        "images.processed",
        ".images.processed",
      ];

      commonEvents.forEach((evt) => {
        channel.listen(evt, (data: any) =>
          handleSocketData("Standard Listener", evt, data)
        );
      });
    });

    return () => {
      channelNames.forEach((name) => echo.leave(name));
      console.log("🛑 [User Socket] Disconnected");
    };
  }, [user, queryClient]);
};
