import { useShiftScheduleForm } from '@/features/shift-schedule/hooks/useShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import React, { useMemo } from 'react'; // ۱. ایمپورت useMemo
import { Controller } from 'react-hook-form'; // ۲. ایمپورت Controller
import SelectBox, { type SelectOption } from "@/components/ui/SelectBox"; // ۳. ایمپورت SelectBox
import { Spinner } from '@/components/ui/Spinner'; // ۴. ایمپورت Spinner
// ۵. ایمپورت هوک برای واکشی الگوهای کاری (مانند EditShiftScheduleForm)
// توجه: مسیر ایمپورت بر اساس فایل‌های شما ممکن است نیاز به G: 'work-group' -> 'work-pattern' داشته باشد
import { useWorkPatternsList } from '@/features/work-group/hooks/hook';
import { type WorkPatternBase } from '../types';
import clsx from 'clsx';

interface NewShiftScheduleFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

export const NewShiftScheduleForm: React.FC<NewShiftScheduleFormProps> = ({ onSuccess, onCancel }) => {
    // ۶. هوک فرم حالا control و fields را هم بازمی‌گرداند
    const {
        register, handleSubmit, formErrors,
        isPending, generalApiError, onSubmit,
        control, fields
    } = useShiftScheduleForm({ onSuccess });

    // ۷. واکشی لیست الگوهای کاری اتمی برای دراپ‌داون‌ها
    const { data: rawPatterns, isLoading: isLoadingPatterns } =
        useWorkPatternsList();

    // ۸. آماده‌سازی گزینه‌های SelectBox (دقیقاً مانند ScheduleSlotRow)
    const allOptions: SelectOption[] = useMemo(() => {
        const patternOptions: SelectOption[] =
            rawPatterns?.map((p: WorkPatternBase) => ({ id: p.id, name: p.name })) || [];

        return [
            { id: null as any, name: 'روز استراحت (Off)' },
            ...patternOptions
        ];
    }, [rawPatterns]);

    const isGlobalLoading = isPending || isLoadingPatterns;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate dir="rtl">
            <div className="space-y-6">

                <h1 className="text-xl font-bold border-b border-borderL dark:border-borderD pb-4">ایجاد برنامه شیفتی چرخشی</h1>

                {generalApiError && (
                    <Alert variant="destructive">
                        <AlertTitle>خطا</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}

                {/* بخش اول: اطلاعات عمومی */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">

                    <Input
                        label="نام برنامه"
                        {...register('name')}
                        error={formErrors.name?.message}
                        placeholder="مثلاً: چرخش ۴ روز کار، ۲ روز استراحت"
                        disabled={isGlobalLoading}
                        className="md:col-span-3"
                    />

                    <Input
                        label="طول چرخه (روز)"
                        type="number"
                        {...register('cycle_length_days', { valueAsNumber: true })}
                        error={formErrors.cycle_length_days?.message}
                        placeholder="بین ۱ تا ۳۱"
                        min={1} max={31}
                        disabled={isGlobalLoading}
                    />

                    <Input
                        label="تاریخ شروع محاسبه چرخه (YYYY-MM-DD)"
                        type="date" // ۹. بهبود: استفاده از type="date"
                        {...register('cycle_start_date')}
                        error={formErrors.cycle_start_date?.message}
                        placeholder="مثلاً: ۲۰۲۵-۱۰-۰۱"
                        disabled={isGlobalLoading}
                        className="[color-scheme:light] dark:[color-scheme:dark]"
                    />
                </div>

                {/* ۱۰. بخش دوم: اسلات‌های داینامیک */}
                {isLoadingPatterns ? (
                    <div className="flex justify-center items-center min-h-[100px]">
                        <Spinner size="lg" />
                        <span className="mr-3">در حال بارگذاری الگوهای کاری...</span>
                    </div>
                ) : (
                    fields.length > 0 && (
                        <div className="space-y-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                            <h2 className="text-lg font-semibold text-foregroundL dark:text-foregroundD">
                                تخصیص اسلات‌های چرخه
                            </h2>
                            {/* هدر جدول اسلات‌ها */}
                            <div className="grid grid-cols-12 gap-x-4 pb-2 border-b border-borderL dark:border-borderD text-sm font-medium text-muted-foregroundL dark:text-muted-foregroundD">
                                <span className="col-span-3">روز در چرخه</span>
                                <span className="col-span-9">الگوی کاری تخصیص یافته</span>
                            </div>

                            {/* رندر ردیف‌های اسلات */}
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className={clsx(
                                        "grid grid-cols-12 gap-x-4 items-center pb-3 border-b border-borderL dark:border-borderD last:border-b-0",
                                        index % 2 === 1 ? "bg-secondaryL/30 dark:bg-secondaryD/20 p-2 rounded" : "p-2"
                                    )}
                                >
                                    <span className="col-span-3 font-medium text-foregroundL dark:text-foregroundD">
                                        روز {field.day_in_cycle}
                                    </span>
                                    <div className="col-span-9">
                                        {/* ۱۱. استفاده از Controller برای SelectBox */}
                                        <Controller
                                            name={`slots.${index}.work_pattern_id`}
                                            control={control}
                                            render={({ field: selectField }) => (
                                                <SelectBox
                                                    label=""
                                                    placeholder="انتخاب الگو..."
                                                    options={allOptions}
                                                    value={allOptions.find(opt => opt.id === selectField.value) || null}
                                                    onChange={(option) => selectField.onChange(option ? (option.id as number | null) : null)}
                                                    disabled={isGlobalLoading}
                                                />
                                            )}
                                        />
                                        {formErrors.slots?.[index]?.work_pattern_id?.message && (
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                {formErrors.slots[index]?.work_pattern_id?.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {formErrors.slots?.root?.message && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    {formErrors.slots.root.message}
                                </p>
                            )}
                        </div>
                    )
                )}


                {/* دکمه‌ها */}
                <div className="flex justify-end gap-4 border-t border-borderL dark:border-borderD pt-4">
                    <Button type="submit" disabled={isGlobalLoading}>
                        {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        {isPending ? 'در حال ایجاد...' : 'ایجاد برنامه شیفتی'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isGlobalLoading}>
                        لغو
                    </Button>
                </div>
            </div>
        </form>
    );
};