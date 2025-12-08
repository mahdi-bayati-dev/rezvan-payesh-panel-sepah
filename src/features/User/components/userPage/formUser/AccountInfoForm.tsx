import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { KeyRound, Info } from 'lucide-react'; // ✅ آیکون Info اضافه شد

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* ✅ پیام راهنما برای تغییر رمز عبور (نمایش فقط وقتی در حالت مشاهده هستیم) */}
                {!isEditing && (
                    <div className="md:col-span-3 mt-2 flex items-center gap-2 p-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>
                            برای تغییر رمز عبور، ابتدا روی دکمه <span className="font-bold">ویرایش</span> در بالای فرم کلیک کنید.
                        </p>
                    </div>
                )}

                {/* ✅ بخش تغییر رمز عبور با طراحی بهبود یافته */}
                {isEditing && (
                    <div className="md:col-span-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-900/10 p-5 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20">
                            <div className="flex items-start gap-4">
                                <div className="hidden sm:flex p-2 bg-white dark:bg-amber-900/30 rounded-lg shadow-sm text-amber-600 dark:text-amber-500 shrink-0">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <span className="sm:hidden text-amber-600"><KeyRound className="h-4 w-4" /></span>
                                            تغییر رمز عبور
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            در صورتی که قصد تغییر رمز عبور را دارید، مقدار جدید را در کادر زیر وارد کنید.
                                            <br className="hidden sm:block" />
                                            در غیر این صورت، این فیلد را <span className="font-semibold text-amber-700 dark:text-amber-400">خالی بگذارید</span>.
                                        </p>
                                    </div>

                                    <div className="max-w-md">
                                        <Input
                                            label="رمز عبور جدید"
                                            type="password"
                                            {...register("password")}
                                            error={errors.password?.message}
                                            dir="ltr"
                                            className="bg-white dark:bg-gray-950 border-amber-200 dark:border-amber-800 focus:ring-amber-500 dark:focus:ring-amber-600"
                                            autoComplete="new-password"
                                            placeholder="******"
                                        />
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