import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const timeToMinutes = (time: string | null | undefined): number | null => {
  if (!time || !timeRegex.test(time)) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// ✅✅✅ راه‌حل نهایی و قطعی با z.any().transform().pipe() ✅✅✅
// کامنت: این راه‌حل حرفه‌ای، ۳ مرحله دارد:
// ۱. z.any(): هر نوع ورودی (unknown) را می‌پذیرد تا خطای Resolver حل شود.
// ۲. .transform(): بلافاصله ورودی (any) را به فرمت number | null پاکسازی می‌کند.
// ۳. .pipe(): اطمینان حاصل می‌کند که نتیجه‌ی transform حتماً number | null است.
const numberOrNullPreprocess = z
  .any()
  .transform((val) => {
    if (val === null || val === undefined || val === "") {
      return null;
    }
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  })
  .pipe(z.number().nullable());

// کامنت: این تعریف خواناتر برای فیلدهای زمان است
const optionalStringTimeSchema = z
  .string()
  .transform((val) => (val === "" ? null : val)) // رشته خالی را به null تبدیل می‌کند
  .nullable(); // اجازه ورود null را هم می‌دهد

const daySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  is_working_day: z.boolean(),
  start_time: optionalStringTimeSchema,
  end_time: optionalStringTimeSchema,
  work_duration_minutes: numberOrNullPreprocess, // ✅ استفاده از تعریف صحیح و سه‌مرحله‌ای
});

export const newWeekPatternSchema = z
  .object({
    name: z
      .string()
      .min(1, "نام الگو الزامی است")
      .max(255, "نام الگو طولانی است"),
    days: z
      .array(daySchema)
      .length(7, "باید دقیقاً ۷ روز تعریف شود")
      .refine((days) => new Set(days.map((d) => d.day_of_week)).size === 7, {
        message: "روزهای هفته نباید تکراری باشند",
      }),
  })
  .superRefine((data, ctx) => {
    data.days.forEach((day, index) => {
      const startTimeMinutes = timeToMinutes(day.start_time);
      const endTimeMinutes = timeToMinutes(day.end_time);

      if (day.is_working_day) {
        if (startTimeMinutes === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "ساعت شروع الزامی است",
            path: [`days.${index}.start_time`],
          });
        }

        if (endTimeMinutes === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "ساعت پایان الزامی است",
            path: [`days.${index}.end_time`],
          });
        } // کامنت: این منطق حالا با transform جدید کاملاً هماهنگ است

        if (
          day.work_duration_minutes === null ||
          day.work_duration_minutes <= 0 ||
          day.work_duration_minutes > 1440
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "مدت زمان باید بین ۱ تا ۱۴۴۰ دقیقه باشد",
            path: [`days.${index}.work_duration_minutes`],
          });
        }

        if (startTimeMinutes !== null && endTimeMinutes !== null) {
          if (endTimeMinutes <= startTimeMinutes) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "ساعت پایان باید بعد از شروع باشد",
              path: [`days.${index}.end_time`],
            });
          }
        }
      } else {
        if (day.start_time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "نباید مقدار داشته باشد",
            path: [`days.${index}.start_time`],
          });
        }
        if (day.end_time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "نباید مقدار داشته باشد",
            path: [`days.${index}.end_time`],
          });
        }
        // کامنت: این منطق حالا با transform جدید کاملاً هماهنگ است
        if (
          day.work_duration_minutes !== null &&
          day.work_duration_minutes !== 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "باید ۰ یا null باشد",
            path: [`days.${index}.work_duration_minutes`],
          });
        }
      }
    });
  });

export type NewWeekPatternFormData = z.infer<typeof newWeekPatternSchema>;
