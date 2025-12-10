import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { KeyRound, Info } from 'lucide-react';

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
        password: null,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="نام کاربری" {...register("user_name")} error={errors.user_name?.message} dir="ltr" />
                <Input label="ایمیل" {...register("email")} error={errors.email?.message} dir="ltr" />
                <Controller name="status" control={control} render={({ field }) => (
                    <SelectBox label="وضعیت" placeholder="انتخاب کنید" options={statusOptions} value={statusOptions.find(opt => opt.id === field.value) || null} onChange={(option) => field.onChange(option ? option.id : null)} disabled={!isEditing || updateMutation.isPending} error={errors.status?.message} />
                )} />

                {!isEditing && (
                    <div className="md:col-span-3 mt-2 flex items-center gap-2 p-3 text-sm text-infoL-foreground bg-infoL-background dark:bg-infoD-background dark:text-infoD-foreground rounded-lg border border-infoL-foreground/20">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>برای تغییر رمز عبور، ابتدا روی دکمه <span className="font-bold">ویرایش</span> در بالای فرم کلیک کنید.</p>
                    </div>
                )}

                {isEditing && (
                    <div className="md:col-span-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="rounded-xl border border-dashed border-warningL-foreground/30 bg-warningL-background dark:border-warningD-foreground/30 dark:bg-warningD-background p-5 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="hidden sm:flex p-2 bg-backgroundL-500 dark:bg-warningD-foreground/10 rounded-lg shadow-sm text-warningL-foreground dark:text-warningD-foreground shrink-0">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-foregroundL dark:text-foregroundD flex items-center gap-2">
                                            <span className="sm:hidden text-warningL-foreground"><KeyRound className="h-4 w-4" /></span>
                                            تغییر رمز عبور
                                        </h4>
                                        <p className="text-xs text-muted-foregroundL dark:text-muted-foregroundD mt-1 leading-relaxed">
                                            در صورتی که قصد تغییر رمز عبور را دارید، مقدار جدید را در کادر زیر وارد کنید.
                                            <br className="hidden sm:block" />
                                            در غیر این صورت، این فیلد را <span className="font-semibold text-warningL-foreground dark:text-warningD-foreground">خالی بگذارید</span>.
                                        </p>
                                    </div>
                                    <div className="max-w-md">
                                        <Input label="رمز عبور جدید" type="password" {...register("password")} error={errors.password?.message} dir="ltr" className="bg-backgroundL-500 dark:bg-backgroundD border-warningL-foreground/30 focus:ring-warningL-foreground" autoComplete="new-password" placeholder="******" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FormSection>
    );
};

export default AccountInfoForm;