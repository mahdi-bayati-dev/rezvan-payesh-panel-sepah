import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
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

interface UseEditWeekPatternFormProps {
  patternId: number | string;
  onSuccess?: () => void;
}

const transformUiToForm = (
  patternUi: DailyScheduleUI[]
): NewWeekPatternFormData["days"] => {
  return daysOfWeek.map((_, index) => {
    const dayData = patternUi.find((d) => d.dayIndex === index);
    if (!dayData) {
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
      work_duration_minutes: dayData.work_duration_minutes,
    };
  });
};

export const useEditWeekPatternForm = ({
  patternId,
  onSuccess,
}: UseEditWeekPatternFormProps) => {
  const {
    data: initialPattern,
    isLoading: isLoadingInitialData,
    isError: isLoadError,
  } = useWeekPatternDetails(patternId);
  const { mutate, isPending, error: mutationError } = useUpdateWeekPattern();

  const defaultValues = useMemo<NewWeekPatternFormData | undefined>(() => {
    if (initialPattern) {
      return {
        name: initialPattern.name,
        floating_start: initialPattern.floating_start ?? 0,
        floating_end: initialPattern.floating_end ?? 0,
        days: transformUiToForm(initialPattern.daily_schedules || []),
      };
    }
    return undefined;
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
    // ✅ استفاده از as any
    resolver: zodResolver(newWeekPatternSchema) as any,
    defaultValues: defaultValues,
    mode: "onTouched",
  });

  const { fields } = useFieldArray({ control, name: "days" });
  useWeekPatternDayCalculations(watch, setValue);

  useEffect(() => {
    if (initialPattern && defaultValues) {
      reset(defaultValues);
    }
  }, [initialPattern, defaultValues, reset]);

  const onSubmit: SubmitHandler<NewWeekPatternFormData> = (data) => {
    const payload: WeekPatternPayload = {
      name: data.name,
      floating_start: data.floating_start,
      floating_end: data.floating_end,
      days: data.days.map((day): WeekPatternPayload["days"][number] => ({
        day_of_week: day.day_of_week,
        is_working_day: day.is_working_day,
        start_time: day.is_working_day ? day.start_time : null,
        end_time: day.is_working_day ? day.end_time : null,
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

  const generalApiError =
    mutationError && mutationError.response?.status !== 422
      ? (mutationError as AxiosError<{ message: string }>)?.response?.data
          ?.message || "خطای ناشناخته ای رخ داد."
      : null;

  return {
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
