import { z } from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// ترنسفورمیشن برای تبدیل ورودی به عدد یا نال
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

const optionalStringTimeSchema = z
  .string()
  .transform((val) => (val === "" ? null : val))
  .nullable();

const daySchema = z.object({
  day_of_week: z.number().min(0).max(6),
  is_working_day: z.boolean(),
  start_time: optionalStringTimeSchema,
  end_time: optionalStringTimeSchema,
  work_duration_minutes: numberOrNullPreprocess,
});

export const newWeekPatternSchema = z
  .object({
    name: z
      .string()
      .min(1, "نام الگو الزامی است")
      .max(255, "نام الگو طولانی است"),

    // ✅ فیلدهای جدید ساعات شناور
    floating_start: z.coerce
      .number({ message: "مقدار باید عدد باشد" })
      .min(0, "نمی‌تواند منفی باشد")
      .max(240, "حداکثر 240 دقیقه مجاز است") // محدودیت منطقی
      .default(0),

    floating_end: z.coerce
      .number({ message: "مقدار باید عدد باشد" })
      .min(0, "نمی‌تواند منفی باشد")
      .max(240, "حداکثر 240 دقیقه مجاز است")
      .default(0),

    days: z
      .array(daySchema)
      .length(7, "باید دقیقاً ۷ روز تعریف شود")
      .refine((days) => new Set(days.map((d) => d.day_of_week)).size === 7, {
        message: "روزهای هفته نباید تکراری باشند",
      }),
  })
  .superRefine((data, ctx) => {
    // منطق اعتبارسنجی روزها (بدون تغییر)
    data.days.forEach((day, index) => {
      const startTimeMinutes = day.start_time
        ? parseTime(day.start_time)
        : null;
      const endTimeMinutes = day.end_time ? parseTime(day.end_time) : null;

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
        }
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
        // منطق روزهای تعطیل (بدون تغییر)
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
      }
    });
  });

function parseTime(time: string): number | null {
  if (!time || !timeRegex.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export type NewWeekPatternFormData = z.infer<typeof newWeekPatternSchema>;
