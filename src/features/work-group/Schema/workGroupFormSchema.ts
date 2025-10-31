import { z } from "zod";

// --- Zod Schema ---
// این اسکما برای اعتبارسنجی فرم استفاده می‌شود
export const workGroupFormSchema = z
  .object({
    name: z.string().min(1, { message: "نام گروه کاری الزامی است." }).max(255),

    // 'type' برای کنترل فرم در UI است، به بک‌اند ارسال نمی‌شود
    type: z.enum(["pattern", "schedule"], {
      message: "باید نوع گروه (الگو یا برنامه) را مشخص کنید.",
    }),

    // --- اصلاحیه ---
    // نام فیلد با API هماهنگ شد
    week_pattern_id: z.number().nullable(), // قبلاً work_pattern_id بود

    // ID برنامه، که فقط اگر نوع 'schedule' باشد الزامی است
    shift_schedule_id: z.number().nullable(),
    // --- پایان اصلاحیه ---
  })
  .refine(
    (data) => {
      // منطق اصلی بیزینس:
      // اگر نوع 'pattern' است، week_pattern_id باید مقدار داشته باشد
      if (data.type === "pattern") {
        // --- اصلاحیه ---
        return data.week_pattern_id !== null; // قبلاً work_pattern_id بود
      }
      // اگر نوع 'schedule' است، shift_schedule_id باید مقدار داشته باشد
      if (data.type === "schedule") {
        return data.shift_schedule_id !== null;
      }
      return false;
    },
    {
      // این پیام خطا به یک فیلد خاص متصل نیست، بلکه خطای کلی فرم است
      // می‌توانید آن را به 'type' یا یک فیلد 'root' مپ کنید
      message: "لطفاً یک الگو یا یک برنامه شیفتی را انتخاب کنید.",
      path: ["type"], // اتصال خطا به فیلد 'type'
    }
  );

// استخراج تایپ TypeScript از Zod Schema
export type WorkGroupFormData = z.infer<typeof workGroupFormSchema>;
