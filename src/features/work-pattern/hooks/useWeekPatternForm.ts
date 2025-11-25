import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newWeekPatternSchema,
  type NewWeekPatternFormData,
} from "../schema/NewWeekPatternSchema";
import { useCreateWeekPattern } from "@/features/work-pattern/hooks/useCreateWeekPatternPost";
import { AxiosError } from "axios";
import type {
  ApiValidationError,
  WeekPatternPayload,
  DayPayload,
} from "../types/index";
import { daysOfWeek } from "../utils/constants";
import { useWeekPatternDayCalculations } from "./useWeekPatternDayCalculations";

interface UseWeekPatternFormProps {
  onSuccess?: () => void;
}

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
    // ✅ استفاده از as any
    resolver: zodResolver(newWeekPatternSchema) as any,
    defaultValues: {
      name: "",
      floating_start: 0,
      floating_end: 0,
      days: daysOfWeek.map((_, index) => ({
        day_of_week: index,
        is_working_day: index < 5,
        start_time: index < 5 ? "08:00" : null,
        end_time: index < 5 ? "16:00" : null,
        work_duration_minutes: index < 5 ? 480 : 0,
      })),
    },
    mode: "onTouched",
  });

  const { fields } = useFieldArray({ control, name: "days" });
  useWeekPatternDayCalculations(watch, setValue);

  const onSubmit: SubmitHandler<NewWeekPatternFormData> = (data) => {
    const payload: WeekPatternPayload = {
      name: data.name,
      floating_start: data.floating_start,
      floating_end: data.floating_end,
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

  return {
    control,
    register,
    handleSubmit,
    formErrors,
    isPending,
    generalApiError,
    fields,
    watchedDays: watch("days"),
    onSubmit,
  };
};
