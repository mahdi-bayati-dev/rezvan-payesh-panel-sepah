import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// ✅ اصلاح: تغییر آدرس‌دهی از @/features/... به ../../...
import {
    type CreateUserFormData,
    createUserFormSchema
} from '../../Schema/userProfileFormSchema';
import { useCreateUser } from '../../hooks/hook';

// ✅ اصلاح: تغییر آدرس‌دهی از @/features/... به ../../../...
import {
    useWorkPatternsList,
    useShiftSchedulesList,
    useWorkGroups
} from '../../../work-group/hooks/hook';
import { type BaseNestedItem } from '../../../work-group/types';

// ✅ اصلاح: تغییر آدرس‌دهی و بزرگی/کوچکی حروف کامپوننت‌ها
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import { type SelectOption } from '@/components/ui/SelectBox';
import Textarea from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Loader2, Save, X } from 'lucide-react';

// --- گزینه‌های ثابت (بدون تغییر) ---
const statusOptions: SelectOption[] = [
    { id: 'active', name: 'فعال' },
    { id: 'inactive', name: 'غیرفعال' },
];
const roleOptions: SelectOption[] = [
    { id: 'user', name: 'کارمند (user)' },
    { id: 'org-admin-l3', name: 'ادمین L3' },
    { id: 'org-admin-l2', name: 'ادمین L2' },
];
const genderOptions: SelectOption[] = [
    { id: 'male', name: 'مرد' },
    { id: 'female', name: 'زن' },
];
const maritalStatusOptions: SelectOption[] = [
    { id: 'false', name: 'مجرد' },
    { id: 'true', name: 'متاهل' },
];
const educationLevelOptions: SelectOption[] = [
    { id: 'diploma', name: 'دیپلم' },
    { id: 'advanced_diploma', name: 'فوق دیپلم' },
    { id: 'bachelor', name: 'لیسانس' },
    { id: 'master', name: 'فوق لیسانس' },
    { id: 'doctorate', name: 'دکتری' },
    { id: 'post_doctorate', name: 'پسادکتری' },
];

const toSelectOption = (item: BaseNestedItem): SelectOption => ({
    id: item.id,
    name: item.name,
});

/**
 * فرم ایجاد کاربر — نسخه نهایی با رفع خطا
 */
