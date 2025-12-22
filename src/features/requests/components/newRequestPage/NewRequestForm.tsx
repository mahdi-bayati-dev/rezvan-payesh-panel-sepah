// src/features/requests/components/newRequestPage/NewRequestForm.tsx

import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { DateObject } from 'react-multi-date-picker';
import Checkbox from '@/components/ui/Checkbox';

import {
    newRequestSchema,
    type NewRequestFormData,
} from '@/features/requests/schemas/newRequestSchema';
import type { User, LeaveType } from '@/features/requests/types/index';
import { type SelectOption } from '@/components/ui/SelectBox';
import { useLeaveTypes } from '@/features/requests/hook/useLeaveTypes';

import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import Textarea from '@/components/ui/Textarea';
import { SpinnerButton } from '@/components/ui/SpinnerButton';
import { CustomTimeInput } from '@/components/ui/CustomTimeInput';

interface NewRequestFormProps {
    currentUser: User;
    onSubmit: (data: NewRequestFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

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

    const { data: leaveTypesTree, isLoading: isLoadingLeaveTypes } = useLeaveTypes();
    const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
    const [requestTypeOptions, setRequestTypeOptions] = useState<SelectOption[]>([]);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<NewRequestFormData>({
        resolver: zodResolver(newRequestSchema),
        defaultValues: {
            category: null,
            requestType: null,
            startDate: new DateObject(),
            endDate: new DateObject(),
            isFullDay: true,
            startTime: '08:00',
            endTime: '17:00',
            description: '',
        },
    });

    const selectedCategory = watch('category');
    const isFullDay = watch('isFullDay');

    const onFormSubmit: SubmitHandler<NewRequestFormData> = (data) => {
        onSubmit(data);
    };

    useEffect(() => {
        if (!leaveTypesTree) return;
        const categories = leaveTypesTree
            .filter(lt => !lt.parent_id)
            .map(lt => ({ id: lt.id, name: lt.name }));
        setCategoryOptions(categories);
        setValue('requestType', null);

        if (selectedCategory) {
            const parent = leaveTypesTree.find(lt => lt.id === selectedCategory.id);
            const types = parent?.children
                ? mapLeaveTypesToOptions(parent.children)
                : [];
            setRequestTypeOptions(types);
        } else {
            setRequestTypeOptions([]);
        }

    }, [leaveTypesTree, selectedCategory, setValue]);

    const employee = currentUser.employee;
    const employeeName = `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();
    const employeeOrg = employee?.organization?.name || '---';
    const employeeCode = employee?.personnel_code || '---';

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8">

                {/* --- ReadOnly Info --- */}
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

                {/* --- Main Fields --- */}
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

                <Controller
                    name="startDate"
                    control={control}
                    render={({ field, fieldState }) => (
                        <PersianDatePickerInput
                            label="تاریخ شروع"
                            value={field.value}
                            onChange={(date) => {
                                field.onChange(date);
                                setValue('endDate', date);
                            }}
                            placeholder="انتخاب کنید"
                            disabled={isSubmitting}
                            error={fieldState.error?.message}
                            // اطمینان از استایل‌های استاندارد در کامپوننت داخلی
                            inputClassName="bg-backgroundL-500 dark:bg-backgroundD text-foregroundL dark:text-foregroundD border-borderL dark:border-borderD"
                        />
                    )}
                />

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
                            inputClassName="bg-backgroundL-500 dark:bg-backgroundD text-foregroundL dark:text-foregroundD border-borderL dark:border-borderD"
                        />
                    )}
                />

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

                {!isFullDay && (
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:col-span-2">
                        <Controller
                            name="startTime"
                            control={control}
                            render={({ field, fieldState }) => (
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-right mb-1 text-foregroundL dark:text-foregroundD">ساعت شروع</label>
                                    <CustomTimeInput
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

            {/* --- Buttons --- */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-borderL dark:border-borderD">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    // ✅ اصلاح: حذف hover:bg-gray-100 و جایگزینی با hover:bg-secondaryL
                    // ✅ اصلاح: حذف text-gray-700 و جایگزینی با text-foregroundL
                    className="
                        bg-backgroundL-500 dark:bg-backgroundD 
                        text-foregroundL dark:text-foregroundD 
                        border border-borderL dark:border-borderD 
                        px-6 py-2 rounded-lg text-sm font-medium 
                        hover:bg-secondaryL dark:hover:bg-secondaryD/50 
                        disabled:opacity-50 transition-colors
                        cursor-pointer
                    "
                >
                    لغو
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isLoadingLeaveTypes}
                    // ✅ استفاده صحیح از متغیرهای primary
                    className="
                        bg-primaryL dark:bg-primaryD 
                        text-primary-foregroundL dark:text-primary-foregroundD 
                        px-6 py-2 rounded-lg text-sm font-medium 
                        hover:bg-primaryL/90 dark:hover:bg-primaryD/90 
                        disabled:opacity-50 flex items-center gap-2 transition-all
                        cursor-pointer
                    "
                >
                    {isSubmitting ? (
                        <>
                            <SpinnerButton size="sm" />
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