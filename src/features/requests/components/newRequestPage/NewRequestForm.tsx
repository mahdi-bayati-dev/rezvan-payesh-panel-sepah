// --- ✅ به‌روزرسانی فرم ثبت درخواست (پشتیبانی از بازه تاریخی و تمام وقت) ---

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { DateObject } from 'react-multi-date-picker';
import Checkbox from '@/components/ui/Checkbox'; // ✅ ایمپورت Checkbox

// [مسیرها اصلاح شد]
import {
    newRequestSchema,
    type NewRequestFormData,
} from '@/features/requests/schemas/newRequestSchema';
import type { User, LeaveType } from '@/features/requests/types/index';
import { type SelectOption } from '@/components/ui/SelectBox';
import { useLeaveTypes } from '@/features/requests/hook/useLeaveTypes';

// ایمپورت کامپوننت‌های UI ماژولار
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import Textarea from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

interface NewRequestFormProps {
    currentUser: User; // دریافت کاربر برای نمایش اطلاعات
    onSubmit: (data: NewRequestFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

/**
 * تابع کمکی برای تبدیل ساختار درختی API به SelectOption
 */
const mapLeaveTypesToOptions = (types: LeaveType[], prefix = ''): SelectOption[] => {
    let options: SelectOption[] = [];
    for (const type of types) {
        options.push({
            id: type.id,
            name: `${prefix} ${type.name}`,
        });
        if (type.children && type.children.length > 0) {
            options = options.concat(mapLeaveTypesToOptions(type.children, prefix + '—'));
        }
    }
    return options;
};


export const NewRequestForm = ({
    currentUser,
    onSubmit,
    onCancel,
    isSubmitting,
}: NewRequestFormProps) => {

    // --- ۱. دریافت داده‌ها برای فیلترها ---
    const { data: leaveTypesTree, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
    const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
    const [requestTypeOptions, setRequestTypeOptions] = useState<SelectOption[]>([]);

    // --- ۲. راه‌اندازی React Hook Form ---
    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<NewRequestFormData>({
        // ✅ [رفع خطا] حالا resolver با تایپ NewRequestFormData سازگار است
        resolver: zodResolver(newRequestSchema),
        defaultValues: {
            category: null,
            requestType: null,
            // DateObject باید از react-multi-date-picker ایمپورت شود
            startDate: new DateObject(),
            endDate: new DateObject(),
            isFullDay: true,
            // ✅ [رفع خطا] فیلدهای ساعت به صورت optional/nullable در اسکیما تعریف شدند
            startTime: '08:00', // مقداردهی اولیه String
            endTime: '17:00',   // مقداردهی اولیه String
            description: '',
        },
    });

    // مشاهده فیلدهای کلیدی برای منطق UI
    const selectedCategory = watch('category');
    const isFullDay = watch('isFullDay');

    // تابع ارسال فرم
    // ✅ [رفع خطا] حالا handleSubmit با تایپ NewRequestFormData سازگار است
    const onFormSubmit: SubmitHandler<NewRequestFormData> = (data) => {
        onSubmit(data);
    };

    // --- ۳. منطق فیلترهای زنجیره‌ای (Cascading) ---
    useEffect(() => {
        if (!leaveTypesTree) return;

        // پر کردن گزینه‌های دسته‌بندی (والدها)
        const categories = leaveTypesTree
            .filter(lt => !lt.parent_id) // فقط ریشه‌ها
            .map(lt => ({ id: lt.id, name: lt.name }));
        setCategoryOptions(categories);

        // ریست کردن فیلد "نوع درخواست"
        setValue('requestType', null);

        if (selectedCategory) {
            // پیدا کردن آیتم والد در درخت
            const parent = leaveTypesTree.find(lt => lt.id === selectedCategory.id);
            // پر کردن گزینه‌های "نوع درخواست" (فرزندان)
            const types = parent?.children
                ? mapLeaveTypesToOptions(parent.children)
                : [];
            setRequestTypeOptions(types);
        } else {
            // اگر دسته‌بندی انتخاب نشده، "نوع درخواست" را خالی کن
            setRequestTypeOptions([]);
        }

    }, [leaveTypesTree, selectedCategory, setValue]);


    // --- ۴. استخراج اطلاعات کاربر (ReadOnly) ---
    const employee = currentUser.employee;
    const employeeName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();
    const employeeOrg = employee?.organization?.name || '---';
    const employeeCode = employee?.personnel_code || '---';


    return (
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            {/* ✅ ریسپانسیو: تنظیم گپ عمودی و افقی مناسب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">

                {/* بخش اطلاعات کاربر (ReadOnly) */}
                <Input
                    label="نام و نام خانوادگی"
                    value={employeeName}
                    readOnly
                    disabled
                    containerClassName="opacity-70"
                />
                <Input
                    label="کد پرسنلی"
                    value={employeeCode}
                    readOnly
                    disabled
                    containerClassName="opacity-70"
                />
                <Input
                    label="سازمان"
                    value={employeeOrg}
                    readOnly
                    disabled
                    containerClassName="opacity-70 md:col-span-2"
                />

                <hr className="md:col-span-2 my-2 border-borderL dark:border-borderD" />

                {/* بخش اصلی فرم */}
                <Controller
                    name="category"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectBox
                            label="دسته بندی درخواست"
                            options={categoryOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={isLoadingLeaveTypes ? "درحال بارگذاری..." : "انتخاب کنید"}
                            disabled={isLoadingLeaveTypes || isSubmitting}
                            error={fieldState.error?.message}
                        />
                    )}
                />

                <Controller
                    name="requestType"
                    control={control}
                    render={({ field, fieldState }) => (
                        <SelectBox
                            label="نوع درخواست"
                            options={requestTypeOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={!selectedCategory ? "ابتدا دسته بندی را انتخاب کنید" : "انتخاب کنید"}
                            disabled={!selectedCategory || isSubmitting || requestTypeOptions.length === 0}
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {/* ✅ فیلد تاریخ شروع (Start Date) */}
                <Controller
                    name="startDate"
                    control={control}
                    render={({ field, fieldState }) => (
                        <PersianDatePickerInput
                            label="تاریخ شروع"
                            value={field.value}
                            onChange={(date) => {
                                field.onChange(date);
                                // اگر تاریخ شروع عوض شد، تاریخ پایان را به همان مقدار به‌روزرسانی کن
                                setValue('endDate', date);
                            }}
                            placeholder="انتخاب کنید"
                            disabled={isSubmitting}
                            error={fieldState.error?.message}
                        />
                    )}
                />

                {/* ✅ فیلد تاریخ پایان (End Date) */}
                <Controller
                    name="endDate"
                    control={control}
                    render={({ field, fieldState }) => (
                        <PersianDatePickerInput
                            label="تاریخ پایان"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="انتخاب کنید"
                            disabled={isSubmitting}
                            error={fieldState.error?.message || errors.endDate?.message}
                        />
                    )}
                />

                {/* ✅ حالت تمام وقت (Full Day Checkbox) */}
                <Controller
                    name="isFullDay"
                    control={control}
                    render={({ field }) => (
                        <div className="md:col-span-2 flex items-center pt-2">
                            <Checkbox
                                id="isFullDayCheckbox"
                                label="مرخصی تمام وقت (Full Day)"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}
                />

                {/* ✅ فیلدهای ساعت (به صورت شرطی نمایش داده می‌شوند) */}
                {!isFullDay && (
                    /* ✅ ریسپانسیو: نمایش در یک سطر در موبایل و دسکتاپ (دو ستونی) */
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:col-span-2">
                        <Controller
                            name="startTime"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">ساعت شروع</label>
                                    <CustomTimeInput
                                        // ✅ [سازگاری با تایپ جدید] از field.value استفاده می‌کنیم که حالا می‌تواند string، null یا undefined باشد
                                        value={field.value || null}
                                        onChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                    {fieldState.error && (
                                        <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                        <span className="md:pb-3 text-muted-foregroundL dark:text-muted-foregroundD">تا</span>
                        <Controller
                            name="endTime"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">ساعت پایان</label>
                                    <CustomTimeInput
                                        // ✅ [سازگاری با تایپ جدید]
                                        value={field.value || null}
                                        onChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                    {(fieldState.error || errors.endTime) && (
                                        <p className="mt-1 text-xs text-right text-destructiveL dark:text-destructiveD">
                                            {fieldState.error?.message || errors.endTime?.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                )}

                <div className="md:col-span-2">
                    <Textarea
                        label="توضیحات (اختیاری)"
                        placeholder="توضیحات درخواست..."
                        {...register('description')}
                        error={errors.description?.message}
                        rows={4}
                        disabled={isSubmitting}
                    />
                </div>

            </div>

            {/* بخش دکمه‌های تایید و لغو */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-borderL dark:border-borderD">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="bg-backgroundL-500 cursor-pointer dark:bg-backgroundD text-foregroundL dark:text-foregroundD px-6 py-2 rounded-lg text-sm font-medium border border-borderL dark:border-borderD disabled:opacity-50  hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    لغو
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isLoadingLeaveTypes}
                    className="bg-primaryL cursor-pointer dark:bg-primaryD text-primary-foregroundL dark:text-primary-foregroundD px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primaryL/90 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Spinner size="sm" />
                            <span>در حال ارسال...</span>
                        </>
                    ) : (
                        'تایید و ثبت درخواست'
                    )}
                </button>
            </div>
        </form>
    );
};