export const CreateUserForm: React.FC<{ organizationId: number }> = ({ organizationId }) => {
    const navigate = useNavigate();
    const createMutation = useCreateUser();

    // --- (فچ لیست‌ها و تبدیل به SelectOption... بدون تغییر) ---
    const { data: rawWorkPatterns, isLoading: isLoadingWP } = useWorkPatternsList();
    const { data: rawShiftSchedules, isLoading: isLoadingSS } = useShiftSchedulesList();
    const { data: rawWorkGroups, isLoading: isLoadingWG } = useWorkGroups(1, 9999);

    const workGroupOptions = useMemo(
        () => rawWorkGroups?.data?.map(toSelectOption) || [],
        [rawWorkGroups]
    );
    const shiftScheduleOptions = useMemo(
        () => rawShiftSchedules?.map(toSelectOption) || [],
        [rawShiftSchedules]
    );
    const workPatternOptions = useMemo(
        () => rawWorkPatterns?.map(toSelectOption) || [],
        [rawWorkPatterns]
    );

    const defaultShiftSchedule = useMemo(() => {
        return shiftScheduleOptions[0] || { id: 1, name: 'نامشخص' };
    }, [shiftScheduleOptions]);


    // --- defaultValues (هماهنگ با zod) ---
    const defaultValues = useMemo((): CreateUserFormData => ({
        user_name: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
        employee: {
            organization_id: organizationId,
            first_name: "",
            last_name: "",
            personnel_code: "",
            phone_number: "", // Zod این را الزامی می‌داند
            gender: "male",
            is_married: false,
            education_level: "diploma",
            house_number: "",
            sos_number: "",

            shift_schedule_id: Number(defaultShiftSchedule.id) || 1,

            // فیلدهای Nullable (که Zod preprocess آن‌ها را null می‌کند)
            position: "",
            starting_job: "",
            father_name: "",
            birth_date: "",
            nationality_code: "",
            address: "",
            work_group_id: null,
            work_pattern_id: null,
        }
    }), [organizationId, defaultShiftSchedule.id]);

    // --- React Hook Form ---
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isDirty },
        reset,
    } = useForm<CreateUserFormData>({
        // ✅ با اصلاح Schema، این Resolver اکنون باید بدون خطا کار کند
        resolver: zodResolver(createUserFormSchema),
        defaultValues,
    });

    // --- آپدیت پیش‌فرض شیفت وقتی لود شد ---
    useEffect(() => {
        const currentDefaultId = Number(defaultValues.employee.shift_schedule_id);
        const newDefaultId = Number(defaultShiftSchedule.id);

        if (newDefaultId !== 1 && newDefaultId !== currentDefaultId) {
            reset({
                ...defaultValues,
                employee: {
                    ...defaultValues.employee,
                    shift_schedule_id: newDefaultId,
                }
            });
        }
    }, [defaultShiftSchedule.id, reset, defaultValues]);

    // --- onSubmit (بدون تغییر منطقی) ---
    const onSubmit: SubmitHandler<CreateUserFormData> = async (formData) => {
        try {
            console.log("Payload ارسال شده (توسط Zod):", formData); // برای دیباگ

            const newUser = await createMutation.mutateAsync(formData);

            toast.success(`کاربر "${newUser.employee?.first_name} ${newUser.employee?.last_name}" با موفقیت ایجاد شد.`);
            navigate(-1);

        } catch (err: any) {
            const validationErrors = err?.response?.data?.errors;
            if (validationErrors) {
                toast.error("لطفاً فیلدهای الزامی را بررسی کنید.");
                Object.keys(validationErrors).forEach((key) => {
                    setError(key as any, {
                        type: 'server',
                        message: validationErrors[key][0]
                    });
                });
            } else {
                console.error("خطای سرور:", err);
            }
        }
    };

    const isSubmitting = createMutation.isPending;
    const isLoading = isLoadingWP || isLoadingSS || isLoadingWG;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">در حال بارگذاری لیست‌ها...</span>
            </div>
        );
    }

    return (
        // ✅ خطای بیلد (SubmitHandler) با اصلاح Schema حل می‌شود
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* --- اطلاعات حساب --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b">اطلاعات حساب</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="نام کاربری" {...register("user_name")} error={errors.user_name?.message} />
                    <Input label="ایمیل" type="email" {...register("email")} error={errors.email?.message} />
                    <Input label="رمز عبور" type="password" {...register("password")} error={errors.password?.message} />

                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="نقش"
                                placeholder="انتخاب کنید..."
                                options={roleOptions}
                                value={roleOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ?? null)}
                                error={errors.role?.message}
                            />
                        )}
                    />
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="وضعیت"
                                placeholder="انتخاب کنید..."
                                options={statusOptions}
                                value={statusOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ?? "active")}
                                error={errors.status?.message}
                            />
                        )}
                    />
                </div>
            </fieldset>

            {/* --- مشخصات فردی --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b">مشخصات فردی</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="نام" {...register("employee.first_name")} error={errors.employee?.first_name?.message} />
                    <Input label="نام خانوادگی" {...register("employee.last_name")} error={errors.employee?.last_name?.message} />
                    <Input label="نام پدر" {...register("employee.father_name")} error={errors.employee?.father_name?.message} />
                    <Input label="کد ملی" {...register("employee.nationality_code")} error={errors.employee?.nationality_code?.message} />
                    <Input label="تاریخ تولد" placeholder="YYYY-MM-DD" {...register("employee.birth_date")} error={errors.employee?.birth_date?.message} />

                    <Controller
                        name="employee.gender"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                placeholder=''
                                label="جنسیت"
                                options={genderOptions}
                                value={genderOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ?? "male")}
                                error={errors.employee?.gender?.message}
                            />
                        )}
                    />
                    <Controller
                        name="employee.is_married"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                placeholder=''
                                label="تاهل"
                                options={maritalStatusOptions}
                                value={maritalStatusOptions.find(o => o.id === String(field.value)) || null}
                                onChange={(opt) => field.onChange(opt?.id === 'true')}
                                error={errors.employee?.is_married?.message}
                            />
                        )}
                    />
                    <Controller
                        name="employee.education_level"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                placeholder=''
                                label="تحصیلات"
                                options={educationLevelOptions}
                                value={educationLevelOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ?? "diploma")}
                                error={errors.employee?.education_level?.message}
                            />
                        )}
                    />
                </div>
            </fieldset>

            {/* --- اطلاعات سازمانی --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b">اطلاعات سازمانی</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="کد پرسنلی" {...register("employee.personnel_code")} error={errors.employee?.personnel_code?.message} />
                    <Input label="سمت" {...register("employee.position")} error={errors.employee?.position?.message} />
                    <Input label="تاریخ شروع" placeholder="YYYY-MM-DD" {...register("employee.starting_job")} error={errors.employee?.starting_job?.message} />

                    <input type="hidden" {...register("employee.organization_id")} />

                    <Controller
                        name="employee.work_group_id"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="گروه کاری"
                                placeholder="اختیاری"
                                options={workGroupOptions}
                                value={workGroupOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ?? null)}
                                error={errors.employee?.work_group_id?.message}
                            />
                        )}
                    />
                    <Controller
                        name="employee.shift_schedule_id"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                placeholder=''
                                label="برنامه شیفتی"
                                options={shiftScheduleOptions}
                                value={shiftScheduleOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ? Number(opt.id) : 1)}
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
                                placeholder="اختیاری"
                                options={workPatternOptions}
                                value={workPatternOptions.find(o => o.id === field.value) || null}
                                onChange={(opt) => field.onChange(opt?.id ?? null)}
                                error={errors.employee?.work_pattern_id?.message}
                            />
                        )}
                    />
                </div>
            </fieldset>

            {/* --- اطلاعات تماس --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b">اطلاعات تماس</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label="موبایل" {...register("employee.phone_number")} error={errors.employee?.phone_number?.message} />
                    <Input label="تلفن منزل" {...register("employee.house_number")} placeholder="" error={errors.employee?.house_number?.message} />
                    <Input label="تلفن اضطراری" {...register("employee.sos_number")} placeholder="" error={errors.employee?.sos_number?.message} />
                </div>
                <Textarea label="آدرس" {...register("employee.address")} rows={3} error={errors.employee?.address?.message} />
            </fieldset>

            {/* --- دکمه‌ها --- */}
            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isSubmitting}>
                    <X className="h-4 w-4 ml-2" /> لغو
                </Button>
                <Button type="submit" variant="primary" disabled={!isDirty || isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                    ایجاد کاربر
                </Button>
            </div>
        </form>
    );
};