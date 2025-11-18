import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

// --- هوک‌ها و تایپ‌ها ---
import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type OrganizationalFormData,
    organizationalFormSchema
} from '@/features/User/Schema/userProfileFormSchema';

// ✅ استفاده از هوک‌های Work Group برای لیست‌ها
// نکته: اگر تصمیم گرفتید این هوک‌ها را Shared نکنید، باید از همین مسیر ایمپورت کنید
import {
    useWorkPatternsList,
    useShiftSchedulesList,
    useWorkGroups // ✅ حل خطای TS2724: از هوک جدید استفاده شد
} from '@/features/work-group/hooks/hook';
import { type BaseNestedItem } from '@/features/work-group/types';


// --- کامپوننت‌های UI (با مسیر مستعار) ---
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';
import { Loader2 } from 'lucide-react';


/**
 * تابع تبدیل BaseNestedItem به SelectOption
 */
const toSelectOption = (item: BaseNestedItem): SelectOption => ({
    id: item.id,
    name: item.name,
});


/**
 * فرم ۳: اطلاعات سازمانی
 */
const OrganizationalForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();

    // ✅ فراخوانی هوک‌های لیست واقعی
    const { data: rawWorkPatterns, isLoading: isLoadingWorkPatterns } = useWorkPatternsList();
    const { data: rawShiftSchedules, isLoading: isLoadingShiftSchedules } = useShiftSchedulesList();
    const { data: rawWorkGroups, isLoading: isLoadingWorkGroups } = useWorkGroups(1, 9999); // گرفتن همه گروه‌ها (اگر API اجازه می‌دهد)


    // ✅ تبدیل داده‌های API به فرمت SelectOption
    const workGroupOptions = useMemo(() => rawWorkGroups?.data?.map(toSelectOption) || [], [rawWorkGroups]);
    const shiftScheduleOptions = useMemo(() => rawShiftSchedules?.map(toSelectOption) || [], [rawShiftSchedules]);
    const workPatternOptions = useMemo(() => rawWorkPatterns?.map(toSelectOption) || [], [rawWorkPatterns]);

    // ✅✅✅ اصلاحیه کلیدی: خواندن ID از آبجکت‌های تو در تو ✅✅✅
    const defaultValues = useMemo(() => ({
        employee: user.employee ? {
            personnel_code: user.employee.personnel_code,
            position: user.employee.position,
            starting_job: user.employee.starting_job,
            // اسکیمای Zod شما (organizationalFormSchema) انتظار ID دارد،
            // اما داده‌های دریافتی شما آبجکت هستند. ما ID را از آبجکت استخراج می‌کنیم.
            work_group_id: user.employee.work_group?.id || null,
            shift_schedule_id: user.employee.shift_schedule?.id || null,
            work_pattern_id: user.employee.week_pattern?.id || null, // توجه: نام فیلد week_pattern است
        } : null
    }), [user]);

    const {
        register, handleSubmit, reset, control,
        formState: { errors, isDirty },
    } = useForm<OrganizationalFormData>({
        resolver: zodResolver(organizationalFormSchema),
        defaultValues
    });

    useEffect(() => { reset(defaultValues); }, [user, defaultValues, reset]);

    const onSubmit = (formData: OrganizationalFormData) => {
        updateMutation.mutate(
            { userId: user.id, payload: formData },
            {
                onSuccess: () => { toast.success("اطلاعات سازمانی به‌روزرسانی شد."); setIsEditing(false); },
                onError: (err) => { toast.error(`خطا: ${(err as Error).message}`); }
            }
        );
    };

    const handleCancel = () => { reset(); setIsEditing(false); };

    const isFormLoading = isLoadingWorkPatterns || isLoadingShiftSchedules || isLoadingWorkGroups;

    if (!user.employee) {
        return (
            <div className="p-4 rounded-lg border border-borderL dark:border-borderD text-muted-foregroundL dark:text-muted-foregroundD">
                این کاربر فاقد پروفایل کارمندی است. اطلاعات سازمانی قابل تنظیم نیست.
            </div>
        );
    }

    if (isFormLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">در حال بارگذاری لیست گروه‌ها و الگوها...</span>
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
                />

                {/* --- گروه‌های کاری --- */}
                <Controller
                    name="employee.work_group_id"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="گروه کاری"
                            placeholder="(انتخاب کنید)"
                            options={workGroupOptions}
                            // ✅ حل خطای TS7006: تایپ صریح SelectOption به پارامتر opt داده شد
                            value={workGroupOptions.find((opt: SelectOption) => opt.id === field.value) || null}
                            onChange={(option) => field.onChange(option ? option.id : null)}
                            disabled={!isEditing || updateMutation.isPending}
                            error={errors.employee?.work_group_id?.message}
                        />
                    )}
                />

                {/* --- برنامه‌های شیفتی (از API جدید) --- */}
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

                {/* --- الگوهای کاری (از API موجود) --- */}
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