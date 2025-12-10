import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateScheduleSlot } from "@/features/shift-schedule/api/api";
import { shiftScheduleKeys } from "./queryKeys";
import type { ShiftScheduleResource } from "@/features/shift-schedule/types/index";

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

      // آپدیت دستی کش برای UX سریع‌تر
      queryClient.setQueryData(
        queryKey,
        (oldData: ShiftScheduleResource | undefined) => {
          if (!oldData) return oldData;

          const newSlots = oldData.slots.map((slot) =>
            slot.id === updatedSlot.id ? updatedSlot : slot
          );

          return { ...oldData, slots: newSlots };
        }
      );

      // اطمینان از سینک بودن دیتا
      await queryClient.invalidateQueries({ queryKey: queryKey });

      toast.success(
        `اسلات روز ${updatedSlot.day_in_cycle} با موفقیت بروزرسانی شد.`
      );
    },

    onError: (error: any) => {
      console.error("useUpdateScheduleSlot (PATCH) onError:", error);
      toast.error(error.response?.data?.message || "خطا در بروزرسانی اسلات.");
    },
  });
};
