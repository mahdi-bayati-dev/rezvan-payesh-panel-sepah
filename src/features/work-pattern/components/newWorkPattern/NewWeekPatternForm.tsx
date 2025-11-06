import { useWeekPatternForm } from '@/features/work-pattern/hooks/useWeekPatternForm';
import { useEditWeekPatternForm } from '@/features/work-pattern/hooks/useEditWeekPatternForm';
import type { FieldArrayWithId } from 'react-hook-form';
import type { NewWeekPatternFormData } from '@/features/work-pattern/schema/NewWeekPatternSchema';

import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import { WeekDayRow } from '@/features/work-pattern/components/newWorkPattern/WeekDayRow';


// کامنت: تعریف یک تایپ مشترک برای هوک‌های فرم (برای استفاده در پراپ‌ها)
type FormHook = ReturnType<typeof useWeekPatternForm> | ReturnType<typeof useEditWeekPatternForm>;

interface NewWeekPatternFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
    isEditMode?: boolean; // پراپ برای تعیین حالت (Create یا Edit)
    // پراپ‌های مورد نیاز در حالت Edit (که از useEditWeekPatternForm می‌آیند)
    control?: FormHook['control'];
    register?: FormHook['register'];
    handleSubmit?: FormHook['handleSubmit'];
    formErrors?: FormHook['formErrors'];
    isPending?: FormHook['isPending'];
    generalApiError?: FormHook['generalApiError'];
    fields?: FieldArrayWithId<NewWeekPatternFormData, "days", "id">[];
    watchedDays?: NewWeekPatternFormData['days'];
    onSubmit?: FormHook['onSubmit'];
}


export const NewWeekPatternForm = ({ onSuccess, onCancel, isEditMode = false, ...props }: NewWeekPatternFormProps) => {

    // کامنت: فقط اگر در حالت Create نبودیم، هوک Create را فراخوانی می‌کنیم
    const createHook = useWeekPatternForm({ onSuccess });

    // کامنت: انتخاب بین هوک Create (در حالت New) و پراپ‌های Edit (در حالت Edit)
    const formContext = isEditMode ? (props as FormHook) : createHook;

    const {
        control, register, handleSubmit, formErrors,
        isPending, generalApiError, fields, watchedDays, onSubmit,
    } = formContext;

    // کامنت: بررسی ورودی‌های اجباری برای جلوگیری از خطای رندر
    if (!fields || !watchedDays || !control || !register || !handleSubmit || !onSubmit) {
        // کامنت: این خطا فقط باید در حالت Edit رخ دهد اگر پراپ‌ها پاس داده نشوند
        if (isEditMode) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>خطای داخلی فرم</AlertTitle>
                    <AlertDescription>فرم ویرایش به درستی مقداردهی نشده است. لطفاً مسیردهی به این صفحه را بررسی کنید.</AlertDescription>
                </Alert>
            )
        }
        // کامنت: در حالت Create این وضعیت نباید رخ دهد مگر خطای کد نویسی باشد.
        return <div className="p-4">در حال بارگذاری فرم...</div>;
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

                    {formErrors.days?.root?.message && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                            {formErrors.days.root.message}
                        </p>
                    )}
                </div>

                {/* ستون کناری) */}
                <div className="space-y-6 md:col-span-1 bg-backgroundL-500 border rounded-2xl p-4 border-b border-borderL transition-colors duration-300 dark:bg-backgroundD dark:border-borderD max-h-[220px] ">

                    <div className="">
                        <h3 className="text-md font-medium mb-4 text-stone-700 dark:text-stone-300">
                            اطلاعات الگو
                        </h3>
                        <Input
                            label="نام الگو"
                            {...register('name')}
                            error={formErrors.name?.message}
                            placeholder="مثلاً: برنامه اداری استاندارد"
                            disabled={isPending}
                        />
                    </div>

                    <div className="">
                        <div className="flex justify-start gap-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {isPending ? 'در حال ذخیره...' : (isEditMode ? 'ذخیره تغییرات' : 'ایجاد الگو')}
                            </Button>
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                                لغو
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};
