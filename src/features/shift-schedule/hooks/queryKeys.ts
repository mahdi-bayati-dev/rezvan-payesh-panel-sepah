// این فایل فقط مسئول نگهداری کلیدهای React Query است
// این کار باعث می‌شود مدیریت Cache در کل ماژول یکپارچه باشد

export const shiftScheduleKeys = {
  all: ["shiftSchedules"] as const,
  lists: () => [...shiftScheduleKeys.all, "list"] as const,
  details: (id: number | string) =>
    [...shiftScheduleKeys.all, "detail", id] as const,
};
