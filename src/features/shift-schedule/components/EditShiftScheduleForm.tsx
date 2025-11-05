// shift-schedule/components/EditShiftScheduleForm.tsx

import React, { useMemo } from 'react';
// ✅ ۱. حذف هوک‌های اضافی
// import { useNavigate, useParams } from 'react-router-dom';
import { useEditShiftScheduleForm } from '../hooks/useEditShiftScheduleForm'; // ✅ G: Relative path

// ✅ ۲. ایمپورت تایپ‌های مورد نیاز برای پراپ‌ها
// import type { Control, SubmitHandler } from 'react-hook-form';
// import type { ShiftScheduleResource } from '../types'; // ✅ G: Relative path

import Input from '@/components/ui/Input'; // ✅ G: 'Input' -> 'input'
import { Button } from '@/components/ui/Button'; // ✅ G: 'Button' -> 'button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, Save, CalendarOff } from 'lucide-react'; // ✅ ایمپورت آیکون
import { ScheduleSlotRow } from './ScheduleSlotRow'; // ✅ G: Relative path
import { useWorkPatternsList } from '@/features/work-group/hooks/hook';
import { Spinner } from '@/components/ui/Spinner'; // ✅ G: 'Spinner' -> 'spinner'
import { type WorkPatternBase } from '../types'; // ✅ G: Relative path
import clsx from 'clsx';

// ✅ ۳. تعریف تایپ پراپ‌ها
// کامنت: ما تایپ خروجی هوک ویرایش را به همراه پراپ onCancel دریافت می‌کنیم
type EditFormHookReturn = ReturnType<typeof useEditShiftScheduleForm>;
interface EditShiftScheduleFormProps extends EditFormHookReturn {
    onCancel: () => void;
}

