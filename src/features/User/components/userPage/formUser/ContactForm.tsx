import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { type User } from '@/features/User/types/index';
import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import {
    type ContactFormData,
    contactFormSchema,
} from '@/features/User/Schema/userProfileFormSchema'; // ✅ اصلاح مسیر به types

import Input from '@/components/ui/Input'; // ✅ مسیر مستعار و حروف کوچک
import FormSection from '@/features/User/components/userPage/FormSection'; // ✅ مسیر نسبی صحیح

/**
 * فرم ۴: اطلاعات تماس
 */
const ContactForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    const defaultValues = useMemo(() => ({
        employee: user.employee ? {
            phone_number: user.employee.phone_number,
            house_number: user.employee.house_number,
            sos_number: user.employee.sos_number,
            address: user.employee.address,
        } : null
    }), [user]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues
    });

    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    const onSubmit = (formData: ContactFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => { toast.success("اطلاعات تماس به‌روزرسانی شد."); setIsEditing(false); },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    const handleCancel = () => { reset(defaultValues); setIsEditing(false); };

    return (
        <FormSection
            title="اطلاعات تماس و آدرس"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateMutation.isPending}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="موبایل"
                    {...register("employee.phone_number")}
                    error={errors.employee?.phone_number?.message}
                />
                <Input
                    label="تلفن منزل"
                    {...register("employee.house_number")}
                    error={errors.employee?.house_number?.message}
                />
                <Input
                    label="تلفن اضطراری"
                    {...register("employee.sos_number")}
                    error={errors.employee?.sos_number?.message}
                />
            </div>
            <Input
                label="آدرس"
                {...register("employee.address")}
                error={errors.employee?.address?.message}
            // (بهتر است از TextArea استفاده شود)
            />
        </FormSection>
    );
};

export default ContactForm;

