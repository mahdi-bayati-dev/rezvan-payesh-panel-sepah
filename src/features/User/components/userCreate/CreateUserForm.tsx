import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save, X, User, Building2, Phone, Lock, UploadCloud, Trash } from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";

// --- Imports: Components & Hooks ---
import Input from '@/components/ui/Input';
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import PersianDatePickerInput from '@/lib/PersianDatePickerInput';

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

// --- Types & Constants ---
const GENDER_OPTIONS: SelectOption[] = [
    { id: 'male', name: 'مرد' },
    { id: 'female', name: 'زن' },
];
const MARITAL_STATUS_OPTIONS: SelectOption[] = [
    { id: 'false', name: 'مجرد' },
    { id: 'true', name: 'متاهل' },
];
const STATUS_OPTIONS: SelectOption[] = [
    { id: 'active', name: 'فعال' },
    { id: 'inactive', name: 'غیرفعال' },
];
const ROLE_OPTIONS: SelectOption[] = [
    { id: 'user', name: 'کارمند (User)' },
    { id: 'org-admin-l3', name: 'ادمین (L3)' },
    { id: 'org-admin-l2', name: 'ادمین (L2)' },
];
const EDUCATION_LEVEL_OPTIONS: SelectOption[] = [
    { id: 'diploma', name: 'دیپلم' },
    { id: 'advanced_diploma', name: 'فوق دیپلم' },
    { id: 'bachelor', name: 'لیسانس' },
    { id: 'master', name: 'فوق لیسانس' },
    { id: 'doctorate', name: 'دکتری' },
    { id: 'post_doctorate', name: 'پسادکتری' },
];

// --- Helper Functions ---
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

