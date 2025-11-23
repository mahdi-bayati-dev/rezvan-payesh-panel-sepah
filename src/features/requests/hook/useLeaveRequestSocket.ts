import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echoService";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  type LeaveRequest,
  type ApiPaginatedResponse,
  type User,
} from "../types";
import { LEAVE_REQUESTS_QUERY_KEY } from "./useLeaveRequests";

/**
 * این هوک مخصوص صفحه لیست درخواست‌هاست.
 * وظیفه: آپدیت آنی (Real-time) جدول بدون رفرش صفحه.
 */
export const useLeaveRequestSocket = (queryParams?: any) => {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(selectUser) as User | null;

  // دریافت اینستنس اکو
  const echo = getEcho();

  useEffect(() => {
    if (!currentUser || !echo) return;

    // --- تابع آپدیت Optimistic ---
    const handleUpdateList = (updatedRequest: LeaveRequest) => {
      if (!queryParams) return;

      console.log("⚡ [Socket List Update] Event Received:", updatedRequest);

      queryClient.setQueryData(
        [LEAVE_REQUESTS_QUERY_KEY, "list", queryParams],
        (oldData: ApiPaginatedResponse<LeaveRequest> | undefined) => {
          if (!oldData) return oldData;

          const exists = oldData.data.find((r) => r.id === updatedRequest.id);

          const matchesStatusFilter =
            !queryParams.status || 
            queryParams.status === updatedRequest.status;

          // ۱. حذف: اگر آیتم هست ولی با فیلتر نمی‌خواند
          if (exists && !matchesStatusFilter) {
            return {
              ...oldData,
              data: oldData.data.filter((r) => r.id !== updatedRequest.id),
              meta: {
                ...oldData.meta,
                total: Math.max(0, oldData.meta.total - 1),
              },
            };
          }

          // ۲. آپدیت: اگر آیتم هست و با فیلتر می‌خواند
          if (exists && matchesStatusFilter) {
            return {
              ...oldData,
              data: oldData.data.map((r) =>
                r.id === updatedRequest.id ? updatedRequest : r
              ),
            };
          }

          // ۳. افزودن: اگر آیتم نیست و با فیلتر می‌خواند (در صفحه اول)
          if (!exists && queryParams.page === 1 && matchesStatusFilter) {
            return {
              ...oldData,
              data: [updatedRequest, ...oldData.data].slice(
                0,
                oldData.meta.per_page
              ),
              meta: { ...oldData.meta, total: oldData.meta.total + 1 },
            };
          }

          return oldData;
        }
      );
    };

    // --- اتصال به کانال‌ها ---
    const roles = currentUser.roles || [];
    
    // ✅ اصلاح مهم: نام کانال باید دقیقاً با channels.php یکی باشد (App.User)
    const userChannelName = `App.User.${currentUser.id}`;
    const channels: string[] = [userChannelName];

    const isSuperAdmin = roles.includes("super_admin");
    const orgId = currentUser.employee?.organization?.id;

    if (isSuperAdmin) channels.push("super-admin-global");
    else if (orgId) {
      if (roles.includes("org-admin-l2")) channels.push(`l2-channel.${orgId}`);
      if (roles.includes("org-admin-l3")) channels.push(`l3-channel.${orgId}`);
    }

    console.log("🎧 [UseLeaveRequestSocket] Subscribing to:", channels);

    // --- تعریف لیسنرها ---
    const onEvent = (e: { request: LeaveRequest }) =>
      handleUpdateList(e.request);

    // اتصال
    channels.forEach((chName) => {
      echo.private(chName).listen(".leave_request.processed", onEvent);

      // برای کانال‌های غیر شخصی (مدیریتی)، سابمیت جدید هم باید لیست را آپدیت کند
      if (chName !== userChannelName) {
        echo.private(chName).listen(".leave_request.submitted", onEvent);
      }
    });

    // --- Cleanup ---
    return () => {
      channels.forEach((chName) => {
        const ch = echo.private(chName);
        ch.stopListening(".leave_request.processed", onEvent);
        ch.stopListening(".leave_request.submitted", onEvent);
      });
    };
  }, [currentUser, queryClient, queryParams, echo]);
};