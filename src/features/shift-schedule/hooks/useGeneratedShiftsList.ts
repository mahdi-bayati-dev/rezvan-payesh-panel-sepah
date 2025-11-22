import { useQuery } from "@tanstack/react-query";
import { getGeneratedShifts } from "../api/api";
import type { GetShiftsParams } from "../types";

export const useGeneratedShiftsList = (
  shiftScheduleId: number | string,
  params: GetShiftsParams
) => {
  return useQuery({
    // کلید کوئری شامل تمام پارامترهای فیلتر است تا با تغییر هر کدام، دیتا رفرش شود
    queryKey: ["generatedShifts", shiftScheduleId, params],
    queryFn: () => getGeneratedShifts(shiftScheduleId, params),
    // این کوئری فقط زمانی اجرا شود که ID وجود دارد
    enabled: !!shiftScheduleId,
    // دیتا را برای ۱ دقیقه تازه نگه دار
    staleTime: 1000 * 60, 
  });
};