// shift-schedule/components/EditShiftScheduleForm.tsx
import React, { useMemo } from 'react';
import { useEditShiftScheduleForm } from '../hooks/useEditShiftScheduleForm';

// --- کامپوننت‌ها و ابزارهای UI ---
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
// import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { ScheduleSlotRow } from './ScheduleSlotRow';

// --- هوک‌ها و تایپ‌ها ---
import { useWorkPatternsList } from '@/features/work-group/hooks/hook';
import { type WorkPatternBase } from '../types';

// --- آیکون‌ها برای UI جذاب‌تر ---
import {
    Loader2,
    Save,
    CalendarOff,
    FilePenLine, // آیکون برای فرم ویرایش
    CalendarDays, // آیکون برای تاریخ
    RefreshCw, // آیکون برای چرخه
    ArrowLeft, // آیکون برای بازگشت
} from 'lucide-react';
import clsx from 'clsx';

// کامنت: تایپ پراپ‌ها بر اساس خروجی هوک ویرایش
type EditFormHookReturn = ReturnType<typeof useEditShiftScheduleForm>;
interface EditShiftScheduleFormProps extends EditFormHookReturn {
    onCancel: () => void;
}

/**
 * کامپوننت بازطراحی شده برای فرم ویرایش برنامه شیفتی
 * با چیدمان دو ستونه مدرن (اطلاعات عمومی چسبان در کنار و لیست اسلات‌ها در مرکز)
 */
