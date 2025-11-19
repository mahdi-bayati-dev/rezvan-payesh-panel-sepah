import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useEffect, useMemo } from 'react';
import {
    type OrganizationFormData,
    organizationFormSchema
} from '@/features/Organization/Schema/organizationFormSchema';
import { type Organization, type FlatOrgOption } from '@/features/Organization/types';
import { useCreateOrganization, useUpdateOrganization } from '@/features/Organization/hooks/useOrganizations';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Loader2 } from 'lucide-react';

interface OrganizationFormProps {
    defaultOrganization?: Organization | null;
    defaultParentId?: number | null;
    organizationList?: FlatOrgOption[];
    /**
     * لیست ID هایی که نباید به عنوان والد انتخاب شوند
     * (شامل خود سازمان و تمام فرزندانش)
     */
    forbiddenParentIds?: number[];
    onSuccess: () => void;
}

export const OrganizationForm = ({
    defaultOrganization = null,
    defaultParentId = null,
    organizationList = [],
    forbiddenParentIds = [],
    onSuccess,
}: OrganizationFormProps) => {

    const isEditMode = !!defaultOrganization;
    const idToUpdate = defaultOrganization?.id;

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationFormSchema),
        defaultValues: {
            name: "",
            parent_id: null
        },
    });

    const createMutation = useCreateOrganization();
    const updateMutation = useUpdateOrganization();

    const onSubmit = async (formData: OrganizationFormData) => {
        try {
            if (isEditMode && idToUpdate) {
                await updateMutation.mutateAsync(
                    { id: idToUpdate, payload: formData },
                    {
                        onSuccess: () => {
                            toast.success(`سازمان "${formData.name}" به‌روزرسانی شد.`);
                            onSuccess();
                        },
                    }
                );
            } else {
                await createMutation.mutateAsync(formData, {
                    onSuccess: () => {
                        toast.success(`سازمان "${formData.name}" ایجاد شد.`);
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

    // فیلتر کردن لیست برای جلوگیری از انتخاب خود یا فرزندان به عنوان والد
    const filteredParentOptions = useMemo(() => {
        if (!isEditMode) return [];

        return organizationList.filter(org => {
            // اگر ID در لیست ممنوعه است، نشان نده
            if (forbiddenParentIds.includes(org.id)) return false;
            return true;
        });
    }, [organizationList, forbiddenParentIds, isEditMode]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
            {errors.root?.serverError && (
                <Alert variant="destructive">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>
                        {errors.root.serverError.message}
                    </AlertDescription>
                </Alert>
            )}

            <Input
                label="نام سازمان"
                {...register("name")}
                error={errors.name?.message}
                disabled={isSubmitting}
                autoFocus
            />

            {isEditMode && (
                <div>
                    <label htmlFor="parent_id" className="block text-sm font-medium mb-1 text-foreground dark:text-foregroundD">
                        سازمان والد (سرگروه)
                    </label>
                    <select
                        id="parent_id"
                        className="w-full h-10 border border-input rounded-md px-3 bg-background dark:bg-backgroundD text-foreground dark:text-foregroundD focus:ring-2 focus:ring-ring"
                        disabled={isSubmitting}
                        {...register("parent_id", {
                            setValueAs: (value) => (value === "null" || value === "") ? null : Number(value)
                        })}
                    >
                        <option value="null">- ریشه (بدون والد) -</option>
                        {filteredParentOptions.map(org => (
                            <option key={org.id} value={org.id}>
                                {'\u00A0\u00A0\u00A0'.repeat(org.level)} {org.level > 0 ? '└ ' : ''} {org.name}
                            </option>
                        ))}
                    </select>
                    {errors.parent_id && (
                        <p className="text-destructive text-sm mt-1">{errors.parent_id.message}</p>
                    )}
                    {filteredParentOptions.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            هیچ سازمان والدی برای انتخاب وجود ندارد (نمی‌توان فرزندان را به عنوان والد انتخاب کرد).
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                    {isEditMode ? "ذخیره تغییرات" : "ایجاد سازمان"}
                </Button>
            </div>
        </form>
    );
};