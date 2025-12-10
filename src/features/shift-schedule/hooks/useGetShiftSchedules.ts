import { useQuery } from "@tanstack/react-query";
import {
  fetchShiftSchedules,
  fetchShiftScheduleById,
} from "@/features/shift-schedule/api/api";
import { shiftScheduleKeys } from "./queryKeys";
import type { PaginatedShiftScheduleResponse } from "@/features/shift-schedule/types/index";
import type {
  WorkPatternUI,
  ApiPaginationMeta,
  ApiPaginationLinks,
} from "@/features/work-pattern/types/index";

// ---------------- دریافت لیست ----------------
export const useShiftSchedules = (page: number, per_page: number = 15) => {
  return useQuery({
    queryKey: [...shiftScheduleKeys.lists(), { page, per_page }],
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

// ---------------- دریافت جزئیات ----------------
export const useShiftSchedule = (id: number | string) => {
  return useQuery({
    queryKey: shiftScheduleKeys.details(id),
    queryFn: () => fetchShiftScheduleById(id),
    enabled: !!id,
  });
};
