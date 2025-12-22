import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useEcho } from "@/hook/useEcho";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUserRoles, selectUser } from "@/store/slices/authSlice";
import { requestKeys } from "./useImageRequests";
import { ROLES } from "@/constants/roles";

/**
 * هوک دریافت نوتیفیکیشن‌های ادمین برای تصاویر جدید
 * رفع خطا: استفاده از آندرسکور برای متغیرهای استفاده نشده جهت پاس کردن Build
 */
export const useAdminImageSocket = () => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectUser);
  const roles = useAppSelector(selectUserRoles) || [];

  const echoInstance = useEcho();
  const processedEventIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!echoInstance || !currentUser) return;

    const orgId = currentUser.employee?.organization?.id;
    const adminChannels: string[] = [];

    // منطق تفکیک کانال‌ها
    if (roles.includes(ROLES.SUPER_ADMIN)) {
      adminChannels.push("super-admin-global");
    }

    if (orgId) {
      if (roles.includes(ROLES.ADMIN_L2)) {
        adminChannels.push(`l2-channel.${orgId}`);
      }
      if (roles.includes(ROLES.ADMIN_L3)) {
        adminChannels.push(`l3-channel.${orgId}`);
      }
    }

    if (adminChannels.length === 0) return;

    // تابع هندل کردن رویداد - eventName با آندرسکور مشخص شد
    const handleEvent = (_eventName: string, incomingData: any) => {
      let payload = incomingData;
      if (typeof incomingData === "string") {
        try {
          payload = JSON.parse(incomingData);
        } catch (e) {
          console.error(e);
        }
      }
      payload = payload.data || payload.payload || payload;

      const uniqueKey = `${payload.timestamp || Date.now()}_${
        payload.pending_images_count || Math.random()
      }`;
      if (processedEventIds.current.has(uniqueKey)) return;
      processedEventIds.current.add(uniqueKey);

      setTimeout(() => processedEventIds.current.delete(uniqueKey), 5000);

      toast.info(`📸 ${payload.message || "درخواست جدید تصویر دریافت شد."}`, {
        position: "bottom-left",
        autoClose: 7000,
        toastId: uniqueKey,
        onClick: () =>
          queryClient.invalidateQueries({ queryKey: requestKeys.all }),
      });

      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    };

    const eventVariations = ["images.pending", ".images.pending"];

    adminChannels.forEach((chName) => {
      const channel = echoInstance.private(chName);
      eventVariations.forEach((evt) => {
        channel.listen(evt, (data: any) => handleEvent(evt, data));
      });
    });

    return () => {
      adminChannels.forEach((chName) => {
        const channel = echoInstance.private(chName);
        eventVariations.forEach((evt) => channel.stopListening(evt));
        echoInstance.leave(chName);
      });
    };
  }, [currentUser, roles, queryClient, echoInstance]);
};
