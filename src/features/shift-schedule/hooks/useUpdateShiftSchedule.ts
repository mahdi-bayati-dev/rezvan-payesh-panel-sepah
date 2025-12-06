import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateShiftSchedule } from "@/features/shift-schedule/api/api";
import { shiftScheduleKeys } from "./queryKeys";
import type { ShiftScheduleUpdatePayload } from "@/features/shift-schedule/types/index";

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
      // آپدیت کردن دیتای کش به صورت دستی (Optimistic Update pattern)
      const queryKey = shiftScheduleKeys.details(String(updatedData.id));
      queryClient.setQueryData(queryKey, updatedData);

      // باطل کردن لیست‌ها برای دریافت دیتای تازه
      await queryClient.invalidateQueries({
        queryKey: shiftScheduleKeys.lists(),
      });
      await queryClient.invalidateQueries({ queryKey: ["workPatterns"] });

      toast.success("برنامه شیفتی با موفقیت به‌روزرسانی شد.");
    },

    onError: (error: any) => {
      console.error("useUpdateShiftSchedule (PUT) onError:", error);
      toast.error(
        error.response?.data?.message || "خطا در به‌روزرسانی برنامه."
      );
    },
  });
};
