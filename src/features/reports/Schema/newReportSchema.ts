import { z } from "zod";

// تعریف یک آبجکت SelectOption (برای Zod)
const selectOptionSchema = z.object({
  // شناسه می‌تواند عددی یا رشته‌ای باشد (بستگی به کامپوننت SelectBox شما دارد)
  id: z.union([z.string(), z.number()]),
  name: z.string(),
});

// تعریف اسکیمای اعتبارسنجی جدید دقیقاً بر اساس API
export const newReportSchema = z.object({
  // ۱. فیلد "انتخاب کارمند"
  // API به employee_id نیاز دارد
  employee: selectOptionSchema.nullable().refine((val) => val !== null, {
    message: "انتخاب کارمند الزامی است",
  }),

  // ۲. [رفع خطا ۹] - فیلد "نوع رویداد"
  // استفاده از z.enum باعث می‌شود z.infer تایپ دقیق 'check_in' | 'check_out' را استنباط کند
  // و نیازی به cast کردن تایپ در NewReportPage نیست.
  event_type: z.enum(["check_in", "check_out"], {
    // [رفع خطا ۵] - سینتکس z.enum اصلاح شد
    // `errorMap` پارامتر اشتباهی بود، باید از `message` استفاده می‌کردیم
    // (یا آبجکت کامل { errorMap: ... } که پیچیده‌تر است)
    // این ساده‌ترین و صحیح‌ترین راه است:
    message: "انتخاب نوع فعالیت الزامی است",
  }),

  // ۳. فیلد "تاریخ"
  date: z
    .any() // (DateObject از PersianDatePicker)
    .nullable()
    .refine((val) => val !== null, {
      message: "انتخاب تاریخ الزامی است",
    }),

  // ۴. فیلد "ساعت"
  time: z
    .string()
    .min(1, "ساعت الزامی است")
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "فرمت ساعت باید HH:mm باشد (مثلاً 07:00)"
    ),

  // ۵. فیلد "ملاحظات" (الزامی)
  // این فیلد به 'remarks' در API مپ می‌شود
  remarks: z.string().min(1, "ارائه دلیل برای ثبت دستی الزامی است"),

  // ❌ فیلدهای زیر حذف شدند زیرا API آنها را قبول نمی‌کند:
  // name, personalCode, workGroup, organization, trafficArea, description
});

// استخراج تایپ داده‌های فرم از اسکیما
// NewReportFormData.event_type اکنون 'check_in' | 'check_out' خواهد بود
export type NewReportFormData = z.infer<typeof newReportSchema>;
