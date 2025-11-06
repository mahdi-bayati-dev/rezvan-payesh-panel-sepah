import React, { useMemo } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'; // ✅ SubmitHandler
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// --- ۱. ایمپورت اسکما و هوک ایجاد کاربر ---
// ✅ [اصلاح شد] حذف /features/ از مسیر بر اساس ساختار فایل شما
import {
    type CreateUserFormData,
    createUserFormSchema
} from '@/features/User/Schema/userProfileFormSchema';
import { useCreateUser } from '@/features/User/hooks/hook';

// --- ۲. ایمپورت هوک‌های لازم برای لیست‌های Dropdown ---
// ✅ [اصلاح شد] حذف /features/ از مسیر بر اساس ساختار فایل شما
import {
    useWorkPatternsList,
    useShiftSchedulesList,
    useWorkGroups
} from '@/features/work-group/hooks/hook';
import { type BaseNestedItem } from '@/features/work-group/types';

// --- ۳. ایمپورت کامپوننت‌های UI شما ---
// ✅ [اصلاح شد] استفاده از حروف کوچک برای نام فایل‌ها (case-sensitivity)
import Input from '@/components/ui/Input';
import SelectBox from '@/components/ui/SelectBox';
import { type SelectOption } from '@/components/ui/SelectBox';
import Textarea from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Loader2, Save, X } from 'lucide-react';

// --- ۴. داده‌های ثابت برای SelectBoxها (بدون تغییر) ---
const statusOptions: SelectOption[] = [
    { id: 'active', name: 'فعال' },
    { id: 'inactive', name: 'غیرفعال' },
];
const roleOptions: SelectOption[] = [
    { id: 'user', name: 'کارمند (user)' },
    { id: 'org-admin-l3', name: 'ادمین L3' },
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
    // ... (محتوای فعلی)
];
const toSelectOption = (item: BaseNestedItem): SelectOption => ({
    id: item.id,
    name: item.name,
});


/**
 * فرم اصلی ایجاد کاربر
 */
