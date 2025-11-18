import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useEffect } from "react";
// کامنت: مسیرها به نسبی (relative) تغییر کردند تا خطای alias@ برطرف شود
import {
  newWeekPatternSchema,
  type NewWeekPatternFormData,
} from "../schema/NewWeekPatternSchema";
import { useCreateWeekPattern } from "@/features/work-pattern/hooks/useCreateWeekPatternPost"; // این ایمپورت چون از خارج است، با @ باقی می‌ماند
import { AxiosError } from "axios";
import type {
  ApiValidationError,
  WeekPatternPayload,
  DayPayload,
} from "../types/index";
import { daysOfWeek } from "../utils/constants";

// ✅ ۱. ایمپورت هوک محاسباتی جدید
import { useWeekPatternDayCalculations } from "./useWeekPatternDayCalculations";

interface UseWeekPatternFormProps {
  onSuccess?: () => void;
}

// کامنت: تمام منطق فرم به این هوک منتقل شده است.
// کامپوننت اصلی فقط این هوک را فراخوانی می‌کند.
export const useWeekPatternForm = ({ onSuccess }: UseWeekPatternFormProps) => {
  const { mutate, isPending, error: mutationError } = useCreateWeekPattern();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
    setError: setFormError,
  } = useForm<NewWeekPatternFormData>({
    resolver: zodResolver(newWeekPatternSchema),
    defaultValues: {
      name: "",
      days: daysOfWeek.map((_, index) => ({
        day_of_week: index,
        is_working_day: index < 5,
        start_time: index < 5 ? "08:00" : null,
        end_time: index < 5 ? "16:00" : null,
        work_duration_minutes: index < 5 ? 480 : 0,
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "days" });
  // const watchedDays = watch('days');
  useWeekPatternDayCalculations(watch, setValue);

  // کامنت: این useEffect مسئول مدیریت تیک "روز کاری" است
  // useEffect(() => {
  //     watchedDays.forEach((day, index) => {
  //         const isWorking = day.is_working_day;

  //         if (!isWorking) {
  //             setValue(`days.${index}.start_time`, null, { shouldDirty: true });
  //             setValue(`days.${index}.end_time`, null, { shouldDirty: true });
  //             setValue(`days.${index}.work_duration_minutes`, 0, { shouldValidate: true, shouldDirty: true });
  //         } else {
  //             const start = day.start_time ?? "08:00";
  //             const end = day.end_time ?? "16:00";
  //             const duration = calculateDurationInMinutes(start, end);
  //             setValue(`days.${index}.start_time`, start);
  //             setValue(`days.${index}.end_time`, end);
  //             setValue(`days.${index}.work_duration_minutes`, duration ?? 480, { shouldValidate: true });
  //         }
  //     });
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [watchedDays.map((d) => d.is_working_day).join(","), setValue]);

  // // کامنت: این useEffect مسئول محاسبه خودکار مدت زمان است
  // useEffect(() => {
  //     watchedDays.forEach((day, index) => {
  //         if (!day.is_working_day) return;

  //         const start = day.start_time;
  //         const end = day.end_time;

  //         if (start && end) {
  //             const duration = calculateDurationInMinutes(start, end);
  //             if (duration !== null && duration !== day.work_duration_minutes) {
  //                 setValue(`days.${index}.work_duration_minutes`, duration, { shouldValidate: true, shouldDirty: true });
  //             }
  //         } else {
  //             if (day.work_duration_minutes !== 0) {
  //                 setValue(`days.${index}.work_duration_minutes`, 0, { shouldValidate: true, shouldDirty: true });
  //             }
  //         }
  //     });
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [watchedDays.map((d) => `${d.start_time}-${d.end_time}-${d.is_working_day}`).join(","), setValue]);

  // کامنت: تابع onSubmit هم در هوک قرار می‌گیرد
  const onSubmit: SubmitHandler<NewWeekPatternFormData> = (data) => {
    const payload: WeekPatternPayload = {
      name: data.name,
      days: data.days.map(
        (day): DayPayload => ({
          day_of_week: day.day_of_week,
          is_working_day: day.is_working_day,
          start_time: day.is_working_day ? day.start_time : null,
          end_time: day.is_working_day ? day.end_time : null,
          work_duration_minutes: day.is_working_day
            ? day.work_duration_minutes ?? null
            : 0,
        })
      ),
    };

    mutate(payload, {
      onSuccess,
      onError: (error) => {
        if (error.response?.status === 422) {
          const apiErrors = (error as AxiosError<ApiValidationError>).response
            ?.data.errors;
          if (apiErrors) {
            Object.entries(apiErrors).forEach(([field, messages]) => {
              const fieldName = field.replace(/\.(\d+)\./, `.$1.`);
              try {
                setFormError(fieldName as any, {
                  type: "server",
                  message: messages[0],
                });
              } catch (e) {
                console.error("Error setting form error:", fieldName, e);
              }
            });
          }
        }
      },
    });
  };

  const generalApiError =
    mutationError && mutationError.response?.status !== 422
      ? (mutationError as AxiosError<{ message: string }>)?.response?.data
          ?.message || "خطای ناشناخته ای رخ داد."
      : null;

  // کامنت: هوک تمام مقادیر و توابع مورد نیاز کامپوننت UI را بازمی‌گرداند
  return {
    control,
    register,
    handleSubmit,
    formErrors,
    isPending,
    generalApiError,
    fields,
    // watchedDays,
    watchedDays: watch("days"),
    onSubmit,
  };
};
