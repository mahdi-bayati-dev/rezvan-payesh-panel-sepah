import { useForm, Controller, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { newWeekPatternSchema, type NewWeekPatternFormData } from "@/features/work-pattern/schema/NewWeekPatternSchema";
import { useCreateWeekPattern } from '@/features/work-pattern/hooks/useCreateWeekPatternPost';
import { AxiosError } from 'axios';
import type { ApiValidationError, WeekPatternPayload, DayPayload } from '@/features/work-pattern/types/index';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';


interface NewWeekPatternFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];



const calculateDurationInMinutes = (start: string | null, end: string | null): number | null => {
    if (!start || !end || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return null;
    try {
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        const startTimeInMinutes = (startHours * 60) + startMinutes;
        const endTimeInMinutes = (endHours * 60) + endMinutes;
        return endTimeInMinutes <= startTimeInMinutes ? 0 : endTimeInMinutes - startTimeInMinutes;
    } catch { return null; }
};

export const NewWeekPatternForm = ({ onSuccess, onCancel }: NewWeekPatternFormProps) => {
    const { mutate, isPending, error: mutationError } = useCreateWeekPattern();


    const {
        register, control, handleSubmit, watch, setValue,
        formState: { errors: formErrors }, setError: setFormError,
    } = useForm<NewWeekPatternFormData>({
        resolver: zodResolver(newWeekPatternSchema),
        defaultValues: {
            name: '',
            days: daysOfWeek.map((_, index) => ({
                day_of_week: index, is_working_day: index < 5,
                start_time: index < 5 ? '08:00' : null, end_time: index < 5 ? '16:00' : null,
                // کامنت: برای روزهای غیرکاری در ابتدا 0 قرار می‌دهیم تا با اسکیما هماهنگ باشد
                work_duration_minutes: index < 5 ? 480 : 0,
            })),
        },
    });




    const { fields } = useFieldArray({ control, name: 'days' });

    const watchedDays = watch('days');

    useEffect(() => {
        // زمانی که فقط وضعیت "روز کاری" تغییر می‌کند
        watchedDays.forEach((day, index) => {
            const isWorking = day.is_working_day;

            if (!isWorking) {
                // وقتی تیک برداشته می‌شود:
                setValue(`days.${index}.start_time`, null, { shouldDirty: true });
                setValue(`days.${index}.end_time`, null, { shouldDirty: true });
                setValue(`days.${index}.work_duration_minutes`, 0, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            } else {
                // وقتی دوباره تیک زده شود، در صورت نیاز ساعت‌ها برگردند
                const start = day.start_time ?? "08:00";
                const end = day.end_time ?? "16:00";
                const duration = calculateDurationInMinutes(start, end);
                setValue(`days.${index}.start_time`, start);
                setValue(`days.${index}.end_time`, end);
                setValue(`days.${index}.work_duration_minutes`, duration ?? 480, {
                    shouldValidate: true,
                });
            }
        });
    }, [watchedDays.map((d) => d.is_working_day).join(","), setValue]);

// ✅ محاسبه خودکار مدت در هنگام تغییر ساعت‌ها
useEffect(() => {
  watchedDays.forEach((day, index) => {
    if (!day.is_working_day) return; // فقط برای روزهای کاری

    const start = day.start_time;
    const end = day.end_time;

    // فقط وقتی هر دو مقدار معتبر باشند
    if (start && end) {
      const duration = calculateDurationInMinutes(start, end);

      // اگر مقدار محاسبه شده جدید است، فرم را به‌روز کن
      if (duration !== null && duration !== day.work_duration_minutes) {
        setValue(`days.${index}.work_duration_minutes`, duration, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else {
      // اگر یکی از فیلدها حذف شد، مقدار را 0 قرار بده
      if (day.work_duration_minutes !== 0) {
        setValue(`days.${index}.work_duration_minutes`, 0, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  });
}, [
  watchedDays.map((d) => `${d.start_time}-${d.end_time}-${d.is_working_day}`).join(","), 
  setValue
]);


    const onSubmit: SubmitHandler<NewWeekPatternFormData> = (data) => {
        const payload: WeekPatternPayload = {
            name: data.name,
            days: data.days.map((day): DayPayload => ({
                day_of_week: day.day_of_week,
                is_working_day: day.is_working_day,
                start_time: day.is_working_day ? day.start_time : null,
                end_time: day.is_working_day ? day.end_time : null,


                work_duration_minutes: day.is_working_day ? (day.work_duration_minutes ?? null) : 0,
            })),
        };

        mutate(payload, {
            onSuccess, // خلاصه نویسی
            onError: (error) => { // فقط مدیریت خطای 422 در اینجا
                if (error.response?.status === 422) {
                    const apiErrors = (error as AxiosError<ApiValidationError>).response?.data.errors;
                    if (apiErrors) {
                        Object.entries(apiErrors).forEach(([field, messages]) => {
                            const fieldName = field.replace(/\.(\d+)\./, `.$1.`);
                            try { setFormError(fieldName as any, { type: 'server', message: messages[0] }); }
                            catch (e) { console.error("Error setting form error:", fieldName, e); }
                        });
                    }
                }
                // خطاهای دیگر توسط هوک (toast) مدیریت می‌شوند
            },
        });
    };

    const generalApiError = (mutationError && mutationError.response?.status !== 422)
        ? (mutationError as AxiosError<{ message: string }>)?.response?.data?.message || 'خطای ناشناخته ای رخ داد.' : null;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-6">
                {/* ... (بخش نمایش خطای کلی - بدون تغییر) ... */}
                {generalApiError && (
                    <Alert variant="destructive">
                        <AlertTitle>خطا</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}
                <Input
                    label="نام الگو"
                    {...register('name')}
                    error={formErrors.name?.message}
                    placeholder="مثلاً: برنامه اداری استاندارد"
                    disabled={isPending}
                />

                <div className="space-y-4 border rounded-md p-4 dark:border-stone-700">
                    <h3 className="text-md font-medium mb-3 text-stone-700 dark:text-stone-300"> {/* اصلاح text:stone*/}
                        برنامه زمانی هفتگی
                    </h3>

                    {fields.map((field, index) => {
                        const dayName = daysOfWeek[field.day_of_week] || `روز ${index + 1}`;
                        const isWorking = watchedDays?.[index]?.is_working_day ?? false;
                        return (
                            <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center border-b pb-3 dark:border-stone-700 last:border-b-0 last:pb-0">
                                <span className="col-span-12 sm:col-span-1 font-medium text-sm pt-2 sm:pt-0 dark:text-stone-300">
                                    {dayName}
                                </span>

                                <div className="col-span-12 sm:col-span-2">
                                    <Controller
                                        name={`days.${index}.is_working_day`}
                                        control={control}
                                        render={({ field: checkboxField }) => (
                                            <Checkbox
                                                id={`is_working_${index}`}
                                                label="روز کاری"
                                                checked={!!checkboxField.value}
                                                onCheckedChange={checkboxField.onChange} // useEffect بقیه کارها را می‌کند
                                                disabled={isPending}
                                            />
                                        )}
                                    />
                                    {formErrors.days?.[index]?.is_working_day?.message && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            {formErrors.days[index]?.is_working_day?.message}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-12 sm:col-span-3">
                                    <Input
                                        label="ساعت شروع" type="time"
                                        {...register(`days.${index}.start_time`)}
                                        error={formErrors.days?.[index]?.start_time?.message}
                                        disabled={!isWorking || isPending}
                                        className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700" dir="ltr"
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-3">
                                    <Input
                                        label="ساعت پایان" type="time"
                                        {...register(`days.${index}.end_time`)}
                                        error={formErrors.days?.[index]?.end_time?.message}
                                        disabled={!isWorking || isPending}
                                        className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700" dir="ltr"
                                    />
                                </div>

                                <div className="col-span-12 sm:col-span-3">
                                    <Input
                                        label="مدت (دقیقه)" type="number"
                                        {...register(`days.${index}.work_duration_minutes`)}
                                        error={formErrors.days?.[index]?.work_duration_minutes?.message}
                                        disabled={true} // چون خودکار محاسبه می‌شود
                                        className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700"
                                        min="0" max="1440"
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {/* ... (خطای ریشه آرایه - بدون تغییر) ... */}
                    {formErrors.days?.root?.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            {formErrors.days.root.message}
                        </p>
                    )}
                </div>
                {/* ... (دکمه‌ها - بدون تغییر) ... */}
                <div className="flex justify-start gap-4 pt-6 border-t dark:border-stone-700">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        {isPending ? 'در حال ذخیره...' : 'ذخیره الگو'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                        لغو
                    </Button>
                </div>
            </div>
        </form>
    );
};
