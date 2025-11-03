import apiClient from "@/lib/AxiosConfig";
import type { Holiday, CreateHolidayDTO, PaginatedResponse } from "../types";
import moment from "jalali-moment"; // برای ساخت فیلتر جلالی

/**
 * دریافت لیست تمام تعطیلات برای یک سال مشخص (جلالی)
 */
export const getHolidaysByYear = async (
  jalaliYear: number
): Promise<Holiday[]> => {
  // --- اصلاحیه اصلی اینجاست ---
  // از 'moment.jMoment' (که وجود ندارد)
  // به 'moment(date, format)' تغییر دادیم

  // ۱. ساخت تاریخ شروع جلالی
  const startDate = moment(
    `${jalaliYear}/01/01`,
    "jYYYY/jMM/jDD" // فرمت ورودی را مشخص می‌کنیم
  ).format("jYYYY-jMM-jDD"); // فرمت خروجی مورد نیاز API

  // ۲. محاسبه روز آخر سال جلالی (کبیسه یا عادی)
  const endDate = moment(
    `${jalaliYear}/01/01`, // از همان تاریخ شروع استفاده می‌کنیم
    "jYYYY/jMM/jDD"
  )
    .endOf("jYear") // به انتهای سال جلالی می‌رویم
    .format("jYYYY-jMM-jDD");
  // --- پایان اصلاحیه ---

  console.log(
    `Fetching holidays for Jalali year: ${jalaliYear} (Dates: ${startDate} to ${endDate})`
  );

  const response = await apiClient.get<PaginatedResponse<Holiday>>(
    "/holidays",
    {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    }
  );

  console.log("API Response Data:", response.data.data);
  return response.data.data;
};

/**
 * ثبت یک روز تعطیل جدید
 */
export const createHoliday = async (
  data: CreateHolidayDTO
): Promise<Holiday> => {
  console.log("Creating holiday (POST):", data); // لاگ اضافه شد
  const response = await apiClient.post<{ data: Holiday }>("/holidays", data);
  return response.data.data;
};

/**
 * حذف یک روز تعطیل بر اساس تاریخ (میلادی)
 */
export const deleteHoliday = async (date: string): Promise<void> => {
  console.log("Deleting holiday (DELETE):", date); // لاگ اضافه شد
  await apiClient.delete(`/holidays/${date}`);
};
