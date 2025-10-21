import { z } from "zod";
import { DateObject } from "react-multi-date-picker";

// الگوی اعتبارسنجی برای یک گزینه از SelectBox
const selectOptionSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
  })
  .nullable() // اجازه می‌دهیم مقدار اولیه null باشد
  .refine((val) => val !== null, { message: "انتخاب این فیلد الزامی است" }); // اما در نهایت نباید null بماند

// الگوی اعتبارسنجی برای تاریخ
const dateSchema = z
  .instanceof(DateObject)
  .nullable()
  .refine((val) => val !== null, { message: "انتخاب تاریخ الزامی است" });

/**
 * الگوی کامل اعتبارسنجی فرم درخواست جدید
 */
export const newRequestSchema = z.object({
  // ۱. فیلدهای ساده با register
  name: z.string().min(3, "نام و نام خانوادگی حداقل باید ۳ کاراکتر باشد"),
  // 'کد پرسنلی' در تصویر شما مقدار دارد، پس فرض می‌کنیم readOnly و از قبل پر شده
  personalCode: z.string().min(10, "وارد کردن کد پرسنلی الزامی است"),
  startTime: z
    .string()
    .min(1, "ساعت شروع الزامی است")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "فرمت ساعت (HH:mm) اشتباه است"),
  endTime: z
    .string()
    .min(1, "ساعت پایان الزامی است")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "فرمت ساعت (HH:mm) اشتباه است"),
  description: z
    .string()
    .max(500, "توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد")
    .optional(),

  // ۲. فیلدهای پیچیده که با Controller مدیریت می‌شوند
  organization: selectOptionSchema,
  workGroup: selectOptionSchema,
  category: selectOptionSchema,
  requestType: selectOptionSchema,
  date: dateSchema,
});

// ۳. استخراج تایپ TypeScript از Zod
export type NewRequestFormData = z.infer<typeof newRequestSchema>;
