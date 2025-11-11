import { z } from "zod";

// Regex برای فرمت YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * اسکیمای اعتبارسنجی *فقط* برای فرم ویرایش اطلاعات عمومی برنامه شیفتی.
 * این اسکیما فقط فیلدهایی را اعتبارسنجی می‌کند که در بخش ۱.۴ مستندات قابل ویرایش هستند.
 */
export const editShiftScheduleSchema = z.object({
  name: z
    .string()
    .min(1, "نام برنامه شیفتی الزامی است")
    .max(255, "نام برنامه طولانی است"),

  cycle_start_date: z
    .string()
    .min(1, "تاریخ شروع چرخه الزامی است.")
    .refine((val) => dateRegex.test(val), "فرمت تاریخ باید YYYY-MM-DD باشد."),
});

// تایپ داده‌های این فرم
export type EditShiftScheduleFormData = z.infer<typeof editShiftScheduleSchema>;