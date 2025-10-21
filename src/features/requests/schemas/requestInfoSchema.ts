// features/requests/schemas/requestInfoSchema.ts

import { z } from 'zod';
import { DateObject } from 'react-multi-date-picker';

// (اینها را از newRequestSchema کپی می‌کنیم)
const selectOptionSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
  })
  .nullable()
  .refine((val) => val !== null, { message: "انتخاب این فیلد الزامی است" });

const dateSchema = z
  .instanceof(DateObject)
  .nullable()
  .refine((val) => val !== null, { message: "انتخاب تاریخ الزامی است" });

/**
 * اسکیمای اعتبارسنجی *اختصاصی* برای فرم جزئیات درخواست
 */
export const requestInfoSchema = z.object({
  requestType: selectOptionSchema,
  category: selectOptionSchema,
  date: dateSchema,
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
  // (فیلد ضمیمه فعلا فقط خواندنی است)
  // attachment: z.string().optional(),
});

// استخراج تایپ TypeScript
export type RequestInfoFormData = z.infer<typeof requestInfoSchema>;