// ✅ ۴. کامپوننت پراپ‌ها را می‌پذیرد
export const EditShiftScheduleForm: React.FC<EditShiftScheduleFormProps> = ({
    // ✅ ۵. دریافت پراپ‌ها به جای فراخوانی هوک‌های داخلی
    onCancel,
    initialSchedule,
    register,
    handleSubmit,
    formErrors,
    isPending,
    isLoadingInitialData,
    generalApiError,
    isDirty,
    onSubmit,
}) => {
    // const navigate = useNavigate(); // حذف شد
    // const { patternId } = useParams<{ patternId: string }>(); // حذف شد
    // const shiftScheduleId = patternId ?? null; // حذف شد
    // const editFormHook = useEditShiftScheduleForm({ ... }); // حذف شد
    // const { ... } = editFormHook; // حذف شد

    // --- ۲. لود کردن لیست الگوهای اتمی (این منطق مربوط به نمایش است و باقی می‌ماند) ---
    const { data: rawPatterns, isLoading: isLoadingPatterns } =
        useWorkPatternsList();

    const availablePatterns: WorkPatternBase[] = useMemo(() => {
        return rawPatterns?.map((p) => ({ id: p.id, name: p.name })) || [];
    }, [rawPatterns]);

    // کامنت: isLoadingInitialData حالا از پراپ‌ها می‌آید
    const isGlobalLoading = isLoadingInitialData || isLoadingPatterns;

    // --- ۳. مدیریت خطا و لودینگ اولیه ---
    if (isGlobalLoading) {
        return (
            <div
                className="flex justify-center items-center min-h-[400px]"
                dir="rtl"
            >
                <Spinner size="lg" />
                <span className="mr-3">در حال بارگذاری اطلاعات برنامه شیفتی...</span>
            </div>
        );
    }

    if (generalApiError && generalApiError.includes('خطا در بارگذاری')) {
        return (
            <div className="p-8" dir="rtl">
                <Alert variant="destructive">
                    <AlertTitle>خطا در بارگذاری</AlertTitle>
                    <AlertDescription>{generalApiError}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!initialSchedule) {
        return (
            <div className="p-8 text-center" dir="rtl">
                برنامه شیفتی مورد نظر یافت نشد.
            </div>
        );
    }

    // ✅ ۶. اطمینان از null نبودن (initialSchedule قبلاً چک شده)
    const slots = initialSchedule.slots || [];

    return (
        <div
            className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 space-y-6"
            dir="rtl"
        >
            <div className="flex justify-between items-center border-b border-borderL dark:border-borderD pb-4">
                <h1 className="text-2xl font-bold text-primaryL dark:text-primaryD">
                    ویرایش برنامه شیفتی:{' '}
                    <span className="text-primaryL dark:text-primaryD">
                        {initialSchedule.name}
                    </span>
                </h1>
                {/* ✅ ۷. استفاده از پراپ onCancel */}
                <Button variant="link" onClick={onCancel}>
                    بازگشت به لیست
                </Button>
            </div>

            {/* --- ✅ بهبود UI: فرم ویرایش Header در یک کارت مجزا --- */}
            <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-md">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
                    <h2 className="text-xl font-semibold mb-2">اطلاعات عمومی</h2>

                    {generalApiError && (
                        <Alert variant="destructive">
                            <AlertTitle>خطا</AlertTitle>
                            <AlertDescription>{generalApiError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="نام برنامه"
                            {...register('name')}
                            error={formErrors.name?.message}
                            disabled={isPending}
                        />
                        <Input
                            label="طول چرخه (روز)"
                            type="number"
                            value={initialSchedule.cycle_length_days}
                            disabled={true}
                            readOnly // ✅
                            className="bg-gray-100 dark:bg-gray-800 focus:ring-0"
                        />
                        <div className="relative">
                            <Input
                                label="تاریخ شروع محاسبه چرخه"
                                type="date" // ✅ استفاده از type="date"
                                {...register('cycle_start_date')}
                                error={formErrors.cycle_start_date?.message}
                                disabled={isPending}
                                className="[color-scheme:light] dark:[color-scheme:dark]" // ✅ برای Date picker
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-borderL dark:border-borderD mt-4">
                        <Button type="submit" disabled={!isDirty || isPending}>
                            {isPending ? (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="ml-2 h-4 w-4" />
                            )}
                            {isPending ? 'در حال ذخیره...' : 'ذخیره اطلاعات عمومی'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* --- ✅ بهبود UI: لیست اسلات‌ها در یک کارت مجزا --- */}
            <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-md">
                <div className="p-5 space-y-4">
                    <h2 className="text-xl font-semibold">
                        اسلات‌های چرخه ({initialSchedule.cycle_length_days} روز)
                    </h2>

                    {slots.length === 0 ? (
                        // ✅ بهبود UI حالت خالی
                        <div className="flex flex-col items-center justify-center min-h-[150px] p-4 bg-secondaryL dark:bg-secondaryD rounded-lg text-muted-foregroundL dark:text-muted-foregroundD border border-dashed border-borderL dark:border-borderD">
                            <CalendarOff className="h-10 w-10 mb-2" />
                            <span className="font-medium">
                                هنوز اسلاتی در این برنامه تعریف نشده است.
                            </span>
                            <span className="text-sm">
                                اسلات‌ها باید از طریق API یا بک‌اند ایجاد شوند.
                            </span>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto border border-borderL dark:border-borderD rounded-xl">
                            {/* هدر جدول (استفاده از Grid) */}
                            <div className="grid grid-cols-shift-schedule-edit min-w-[700px] font-medium text-sm text-center bg-gray-100 dark:bg-gray-800 border-b border-borderL dark:border-borderD rounded-t-xl text-muted-foregroundL dark:text-muted-foregroundD">
                                <div className="p-3">روز</div>
                                <div className="p-3 text-right">الگوی کاری</div>
                                <div className="p-3">شروع جایگزین</div>
                                <div className="p-3">پایان جایگزین</div>
                                <div className="p-3">عملیات</div>
                            </div>

                            {/* رندر ردیف‌های اسلات */}
                            <div className="min-w-[700px]">
                                {slots.map((slot, index) => (
                                    <div
                                        key={slot.id}
                                        className={clsx(
                                            'grid grid-cols-shift-schedule-edit items-center border-b border-borderL dark:border-borderD last:border-b-0',
                                            // ✅ بهبود UI: استایل زبرا
                                            index % 2 === 1
                                                ? 'bg-secondaryL/30 dark:bg-secondaryD/20'
                                                : 'bg-backgroundL-500 dark:bg-backgroundD'
                                        )}
                                    >
                                        <ScheduleSlotRow
                                            slot={slot}
                                            shiftScheduleId={initialSchedule.id}
                                            availablePatterns={availablePatterns}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};