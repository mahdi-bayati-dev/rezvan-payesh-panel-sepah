import { z } from "zod";

// اسکیما فقط شامل فیلدهایی است که در فرم "ایجاد" یا "ویرایش" ارسال می‌شوند
export const organizationFormSchema = z.object({
  name: z.string().min(1, { message: "نام سازمان الزامی است." }).max(255),

  // parent_id می‌تواند null باشد (برای سازمان‌های ریشه)
  parent_id: z.number().nullable(),
});

// استخراج تایپ TypeScript از Zod Schema
export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
