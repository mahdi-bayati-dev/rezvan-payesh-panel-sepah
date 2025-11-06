import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
// import { toast } from "react-toastify";
import { useShiftSchedule, useUpdateShiftSchedule } from "./hook"; // ✅ مسیر نسبی
import {
  newShiftScheduleSchema,
  type NewShiftScheduleFormData,
} from "../schema/NewShiftScheduleSchema"; // ✅ مسیر نسبی
import type { ShiftScheduleUpdatePayload } from "../types/index"; // ✅ مسیر نسبی
// ✅✅✅ اصلاح خطای ۲: ایمپورت از مسیر ماژول work-pattern
import type { ApiValidationError } from "@/features/work-pattern/types/index";
import { AxiosError } from "axios";

interface UseEditShiftScheduleFormProps {
  shiftScheduleId: number | string | null;
  onSuccess?: () => void;
}

/**
 * هوک مدیریت منطق فرم ویرایش برنامه شیفتی (فقط نام و تاریخ شروع)
 */
export const useEditShiftScheduleForm = ({
  shiftScheduleId,
  onSuccess,
}: UseEditShiftScheduleFormProps) => {
  // ۱. فچ کردن جزئیات شیفت برنامه (شامل اسلات‌ها)
  const {
    data: initialSchedule,
    isLoading: isLoadingInitialData,
    error: loadError,
  } = useShiftSchedule(shiftScheduleId ?? 0);

  // ۲. هوک Mutation برای آپدیت
  const { mutate, isPending, error: mutationError } = useUpdateShiftSchedule();

  // ۳. آماده‌سازی مقادیر پیش‌فرض
  const defaultValues = useMemo(() => {
    if (initialSchedule) {
      return {
        name: initialSchedule.name,
        cycle_length_days: initialSchedule.cycle_length_days,
        cycle_start_date: initialSchedule.cycle_start_date,
      };
    }
    return undefined;
  }, [initialSchedule]);

  // ۴. راه‌اندازی React Hook Form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isDirty },
    setError: setFormError,
  } = useForm<NewShiftScheduleFormData>({
    resolver: zodResolver(newShiftScheduleSchema),
    defaultValues: defaultValues,
    mode: "onTouched",
  });

  // ۵. اثر جانبی برای پر کردن فرم پس از لود شدن داده‌ها
  useEffect(() => {
    if (initialSchedule && defaultValues) {
      reset(defaultValues);
    }
  }, [initialSchedule, defaultValues, reset]);

  // ۶. تابع onSubmit برای آپدیت
  const onSubmit: SubmitHandler<NewShiftScheduleFormData> = (data) => {
    if (!shiftScheduleId) return;

    const payload: ShiftScheduleUpdatePayload = {
      name: data.name,
      cycle_start_date: data.cycle_start_date,
    };

    mutate(
      { id: shiftScheduleId, payload },
      {
        onSuccess: () => {
          reset(data);
          if (onSuccess) onSuccess();
        },
        // ✅✅✅ اصلاح خطای ۳: تغییر تایپ error
        onError: (error: any) => {
          if (error.response?.status === 422) {
            const apiErrors = (error as AxiosError<ApiValidationError>).response
              ?.data.errors;
            if (apiErrors) {
              Object.entries(apiErrors).forEach(([field, messages]) => {
                // ✅✅✅ اصلاح خطای ۴: اطمینان از آرایه بودن پیام‌ها
                const fieldMessages = Array.isArray(messages)
                  ? messages
                  : [String(messages)];
                try {
                  setFormError(field as any, {
                    type: "server",
                    message: fieldMessages[0],
                  });
                } catch (e) {
                  console.error("Error setting form error:", field, e);
                }
              });
            }
          }
        },
      }
    );
  };

  // ۷. مدیریت خطاهای عمومی (بارگذاری و Mutation)
  // ✅✅✅ اصلاح خطای ۵: تغییر تایپ error
  const generalApiError =
    (loadError as any)?.message ||
    (mutationError && (mutationError as any).response?.status !== 422
      ? (mutationError as AxiosError<{ message: string }>)?.response?.data
          ?.message || "خطای ناشناخته در هنگام ویرایش رخ داد."
      : null);

  // ۸. بازگرداندن مقادیر و توابع
  return {
    initialSchedule,
    control,
    register,
    handleSubmit,
    formErrors,
    isPending: isPending,
    isLoadingInitialData,
    generalApiError,
    isDirty,
    onSubmit,
  };
};
