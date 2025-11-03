import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/api";

import type { Holiday, CreateHolidayDTO, HolidayMap } from "../types";
import { HolidayType } from "../types";
import moment from "jalali-moment";
import { toast } from "react-toastify";

const HOLIDAY_QUERY_KEY = "work-calendar-holidays";

export const useGetHolidays = (jalaliYear: number) => {
  return useQuery({
    queryKey: [HOLIDAY_QUERY_KEY, jalaliYear],
    queryFn: () => api.getHolidaysByYear(jalaliYear),
    select: (holidays: Holiday[]): HolidayMap => {
      const holidayMap: HolidayMap = {};
      if (!holidays) return holidayMap;

      for (const holiday of holidays) {
        const jalaliDate = holiday.date;
        const gregorianDate = moment(jalaliDate, "jYYYY-jMM-jDD").format(
          "YYYY-MM-DD"
        );

        // --- اصلاحیه اصلی: ---
        // ما 'type' را مستقیماً بر اساس فیلد 'is_official' از API ست می‌کنیم
        const parsedHoliday: Holiday = {
          ...holiday,
          type: holiday.is_official
            ? HolidayType.OFFICIAL
            : HolidayType.AGREEMENT,
        };
        // --- پایان اصلاحیه ---

        holidayMap[gregorianDate] = parsedHoliday;
      }
      return holidayMap;
    },
    enabled: !!jalaliYear,
  });
};

export const useCreateHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHolidayDTO) =>
      toast.promise(api.createHoliday(data), {
        pending: "در حال ثبت تعطیلی...",
        success: "تعطیلی با موفقیت ثبت شد 👌",
        error: "خطا در ثبت تعطیلی 🤯",
      }),
    onSuccess: () => {
      console.log("Create success, invalidating cache...");
      queryClient.invalidateQueries({ queryKey: [HOLIDAY_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("خطا در ثبت تعطیلی (POST):", error);
    },
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date: string) =>
      toast.promise(api.deleteHoliday(date), {
        pending: "در حال حذف تعطیلی...",
        success: "تعطیلی با موفقیت حذف شد 👍",
        error: "خطا در حذف تعطیلی 🤯",
      }),
    onSuccess: () => {
      console.log("Delete success, invalidating cache...");
      queryClient.invalidateQueries({ queryKey: [HOLIDAY_QUERY_KEY] });
    },
    onError: (error) => {
      console.error("خطا در حذف تعطیلی (DELETE):", error);
    },
  });
};
