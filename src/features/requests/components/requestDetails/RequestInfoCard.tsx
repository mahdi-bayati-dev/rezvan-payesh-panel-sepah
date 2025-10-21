import { useState } from 'react';
import type { Request } from "@/features/requests/types";
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Save, X } from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ۱. ایمپورت کامپوننت‌های UI ماژولار
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import Textarea from '@/components/ui/Textarea';

// ۲. ایمپورت اسکیما و تایپ جدید
import {
    requestInfoSchema,
    type RequestInfoFormData,
} from '@/features/requests/schemas/requestInfoSchema'; // (مسیر را چک کنید)

// ۳. ایمپورت داده‌های فیک برای SelectBox ها
import {
    mockCategories,
    mockRequestTypes,
} from '@/features/requests/data/mockData';

// کامپوننت فقط خواندنی (برای ضمیمه)
// const ReadOnlyRow = ({ label, value }: { label: string; value: string }) => (
//     <div className="flex justify-between items-center text-sm py-4 border-b border-borderL dark:border-borderD last:border-b-0">
//         <span className="text-muted-foregroundL dark:text-muted-foregroundD">{label}</span>
//         <span className="font-medium text-foregroundL dark:text-foregroundD text-left">{value}</span>
//     </div>
// );

interface RequestInfoCardProps {
    request: Request;
}

export const RequestInfoCard = ({ request }: RequestInfoCardProps) => {
    // ۴. مدیریت حالت ویرایش
    const [isEditing, setIsEditing] = useState(false);

    // ۵. آماده‌سازی داده‌های پیش‌فرض برای فرم
    const defaultValues: RequestInfoFormData = {
        requestType: mockRequestTypes.find(r => r.name === request.requestType) || null,
        category: mockCategories.find(c => c.name === request.category) || null,
        // (تبدیل رشته تاریخ فیک به آبجکت DateObject)
        date: new DateObject({
            date: request.date,
            calendar: persian,
            locale: persian_fa
        }),
        startTime: "07:00",
        endTime: "14:00",
        description: "توضیحات مربوط به این درخواست...",
    };

    // ۶. راه‌اندازی react-hook-form
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RequestInfoFormData>({
        resolver: zodResolver(requestInfoSchema),
        defaultValues: defaultValues,
    });

    // ۷. توابع ذخیره و لغو
    const onSave: SubmitHandler<RequestInfoFormData> = async (data) => {
        console.log("داده‌های جدید برای ذخیره:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsEditing(false);
    };

    const onCancel = () => {
        reset(defaultValues);
        setIsEditing(false);
    };

    return (
        <div className="pr-2 w-full">
            {/* ۸. اتصال فرم */}
            <form onSubmit={handleSubmit(onSave)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">

                    {/* ستون راست - قابل ویرایش */}
                    <div className="flex flex-col gap-y-4">
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
                                    disabled={!isEditing}
                                    error={errors.requestType?.message}
                                />
                            )}
                        />

                        <div className="flex items-start gap-3">
                            <Input
                                label="ساعت"
                                {...register('startTime')}
                                disabled={!isEditing}
                                error={errors.startTime?.message}
                                placeholder="HH:mm"
                            />
                            <span className="pt-10 text-foregroundL dark:text-muted-foregroundD">تا</span>
                            <Input
                                label="ساعت" // لیبل تکراری لازم ندارد
                                {...register('endTime')}
                                disabled={!isEditing}
                                error={errors.endTime?.message}
                                placeholder="HH:mm"
                            />
                        </div>

                        <Textarea
                            label="توضیحات"
                            {...register('description')}
                            rows={6}
                            disabled={!isEditing}
                            error={errors.description?.message}
                            placeholder="توضیحات را وارد کنید..."
                        />

                    </div>

                    {/* ستون چپ - قابل ویرایش */}
                    <div className="flex flex-col gap-y-4">
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
                                    disabled={!isEditing}
                                    error={errors.category?.message}
                                />
                            )}
                        />

                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <PersianDatePickerInput
                                    label="تاریخ"
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="انتخاب کنید"
                                    disabled={!isEditing}
                                    error={errors.date?.message}
                                />
                            )}
                        />

                        {/* فیلد ضمیمه (فقط خواندنی) */}
                        {/* <ReadOnlyRow label="ضمیمه" value="Attachment.pdf" /> */}
                    </div>
                </div>

                {/* ۹. مدیریت دکمه‌های ویرایش/ذخیره/لغو */}
                <div className="flex justify-end mt-8">
                    {isEditing ? (
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex justify-center items-center  hover:bg-successD-foreground cursor-pointer gap-2 bg-primaryL text-primary-foregroundL dark:bg-primaryD dark:text-primary-foregroundD px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="flex justify-center  hover:bg-destructiveL-foreground cursor-pointer  items-center gap-2 bg-backgroundL-500 text-foregroundL dark:bg-backgroundD dark:text-foregroundD px-6 py-2 rounded-lg text-sm font-medium border border-borderL dark:border-borderD disabled:opacity-50"
                            >
                                <X size={16} />
                                لغو
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-primaryL hover:bg-successD-foreground cursor-pointer dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-8 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                        >
                            <Pencil size={16} />
                            ویرایش
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};