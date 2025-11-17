import { z } from "zod";

// Regex برای فرمت YYYY-MM-DD
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
    // اعتبارسنجی cross-field برای after_or_equal
    // این کد تنها در صورتی اجرا می‌شود که هر دو فیلد فرمت درستی داشته باشند
    
    try {
      // استفاده از getTime() برای مقایسه دقیق تاریخ‌ها
      const startTime = new Date(data.start_date).getTime();
      const endTime = new Date(data.end_date).getTime();

      if (endTime < startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "تاریخ پایان باید بعد یا مساوی تاریخ شروع باشد.",
          path: ["end_date"], // خطا را روی فیلد تاریخ پایان نشان می‌دهیم
        });
      }
    } catch (e) {
        console.log(e);
        
      // اگر تاریخ‌ها نامعتبر بودند، Zod قبلاً خطا داده است
    }
  });

// تایپ داده‌های این فرم
export type GenerateShiftsFormData = z.infer<typeof generateShiftsSchema>;