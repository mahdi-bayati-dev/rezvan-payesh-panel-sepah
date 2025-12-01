import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "نام کاربری باید حداقل ۳ کاراکتر باشد" })
    .trim(), // حذف فاصله‌های اضافی احتمالی
  password: z
    .string()
    .min(8, { message: "رمز عبور باید حداقل ۸ کاراکتر باشد" }), // اصلاح پیام خطا برای تطابق با منطق
});

export type LoginFormData = z.infer<typeof loginSchema>;
