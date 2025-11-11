// این فایل فقط باید هوک useCreateShiftSchedule را اکسپورت کند

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createShiftSchedule } from "../api/api"; // ✅ فقط ایمپورت تابع مورد نیاز
import type { ShiftSchedulePayload } from "../types";

// کلیدهای کوئری (اگر در فایل hook.ts تعریف شده‌اند، می‌توان از آنجا ایمپورت کرد
// یا برای استقلال ماژول، اینجا دوباره تعریف کرد)
const shiftScheduleKeys = {
  all: ["shiftSchedules"] as const,
  lists: () => [...shiftScheduleKeys.all, "list"] as const,
  details: (id: number | string) =>
    [...shiftScheduleKeys.all, "detail", id] as const,
};

// --- هوک ایجاد Shift Schedule (بخش ۱.۲ مستندات) ---

export const useCreateShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShiftSchedulePayload) => createShiftSchedule(payload),

    onSuccess: () => {
      // ✅ Invalidate کردن لیست برنامه‌های شیفتی (بخش ۱.۱)
      queryClient.invalidateQueries({ queryKey: shiftScheduleKeys.lists() });

      // ✅ از آنجایی که این لیست در لیست کلی الگوها (Work Patterns) هم نمایش داده می‌شود
      // باید آن کوئری را هم Invalidate کنیم (بر اساس کد hook.ts)
      queryClient.invalidateQueries({ queryKey: ["workPatterns"] });

      toast.success("برنامه شیفتی با موفقیت ایجاد شد.");
    },

    onError: (error: any) => {
      // مدیریت خطای عمومی در اینجا انجام می‌شود
      // (خطاهای 422 به صورت خاص در useShiftScheduleForm مدیریت می‌شوند)
      if (error.response?.status !== 422) {
        const message =
          error.response?.data?.message || "خطا در ایجاد برنامه شیفتی.";
        toast.error(message);
      }
    },
  });
};
