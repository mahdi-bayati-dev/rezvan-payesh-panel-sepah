// کامنت: مسیر به هوک سفارشی با @ اصلاح شد
import { useWeekPatternForm } from '@/features/work-pattern/hooks/useWeekPatternForm';
// کامنت: حروف کوچک برای ایمپورت کامپوننت‌های UI
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
import { WeekDayRow } from '@/features/work-pattern/components/newWorkPattern/WeekDayRow';

interface NewWeekPatternFormProps {
    onSuccess?: () => void;
    onCancel: () => void;
}

export const NewWeekPatternForm = ({ onSuccess, onCancel }: NewWeekPatternFormProps) => {

    // کامنت: فراخوانی هوک سفارشی
    const {
        control,
        register,
        handleSubmit,
        formErrors,
        isPending,
        generalApiError,
        fields,
        watchedDays,
        onSubmit,
    } = useWeekPatternForm({ onSuccess });

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* کامنت: استفاده از Grid برای چیدمان دو ستونه (2/3 و 1/3) در حالت دسکتاپ
                در موبایل (حالت پیش‌فرض grid-cols-1) ستون‌ها زیر هم قرار می‌گیرند
            */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {generalApiError && (
                    // کامنت: خطا در بالای صفحه و با عرض کامل نمایش داده می‌شود
                    <Alert variant="destructive" className="md:col-span-4">
                        <AlertTitle>خطا</AlertTitle>
                        <AlertDescription>{generalApiError}</AlertDescription>
                    </Alert>
                )}

                {/* ستون اصلی (2/3 عرض) */}
                {/* Card 2: الگوی کاری هفتگی */}
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

                    {/* Card 1: اطلاعات اصلی (نام الگو) */}
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

                    {/* Card 3: دکمه‌های عملیاتی (تایید و لغو) */}
                    <div className="">
                        <div className="flex justify-start gap-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {isPending ? 'در حال ذخیره...' : 'ذخیره الگو'}
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

