import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { type ActivityLog, type ApiAttendanceLog } from "../types";
import { mapApiLogToActivityLog } from "../utils/dataMapper";
import { reportKeys } from "./hook";
import { type LogFilters, type MyLogFilters } from "../api/api";
import { type User } from "@/features/requests/types";
import Echo from "laravel-echo";

type SocketFilters = LogFilters | MyLogFilters;

export const useReportSocket = (currentFilters: SocketFilters) => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectUser) as User | null;
  const filtersRef = useRef(currentFilters);

  // ۱. نگهداری اینستنس اکو در State
  const [echoInstance, setEchoInstance] = useState<Echo<any> | null>(null);

  useEffect(() => {
    filtersRef.current = currentFilters;
  }, [currentFilters]);

  // ۲. این افکت منتظر می‌ماند تا Echo آماده شود (Polling)
  useEffect(() => {
    // اگر همان لحظه اول آماده بود
    const echo = getEcho();
    if (echo) {
      setEchoInstance(echo);
      return;
    }

    // اگر آماده نبود، هر ۵۰۰ میلی‌ثانیه چک کن
    const intervalId = setInterval(() => {
      const foundEcho = getEcho();
      if (foundEcho) {
        setEchoInstance(foundEcho);
        clearInterval(intervalId); // وقتی پیدا شد، تایمر متوقف شود
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  // ۳. افکت اصلی سابسکرایب (حالا به echoInstance وابسته است)
  useEffect(() => {
    if (!currentUser || !echoInstance) return;

    const handleNewLog = (event: { log: ApiAttendanceLog }) => {
      console.log("⚡ [Report Socket] Event Received:", event);

      if (!event.log) return;

      const newLog = mapApiLogToActivityLog(event.log);
      const isSelf = newLog.employee.id === currentUser.employee?.id;

      if (isSelf) {
        const typeText = newLog.activityType === "entry" ? "ورود" : "خروج";
        toast.success(`✅ ثبت شد: ${typeText} شما در ساعت ${newLog.time}`);
      }

      const updateListCache = (queryKey: readonly unknown[]) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) return oldData;
          // جلوگیری از تکرار
          if (oldData.data.some((log: ActivityLog) => log.id === newLog.id)) {
            return oldData;
          }
          const newData = [newLog, ...oldData.data];
          const perPage = filtersRef.current.per_page || 10;
          if (newData.length > perPage) {
            newData.pop();
          }
          return {
            ...oldData,
            data: newData,
            meta: {
              ...oldData.meta,
              total: (oldData.meta?.total || 0) + 1,
            },
          };
        });
      };

      // آپدیت لیست کاربر
      if (filtersRef.current.page === 1) {
        updateListCache(reportKeys.myList(filtersRef.current as MyLogFilters));
      }

      // آپدیت لیست ادمین (اگر کاربر ادمین باشد)
      const isSuperAdmin = currentUser.roles.includes("super_admin");
      if (isSuperAdmin && filtersRef.current.page === 1) {
        updateListCache(reportKeys.list(filtersRef.current as LogFilters));
      }
    };

    // --- کانال‌ها ---
    const channels: string[] = [];

    // کانال شخصی (طبق بکند شما App.User.{id})
    const userChannelName = `App.User.${currentUser.id}`;
    channels.push(userChannelName);

    // کانال‌های مدیریتی
    const roles = currentUser.roles || [];
    const orgId = currentUser.employee?.organization?.id;
    const isSuperAdmin = roles.includes("super_admin");

    if (isSuperAdmin) {
      channels.push("super-admin-global");
    } else if (orgId) {
      if (roles.includes("org-admin-l2")) channels.push(`l2-channel.${orgId}`);
      if (roles.includes("org-admin-l3")) channels.push(`l3-channel.${orgId}`);
    }

    console.log("🎧 [Report Socket] Subscribing to:", channels);

    // اتصال به تمام کانال‌ها
    channels.forEach((chName) => {
      echoInstance.private(chName).listen(".attendance.created", handleNewLog);
    });

    // قطع اتصال هنگام خروج از صفحه
    return () => {
      channels.forEach((chName) => {
        if (echoInstance) {
          echoInstance
            .private(chName)
            .stopListening(".attendance.created", handleNewLog);
        }
      });
    };
  }, [currentUser, queryClient, echoInstance]); // مهم: echoInstance به وابستگی‌ها اضافه شد
};
