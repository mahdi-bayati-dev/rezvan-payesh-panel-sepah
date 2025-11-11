import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
// ✅✅✅ اصلاح: ایمپورت هوک‌ها از فایل hook.ts
import { useShiftSchedule, useUpdateShiftSchedule } from "./hook";
// ✅✅✅ اصلاح: ایمپورت اسکیمای *جدید* ویرایش
import {
  editShiftScheduleSchema,
  type EditShiftScheduleFormData,
} from "../schema/EditShiftScheduleSchema";
import type { ShiftScheduleUpdatePayload } from "../types/index";
import type { ApiValidationError } from "@/features/work-pattern/types/index";
import { AxiosError } from "axios";

interface UseEditShiftScheduleFormProps {
  shiftScheduleId: number | string | null;
  onSuccess?: () => void;
}

/**
 * هوک مدیریت منطق فرم ویرایش برنامه شیفتی (فقط نام و تاریخ شروع - بخش ۱.۴ مستندات)
 */
export const useEditShiftScheduleForm = ({
  shiftScheduleId,
  onSuccess,
}: UseEditShiftScheduleFormProps) => {
  // ۱. فچ کردن جزئیات شیفت برنامه (شامل اسلات‌ها)
  const {
    data: initialSchedule,
    isLoading: isLoadingInitialData,
    error: loadError, // خطای مربوط به لود شدن
  } = useShiftSchedule(shiftScheduleId ?? 0);

  // ۲. هوک Mutation برای آپدیت (بخش ۱.۴)
  const { mutate, isPending, error: mutationError } = useUpdateShiftSchedule();

  // ۳. آماده‌سازی مقادیر پیش‌فرض برای فرم
  // ✅✅✅ اصلاح: این مقادیر فقط برای فرم اطلاعات عمومی (بخش ۱.۴) هستند
  const defaultValues = useMemo(() => {
    if (initialSchedule) {
      return {
        name: initialSchedule.name,
        cycle_start_date: initialSchedule.cycle_start_date,
      };
    }
    // اگر هنوز لود نشده، مقادیر پیش‌فرض
    return {
      name: "",
      cycle_start_date: "",
    };
  }, [initialSchedule]);

  // ۴. راه‌اندازی React Hook Form
  // ✅✅✅ اصلاح: استفاده از اسکیمای جدید و تایپ جدید
  const {
    register,
    control, // ✅✅✅ اصلاح: control اضافه شد
    handleSubmit,
    reset,
    formState: { errors: formErrors, isDirty },
    setError: setFormError,
  } = useForm<EditShiftScheduleFormData>({
    // ✅ تایپ فرم اصلاح شد
    resolver: zodResolver(editShiftScheduleSchema), // ✅ اسکیمای ویرایش
    defaultValues: defaultValues,
    mode: "onTouched",
  });

  // ۵. اثر جانبی برای پر کردن فرم پس از لود شدن داده‌ها
  useEffect(() => {
    if (initialSchedule) {
      // ✅✅✅ اصلاح: ریست کردن فقط فیلدهای موجود در فرم ویرایش
      reset({
        name: initialSchedule.name,
        cycle_start_date: initialSchedule.cycle_start_date,
      });
    }
  }, [initialSchedule, reset]);

  // ۶. تابع onSubmit برای آپدیت (بخش ۱.۴)
  // ✅✅✅ اصلاح: پارامتر data حالا تایپ صحیح EditShiftScheduleFormData را دارد
  const onSubmit: SubmitHandler<EditShiftScheduleFormData> = (data) => {
    if (!shiftScheduleId) return;

    // ✅ Payload اکنون مستقیماً همان data است (چون Zod schema مطابقت دارد)
    const payload: ShiftScheduleUpdatePayload = {
      name: data.name,
      cycle_start_date: data.cycle_start_date,
    };

    mutate(
      { id: shiftScheduleId, payload },
      {
        onSuccess: (updatedData) => {
          // پس از موفقیت، فرم را با داده‌های *جدید* ریست می‌کنیم
          reset({
            name: updatedData.name,
            cycle_start_date: updatedData.cycle_start_date,
          });
          if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
          if (error.response?.status === 422) {
            const apiErrors = (error as AxiosError<ApiValidationError>).response
              ?.data.errors;
            if (apiErrors) {
              Object.entries(apiErrors).forEach(([field, messages]) => {
                const fieldMessages = Array.isArray(messages)
                  ? messages
                  : [String(messages)];
                try {
                  // ✅ تایپ any چون field می‌تواند 'name' یا 'cycle_start_date' باشد
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

  // ۷. مدیریت خطاهای عمومی (هم بارگذاری و هم Mutation)
  const generalApiError =
    (loadError as any)?.message || // خطای بارگذاری
    (mutationError && (mutationError as any).response?.status !== 422
      ? (mutationError as AxiosError<{ message: string }>)?.response?.data
          ?.message || "خطای ناشناخته در هنگام ویرایش رخ داد."
      : null);

  // ۸. بازگرداندن مقادیر و توابع
  return {
    initialSchedule, // داده‌های کامل برنامه (شامل اسلات‌ها)
    control, // ✅✅✅ اصلاح: control اکنون بازگردانده می‌شود
    register, // (برای فیلدهای نام و تاریخ)
    handleSubmit,
    formErrors, // (خطاهای فیلدهای نام و تاریخ)
    isPending: isPending, // آیا فرم اطلاعات عمومی در حال ذخیره است؟
    isLoadingInitialData, // آیا کل صفحه در حال لود است؟
    generalApiError, // خطای عمومی
    isDirty, // آیا فرم اطلاعات عمومی تغییر کرده؟
    onSubmit, // تابع سابمیت فرم اطلاعات عمومی
  };
};
