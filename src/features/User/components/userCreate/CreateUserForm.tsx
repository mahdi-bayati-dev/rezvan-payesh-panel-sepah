import React, { useMemo } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

// Schemas & Hooks
import {
    type CreateUserFormData,
    createUserFormSchema
} from '../../Schema/userProfileFormSchema';
import { useCreateUser } from '../../hooks/hook';
import {
    useWorkPatternsList,
    useShiftSchedulesList,
    useWorkGroups
} from '@/features/work-group/hooks/hook';
import { type BaseNestedItem } from '@/features/work-group/types';

// UI Components
import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import Textarea from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Loader2, Save, X, User, Building2, Phone, Lock } from 'lucide-react';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';

// --- Options ---
const statusOptions: SelectOption[] = [
    { id: 'active', name: 'فعال' },
    { id: 'inactive', name: 'غیرفعال' },
];
const roleOptions: SelectOption[] = [
    { id: 'user', name: 'کارمند (User)' },
    { id: 'org-admin-l3', name: 'ادمین (L3)' },
    { id: 'org-admin-l2', name: 'ادمین (L2)' },
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

// ✅✅✅ اصلاح UI: حذف overflow-hidden برای باز شدن سلکت باکس‌ها
const FormSectionCard = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    // ۱. حذف overflow-hidden از اینجا
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6 relative">
        {/* ۲. اضافه کردن rounded-t-xl به هدر تا گوشه‌های بالا گرد بمانند */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-t-xl px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-primaryL dark:text-primaryD">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

export const CreateUserForm: React.FC<{ organizationId: number }> = ({ organizationId }) => {
    const navigate = useNavigate();
    const createMutation = useCreateUser();

    const { data: rawWorkPatterns, isLoading: isLoadingWP } = useWorkPatternsList();
    const { data: rawShiftSchedules, isLoading: isLoadingSS } = useShiftSchedulesList();
    const { data: rawWorkGroups, isLoading: isLoadingWG } = useWorkGroups(1, 9999);

    const workGroupOptions = useMemo(() => rawWorkGroups?.data?.map(toSelectOption) || [], [rawWorkGroups]);
    const shiftScheduleOptions = useMemo(() => rawShiftSchedules?.map(toSelectOption) || [], [rawShiftSchedules]);
    const workPatternOptions = useMemo(() => rawWorkPatterns?.map(toSelectOption) || [], [rawWorkPatterns]);

    const defaultShiftScheduleId = useMemo(() => {
        return shiftScheduleOptions.length > 0 ? Number(shiftScheduleOptions[0].id) : 1;
    }, [shiftScheduleOptions]);

    const defaultValues = useMemo((): any => ({
        user_name: "", email: "", password: "", role: "user", status: "active",
        employee: {
            organization_id: organizationId,
            first_name: "", last_name: "", personnel_code: "", phone_number: "",
            gender: "male", is_married: false, education_level: "diploma",
            house_number: "", sos_number: "", shift_schedule_id: defaultShiftScheduleId,

            position: null,
            starting_job: null,
            father_name: null,
            birth_date: null,
            nationality_code: null,
            address: null,
            work_group_id: null,
            work_pattern_id: null,
        }
    }), [organizationId, defaultShiftScheduleId]);

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors }
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues,
    });

    const onSubmit: SubmitHandler<CreateUserFormData> = async (formData) => {
        const sanitizedEmployee = {
            ...formData.employee,
            father_name: formData.employee?.father_name || null,
            nationality_code: formData.employee?.nationality_code || null,
            position: formData.employee?.position || null,
            address: formData.employee?.address || null,
            work_group_id: formData.employee?.work_group_id || null,
            work_pattern_id: formData.employee?.work_pattern_id || null,
        };

        const finalPayload = {
            ...formData,
            employee: sanitizedEmployee
        };

        try {
            const newUser = await createMutation.mutateAsync(finalPayload as CreateUserFormData);
            toast.success(`کاربر "${newUser.employee?.first_name} ${newUser.employee?.last_name}" با موفقیت ایجاد شد.`);
            navigate(-1);
        } catch (err: any) {
            const validationErrors = err?.response?.data?.errors;
            if (validationErrors) {
                toast.error("لطفاً خطاهای فرم را بررسی کنید.");
                Object.keys(validationErrors).forEach((key) => {
                    setError(key as any, { type: 'server', message: validationErrors[key][0] });
                });
            } else {
                toast.error(`خطای سیستم: ${err?.response?.data?.message || "مشکلی پیش آمده است"}`);
            }
        }
    };

    const isLoading = isLoadingWP || isLoadingSS || isLoadingWG;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foregroundL">
                <Loader2 className="h-10 w-10 animate-spin text-primaryL" />
                <p>در حال آماده‌سازی فرم...</p>
            </div>
        );
    }

    const handleDateChange = (date: DateObject | null, onChange: (val: string | null) => void) => {
        if (date) {
            const gregorianDate = date.convert(gregorian, gregorian_en).format("YYYY-MM-DD");
            onChange(gregorianDate);
        } else {
            onChange(null);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="pb-20">

            <FormSectionCard title="اطلاعات حساب کاربری" icon={Lock}>
                <Input label="نام کاربری" {...register("user_name")} error={errors.user_name?.message} autoFocus />
                <Input label="ایمیل" type="email" {...register("email")} error={errors.email?.message} />
                <Input label="رمز عبور" type="password" {...register("password")} error={errors.password?.message} />

                <Controller name="role" control={control} render={({ field }) => (
                    <SelectBox
                        placeholder='' label="نقش کاربری" options={roleOptions}
                        value={roleOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.role?.message}
                    />
                )} />

                <Controller name="status" control={control} render={({ field }) => (
                    <SelectBox
                        placeholder='' label="وضعیت" options={statusOptions}
                        value={statusOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.status?.message}
                    />
                )} />
            </FormSectionCard>

            <FormSectionCard title="مشخصات فردی" icon={User}>
                <Input label="نام" {...register("employee.first_name")} error={errors.employee?.first_name?.message} />
                <Input label="نام خانوادگی" {...register("employee.last_name")} error={errors.employee?.last_name?.message} />
                <Input label="کد ملی" {...register("employee.nationality_code")} error={errors.employee?.nationality_code?.message} />
                <Input label="نام پدر" {...register("employee.father_name")} error={errors.employee?.father_name?.message} />

                <Controller
                    name="employee.birth_date"
                    control={control}
                    render={({ field }) => (
                        <PersianDatePickerInput
                            label="تاریخ تولد *"
                            value={field.value}
                            onChange={(date) => handleDateChange(date, field.onChange)}
                            error={errors.employee?.birth_date?.message}
                        />
                    )}
                />

                <Controller name="employee.gender" control={control} render={({ field }) => (
                    <SelectBox
                        placeholder='' label="جنسیت" options={genderOptions}
                        value={genderOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.employee?.gender?.message}
                    />
                )} />
                <Controller name="employee.is_married" control={control} render={({ field }) => (
                    <SelectBox
                        placeholder='' label="وضعیت تاهل" options={maritalStatusOptions}
                        value={maritalStatusOptions.find(o => o.id === String(field.value)) || null}
                        onChange={(opt) => field.onChange(opt?.id === 'true')}
                        error={errors.employee?.is_married?.message}
                    />
                )} />
                <Controller name="employee.education_level" control={control} render={({ field }) => (
                    <SelectBox
                        placeholder='' label="تحصیلات" options={educationLevelOptions}
                        value={educationLevelOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.employee?.education_level?.message}
                    />
                )} />
            </FormSectionCard>

            <FormSectionCard title="اطلاعات سازمانی" icon={Building2}>
                <Input label="کد پرسنلی" {...register("employee.personnel_code")} error={errors.employee?.personnel_code?.message} />
                <Input label="سمت" {...register("employee.position")} error={errors.employee?.position?.message} />

                <Controller
                    name="employee.starting_job"
                    control={control}
                    render={({ field }) => (
                        <PersianDatePickerInput
                            label="شروع به کار *"
                            value={field.value}
                            onChange={(date) => handleDateChange(date, field.onChange)}
                            error={errors.employee?.starting_job?.message}
                        />
                    )}
                />

                <input type="hidden" {...register("employee.organization_id")} />

                <Controller name="employee.work_group_id" control={control} render={({ field }) => (
                    <SelectBox
                        label="گروه کاری" placeholder="انتخاب کنید (اختیاری)" options={workGroupOptions}
                        value={workGroupOptions.find((o: SelectOption) => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id ?? null)}
                        error={errors.employee?.work_group_id?.message}
                    />
                )} />
                <Controller name="employee.shift_schedule_id" control={control} render={({ field }) => (
                    <SelectBox
                        placeholder='' label="برنامه شیفتی" options={shiftScheduleOptions}
                        value={shiftScheduleOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id ? Number(opt.id) : 1)}
                        error={errors.employee?.shift_schedule_id?.message}
                    />
                )} />
                <Controller name="employee.work_pattern_id" control={control} render={({ field }) => (
                    <SelectBox
                        label="الگوی کاری" placeholder="انتخاب کنید (اختیاری)" options={workPatternOptions}
                        value={workPatternOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id ?? null)}
                        error={errors.employee?.work_pattern_id?.message}
                    />
                )} />
            </FormSectionCard>

            <FormSectionCard title="اطلاعات تماس" icon={Phone}>
                <Input label="شماره موبایل" {...register("employee.phone_number")} error={errors.employee?.phone_number?.message} className="dir-ltr text-left" />
                <Input label="تلفن منزل" {...register("employee.house_number")} error={errors.employee?.house_number?.message} className="dir-ltr text-left" />
                <Input label="تلفن اضطراری" {...register("employee.sos_number")} error={errors.employee?.sos_number?.message} className="dir-ltr text-left" />
                <div className="md:col-span-3">
                    <Textarea label="آدرس سکونت" {...register("employee.address")} rows={3} error={errors.employee?.address?.message} />
                </div>
            </FormSectionCard>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-end gap-3 z-50">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={createMutation.isPending}>
                    <X className="h-4 w-4 ml-2" /> انصراف
                </Button>
                <Button type="submit" variant="primary" className="min-w-[140px]" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
                    ثبت نهایی کاربر
                </Button>
            </div>
        </form>
    );
};