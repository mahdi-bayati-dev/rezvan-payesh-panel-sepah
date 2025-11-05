// کامنت: این تابع خالص (Pure Function) است و نباید داخل کامپوننت تعریف شود.
// با جدا کردن آن، تست کردن آن نیز آسان‌تر می‌شود.
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

    // ✅ اصلاحیه حرفه‌ای برای شیفت شبانه:
    // اگر زمان پایان کوچکتر یا مساوی زمان شروع باشد، فرض می‌کنیم شیفت به روز بعد می‌رود
    if (endTimeInMinutes <= startTimeInMinutes) {
      endTimeInMinutes += 24 * 60; // اضافه کردن 1440 دقیقه (یک روز کامل)
    }

    const duration = endTimeInMinutes - startTimeInMinutes;
    // کامنت: مدت زمان باید منطقی باشد
    return duration > 0 ? duration : 0;
  } catch (e) {
    console.error("Error calculating duration:", e);
    return null;
  }
};
