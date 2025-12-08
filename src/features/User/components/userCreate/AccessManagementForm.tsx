import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { toast } from 'react-toastify';
import { ShieldAlert, UserCog } from 'lucide-react';

// --- Hooks & Types ---
import { useUpdateUserRole } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type AccessManagementFormData,
    accessManagementFormSchema
} from '@/features/User/Schema/userProfileFormSchema';
import { USER_ROLES } from '@/features/User/constants/userConstants';

// --- UI Components ---
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';

// ✅ استفاده از ثابت‌ها برای تعریف آپشن‌ها
const ROLE_OPTIONS: SelectOption[] = [
    { id: USER_ROLES.USER, name: 'کارمند (User)' },
    { id: USER_ROLES.ORG_ADMIN_L3, name: 'ادمین واحد (L3)' },
    { id: USER_ROLES.ORG_ADMIN_L2, name: 'ادمین سازمان (L2)' },
    // { id: USER_ROLES.SUPER_ADMIN, name: 'مدیر کل (Super Admin)' },
];

/**
 * فرم مدیریت دسترسی (تغییر نقش)
 * این فرم حساس است و باید رفتار استاندارد (قفل بودن اولیه) داشته باشد.
 */
const AccessManagementForm: React.FC<{ user: User }> = ({ user }) => {
    // ✅ اصلاح ۱: شروع با حالت بسته (False) برای هماهنگی با سایر فرم‌ها
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

    // همگام‌سازی فرم با تغییر کاربر
    useEffect(() => {
        reset(defaultValues);
        setIsEditing(false); // وقتی کاربر عوض شد، فرم بسته شود
    }, [user, defaultValues, reset]);

    const onSubmit = (formData: AccessManagementFormData) => {
        if (!isDirty) return;

        updateRoleMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: (updatedUser) => {
                    // آپدیت موفق -> ریست فرم با دیتای جدید و بستن حالت ویرایش
                    reset({ role: updatedUser.roles?.[0] || USER_ROLES.USER });
                    setIsEditing(false);
                },
                onError: (err) => {
                    console.error("Role Update Error:", err);
                    // (Toast در هوک مدیریت می‌شود)
                }
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
            {/* باکس هشدار زرد رنگ (فقط در حالت ویرایش نمایش داده شود تا شلوغ نشود یا همیشه باشد) */}
            <div className={`
                flex items-start gap-3 p-4 rounded-lg border transition-all duration-300
                ${isEditing
                    ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200'
                    : 'bg-gray-50 border-gray-100 text-gray-500 dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-400 grayscale opacity-80'}
            `}>
                <div className={`p-2 rounded-full ${isEditing ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-gray-200 dark:bg-gray-700'}`}>
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
                            disabled={!isEditing || updateRoleMutation.isPending} // ✅ قفل شدن اینپوت وقتی ویرایش نیست
                            error={errors.role?.message}
                        />
                    )}
                />
            </div>
        </FormSection>
    );
};

export default AccessManagementForm;