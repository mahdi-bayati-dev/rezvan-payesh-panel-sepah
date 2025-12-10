import { useForm, Controller } from 'react-hook-form';
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
import SelectBox, { type SelectOption } from '@/components/ui/SelectBox';
import { Loader2 } from 'lucide-react';

interface OrganizationFormProps {
    defaultOrganization?: Organization | null;
    defaultParentId?: number | null;
    organizationList?: FlatOrgOption[];
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
        control,
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

    const onSubmit = async (formData: OrganizationFormData) => {
        try {
            if (isEditMode && idToUpdate) {
                await updateMutation.mutateAsync(
                    { id: idToUpdate, payload: formData },
                    {
                        onSuccess: () => {
                            toast.success(`سازمان "${formData.name}" با موفقیت ویرایش شد.`);
                            onSuccess();
                        },
                    }
                );
            } else {
                await createMutation.mutateAsync(formData, {
                    onSuccess: () => {
                        toast.success(`سازمان "${formData.name}" با موفقیت ایجاد شد.`);
                        onSuccess();
                    },
                });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "خطای سرور در انجام عملیات.";
            toast.error(errorMessage);
            setError("root.serverError", {
                type: "server",
                message: errorMessage,
            });
        }
    };

    const validParentOptions = useMemo(() => {
        return organizationList.filter(org => !forbiddenParentIds.includes(org.id));
    }, [organizationList, forbiddenParentIds]);

    const selectBoxOptions: SelectOption[] = useMemo(() => {
        const rootOption: SelectOption = { id: 'root_null', name: '● سازمان ریشه (بدون والد)' };

        const mappedOptions = validParentOptions.map(org => ({
            id: org.id,
            name: `${'\u00A0'.repeat(org.level * 4)}${org.level > 0 ? '└─ ' : ''}${org.name}`
        }));

        return [rootOption, ...mappedOptions];
    }, [validParentOptions]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir="rtl">
            {errors.root?.serverError && (
                <Alert variant="destructive" className="bg-destructiveL-background dark:bg-destructiveD-background text-destructiveL-foreground dark:text-destructiveD-foreground border-destructiveL-foreground/10">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>
                        {errors.root.serverError.message}
                    </AlertDescription>
                </Alert>
            )}

            <Input
                label="نام واحد سازمانی"
                placeholder="مثال: واحد فنی و مهندسی"
                {...register("name")}
                error={errors.name?.message}
                disabled={isSubmitting}
                autoFocus
                className="bg-backgroundL-500 dark:bg-backgroundD"
            />

            <div className="space-y-1">
                <Controller
                    control={control}
                    name="parent_id"
                    render={({ field }) => (
                        <SelectBox
                            label="واحد بالادستی (والد)"
                            placeholder="انتخاب واحد والد..."
                            options={selectBoxOptions}
                            value={selectBoxOptions.find(opt => {
                                if (field.value === null) return opt.id === 'root_null';
                                return opt.id === field.value;
                            }) || null}
                            onChange={(selected) => {
                                const newValue = selected.id === 'root_null' ? null : Number(selected.id);
                                field.onChange(newValue);
                            }}
                            error={errors.parent_id?.message}
                            disabled={isSubmitting}
                        />
                    )}
                />

                {isEditMode && selectBoxOptions.length <= 1 && (
                    <p className="text-xs text-warningL-foreground dark:text-warningD-foreground px-1">
                        * امکان انتخاب والد وجود ندارد (تمام گزینه‌ها زیرمجموعه این واحد هستند).
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-borderL dark:border-borderD mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onSuccess}
                    disabled={isSubmitting}
                >
                    انصراف
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    className="min-w-[140px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                            درحال ثبت...
                        </>
                    ) : (
                        isEditMode ? "ذخیره تغییرات" : "ایجاد سازمان"
                    )}
                </Button>
            </div>
        </form>
    );
};