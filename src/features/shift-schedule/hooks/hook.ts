import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchShiftSchedules,
  fetchShiftScheduleById,
  createShiftSchedule,
  updateShiftSchedule,
  deleteShiftSchedule,
  updateScheduleSlot,
} from "@/features/shift-schedule/api/api"; // ✅ مسیر نسبی
import type {
  ShiftScheduleResource,
  ShiftSchedulePayload,
  ShiftScheduleUpdatePayload,
  ScheduleSlotResource,
  PaginatedShiftScheduleResponse, // ✅ ایمپورت تایپ Paginated
} from "@/features/shift-schedule/types/index"; // ✅ مسیر نسبی
import type {
  WorkPatternUI,
  ApiPaginationMeta,
  ApiPaginationLinks,
} from "@/features/work-pattern/types/index"; // ✅ ایمپورت تایپ مشترک

// کامنت: کلیدهای کوئری برای ذخیره سازی و مدیریت کش
const shiftScheduleKeys = {
  all: ["shiftSchedules"] as const,
  lists: () => [...shiftScheduleKeys.all, "list"] as const,
  details: (id: number | string) =>
    [...shiftScheduleKeys.all, "detail", id] as const,
};

// --- ۱. هوک‌های Shift Schedule (لیست، جزئیات، ایجاد، ویرایش، حذف) ---

/**
 * هوک برای فچ کردن لیست برنامه‌های شیفتی (صفحه‌بندی شده)
 */
export const useShiftSchedules = (page: number) => {
  return useQuery({
    queryKey: [...shiftScheduleKeys.lists(), { page }], // ✅ کلید کوئری شامل صفحه
    queryFn: () => fetchShiftSchedules(page),

    // ✅✅✅ اصلاح کلیدی: افزودن select برای تبدیل داده‌ها به WorkPatternUI ✅✅✅
    select: (
      data: PaginatedShiftScheduleResponse
    ): {
      patterns: WorkPatternUI[];
      meta: ApiPaginationMeta;
      links: ApiPaginationLinks;
    } => {
      // کامنت: مدیریت ساختار آرایه‌ای (Multi-response) که قبلاً در API دیدیم
      // (این بخش فعلاً کامنت شده تا از ساختار استاندارد استفاده شود)
      // const responseData = Array.isArray(data.data) ? data.data[0] : data.data;
      // const meta = Array.isArray(data.meta) ? data.meta[0] : data.meta;
      // const links = Array.isArray(data.links) ? data.links[0] : data.links;

      const responseData = data.data;
      const meta = data.meta as ApiPaginationMeta; // اطمینان از تایپ
      const links = data.links as ApiPaginationLinks; // اطمینان از تایپ

      // کامنت: تبدیل هر برنامه شیفتی به فرمت مشترک WorkPatternUI
      const transformedPatterns: WorkPatternUI[] = responseData.map(
        (schedule) => ({
          id: schedule.id,
          name: schedule.name,
          pattern_type: "SHIFT_SCHEDULE", // ✅ تعیین نوع
          cycle_length_days: schedule.cycle_length_days,
          cycle_start_date: schedule.cycle_start_date,
        })
      );

      return {
        patterns: transformedPatterns,
        meta: meta,
        links: links,
      };
    },
  });
};

/**
 * هوک برای فچ کردن جزئیات یک برنامه شیفتی (شامل اسلات‌ها)
 */
export const useShiftSchedule = (id: number | string) => {
  return useQuery({
    queryKey: shiftScheduleKeys.details(id),
    queryFn: () => fetchShiftScheduleById(id),
    enabled: !!id,
  });
};

/**
 * هوک برای ایجاد یک برنامه شیفتی جدید
 */
export const useCreateShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShiftSchedulePayload) => createShiftSchedule(payload),
    onSuccess: () => {
      // باطل کردن کش لیست برای نمایش آیتم جدید
      queryClient.invalidateQueries({ queryKey: shiftScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["workPatterns"] }); // ✅ باطل کردن کوئری ترکیبی
      toast.success("برنامه شیفتی با موفقیت ایجاد شد.");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "خطا در ایجاد برنامه شیفتی.";
      toast.error(message);
    },
  });
};

/**
 * هوک برای ویرایش نام و تاریخ شروع برنامه شیفتی
 */
export const useUpdateShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ShiftScheduleUpdatePayload; // فقط نام و تاریخ شروع
    }) => updateShiftSchedule(id, payload),
    onSuccess: (updatedData) => {
      // ۱. باطل کردن کش لیست
      queryClient.invalidateQueries({ queryKey: shiftScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["workPatterns"] }); // ✅ باطل کردن کوئری ترکیبی
      // ۲. آپدیت کش جزئیات برای رفرش فوری صفحه ویرایش
      queryClient.setQueryData(
        shiftScheduleKeys.details(updatedData.id),
        updatedData
      );
      toast.success("برنامه شیفتی به‌روزرسانی شد.");
    },
  });
};

/**
 * هوک برای حذف برنامه شیفتی
 */
export const useDeleteShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteShiftSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftScheduleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["workPatterns"] }); // ✅ باطل کردن کوئری ترکیبی
      toast.success("برنامه شیفتی حذف شد.");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "خطا در حذف برنامه شیفتی.";
      toast.error(message);
    },
  });
};

// --- ۲. هوک‌های Schedule Slot (ویرایش ردیف‌ها) ---

/**
 * هوک برای آپدیت یک اسلات خاص در چرخه شیفتی (ویرایش Inline)
 */
export const useUpdateScheduleSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScheduleSlot,

    onSuccess: (updatedSlot: ScheduleSlotResource, variables) => {
      const queryKey = shiftScheduleKeys.details(variables.shiftScheduleId);

      // --- ۱. به‌روزرسانی آنی کش (Optimistic UI) ---
      queryClient.setQueryData<ShiftScheduleResource>(
        queryKey,
        (oldScheduleData) => {
          if (!oldScheduleData) {
            return undefined;
          }

          const oldSlots = oldScheduleData.slots || [];
          const newSlots = oldSlots.map((slot) =>
            slot.id === updatedSlot.id ? updatedSlot : slot
          );

          return {
            ...oldScheduleData,
            slots: newSlots,
          };
        }
      );

      // --- ۲. باطل کردن کش (Fallback) ---
      queryClient.invalidateQueries({ queryKey });

      toast.success(`اسلات روز ${updatedSlot.day_in_cycle} به‌روزرسانی شد.`);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "خطا در به‌روزرسانی اسلات.";
      toast.error(message);
    },
  });
};
