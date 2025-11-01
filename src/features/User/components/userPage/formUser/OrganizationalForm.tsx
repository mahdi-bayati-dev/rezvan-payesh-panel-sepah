"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

// --- هوک‌ها و تایپ‌ها (با مسیر مستعار) ---
import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type OrganizationalFormData,
    organizationalFormSchema
} from '@/features/User/Schema/userProfileFormSchema'; // (استفاده از فایل types به‌روز شده)

// --- کامپوننت‌های UI (با مسیر مستعار) ---
// (مسیرها و حروف کوچک/بزرگ بر اساس هشدارهای قبلی تنظیم شدند)
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection'; // (کامپوننت Wrapper)

// --- داده‌های موقت برای SelectBoxها ---
// (شما باید این داده‌ها را از API مربوطه فچ کنید)
const workGroupOptions: SelectOption[] = [
    { id: 1, name: "گروه کاری آلفا" },
    { id: 2, name: "گروه کاری بتا" },
    { id: 3, name: "پشتیبانی" },
];

const shiftScheduleOptions: SelectOption[] = [
    { id: 1, name: "برنامه شیفت چرخشی" },
    { id: 2, name: "برنامه شیفت ثابت صبح" },
    { id: 3, name: "برنامه شیفت ثابت عصر" },
];

const workPatternOptions: SelectOption[] = [
    { id: 1, name: "الگوی کاری شنبه تا چهارشنبه" },
    { id: 2, name: "الگوی کاری ۴ روز کار - ۲ روز استراحت" },
];


/**
 * فرم ۳: اطلاعات سازمانی
 */
const OrganizationalForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    // --- مقادیر پیش‌فرض ---
    const defaultValues = useMemo(() => ({
        employee: user.employee ? {
            personnel_code: user.employee.personnel_code,
            position: user.employee.position,
            starting_job: user.employee.starting_job,
            work_group_id: user.employee.work_group_id,
            shift_schedule_id: user.employee.shift_schedule_id,
            work_pattern_id: user.employee.work_pattern_id,
        } : null
    }), [user]);

    // --- راه‌اندازی React Hook Form ---
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isDirty },
    } = useForm<OrganizationalFormData>({
        resolver: zodResolver(organizationalFormSchema),
        defaultValues
    });

    // افکت برای ریست کردن فرم در صورت تغییر داده‌ها از بیرون
    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    // --- مدیریت Submit ---
    const onSubmit = (formData: OrganizationalFormData) => {
        // (توجه: API اجازه تغییر organization_id را به ادمین L2/L3 نمی‌دهد،
        // پس ما آن را در فرم قرار نمی‌دهیم)
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => { toast.success("اطلاعات سازمانی به‌روزرسانی شد."); setIsEditing(false); },
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
                این کاربر فاقد پروفایل کارمندی است. اطلاعات سازمانی قابل تنظیم نیست.
            </div>
        );
    }

    return (
        <FormSection
            title="اطلاعات سازمانی و شغلی"
            onSubmit={handleSubmit(onSubmit)}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onCancel={handleCancel}
            isDirty={isDirty}
            isSubmitting={updateMutation.isPending}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    label="کد پرسنلی"
                    {...register("employee.personnel_code")}
                    error={errors.employee?.personnel_code?.message}
                />
                <Input
                    label="سمت شغلی"
                    {...register("employee.position")}
                    error={errors.employee?.position?.message}
                />
                <Input
                    label="تاریخ شروع به کار (YYYY-MM-DD)"
                    {...register("employee.starting_job")}
                    error={errors.employee?.starting_job?.message}
                // (بهتر است از DatePicker استفاده شود)
                />

                {/* --- ✅ استفاده از SelectBox واقعی --- */}
                <Controller
                    name="employee.work_group_id"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="گروه کاری"
                            placeholder="(انتخاب کنید)"
                            options={workGroupOptions}
                            // تبدیل مقدار خام (id) به آبجکت (SelectOption)
                            value={workGroupOptions.find(opt => opt.id === field.value) || null}
                            // تبدیل آبجکت (SelectOption) به مقدار خام (id)
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.work_group_id?.message}
                        />
                    )}
                />

                <Controller
                    name="employee.shift_schedule_id"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="برنامه شیفتی"
                            placeholder="(انتخاب کنید)"
                            options={shiftScheduleOptions}
                            value={shiftScheduleOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.shift_schedule_id?.message}
                        />
                    )}
                />

                <Controller
                    name="employee.work_pattern_id"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="الگوی کاری"
                            placeholder="(انتخاب کنید)"
                            options={workPatternOptions}
                            value={workPatternOptions.find(opt => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.work_pattern_id?.message}
                        />
                    )}
                />
            </div>
        </FormSection>
    );
};

export default OrganizationalForm;

