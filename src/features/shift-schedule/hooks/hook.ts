import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  fetchShiftSchedules,
  fetchShiftScheduleById,
  updateShiftSchedule,
  deleteShiftSchedule,
  updateScheduleSlot,
  generateShifts,
} from "@/features/shift-schedule/api/api";

import type {
  ShiftScheduleUpdatePayload,
  PaginatedShiftScheduleResponse,
  ShiftScheduleResource,
  GenerateShiftsPayload,
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
// ✅ آپدیت: اضافه کردن آرگومان per_page با مقدار پیش‌فرض ۱۵
export const useShiftSchedules = (page: number, per_page: number = 15) => {
  return useQuery({
    // ✅ آپدیت: اضافه کردن per_page به کلید کوئری (تا اگر تغییر کرد، کش باطل شود)
    queryKey: [...shiftScheduleKeys.lists(), { page, per_page }],
    // ✅ آپدیت: پاس دادن per_page به تابع API
    queryFn: () => fetchShiftSchedules(page, per_page),
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
      console.log(
        "useUpdateShiftSchedule (PUT) onSuccess: Received updated data from server:",
        updatedData
      );

      const queryKey = shiftScheduleKeys.details(String(updatedData.id));
      queryClient.setQueryData(queryKey, updatedData);
      console.log(
        `useUpdateShiftSchedule (PUT) onSuccess: Set query data for detail [${updatedData.id}]`
      );

      await queryClient.invalidateQueries({
        queryKey: shiftScheduleKeys.lists(),
      });
      await queryClient.invalidateQueries({ queryKey: ["workPatterns"] });
      console.log(
        "useUpdateShiftSchedule (PUT) onSuccess: Invalidated lists and workPatterns."
      );

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

      queryClient.setQueryData(
        queryKey,
        (oldData: ShiftScheduleResource | undefined) => {
          if (!oldData) {
            return oldData;
          }

          const newSlots = oldData.slots.map((slot: any) =>
            slot.id === updatedSlot.id ? updatedSlot : slot
          );

          return {
            ...oldData,
            slots: newSlots,
          };
        }
      );

      await queryClient.invalidateQueries({
        queryKey: queryKey,
      });

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

// --- تولید شیفت‌ها ---
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
      toast.success(data.message);
    },

    onError: (error: any) => {
      if (error instanceof AxiosError && error.response?.status === 422) {
        toast.error("خطای اعتبارسنجی. لطفاً تاریخ‌ها را بررسی کنید.");
      } else {
        toast.error(
          error.response?.data?.message || "خطا در ارسال درخواست تولید شیفت‌ها."
        );
      }
    },
  });
};
