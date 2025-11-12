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
  // [بهینه] ۲. تغییر نام برای تفکیک
  fetchEmployeeOptionsList,
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

// --- [اصلاح] کلیدهای Query (اکسپورت شد + کلید کارمندان تفکیک شد) ---
export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: LogFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string | number) => [...reportKeys.details(), id] as const,

  // [بهینه] کلید برای لیست کامل کارمندان (برای فیلتر)
  employeeList: () => [...reportKeys.all, "employeeList"] as const,
  // [بهینه] کلید برای جستجوی کارمندان (برای فرم)
  employeeSearch: (query: string) =>
    [...reportKeys.all, "employeeSearch", query] as const,
};

// --- ۱. هوک واکشی لیست گزارش‌ها (برای reportPage.tsx) ---
// (بدون تغییر)
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
    placeholderData: keepPreviousData,
    // refetchInterval حذف شده که عالی است
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

// --- ۳. [بهینه] هوک واکشی *لیست کامل* کارمندان (برای فیلتر) ---
export const useEmployeeOptionsList = () => {
  return useQuery({
    queryKey: reportKeys.employeeList(),
    // [✅ رفع خطا ۱] - queryFn باید یک تابع ناشناس (anonymous function) باشد
    // که تابع اصلی ما را *بدون پارامتر* فراخوانی کند.
    // این کار از تداخل پارامتر context خود useQuery جلوگیری می‌کند.
    queryFn: () => fetchEmployeeOptionsList(), // تابع API لیست کامل
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// --- [جدید] هوک واکشی *جستجوی* کارمندان (برای فرم) ---
export const useEmployeeOptionsSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: reportKeys.employeeSearch(searchQuery),
    // [بهینه] فقط زمانی فچ کن که کاربر حداقل ۲ حرف تایپ کرده باشد
    queryFn: () => fetchEmployeeOptionsList(searchQuery), // استفاده از تابع لیست با پارامتر جستجو
    staleTime: 1000 * 60 * 5, // ۵ دقیقه
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    // [بهینه] جلوگیری از فچ برای حروف کم
    enabled: searchQuery.length === 0 || searchQuery.length > 1,
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
