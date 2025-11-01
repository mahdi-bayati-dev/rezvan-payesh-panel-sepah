
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

// --- ۱. هوک‌ها و تایپ‌ها ---
import {
    type OrganizationFormData,
    organizationFormSchema
} from '@/features/Organization/Schema/organizationFormSchema'; // (مسیر اسکیما را بررسی کنید)
import { type Organization } from '@/features/Organization/types';
import { useCreateOrganization, useUpdateOrganization } from '@/features/Organization/hooks/useOrganizations'; // (مسیر هوک‌ها را بررسی کنید)

// --- ۲. کامپوننت‌های UI ---
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';
// (شما به یک SelectBox برای انتخاب والد نیاز خواهید داشت،
// اما برای سادگی در فرم ایجاد، فقط parent_id را به صورت مخفی می‌گیریم)

// --- ۲. تعریف پراپ‌های ورودی فرم ---
interface FlatOrgOption {
    id: number;
    name: string;
    level: number;
    parent_id: number | null;
}

interface OrganizationFormProps {
    /**
     * اگر آبجکت سازمان پاس داده شود، فرم در حالت "ویرایش" خواهد بود
     */
    defaultOrganization?: Organization | null; // (null را هم قبول کند)
    /**
     * (برای حالت ایجاد) ID والد پیش‌فرض 
     */
    defaultParentId?: number | null;
    /**
     * (برای حالت ویرایش) لیست مسطح همه‌ی سازمان‌ها برای دراپ‌다운 انتخاب والد
     */
    organizationList?: FlatOrgOption[];
    /**
     * تابعی که پس از موفقیت فراخوانی می‌شود
     */
    onSuccess: () => void;
}

export const OrganizationForm = ({
    defaultOrganization = null,
    defaultParentId = null,
    organizationList = [],
    onSuccess,
}: OrganizationFormProps) => {

    const isEditMode = !!defaultOrganization;
    const idToUpdate = defaultOrganization?.id;

    // --- راه‌اندازی React Hook Form (بدون تغییر) ---
    const {
        register,
        handleSubmit,
        setError,
        reset,
        // watch,
        formState: { errors, isSubmitting },
    } = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationFormSchema),
        defaultValues: isEditMode
            ? {
                name: defaultOrganization.name,
                parent_id: defaultOrganization.parent_id,
            }
            : {
                name: "",
                parent_id: defaultParentId,
            },
    });

    // --- راه‌اندازی Mutation ها (بدون تغییر) ---
    const createMutation = useCreateOrganization();
    const updateMutation = useUpdateOrganization();

    // --- مدیریت Submit (بدون تغییر) ---
    const onSubmit = async (formData: OrganizationFormData) => {
        try {
            if (isEditMode && idToUpdate) {
                // --- حالت ویرایش ---
                await updateMutation.mutateAsync(
                    { id: idToUpdate, payload: formData },
                    {
                        onSuccess: () => {
                            toast.success(`سازمان "${formData.name}" با موفقیت به‌روزرسانی شد.`);
                            onSuccess();
                        },
                    }
                );
            } else {
                // --- حالت ایجاد ---
                await createMutation.mutateAsync(formData, {
                    onSuccess: () => {
                        toast.success(`سازمان "${formData.name}" با موفقیت ایجاد شد.`);
                        onSuccess();
                    },
                });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "خطای غیرمنتظره‌ای رخ داد.";
            toast.error(errorMessage);
            setError("root.serverError", {
                type: "server",
                message: errorMessage,
            });
        }
    };

    // --- افکت برای ریست کردن فرم (بدون تغییر) ---
    useEffect(() => {
        if (isEditMode && defaultOrganization) {
            reset({
                name: defaultOrganization.name,
                parent_id: defaultOrganization.parent_id,
            });
        } else {
            reset({
                name: "",
                parent_id: defaultParentId,
            });
        }
    }, [defaultOrganization, defaultParentId, isEditMode, reset]);


    // --- ۴. فیلتر کردن لیست والدها در حالت ویرایش ---
    // در حالت ویرایش، یک سازمان نمی‌تواند والد خودش باشد
    const filteredParentOptions = organizationList.filter(
        (org) => org.id !== idToUpdate // خود سازمان فعلی را حذف کن
        // TODO (پیشرفته): در اینجا باید فرزندان این سازمان را هم حذف کنید
        // تا از ایجاد حلقه‌های بی‌نهایت (circular dependency) جلوگیری شود.
        // این کار نیازمند داشتن لیست کامل فرزندان (descendants) است.
    );


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
            {/* خطای سرور (بدون تغییر) */}
            {errors.root?.serverError && (
                <Alert variant="destructive">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>
                        {errors.root.serverError.message}
                    </AlertDescription>
                </Alert>
            )}

            {/* فیلد نام (بدون تغییر) */}
            <Input
                label="نام سازمان"
                {...register("name")}
                error={errors.name?.message}
                disabled={isSubmitting}
                autoFocus
            />

            {/* --- ۵. فیلد انتخاب والد (فقط در حالت ویرایش) --- */}
            {/* در حالت ایجاد، parent_id به صورت مخفی از defaultParentId ست می‌شود.
              اما در حالت ویرایش، ما به کاربر اجازه تغییر والد را می‌دهیم.
            */}
            {isEditMode && (
                <div>
                    <label htmlFor="parent_id" className="block text-sm font-medium mb-1">
                        سازمان والد (سرگروه)
                    </label>
                    <select
                        id="parent_id"
                        className="w-full h-10 border border-gray-300 dark:border-gray-700 rounded-md px-3 bg-white dark:bg-gray-800"
                        disabled={isSubmitting}
                        // ما از register استفاده می‌کنیم و با valueAs، مقدار رشته‌ای
                        // <select> را به null یا number تبدیل می‌کنیم
                        {...register("parent_id", {
                            setValueAs: (value) => (value === "null" || value === "") ? null : Number(value)
                        })}
                    // مقدار پیش‌فرض را از defaultValues می‌خواند
                    >
                        {/* گزینه ریشه */}
                        <option value="null">
                            - ریشه (بدون والد) -
                        </option>

                        {/* مپ کردن روی لیست فیلتر شده */}
                        {filteredParentOptions.map(org => (
                            <option key={org.id} value={org.id}>
                                {/* استفاده از 'ـ' برای نمایش تورفتگی */}
                                {'ـ '.repeat(org.level)} {org.name}
                            </option>
                        ))}
                    </select>
                    {errors.parent_id && (
                        <p className="text-red-500 text-sm mt-1">{errors.parent_id.message}</p>
                    )}
                </div>
            )}


            {/* دکمه‌های فرم (بدون تغییر) */}
            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {isEditMode ? "ذخیره تغییرات" : "ایجاد سازمان"}
                </Button>
            </div>
        </form>
    );
};