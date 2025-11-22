"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type AccountInfoFormData,
    accountInfoFormSchema
} from '@/features/User/Schema/userProfileFormSchema';

import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';

const statusOptions: SelectOption[] = [
    { id: 'active', name: 'فعال' },
    { id: 'inactive', name: 'غیرفعال' },
];

const AccountInfoForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    const defaultValues = useMemo((): AccountInfoFormData => ({
        user_name: user.user_name,
        email: user.email,
        status: user.status,
        password: null, // رمز عبور در حالت عادی خالی است
    }), [user]);

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

    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    const onSubmit = (formData: AccountInfoFormData) => {
        // اگر پسورد خالی بود، آن را از پی‌لود حذف می‌کنیم تا الکی آپدیت نشود
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;

        updateMutation.mutate(
            { userId: user.id, payload },
            {
                onSuccess: () => { toast.success("اطلاعات حساب به‌روزرسانی شد."); setIsEditing(false); },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    const handleCancel = () => { reset(defaultValues); setIsEditing(false); };

    return (
        <FormSection
            title="اطلاعات حساب کاربری"
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
                    dir="ltr"
                />
                <Input
                    label="ایمیل"
                    {...register("email")}
                    error={errors.email?.message}
                    dir="ltr"
                />

                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="وضعیت"
                            placeholder="انتخاب کنید"
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.status?.message}
                        />
                    )}
                />
                
                {isEditing && (
                    <div className="md:col-span-3 border-t border-borderL dark:border-borderD pt-4 mt-2">
                        <p className="text-xs text-muted-foregroundL mb-2">تنظیم رمز عبور جدید (فقط در صورتی که می‌خواهید تغییر دهید پر کنید)</p>
                        <Input
                            label="رمز عبور جدید"
                            type="password"
                            {...register("password")}
                            error={errors.password?.message}
                            dir="ltr"
                            className="max-w-md"
                        />
                    </div>
                )}
            </div>
        </FormSection>
    );
};

export default AccountInfoForm;