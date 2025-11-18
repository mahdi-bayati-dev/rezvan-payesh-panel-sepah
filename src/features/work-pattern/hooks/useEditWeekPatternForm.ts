// work-pattern/hooks/useEditWeekPatternForm.ts

import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
// import { useLocation } from "react-router-dom";
import { useUpdateWeekPattern } from "@/features/work-pattern/hooks/useUpdateWeekPattern";
import { useWeekPatternDetails } from "@/features/work-pattern/hooks/useWeekPatternDetails";
import {
  newWeekPatternSchema,
  type NewWeekPatternFormData,
} from "../schema/NewWeekPatternSchema";
import { daysOfWeek } from "../utils/constants";
import { useWeekPatternDayCalculations } from "./useWeekPatternDayCalculations";
import type {
  WeekPatternPayload,
  ApiValidationError,
  DailyScheduleUI,
} from "../types";
import { AxiosError } from "axios";
// import { toast } from "react-toastify";

interface UseEditWeekPatternFormProps {
  patternId: number | string;
  onSuccess?: () => void;
}

// کامنت: تابع تبدیل داده UI به فرمت RHF برای پر کردن فرم
const transformUiToForm = (
  patternUi: DailyScheduleUI[]
): NewWeekPatternFormData["days"] => {
  return daysOfWeek.map((_, index) => {
    const dayData = patternUi.find((d) => d.dayIndex === index);
    if (!dayData) {
      // کامنت: اگر داده‌ای نبود، مقدار پیش‌فرض را می‌دهیم
      return {
        day_of_week: index,
        is_working_day: false,
        start_time: null,
        end_time: null,
        work_duration_minutes: 0,
      };
    }

    return {
      day_of_week: index,
      is_working_day: dayData.is_working_day,
      start_time: dayData.is_working_day ? dayData.start_time : null,
      end_time: dayData.is_working_day ? dayData.end_time : null,
      // کامنت: اطمینان حاصل می‌کنیم که duration همیشه عدد باشد (برای RHF)
      work_duration_minutes: dayData.work_duration_minutes,
    };
  });
};

export const useEditWeekPatternForm = ({
  patternId,
  onSuccess,
}: UseEditWeekPatternFormProps) => {
  // کامنت: ۱. لود کردن داده‌های موجود
  const {
    data: initialPattern,
    isLoading: isLoadingInitialData,
    isError: isLoadError,
  } = useWeekPatternDetails(patternId);

  const { mutate, isPending, error: mutationError } = useUpdateWeekPattern();

  // کامنت: مقادیر پیش‌فرض برای RHF (فقط برای زمانی که داده‌ها لود شدند)
  const defaultValues = useMemo(() => {
    if (initialPattern) {
      return {
        name: initialPattern.name,
        // ✅ اصلاح خطا: ارسال آرایه خالی در صورت undefined بودن
        days: transformUiToForm(initialPattern.daily_schedules || []),
      };
    }
    return undefined; // RHF منتظر می‌ماند
  }, [initialPattern]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors: formErrors, isDirty },
    setError: setFormError,
  } = useForm<NewWeekPatternFormData>({
    resolver: zodResolver(newWeekPatternSchema),
    defaultValues: defaultValues,
    // mode: "onTouched",
  });

  const { fields } = useFieldArray({ control, name: "days" });
  // const watchedDays = watch("days");
  useWeekPatternDayCalculations(watch, setValue);

  // کامنت: اثر جانبی برای پر کردن فرم پس از لود شدن داده‌ها
  useEffect(() => {
    if (initialPattern && defaultValues) {
      reset(defaultValues);
    }
  }, [initialPattern, defaultValues, reset]);

  // کامنت: منطق مدیریت is_working_day و محاسبه مدت زمان (کاملاً مشابه useWeekPatternForm)
  // useEffect(() => {
  //   watchedDays?.forEach((day, index) => {
  //     const isWorking = day.is_working_day;
  //     // منطق کنترل روز کاری خاموش
  //     if (!isWorking) {
  //       setValue(`days.${index}.start_time`, null, { shouldDirty: true });
  //       setValue(`days.${index}.end_time`, null, { shouldDirty: true });
  //       setValue(`days.${index}.work_duration_minutes`, 0, {
  //         shouldValidate: true,
  //         shouldDirty: true,
  //       });
  //     } else {
  //       // منطق محاسبه مدت زمان برای روز کاری روشن
  //       const start = day.start_time ?? "08:00";
  //       const end = day.end_time ?? "16:00";
  //       const duration = calculateDurationInMinutes(start, end);

  //       // فقط در صورتی که زمان‌ها معتبر بودند، مقدار دهی کنیم
  //       if (duration !== null && duration !== day.work_duration_minutes) {
  //         setValue(`days.${index}.work_duration_minutes`, duration, {
  //           shouldValidate: true,
  //           shouldDirty: true,
  //         });
  //       }
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   watchedDays
  //     ?.map((d) => `${d.start_time}-${d.end_time}-${d.is_working_day}`)
  //     .join(","),
  //   setValue,
  // ]);

  // کامنت: تابع onSubmit برای آپدیت
  const onSubmit: SubmitHandler<NewWeekPatternFormData> = (data) => {
    const payload: WeekPatternPayload = {
      name: data.name,
      days: data.days.map((day): WeekPatternPayload["days"][number] => ({
        day_of_week: day.day_of_week,
        is_working_day: day.is_working_day,
        start_time: day.is_working_day ? day.start_time : null,
        end_time: day.is_working_day ? day.end_time : null,
        // کامنت: work_duration_minutes باید عدد یا null باشد
        work_duration_minutes: day.is_working_day
          ? day.work_duration_minutes ?? null
          : 0,
      })),
    };

    mutate(
      { id: patternId, payload },
      {
        onSuccess,
        onError: (error) => {
          if (error.response?.status === 422) {
            const apiErrors = (error as AxiosError<ApiValidationError>).response
              ?.data.errors;
            if (apiErrors) {
              // کامنت: مدیریت خطاهای ولیدیشن API و مپ کردن به فیلدهای فرم
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
      }
    );
  };

  // کامنت: مدیریت خطاهای API غیر 422
  const generalApiError =
    mutationError && mutationError.response?.status !== 422
      ? (mutationError as AxiosError<{ message: string }>)?.response?.data
          ?.message || "خطای ناشناخته ای رخ داد."
      : null;

  return {
    // فیلدهای مشترک
    control,
    register,
    handleSubmit,
    formErrors,
    fields,
    watchedDays: watch("days"),
    onSubmit,
    isPending: isPending || isLoadingInitialData,
    generalApiError: isLoadError
      ? "خطا در بارگذاری الگوی کاری مورد نظر"
      : generalApiError,
    isInitialLoading: isLoadingInitialData,
    isDirty,
    reset,
  };
};
