import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  // توابع API ادمین
  fetchLogs,
  fetchLogById,
  fetchEmployeeOptionsList,
  createLog,
  updateLog,
  approveLog,
  requestAttendanceExport,
  // [جدید] توابع API کاربر
  fetchMyLogs,
  fetchMyLogById,
  // تایپ‌ها
  type LogFilters,
  type MyLogFilters, // [جدید]
  type CreateLogPayload,
  type UpdateLogPayload,
  type ReportExportPayload,
} from "@/features/reports/api/api";
import { mapApiLogToActivityLog } from "@/features/reports/utils/dataMapper";
import {
  type ApiAttendanceLog,
  // type ActivityLog,
} from "@/features/reports/types";
import { toast } from "react-toastify";

// ... (PaginationState) ...
interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export const reportKeys = {
  all: ["reports"] as const,

  // کلیدهای ادمین
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: LogFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string | number) => [...reportKeys.details(), id] as const,
  employeeList: () => [...reportKeys.all, "employeeList"] as const,
  employeeSearch: (query: string) =>
    [...reportKeys.all, "employeeSearch", query] as const,
  export: () => [...reportKeys.all, "export"] as const,

  // [جدید] کلیدهای کاربر
  myLists: () => [...reportKeys.all, "myList"] as const,
  myList: (filters: MyLogFilters) =>
    [...reportKeys.myLists(), filters] as const,
  myDetails: () => [...reportKeys.all, "myDetail"] as const,
  myDetail: (id: string | number) => [...reportKeys.myDetails(), id] as const,
};

// --- ۱. هوک واکشی لیست گزارش‌ها (ادمین) ---
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
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });
};

// --- ۲. هوک واکشی جزئیات (ادمین) ---
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

// --- [جدید] ۳. هوک واکشی لیست گزارش‌ها (کاربر) ---
export const useMyLogs = (filters: MyLogFilters) => {
  return useQuery({
    queryKey: reportKeys.myList(filters),
    queryFn: async () => {
      const collection = await fetchMyLogs(filters);
      const mappedData = collection.data.map(mapApiLogToActivityLog);
      return {
        data: mappedData,
        meta: collection.meta,
      };
    },
    staleTime: 1000 * 60, // 1 دقیقه
    placeholderData: keepPreviousData,
  });
};

// --- [جدید] ۴. هوک واکشی جزئیات (کاربر) ---
export const useMyLogDetails = (logId: string | number | undefined) => {
  return useQuery({
    queryKey: reportKeys.myDetail(logId!),
    queryFn: async () => {
      // طبق مستندات، کاربر فقط لاگ خودش را می‌بیند
      // Policy در بک‌اند دسترسی را کنترل می‌کند
      const apiLog = await fetchMyLogById(logId!);
      return mapApiLogToActivityLog(apiLog);
    },
    enabled: !!logId,
  });
};

// --- هوک‌های ادمین (بدون تغییر) ---

// --- ۵. هوک واکشی *لیست کامل* سربازان (برای فیلتر ادمین) ---
export const useEmployeeOptionsList = () => {
  return useQuery({
    queryKey: reportKeys.employeeList(),
    queryFn: () => fetchEmployeeOptionsList(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// --- ۶. هوک واکشی *جستجوی* سربازان (برای فرم ادمین) ---
export const useEmployeeOptionsSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: reportKeys.employeeSearch(searchQuery),
    queryFn: () => fetchEmployeeOptionsList(searchQuery),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: searchQuery.length === 0 || searchQuery.length > 1,
  });
};

// --- ۷. هوک ایجاد لاگ (ادمین) ---
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

// --- ۸. هوک ویرایش لاگ (ادمین) ---
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
      // Invalidate لیست ادمین
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      // آپدیت کش جزئیات ادمین
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

// --- ۹. هوک تأیید لاگ (ادمین) ---
export const useApproveLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string | number) => approveLog(logId),
    onSuccess: (approvedLog: ApiAttendanceLog) => {
      toast.success("تردد با موفقیت تأیید شد.");
      // Invalidate لیست ادمین
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
      // آپدیت کش جزئیات ادمین
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

// --- ۱۰. هوک درخواست خروجی اکسل (ادمین) ---
export const useRequestExport = () => {
  return useMutation({
    mutationFn: (payload: ReportExportPayload) =>
      requestAttendanceExport(payload),
    onSuccess: (data) => {
      toast.info(data.message, {
        autoClose: 5000,
      });
    },
    onError: (error) => {
      toast.error(`خطا در شروع فرآیند: ${error.message}`);
    },
  });
};

// --- ۱۱. هوک گزارش‌های سرباز (ادمین) ---
export const useEmployeeLogs = (
  employeeApiId: string | undefined,
  pagination: PaginationState
) => {
  const filters: LogFilters = {
    employee_id: employeeApiId ? parseInt(employeeApiId, 10) : undefined,
    page: pagination.pageIndex + 1,
  };

  const queryResult = useLogs(filters);

  return queryResult;
};
