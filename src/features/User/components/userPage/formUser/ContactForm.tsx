import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { type User } from '@/features/User/types/index';
import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import {
    type ContactFormData,
    contactFormSchema,
} from '@/features/User/Schema/userProfileFormSchema';

import Input from '@/components/ui/Input';
import FormSection from '@/features/User/components/userPage/FormSection';
import Textarea from '@/components/ui/Textarea';

const ContactForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    const defaultValues = useMemo((): ContactFormData => {
        if (!user.employee) return { employee: null };
        return {
            employee: {
                phone_number: user.employee.phone_number || null,
                house_number: user.employee.house_number || null,
                sos_number: user.employee.sos_number || null,
                address: user.employee.address || null,
            }
        };
    }, [user]);

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

    if (!user.employee) return null;

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
                    className="dir-ltr text-left"
                />
                <Input
                    label="تلفن منزل"
                    {...register("employee.house_number")}
                    error={errors.employee?.house_number?.message}
                    className="dir-ltr text-left"
                />
                <Input
                    label="تلفن اضطراری"
                    {...register("employee.sos_number")}
                    error={errors.employee?.sos_number?.message}
                    className="dir-ltr text-left"
                />
            </div>
            <div className="mt-2">
                <Textarea
                    label="آدرس سکونت"
                    {...register("employee.address")}
                    error={errors.employee?.address?.message}
                    rows={3}
                />
            </div>
        </FormSection>
    );
};

export default ContactForm;