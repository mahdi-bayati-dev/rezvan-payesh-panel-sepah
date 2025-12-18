import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/api";
import type { Holiday, CreateHolidayDTO, HolidayMap } from "../types";
import { HolidayType } from "../types";
import moment from "jalali-moment";
import { toast } from "react-toastify";

const HOLIDAY_QUERY_KEY = "work-calendar-holidays";

/**
 * دریافت و مپ کردن تعطیلات
 */
export const useGetHolidays = (jalaliYear: number) => {
  return useQuery({
    queryKey: [HOLIDAY_QUERY_KEY, jalaliYear],
    queryFn: () => api.getHolidaysByYear(jalaliYear),
    select: (holidays: Holiday[]): HolidayMap => {
      const holidayMap: HolidayMap = {};
      if (!holidays) return holidayMap;
      holidays.forEach((h) => {
        // کلید مپ را میلادی نگه می‌داریم برای نمایش راحت در گرید
        const gregDate = moment(h.date, "jYYYY-jMM-jDD").format("YYYY-MM-DD");
        holidayMap[gregDate] = {
          ...h,
          type: h.is_official ? HolidayType.OFFICIAL : HolidayType.AGREEMENT,
        };
      });
      return holidayMap;
    },
  });
};

/**
 * هوک ثبت دسته‌جمعی (ارسال تاریخ میلادی به سرور)
 */
export const useBulkCreateHolidays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dates: string[]) => {
      const promises = dates.map((date) =>
        api.createHoliday({
          date, // تاریخ میلادی
          name: "تعطیلی رسمی (جمعه)",
          is_official: true,
        })
      );
      const results = await Promise.allSettled(promises);
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) throw new Error(`${failed.length} مورد ثبت نشد.`);
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOLIDAY_QUERY_KEY] });
      toast.success("ثبت دسته‌جمعی با موفقیت انجام شد.");
    },
    onError: () => toast.error("خطا در ثبت دسته‌جمعی!"),
  });
};

/**
 * هوک حذف دسته‌جمعی (انتظار تاریخ جلالی برای URL)
 */
export const useBulkDeleteHolidays = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jalaliDates: string[]) => {
      // اجرای درخواست‌ها به صورت همزمان
      const promises = jalaliDates.map((date) => api.deleteHoliday(date));
      const results = await Promise.allSettled(promises);

      const successfulCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      if (successfulCount === 0) throw new Error("هیچ موردی حذف نشد.");
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOLIDAY_QUERY_KEY] });
      toast.success("حذف دسته‌جمعی با موفقیت انجام شد. 🗑️");
    },
    onError: (err: any) => toast.error(err.message || "خطا در عملیات حذف!"),
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHolidayDTO) => api.createHoliday(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [HOLIDAY_QUERY_KEY] }),
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (date: string) => api.deleteHoliday(date),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [HOLIDAY_QUERY_KEY] }),
  });
};
