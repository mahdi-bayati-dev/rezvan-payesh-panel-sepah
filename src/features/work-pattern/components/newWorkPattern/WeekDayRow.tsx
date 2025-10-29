import type { Control, FieldErrors, UseFormRegister, FieldArrayWithId } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import { daysOfWeek } from '@/features/work-pattern/utils/constants';
import type { NewWeekPatternFormData } from '@/features/work-pattern/schema/NewWeekPatternSchema';

// کامنت: این کامپوننت فقط مسئول رندر کردن یک ردیف از روزهای هفته است.
// تمام پراپ‌های مورد نیاز خود را از کامپوننت پدر (NewWeekPatternForm) می‌گیرد.

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
        <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-center border-b  border-borderL  transition-colors duration-300 dark:bg-backgroundD dark:border-borderD pb-3  last:border-b-0 last:pb-0">
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
                            onCheckedChange={checkboxField.onChange}
                            disabled={isPending}
                        />
                    )}
                />
                {dayErrors?.is_working_day?.message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {dayErrors.is_working_day.message}
                    </p>
                )}
            </div>
            <div className="col-span-12 sm:col-span-3">
                <Input
                    label="ساعت شروع" type="time"
                    {...register(`days.${index}.start_time`)}
                    error={dayErrors?.start_time?.message}
                    disabled={!isWorking || isPending}
                    className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700" dir="ltr"
                />
            </div>
            <div className="col-span-12 sm:col-span-3">
                <Input
                    label="ساعت پایان" type="time"
                    {...register(`days.${index}.end_time`)}
                    error={dayErrors?.end_time?.message}
                    disabled={!isWorking || isPending}
                    className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700" dir="ltr"
                />
            </div>

            <div className="col-span-12 sm:col-span-3">
                <Input
                    label="مدت (دقیقه)" type="number"
                    {...register(`days.${index}.work_duration_minutes`)}
                    error={dayErrors?.work_duration_minutes?.message}
                    disabled={true}
                    className="disabled:opacity-50 disabled:bg-stone-100 dark:disabled:bg-stone-700"
                    min="0" max="1440"
                />
            </div>
        </div>
    );
};
