import { z } from "zod";

// --- Zod Schema ---
// این اسکما برای اعتبارسنجی فرم استفاده می‌شود و کاملاً با ساختار API و منطق بیزینس شما مطابقت دارد.
export const workGroupFormSchema = z
  .object({
    name: z.string().min(1, { message: "نام گروه کاری الزامی است." }).max(255),

    // 'type' برای کنترل فرم در UI است، به بک‌اند ارسال نمی‌شود
    type: z.enum(["pattern", "schedule"], {
      message: "باید نوع گروه (الگو یا برنامه) را مشخص کنید.",
    }),

    // ID الگوی کاری
    week_pattern_id: z.number().nullable(),

    // ID برنامه شیفتی
    shift_schedule_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      // اگر نوع 'pattern' است، week_pattern_id باید مقدار داشته باشد
      if (data.type === "pattern") {
        return data.week_pattern_id !== null && data.week_pattern_id !== 0;
      }
      // اگر نوع 'schedule' است، shift_schedule_id باید مقدار داشته باشد
      if (data.type === "schedule") {
        return data.shift_schedule_id !== null && data.shift_schedule_id !== 0;
      }
      return false; // اگر هیچکدام انتخاب نشد، خطا
    },
    {
      // پیام خطا برای زمانی که یکی از دو فیلد وابسته انتخاب نشده باشد.
      message: "لطفاً یک الگو یا یک برنامه شیفتی را انتخاب کنید.",
      path: ["type"], // اتصال خطا به فیلد 'type'
    }
  );

// استخراج تایپ TypeScript از Zod Schema
export type WorkGroupFormData = z.infer<typeof workGroupFormSchema>;
