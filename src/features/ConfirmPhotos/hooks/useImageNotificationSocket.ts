import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEcho } from "@/hook/useEcho";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { userKeys } from "@/features/User/hooks/hook";

/**
 * هوک دریافت نتیجه تایید/رد عکس پروفایل (مخصوص کاربر جاری)
 * وضعیت: اصلاح شده و Clean Code
 */
export const useImageNotificationSocket = () => {
  const user = useAppSelector(selectUser);
  const queryClient = useQueryClient();

  // ✅ استفاده از هوک مرکزی و استاندارد useEcho
  const echoInstance = useEcho();

  const processedEventIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // شرط خروج سریع: اگر کاربر نیست یا سوکت هنوز آماده نشده
    if (!user || !echoInstance) return;

    /**
     * 🚩 اصلاح مهم:
     * قبلاً اینجا دو کانال بود که باعث خطای 403 می‌شد.
     * طبق لاگ سرور، نام صحیح کانال 'App.User.{id}' است.
     * کانال 'App.Models.User.{id}' حذف شد چون وجود خارجی ندارد.
     */
    const channelName = `App.User.${user.id}`;

    console.log(`📡 [User Socket] Subscribing to: ${channelName}`);

    // --- هندلر مدیریت پیام ---
    const handleEvent = (eventName: string, incomingData: any) => {
      // الف) پارس کردن دیتا (گاهی لاراول جیسون را به صورت string می‌فرستد)
      let payload = incomingData;
      if (typeof incomingData === "string") {
        try {
          payload = JSON.parse(incomingData);
        } catch (e) {
          console.error(e);
        }
      } else if (incomingData?.data && typeof incomingData.data === "string") {
        try {
          payload = { ...incomingData, ...JSON.parse(incomingData.data) };
        } catch (e) {
          console.error(e);
        }
      }

      // ب) جلوگیری از نمایش تکراری (Debouncing)
      const uniqueId = `${eventName}-${JSON.stringify(
        payload.message || payload
      )}`;
      if (processedEventIds.current.has(uniqueId)) return;

      processedEventIds.current.add(uniqueId);
      setTimeout(() => processedEventIds.current.delete(uniqueId), 3000);

      // ج) استخراج وضعیت
      const status = payload.status || payload.data?.status;
      const message = payload.message || payload.data?.message;

      const isRejected =
        status === "rejected" ||
        String(eventName).toLowerCase().includes("rejected");
      const isApproved =
        status === "approved" ||
        String(eventName).toLowerCase().includes("approved");

      // د) نمایش نوتیفیکیشن
      if (isRejected) {
        toast.error(message || "تصویر پروفایل شما تایید نشد.", {
          toastId: uniqueId,
        });
      } else if (isApproved) {
        toast.success(message || "تصویر پروفایل شما تایید شد.", {
          toastId: uniqueId,
        });
        // رفرش کردن کش اطلاعات کاربر برای نمایش عکس جدید
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        if (message) toast.info(message, { toastId: uniqueId });
      }
    };

    // لیست ایونت‌های احتمالی که بکند ممکن است صدا بزند
    const eventVariations = [
      "image.status",
      ".image.status", // دات برای Namespace لاراول مهم است
      "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
      ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
    ];

    // اتصال به کانال
    const channel = echoInstance.private(channelName);

    eventVariations.forEach((evt) => {
      channel.listen(evt, (data: any) => handleEvent(evt, data));
    });

    // پاکسازی (Cleanup) هنگام Unmount
    return () => {
      // console.log(`🛑 [User Socket] Leaving channel: ${channelName}`);
      eventVariations.forEach((evt) => channel.stopListening(evt));
      echoInstance.leave(channelName);
    };
  }, [user, queryClient, echoInstance]);
};
