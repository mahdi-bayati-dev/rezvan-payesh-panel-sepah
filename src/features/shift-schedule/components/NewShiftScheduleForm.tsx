import { useShiftScheduleForm } from '@/features/shift-schedule/hooks/useShiftScheduleForm';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface NewShiftScheduleFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

export const NewShiftScheduleForm: React.FC<NewShiftScheduleFormProps> = ({ onSuccess, onCancel }) => {
    const {
        register, handleSubmit, formErrors,
        isPending, generalApiError, onSubmit
    } = useShiftScheduleForm({ onSuccess });

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">

                    <Input
                        label="نام برنامه"
                        {...register('name')}
                        error={formErrors.name?.message}
                        placeholder="مثلاً: چرخش ۴ روز کار، ۲ روز استراحت"
                        disabled={isPending}
                        className="md:col-span-3"
                    />

                    <Input
                        label="طول چرخه (روز)"
                        type="number"

                        // ✅✅✅ اصلاح:
                        // ما باید valueAsNumber: true را برگردانیم
                        // تا RHF مقدار NaN (برای فیلد خالی) یا number را به Zod بدهد.
                        {...register('cycle_length_days', { valueAsNumber: true })}

                        error={formErrors.cycle_length_days?.message}
                        placeholder="بین ۱ تا ۳۱"
                        min={1} max={31}
                        disabled={isPending}
                    />

                    <Input
                        label="تاریخ شروع محاسبه چرخه (YYYY-MM-DD)"
                        // کامنت: این فیلد باید یک DatePicker باشد، اما فعلاً از Input ساده استفاده می‌کنیم
                        type="text"
                        {...register('cycle_start_date')}
                        error={formErrors.cycle_start_date?.message}
                        placeholder="مثلاً: ۲۰۲۵-۱۰-۰۱"
                        disabled={isPending}
                    />

                    {/* Placeholder برای اسلات‌ها (اگر نیاز به تنظیم پیش‌فرض بود) */}
                    <div className="md:col-span-3 pt-2 text-sm text-muted-foregroundL dark:text-muted-foregroundD">
                        توجه: اسلات‌های برنامه شیفتی پس از ایجاد، در صفحه ویرایش قابل تنظیم خواهند بود.
                    </div>
                </div>

                {/* دکمه‌ها */}
                <div className="flex justify-end gap-4 border-t border-borderL dark:border-borderD pt-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        {isPending ? 'در حال ایجاد...' : 'ایجاد برنامه شیفتی'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                        لغو
                    </Button>
                </div>
            </div>
        </form>
    );
};