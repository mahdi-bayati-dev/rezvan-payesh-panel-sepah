import { z } from "zod";

// تعریف اسکیمای اعتبارسنجی برای فرم لاگین
export const loginSchema = z.object({
  // نام کاربری باید حداقل ۳ کاراکتر باشد
  username: z
    .string()
    .min(3, { message: "نام کاربری باید حداقل ۳ کاراکتر باشد" }),
  // رمز عبور باید حداقل ۶ کاراکتر باشد
  password: z
    .string()
    .min(8, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }),
});

// استخراج تایپ داده‌های فرم از اسکیما برای استفاده در React Hook Form
export type LoginFormData = z.infer<typeof loginSchema>;
