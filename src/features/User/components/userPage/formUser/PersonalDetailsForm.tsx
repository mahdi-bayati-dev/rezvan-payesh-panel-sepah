"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

// --- هوک‌ها و تایپ‌ها (با مسیر مستعار) ---
import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type PersonalDetailsFormData,
    personalDetailsFormSchema
} from '@/features/User/Schema/userProfileFormSchema'; // (استفاده از فایل types به‌روز شده)

// --- کامپوننت‌های UI (با مسیر مستعار) ---
// (مسیرها و حروف کوچک/بزرگ بر اساس هشدارهای قبلی تنظیم شدند)
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection'; // (کامپوننت Wrapper)

// --- داده‌های ثابت برای SelectBoxها ---

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
    { id: 'advanced_diploma', name: 'کاردانی' }, // (بر اساس اسکیما اضافه شد)
    { id: 'bachelor', name: 'لیسانس' },
    { id: 'master', name: 'فوق لیسانس' },
    { id: 'doctorate', name: 'دکترا' },
    { id: 'post_doctorate', name: 'فوق دکترا' }, // (بر اساس اسکیما اضافه شد)
];


/**
 * فرم ۲: مشخصات فردی
 */
const PersonalDetailsForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    // --- مقادیر پیش‌فرض ---
    const defaultValues = useMemo(() => ({
        employee: user.employee ? {
            first_name: user.employee.first_name,
            last_name: user.employee.last_name,
            father_name: user.employee.father_name,
            nationality_code: user.employee.nationality_code,
            birth_date: user.employee.birth_date,
            gender: user.employee.gender,
            is_married: user.employee.is_married,
            education_level: user.employee.education_level,
        } : null
    }), [user]);

    // --- راه‌اندازی React Hook Form ---
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

    // افکت برای ریست کردن فرم در صورت تغییر داده‌ها از بیرون
    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    // --- مدیریت Submit ---
    const onSubmit = (formData: PersonalDetailsFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => { toast.success("مشخصات فردی به‌روزرسانی شد."); setIsEditing(false); },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    // --- مدیریت لغو ---
    const handleCancel = () => { reset(); setIsEditing(false); };

    // (بررسی می‌کنیم که آیا کاربر پروفایل کارمندی دارد یا خیر)
    if (!user.employee) {
        return (
            <div className="p-4 rounded-lg border border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD">
                این کاربر فاقد پروفایل کارمندی است. مشخصات فردی قابل تنظیم نیست.
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
                />
                <Input
                    label="تاریخ تولد (YYYY-MM-DD)"
                    {...register("employee.birth_date")}
                    error={errors.employee?.birth_date?.message}
                // (بهتر است از DatePicker استفاده شود)
                />

                {/* --- ✅ استفاده از SelectBox واقعی --- */}
                <Controller
                    name="employee.gender"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="جنسیت"
                            placeholder="انتخاب کنید"
                            options={genderOptions}
                            // تبدیل مقدار خام ('male') به آبجکت ({ id: 'male', name: 'مرد' })
                            value={genderOptions.find(opt => opt.id === field.value) || null}
                            // تبدیل آبجکت ({ id: 'male', name: 'مرد' }) به مقدار خام ('male')
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
                            // تبدیل مقدار خام (boolean) به آبجکت ({ id: 'true', name: 'متاهل' })
                            value={maritalStatusOptions.find(opt => opt.id === String(field.value)) || null}
                            // تبدیل آبجکت ({ id: 'true', name: 'متاهل' }) به مقدار خام (boolean)
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

