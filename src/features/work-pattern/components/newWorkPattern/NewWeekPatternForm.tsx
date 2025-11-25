import { type Control, type UseFormRegister, type FieldErrors, type UseFormHandleSubmit, type SubmitHandler, type FieldArrayWithId } from 'react-hook-form';
import type { NewWeekPatternFormData } from '@/features/work-pattern/schema/NewWeekPatternSchema';

import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, TimerReset } from 'lucide-react';
import { WeekDayRow } from '@/features/work-pattern/components/newWorkPattern/WeekDayRow';
import { useWeekPatternForm } from '@/features/work-pattern/hooks/useWeekPatternForm';

// ✅ اصلاح: استفاده از Control ساده بدون وابستگی به Context پیچیده
type FormContextType = {
    control: Control<NewWeekPatternFormData>; // فقط Control<T>
    register: UseFormRegister<NewWeekPatternFormData>;
    handleSubmit: UseFormHandleSubmit<NewWeekPatternFormData>;
    formErrors: FieldErrors<NewWeekPatternFormData>;
    isPending: boolean;
    generalApiError: string | null;
    fields: FieldArrayWithId<NewWeekPatternFormData, "days", "id">[];
    watchedDays: NewWeekPatternFormData['days'];
    onSubmit: SubmitHandler<NewWeekPatternFormData>;
};

interface NewWeekPatternFormProps extends Partial<FormContextType> {
    onSuccess?: () => void;
    onCancel: () => void;
    isEditMode?: boolean;
}

export const NewWeekPatternForm = ({ onSuccess, onCancel, isEditMode = false, ...props }: NewWeekPatternFormProps) => {
    const createHook = useWeekPatternForm({ onSuccess });

    // اینجا cast کردن به any ضروری است چون هوک‌ها و پراپ‌ها ممکن است ریزتفاوت‌هایی در نسخه Resolver داشته باشند
    const formContext: FormContextType = isEditMode
        ? (props as any)
        : createHook;

    const {
        control, register, handleSubmit, formErrors,
        isPending, generalApiError, fields, watchedDays, onSubmit,
    } = formContext;

    if (!control || !fields) {
        if (isEditMode) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>خطای داخلی فرم</AlertTitle>
                    <AlertDescription>داده‌های فرم ویرایش به درستی بارگذاری نشدند.</AlertDescription>
                </Alert>
            )
        }
        return <div className="p-4 flex items-center gap-2"><Loader2 className="animate-spin" /> در حال آماده‌سازی فرم...</div>;
    }

    const title = isEditMode ? 'ویرایش الگوی کاری' : 'ایجاد الگوی کاری جدید';

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="md:col-span-4 border-b border-borderL dark:border-borderD pb-4 mb-4">
                    <h1 className="text-xl font-bold">{title}</h1>
                </div>

                {generalApiError && (
                    <Alert variant="destructive" className="md:col-span-4">
                        <AlertTitle>خطا</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}

                {/* ستون اصلی (2/3 عرض) */}
                <div className="space-y-4 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD md:col-span-3">
                    <h3 className="text-md font-medium mb-3 text-stone-700 dark:text-stone-300">
                        الگوی کاری هفتگی
                    </h3>

                    {fields.map((field, index) => {
                        const isWorking = watchedDays?.[index]?.is_working_day ?? false;
                        return (
                            <WeekDayRow
                                key={field.id}
                                field={field}
                                index={index}
                                isWorking={isWorking}
                                control={control}
                                register={register}
                                formErrors={formErrors}
                                isPending={isPending}
                            />
                        );
                    })}
                </div>

                {/* ستون کناری - تنظیمات */}
                <div className="space-y-6 md:col-span-1">

                    {/* کارت ۱: اطلاعات پایه */}
                    <div className="bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                        <h3 className="text-md font-medium mb-4 text-stone-700 dark:text-stone-300">
                            اطلاعات الگو
                        </h3>
                        <Input
                            label="نام الگو"
                            {...register('name')}
                            error={formErrors.name?.message}
                            placeholder="مثلاً: اداری استاندارد"
                            disabled={isPending}
                        />
                    </div>

                    {/* ✅ کارت ۲: تنظیمات ساعات شناور */}
                    <div className="bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD">
                        <div className="flex items-center gap-2 mb-4 text-stone-700 dark:text-stone-300">
                            <TimerReset className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-md font-medium">ساعات شناور</h3>
                        </div>

                        <div className="space-y-4">
                            <Input
                                type="number"
                                label="شناوری ورود (دقیقه)"
                                {...register('floating_start')}
                                error={formErrors.floating_start?.message}
                                placeholder="مثلاً 15"
                                disabled={isPending}
                                className="text-center"
                                min={0}
                            />
                            <Input
                                type="number"
                                label="شناوری خروج (دقیقه)"
                                {...register('floating_end')}
                                error={formErrors.floating_end?.message}
                                placeholder="مثلاً 15"
                                disabled={isPending}
                                className="text-center"
                                min={0}
                            />
                            <p className="text-[11px] text-muted-foregroundL leading-4 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded border border-indigo-100 dark:border-indigo-800 dark:text-infoD-foreground">
                                <strong>نکته:</strong> تردد خارج از این بازه مشمول جریمه کسر کار از ابتدای شیفت خواهد شد (منطق آستانه).
                            </p>
                        </div>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="flex justify-start gap-3 pt-2">
                        <Button type="submit" disabled={isPending} className="flex-1">
                            {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'در حال ذخیره...' : (isEditMode ? 'ذخیره تغییرات' : 'ایجاد الگو')}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                            لغو
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};