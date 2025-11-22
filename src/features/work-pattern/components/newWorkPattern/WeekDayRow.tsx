import type { Control, FieldErrors, UseFormRegister, FieldArrayWithId } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { daysOfWeek } from '@/features/work-pattern/utils/constants';
import type { NewWeekPatternFormData } from '@/features/work-pattern/schema/NewWeekPatternSchema';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

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

    return (
        <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-center border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD pb-3 last:border-b-0 last:pb-0">

            {/* --- ستون نام روز --- */}
            <span className="col-span-12 sm:col-span-1 font-medium text-sm pt-2 sm:pt-0 dark:text-stone-300">
                {dayName}
            </span>

            {/* --- ستون چک‌باکس روز کاری --- */}
            <div className="col-span-12 sm:col-span-2">
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
                        />
                    )}
                />
                {/* فضای خطا برای هماهنگی ارتفاع */}
                <div className="h-5">
                    {dayErrors?.is_working_day?.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {dayErrors.is_working_day.message}
                        </p>
                    )}
                </div>
            </div>

            {/* --- ستون ساعت شروع --- */}
            <div className="col-span-12 sm:col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-foregroundL dark:text-foregroundD">
                    ساعت شروع
                </label>
                <Controller
                    name={`days.${index}.start_time`}
                    control={control}
                    render={({ field }) => (
                        <CustomTimeInput
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!isWorking || isPending}
                            className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700"
                            placeholder="08:00"
                        />
                    )}
                />
                <div className="h-5">
                    {dayErrors?.start_time?.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {dayErrors.start_time.message}
                        </p>
                    )}
                </div>
            </div>

            {/* --- ستون ساعت پایان --- */}
            <div className="col-span-12 sm:col-span-3">
                <label className="mb-1.5 block text-sm font-medium text-foregroundL dark:text-foregroundD">
                    ساعت پایان
                </label>
                <Controller
                    name={`days.${index}.end_time`}
                    control={control}
                    render={({ field }) => (
                        <CustomTimeInput
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!isWorking || isPending}
                            className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700"
                            placeholder="16:00"
                        />
                    )}
                />
                <div className="h-5">
                    {dayErrors?.end_time?.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {dayErrors.end_time.message}
                        </p>
                    )}
                </div>
            </div>

            {/* --- ستون مدت زمان (اصلاح شده برای هم‌ترازی دقیق) --- */}
            <div className="col-span-12 sm:col-span-3">
                {/* ✅ ۱. استفاده از لیبل دستی دقیقاً مثل ستون‌های ساعت */}
                <label
                    htmlFor={`duration_${index}`}
                    className="mb-1.5 block text-sm font-medium text-foregroundL dark:text-foregroundD"
                >
                    مدت (دقیقه)
                </label>

                {/* ✅ ۲. استفاده از Input بدون لیبل و ارور داخلی */}
                <Input
                    id={`duration_${index}`}
                    type="number"
                    {...register(`days.${index}.work_duration_minutes`)}
                    disabled={true}
                    className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700 text-center"
                    min="0" max="1440"
                // مهم: لیبل و ارور را اینجا پاس نمی‌دهیم تا ساختار DOM با تایم‌ها یکی شود
                />

                {/* ✅ ۳. فضای رزرو شده برای خطا (دقیقاً مثل ستون‌های ساعت) */}
                <div className="h-5">
                    {dayErrors?.work_duration_minutes?.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {dayErrors.work_duration_minutes.message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};