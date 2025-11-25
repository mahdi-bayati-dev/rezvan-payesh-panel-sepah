import { useQuery } from "@tanstack/react-query";
import { getWeekPatternById } from "@/features/work-pattern/api/workPatternAPI";
import {
  type SingleWeekPatternApiResponse,
  type WorkPatternUI,
  type DailyScheduleUI,
  type AtomicPattern,
  type WeekPatternDetail,
} from "@/features/work-pattern/types/index";

const dayMapping: {
  [key: string]: { name: DailyScheduleUI["dayOfWeekName"]; index: number };
} = {
  saturday_pattern: { name: "شنبه", index: 0 },
  sunday_pattern: { name: "یکشنبه", index: 1 },
  monday_pattern: { name: "دوشنبه", index: 2 },
  tuesday_pattern: { name: "سه شنبه", index: 3 },
  wednesday_pattern: { name: "چهارشنبه", index: 4 },
  thursday_pattern: { name: "پنجشنبه", index: 5 },
  friday_pattern: { name: "جمعه", index: 6 },
};

const transformDetailsApiToUi = (apiData: WeekPatternDetail): WorkPatternUI => {
  const daily_schedules: DailyScheduleUI[] = Object.entries(dayMapping)
    .map(([apiKey, { name, index }]) => {
      const atomicPattern = (apiData as any)[apiKey] as AtomicPattern | null;
      const duration = atomicPattern?.work_duration_minutes;
      const isWorking =
        !!atomicPattern && typeof duration === "number" && duration > 0;

      return {
        dayOfWeekName: name,
        dayIndex: index,
        atomicPattern: atomicPattern,
        is_working_day: isWorking,
        start_time: atomicPattern?.start_time || null,
        end_time: atomicPattern?.end_time || null,
        work_duration_minutes:
          isWorking && typeof duration === "number" ? duration : 0,
      };
    })
    .sort((a, b) => a.dayIndex - b.dayIndex);

  let overallType: WorkPatternUI["type"] = "off";
  const patternTypes = new Set(
    daily_schedules.map((d) => d.atomicPattern?.type).filter(Boolean)
  );
  const workingDaysCount = daily_schedules.filter(
    (d) => d.is_working_day
  ).length;

  if (workingDaysCount > 0) {
    if (patternTypes.size > 1) {
      overallType = "mixed";
    } else if (patternTypes.has("fixed")) {
      overallType = "fixed";
    } else if (patternTypes.has("floating")) {
      overallType = "floating";
    }
  }

  return {
    id: apiData.id,
    name: apiData.name,
    organizationName: apiData.organization_name,
    type: overallType,
    daily_schedules: daily_schedules,
    pattern_type: "WEEK_PATTERN",
    // ✅ مپ کردن مقادیر شناوری از API به UI
    floating_start: apiData.floating_start,
    floating_end: apiData.floating_end,
  };
};

export const useWeekPatternDetails = (patternId: number | string | null) => {
  const queryKey = ["weekPatternDetails", String(patternId)];

  return useQuery({
    queryKey: queryKey,
    queryFn: () => getWeekPatternById(patternId!),
    enabled: !!patternId && patternId !== "0",

    select: (
      apiResponse: SingleWeekPatternApiResponse
    ): WorkPatternUI | null => {
      if (apiResponse && apiResponse.data) {
        return transformDetailsApiToUi(apiResponse.data);
      }
      return null;
    },
  });
};
