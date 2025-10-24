import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    // ۱. ایمپورت اسکیما و تایپ جدید
    newReportSchema,
    type NewReportFormData,
} from '@/features/reports/Schema/newReportSchema';

// ایمپورت کامپوننت‌های UI ماژولار
import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import Textarea from '@/components/ui/Textarea';

// --- ۲. تعریف داده‌های فیک جدید مخصوص این فرم ---
// (اینها را می‌توانید به فایل data/mockData خودتان منتقل کنید)
const mockOrganizations: SelectOption[] = [
    { id: 'org1', name: 'سازمان ۱' },
    { id: 'org2', name: 'سازمان ۲' },
];
const mockWorkGroups: SelectOption[] = [
    { id: 'wg1', name: 'گروه کاری ۱' },
    { id: 'wg2', name: 'گروه کاری ۲' },
];
const mockActivityTypes: SelectOption[] = [
    { id: 'entry', name: 'ورود' },
    { id: 'exit', name: 'خروج' },
    { id: 'delay', name: 'تاخیر' },
    { id: 'haste', name: 'تعجیل' },
];
const mockTrafficAreas: SelectOption[] = [
    { id: 'area1', name: 'بخش ۱' },
    { id: 'area2', name: 'مرخصی' }, // (مطابق تصویر)
    { id: 'area3', name: 'ناحیه ۳' },
];

// --- ۳. تغییر نام پراپس‌ها ---
interface NewReportFormProps {
    onSubmit: (data: NewReportFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export const NewReportForm = ({
    onSubmit,
    onCancel,
    isSubmitting,
}: NewReportFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<NewReportFormData>({
        resolver: zodResolver(newReportSchema),
        // ۴. به‌روزرسانی مقادیر پیش‌فرض
        defaultValues: {
            name: '',
            personalCode: '',
            organization: null,
            workGroup: null,
            activityType: null,
            trafficArea: null,
            date: null,
            time: '07:00', // (فقط یک فیلد ساعت)
            description: '',
        },
    });

    const onFormSubmit: SubmitHandler<NewReportFormData> = (data) => {
        onSubmit(data);
        console.log(data);
    };

    return (
        // ۵. چیدمان گرید ۲ ستونه مطابق تصویر
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* --- ستون راست (در تصویر) --- */}
                <Input
                    label="نام و نام خانوادگی"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="نام و نام خانوادگی را وارد کنید"
                />

                {/* --- ستون چپ (در تصویر) --- */}
                <Input
                    label="کد پرسنلی"
                    {...register('personalCode')}
                    error={errors.personalCode?.message}
                    placeholder="کد پرسنلی را وارد کنید"
                />

                {/* --- ستون راست --- */}
                <Controller
                    name="workGroup"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectBox
                            label="گروه کاری"
                            options={mockWorkGroups}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {/* --- ستون چپ --- */}
                <Controller
                    name="organization"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectBox
                            label="سازمان"
                            options={mockOrganizations}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {/* --- ستون راست --- */}
                <Controller
                    name="activityType" // ۶. تغییر از 'requestType'
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectBox
                            label="نوع فعالیت"
                            options={mockActivityTypes}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {/* --- ستون چپ (فیلد جدید) --- */}
                <Controller
                    name="trafficArea" // ۷. فیلد جدید
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectBox
                            label="ناحیه تردد"
                            options={mockTrafficAreas}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {/* --- ستون راست --- */}
                <Input
                    label="ساعت" // ۸. جایگزینی 'startTime'/'endTime'
                    {...register('time')}
                    error={errors.time?.message}
                    placeholder="HH:mm"
                    dir="ltr" // (برای ورود ساعت مناسب است)
                />

                {/* --- ستون چپ --- */}
                <Controller
                    name="date"
                    control={control}
                    render={({ field, fieldState }) => (
                        <PersianDatePickerInput
                            label="تاریخ"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            error={fieldState.error?.message} // (پراپ error را به DatePicker پاس دهید)
                        />
                    )}
                />


                <div className="md:col-span-2">
                    <Textarea
                        label="توضیحات"
                        placeholder="توضیحات (اختیاری)"
                        {...register('description')}
                        error={errors.description?.message}
                        rows={4}
                    />
                </div>

            </div>

            {/* بخش دکمه‌های تایید و لغو (بدون تغییر) */}
            <div className="flex justify-start gap-4 mt-8 pt-6 border-t border-borderL dark:border-borderD">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primaryL cursor-pointer dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primaryL/80 dark:hover:text-backgroundL-500"
                >
                    {isSubmitting ? 'در حال ارسال...' : 'تایید'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="bg-backgroundL-500 cursor-pointer dark:bg-backgroundD text-foregroundL dark:text-foregroundD px-6 py-2 rounded-lg text-sm font-medium border border-borderL dark:border-borderD disabled:opacity-50  hover:bg-destructiveL/40"
                >
                    لغو
                </button>
            </div>
        </form>
    );
};