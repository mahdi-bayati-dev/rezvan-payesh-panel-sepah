import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import {
  fetchWorkGroups,
  fetchWorkGroupById,
  createWorkGroup,
  updateWorkGroup,
  deleteWorkGroup,
  fetchWorkPatternsList,
  fetchShiftSchedulesList,
} from "@/features/work-group/api/api";
// ۱. ایمپورت کردن تایپ WorkGroup (که باید آپدیت شده باشد)
import { type WorkGroup } from "../types";

// --- کلیدهای کوئری ---

const workGroupKeys = {
  all: ["workGroups"] as const,
  lists: () => [...workGroupKeys.all, "list"] as const,
  list: (page: number, perPage: number) => [
    ...workGroupKeys.lists(),
    { page, perPage },
  ],
  details: () => [...workGroupKeys.all, "detail"] as const,
  detail: (id: number) => [...workGroupKeys.details(), id] as const,
};

// --- هوک‌های React Query ---

// هوک برای خواندن لیست گروه‌های کاری
export const useWorkGroups = (page: number, perPage: number) => {
  return useQuery({
    queryKey: workGroupKeys.list(page, perPage),
    queryFn: () => fetchWorkGroups(page, perPage),
    placeholderData: keepPreviousData,
  });
};

// هوک برای خواندن تکی گروه کاری
export const useWorkGroup = (id: number) => {
  return useQuery({
    queryKey: workGroupKeys.detail(id),
    queryFn: () => fetchWorkGroupById(id),
    enabled: !!id,
  });
};

// هوک Mutation برای ایجاد
export const useCreateWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
    },
  });
};

// هوک Mutation برای ویرایش
export const useUpdateWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // ۲. اصلاحیه اصلی اینجاست
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        name: string;
        // ۳. استفاده از نام فیلد صحیح (هماهنگ با API و Zod)
        week_pattern_id?: number | null;
        shift_schedule_id?: number | null;
      };
    }) => updateWorkGroup(id, payload),

    onSuccess: (updatedData: WorkGroup) => {
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });

      // (بهینه‌سازی) کش این آیتم خاص را مستقیماً آپدیت کن
      queryClient.setQueryData(
        workGroupKeys.detail(updatedData.id),
        updatedData
      );
    },
  });
};

// هوک Mutation برای حذف
export const useDeleteWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
    },
  });
};

// --- هوک‌های مورد نیاز برای فرم ---

export const useWorkPatternsList = () => {
  return useQuery({
    queryKey: ["workPatternsList"],
    queryFn: fetchWorkPatternsList,
  });
};

/**
 * هوک واقعی برای دریافت لیست برنامه‌های شیفتی
 * از API واقعی استفاده می‌کند: GET /shift-schedules
 */
export const useShiftSchedulesList = () => {
  return useQuery({
    queryKey: ["shiftSchedulesList"],
    queryFn: fetchShiftSchedulesList,
    placeholderData: keepPreviousData, // تا وقتی لود میشه، قبلی رو نشون بده
    staleTime: 5 * 60 * 1000, // ۵ دقیقه کش
  });
};
