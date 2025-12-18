import apiClient from "@/lib/AxiosConfig";
import type { Holiday, CreateHolidayDTO, PaginatedResponse } from "../types";
import moment from "jalali-moment";

/**
 * دریافت لیست تمام تعطیلات برای یک سال مشخص (با مدیریت صفحات)
 */
export const getHolidaysByYear = async (
  jalaliYear: number
): Promise<Holiday[]> => {
  const startDate = moment(`${jalaliYear}/01/01`, "jYYYY/jMM/jDD").format(
    "jYYYY-jMM-jDD"
  );
  const endDate = moment(`${jalaliYear}/01/01`, "jYYYY/jMM/jDD")
    .endOf("jYear")
    .format("jYYYY-jMM-jDD");

  // ۱. دریافت صفحه اول برای فهمیدن تعداد کل صفحات
  const firstPageResponse = await apiClient.get<PaginatedResponse<Holiday>>(
    "/holidays",
    {
      params: { start_date: startDate, end_date: endDate, page: 1 },
    }
  );

  const { meta } = firstPageResponse.data;
  let allHolidays = [...firstPageResponse.data.data];

  // ۲. اگر صفحات بیشتری وجود دارد، بقیه را دریافت کن
  if (meta.last_page > 1) {
    const pagePromises = [];
    for (let p = 2; p <= meta.last_page; p++) {
      pagePromises.push(
        apiClient.get<PaginatedResponse<Holiday>>("/holidays", {
          params: { start_date: startDate, end_date: endDate, page: p },
        })
      );
    }

    const remainingPages = await Promise.all(pagePromises);
    remainingPages.forEach((res) => {
      allHolidays = [...allHolidays, ...res.data.data];
    });
  }

  return allHolidays;
};

export const createHoliday = async (
  data: CreateHolidayDTO
): Promise<Holiday> => {
  const response = await apiClient.post<{ data: Holiday }>("/holidays", data);
  return response.data.data;
};

export const deleteHoliday = async (date: string): Promise<void> => {
  await apiClient.delete(`/holidays/${date}`);
};
