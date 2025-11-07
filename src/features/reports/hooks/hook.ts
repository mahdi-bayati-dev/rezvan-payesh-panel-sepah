// [اصلاح] ۱. ایمپورت keepPreviousData
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  // توابع API
  fetchLogs,
  fetchLogById,
  fetchEmployeeOptions,
  createLog,
  updateLog,
  approveLog,
  // تایپ‌ها
  type LogFilters,
  type CreateLogPayload,
  type UpdateLogPayload,
} from "@/features/reports/api/api";
import { mapApiLogToActivityLog } from "@/features/reports/utils/dataMapper";
import {
  type ApiAttendanceLog,
  //   type ActivityLog,
} from "@/features/reports/types";
import { toast } from "react-toastify";

// (این تایپ برای سادگی در همین فایل تعریف می‌شود)
// این تایپ از کامپوننت جدول (useReactTable) می‌آید
interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

// --- کلیدهای Query (برای مدیریت آسان کش) ---
const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: LogFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string | number) => [...reportKeys.details(), id] as const,
  employees: () => [...reportKeys.all, "employees"] as const,
};

// --- ۱. هوک واکشی لیست گزارش‌ها (برای reportPage.tsx) ---
export const useLogs = (filters: LogFilters) => {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: async () => {
      const collection = await fetchLogs(filters);
      const mappedData = collection.data.map(mapApiLogToActivityLog);
      return {
        data: mappedData,
        meta: collection.meta,
      };
    },
    staleTime: 1000 * 60, // 1 دقیقه staleTime خوب است

    // [بهینه] این برای صفحه‌بندی نرم و روان عالی است، آن را نگه می‌داریم
    placeholderData: keepPreviousData,

    // --- [حذف شد] ---
    // این دو خط حذف می‌شوند چون WebSocket جایگزین آن‌ها می‌شود
    // refetchInterval: 30000,
    // refetchIntervalInBackground: true,
  });
};

// --- ۲. هوک واکشی جزئیات (بدون تغییر) ---
export const useLogDetails = (logId: string | number | undefined) => {
  return useQuery({
    queryKey: reportKeys.detail(logId!),
    queryFn: async () => {
      const apiLog = await fetchLogById(logId!);
      return mapApiLogToActivityLog(apiLog);
    },
    enabled: !!logId,
  });
};

// --- ۳. هوک واکشی لیست کارمندان (بدون تغییر) ---
export const useEmployeeOptions = () => {
  return useQuery({
    queryKey: reportKeys.employees(),
    queryFn: fetchEmployeeOptions,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// --- ۴. هوک ایجاد لاگ (بدون تغییر) ---
export const useCreateLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLogPayload) => createLog(payload),
    onSuccess: () => {
      toast.success("تردد دستی با موفقیت ثبت شد.");
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
    onError: (error) => {
      toast.error(`خطا در ثبت تردد: ${error.message}`);
    },
  });
};

// --- ۵. هوک ویرایش لاگ (بدون تغییر) ---
export const useUpdateLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateLogPayload;
    }) => updateLog({ id, payload }),
    onSuccess: (updatedLog: ApiAttendanceLog) => {
      toast.success("تردد با موفقیت ویرایش شد.");
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      // به‌روزرسانی مستقیم کش جزئیات
      queryClient.setQueryData(
        reportKeys.detail(updatedLog.id),
        mapApiLogToActivityLog(updatedLog)
      );
    },
    onError: (error) => {
      toast.error(`خطا در ویرایش: ${error.message}`);
    },
  });
};

// --- ۶. هوک تأیید لاگ (بدون تغییر) ---
export const useApproveLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string | number) => approveLog(logId),
    onSuccess: (approvedLog: ApiAttendanceLog) => {
      toast.success("تردد با موفقیت تأیید شد.");
      // باطل کردن کش لیست‌ها
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      // آپدیت کش جزئیات
      queryClient.setQueryData(
        reportKeys.detail(approvedLog.id),
        mapApiLogToActivityLog(approvedLog)
      );
    },
    onError: (error) => {
      toast.error(`خطا در تأیید: ${error.message}`);
    },
  });
};

// --- ۷. [اصلاح شده] هوک گزارش‌های کارمند (بدون تغییر) ---
/**
 * هوک سفارشی برای واکشی لاگ‌های یک کارمند خاص
 * (امضا (Signature) تابع اصلاح شد تا pagination را بپذیرد)
 */
export const useEmployeeLogs = (
  employeeApiId: string | undefined,
  pagination: PaginationState // <-- ۱. آرگومان دوم اضافه شد
) => {
  // ۲. ساخت فیلترها بر اساس هر دو آرگومان
  const filters: LogFilters = {
    employee_id: employeeApiId ? parseInt(employeeApiId, 10) : undefined,
    page: pagination.pageIndex + 1, // ۳. استفاده از صفحه‌بندی
    // (pageSize را هم اگر API می‌پذیرد، اضافه کنید)
    // per_page: pagination.pageSize
  };

  // ۴. از هوک اصلی 'useLogs' با فیلترهای ساخته شده استفاده می‌کنیم
  const queryResult = useLogs(filters);

  // ۵. نتیجه کامل query (شامل data, meta, isLoading, etc.) را برمی‌گردانیم
  // صفحه EmployeeReportsPage منتظر همین ساختار است
  return queryResult;
};
