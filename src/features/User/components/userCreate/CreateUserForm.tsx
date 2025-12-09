import React, { useMemo } from 'react';
import { useForm, Controller, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, X, User as UserIcon, Building2, Phone, Lock } from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';
import { FormImageUploader } from '@/features/User/components/shared/FormImageUploader';

import { useCreateUser } from '@/features/User/hooks/hook';
import {
    useWorkPatternsList,
    useShiftSchedulesList,
    useWorkGroups
} from '@/features/work-group/hooks/hook';
import {
    createUserFormSchema,
    type CreateUserFormData
} from '@/features/User/Schema/userProfileFormSchema';
import {
    GENDER_OPTIONS,
    MARITAL_STATUS_OPTIONS,
    STATUS_OPTIONS,
    ROLE_OPTIONS,
    EDUCATION_OPTIONS
} from '@/features/User/constants/userConstants';

const toSelectOption = (item: any): SelectOption => ({
    id: item.id,
    name: item.name || item.title || '---',
});

const normalizeData = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
};

const FormSectionCard = ({
    title,
    icon: Icon,
    children,
    className
}: {
    title: string,
    icon: any,
    children: React.ReactNode,
    className?: string
}) => (
    <div className={`bg-backgroundL-500 dark:bg-backgroundD rounded-xl border border-borderL dark:border-borderD shadow-sm mb-6 relative overflow-hidden transition-all hover:shadow-md ${className || ''}`}>
        <div className="bg-secondaryL/10 dark:bg-secondaryD/10 rounded-t-xl px-6 py-4 border-b border-borderL dark:border-borderD flex items-center gap-2">
            <div className="p-2 bg-backgroundL-500 dark:bg-backgroundD rounded-lg shadow-sm text-primaryL dark:text-primaryD">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foregroundL dark:text-foregroundD">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
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

    const workGroupOptions = useMemo(() => normalizeData(rawWorkGroups).map(toSelectOption), [rawWorkGroups]);
    const shiftScheduleOptions = useMemo(() => normalizeData(rawShiftSchedules).map(toSelectOption), [rawShiftSchedules]);
    const workPatternOptions = useMemo(() => normalizeData(rawWorkPatterns).map(toSelectOption), [rawWorkPatterns]);

    const defaultValues: CreateUserFormData = useMemo(() => ({
        user_name: "",
        email: "",
        password: "",
        role: "user",
        status: "active" as const,
        employee: {
            organization_id: organizationId,
            first_name: "",
            last_name: "",
            personnel_code: "",
            phone_number: "",
            house_number: "",
            sos_number: "",
            nationality_code: "",
            father_name: "",
            birth_date: "",
            address: "",
            position: "",
            starting_job: "",
            gender: "male" as const,
            is_married: false,
            education_level: "diploma" as const,
            shift_schedule_id: null,
            work_group_id: null,
            work_pattern_id: null,
            images: [],
        }
    }), [organizationId]);

    const methods = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues,
    });

    const { register, handleSubmit, control, setError, formState: { errors } } = methods;

    const handleDateChange = (date: any, onChange: (val: string | null) => void) => {
        if (!date) {
            onChange(null);
            return;
        }
        if (date instanceof DateObject || typeof date.toDate === 'function') {
            try {
                onChange(date.convert(gregorian, gregorian_en).format("YYYY-MM-DD"));
            } catch {
                onChange(date.toDate().toISOString().split('T')[0]);
            }
        } else if (typeof date === 'string') {
            onChange(date);
        }
    };

    const onSubmit: SubmitHandler<CreateUserFormData> = async (formData) => {
        try {
            const newUser = await createMutation.mutateAsync(formData);
            toast.success(`کاربر "${newUser.employee?.first_name} ${newUser.employee?.last_name}" ایجاد شد.`);
            navigate(-1);
        } catch (err: any) {
            const validationErrors = err?.response?.data?.errors;
            if (validationErrors) {
                toast.error("لطفاً خطاهای فرم را بررسی کنید.");
                Object.keys(validationErrors).forEach((key) => {
                    const fieldName = key.includes('.') ? key : key as any; 
                    setError(fieldName, { type: 'server', message: validationErrors[key][0] });
                });
            } else {
                toast.error(`خطا: ${err?.response?.data?.message || "مشکلی پیش آمده است"}`);
            }
        }
    };

    const isLoadingLists = isLoadingWP || isLoadingSS || isLoadingWG;
    if (isLoadingLists) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foregroundL dark:text-muted-foregroundD">
                <Loader2 className="h-10 w-10 animate-spin text-primaryL dark:text-primaryD" />
                <p>در حال دریافت اطلاعات پایه...</p>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FormSectionCard title="اطلاعات حساب کاربری" icon={Lock} className="z-40">
                    <Input label="نام کاربری *" {...register("user_name")} error={errors.user_name?.message} autoFocus dir="ltr" />
                    <Input label="ایمیل *" type="email" {...register("email")} error={errors.email?.message} dir="ltr" />
                    <Input label="رمز عبور *" type="password" {...register("password")} error={errors.password?.message} dir="ltr" />
                    <Controller name="role" control={control} render={({ field }) => (
                        <SelectBox label="نقش کاربری *" placeholder="انتخاب نقش" options={ROLE_OPTIONS} value={ROLE_OPTIONS.find(o => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id)} error={errors.role?.message} />
                    )} />
                    <Controller name="status" control={control} render={({ field }) => (
                        <SelectBox label="وضعیت *" placeholder="انتخاب وضعیت" options={STATUS_OPTIONS} value={STATUS_OPTIONS.find(o => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id)} error={errors.status?.message} />
                    )} />
                </FormSectionCard>

                <FormSectionCard title="مشخصات فردی و تصاویر" icon={UserIcon} className="z-30">
                    <div className="md:col-span-3">
                        <FormImageUploader name="employee.images" label="تصویر پروفایل *" />
                    </div>
                    <Input label="نام *" {...register("employee.first_name")} error={errors.employee?.first_name?.message} />
                    <Input label="نام خانوادگی *" {...register("employee.last_name")} error={errors.employee?.last_name?.message} />
                    <Input label="کد ملی *" {...register("employee.nationality_code")} error={errors.employee?.nationality_code?.message} className="text-left dir-ltr" />
                    <Input label="نام پدر *" {...register("employee.father_name")} error={errors.employee?.father_name?.message} />
                    <Controller name="employee.birth_date" control={control} render={({ field }) => (
                        <PersianDatePickerInput label="تاریخ تولد *" value={field.value} onChange={(date) => handleDateChange(date, field.onChange)} error={errors.employee?.birth_date?.message} />
                    )} />
                    <Controller name="employee.gender" control={control} render={({ field }) => (
                        <SelectBox label="جنسیت *" placeholder="انتخاب جنسیت" options={GENDER_OPTIONS} value={GENDER_OPTIONS.find(o => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id)} error={errors.employee?.gender?.message} />
                    )} />
                    <Controller name="employee.is_married" control={control} render={({ field }) => (
                        <SelectBox label="وضعیت تاهل *" placeholder="انتخاب وضعیت تاهل" options={MARITAL_STATUS_OPTIONS} value={MARITAL_STATUS_OPTIONS.find(o => o.id === String(field.value)) || null} onChange={(opt) => field.onChange(opt?.id === 'true')} error={errors.employee?.is_married?.message} />
                    )} />
                    <Controller name="employee.education_level" control={control} render={({ field }) => (
                        <SelectBox label="تحصیلات *" placeholder="انتخاب تحصیلات" options={EDUCATION_OPTIONS} value={EDUCATION_OPTIONS.find(o => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id)} error={errors.employee?.education_level?.message} />
                    )} />
                </FormSectionCard>

                <FormSectionCard title="اطلاعات سازمانی" icon={Building2} className="z-20">
                    <Input label="کد پرسنلی *" {...register("employee.personnel_code")} error={errors.employee?.personnel_code?.message} className="text-left dir-ltr" />
                    <Input label="سمت *" {...register("employee.position")} error={errors.employee?.position?.message} />
                    <Controller name="employee.starting_job" control={control} render={({ field }) => (
                        <PersianDatePickerInput label="شروع به کار *" value={field.value} onChange={(date) => handleDateChange(date, field.onChange)} error={errors.employee?.starting_job?.message} />
                    )} />
                    <input type="hidden" {...register("employee.organization_id")} />
                    <Controller name="employee.work_group_id" control={control} render={({ field }) => (
                        <SelectBox label="گروه کاری" options={workGroupOptions} value={workGroupOptions.find((o: SelectOption) => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id ?? null)} error={errors.employee?.work_group_id?.message} placeholder="انتخاب کنید (اختیاری)" />
                    )} />
                    <Controller name="employee.shift_schedule_id" control={control} render={({ field }) => (
                        <SelectBox label="برنامه شیفتی" options={shiftScheduleOptions} value={shiftScheduleOptions.find(o => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id ? Number(opt.id) : null)} error={errors.employee?.shift_schedule_id?.message} placeholder="انتخاب کنید (اختیاری)" />
                    )} />
                    <Controller name="employee.work_pattern_id" control={control} render={({ field }) => (
                        <SelectBox label="الگوی کاری" options={workPatternOptions} value={workPatternOptions.find(o => o.id === field.value) || null} onChange={(opt) => field.onChange(opt?.id ?? null)} error={errors.employee?.work_pattern_id?.message} placeholder="انتخاب کنید (اختیاری)" />
                    )} />
                </FormSectionCard>

                <FormSectionCard title="اطلاعات تماس" icon={Phone} className="z-10">
                    <Input label="شماره موبایل *" {...register("employee.phone_number")} error={errors.employee?.phone_number?.message} className="dir-ltr text-left" placeholder="09xxxxxxxxx" />
                    <Input label="تلفن منزل *" {...register("employee.house_number")} error={errors.employee?.house_number?.message} className="dir-ltr text-left" />
                    <Input label="تلفن اضطراری *" {...register("employee.sos_number")} error={errors.employee?.sos_number?.message} className="dir-ltr text-left" />
                    <div className="md:col-span-3">
                        <Textarea label="آدرس سکونت *" {...register("employee.address")} rows={3} error={errors.employee?.address?.message} />
                    </div>
                </FormSectionCard>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-backgroundL-500 dark:bg-backgroundD border-t border-borderL dark:border-borderD shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-end gap-3 z-50 transition-transform duration-300">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={createMutation.isPending}>
                        <X className="h-4 w-4 ml-2" /> انصراف
                    </Button>
                    <Button type="submit" variant="primary" className="min-w-[140px] shadow-lg shadow-primaryL/20" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
                        ثبت نهایی کاربر
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};