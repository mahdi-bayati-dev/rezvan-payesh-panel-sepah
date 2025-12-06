/**
 * این فایل به عنوان یک Barrel File (نقطه مرکزی صادرات) عمل می‌کند.
 * * هدف: حفظ سازگاری با کدهای قبلی پروژه که از این فایل ایمپورت می‌کردند.
 * تمام هوک‌ها اکنون در فایل‌های جداگانه و ماژولار قرار دارند و اینجا فقط Re-export می‌شوند.
 */

// ۱. کلیدهای کوئری
export * from "./queryKeys";

// ۲. هوک‌های مربوط به دریافت اطلاعات (Read)
export * from "./useGetShiftSchedules"; // شامل useShiftSchedules و useShiftSchedule
export * from "./useGeneratedShiftsList";

// ۳. هوک‌های مربوط به تغییر اطلاعات (Write/Mutation)
export * from "./useCreateShiftSchedule"; // شامل useCreateShiftSchedule و useGenerateShifts
export * from "./useUpdateShiftSchedule";
export * from "./useUpdateScheduleSlot";
export * from "./useDeleteShiftSchedule";

// ۴. هوک‌های مربوط به فرم‌ها و سوکت (اختیاری - اگر در جاهای دیگر ایمپورت عمومی می‌شوند)
export * from "./useShiftGenerationSocket";
export * from "./useShiftScheduleForm";
export * from "./useEditShiftScheduleForm";

// نکته: اگر در آینده هوک جدیدی اضافه کردی، کافیست فایل آن را بسازی و اینجا یک خط export اضافه کنی.
