/**
 * features/requests/hook/useLeaveRequestSocket.ts
 * * این هوک سفارشی مسئولیت مدیریت کامل اتصال به وب‌سوکت‌های مربوط به درخواست‌های مرخصی را بر عهده دارد.
 * وظایف:
 * 1. اتصال به کانال‌های خصوصی کاربر و ادمین
 * 2. گوش دادن به رویدادهای ثبت و پردازش درخواست
 * 3. آپدیت کردن React Query Cache به صورت Real-time (لیست + شمارنده بج)
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ایمپورت‌های پروژه
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { type LeaveRequest, type ApiPaginatedResponse, type User } from "../types";
import { LEAVE_REQUESTS_QUERY_KEY } from "./useLeaveRequests";
// ✅ ایمپورت کلید شمارنده
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

    /**
     * رفرش کردن شمارنده بج در سایدبار
     */
    const refreshBadgeCount = () => {
      console.log("[WebSocket] Refreshing Pending Count Badge...");
      queryClient.invalidateQueries({
        queryKey: [LEAVE_REQUESTS_QUERY_KEY, PENDING_COUNT_QUERY_KEY]
      });
    };

    /**
     * آپدیت لیست اصلی
     */
    const updateQueryCache = (updatedRequest: LeaveRequest) => {
        console.log(`[WebSocket] Event: .leave_request.processed`, updatedRequest);
        toast.info(`درخواست شماره ${updatedRequest.id} ${updatedRequest.status === 'approved' ? 'تایید' : 'رد'} شد.`);

        // ✅ ۱. همیشه شمارنده را رفرش کن (چون وضعیت درخواست عوض شده)
        refreshBadgeCount();

        // ۲. اگر queryParams پاس داده شده (یعنی داخل صفحه لیست هستیم)، لیست را آپدیت کن
        if (queryParams) {
            queryClient.setQueryData(
                [LEAVE_REQUESTS_QUERY_KEY, "list", queryParams],
                (oldData: ApiPaginatedResponse<LeaveRequest> | undefined) => {
                if (!oldData) return oldData;
                const index = oldData.data.findIndex(r => r.id === updatedRequest.id);
                if (index !== -1) {
                    const newData = [...oldData.data];
                    newData[index] = updatedRequest;
                    return { ...oldData, data: newData };
                }
                queryClient.invalidateQueries({ queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"] });
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
        const requesterName = `${request.employee.first_name} ${request.employee.last_name}`;
        toast.info(`درخواست جدیدی توسط ${requesterName} ثبت شد.`);
        
        // ✅ ۱. همیشه شمارنده را رفرش کن (چون درخواست جدید اضافه شده)
        refreshBadgeCount();
      }

      // ۲. اگر در صفحه لیست هستیم، لیست را رفرش کن
      if (queryParams) {
          console.log("[WebSocket] Invalidating list...");
          queryClient.invalidateQueries({
            queryKey: [LEAVE_REQUESTS_QUERY_KEY, "list"],
          });
      }
    };


    // --- اتصال به کانال‌ها (مشابه قبل) ---
    
    const roles = currentUser.roles || [];
    const isSuperAdmin = roles.includes("super_admin");
    const isL2Admin = roles.includes("org-admin-l2");
    const isL3Admin = roles.includes("org-admin-l3");
    const orgId = currentUser.employee?.organization?.id;

    const userChannelName = `user.${currentUser.id}`; 
    const adminChannelsToListen: string[] = [];

    if (isSuperAdmin) adminChannelsToListen.push('super-admin-global');
    else if (orgId) {
      if (isL3Admin) adminChannelsToListen.push(`l3-channel.${orgId}`);
      if (isL2Admin) adminChannelsToListen.push(`l2-channel.${orgId}`);
    }

    // اشتراک یوزر
    const userChannel = echo.private(userChannelName);
    userChannel.listen(".leave_request.processed", (e: { request: LeaveRequest }) =>
        updateQueryCache(e.request)
    );

    // اشتراک ادمین
    adminChannelsToListen.forEach(channelName => {
        const channel = echo.private(channelName);
        channel.listen(".leave_request.submitted", (e: { request: LeaveRequest }) =>
          invalidateList(".leave_request.submitted", e.request)
        );
        channel.listen(".leave_request.processed", (e: { request: LeaveRequest }) => {
          updateQueryCache(e.request);
        });
    });

    return () => {
      echo.leave(userChannelName);
      adminChannelsToListen.forEach(ch => echo.leave(ch));
    };

  }, [currentUser, queryClient, queryParams]); // وابستگی‌ها
};