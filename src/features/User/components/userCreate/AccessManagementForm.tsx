import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert, UserCog } from 'lucide-react';

import { useUpdateUserRole } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type AccessManagementFormData,
    accessManagementFormSchema
} from '@/features/User/Schema/userProfileFormSchema';
import { USER_ROLES } from '@/features/User/constants/userConstants';

import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';

const ROLE_OPTIONS: SelectOption[] = [
    { id: USER_ROLES.USER, name: 'کارمند (User)' },
    { id: USER_ROLES.ORG_ADMIN_L3, name: 'ادمین واحد (L3)' },
    { id: USER_ROLES.ORG_ADMIN_L2, name: 'ادمین سازمان (L2)' },
];

const AccessManagementForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateRoleMutation = useUpdateUserRole();

    const defaultValues = useMemo(() => ({
        role: user.roles?.[0] || USER_ROLES.USER,
    }), [user]);

    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<AccessManagementFormData>({
        resolver: zodResolver(accessManagementFormSchema),
        defaultValues
    });

    useEffect(() => {
        reset(defaultValues);
        setIsEditing(false);
    }, [user, defaultValues, reset]);

    const onSubmit = (formData: AccessManagementFormData) => {
        if (!isDirty) return;
        updateRoleMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: (updatedUser) => {
                    reset({ role: updatedUser.roles?.[0] || USER_ROLES.USER });
                    setIsEditing(false);
                },
                onError: (err) => { console.error("Role Update Error:", err); }
            }
        );
    };

    const handleCancel = () => {
        reset(defaultValues);
        setIsEditing(false);
    };

    return (
        <FormSection
            title="مدیریت سطح دسترسی"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateRoleMutation.isPending}
        >
            <div className={`
                flex items-start gap-3 p-4 rounded-lg border transition-all duration-300
                ${isEditing
                    ? 'bg-warningL-background border-warningL-foreground/20 text-warningL-foreground dark:bg-warningD-background dark:border-warningD-foreground/20 dark:text-warningD-foreground'
                    : 'bg-secondaryL/20 border-borderL text-muted-foregroundL dark:bg-secondaryD/20 dark:border-borderD dark:text-muted-foregroundD grayscale opacity-80'}
            `}>
                <div className={`p-2 rounded-full ${isEditing ? 'bg-warningL-foreground/10' : 'bg-secondaryL/50 dark:bg-secondaryD/50'}`}>
                    {isEditing ? <ShieldAlert className="h-5 w-5" /> : <UserCog className="h-5 w-5" />}
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold">
                        {isEditing ? "هشدار امنیتی" : "سطح دسترسی فعلی"}
                    </p>
                    <p className="text-xs leading-relaxed opacity-90">
                        {isEditing
                            ? "تغییر نقش کاربر فوراً دسترسی‌های او را در سیستم تغییر می‌دهد. لطفاً با دقت انتخاب کنید."
                            : "برای تغییر سطح دسترسی این کاربر، روی دکمه ویرایش کلیک کنید."}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="نقش کاربری"
                            placeholder="انتخاب کنید"
                            options={ROLE_OPTIONS}
                            value={ROLE_OPTIONS.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateRoleMutation.isPending}
                            error={errors.role?.message}
                        />
                    )}
                />
            </div>
        </FormSection>
    );
};

export default AccessManagementForm;