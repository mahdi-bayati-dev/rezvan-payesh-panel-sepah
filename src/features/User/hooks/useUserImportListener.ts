import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { userKeys } from "./hook";
import { getEcho } from "@/lib/echoService";

interface ImportEventData {
  status: "success" | "error";
  message: string;
  timestamp?: string;
  data?: any;
}

/**
 * هوک هوشمند برای مدیریت پایان عملیات ایمپورت اکسل
 * ✅ آپدیت: اضافه شدن مکانیزم انتظار برای اتصال سوکت
 */
export const useUserImportListener = () => {
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);

  // استیت برای نگهداری اینستنس اکو
  const [echoInstance, setEchoInstance] = useState<any>(null);

  // ۱. افکت برای پیدا کردن و ست کردن اکو (با مکانیزم تلاش مجدد)
  useEffect(() => {
    const checkEcho = () => {
      const echo = getEcho();
      if (echo) {
        setEchoInstance(echo);
        return true;
      }
      return false;
    };

    // بررسی اولیه
    if (checkEcho()) return;

    // اگر هنوز نال بود، هر ۵۰۰ میلی‌ثانیه چک کن تا وصل شود
    const intervalId = setInterval(() => {
      if (checkEcho()) {
        clearInterval(intervalId);
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  // ۲. افکت اصلی برای سابسکرایب کردن
  useEffect(() => {
    // تا زمانی که کاربر یا اکو آماده نیستند، کاری نکن
    if (!user?.id || !echoInstance) {
      return;
    }

    const channelName = `App.User.${user.id}`;
    // نقطه (.) اول اسم حیاتی است برای ایونت‌های کاستوم (broadcastAs)
    const eventName = ".user.import.completed";

    console.log(`🔌 [ImportListener] Subscribing to: ${channelName}`);

    const channel = echoInstance.private(channelName);

    const handleEvent = (event: ImportEventData) => {
      console.log("📩 [ImportListener] Event Received:", event);

      if (event.status === "success") {
        toast.success(
          event.message || "عملیات ایمپورت کاربران با موفقیت انجام شد.",
          {
            position: "bottom-left",
            autoClose: 6000,
            theme: "colored",
          }
        );

        // رفرش لیست
        console.log("🔄 [React Query] Invalidating user lists...");
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      } else {
        toast.error(event.message || "خطا در ایمپورت.", {
          position: "bottom-left",
        });
      }
    };

    channel.listen(eventName, handleEvent);

    return () => {
      console.log(`🔌 [ImportListener] Unsubscribing...`);
      channel.stopListening(eventName);
    };
  }, [user?.id, queryClient, echoInstance]); // وابستگی به echoInstance جدید
};
