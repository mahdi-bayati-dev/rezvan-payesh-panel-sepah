import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'react-toastify';

import { type WorkGroup } from "@/features/work-group/types";
import {
    type WorkGroupFormData,
    workGroupFormSchema
} from "@/features/work-group/Schema/workGroupFormSchema";

import {
    useCreateWorkGroup,
    useUpdateWorkGroup,
    useWorkPatternsList,
    useShiftSchedulesList,
} from "@/features/work-group/hooks/hook";

// ✅ کامپوننت‌های UI اختصاصی خودت
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SelectBox from "@/components/ui/SelectBox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner"; // برای لودینگ اولیه
import { SpinnerButton } from "@/components/ui/SpinnerButton"; // برای دکمه ذخیره

interface WorkGroupFormProps {
    defaultWorkGroup?: WorkGroup;
    onSuccess: () => void;
    onCancel?: () => void; // پراپ جدید برای دکمه انصراف
}

export const WorkGroupForm = ({
    defaultWorkGroup,
    onSuccess,
    onCancel,
}: WorkGroupFormProps) => {
    const isEditMode = !!defaultWorkGroup;
    const idToUpdate = defaultWorkGroup?.id;

    const { data: patterns, isLoading: isLoadingPatterns } = useWorkPatternsList();
    const { data: schedules, isLoading: isLoadingSchedules } = useShiftSchedulesList();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<WorkGroupFormData>({
        resolver: zodResolver(workGroupFormSchema),
        defaultValues: {
            name: "",
            type: "pattern",
            week_pattern_id: null,
            shift_schedule_id: null,
        },
    });

    // پر کردن فرم در حالت ویرایش
    useEffect(() => {
        if (isEditMode && defaultWorkGroup) {
            reset({
                name: defaultWorkGroup.name,
                type: defaultWorkGroup.week_pattern_id ? "pattern" : "schedule",
                week_pattern_id: defaultWorkGroup.week_pattern_id,
                shift_schedule_id: defaultWorkGroup.shift_schedule_id,
            });
        }
    }, [defaultWorkGroup, isEditMode, reset]);

    const selectedType = watch("type");

    const createMutation = useCreateWorkGroup();
    const updateMutation = useUpdateWorkGroup();

    const onSubmit = async (formData: WorkGroupFormData) => {
        const payload = {
            name: formData.name,
            week_pattern_id: formData.type === "pattern" ? formData.week_pattern_id : null,
            shift_schedule_id: formData.type === "schedule" ? formData.shift_schedule_id : null,
        };

        try {
            if (isEditMode && idToUpdate) {
                await updateMutation.mutateAsync(
                    { id: idToUpdate, payload },
                    {
                        onSuccess: () => {
                            toast.success("گروه کاری با موفقیت به‌روزرسانی شد.");
                            onSuccess();
                        },
                    }
                );
            } else {
                await createMutation.mutateAsync(payload, {
                    onSuccess: () => {
                        toast.success("گروه کاری جدید با موفقیت ایجاد شد.");
                        onSuccess();
                    },
                });
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                const apiErrors = error.response.data.errors;
                Object.keys(apiErrors).forEach((key) => {
                    setError(key as keyof WorkGroupFormData, {
                        type: "server",
                        message: apiErrors[key][0],
                    });
                });
            } else {
                const errorMessage = error.response?.data?.message || "خطای غیرمنتظره‌ای رخ داد.";
                toast.error(errorMessage);
                setError("root.serverError", {
                    type: "server",
                    message: errorMessage,
                });
            }
        }
    };

    const isFormLoading = isLoadingPatterns || isLoadingSchedules;

    // استفاده از Spinner خودت برای حالت لودینگ اولیه
    if (isFormLoading) {
        return (
            <Spinner
                variant="dots"
                size="md"
                text="در حال دریافت اطلاعات الگوها..."
                wrapperClassName="py-10"
            />
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir="rtl">

            {errors.root?.serverError && (
                <Alert variant="destructive">
                    <AlertTitle>خطا</AlertTitle>
                    <AlertDescription>{errors.root.serverError.message}</AlertDescription>
                </Alert>
            )}

            <Input
                label="نام گروه کاری"
                placeholder="مثلاً: تیم فنی شیفت صبح"
                {...register("name")}
                error={errors.name?.message}
                disabled={isSubmitting}
                className="bg-backgroundL-200 dark:bg-backgroundD-800"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="نوع زمان‌بندی"
                            placeholder="انتخاب کنید..."
                            options={[
                                { id: "pattern", name: "مبتنی بر الگوی کاری (هفتگی)" },
                                { id: "schedule", name: "مبتنی بر برنامه شیفتی (دوره‌ای)" },
                            ]}
                            value={field.value ? {
                                id: field.value,
                                name: field.value === "pattern" ? "مبتنی بر الگوی کاری" : "مبتنی بر برنامه شیفتی",
                            } : null}
                            onChange={(option) => {
                                field.onChange(option.id);
                                if (option.id === 'pattern') reset({ ...watch(), shift_schedule_id: null });
                                else reset({ ...watch(), week_pattern_id: null });
                            }}
                            error={errors.type?.message}
                            disabled={isSubmitting}
                        />
                    )}
                />

                {selectedType === "pattern" && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <Controller
                            name="week_pattern_id"
                            control={control}
                            render={({ field }) => (
                                <SelectBox
                                    label="انتخاب الگوی کاری"
                                    placeholder="الگوی مورد نظر را جستجو کنید..."
                                    options={patterns || []}
                                    value={patterns?.find((p) => p.id === field.value) || null}
                                    onChange={(option) => field.onChange(option.id)}
                                    error={errors.week_pattern_id?.message}
                                    disabled={isSubmitting || isLoadingPatterns}
                                />
                            )}
                        />
                    </div>
                )}

                {selectedType === "schedule" && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                        <Controller
                            name="shift_schedule_id"
                            control={control}
                            render={({ field }) => (
                                <SelectBox
                                    label="انتخاب برنامه شیفتی"
                                    placeholder="برنامه مورد نظر را جستجو کنید..."
                                    options={schedules || []}
                                    value={schedules?.find((s) => s.id === field.value) || null}
                                    onChange={(option) => field.onChange(option.id)}
                                    error={errors.shift_schedule_id?.message}
                                    disabled={isSubmitting || isLoadingSchedules}
                                />
                            )}
                        />
                    </div>
                )}
            </div>

            {/* فوتر فرم */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-borderL dark:border-borderD mt-6">

                {/* دکمه انصراف */}
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto dark:text-white"
                    >
                        انصراف
                    </Button>
                )}

                {/* دکمه ذخیره با SpinnerButton خودت */}
                <Button
                    type="submit"
                    disabled={isSubmitting || isFormLoading}
                    variant="primary"
                    className="w-full sm:w-auto min-w-[140px]"
                >
                    {isSubmitting ? (
                        <>
                            <SpinnerButton size="sm" className="ml-2" />
                            در حال ذخیره...
                        </>
                    ) : (
                        isEditMode ? "ذخیره تغییرات" : "ایجاد گروه کاری"
                    )}
                </Button>
            </div>
        </form>
    );
};