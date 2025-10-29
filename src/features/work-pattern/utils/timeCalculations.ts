// کامنت: این یک تابع خالص (Pure Function) است و نباید داخل کامپوننت تعریف شود.
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
    const endTimeInMinutes = endHours * 60 + endMinutes;
    return endTimeInMinutes <= startTimeInMinutes
      ? 0
      : endTimeInMinutes - startTimeInMinutes;
  } catch {
    return null;
  }
};
