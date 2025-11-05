import { useQuery } from "@tanstack/react-query";
// کامنت: مطمئن شوید مسیر ایمپورت تابع API صحیح است
import { getWeekPatternById } from "@/features/work-pattern/api/workPatternAPI";
import {
  type SingleWeekPatternApiResponse,
  // ✅ ۱. ایمپورت تایپ صحیح UI
  type WorkPatternUI,
  type DailyScheduleUI,
  type AtomicPattern,
  // ✅ ۲. ایمپورت تایپ صحیح داده API
  type WeekPatternDetail,
} from "@/features/work-pattern/types/index";

// نقشه نام پراپرتی API به نام فارسی و اندیس روز (بدون تغییر)
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

/**
 * تابع برای تبدیل داده جزئیات الگو از فرمت API (با پراپرتی‌های روز مجزا) به فرمت UI
 */
// ✅ ۳. استفاده از تایپ صحیح برای پارامتر ورودی و خروجی
const transformDetailsApiToUi = (apiData: WeekPatternDetail): WorkPatternUI => {
  // ۱. ساخت آرایه daily_schedules با تکرار روی dayMapping
  const daily_schedules: DailyScheduleUI[] = Object.entries(dayMapping)
    .map(([apiKey, { name, index }]) => {
      const atomicPattern = (apiData as any)[apiKey] as AtomicPattern | null;

      // ✅✅✅ اصلاح شده: استفاده از نام صحیح work_duration_minutes ✅✅✅
      const duration = atomicPattern?.work_duration_minutes; // دسترسی امن
      const isWorking =
        !!atomicPattern && typeof duration === "number" && duration > 0;

      return {
        dayOfWeekName: name,
        dayIndex: index,
        atomicPattern: atomicPattern,
        is_working_day: isWorking, // <-- حالا باید درست محاسبه شود
        start_time: atomicPattern?.start_time || null,
        end_time: atomicPattern?.end_time || null,
        // ✅ استفاده از مقدار duration که از work_duration_minutes خوانده شده
        work_duration_minutes:
          isWorking && typeof duration === "number" ? duration : 0,
      };
    })
    // مرتب‌سازی (بدون تغییر)
    .sort((a, b) => a.dayIndex - b.dayIndex);

  // تعیین نوع کلی الگو (بدون تغییر)
  let overallType: WorkPatternUI["type"] = "off"; // ✅ استفاده از تایپ UI
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
    // ✅✅✅ اصلاح خطای (TS2741) ✅✅✅
    // کامنت: فیلد اجباری pattern_type را به خروجی اضافه می‌کنیم.
    pattern_type: "WEEK_PATTERN",
  };
};

/**
 * هوک برای فچ کردن جزئیات یک الگوی کاری هفتگی و تبدیل آن به فرمت UI.
 */
export const useWeekPatternDetails = (patternId: number | string | null) => {
  return useQuery({
    queryKey: ["weekPatternDetails", patternId],
    queryFn: () => getWeekPatternById(patternId!),
    enabled: !!patternId,
    // ✅ ۴. استفاده از تایپ صحیح UI در خروجی select
    select: (
      apiResponse: SingleWeekPatternApiResponse
    ): WorkPatternUI | null => {
      if (apiResponse && apiResponse.data) {
        return transformDetailsApiToUi(apiResponse.data);
      }
      console.warn(
        "Invalid API response structure received for details:",
        apiResponse
      );
      return null;
    },
    // staleTime: 1000 * 60 * 10,
  });
};
