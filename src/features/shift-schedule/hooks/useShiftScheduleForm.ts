import {
  useForm,
  type SubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form"; // ۱. ایمپورت‌های لازم
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateShiftSchedule } from "./hook";
import { AxiosError } from "axios";
import { type ApiValidationError } from "@/features/work-pattern/types";
import {
  type NewShiftScheduleFormData,
  newShiftScheduleSchema,
} from "../schema/NewShiftScheduleSchema";
import { type ShiftSchedulePayload } from "../types";
import { useEffect } from "react"; // ۲. ایمپورت useEffect

interface UseShiftScheduleFormProps {
  onSuccess?: () => void;
}

export const useShiftScheduleForm = ({
  onSuccess,
}: UseShiftScheduleFormProps) => {
  const { mutate, isPending, error: mutationError } = useCreateShiftSchedule();

  const {
    register,
    control, // ۳. control را برای useFieldArray و useWatch نیاز داریم
    handleSubmit,
    formState: { errors: formErrors },
    setError: setFormError,
  } = useForm<NewShiftScheduleFormData>({
    resolver: zodResolver(newShiftScheduleSchema),
    defaultValues: {
      name: "",
      cycle_length_days: 7, // مقدار پیش‌فرض
      cycle_start_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      slots: [], // ۴. مقدار پیش‌فرض برای اسلات‌ها
    },
  });

  // ۵. راه‌اندازی useFieldArray برای مدیریت اسلات‌های داینامیک
  const { fields, append, remove } = useFieldArray({
    control,
    name: "slots",
  });

  // ۶. مشاهده‌ی زنده‌ی مقدار cycle_length_days
  const cycleLength = useWatch({
    control,
    name: "cycle_length_days",
  });

  // ۷. افکت جانبی (Side Effect) برای همگام‌سازی تعداد اسلات‌ها با cycleLength
  useEffect(() => {
    // کامنت: اطمینان از اینکه طول چرخه یک عدد معتبر و در محدوده است
    const targetLength =
      isNaN(cycleLength) || cycleLength < 0
        ? 0
        : Math.min(Math.floor(cycleLength), 31); // سقف ۳۱ روز طبق اسکیما

    const currentLength = fields.length;

    if (currentLength < targetLength) {
      // کامنت: اگر تعداد روزها زیاد شد، اسلات‌های جدید اضافه کن
      const toAdd = [];
      for (let i = currentLength; i < targetLength; i++) {
        toAdd.push({
          day_in_cycle: i + 1, // روز ۱، ۲، ۳...
          work_pattern_id: null, // پیش‌فرض: روز استراحت
        });
      }
      append(toAdd);
    } else if (currentLength > targetLength) {
      // کامنت: اگر تعداد روزها کم شد، اسلات‌های اضافی را حذف کن
      // remove() آرایه‌ای از ایندکس‌ها را می‌پذیرد
      const toRemove = [];
      for (let i = targetLength; i < currentLength; i++) {
        toRemove.push(i);
      }
      remove(toRemove);
    }
  }, [cycleLength, fields.length, append, remove]);

  // ۸. تابع onSubmit حالا data.slots را هم شامل می‌شود
  const onSubmit: SubmitHandler<NewShiftScheduleFormData> = (data) => {
    const payload: ShiftSchedulePayload = {
      name: data.name,
      cycle_length_days: data.cycle_length_days,
      cycle_start_date: data.cycle_start_date,
      // ۹. کلیدی: ارسال آرایه اسلات‌ها به API
      // کامنت: Zod و RHF قبلاً اطمینان حاصل کرده‌اند که data.slots معتبر است
      slots: data.slots,
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
                // کامنت: مدیریت خطاهای ولیدیشن (مثلاً برای slots.0.work_pattern_id)
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

  // ۱۰. بازگرداندن control و fields برای استفاده در کامپوننت
  return {
    control,
    register,
    handleSubmit,
    formErrors,
    isPending,
    generalApiError,
    onSubmit,
    fields, // <- این را برای رندر کردن ردیف‌ها بازمی‌گردانیم
  };
};
