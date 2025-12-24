import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Loader2, Lock } from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

import { useUpdateUserProfile } from '@/features/User/hooks/hook';
import { type User } from '@/features/User/types/index';
import {
    type OrganizationalFormData,
    organizationalFormSchema
} from '@/features/User/Schema/userProfileFormSchema';
import {
    useWorkPatternsList,
    useShiftSchedulesList,
    useWorkGroups
} from '@/features/work-group/hooks/hook';
import { type BaseNestedItem } from '@/features/work-group/types';

import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import FormSection from '@/features/User/components/userPage/FormSection';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { useAppSelector } from '@/hook/reduxHooks';
import { selectUser } from '@/store/slices/authSlice';

// گزینه پیش‌فرض برای پاک کردن انتخاب
const NONE_OPTION: SelectOption = { id: null as any, name: "عدم انتخاب (پاک کردن)" };

const toSelectOption = (item: BaseNestedItem): SelectOption => ({
    id: item.id,
    name: item.name,
});

const OrganizationalForm: React.FC<{ user: User }> = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const updateMutation = useUpdateUserProfile();
    const currentUser = useAppSelector(selectUser);

    const canEditRestrictedFields = useMemo(() => {
        if (!currentUser?.roles) return false;
        return currentUser.roles.some(role =>
            ['super_admin', 'org-admin-l2', 'org-admin-l3'].includes(role)
        );
    }, [currentUser]);

    const { data: rawWorkPatterns, isLoading: isLoadingWorkPatterns } = useWorkPatternsList();
    const { data: rawShiftSchedules, isLoading: isLoadingShiftSchedules } = useShiftSchedulesList();
    const { data: rawWorkGroups, isLoading: isLoadingWorkGroups } = useWorkGroups(1, 9999);

    // افزودن گزینه پاک کردن به ابتدای آپشن‌ها
    const workGroupOptions = useMemo(() => [NONE_OPTION, ...(rawWorkGroups?.data?.map(toSelectOption) || [])], [rawWorkGroups]);
    const shiftScheduleOptions = useMemo(() => [NONE_OPTION, ...(rawShiftSchedules?.map(toSelectOption) || [])], [rawShiftSchedules]);
    const workPatternOptions = useMemo(() => [NONE_OPTION, ...(rawWorkPatterns?.map(toSelectOption) || [])], [rawWorkPatterns]);

    const defaultValues = useMemo((): OrganizationalFormData => {
        if (!user.employee) return { employee: null };
        return {
            employee: {
                personnel_code: user.employee.personnel_code,
                position: user.employee.position || "",
                starting_job: user.employee.starting_job || "",
                work_group_id: user.employee.work_group?.id ? Number(user.employee.work_group.id) : null,
                shift_schedule_id: user.employee.shift_schedule?.id ? Number(user.employee.shift_schedule.id) : null,
                week_pattern_id: user.employee.week_pattern?.id ? Number(user.employee.week_pattern.id) : null,
            }
        };
    }, [user]);

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

    const handleCancel = () => { reset(defaultValues); setIsEditing(false); };

    const handleDateChange = (date: DateObject | null, onChange: (val: string | null) => void) => {
        if (date) {
            onChange(date.convert(gregorian, gregorian_en).format("YYYY-MM-DD"));
        } else {
            onChange(null);
        }
    };

    const resolveSelectedOption = (
        options: SelectOption[],
        currentValue: any,
        originalItem?: { id: number; name: string } | null
    ): SelectOption | null => {
        if (currentValue === null) return options[0]; // بازگرداندن گزینه "عدم انتخاب"
        const foundInList = options.find(opt => opt.id !== null && String(opt.id) === String(currentValue));
        if (foundInList) return foundInList;
        if (originalItem && String(originalItem.id) === String(currentValue)) {
            return { id: originalItem.id, name: originalItem.name };
        }
        return null;
    };

    const isFormLoading = isLoadingWorkPatterns || isLoadingShiftSchedules || isLoadingWorkGroups;

    if (!user.employee) {
        return (
            <div className="p-4 rounded-lg border border-warningL-foreground/20 bg-warningL-background text-warningL-foreground dark:bg-warningD-background dark:text-warningD-foreground">
                این کاربر فاقد پروفایل سربازی است.
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
            {/* نمایش وضعیت بارگذاری لیست‌ها در حالت ویرایش */}
            {isEditing && isFormLoading && (
                <div className="mb-4 p-2 bg-infoL-background text-infoL-foreground text-[10px] rounded flex items-center border border-infoL-foreground/20 dark:bg-infoD-background dark:text-infoD-foreground">
                    <Loader2 className="h-3 w-3 animate-spin ml-2" />
                    در حال دریافت آخرین لیست‌های سازمانی...
                </div>
            )}

            {/* هشدار عدم دسترسی برای فیلدهای خاص */}
            {isEditing && !canEditRestrictedFields && (
                <div className="mb-4 p-2 bg-warningL-background text-warningL-foreground text-[10px] rounded flex items-center border border-warningL-foreground/20 dark:bg-warningD-background dark:text-warningD-foreground">
                    <Lock className="h-3 w-3 ml-2" />
                    ویرایش گروه کاری، برنامه شیفتی و الگوی کاری فقط توسط مدیران امکان‌پذیر است.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="کد پرسنلی" {...register("employee.personnel_code")} error={errors.employee?.personnel_code?.message} />
                <Input label="سمت شغلی" {...register("employee.position")} error={errors.employee?.position?.message} />

                <Controller
                    name="employee.starting_job"
                    control={control}
                    render={({ field }) => (
                        <PersianDatePickerInput
                            label="تاریخ شروع به کار *"
                            value={field.value}
                            onChange={(date) => handleDateChange(date, field.onChange)}
                            error={errors.employee?.starting_job?.message}
                            disabled={!isEditing || updateMutation.isPending}
                        />
                    )}
                />

                <Controller name="employee.work_group_id" control={control} render={({ field }) => (
                    <SelectBox label="گروه کاری" placeholder="(انتخاب کنید)" options={workGroupOptions} value={resolveSelectedOption(workGroupOptions, field.value, user.employee?.work_group)} onChange={(option) => field.onChange(option ? option.id : null)} disabled={!isEditing || updateMutation.isPending || !canEditRestrictedFields} error={errors.employee?.work_group_id?.message} />
                )} />

                <Controller name="employee.shift_schedule_id" control={control} render={({ field }) => (
                    <SelectBox label="برنامه شیفتی" placeholder="(انتخاب کنید)" options={shiftScheduleOptions} value={resolveSelectedOption(shiftScheduleOptions, field.value, user.employee?.shift_schedule)} onChange={(option) => field.onChange(option ? option.id : null)} disabled={!isEditing || updateMutation.isPending || !canEditRestrictedFields} error={errors.employee?.shift_schedule_id?.message} />
                )} />

                <Controller name="employee.week_pattern_id" control={control} render={({ field }) => (
                    <SelectBox label="الگوی کاری" placeholder="(انتخاب کنید)" options={workPatternOptions} value={resolveSelectedOption(workPatternOptions, field.value, user.employee?.week_pattern)} onChange={(option) => field.onChange(option ? option.id : null)} disabled={!isEditing || updateMutation.isPending || !canEditRestrictedFields} error={errors.employee?.week_pattern_id?.message} />
                )} />
            </div>
        </FormSection>
    );
};

export default OrganizationalForm;