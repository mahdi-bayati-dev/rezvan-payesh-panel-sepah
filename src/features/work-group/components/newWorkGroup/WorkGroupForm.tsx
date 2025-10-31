import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'react-toastify'; // ۱. ایمپورت toast

// --- اصلاح ایمپورت‌ها ---
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

// ایمپورت کامپوننت‌های UI خودت
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SelectBox from "@/components/ui/SelectBox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Loader2 } from "lucide-react";

interface WorkGroupFormProps {
    defaultWorkGroup?: WorkGroup;
    onSuccess: () => void;
}

export const WorkGroupForm = ({
    defaultWorkGroup,
    onSuccess,
}: WorkGroupFormProps) => {
    const isEditMode = !!defaultWorkGroup;
    const idToUpdate = defaultWorkGroup?.id;

    const { data: patterns, isLoading: isLoadingPatterns } =
        useWorkPatternsList();
    const { data: schedules, isLoading: isLoadingSchedules } =
        useShiftSchedulesList();

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
        defaultValues: isEditMode
            ? {
                name: defaultWorkGroup.name,
                type: defaultWorkGroup.week_pattern_id ? "pattern" : "schedule",
                week_pattern_id: defaultWorkGroup.week_pattern_id,
                shift_schedule_id: defaultWorkGroup.shift_schedule_id,
            }
            : {
                name: "",
                type: "pattern",
                week_pattern_id: null,
                shift_schedule_id: null,
            },
    });

    const selectedType = watch("type");

    const createMutation = useCreateWorkGroup();
    const updateMutation = useUpdateWorkGroup();

    const onSubmit = async (formData: WorkGroupFormData) => {
        const payload = {
            name: formData.name,
            week_pattern_id:
                formData.type === "pattern" ? formData.week_pattern_id : null,
            shift_schedule_id:
                formData.type === "schedule" ? formData.shift_schedule_id : null,
        };

        try {
            if (isEditMode && idToUpdate) {
                await updateMutation.mutateAsync(
                    { id: idToUpdate, payload },
                    {
                        onSuccess: () => {
                            // ۲. نمایش پیام موفقیت‌آمیز
                            toast.success("گروه کاری با موفقیت به‌روزرسانی شد.");
                            onSuccess(); // (بستن مودال یا بازگشت)
                        },
                    }
                );
            } else {
                await createMutation.mutateAsync(payload, {
                    onSuccess: () => {
                        // ۲. نمایش پیام موفقیت‌آمیز
                        toast.success("گروه کاری جدید با موفقیت ایجاد شد.");
                        onSuccess(); // (بستن مودال یا بازگشت)
                    },
                });
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                // خطاهای ولیدیشن (بدون toast، فقط در فرم)
                const apiErrors = error.response.data.errors;
                Object.keys(apiErrors).forEach((key) => {
                    setError(key as keyof WorkGroupFormData, {
                        type: "server",
                        message: apiErrors[key][0],
                    });
                });
            } else {
                // خطای عمومی سرور (هم در فرم و هم با toast)
                const errorMessage = error.response?.data?.message || "خطای غیرمنتظره‌ای رخ داد.";
                
                // ۳. نمایش پیام خطا
                toast.error(errorMessage);
                
                setError("root.serverError", {
                    type: "server",
                    message: errorMessage,
                });
            }
        }
    };

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

    const isFormLoading = isLoadingPatterns || isLoadingSchedules;

    if (isFormLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mr-2">در حال بارگذاری اطلاعات فرم...</span>
            </div>
        );
    }

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
                label="نام گروه کاری"
                {...register("name")}
                error={errors.name?.message}
                disabled={isSubmitting}
            />

            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <SelectBox
                        label="نوع گروه"
                        placeholder="انتخاب نوع..."
                        options={[
                            { id: "pattern", name: "مبتنی بر الگوی کاری" },
                            { id: "schedule", name: "مبتنی بر برنامه شیفتی" },
                        ]}
                        value={
                            field.value
                                ? {
                                    id: field.value,
                                    name:
                                        field.value === "pattern"
                                            ? "مبتنی بر الگوی کاری"
                                            : "مبتنی بر برنامه شیفتی",
                                }
                                : null
                        }
                        onChange={(option) => field.onChange(option.id)}
                        error={errors.type?.message}
                        disabled={isSubmitting}
                    />
                )}
            />

            {selectedType === "pattern" && (
                <Controller
                    name="week_pattern_id"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="الگوی کاری"
                            placeholder="انتخاب الگو..."
                            options={patterns || []}
                            value={
                                patterns?.find((p) => p.id === field.value) || null
                            }
                            onChange={(option) => field.onChange(option.id)}
                            error={errors.week_pattern_id?.message || (errors.type?.message && !errors.week_pattern_id ? errors.type.message : undefined)}
                            disabled={isSubmitting || isLoadingPatterns}
                        />
                    )}
                />
            )}

            {selectedType === "schedule" && (
                <Controller
                    name="shift_schedule_id"
                    control={control}
                    render={({ field }) => (
                        <SelectBox
                            label="برنامه شیفتی"
                            placeholder="انتخاب برنامه..."
                            options={schedules || []}
                            value={
                                schedules?.find((s) => s.id === field.value) || null
                            }
                            onChange={(option) => field.onChange(option.id)}
                            error={errors.shift_schedule_id?.message || (errors.type?.message && !errors.shift_schedule_id ? errors.type.message : undefined)}
                            disabled={isSubmitting || isLoadingSchedules}
                        />
                    )}
                />
            )}

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting || isFormLoading}
                    variant="primary"
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {isEditMode ? "ذخیره تغییرات" : "ایجاد گروه کاری"}
                </Button>
            </div>
        </form>
    );
};

