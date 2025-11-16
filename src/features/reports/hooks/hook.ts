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
  fetchEmployeeOptionsList,
  createLog,
  updateLog,
  approveLog,
  requestAttendanceExport, // [جدید] ایمپورت تابع API اکسل
  // تایپ‌ها
  type LogFilters,
  type CreateLogPayload,
  type UpdateLogPayload,
  type ReportExportPayload, // [جدید] ایمپورت تایپ Payload اکسل
} from "@/features/reports/api/api";
import { mapApiLogToActivityLog } from "@/features/reports/utils/dataMapper";
import {
  type ApiAttendanceLog,
  //   type ActivityLog,
} from "@/features/reports/types";
import { toast } from "react-toastify";

// ... (PaginationState و reportKeys بدون تغییر) ...
interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (filters: LogFilters) => [...reportKeys.lists(), filters] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string | number) => [...reportKeys.details(), id] as const,
  employeeList: () => [...reportKeys.all, "employeeList"] as const,
  employeeSearch: (query: string) =>
    [...reportKeys.all, "employeeSearch", query] as const,
  // [جدید] کلید برای جهش اکسل (اگرچه معمولاً invalidation نیاز ندارد)
  export: () => [...reportKeys.all, "export"] as const,
};

// ... (useLogs, useLogDetails, useEmployeeOptionsList, useEmployeeOptionsSearch, useCreateLog, useUpdateLog, useApproveLog بدون تغییر) ...
// --- ۱. هوک واکشی لیست گزارش‌ها ---
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

// --- ۲. هوک واکشی جزئیات ---
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

// --- ۳. هوک واکشی *لیست کامل* کارمندان (برای فیلتر) ---
export const useEmployeeOptionsList = () => {
  return useQuery({
    queryKey: reportKeys.employeeList(),
    queryFn: () => fetchEmployeeOptionsList(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

// --- [جدید] هوک واکشی *جستجوی* کارمندان (برای فرم) ---
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

// --- ۴. هوک ایجاد لاگ ---
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

// --- ۵. هوک ویرایش لاگ ---
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

// --- ۶. هوک تأیید لاگ ---
export const useApproveLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string | number) => approveLog(logId),
    onSuccess: (approvedLog: ApiAttendanceLog) => {
      toast.success("تردد با موفقیت تأیید شد.");
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
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

// --- [جدید] هوک درخواست خروجی اکسل ---
/**
 * این هوک جهش (Mutation) برای ارسال درخواست *شروع* ساخت اکسل را مدیریت می‌کند.
 */
export const useRequestExport = () => {
  return useMutation({
    mutationFn: (payload: ReportExportPayload) =>
      requestAttendanceExport(payload),

    onSuccess: (data) => {
      // (data.message) حاوی پیام "گزارش شما در حال آماده‌سازی است..."
      toast.info(data.message, {
        autoClose: 5000,
      });
      // در اینجا نیازی به invalidation نیست، چون وب‌سوکت کار را انجام می‌دهد
    },
    onError: (error) => {
      // این خطا معمولاً برای 422 (خطای اعتبارسنجی) یا 500 رخ می‌دهد
      toast.error(`خطا در شروع فرآیند: ${error.message}`);
    },
  });
};

// --- ۷. هوک گزارش‌های کارمند (بدون تغییر) ---
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
