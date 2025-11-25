import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * اسکیمای اعتبارسنجی فرم ویرایش اطلاعات عمومی برنامه شیفتی.
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

  // ✅ فیلدهای جدید قابل ویرایش
  floating_start: z.coerce
    .number()
    .min(0, "حداقل ۰ دقیقه")
    .max(240, "حداکثر ۲۴۰ دقیقه")
    .default(0),

  floating_end: z.coerce
    .number()
    .min(0, "حداقل ۰ دقیقه")
    .max(240, "حداکثر ۲۴۰ دقیقه")
    .default(0),
});

export type EditShiftScheduleFormData = z.infer<typeof editShiftScheduleSchema>;
