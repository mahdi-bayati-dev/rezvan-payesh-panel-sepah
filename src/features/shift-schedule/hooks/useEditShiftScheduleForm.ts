import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useShiftSchedule, useUpdateShiftSchedule } from "./hook";
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

export const useEditShiftScheduleForm = ({
  shiftScheduleId,
  onSuccess,
}: UseEditShiftScheduleFormProps) => {
  const {
    data: initialSchedule,
    isLoading: isLoadingInitialData,
    error: loadError,
  } = useShiftSchedule(shiftScheduleId ?? 0);
  const { mutate, isPending, error: mutationError } = useUpdateShiftSchedule();

  const defaultValues = useMemo<EditShiftScheduleFormData>(() => {
    if (initialSchedule) {
      return {
        name: initialSchedule.name,
        cycle_start_date: initialSchedule.cycle_start_date,
        floating_start: initialSchedule.floating_start ?? 0,
        floating_end: initialSchedule.floating_end ?? 0,
      };
    }
    return {
      name: "",
      cycle_start_date: "",
      floating_start: 0,
      floating_end: 0,
    };
  }, [initialSchedule]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isDirty },
    setError: setFormError,
  } = useForm<EditShiftScheduleFormData>({
    // ✅ استفاده از as any برای دور زدن خطای تطابق دقیق Zod Resolver با Generics
    // این کار در بیلد مشکلی ایجاد نمی‌کند و runtime درست کار می‌کند
    resolver: zodResolver(editShiftScheduleSchema) as any,
    defaultValues: defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialSchedule) {
      reset({
        name: initialSchedule.name,
        cycle_start_date: initialSchedule.cycle_start_date,
        floating_start: initialSchedule.floating_start ?? 0,
        floating_end: initialSchedule.floating_end ?? 0,
      });
    }
  }, [initialSchedule, reset]);

  const onSubmit: SubmitHandler<EditShiftScheduleFormData> = (data) => {
    if (!shiftScheduleId) return;

    const payload: ShiftScheduleUpdatePayload = {
      name: data.name,
      cycle_start_date: data.cycle_start_date,
      floating_start: data.floating_start,
      floating_end: data.floating_end,
    };

    mutate(
      { id: shiftScheduleId, payload },
      {
        onSuccess: (updatedData) => {
          reset({
            name: updatedData.name,
            cycle_start_date: updatedData.cycle_start_date,
            floating_start: updatedData.floating_start,
            floating_end: updatedData.floating_end,
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

  const generalApiError =
    (loadError as any)?.message ||
    (mutationError && (mutationError as any).response?.status !== 422
      ? (mutationError as AxiosError<{ message: string }>)?.response?.data
          ?.message || "خطای ناشناخته در هنگام ویرایش رخ داد."
      : null);

  return {
    initialSchedule,
    control,
    register,
    handleSubmit,
    formErrors,
    isPending,
    isLoadingInitialData,
    generalApiError,
    isDirty,
    onSubmit,
  };
};
