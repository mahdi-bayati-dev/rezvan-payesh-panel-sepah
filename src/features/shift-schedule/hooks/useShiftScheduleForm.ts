import {
  useForm,
  type SubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// ✅✅✅ اصلاح: ایمپورت هوک useCreateShiftSchedule از فایل خودش
import { useCreateShiftSchedule } from "./useCreateShiftSchedule";
import { AxiosError } from "axios";
// ✅✅✅ اصلاح: ایمپورت ApiValidationError از ماژول work-pattern
import { type ApiValidationError } from "@/features/work-pattern/types";
import {
  type NewShiftScheduleFormData,
  newShiftScheduleSchema,
} from "../schema/NewShiftScheduleSchema";
// ✅✅✅ اصلاح: ایمپورت تایپ‌های Payload از فایل types
import {
  type ShiftSchedulePayload,
  type NewScheduleSlotPayload,
} from "../types";
import { useEffect } from "react";

interface UseShiftScheduleFormProps {
  onSuccess?: () => void;
}

// --- ✅✅✅ راه‌حل باگ: بخش ۱ - ایجاد مقادیر پیش‌فرض سازگار ---
// ما مقدار پیش‌فرض طول چرخه را اینجا تعریف می‌کنیم
const INITIAL_CYCLE_LENGTH = 7;

// و بر اساس آن، اسلات‌های پیش‌فرض را *قبل* از فراخوانی useForm می‌سازیم
const createDefaultSlots = (length: number): NewScheduleSlotPayload[] => {
  const slots: NewScheduleSlotPayload[] = [];
  for (let i = 0; i < length; i++) {
    slots.push({
      day_in_cycle: i + 1,
      is_off: false,
      name: "",
      start_time: "",
      end_time: "",
    });
  }
  return slots;
};
// --- پایان بخش ۱ ---

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
    // setValue, // (این دیگر نیاز نیست چون در useEffect استفاده نمی‌شود)
  } = useForm<NewShiftScheduleFormData>({
    resolver: zodResolver(newShiftScheduleSchema),
    // --- ✅✅✅ راه‌حل باگ: بخش ۲ - استفاده از مقادیر پیش‌فرض سازگار ---
    defaultValues: {
      name: "",
      cycle_length_days: INITIAL_CYCLE_LENGTH, // استفاده از متغیر (7)
      cycle_start_date: new Date().toISOString().slice(0, 10), // تاریخ امروز
      ignore_holidays: false, // ✅ مقدار پیش‌فرض برای فیلد جدید
      slots: createDefaultSlots(INITIAL_CYCLE_LENGTH), // استفاده از آرایه پیش‌فرض (شامل 7 آیتم)
    },
    // mode: "onTouched" // فعال کردن این حالت می‌تواند به تجربه کاربری کمک کند
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "slots",
  });

  // مانیتور کردن مقدار cycle_length_days
  const cycleLength = useWatch({
    control,
    name: "cycle_length_days",
  });

  // ✅✅✅ منطق کلیدی: همگام‌سازی تعداد اسلات‌ها با cycleLength
  useEffect(() => {
    // در لود اولیه:
    // cycleLength برابر 7 است (از defaultValues)
    // fields.length برابر 7 است (از defaultValues)
    // بنابراین هیچکدام از if/else if ها اجرا نمی‌شود، که عالی است.

    // اطمینان از اینکه طول چرخه یک عدد معتبر بین ۰ تا ۳۱ است
    const targetLength =
      isNaN(cycleLength) || cycleLength < 0
        ? 0
        : Math.min(Math.floor(cycleLength), 31); // سقف ۳۱ روزه API

    const currentLength = fields.length;

    if (currentLength < targetLength) {
      // اگر طول چرخه زیاد شد، اسلات‌های جدید اضافه کن
      const toAdd: NewScheduleSlotPayload[] = [];
      for (let i = currentLength; i < targetLength; i++) {
        // ✅ مطابقت با درخواست جدید:
        // اسلات‌های جدید هم به صورت پیش‌فرض "کاری" هستند (is_off: false)
        toAdd.push({
          day_in_cycle: i + 1, // شماره روز از ۱ شروع می‌شود
          is_off: false, // ✅ پیش‌فرض: روز کاری (تیک Off ندارد)
          name: "", // رشته خالی برای ورود اطلاعات
          start_time: "",
          end_time: "",
        });
      }
      append(toAdd);
    } else if (currentLength > targetLength) {
      // اگر طول چرخه کم شد، اسلات‌های اضافی را حذف کن
      const toRemove: number[] = [];
      for (let i = targetLength; i < currentLength; i++) {
        toRemove.push(i);
      }
      remove(toRemove); // حذف ایندکس‌های اضافی
    }
  }, [cycleLength, fields.length, append, remove]); // وابستگی‌ها صحیح هستند

  const onSubmit: SubmitHandler<NewShiftScheduleFormData> = (data) => {
    // ✅✅✅ اصلاح کلیدی (منطق هوشمند "پیدا کن یا بساز" بخش ۱.۲)
    // مستندات می‌گوید ما *باید* name, start_time, end_time را بفرستیم.
    // اما اگر is_off=true باشد، این فیلدها باید null باشند.
    const cleanedSlots: NewScheduleSlotPayload[] = data.slots.map((slot) => {
      if (slot.is_off) {
        return {
          day_in_cycle: slot.day_in_cycle,
          is_off: true,
          name: null,
          start_time: null,
          end_time: null,
        };
      }
      // اگر روز کاری است، تمام مقادیر را ارسال کن
      return {
        day_in_cycle: slot.day_in_cycle,
        is_off: false,
        name: slot.name, // این مقادیر توسط Zod اعتبارسنجی شده‌اند
        start_time: slot.start_time,
        end_time: slot.end_time,
      };
    });

    // ساخت Payload نهایی مطابق با مستندات (بخش ۱.۲)
    const payload: ShiftSchedulePayload = {
      name: data.name,
      cycle_length_days: data.cycle_length_days,
      cycle_start_date: data.cycle_start_date,
      ignore_holidays: data.ignore_holidays, // ✅ ارسال فیلد جدید
      slots: cleanedSlots, // ارسال اسلات‌های پاکسازی شده
    };
    console.log("✅ Payload ارسالی به سرور (Request):", payload);

    mutate(payload, {
      onSuccess: () => {
        // در صورت موفقیت، فرم ریست نمی‌شود (چون کاربر ممکن است بخواهد برنامه دیگری بسازد)
        // اما onSuccess بیرونی (مثلاً بستن مودال) فراخوانی می‌شود.
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        // مدیریت خطاهای اعتبارسنجی 422 از سمت سرور
        if (error.response?.status === 422) {
          const apiErrors = (error as AxiosError<ApiValidationError>).response
            ?.data.errors;
          if (apiErrors) {
            Object.entries(apiErrors).forEach(([field, messages]) => {
              try {
                // خطایابی برای فیلدهای تودرتو مثل 'slots.0.name'
                setFormError(field as any, {
                  type: "server",
                  message: messages[0],
                });
              } catch (e) {
                // اگر فیلد در فرم وجود نداشت (مثلاً خطای عمومی)
                console.error("Error setting form error:", field, e);
              }
            });
          }
        }
      },
    });
  };

  // مدیریت خطاهای عمومی (غیر از 422)
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
    fields, // اسلات‌های داینامیک برای رندر
    // setValue, // (این دیگر نیاز نیست)
  };
};
