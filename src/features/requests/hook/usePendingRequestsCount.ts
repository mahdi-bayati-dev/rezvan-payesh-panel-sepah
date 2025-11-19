/**
 * features/requests/hook/usePendingRequestsCount.ts
 * این هوک صرفاً برای دریافت تعداد کل درخواست‌های "در انتظار" طراحی شده است.
 * از این هوک در Sidebar یا Header برای نمایش Badge استفاده می‌شود.
 */
import { useQuery } from "@tanstack/react-query";
import { getLeaveRequests } from "../api/api-requests";
import { LEAVE_REQUESTS_QUERY_KEY } from "./useLeaveRequests";
import { useAppSelector } from "@/hook/reduxHooks";
import { selectUser } from "@/store/slices/authSlice";
import { type User } from "../types";

// کلید اختصاصی برای کش کانت
export const PENDING_COUNT_QUERY_KEY = "pendingRequestsCount";

export const usePendingRequestsCount = () => {
  const currentUser = useAppSelector(selectUser) as User | null;

  // بررسی دسترسی: فقط مدیران و سوپر ادمین‌ها نیاز به دیدن تعداد کل دارند
  // کاربران عادی فقط تعداد درخواست‌های خودشان را می‌بینند (که باز هم منطقش همین است)
  const shouldFetch = !!currentUser;

  return useQuery({
    queryKey: [LEAVE_REQUESTS_QUERY_KEY, PENDING_COUNT_QUERY_KEY],
    queryFn: async () => {
      // ترفند بهینه‌سازی:
      // ما فقط به تعداد نیاز داریم، پس per_page=1 را ست می‌کنیم تا دیتای اضافی نگیریم.
      // و status=pending را فیلتر می‌کنیم.
      const response = await getLeaveRequests({
        page: 1,
        per_page: 1,
        status: "pending",
      });
      return response;
    },
    enabled: shouldFetch,
    // فقط تعداد کل (total) را برمی‌گردانیم
    select: (data) => data.meta.total,
    // این دیتا نیاز نیست خیلی زود بیات شود (مثلا ۵ دقیقه یا تا زمانی که سوکت آپدیتش کند)
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: true,
  });
};