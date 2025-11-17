import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchShiftSchedules,
  fetchShiftScheduleById,
  updateShiftSchedule,
  deleteShiftSchedule,
  updateScheduleSlot,
  generateShifts, // ✅ ایمپورت تابع جدید
} from "@/features/shift-schedule/api/api";

import type {
  ShiftScheduleUpdatePayload,
  // ScheduleSlotResource, // ✅ این ایمپورت استفاده نشده بود و حذف شد
  PaginatedShiftScheduleResponse,
  ShiftScheduleResource, // ✅ ایمپورت این تایپ برای oldData لازم است
  GenerateShiftsPayload, // ✅ ایمپورت تایپ جدید
} from "@/features/shift-schedule/types/index";

import type {
  WorkPatternUI,
  ApiPaginationMeta,
  ApiPaginationLinks,
} from "@/features/work-pattern/types/index";
import { AxiosError } from "axios";

// ---------------- کلیدهای کوئری ----------------
const shiftScheduleKeys = {
  all: ["shiftSchedules"] as const,
  lists: () => [...shiftScheduleKeys.all, "list"] as const,
  details: (id: number | string) =>
    [...shiftScheduleKeys.all, "detail", id] as const,
};

// ---------------- فهرست برنامه‌ها ----------------
export const useShiftSchedules = (page: number) => {
  return useQuery({
    queryKey: [...shiftScheduleKeys.lists(), { page }],
    queryFn: () => fetchShiftSchedules(page),
    select: (
      data: PaginatedShiftScheduleResponse
    ): {
      patterns: WorkPatternUI[];
      meta: ApiPaginationMeta;
      links: ApiPaginationLinks;
    } => {
      const responseData = data.data;
      const meta = data.meta as ApiPaginationMeta;
      const links = data.links as ApiPaginationLinks;

      // --- ✅✅✅ رفع خطای TS2304 ---
      // یک اشتباه تایپی بود، WorkPointUI به WorkPatternUI تغییر کرد
      const transformedPatterns: WorkPatternUI[] = responseData.map(
        (schedule) => ({
          id: schedule.id,
          name: schedule.name,
          pattern_type: "SHIFT_SCHEDULE",
          cycle_length_days: schedule.cycle_length_days,
          cycle_start_date: schedule.cycle_start_date,
        })
      );

      return { patterns: transformedPatterns, meta, links };
    },
  });
};

// ---------------- جزئیات یک برنامه ----------------
export const useShiftSchedule = (id: number | string) => {
  return useQuery({
    queryKey: shiftScheduleKeys.details(id),
    queryFn: () => fetchShiftScheduleById(id),
    enabled: !!id,
  });
};

// ---------------- آپدیت برنامه (PUT) ----------------
export const useUpdateShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ShiftScheduleUpdatePayload;
    }) => updateShiftSchedule(id, payload),

    onSuccess: async (updatedData) => {
      // 🐞 لاگ دیباگ: نمایش داده‌های دریافتی از سرور پس از PUT
      console.log(
        "useUpdateShiftSchedule (PUT) onSuccess: Received updated data from server:",
        updatedData
      );

      const queryKey = shiftScheduleKeys.details(String(updatedData.id)); // کلید رشته‌ای "13"
      queryClient.setQueryData(
        queryKey, // استفاده از کلید رشته‌ای
        updatedData
      );
      // 🐞 لاگ دیباگ: تایید تنظیم شدن داده‌ها در کش
      console.log(
        `useUpdateShiftSchedule (PUT) onSuccess: Set query data for detail [${updatedData.id}]`
      );

      // 🔹 هم‌زمان‌سازی کلی با سرور
      await queryClient.invalidateQueries({
        queryKey: shiftScheduleKeys.lists(),
      });
      await queryClient.invalidateQueries({ queryKey: ["workPatterns"] });
      // 🐞 لاگ دیباگ: تایید invalidate شدن لیست‌ها
      console.log(
        "useUpdateShiftSchedule (PUT) onSuccess: Invalidated lists and workPatterns."
      );

      toast.success("برنامه شیفتی با موفقیت به‌روزرسانی شد.");
    },

    onError: (error: any) => {
      // 🐞 لاگ دیباگ: نمایش خطا
      console.error("useUpdateShiftSchedule (PUT) onError:", error);
      toast.error(
        error.response?.data?.message || "خطا در به‌روزرسانی برنامه."
      );
    },
  });
};

// ---------------- حذف برنامه ----------------
export const useDeleteShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteShiftSchedule(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: shiftScheduleKeys.lists(),
      });
      await queryClient.invalidateQueries({ queryKey: ["workPatterns"] });
      toast.success("برنامه شیفتی حذف شد.");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "خطا در حذف برنامه شیفتی.");
    },
  });
};

