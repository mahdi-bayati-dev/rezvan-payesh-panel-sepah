import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

// ۱. تعریف اسکیمای یک اسلات در فرم
const slotSchema = z.object({
  // کامنت: روز در چرخه توسط هوک به صورت خودکار پر می‌شود
  day_in_cycle: z.number().int(),
  // کامنت: این همان چیزی است که کاربر انتخاب می‌کند (null یعنی روز استراحت)
  work_pattern_id: z.number().int().nullable(),
});

export const newShiftScheduleSchema = z
  .object({
    name: z
      .string()
      .min(1, "نام برنامه شیفتی الزامی است")
      .max(255, "نام برنامه طولانی است"),

    cycle_length_days: z
      .number()
      .refine((val) => !isNaN(val), {
        message: "طول چرخه الزامی است و باید عدد باشد.",
      })
      .int({ message: "طول چرخه باید عدد صحیح باشد." })
      .min(1, "طول چرخه باید حداقل ۱ روز باشد.")
      .max(31, "طول چرخه نباید بیشتر از ۳۱ روز باشد."),

    cycle_start_date: z
      .string()
      .min(1, "تاریخ شروع چرخه الزامی است.")
      .refine((val) => dateRegex.test(val), "فرمت تاریخ باید YYYY-MM-DD باشد."),

    // ۲. افزودن آرایه اسلات‌ها به اسکیمای اصلی
    // کامنت: این آرایه توسط useFieldArray مدیریت خواهد شد
    slots: z.array(slotSchema).optional(),
  })
  // ۳. اعتبارسنجی پیشرفته برای تطبیق تعداد اسلات‌ها با طول چرخه
  .superRefine((data, ctx) => {
    // کامنت: اگر اسلات‌ها وجود داشتند، تعداد آن‌ها باید با طول چرخه برابر باشد
    const targetLength = data.cycle_length_days;
    const slotsLength = data.slots?.length ?? 0;

    if (
      !isNaN(targetLength) &&
      targetLength > 0 &&
      slotsLength !== targetLength
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `تعداد اسلات‌ها (${slotsLength}) با طول چرخه (${targetLength}) مطابقت ندارد.`,
        path: ["cycle_length_days"], // خطا را روی فیلد طول چرخه نشان می‌دهیم
      });
    }
  });

export type NewShiftScheduleFormData = z.infer<typeof newShiftScheduleSchema>;
