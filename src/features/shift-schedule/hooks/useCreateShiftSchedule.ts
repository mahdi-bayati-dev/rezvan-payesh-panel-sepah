import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  //   fetchShiftSchedules,
  //   fetchShiftScheduleById,
  createShiftSchedule, // ✅ تابع API
  //   updateShiftSchedule,
  //   deleteShiftSchedule,
  //   updateScheduleSlot,
} from "../api/api";
import type {
  //   ShiftScheduleResource,
  ShiftSchedulePayload,
  //   SlotUpdatePayload,
} from "../types";

const shiftScheduleKeys = {
  all: ["shiftSchedules"] as const,
  lists: () => [...shiftScheduleKeys.all, "list"] as const,
  details: (id: number | string) =>
    [...shiftScheduleKeys.all, "detail", id] as const,
};

// ... (سایر هوک‌ها)

// --- هوک ایجاد Shift Schedule ---

export const useCreateShiftSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShiftSchedulePayload) => createShiftSchedule(payload),
    onSuccess: () => {
      // ✅ invalidate کردن لیست برنامه‌های شیفتی
      queryClient.invalidateQueries({ queryKey: shiftScheduleKeys.lists() });
      toast.success("برنامه شیفتی با موفقیت ایجاد شد.");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "خطا در ایجاد برنامه شیفتی.";
      toast.error(message);
    },
  });
};

// ... (ادامه هوک‌ها)
