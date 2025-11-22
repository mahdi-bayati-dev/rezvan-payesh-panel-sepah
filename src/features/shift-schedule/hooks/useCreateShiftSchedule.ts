import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createShiftSchedule, generateShifts } from "../api/api";
import type { ShiftSchedulePayload, GenerateShiftsPayload } from "../types";
import { AxiosError } from "axios";

// --- هوک ایجاد برنامه شیفتی جدید ---
export const useCreateShiftSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShiftSchedulePayload) => createShiftSchedule(payload),
    onSuccess: () => {
      // لیست برنامه‌های شیفتی را به‌روز می‌کنیم
      queryClient.invalidateQueries({ queryKey: ["shiftSchedules"] });
      // لیست کلی الگوها را هم به‌روز می‌کنیم
      queryClient.invalidateQueries({ queryKey: ["workPatterns"] });

      toast.success("برنامه شیفتی با موفقیت ایجاد شد.");
    },
    onError: (error: any) => {
      // خطاهای 422 در فرم هندل می‌شوند، اینجا خطاهای عمومی را نمایش می‌دهیم
      if (error.response?.status !== 422) {
        toast.error(
          error.response?.data?.message || "خطا در ایجاد برنامه شیفتی."
        );
      }
    },
  });
};

// --- ✅ هوک تولید شیفت (Generate Shifts) ---
// این هوک قبلاً جا افتاده بود که باعث خطای بیلد می‌شد
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
      // طبق داکیومنت، پاسخ 202 است و عملیات در صف انجام می‌شود
      toast.success(
        data.message || "درخواست تولید شیفت با موفقیت در صف پردازش قرار گرفت."
      );
    },

    onError: (error: any) => {
      if (error instanceof AxiosError && error.response?.status === 422) {
        toast.warning("لطفاً خطاهای ورودی را بررسی کنید.");
      } else {
        toast.error(
          error.response?.data?.message || "خطا در ارسال درخواست تولید شیفت‌ها."
        );
      }
    },
  });
};
