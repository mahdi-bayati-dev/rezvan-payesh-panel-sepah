import { useEffect } from "react";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { NewWeekPatternFormData } from "../../schema/NewWeekPatternSchema";
import { calculateDurationInMinutes } from "../..//utils/timeCalculations";

/**
 * @description مدیریت خودکار محاسبات در فرم‌های ثبت الگو.
 * این هوک از بروز ناهماهنگی بین ساعت شروع/پایان و مدت زمان جلوگیری می‌کند.
 */
export const useWeekPatternDayCalculations = (
  watch: UseFormWatch<NewWeekPatternFormData>,
  setValue: UseFormSetValue<NewWeekPatternFormData>
) => {
  const watchedDays = watch("days");

  // افکت ۱: مدیریت تغییر وضعیت روز کاری
  useEffect(() => {
    if (!watchedDays) return;

    watchedDays.forEach((day, index) => {
      if (!day.is_working_day) {
        // اگر روز تعطیل شد، مقادیر باید طبق استاندارد دیتابیس null شوند
        setValue(`days.${index}.start_time`, null, { shouldDirty: true });
        setValue(`days.${index}.end_time`, null, { shouldDirty: true });
        setValue(`days.${index}.work_duration_minutes`, 0, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        // اگر روز کاری شد و مقادیر خالی بود، مقدار پیش‌فرض ست شود
        if (day.start_time === null)
          setValue(`days.${index}.start_time`, "08:00");
        if (day.end_time === null) setValue(`days.${index}.end_time`, "16:00");
      }
    });
  }, [watchedDays?.map((d) => d.is_working_day).join(","), setValue]);

  // افکت ۲: محاسبه آنی مدت زمان (Duration)
  useEffect(() => {
    if (!watchedDays) return;

    watchedDays.forEach((day, index) => {
      if (!day.is_working_day) return;

      const start = day.start_time;
      const end = day.end_time;

      if (start && end) {
        const duration = calculateDurationInMinutes(start, end);
        if (duration !== null && duration !== day.work_duration_minutes) {
          setValue(`days.${index}.work_duration_minutes`, duration, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    });
  }, [
    watchedDays?.map((d) => `${d.start_time}-${d.end_time}`).join(","),
    setValue,
  ]);
};