export const EditShiftScheduleForm: React.FC<EditShiftScheduleFormProps> = ({
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
    // --- ۱. لود کردن لیست الگوهای اتمی (برای دراپ‌داون اسلات‌ها) ---
    const { data: rawPatterns, isLoading: isLoadingPatterns } =
        useWorkPatternsList();

    // کامنت: آماده‌سازی گزینه‌های دراپ‌داون اسلات‌ها (فقط یک بار)
    const availablePatterns: WorkPatternBase[] = useMemo(() => {
        return rawPatterns?.map((p) => ({ id: p.id, name: p.name })) || [];
    }, [rawPatterns]);

    // کامنت: وضعیت لودینگ سراسری
    const isGlobalLoading = isLoadingInitialData || isLoadingPatterns;

    // --- ۲. مدیریت خطا و لودینگ اولیه ---
    if (isGlobalLoading) {
        return (
            <div
                className="flex justify-center items-center min-h-[400px]"
                dir="rtl"
            >
                <Spinner size="lg" />
                <span className="mr-3 text-lg text-foregroundL dark:text-foregroundD">
                    در حال بارگذاری اطلاعات برنامه شیفتی...
                </span>
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

    // کامنت: اطمینان از وجود اسلات‌ها
    const slots = initialSchedule.slots || [];

    // --- ۳. رندر UI بازطراحی شده ---
    return (
        <div
            className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6"
            dir="rtl"
        >

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* --- ستون سمت چپ (محتوای اصلی - اسلات‌ها) --- */}
                <div className="lg:col-span-3 space-y-6">
                    {/* هدر صفحه اصلی */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-foregroundL dark:text-foregroundD">
                            ویرایش برنامه شیفتی:{' '}
                            <span className="text-primaryL dark:text-primaryD">
                                {initialSchedule.name}
                            </span>
                        </h1>
                    </div>

                    {/* کارت اسلات‌ها */}
                    <div className="bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl">
                        <div className="p-5 space-y-4">
                            <h2 className="text-xl font-semibold text-foregroundL dark:text-foregroundD">
                                اسلات‌های چرخه ({initialSchedule.cycle_length_days} روز)
                            </h2>

                            {slots.length === 0 ? (
                                // حالت خالی
                                <div className="flex flex-col items-center justify-center min-h-[150px] p-4 bg-secondaryL dark:bg-secondaryD rounded-lg text-muted-foregroundL dark:text-muted-foregroundD border border-dashed border-borderL dark:border-borderD">
                                    <CalendarOff className="h-10 w-10 mb-2" />
                                    <span className="font-medium">
                                        هنوز اسلاتی در این برنامه تعریف نشده است.
                                    </span>
                                </div>
                            ) : (
                                // جدول اسلات‌ها
                                <div className="w-full overflow-x-auto border border-borderL dark:border-borderD rounded-lg">
                                    <div className="min-w-[750px]">
                                        {/* هدر جدول */}
                                        <div
                                            className="grid grid-cols-[80px_120px_120px_1fr_100px] font-medium text-sm text-center bg-gray-100 dark:bg-gray-800 border-b border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD"
                                            dir="ltr" // کامنت: هدر جدول بهتر است ltr باشد
                                        >
                                            <div className="p-3 text-right">ویراش</div>
                                            <div className="p-3 text-right">پایان</div>
                                            <div className="p-3 text-right">شروع</div>
                                            <div className="p-3 text-center">الگوی کاری</div>
                                            <div className="p-3 text-center">روز</div>

                                        </div>

                                        {/* بدنه جدول - استفاده از divide-y برای خطوط تمیزتر */}
                                        <div className="divide-y divide-borderL dark:divide-borderD">
                                            {slots.map((slot) => (
                                                // کامنت: این div گرید ردیف است. ScheduleSlotRow با "display: contents" محتوایش را در این گرید تزریق می‌کند.
                                                <div
                                                    key={slot.id}
                                                    className={clsx(
                                                        'grid grid-cols-[80px_1fr_120px_120px_100px] items-center transition-colors',
                                                        'hover:bg-secondaryL/40 dark:hover:bg-secondaryD/30'
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* --- ستون سمت راست (نوار کناری چسبان) --- */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6 p-5 bg-backgroundL-500 dark:bg-backgroundD border border-borderL dark:border-borderD rounded-xl shadow-xl"
                    >
                        <div className="flex items-center gap-3 border-b border-borderL dark:border-borderD pb-3">
                            <FilePenLine
                                className="h-6 w-6 text-primaryL dark:text-primaryD"
                                strokeWidth={2.5}
                            />
                            <h2 className="text-xl font-bold text-foregroundL dark:text-foregroundD">
                                اطلاعات عمومی
                            </h2>
                        </div>

                        {generalApiError && (
                            <Alert variant="destructive">
                                <AlertTitle>خطا</AlertTitle>
                                <AlertDescription>{generalApiError}</AlertDescription>
                            </Alert>
                        )}

                        <Input
                            label="نام برنامه"
                            {...register('name')}
                            error={formErrors.name?.message}
                            disabled={isPending}
                        />

                        <Input
                            label="تاریخ شروع محاسبه چرخه"
                            type="date"
                            {...register('cycle_start_date')}
                            error={formErrors.cycle_start_date?.message}
                            disabled={isPending}
                            className="[color-scheme:light] dark:[color-scheme:dark]"
                            icon={<CalendarDays className="h-4 w-4 text-muted-foregroundL" />}
                        />

                        <Input
                            label="طول چرخه (روز)"
                            type="number"
                            value={initialSchedule.cycle_length_days}
                            disabled={true}
                            readOnly
                            className="bg-secondaryL/40 dark:bg-secondaryD/30 focus:ring-0 text-muted-foregroundL dark:text-muted-foregroundD"
                            icon={<RefreshCw className="h-4 w-4 text-muted-foregroundL" />}
                        />

                        <div className="flex flex-col gap-2 pt-4 border-t border-borderL dark:border-borderD">
                            <Button type="submit" disabled={!isDirty || isPending}>
                                {isPending ? (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="ml-2 h-4 w-4" />
                                )}
                                {isPending ? 'در حال ذخیره...' : 'ذخیره اطلاعات عمومی'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={onCancel}>
                                <ArrowLeft className="ml-2 h-4 w-4" />
                                بازگشت (لغو)
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};