import { type Control, type UseFormRegister, type FieldErrors, type UseFormHandleSubmit, type SubmitHandler, type FieldArrayWithId } from 'react-hook-form';
import type { NewWeekPatternFormData } from '@/features/work-pattern/schema/NewWeekPatternSchema';

import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2, TimerReset, Save, X } from 'lucide-react';
import { WeekDayRow } from '@/features/work-pattern/components/newWorkPattern/WeekDayRow';
import { useWeekPatternForm } from '@/features/work-pattern/hooks/forms/useWeekPatternForm';
import { useNavigate } from 'react-router-dom';

// ✅ استانداردسازی: تعریف دقیق تایپ مشترک خروجی هوک‌ها
// این تایپ باید با خروجی هر دو هوک Create و Edit سازگار باشد
export interface WeekPatternFormContext {
    control: Control<NewWeekPatternFormData>;
    register: UseFormRegister<NewWeekPatternFormData>;
    handleSubmit: UseFormHandleSubmit<NewWeekPatternFormData>;
    formErrors: FieldErrors<NewWeekPatternFormData>;
    isPending: boolean;
    generalApiError: string | null;
    fields: FieldArrayWithId<NewWeekPatternFormData, "days", "id">[];
    watchedDays: NewWeekPatternFormData['days'];
    onSubmit: SubmitHandler<NewWeekPatternFormData>;
}

// اگر در حالت ویرایش باشیم، کانتکست را از بیرون می‌گیریم (Partial چون شاید هنوز لود نشده باشد)
interface NewWeekPatternFormProps extends Partial<WeekPatternFormContext> {
    onSuccess?: () => void;
    onCancel: () => void;
    isEditMode?: boolean;
}

export const NewWeekPatternForm = ({ onSuccess, onCancel, isEditMode = false, ...props }: NewWeekPatternFormProps) => {
    // هوک پیش‌فرض برای حالت ایجاد
    const createHook = useWeekPatternForm({ onSuccess });
    const navigate = useNavigate();


    // ✅ اصلاح فنی: انتخاب هوشمند کانتکست بدون استفاده از any
    // اگر در حالت ویرایش هستیم، پراپ‌های پاس داده شده (props) اولویت دارند
    const formContext = isEditMode ? props : createHook;

    const {
        control, register, handleSubmit, formErrors,
        isPending, generalApiError, fields, watchedDays, onSubmit,
    } = formContext as WeekPatternFormContext; // اینجا Casting امن‌تر است چون تایپ‌ها را یکی کردیم

    const handleBack = () => navigate(-1);
    // هندل کردن لودینگ اولیه (مخصوصاً در حالت ویرایش)
    if (!control || !fields) {
        if (isEditMode) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>خطای بارگذاری</AlertTitle>
                    <AlertDescription>اطلاعات فرم در دسترس نیست. لطفاً صفحه را رفرش کنید.</AlertDescription>
                </Alert>
            );
        }
        return (
            <div className="flex items-center justify-center p-8 text-muted-foregroundL gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>در حال آماده‌سازی فرم...</span>
            </div>
        );
    }

    const title = isEditMode ? 'ویرایش الگوی کاری' : 'ایجاد الگوی کاری جدید';

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                {/* --- هدر (موبایل و دسکتاپ) --- */}
                <div className="lg:col-span-4 border-b border-borderL dark:border-borderD pb-4">

                    {/* ✅ افزودن هدر با دکمه بازگشت */}
                    <div className="flex items-center justify-between " dir="ltr">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleBack}
                            className="h-8 w-8"
                            type="button" // ✅ اصلاح مهم: جلوگیری از سابمیت شدن فرم
                        >
                            بازگشت
                        </Button>
                        <h1 className="text-2xl font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                            {title}
                        </h1>

                    </div>

                </div>

                {generalApiError && (
                    <Alert variant="destructive" className="lg:col-span-4">
                        <AlertTitle>خطای سیستمی</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}

                {/* --- ستون اصلی (روزهای هفته) --- */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-backgroundL-500 border rounded-2xl p-5 border-borderL shadow-sm dark:bg-backgroundD dark:border-borderD">
                        <h3 className="text-lg font-bold mb-4 text-foregroundL dark:text-foregroundD flex items-center gap-2">
                            <span className="w-1 h-6 bg-primaryL rounded-full"></span>
                            زمان‌بندی روزانه
                        </h3>

                        <div className="space-y-3">
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
                    </div>
                </div>

                {/* --- ستون کناری (تنظیمات و اکشن‌ها) --- */}
                {/* ✨ UX Fix: اضافه کردن sticky top-6 self-start برای دسترسی همیشگی در دسکتاپ */}
                <div className="lg:col-span-1 space-y-6 sticky top-6 self-start">

                    {/* کارت ۱: اطلاعات پایه */}
                    <div className="bg-backgroundL-500 border rounded-2xl p-5 border-borderL shadow-sm dark:bg-backgroundD dark:border-borderD">
                        <h3 className="text-sm font-bold mb-4 text-muted-foregroundL uppercase tracking-wider">
                            مشخصات الگو
                        </h3>
                        <Input
                            label="عنوان الگو"
                            {...register('name')}
                            error={formErrors.name?.message}
                            placeholder="مثلاً: شیفت اداری"
                            disabled={isPending}
                            className="bg-white dark:bg-backgroundD/50"
                        />
                    </div>

                    {/* کارت ۲: تنظیمات شناوری */}
                    <div className="bg-backgroundL-500 border rounded-2xl p-5 border-borderL shadow-sm dark:bg-backgroundD dark:border-borderD">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                            <TimerReset className="w-5 h-5" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">ساعات شناور</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    label="شناوری ورود"
                                    {...register('floating_start')}
                                    error={formErrors.floating_start?.message}
                                    disabled={isPending}
                                    className="text-center"
                                    min={0}
                                />
                                <Input
                                    type="number"
                                    label="شناوری خروج"
                                    {...register('floating_end')}
                                    error={formErrors.floating_end?.message}
                                    disabled={isPending}
                                    className="text-center"
                                    min={0}
                                />
                            </div>
                            <div className="text-[11px] text-justify leading-5 text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300">
                                <strong>راهنما:</strong> این مقدار به پرسنل اجازه می‌دهد تا دقایقی دیرتر وارد یا زودتر خارج شوند بدون اینکه کسر کار محاسبه شود.
                            </div>
                        </div>
                    </div>

                    {/* دکمه‌های عملیاتی */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-11 text-base shadow-lg shadow-primaryL/20"
                            variant="primary"
                        >
                            {isPending ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                            {isPending ? 'در حال پردازش...' : (isEditMode ? 'ذخیره تغییرات' : 'ثبت الگوی جدید')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isPending}
                            className="w-full h-10 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10"
                        >
                            <X className="ml-2 h-4 w-4" />
                            انصراف
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};