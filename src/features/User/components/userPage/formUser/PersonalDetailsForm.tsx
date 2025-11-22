import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type PersonalDetailsFormData,
    personalDetailsFormSchema
} from '@/features/User/Schema/userProfileFormSchema';

import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';

const genderOptions: SelectOption[] = [
    { id: 'male', name: 'مرد' },
    { id: 'female', name: 'زن' },
];

const maritalStatusOptions: SelectOption[] = [
    { id: 'false', name: 'مجرد' },
    { id: 'true', name: 'متاهل' },
];

const educationLevelOptions: SelectOption[] = [
    { id: 'diploma', name: 'دیپلم' },
    { id: 'advanced_diploma', name: 'کاردانی' },
    { id: 'bachelor', name: 'لیسانس' },
    { id: 'master', name: 'فوق لیسانس' },
    { id: 'doctorate', name: 'دکترا' },
    { id: 'post_doctorate', name: 'فوق دکترا' },
];

const PersonalDetailsForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    // تنظیم مقادیر اولیه از روی آبجکت User دریافتی
    const defaultValues = useMemo((): PersonalDetailsFormData => {
        if (!user.employee) return { employee: null };

        return {
            employee: {
                first_name: user.employee.first_name,
                last_name: user.employee.last_name,
                father_name: user.employee.father_name || null,
                nationality_code: user.employee.nationality_code || null,
                
                // تبدیل تاریخ نال یا ISO String به رشته برای فرم
                birth_date: user.employee.birth_date || "", 
                
                gender: user.employee.gender,
                is_married: user.employee.is_married,
                education_level: user.employee.education_level || null,
            }
        };
    }, [user]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<PersonalDetailsFormData>({
        resolver: zodResolver(personalDetailsFormSchema),
        defaultValues
    });

    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    const onSubmit = (formData: PersonalDetailsFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => { toast.success("مشخصات فردی به‌روزرسانی شد."); setIsEditing(false); },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    const handleCancel = () => { reset(defaultValues); setIsEditing(false); };

    const handleDateChange = (date: DateObject | null, onChange: (val: string | null) => void) => {
        if (date) {
            onChange(date.convert(gregorian, gregorian_en).format("YYYY-MM-DD"));
        } else {
            onChange(null);
        }
    };

    if (!user.employee) {
        return (
            <div className="p-4 rounded-lg border border-warning-200 bg-warning-50 text-warning-800 dark:bg-warning-900/20 dark:text-warning-200">
                این کاربر فاقد پروفایل کارمندی است. مشخصات فردی قابل ویرایش نیست.
            </div>
        );
    }

    return (
        <FormSection
            title="مشخصات فردی"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateMutation.isPending}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="نام"
                    {...register("employee.first_name")}
                    error={errors.employee?.first_name?.message}
                />
                <Input
                    label="نام خانوادگی"
                    {...register("employee.last_name")}
                    error={errors.employee?.last_name?.message}
                />
                <Input
                    label="نام پدر"
                    {...register("employee.father_name")}
                    error={errors.employee?.father_name?.message}
                />
                <Input
                    label="کد ملی"
                    {...register("employee.nationality_code")}
                    error={errors.employee?.nationality_code?.message}
                    dir="ltr"
                    className="text-right"
                />
                
                <Controller
                    name="employee.birth_date"
                    control={control}
                    render={({ field }) => (
                        <PersianDatePickerInput
                            label="تاریخ تولد *"
                            value={field.value}
                            onChange={(date) => handleDateChange(date, field.onChange)}
                            error={errors.employee?.birth_date?.message}
                            disabled={!isEditing || updateMutation.isPending}
                        />
                    )}
                />

                <Controller
                    name="employee.gender"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="جنسیت"
                            placeholder="انتخاب کنید"
                            options={genderOptions}
                            value={genderOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.gender?.message}
                        />
                    )}
                />

                <Controller
                    name="employee.is_married"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="وضعیت تاهل"
                            placeholder="انتخاب کنید"
                            options={maritalStatusOptions}
                            value={maritalStatusOptions.find(opt => opt.id === String(field.value)) || null}
                            onChange={(option) => field.onChange(option ? option.id === 'true' : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.is_married?.message}
                        />
                    )}
                />

                <Controller
                    name="employee.education_level"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="تحصیلات"
                            placeholder="انتخاب کنید"
                            options={educationLevelOptions}
                            value={educationLevelOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.education_level?.message}
                        />
                    )}
                />
            </div>
        </FormSection>
    );
};

export default PersonalDetailsForm;