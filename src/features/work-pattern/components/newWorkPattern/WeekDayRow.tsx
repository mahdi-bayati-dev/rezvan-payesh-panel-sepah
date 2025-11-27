import type { Control, FieldErrors, UseFormRegister, FieldArrayWithId } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { daysOfWeek } from '@/features/work-pattern/utils/constants';
import type { NewWeekPatternFormData } from '@/features/work-pattern/schema/NewWeekPatternSchema';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';
import clsx from 'clsx';
import { Clock } from 'lucide-react';

interface WeekDayRowProps {
    field: FieldArrayWithId<NewWeekPatternFormData, "days", "id">;
    index: number;
    isWorking: boolean;
    control: Control<NewWeekPatternFormData>;
    register: UseFormRegister<NewWeekPatternFormData>;
    formErrors: FieldErrors<NewWeekPatternFormData>;
    isPending: boolean;
}

export const WeekDayRow = ({
    field,
    index,
    isWorking,
    control,
    register,
    formErrors,
    isPending
}: WeekDayRowProps) => {

    const dayName = daysOfWeek[field.day_of_week] || `روز ${index + 1}`;
    const dayErrors = formErrors.days?.[index];
    const hasError = !!(dayErrors?.start_time || dayErrors?.end_time || dayErrors?.work_duration_minutes);

    return (
        <div className={clsx(
            "group relative grid grid-cols-12 gap-x-4 gap-y-3 items-start p-4 rounded-xl transition-all duration-200 border",
            // ✨ UX Fix: تغییر رنگ پس‌زمینه برای روزهای کاری و غیرکاری برای تشخیص سریع‌تر
            isWorking
                ? "bg-backgroundL-500 dark:bg-backgroundD border-borderL dark:border-borderD shadow-sm"
                : "bg-secondaryL/30 dark:bg-secondaryD/10 border-transparent opacity-70 hover:opacity-100",
            hasError && "border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
        )}>

            {/* --- هدر ردیف: نام روز و چک‌باکس --- */}
            <div className="col-span-12 md:col-span-2 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-2">
                <span className={clsx(
                    "font-bold text-sm",
                    isWorking ? "text-foregroundL dark:text-foregroundD" : "text-muted-foregroundL"
                )}>
                    {dayName}
                </span>

                <Controller
                    name={`days.${index}.is_working_day`}
                    control={control}
                    render={({ field: checkboxField }) => (
                        <Checkbox
                            id={`is_working_${index}`}
                            label="روز کاری"
                            checked={!!checkboxField.value}
                            onCheckedChange={checkboxField.onChange}
                            disabled={isPending}
                            className="text-xs"
                        />
                    )}
                />
            </div>

            {/* --- بخش زمان‌ها (فقط اگر روز کاری باشد فعال است) --- */}
            <div className={clsx(
                "col-span-12 md:col-span-10 grid grid-cols-2 md:grid-cols-10 gap-3 items-start transition-all duration-300",
                !isWorking && "opacity-40 grayscale pointer-events-none filter blur-[0.5px]"
            )}>

                {/* ساعت شروع */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD flex items-center gap-1">
                        <Clock className="w-3 h-3" /> شروع
                    </label>
                    <Controller
                        name={`days.${index}.start_time`}
                        control={control}
                        render={({ field }) => (
                            <CustomTimeInput
                                value={field.value}
                                onChange={field.onChange}
                                disabled={!isWorking || isPending}
                                placeholder="08:00"
                                className={clsx("h-9 text-center  text-sm", dayErrors?.start_time && "border-red-500")}
                            />
                        )}
                    />
                    <ErrorMessage message={dayErrors?.start_time?.message} />
                </div>

                {/* ساعت پایان */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD flex items-center gap-1">
                        <Clock className="w-3 h-3" /> پایان
                    </label>
                    <Controller
                        name={`days.${index}.end_time`}
                        control={control}
                        render={({ field }) => (
                            <CustomTimeInput
                                value={field.value}
                                onChange={field.onChange}
                                disabled={!isWorking || isPending}
                                placeholder="16:00"
                                className={clsx("h-9 text-center  text-sm", dayErrors?.end_time && "border-red-500")}
                            />
                        )}
                    />
                    <ErrorMessage message={dayErrors?.end_time?.message} />
                </div>

                {/* مدت زمان (فشرده شده برای موبایل) */}
                <div className="col-span-2 md:col-span-4 space-y-1.5">
                    <label htmlFor={`duration_${index}`} className="text-xs font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                        مدت (دقیقه)
                    </label>
                    <div className="relative">
                        <Input
                            id={`duration_${index}`}
                            type="number"
                            {...register(`days.${index}.work_duration_minutes`)}
                            disabled={true} // همیشه غیرفعال چون محاسبه می‌شود
                            className="h-9 text-center  text-sm disabled:opacity-80 disabled:bg-secondaryL/50 dark:disabled:bg-secondaryD/50"
                        />
                        {/* نمایش ساعت معادل برای UX بهتر */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foregroundL dir-ltr pointer-events-none">
                            {control._formValues.days?.[index]?.work_duration_minutes
                                ? `≈ ${(control._formValues.days[index].work_duration_minutes / 60).toFixed(1)}h`
                                : ''}
                        </div>
                    </div>
                    <ErrorMessage message={dayErrors?.work_duration_minutes?.message} />
                </div>
            </div>
        </div>
    );
};

// کامپوننت کمکی کوچک برای نمایش خطا
const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return <div className="h-0" />; // برای حفظ layout
    return (
        <p className="text-[10px] text-red-600 dark:text-red-400 font-medium animate-in slide-in-from-top-1">
            {message}
        </p>
    );
};