import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// --- ۱. اسکیما برای یک اسلات تکی ---
const scheduleSlotSchema = z
  .object({
    day_in_cycle: z.number().int().min(1, "روز در چرخه الزامی است"),
    is_off: z.boolean(),
    name: z.string().nullable(),
    start_time: z.string().nullable(),
    end_time: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_off) {
      if (!data.name || data.name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "نام شیفت الزامی است",
          path: ["name"],
        });
      }
      if (!data.start_time || !timeRegex.test(data.start_time)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "زمان شروع نامعتبر",
          path: ["start_time"],
        });
      }
      if (!data.end_time || !timeRegex.test(data.end_time)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "زمان پایان نامعتبر",
          path: ["end_time"],
        });
      }
    }
  });

// --- ۲. اسکیمای اصلی فرم ایجاد برنامه شیفتی ---
export const newShiftScheduleSchema = z
  .object({
    name: z.string().min(1, "نام برنامه شیفتی الزامی است").max(255),
    cycle_length_days: z.number().int().min(1).max(31),
    cycle_start_date: z
      .string()
      .refine((val) => dateRegex.test(val), "فرمت تاریخ باید YYYY-MM-DD باشد."),
    ignore_holidays: z.boolean(),

    // ✅ فیلدهای جدید ساعات شناور
    floating_start: z.coerce
      .number({ message: "باید عدد باشد" })
      .min(0, "حداقل ۰")
      .max(240, "حداکثر ۲۴۰")
      .default(0),

    floating_end: z.coerce
      .number({ message: "باید عدد باشد" })
      .min(0, "حداقل ۰")
      .max(240, "حداکثر ۲۴۰")
      .default(0),

    slots: z.array(scheduleSlotSchema),
  })
  .superRefine((data, ctx) => {
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
        path: ["cycle_length_days"],
      });
    }
  });

export type NewShiftScheduleFormData = z.infer<typeof newShiftScheduleSchema>;