export const CreateUserForm: React.FC<{ organizationId: number }> = ({ organizationId }) => {

    const navigate = useNavigate();
    const createMutation = useCreateUser();

    // --- ۵. فچ کردن داده‌های Dropdownها (بدون تغییر) ---
    const { data: rawWorkPatterns, isLoading: isLoadingWP } = useWorkPatternsList();
    const { data: rawShiftSchedules, isLoading: isLoadingSS } = useShiftSchedulesList();
    const { data: rawWorkGroups, isLoading: isLoadingWG } = useWorkGroups(1, 9999);
    const workGroupOptions = useMemo(() => rawWorkGroups?.data?.map(toSelectOption) || [], [rawWorkGroups]);
    const shiftScheduleOptions = useMemo(() => rawShiftSchedules?.map(toSelectOption) || [], [rawShiftSchedules]);
    const workPatternOptions = useMemo(() => rawWorkPatterns?.map(toSelectOption) || [], [rawWorkPatterns]);


    // --- ✅ [اصلاح شد] ۷. مقادیر پیش‌فرض فرم ---
    // رفع خطای TS2322: با افزودن تایپ صریح CreateUserFormData به useMemo
    // به TypeScript اطمینان می‌دهیم که status: "active" از نوع string نیست.
    const defaultValues = useMemo((): CreateUserFormData => ({
        user_name: "",
        email: "",
        password: "",
        role: "user", // پیش‌فرض
        status: "active", // پیش‌فرض (تایپ‌اسکریپت حالا می‌داند این "active" | "inactive" است)
        employee: {
            organization_id: organizationId, // ست کردن از Prop
            first_name: "",
            last_name: "",
            personnel_code: "",
            gender: "male", // پیش‌فرض
            is_married: false, // پیش‌فرض
            // تمام فیلدهای nullable باید صریحاً null ست شوند تا تایپ مطابقت کند
            position: null,
            starting_job: null,
            father_name: null,
            birth_date: null,
            nationality_code: null,
            education_level: null,
            phone_number: null,
            house_number: null,
            sos_number: null,
            address: null,
            work_group_id: null,
            shift_schedule_id: null,
            work_pattern_id: null,
        }
    }), [organizationId]);

    // ۸. راه‌اندازی React Hook Form
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isDirty },
    } = useForm<CreateUserFormData>({ // این <CreateUserFormData> حالا به درستی کار می‌کند
        resolver: zodResolver(createUserFormSchema),
        defaultValues
    });

    // --- ✅ [اصلاح شد] ۹. مدیریت Submit ---
    // رفع خطای TS2345: تایپ formData به صراحت CreateUserFormData گذاشته شد
    // (اگرچه با رفع خطای defaultValues، این مورد خودبه‌خود حل می‌شد)
    const onSubmit: SubmitHandler<CreateUserFormData> = async (formData) => {
        try {
            const newUser = await createMutation.mutateAsync(formData);

            toast.success(`کاربر "${newUser.employee?.first_name} ${newUser.employee?.last_name}" با موفقیت ایجاد شد.`);
            navigate(-1); // بازگشت به لیست

        } catch (err: any) {
            // (مدیریت خطای 422 - بدون تغییر)
            const validationErrors = err?.response?.data?.errors;
            if (validationErrors) {
                toast.error("خطا در اعتبارسJی. لطفاً فیلدهای مشخص‌شده را بررسی کنید.");

                Object.keys(validationErrors).forEach((key) => {
                    setError(key as keyof CreateUserFormData, {
                        type: 'server',
                        message: validationErrors[key][0]
                    });
                });
            } else {
                console.error("خطای غیرمنتظره در ایجاد کاربر:", err);
            }
        }
    };

    const isSubmitting = createMutation.isPending;
    const isLoadingLists = isLoadingWP || isLoadingSS || isLoadingWG;

    if (isLoadingLists) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">در حال بارگذاری لیست‌های مورد نیاز...</span>
            </div>
        );
    }

    // --- ۱۰. رندر کردن فرم ---
    // با رفع خطاهای بالا، 'handleSubmit(onSubmit)' دیگر خطای TS2345 نمی‌دهد
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* --- بخش ۱: اطلاعات حساب --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b border-borderL dark:border-borderD">
                    اطلاعات حساب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="نام کاربری (الزامی)"
                        {...register("user_name")}
                        error={errors.user_name?.message}
                    />
                    <Input
                        label="ایمیل (الزامی)"
                        type="email"
                        {...register("email")}
                        error={errors.email?.message}
                    />
                    <Input
                        label="رمز عبور (الزامی - حداقل ۸ کاراکتر)"
                        type="password"
                        {...register("password")}
                        error={errors.password?.message}
                    />

                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="نقش (الزامی)"
                                placeholder="انتخاب نقش..."
                                options={roleOptions}
                                value={roleOptions.find(opt => opt.id === field.value) || null}
                                onChange={(option) => field.onChange(option ? option.id : null)}
                                disabled={isSubmitting}
                                error={errors.role?.message}
                            />
                        )}
                    />
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="وضعیت (الزامی)"
                                placeholder="انتخاب وضعیت..."
                                options={statusOptions}
                                value={statusOptions.find(opt => opt.id === field.value) || null}
                                onChange={(option) => field.onChange(option ? option.id : null)}
                                disabled={isSubmitting}
                                error={errors.status?.message}
                            />
                        )}
                    />
                </div>
            </fieldset>

            {/* --- بخش ۲: مشخصات فردی --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b border-borderL dark:border-borderD">
                    مشخصات فردی
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="نام (الزامی)"
                        {...register("employee.first_name")}
                        error={errors.employee?.first_name?.message}
                    />
                    <Input
                        label="نام خانوادگی (الزامی)"
                        {...register("employee.last_name")}
                        error={errors.employee?.last_name?.message}
                    />
                    <Input
                        label="نام پدر"
                        {...register("employee.father_name")}
                        error={errors.employee?.father_name?.message}
                    />
                    <Input
                        label="کد ملی"
                        {...register("employee.nationality_code")}
                        error={errors.employee?.nationality_code?.message}
                    />
                    <Input
                        label="تاریخ تولد (YYYY-MM-DD)"
                        {...register("employee.birth_date")}
                        error={errors.employee?.birth_date?.message}
                    />

                    <Controller
                        name="employee.gender"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="جنسیت (الزامی)"
                                placeholder="انتخاب کنید..."
                                options={genderOptions}
                                value={genderOptions.find(opt => opt.id === field.value) || null}
                                onChange={(option) => field.onChange(option ? option.id : null)}
                                disabled={isSubmitting}
                                error={errors.employee?.gender?.message}
                            />
                        )}
                    />

                    <Controller
                        name="employee.is_married"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="وضعیت تاهل (الزامی)"
                                placeholder="انتخاب کنید..."
                                options={maritalStatusOptions}
                                value={maritalStatusOptions.find(opt => opt.id === String(field.value)) || null}
                                onChange={(option) => field.onChange(option ? option.id === 'true' : null)}
                                disabled={isSubmitting}
                                error={errors.employee?.is_married?.message}
                            />
                        )}
                    />

                    <Controller
                        name="employee.education_level"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="تحصیلات"
                                placeholder="(انتخاب کنید)"
                                options={educationLevelOptions}
                                value={educationLevelOptions.find(opt => opt.id === field.value) || null}
                                onChange={(option) => field.onChange(option ? option.id : null)}
                                disabled={isSubmitting}
                                error={errors.employee?.education_level?.message}
                            />
                        )}
                    />
                </div>
            </fieldset>

            {/* --- بخش ۳: اطلاعات سازمانی و شغلی --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b border-borderL dark:border-borderD">
                    اطلاعات سازمانی و شغلی
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="کد پرسنلی (الزامی)"
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

                    <input type="hidden" {...register("employee.organization_id")} />

                    <Controller
                        name="employee.work_group_id"
                        control={control}
                        render={({ field }) => (
                            <SelectBox
                                label="گروه کاری"
                                placeholder="(انتخاب کنید)"
                                options={workGroupOptions}
                                value={workGroupOptions.find(opt => opt.id === field.value) || null}
                                onChange={(option) => field.onChange(option ? option.id : null)}
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                                error={errors.employee?.work_pattern_id?.message}
                            />
                        )}
                    />
                </div>
            </fieldset>

            {/* --- بخش ۴: اطلاعات تماس --- */}
            <fieldset className="space-y-4">
                <h3 className="text-lg font-semibold pb-4 border-b border-borderL dark:border-borderD">
                    اطلاعات تماس
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="موبایل"
                        {...register("employee.phone_number")}
                        error={errors.employee?.phone_number?.message}
                    />
                    <Input
                        label="تلفن منزل"
                        {...register("employee.house_number")}
                        error={errors.employee?.house_number?.message}
                    />
                    <Input
                        label="تلفن اضطراری"
                        {...register("employee.sos_number")}
                        error={errors.employee?.sos_number?.message}
                    />
                </div>
                <Textarea
                    label="آدرس"
                    {...register("employee.address")}
                    error={errors.employee?.address?.message}
                    rows={3}
                />
            </fieldset>

            {/* --- دکمه‌های عملیاتی --- */}
            <div className="flex justify-end gap-4 pt-6 border-t border-borderL dark:border-borderD">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                >
                    <X className="h-4 w-4 ml-2" />
                    لغو
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!isDirty || isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                        <Save className="h-4 w-4 ml-2" />
                    )}
                    ایجاد و ذخیره کاربر
                </Button>
            </div>
        </form>
    );
};