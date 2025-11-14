import { z } from "zod";
import { DateObject } from "react-multi-date-picker";

// الگوی اعتبارسنجی برای یک گزینه از SelectBox
const selectOptionSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
  })
  .nullable()
  .refine((val) => val !== null, { message: "انتخاب این فیلد الزامی است" });

// الگوی اعتبارسنجی برای تاریخ
const dateSchema = z
  .instanceof(DateObject)
  .nullable()
  .refine((val) => val !== null, { message: "انتخاب تاریخ الزامی است" });

/**
 * --- ✅ اسکیمای جدید با پشتیبانی از تاریخ شروع و پایان و تمام وقت ---
 */
export const newRequestSchema = z
  .object({
    // فیلدهای پیچیده که با Controller مدیریت می‌شوند
    category: selectOptionSchema,
    requestType: selectOptionSchema,

    // --- فیلدهای جدید برای بازه تاریخی ---
    startDate: dateSchema, // تاریخ شروع (اجباری)
    endDate: dateSchema, // تاریخ پایان (اجباری)
    isFullDay: z.boolean(), // فیلد جدید: آیا مرخصی تمام وقت است؟

    // فیلدهای ساعت
    // ✅ اصلاح کلیدی: این فیلدها Optional (اختیاری) هستند و null را می‌پذیرند
    // با این تعریف، TypeScript می‌فهمد که این فیلدها می‌توانند در defaultValues
    // با مقادیری مثل '08:00' (string) یا null یا undefined مقداردهی شوند.
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),

    description: z
      .string()
      .max(500, "توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد")
      .optional(),
  })
  .refine(
    (data) => {
      // اعتبارسنجی: تاریخ پایان باید بعد از تاریخ شروع باشد
      if (data.startDate && data.endDate) {
        // چک می‌کنیم که endDate بزرگتر یا مساوی startDate باشد
        return (
          data.endDate.toDate().getTime() >= data.startDate.toDate().getTime()
        );
      }
      return true; // اگر یکی از تاریخ‌ها خالی باشد، dateSchema آن را هندل می‌کند
    },
    {
      message: "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // اعتبارسنجی: اگر تمام وقت *نباشد*، ساعت‌ها اجباری و ولید باشند
      if (!data.isFullDay) {
        // چک می‌کنیم که startTime و endTime وجود داشته باشند و خالی نباشند (null/undefined نباشند)
        const startTime = data.startTime;
        const endTime = data.endTime;

        if (!startTime || !endTime) {
          // اگر در حالت پاره وقت، ساعت‌ها وارد نشدند یا null بودند، خطا بده
          return false;
        }

        // چک کردن فرمت ساعت
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime))
          return false;

        // اگر تاریخ شروع و پایان یکسان بود، چک می‌کنیم ساعت پایان بعد از شروع باشد
        if (
          data.startDate?.toDate().getTime() ===
          data.endDate?.toDate().getTime()
        ) {
          const startMinutes =
            parseInt(startTime.split(":")[0]) * 60 +
            parseInt(startTime.split(":")[1]);
          const endMinutes =
            parseInt(endTime.split(":")[0]) * 60 +
            parseInt(endTime.split(":")[1]);
          return endMinutes > startMinutes;
        }
      }
      return true;
    },
    {
      message:
        "در حالت پاره وقت، ساعت‌ها باید وارد شده و ساعت پایان بعد از شروع باشد.",
      path: ["endTime"], // خطا را به فیلد ساعت پایان نسبت می‌دهیم
    }
  );

// ۳. استخراج تایپ TypeScript از Zod
// ✅ اصلاح: نیازی به extend کردن نیست، چون فیلدهای ساعت در Zod هم Optional تعریف شدند.
export type NewRequestFormData = z.infer<typeof newRequestSchema>;
