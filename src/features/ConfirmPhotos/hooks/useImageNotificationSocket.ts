import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { userKeys } from "@/features/User/hooks/hook";

export const useImageNotificationSocket = () => {
  const user = useAppSelector(selectUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    const echo = getEcho();
    if (!user || !echo) return;

    // طبق مستندات PDF: Channel -> App.Models.User.{id}
    const channelName = `App.Models.User.${user.id}`;

    // نام ایونت لاراول (NotificationCreated)
    // معمولا لاراول ایونت‌ها را با Namespace کامل می‌فرستد مگر اینکه broadcastAs داشته باشد.
    // اینجا فرض بر استاندارد لاراول است:
    const eventName =
      ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated";

    const channel = echo.private(channelName);

    channel.listen(eventName, (e: any) => {
      console.log("🔔 Image Notification:", e);

      // طبق فرمت PDF:
      // { title: "...", message: "...", status: "rejected/approved", type: "error/info" }

      if (e.status === "rejected") {
        toast.error(e.message || "تصویر شما رد شد.");
      } else if (e.status === "approved") {
        toast.success(e.message || "تصویر شما تایید شد.");
        // رفرش کردن پروفایل برای نمایش عکس جدید
        queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) });
      }
    });

    return () => {
      channel.stopListening(eventName);
    };
  }, [user, queryClient]);
};
