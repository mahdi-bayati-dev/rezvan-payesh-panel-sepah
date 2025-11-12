// features/requests/schemas/leaveTypeSchema.ts
import { z } from "zod";
// (تایپ SelectOption را از فایل اصلی خودتان ایمپورت کنید)
// import { type SelectOption } from "@/components/ui/SelectBox";

// تایپ SelectOption از کامپوننت SelectBox شما
const selectOptionSchema = z
  .object({
    // ✅ اصلاحیه خطای ۲: id می‌تواند string یا number باشد (مطابق SelectOption)
    id: z.union([z.string(), z.number()]),
    name: z.string(),
  })
  .nullable();

export const leaveTypeSchema = z.object({
  name: z
    // ✅ اصلاحیه خطای ۴: سینتکس Zod برای "required"
    // z.string() پارامتر required_error ندارد. باید از .min(1, ...) استفاده کرد
    .string()
    .min(1, "نام نوع مرخصی الزامی است") // این پیام "required" را مدیریت می‌کند
    .min(2, "نام حداقل باید ۲ کاراکتر باشد"), // این ولیدیشن طول شما بود

  description: z
    .string()
    .max(255, "توضیحات نباید بیشتر از ۲۵۵ کاراکتر باشد")
    .optional()
    .nullable(),

  // ما در فرم، آبجکت SelectOption را دریافت می‌کنیم
  parent: selectOptionSchema,
});

export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;
