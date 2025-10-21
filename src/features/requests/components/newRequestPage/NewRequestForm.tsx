import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    newRequestSchema,
    type NewRequestFormData,
} from '@/features/requests/schemas/newRequestSchema';
// import type { DateObject } from 'react-multi-date-picker';

// ایمپورت کامپوننت‌های UI ماژولار
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import Textarea from '@/components/ui/Textarea';

// داده‌های فیک (تا زمان آماده شدن API)
import {
    mockOrganizations,
    mockCategories,
    mockRequestTypes,
} from '@/features/requests/data/mockData';
// (فرض می‌کنیم mockWorkGroups را هم دارید)
const mockWorkGroups = [
    { id: 'wg1', name: 'گروه کاری ۱' },
    { id: 'wg2', name: 'گروه کاری ۲' },
];

interface NewRequestFormProps {
    // تابعی که داده‌های نهایی و اعتبارسنجی شده را به والد (صفحه) می‌فرستد
    onSubmit: (data: NewRequestFormData) => void;
    // برای دکمه لغو
    onCancel: () => void;
    isSubmitting: boolean; // برای غیرفعال کردن دکمه‌ها حین ارسال
}

export const NewRequestForm = ({
    onSubmit,
    onCancel,
    isSubmitting,
}: NewRequestFormProps) => {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<NewRequestFormData>({
        resolver: zodResolver(newRequestSchema),
        defaultValues: {
            // مقادیر پیش‌فرض
            name: '',
            personalCode: "",
            organization: null,
            workGroup: null,
            category: null,
            requestType: null,
            date: null,
            startTime: '07:00',
            endTime: '14:00',
            description: '',
        },
    });

    // تبدیل SubmitHandler پیش‌فرض به تابع onSubmit ما
    const onFormSubmit: SubmitHandler<NewRequestFormData> = (data) => {
        onSubmit(data);
        console.log(data);

    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            {/* استفاده از Grid برای چیدمان ۲ ستونه مطابق تصویر */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* ۱. فیلد ساده با register */}
                <Input
                    label="نام و نام خانوادگی"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="نام و نام خانوادگی را وارد کنید"
                />

                {/* ۲. فیلد پیچیده (SelectBox) با Controller */}

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
                            // (برای نمایش خطا می‌توانید استایل error را به SelectBox اضافه کنید)
                            error={fieldState.error?.message}
                        />
                    )}
                />

                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="دسته بندی درخواست"
                            options={mockCategories}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                        />
                    )}
                />

                <Input
                    label="کد پرسنلی"
                    {...register('personalCode')}
                    error={errors.personalCode?.message}

                />

                <Controller
                    name="workGroup"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="گروه کاری"
                            options={mockWorkGroups}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                        />
                    )}
                />

                <Controller
                    name="requestType"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="نوع درخواست"
                            options={mockRequestTypes}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                        />
                    )}
                />



                {/* فیلد ساعت */}
                <div className="flex items-end gap-3">
                    <Input
                        label="ساعت"
                        {...register('startTime')}
                        error={errors.startTime?.message}
                        placeholder="HH:mm"
                    />
                    <span className="pb-3 text-muted-foregroundL">تا</span>
                    <Input
                        label="" // لیبل تکراری لازم ندارد
                        {...register('endTime')}
                        error={errors.endTime?.message}
                        placeholder="HH:mm"
                    />
                </div>
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                        <PersianDatePickerInput
                            label="تاریخ" // (شما باید پراپ label را به کامپوننت DatePicker خود اضافه کنید)
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            inputClassName="py-2.5" // (برای هماهنگی ظاهری)
                        />
                    )}
                />
                <div className="md:col-span-2"> {/* برای اینکه تمام عرض گرید را بگیرد */}
                    <Textarea
                        label="توضیحات"
                        placeholder="توضیحات درخواست (اختیاری)"
                        {...register('description')}
                        error={errors.description?.message}
                        rows={4} // (برای ارتفاع مناسب)
                    />
                </div>

            </div>

            {/* بخش دکمه‌های تایید و لغو */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-borderL dark:border-borderD">
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
                    className="bg-backgroundL-500 cursor-pointer dark:bg-backgroundD text-foregroundL dark:text-foregroundD px-6 py-2 rounded-lg text-sm font-medium border border-borderL dark:border-borderD disabled:opacity-50  hover:bg-destructiveL/40"
                >
                    لغو
                </button>
            </div>
        </form>
    );
};