// --- Reusable Layout Component ---
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
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-6 relative ${className || ''}`}>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-t-xl px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-primaryL dark:text-primaryD">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {children}
        </div>
    </div>
);

export const CreateUserForm: React.FC<{ organizationId: number }> = ({ organizationId }) => {
    const navigate = useNavigate();
    const createMutation = useCreateUser();

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const { data: rawWorkPatterns, isLoading: isLoadingWP } = useWorkPatternsList();
    const { data: rawShiftSchedules, isLoading: isLoadingSS } = useShiftSchedulesList();
    const { data: rawWorkGroups, isLoading: isLoadingWG } = useWorkGroups(1, 9999);

    const workGroupOptions = useMemo(() => normalizeData(rawWorkGroups).map(toSelectOption), [rawWorkGroups]);
    const shiftScheduleOptions = useMemo(() => normalizeData(rawShiftSchedules).map(toSelectOption), [rawShiftSchedules]);
    const workPatternOptions = useMemo(() => normalizeData(rawWorkPatterns).map(toSelectOption), [rawWorkPatterns]);

    const defaultValues = useMemo((): any => ({
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
            phone_number: "",
            house_number: "",
            sos_number: "",
            nationality_code: "",
            father_name: "",
            birth_date: null,
            address: "",
            position: "",
            starting_job: null,
            gender: "male",
            is_married: false,
            education_level: "diploma",
            shift_schedule_id: null,
            work_group_id: null,
            work_pattern_id: null,
            images: [],
        }
    }), [organizationId]);

    const {
        register,
        handleSubmit,
        control,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserFormSchema),
        defaultValues,
    });

    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const currentFiles = watch('employee.images') || [];
            const updatedFiles = [...currentFiles, ...newFiles];
            setValue('employee.images', updatedFiles, { shouldValidate: true });
            const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
            e.target.value = '';
        }
    }, [setValue, watch]);

    const removeImage = useCallback((index: number) => {
        const currentFiles = watch('employee.images') || [];
        const updatedFiles = currentFiles.filter((_, i) => i !== index);
        setValue('employee.images', updatedFiles, { shouldValidate: true });
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }, [previewUrls, setValue, watch]);

    const handleDateChange = useCallback((date: any, onChange: (val: string | null) => void) => {
        if (!date) {
            onChange(null);
            return;
        }
        if (date instanceof DateObject || typeof date.toDate === 'function') {
            try {
                const gregorianDate = date.convert(gregorian, gregorian_en).format("YYYY-MM-DD");
                onChange(gregorianDate);
            } catch (err) {
                console.error("Date conversion error", err);
                const jsDate = date.toDate();
                const isoDate = jsDate.toISOString().split('T')[0];
                onChange(isoDate);
            }
        } else if (typeof date === 'string') {
            onChange(date);
        }
    }, []);

    const onSubmit: SubmitHandler<CreateUserFormData> = async (formData) => {
        try {
            const newUser = await createMutation.mutateAsync(formData);
            toast.success(`کاربر "${newUser.employee?.first_name || 'جدید'} ${newUser.employee?.last_name || ''}" با موفقیت ایجاد شد.`);
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

    const isLoadingLists = isLoadingWP || isLoadingSS || isLoadingWG;
    if (isLoadingLists) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foregroundL">
                <Loader2 className="h-10 w-10 animate-spin text-primaryL" />
                <p>در حال دریافت اطلاعات پایه...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="pb-24">
            {/* --- بخش ۱: اطلاعات حساب کاربری --- */}
            <FormSectionCard title="اطلاعات حساب کاربری" icon={Lock} className="z-40">
                <Input label="نام کاربری *" {...register("user_name")} error={errors.user_name?.message} autoFocus dir="ltr" />
                <Input label="ایمیل *" type="email" {...register("email")} error={errors.email?.message} dir="ltr" />

                {/* ✅ نکته مهم:
                   تنها با تغییر فایل Input.tsx، این خط به صورت خودکار قابلیت نمایش رمز عبور را خواهد داشت.
                   نیازی به تغییر کد در اینجا نیست.
                */}
                <Input
                    label="رمز عبور *"
                    type="password"
                    {...register("password")}
                    error={errors.password?.message}
                    dir="ltr"
                />

                <Controller name="role" control={control} render={({ field }) => (
                    <SelectBox
                        label="نقش کاربری *"
                        options={ROLE_OPTIONS}
                        value={ROLE_OPTIONS.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.role?.message}
                        placeholder="انتخاب کنید"
                    />
                )} />

                <Controller name="status" control={control} render={({ field }) => (
                    <SelectBox
                        label="وضعیت *"
                        options={STATUS_OPTIONS}
                        value={STATUS_OPTIONS.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.status?.message}
                        placeholder="انتخاب کنید"
                    />
                )} />
            </FormSectionCard>

            {/* --- بخش ۲: مشخصات فردی و تصاویر --- */}
            <FormSectionCard title="مشخصات فردی و تصاویر" icon={User} className="z-30">
                <div className="md:col-span-3 mb-4">
                    <label className="block text-sm font-medium mb-2 text-foreground dark:text-foregroundD">
                        تصویر پروفایل *
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                        <UploadCloud className="w-10 h-10 text-gray-400 mb-2 group-hover:text-primaryL transition-colors" />
                        <p className="text-sm text-gray-500 mb-1">برای آپلود کلیک کنید یا فایل را اینجا رها کنید</p>
                        <p className="text-xs text-gray-400">حداکثر 5MB (JPG, PNG, WEBP)</p>
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                    </div>
                    {errors.employee?.images && (
                        <p className="text-red-500 text-xs mt-2 font-medium">{errors.employee.images.message}</p>
                    )}
                    {previewUrls.length > 0 && (
                        <div className="flex flex-wrap gap-4 mt-4">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 left-1 bg-red-600/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                    >
                                        <Trash className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Input label="نام *" {...register("employee.first_name")} error={errors.employee?.first_name?.message} />
                <Input label="نام خانوادگی *" {...register("employee.last_name")} error={errors.employee?.last_name?.message} />
                <Input label="کد ملی *" {...register("employee.nationality_code")} error={errors.employee?.nationality_code?.message} className="text-left dir-ltr" />
                <Input label="نام پدر *" {...register("employee.father_name")} error={errors.employee?.father_name?.message} />

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
                        label="جنسیت *"
                        options={GENDER_OPTIONS}
                        value={GENDER_OPTIONS.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.employee?.gender?.message}
                        placeholder="انتخاب کنید"
                    />
                )} />
                <Controller name="employee.is_married" control={control} render={({ field }) => (
                    <SelectBox
                        label="وضعیت تاهل *"
                        options={MARITAL_STATUS_OPTIONS}
                        value={MARITAL_STATUS_OPTIONS.find(o => o.id === String(field.value)) || null}
                        onChange={(opt) => field.onChange(opt?.id === 'true')}
                        error={errors.employee?.is_married?.message}
                        placeholder="انتخاب کنید"
                    />
                )} />
                <Controller name="employee.education_level" control={control} render={({ field }) => (
                    <SelectBox
                        label="تحصیلات *"
                        options={EDUCATION_LEVEL_OPTIONS}
                        value={EDUCATION_LEVEL_OPTIONS.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id)}
                        error={errors.employee?.education_level?.message}
                        placeholder="انتخاب کنید"
                    />
                )} />
            </FormSectionCard>

            {/* --- بخش ۳: اطلاعات سازمانی --- */}
            <FormSectionCard title="اطلاعات سازمانی" icon={Building2} className="z-20">
                <Input label="کد پرسنلی *" {...register("employee.personnel_code")} error={errors.employee?.personnel_code?.message} className="text-left dir-ltr" />
                <Input label="سمت *" {...register("employee.position")} error={errors.employee?.position?.message} />

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
                        label="گروه کاری"
                        options={workGroupOptions}
                        value={workGroupOptions.find((o: SelectOption) => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id ?? null)}
                        error={errors.employee?.work_group_id?.message}
                        placeholder="انتخاب کنید (اختیاری)"
                    />
                )} />
                <Controller name="employee.shift_schedule_id" control={control} render={({ field }) => (
                    <SelectBox
                        label="برنامه شیفتی"
                        options={shiftScheduleOptions}
                        value={shiftScheduleOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id ? Number(opt.id) : null)}
                        error={errors.employee?.shift_schedule_id?.message}
                        placeholder="انتخاب کنید (اختیاری)"
                    />
                )} />
                <Controller name="employee.work_pattern_id" control={control} render={({ field }) => (
                    <SelectBox
                        label="الگوی کاری"
                        options={workPatternOptions}
                        value={workPatternOptions.find(o => o.id === field.value) || null}
                        onChange={(opt) => field.onChange(opt?.id ?? null)}
                        error={errors.employee?.work_pattern_id?.message}
                        placeholder="انتخاب کنید (اختیاری)"
                    />
                )} />
            </FormSectionCard>

            {/* --- بخش ۴: اطلاعات تماس --- */}
            <FormSectionCard title="اطلاعات تماس" icon={Phone} className="z-10">
                <Input label="شماره موبایل *" {...register("employee.phone_number")} error={errors.employee?.phone_number?.message} className="dir-ltr text-left" placeholder="09xxxxxxxxx" />
                <Input label="تلفن منزل *" {...register("employee.house_number")} error={errors.employee?.house_number?.message} className="dir-ltr text-left" />
                <Input label="تلفن اضطراری *" {...register("employee.sos_number")} error={errors.employee?.sos_number?.message} className="dir-ltr text-left" />
                <div className="md:col-span-3">
                    <Textarea label="آدرس سکونت *" {...register("employee.address")} rows={3} error={errors.employee?.address?.message} />
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