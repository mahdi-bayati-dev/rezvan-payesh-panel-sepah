import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchWorkGroups, // ✅ اضافه شد
  fetchWorkGroupById,
  createWorkGroup,
  updateWorkGroup,
  deleteWorkGroup,
  fetchWorkPatternsList,
  fetchShiftSchedulesList,
  // ✅ اصلاح: نام تابع را به updateGroupEmployees تغییر می‌دهیم
  updateGroupEmployees,
} from "@/features/work-group/api/api";
import { type WorkGroup, type PaginatedResponse } from "../types"; // ✅ ایمپورت PaginatedResponse

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
  employees: (groupId: number) =>
    [...workGroupKeys.all, "employees", groupId] as const,
};

// ✅✅✅ هوک جدید: دریافت لیست گروه‌های کاری (Work Groups)
export const useWorkGroups = (page: number = 1, perPage: number = 15) => {
  return useQuery<PaginatedResponse<WorkGroup>, Error>({
    queryKey: workGroupKeys.list(page, perPage),
    queryFn: () => fetchWorkGroups(page, perPage),
    // این تنظیم تضمین می‌کند هنگام تغییر صفحه، داده قبلی نمایش داده شود
    placeholderData: keepPreviousData,
  });
};

// هوک برای افزودن کارمندان به گروه
export const useAddEmployeeToGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { groupId: number; employeeIds: number[] }>(
    {
      // ✅ تعریف دقیق تایپ خروجی
      mutationFn: ({
        groupId,
        employeeIds,
      }: {
        groupId: number;
        employeeIds: number[];
      }) =>
        updateGroupEmployees({
          // ✅ استفاده از نام صحیح
          groupId,
          employeeIds,
          action: "attach",
        }),

      // ✅ اصلاح: تایپ updatedUsers را مشخص می‌کنیم و variables را حذف می‌کنیم
      onSuccess: (message: string) => {
        // بعد از موفقیت، کش لیست کارمندان گروه فعلی و لیست کلی کاربران را باطل کن.
        // این کار باعث می‌شود جداول Assigned/Available به‌روز شوند.
        queryClient.invalidateQueries({ queryKey: workGroupKeys.all }); // باطل کردن همه کش‌های گروه‌کاری
        queryClient.invalidateQueries({ queryKey: ["users"] }); // باطل کردن همه کش‌های کاربران (برای آپدیت لیست آزادها)

        // پیام موفقیت در کامپوننت مدیریت می‌شود اما برای اطمینان این متد را نیز آپدیت کردیم.
        return message; // ارسال پیام به onSuccess در کامپوننت
      },
      onError: (error) => {
        toast.error(`خطا در افزودن: ${(error as any)?.message || "خطای سرور"}`);
        console.log(error);
      },
    }
  );
};

/**
 * هوک Mutation برای حذف کارمندان از گروه کاری
 */
export const useRemoveEmployeeFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { groupId: number; employeeIds: number[] }>(
    {
      // ✅ تعریف دقیق تایپ خروجی
      mutationFn: ({
        groupId,
        employeeIds,
      }: {
        groupId: number;
        employeeIds: number[];
      }) =>
        updateGroupEmployees({
          // ✅ استفاده از نام صحیح
          groupId,
          employeeIds,
          action: "detach",
        }),

      // ✅ اصلاح: تایپ message را مشخص می‌کنیم و variables را حذف می‌کنیم
      onSuccess: (message: string) => {
        // بعد از موفقیت، کش لیست کارمندان گروه فعلی و لیست کلی کاربران را باطل کن.
        queryClient.invalidateQueries({ queryKey: workGroupKeys.all }); // باطل کردن همه کش‌های گروه‌کاری
        queryClient.invalidateQueries({ queryKey: ["users"] }); // باطل کردن همه کش‌های کاربران (برای آپدیت لیست آزادها)

        return message; // ارسال پیام به onSuccess در کامپوننت
      },
      onError: (error) => {
        toast.error(`خطا در حذف: ${(error as any)?.message || "خطای سرور"}`);
        console.log(error);
      },
    }
  );
};

// هوک برای خواندن تکی گروه کاری
export const useWorkGroup = (id: number) => {
  return useQuery({
    queryKey: workGroupKeys.detail(id),
    queryFn: () => fetchWorkGroupById(id),
    enabled: !!id && id > 0, // مطمئن می‌شویم ID معتبر است
  });
};

// هوک Mutation برای ایجاد
export const useCreateWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkGroup,
    onSuccess: () => {
      // بعد از موفقیت، کش لیست‌ها را منسوخ کن تا داده جدید نمایش داده شود
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
    },
  });
};

// هوک Mutation برای ویرایش
export const useUpdateWorkGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // تعریف دقیق ورودی تابع (Type Safety)
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
      // کش لیست‌ها را منسوخ کن
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });

      // (بهینه‌سازی) کش این آیتم خاص را مستقیماً آپدیت کن تا رندر سریع‌تر شود
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
      // بعد از موفقیت، کش لیست‌ها را منسوخ کن
      queryClient.invalidateQueries({ queryKey: workGroupKeys.lists() });
    },
  });
};

// --- هوک‌های مورد نیاز برای فرم ---

// هوک برای گرفتن لیست الگوهای کاری
export const useWorkPatternsList = () => {
  return useQuery({
    queryKey: ["workPatternsList"],
    queryFn: fetchWorkPatternsList,
  });
};

// هوک برای دریافت لیست برنامه‌های شیفتی
export const useShiftSchedulesList = () => {
  return useQuery({
    queryKey: ["shiftSchedulesList"],
    queryFn: fetchShiftSchedulesList,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // ۵ دقیقه کش
  });
};
