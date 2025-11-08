
import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

// --- هوک‌ها و تایپ‌ها ---
import { useUpdateUserRole } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type AccessManagementFormData,
    accessManagementFormSchema
} from '@/features/User/Schema/userProfileFormSchema';

// --- کامپوننت‌های UI ---
import SelectBox from '@/components/ui/SelectBox';
import { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection'; // کامپوننت Wrapper شما
import { ShieldCheck } from 'lucide-react';

// --- گزینه‌های انتخاب نقش ---
// بر اساس مستندات شما و نقش‌های موجود
const roleOptions: SelectOption[] = [
    { id: 'user', name: 'کارمند (user)' },
    { id: 'org-admin-l3', name: 'ادمین سازمانی L3' },
    { id: 'org-admin-l2', name: 'ادمین سازمانی L2' },
    { id: 'super_admin', name: 'ادمین کل (Super Admin)' },
];

/**
 * فرم ۵: مدیریت دسترسی (تغییر نقش)
 * این فرم فقط باید توسط Super Admin دیده شود.
 */
const AccessManagementForm: React.FC<{ user: User }> = ({ user }) => {
    // این فرم همیشه در حالت ویرایش است، چون فقط یک فیلد دارد
    const [isEditing, setIsEditing] = useState(true);
    const updateRoleMutation = useUpdateUserRole();

    // مقادیر پیش‌فرض
    const defaultValues = useMemo(() => ({
        // API نقش‌ها را به صورت آرایه برمی‌گرداند، ما اولین نقش را می‌گیریم
        // چون API شما برای ایجاد کاربر فقط یک role می‌پذیرد (string)
        role: user.roles?.[0] || 'user',
    }), [user]);

    // راه‌اندازی React Hook Form
    const {
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<AccessManagementFormData>({
        resolver: zodResolver(accessManagementFormSchema),
        defaultValues
    });

    // افکت برای ریست کردن فرم
    useEffect(() => {
        reset(defaultValues);
    }, [user, defaultValues, reset]);

    // مدیریت Submit
    const onSubmit = (formData: AccessManagementFormData) => {
        // اطمینان از اینکه نقش واقعاً تغییر کرده است
        if (!isDirty) {
            toast.info("نقش تغییری نکرده است.");
            return;
        }

        updateRoleMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: (updatedUser) => {
                    // هوک useUpdateUserRole خودش پیام موفقیت را نشان می‌دهد
                    // ما فقط فرم را ریست می‌کنیم
                    reset({ role: updatedUser.roles?.[0] || 'user' });
                },
                onError: (err) => {
                    // هوک useUpdateUserRole خودش پیام خطا را نشان می‌دهد
                    console.error("خطا در تغییر نقش:", err);
                }
            }
        );
    };

    // مدیریت لغو (در اینجا یعنی ریست کردن به مقدار اولیه)
    const handleCancel = () => {
        reset(defaultValues);
        // چون این فرم همیشه باز است، دکمه لغو فقط ریست می‌کند
        // setIsEditing(false); // این خط را نیاز نداریم
    };

    return (
        <FormSection
            title="مدیریت دسترسی (مخصوص Super Admin)"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing} // (این prop دیگر استفاده نمی‌شود)
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateRoleMutation.isPending}
        >
            {/* متن هشدار */}
            <div className="flex items-center gap-2 p-3 bg-warning-50 dark:bg-warning-900 border border-warning-200 dark:border-warning-700 rounded-lg text-warning-700 dark:text-warning-200">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-medium">
                    تغییر نقش کاربر مستقیماً بر سطح دسترسی او در کل سیستم تأثیر می‌گذارد.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="نقش کاربری"
                            placeholder="انتخاب نقش..."
                            options={roleOptions}
                            // تبدیل مقدار خام ('user') به آبجکت ({ id: 'user', name: 'کارمند' })
                            value={roleOptions.find(opt => opt.id === field.value) || null}
                            // تبدیل آبجکت به مقدار خام
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