// ---------------- آپدیت یک اسلات (PATCH) ----------------
// 🌟🌟🌟 اینجا نقطه اصلی مشکل بود 🌟🌟🌟
export const useUpdateScheduleSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shiftScheduleId,
      scheduleSlotId,
      payload,
    }: {
      shiftScheduleId: number | string;
      scheduleSlotId: number | string;
      payload: any;
    }) =>
      updateScheduleSlot({
        shiftScheduleId,
        scheduleSlotId,
        payload,
      }),

    onSuccess: async (updatedSlot, variables) => {
      const queryKey = shiftScheduleKeys.details(
        String(variables.shiftScheduleId)
      );
      // 🐞 لاگ دیباگ: نمایش کلید کوئری
      console.log(
        `useUpdateScheduleSlot (PATCH) onSuccess: Attempting to update cache for key:`,
        JSON.stringify(queryKey)
      );
      // 🐞 لاگ دیباگ: نمایش اسلات آپدیت شده از سرور
      console.log(
        `useUpdateScheduleSlot (PATCH) onSuccess: Received updated slot data:`,
        updatedSlot
      );

      // 1️⃣ بلافاصله داده‌ها را در کش آپدیت کن تا بدون رفرش دیده شود
      queryClient.setQueryData(
        queryKey,
        // 🟢 راه‌حل: oldData تایپ ShiftScheduleResource را دارد
        (oldData: ShiftScheduleResource | undefined) => {
          if (!oldData) {
            // 🐞 لاگ دیباگ: هشدار در صورت نبودن داده در کش
            console.warn(
              "useUpdateScheduleSlot (PATCH) setQueryData: No old data found in cache. Returning undefined."
            );
            return oldData;
          }

          // 🐞 لاگ دیباگ: نمایش داده‌های قدیمی موجود در کش
          console.log(
            "useUpdateScheduleSlot (PATCH) setQueryData: Found old data in cache:",
            oldData
          );

          // 🟢 راه‌حل: دسترسی مستقیم به oldData.slots
          const newSlots = oldData.slots.map((slot: any) =>
            slot.id === updatedSlot.id ? updatedSlot : slot
          );

          // 🐞 لاگ دیباگ: نمایش آرایه اسلات‌های جدید
          console.log(
            "useUpdateScheduleSlot (PATCH) setQueryData: New slots array created:",
            newSlots
          );

          // 🟢 راه‌حل: برگرداندن آبجکت ShiftScheduleResource با اسلات‌های جدید
          return {
            ...oldData,
            slots: newSlots, // جایگزینی آرایه اسلات‌ها
          };
        }
      );

      // 2️⃣ سپس کوئری را invalidate کن تا داده جدید از سرور بیاید
      // این کار تضمین می‌کند که داده‌های ما 100% با سرور هماهنگ هستند
      await queryClient.invalidateQueries({
        queryKey: queryKey,
      });
      // 🐞 لاگ دیباگ: تایید invalidate شدن
      console.log(
        `useUpdateScheduleSlot (PATCH) onSuccess: Invalidated query:`,
        JSON.stringify(queryKey)
      );

      toast.success(
        `اسلات روز ${updatedSlot.day_in_cycle} با موفقیت بروزرسانی شد.`
      );
    },

    onError: (error: any) => {
      // 🐞 لاگ دیباگ: نمایش خطا
      console.error("useUpdateScheduleSlot (PATCH) onError:", error);
      toast.error(error.response?.data?.message || "خطا در بروزرسانی اسلات.");
    },
  });
};

// --- ✅✅✅ جدید: هوک تولید شیفت‌ها ---
export const useGenerateShifts = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: GenerateShiftsPayload;
    }) => generateShifts(id, payload),

    onSuccess: (data) => {
      // ✅ API پاسخ 202 (Accepted) می‌دهد
      // به این معنی که جاب فقط در صف قرار گرفته است.
      // ما *نباید* هیچ کوئری را invalidate کنیم چون داده‌ها هنوز آماده نیستند.
      // فقط پیغام موفقیت‌آمیز بودن صف را به کاربر نشان می‌دهیم.
      toast.success(data.message);
    },

    onError: (error: any) => {
      // مدیریت خطاهای 422 (اعتبارسنجی) یا خطاهای عمومی
      if (error instanceof AxiosError && error.response?.status === 422) {
        // خطاهای 422 به صورت خاص در خود فرم مدیریت می‌شوند
        // اما یک خطای عمومی هم نشان می‌دهیم
        toast.error("خطای اعتبارسنجی. لطفاً تاریخ‌ها را بررسی کنید.");
      } else {
        toast.error(
          error.response?.data?.message || "خطا در ارسال درخواست تولید شیفت‌ها."
        );
      }
    },
  });
};
