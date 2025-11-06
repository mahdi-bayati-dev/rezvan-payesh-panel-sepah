import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateShiftSchedule } from "./hook"; // ✅ هوک Mutation برای شیفت
import { AxiosError } from "axios";
import { type ApiValidationError } from "@/features/work-pattern/types"; // ✅ استفاده از تایپ خطای موجود
import {
  type NewShiftScheduleFormData,
  newShiftScheduleSchema,
} from "../schema/NewShiftScheduleSchema";
import { type ShiftSchedulePayload } from "../types";

interface UseShiftScheduleFormProps {
  onSuccess?: () => void;
}

export const useShiftScheduleForm = ({
  onSuccess,
}: UseShiftScheduleFormProps) => {
  const { mutate, isPending, error: mutationError } = useCreateShiftSchedule();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors: formErrors },
    setError: setFormError,
  } = useForm<NewShiftScheduleFormData>({
    resolver: zodResolver(newShiftScheduleSchema),
    defaultValues: {
      name: "",
      cycle_length_days: 7,
      cycle_start_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    },
  });

  // تابع onSubmit
  const onSubmit: SubmitHandler<NewShiftScheduleFormData> = (data) => {
    const payload: ShiftSchedulePayload = {
      name: data.name,
      cycle_length_days: data.cycle_length_days,
      cycle_start_date: data.cycle_start_date,
      // کامنت: slots به صورت اختیاری فرستاده می‌شود. بک‌اند بقیه را null می‌گذارد
    };

    mutate(payload, {
      onSuccess,
      onError: (error) => {
        if (error.response?.status === 422) {
          const apiErrors = (error as AxiosError<ApiValidationError>).response
            ?.data.errors;
          if (apiErrors) {
            Object.entries(apiErrors).forEach(([field, messages]) => {
              try {
                setFormError(field as any, {
                  type: "server",
                  message: messages[0],
                });
              } catch (e) {
                console.error("Error setting form error:", field, e);
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
    onSubmit,
  };
};
