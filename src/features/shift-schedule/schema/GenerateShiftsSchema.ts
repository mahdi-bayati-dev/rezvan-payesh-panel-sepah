import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * اسکیمای اعتبارسنجی فرم تولید شیفت‌ها
 */
export const generateShiftsSchema = z
  .object({
    start_date: z
      .string()
      .min(1, "تاریخ شروع الزامی است.")
      .refine((val) => dateRegex.test(val), "فرمت تاریخ باید YYYY-MM-DD باشد."),

    end_date: z
      .string()
      .min(1, "تاریخ پایان الزامی است.")
      .refine((val) => dateRegex.test(val), "فرمت تاریخ باید YYYY-MM-DD باشد."),
  })
  .superRefine((data, ctx) => {
    // نکته مهم: برای جلوگیری از باگ ۳.۵ ساعته UTC، از مقایسه مستقیم رشته‌ها استفاده می‌کنیم.
    // در JS، مقدار new Date("2023-10-20") برابر با ساعت 00:00 UTC است که در تهران 03:30 صبح محسوب می‌شود.
    if (data.end_date && data.start_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "تاریخ پایان باید بعد یا مساوی تاریخ شروع باشد.",
        path: ["end_date"],
      });
    }
  });

export type GenerateShiftsFormData = z.infer<typeof generateShiftsSchema>;
