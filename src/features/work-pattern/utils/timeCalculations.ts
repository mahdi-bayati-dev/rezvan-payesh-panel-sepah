/**
 * @description محاسبه مدت زمان کارکرد به دقیقه.
 * @summary این تابع کاملاً Pure است و هیچ وابستگی به منطقه زمانی (Timezone) ندارد.
 */
export const calculateDurationInMinutes = (
  start: string | null,
  end: string | null
): number | null => {
  if (
    !start ||
    !end ||
    !/^\d{2}:\d{2}$/.test(start) ||
    !/^\d{2}:\d{2}$/.test(end)
  )
    return null;

  try {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTimeInMinutes = startHours * 60 + startMinutes;
    let endTimeInMinutes = endHours * 60 + endMinutes;

    // ✅ مدیریت استاندارد شیفت‌های شبانه (Cross-day shifts)
    // اگر ساعت پایان کوچکتر از شروع باشد، یعنی شیفت در روز بعد تمام شده است.
    if (endTimeInMinutes < startTimeInMinutes) {
      endTimeInMinutes += 24 * 60; // اضافه کردن ۱۴۴۰ دقیقه (یک روز کامل)
    }

    const duration = endTimeInMinutes - startTimeInMinutes;
    
    // حداکثر زمان مجاز در یک شبانه‌روز (۱۴۴۰ دقیقه)
    return duration >= 0 ? duration : 0;
  } catch (e) {
    console.error("❌ [TimeCalc] Error:", e);
    return null;
  }
};

/**
 * تبدیل دقیقه به فرمت ساعت:دقیقه (مثلاً ۴۸۰ -> ۰۸:۰۰)
 */
export const minutesToFormattedTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};