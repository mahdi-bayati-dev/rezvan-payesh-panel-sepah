"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

// --- هوک‌ها و تایپ‌ها (با مسیر نسبی) ---
import { useUpdateUserProfile } from '../../../hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type AccountInfoFormData,
    accountInfoFormSchema
} from '@/features/User/Schema/userProfileFormSchema'; // (استفاده از فایل types به‌روز شده)

// --- کامپوننت‌های UI (با مسیر نسبی و حروف کوچک) ---
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox'; // ✅ مسیر نسبی و حروف کوچک
import { type SelectOption } from '@/components/ui/SelectBox'; // ✅ مسیر نسبی و حروف کوچک
import FormSection from '../FormSection'; // ✅ مسیر نسبی

// --- داده‌های ثابت برای SelectBox ---
const statusOptions: SelectOption[] = [
    { id: 'active', name: 'فعال' },
    { id: 'inactive', name: 'غیرفعال' },
];

/**
 * فرم ۱: اطلاعات حساب
 */
const AccountInfoForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    // --- مقادیر پیش‌فرض ---
    const defaultValues = useMemo(() => ({
        user_name: user.user_name,
        email: user.email,
        status: user.status,
        // (اسکیما اجازه پسورد را می‌دهد اما ما فعلاً فرم آن را نمی‌گذاریم)
    }), [user]);

    // --- راه‌اندازی React Hook Form ---
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<AccountInfoFormData>({
        resolver: zodResolver(accountInfoFormSchema),
        defaultValues
    });

    // افکت برای ریست کردن فرم در صورت تغییر داده‌ها از بیرون
    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    // --- مدیریت Submit ---
    const onSubmit = (formData: AccountInfoFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => { toast.success("اطلاعات حساب به‌روزرسانی شد."); setIsEditing(false); },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    // --- مدیریت لغو ---
    const handleCancel = () => { reset(); setIsEditing(false); };

    return (
        <FormSection
            title="اطلاعات حساب"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateMutation.isPending}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="نام کاربری"
                    {...register("user_name")}
                    error={errors.user_name?.message}
                />
                <Input
                    label="ایمیل"
                    {...register("email")}
                    error={errors.email?.message}
                />

                {/* --- ✅ استفاده از SelectBox واقعی --- */}
                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="وضعیت"
                            placeholder="انتخاب کنید"
                            options={statusOptions}
                            // تبدیل مقدار خام ('active') به آبجکت ({ id: 'active', name: 'فعال' })
                            value={statusOptions.find(opt => opt.id === field.value) || null}
                            // تبدیل آبجکت ({ id: 'active', name: 'فعال' }) به مقدار خام ('active')
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.status?.message}
                        />
                    )}
                />
            </div>
        </FormSection>
    );
};

export default AccountInfoForm;

