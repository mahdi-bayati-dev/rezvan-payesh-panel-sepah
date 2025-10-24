import { z } from "zod";

// تعریف یک آبجکت SelectOption (برای Zod)
const selectOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// تعریف اسکیمای اعتبارسنجی برای فرم ثبت فعالیت
export const newReportSchema = z.object({
  // ستون راست در تصویر
  name: z.string().min(3, "نام و نام خانوادگی الزامی است"),
  workGroup: selectOptionSchema.nullable().refine((val) => val !== null, {
    message: "انتخاب گروه کاری الزامی است",
  }),
  activityType: selectOptionSchema.nullable().refine((val) => val !== null, {
    message: "انتخاب نوع فعالیت الزامی است",
  }),
  time: z
    .string()
    .min(1, "ساعت الزامی است")
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "فرمت ساعت باید HH:mm باشد (مثلاً 07:00)"
    ), // ستون چپ در تصویر

  personalCode: z.string().min(1, "کد پرسنلی الزامی است"),
  organization: selectOptionSchema.nullable().refine((val) => val !== null, {
    message: "انتخاب سازمان الزامی است",
  }),
  trafficArea: selectOptionSchema.nullable().refine((val) => val !== null, {
    message: "انتخاب ناحیه تردد الزامی است",
  }),
  date: z
    .any()
    .nullable()
    .refine((val) => val !== null, {
      message: "انتخاب تاریخ الزامی است",
    }), // فیلد توضیحات (که در تصویر نبود اما در کد شما بود و مفید است)

  description: z.string().optional(),
});

// استخراج تایپ داده‌های فرم از اسکیما
export type NewReportFormData = z.infer<typeof newReportSchema>;
