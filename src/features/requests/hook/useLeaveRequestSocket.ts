/**
 * features/requests/hook/useLeaveRequestSocket.ts
 * * این هوک سفارشی مسئولیت مدیریت کامل اتصال به وب‌سوکت‌های مربوط به درخواست‌های مرخصی را بر عهده دارد.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ایمپورت‌های پروژه
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  type LeaveRequest,
  type ApiPaginatedResponse,
  type User,
} from "../types";
import { LEAVE_REQUESTS_QUERY_KEY } from "./useLeaveRequests";
import { PENDING_COUNT_QUERY_KEY } from "@/features/requests/hook/usePendingRequestsCount";

export const useLeaveRequestSocket = (queryParams?: any) => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectUser) as User | null;

  useEffect(() => {
    const echo = getEcho();
    if (!currentUser || !echo) {
      return;
    }

    // --- توابع کمکی ---

    const refreshBadgeCount = () => {
      console.log("[WebSocket] Refreshing Pending Count Badge...");
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, PENDING_COUNT_QUERY_KEY],
      });
    };

    const updateQueryCache = (updatedRequest: LeaveRequest) => {
      // ... (این بخش بدون تغییر باقی می‌ماند)
      console.log(
        `[WebSocket] Event: .leave_request.processed`,
        updatedRequest
      );

      // ✅ جلوگیری از توست تکراری برای پردازش‌کننده:
      // اگر کسی که درخواست را تایید/رد کرده خود کاربر جاری است، توست سوکت را نشان نده
      // (چون توست API در onSuccess نمایش داده شده است)
      const isProcessor = updatedRequest.processor?.id === currentUser.id;

      if (!isProcessor) {
        toast.info(
          `درخواست شماره ${updatedRequest.id} ${
            updatedRequest.status === "approved" ? "تایید" : "رد"
          } شد.`
        );
      }

      refreshBadgeCount();

      if (queryParams) {
        queryClient.setQueryData(
          [LEAVE_REQUESTS_QUERY_KEY, "list", queryParams],
          (oldData: ApiPaginatedResponse<LeaveRequest> | undefined) => {
            if (!oldData) return oldData;

            // اگر فیلتر وضعیت داریم و وضعیت جدید با فیلتر نمیخونه، حذفش کن
            if (
              queryParams.status &&
              queryParams.status !== updatedRequest.status
            ) {
              const newData = oldData.data.filter(
                (r) => r.id !== updatedRequest.id
              );
              return {
                ...oldData,
                data: newData,
                meta: { ...oldData.meta, total: oldData.meta.total - 1 },
              };
            }

            const index = oldData.data.findIndex(
              (r) => r.id === updatedRequest.id
            );
            if (index !== -1) {
              const newData = [...oldData.data];
              newData[index] = updatedRequest;
              return { ...oldData, data: newData };
            }
            // queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"] }); // اختیاری
            return oldData;
          }
        );
        queryClient.setQueryData(
          [LEAVE_REQUESTS_QUERY_KEY, "detail", updatedRequest.id],
          { data: updatedRequest }
        );
      }
    };

    const invalidateList = (eventName: string, request: LeaveRequest) => {
      console.log(`[WebSocket] Event: ${eventName}`, request);

      if (eventName === ".leave_request.submitted") {
        // ✅✅✅ [اصلاحیه مهم] جلوگیری از توست تکراری
        // چک می‌کنیم آیا کسی که درخواست داده (request.employee) همان کاربر لاگین شده (currentUser.employee) است؟
        const isMyOwnRequest = request.employee.id === currentUser.employee?.id;

        if (isMyOwnRequest) {
          // اگر درخواست خودم بود:
          // ۱. توست نشان نده (چون API قبلا نشان داده)
          // ۲. فقط بج و لیست را رفرش کن تا دیتای جدید را ببینم
          console.log("Ignoring socket toast for own request.");
        } else {
          // اگر درخواست شخص دیگری بود، به ادمین اطلاع بده
          const requesterName = `${request.employee.first_name} ${request.employee.last_name}`;
          toast.info(`درخواست جدیدی توسط ${requesterName} ثبت شد.`);
        }

        refreshBadgeCount();
      }

      // ۲. رفرش لیست
      if (queryParams) {
        console.log("[WebSocket] Invalidating list...");
        queryClient.invalidateQueries({
          queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
        });
      }
    };

    // --- اتصال به کانال‌ها ---

    const roles = currentUser.roles || [];
    const isSuperAdmin = roles.includes("super_admin");
    const isL2Admin = roles.includes("org-admin-l2");
    const isL3Admin = roles.includes("org-admin-l3");
    const orgId = currentUser.employee?.organization?.id;

    const userChannelName = `user.${currentUser.id}`;
    const adminChannelsToListen: string[] = [];

    if (isSuperAdmin) adminChannelsToListen.push("super-admin-global");
    else if (orgId) {
      if (isL3Admin) adminChannelsToListen.push(`l3-channel.${orgId}`);
      if (isL2Admin) adminChannelsToListen.push(`l2-channel.${orgId}`);
    }

    // اشتراک یوزر (برای دریافت نتیجه درخواست‌های خودش)
    const userChannel = echo.private(userChannelName);
    userChannel.listen(
      ".leave_request.processed",
      (e: { request: LeaveRequest }) => updateQueryCache(e.request)
    );

    // اشتراک ادمین (برای دریافت درخواست‌های جدید دیگران)
    adminChannelsToListen.forEach((channelName) => {
      const channel = echo.private(channelName);
      channel.listen(
        ".leave_request.submitted",
        (e: { request: LeaveRequest }) =>
          invalidateList(".leave_request.submitted", e.request)
      );
      channel.listen(
        ".leave_request.processed",
        (e: { request: LeaveRequest }) => {
          updateQueryCache(e.request);
        }
      );
    });

    return () => {
      echo.leave(userChannelName);
      adminChannelsToListen.forEach((ch) => echo.leave(ch));
    };
  }, [currentUser, queryClient, queryParams]);
};
