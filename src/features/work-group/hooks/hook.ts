import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchWorkGroups,
  fetchWorkGroupById,
  createWorkGroup,
  updateWorkGroup,
  deleteWorkGroup,
  fetchWorkPatternsList,
  fetchShiftSchedulesList,
  updateGroupEmployees,
} from "@/features/work-group/api/api";
import { type WorkGroup, type PaginatedResponse } from "../types";

// --- کلیدهای کوئری (Query Keys) ---
// این ساختار باعث می‌شود مدیریت کش بسیار دقیق و قابل پیش‌بینی باشد
export const workGroupKeys = {
  all: ["workGroups"] as const,
  lists: () => [...workGroupKeys.all, "list"] as const,
  list: (page: number, perPage: number) =>
    [...workGroupKeys.lists(), { page, perPage }] as const,
  details: () => [...workGroupKeys.all, "detail"] as const,
  detail: (id: number) => [...workGroupKeys.details(), id] as const,
};

// کلیدهای مربوط به کاربران (باید با کلیدهای فیچر Users هماهنگ باشد)
// فرض بر این است که در فیچر Users کلید اصلی ['users'] است.
const userKeys = {
  all: ["users"] as const,
};

// --- هوک‌های دریافت اطلاعات ---

export const useWorkGroups = (page: number = 1, perPage: number = 15) => {
  return useQuery<PaginatedResponse<WorkGroup>, Error>({
    queryKey: workGroupKeys.list(page, perPage),
    queryFn: () => fetchWorkGroups(page, perPage),
    placeholderData: keepPreviousData,
  });
};

export const useWorkGroup = (id: number) => {
  return useQuery({
    queryKey: workGroupKeys.detail(id),
    queryFn: () => fetchWorkGroupById(id),
    enabled: !!id && id > 0,
  });
};

export const useWorkPatternsList = () => {
  return useQuery({
    queryKey: ["workPatternsList"],
    queryFn: fetchWorkPatternsList,
  });
};

export const useShiftSchedulesList = () => {
  return useQuery({
    queryKey: ["shiftSchedulesList"],
    queryFn: fetchShiftSchedulesList,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

// --- هوک‌های عملیاتی (Mutations) ---

export const useCreateWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
    },
  });
};

export const useUpdateWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        name: string;
        week_pattern_id?: number | null;
        shift_schedule_id?: number | null;
      };
    }) => updateWorkGroup(id, payload),
    onSuccess: (updatedData: WorkGroup) => {
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
      queryClient.setQueryData(
        workGroupKeys.detail(updatedData.id),
        updatedData
      );
    },
  });
};

export const useDeleteWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
    },
  });
};

/**
 * هوک جامع مدیریت اعضا (افزودن/حذف)
 * این هوک لاجیک مشترک را مدیریت می‌کند و کش‌های مربوطه را به روز می‌کند.
 */
const useManageGroupEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroupEmployees,
    onSuccess: (data, variables) => {
      // 1. باطل کردن کش کاربران (تا جدول‌های Available/Assigned رفرش شوند)
      // ما همه کوئری‌های مربوط به users را باطل می‌کنیم تا مطمئن شویم وضعیت‌ها آپدیت می‌شوند
      queryClient.invalidateQueries({ queryKey: userKeys.all });

      // 2. باطل کردن جزئیات گروه کاری (شاید تعداد اعضا در آنجا نمایش داده می‌شود)
      queryClient.invalidateQueries({
        queryKey: workGroupKeys.detail(variables.groupId),
      });

      // نمایش پیام موفقیت از سمت سرور (یا پیام پیش‌فرض)
      toast.success(data.message || "عملیات با موفقیت انجام شد.");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "خطا در برقراری ارتباط با سرور.";
      toast.error(errorMessage);
    },
  });
};

// اکسپورت هوک‌های Semantic برای استفاده راحت‌تر در کامپوننت‌ها
export const useAddEmployeeToGroup = () => useManageGroupEmployees();
export const useRemoveEmployeeFromGroup = () => useManageGroupEmployees();
