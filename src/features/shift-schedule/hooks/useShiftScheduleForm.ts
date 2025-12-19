import {
  useForm,
  type SubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateShiftSchedule } from "./useCreateShiftSchedule";
import { AxiosError } from "axios";
import { type ApiValidationError } from "@/features/work-pattern/types";
import {
  type NewShiftScheduleFormData,
  newShiftScheduleSchema,
} from "../schema/NewShiftScheduleSchema";
import {
  type ShiftSchedulePayload,
  type NewScheduleSlotPayload,
} from "../types";
import { useEffect } from "react";

interface UseShiftScheduleFormProps {
  onSuccess?: () => void;
}

const INITIAL_CYCLE_LENGTH = 7;

// تابع کمکی برای دریافت تاریخ امروز به صورت محلی (YYYY-MM-DD)
// برای جلوگیری از اختلاف ۳.۵ ساعته UTC
const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDefaultSlots = (length: number): NewScheduleSlotPayload[] => {
  return Array.from({ length }).map((_, i) => ({
    day_in_cycle: i + 1,
    is_off: false,
    name: "",
    start_time: "",
    end_time: "",
  }));
};

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
    resolver: zodResolver(newShiftScheduleSchema) as any,
    defaultValues: {
      name: "",
      cycle_length_days: INITIAL_CYCLE_LENGTH,
      // اصلاح شد: استفاده از تاریخ محلی به جای UTC ISO String
      cycle_start_date: getTodayLocalDate(),
      ignore_holidays: false,
      floating_start: 0,
      floating_end: 0,
      slots: createDefaultSlots(INITIAL_CYCLE_LENGTH),
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slots",
  });

  const cycleLength = useWatch({ control, name: "cycle_length_days" });

  useEffect(() => {
    const targetLength =
      isNaN(cycleLength) || cycleLength < 0
        ? 0
        : Math.min(Math.floor(cycleLength), 31);
    const currentLength = fields.length;

    if (currentLength < targetLength) {
      const toAdd = Array.from({ length: targetLength - currentLength }).map(
        (_, i) => ({
          day_in_cycle: currentLength + i + 1,
          is_off: false,
          name: "",
          start_time: "",
          end_time: "",
        })
      );

      append(toAdd);
    } else if (currentLength > targetLength) {
      const toRemove = Array.from({ length: currentLength - targetLength }).map(
        (_, i) => targetLength + i
      );
      remove(toRemove);
    }
  }, [cycleLength, fields.length, append, remove]);

  const onSubmit: SubmitHandler<NewShiftScheduleFormData> = (data) => {
    const cleanedSlots: NewScheduleSlotPayload[] = data.slots.map((slot) => ({
      day_in_cycle: slot.day_in_cycle,
      is_off: slot.is_off,
      name: slot.is_off ? null : slot.name || null,
      start_time: slot.is_off ? null : slot.start_time || null,
      end_time: slot.is_off ? null : slot.end_time || null,
    }));

    const payload: ShiftSchedulePayload = {
      name: data.name,
      cycle_length_days: data.cycle_length_days,
      cycle_start_date: data.cycle_start_date,
      ignore_holidays: data.ignore_holidays,
      floating_start: data.floating_start,
      floating_end: data.floating_end,
      slots: cleanedSlots,
    };

    mutate(payload, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
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
    fields,
  };
};
