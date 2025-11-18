import { useEffect } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
// کامنت: مسیر schema باید بر اساس ساختار شما دقیق باشد
import type { NewWeekPatternFormData } from '../schema/NewWeekPatternSchema';
// کامنت: مسیر utils باید بر اساس ساختار شما دقیق باشد
import { calculateDurationInMinutes } from '../utils/timeCalculations';

/**
 * هوک سفارشی برای مدیریت محاسبات و منطق‌های وابسته در فرم الگوی هفتگی
 * (استخراج شده برای پیروی از اصل DRY)
 * @param watch - تابع watch از react-hook-form
 * @param setValue - تابع setValue از react-hook-form
 */
export const useWeekPatternDayCalculations = (
    watch: UseFormWatch<NewWeekPatternFormData>,
    setValue: UseFormSetValue<NewWeekPatternFormData>
) => {
    // کامنت: مراقب هستیم که watchedDays ممکن است در اولین رندر undefined باشد
    const watchedDays = watch('days');

    // افکت اول: مدیریت تیک "روز کاری"
    useEffect(() => {
        // کامنت: اگر هنوز watchedDays لود نشده، افکت را اجرا نمی‌کنیم
        if (!watchedDays) return;

        watchedDays.forEach((day, index) => {
            const isWorking = day.is_working_day;

            if (!isWorking) {
                // کامنت: اگر روز کاری نیست، همه‌چیز را پاک می‌کنیم
                setValue(`days.${index}.start_time`, null, { shouldDirty: true });
                setValue(`days.${index}.end_time`, null, { shouldDirty: true });
                setValue(`days.${index}.work_duration_minutes`, 0, { shouldValidate: true, shouldDirty: true });
            } else {
                // کامنت: اگر روز کاری است و زمان‌ها خالی هستند، با مقدار پیش‌فرض پر می‌کنیم
                const start = day.start_time ?? "08:00";
                const end = day.end_time ?? "16:00";
                const duration = calculateDurationInMinutes(start, end);

                // کامنت: اطمینان از اینکه مقادیر null با مقادیر معتبر جایگزین می‌شوند
                // (این بخش در useEditWeekPatternForm وجود نداشت و اضافه شد تا رفتار یکسان شود)
                if (day.start_time === null) setValue(`days.${index}.start_time`, start);
                if (day.end_time === null) setValue(`days.${index}.end_time`, end);

                setValue(`days.${index}.work_duration_minutes`, duration ?? 480, { shouldValidate: true });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedDays?.map((d) => d.is_working_day).join(","), setValue]); // کامنت: وابستگی فقط به is_working_day

    // افکت دوم: محاسبه خودکار مدت زمان بر اساس تغییر ساعات
    useEffect(() => {
        // کامنت: اگر هنوز watchedDays لود نشده، افکت را اجرا نمی‌کنیم
        if (!watchedDays) return;

        watchedDays.forEach((day, index) => {
            if (!day.is_working_day) return; // کامنت: اگر روز کاری نیست، محاسبات لازم نیست

            const start = day.start_time;
            const end = day.end_time;

            if (start && end) {
                const duration = calculateDurationInMinutes(start, end);
                if (duration !== null && duration !== day.work_duration_minutes) {
                    setValue(`days.${index}.work_duration_minutes`, duration, { shouldValidate: true, shouldDirty: true });
                }
            } else {
                // کامنت: اگر یکی از فیلدهای زمان خالی شد، مدت زمان را 0 می‌کنیم
                if (day.work_duration_minutes !== 0) {
                    setValue(`days.${index}.work_duration_minutes`, 0, { shouldValidate: true, shouldDirty: true });
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedDays?.map((d) => `${d.start_time}-${d.end_time}-${d.is_working_day}`).join(","), setValue]); // کامنت: وابستگی به ساعات و وضعیت روز کاری
};