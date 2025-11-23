import { z } from "zod";

// --- تنظیمات اعتبار سنجی فایل ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ✅ تعریف مقادیر Enum به صورت ثابت (Readonly Tuple) برای رفع خطای TS2769
const EDUCATION_LEVELS = [
  "diploma",
  "advanced_diploma",
  "bachelor",
  "master",
  "doctorate",
  "post_doctorate",
] as const;

// --- 1. اسکیمای اطلاعات حساب (Account Info) ---
export const accountInfoFormSchema = z.object({
  user_name: z.string().min(1, "نام کاربری الزامی است."),
  email: z.string().email("ایمیل نامعتبر است."),
  status: z.enum(["active", "inactive"]),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type AccountInfoFormData = z.infer<typeof accountInfoFormSchema>;

// --- 2. اسکیمای مشخصات فردی (Personal Details) ---
export const personalDetailsFormSchema = z.object({
  employee: z
    .object({
      first_name: z.string().min(1, "نام الزامی است."),
      last_name: z.string().min(1, "نام خانوادگی الزامی است."),
      gender: z.enum(["male", "female"]),
      is_married: z.boolean(),

      // فیلدهای اختیاری
      father_name: z.string().nullable().optional(),
      nationality_code: z.string().nullable().optional(),
      birth_date: z.string().nullable().optional(),
      
      // ✅ اصلاح شده: استفاده از ثابت تعریف شده
      education_level: z.enum(EDUCATION_LEVELS),
      
      images: z
        .array(z.custom<File>())
        .optional()
        .nullable()
        .refine((files) => {
          if (!files) return true;
          return files.every((file) => file.size <= MAX_FILE_SIZE);
        }, "حجم هر تصویر نباید بیشتر از ۵ مگابایت باشد.")
        .refine((files) => {
          if (!files) return true;
          return files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
        }, "فرمت فایل باید jpg, png یا webp باشد."),

      deleted_image_ids: z.array(z.number()).optional().nullable(),
    })
    .nullable(),
});
export type PersonalDetailsFormData = z.infer<typeof personalDetailsFormSchema>;

// --- 3. اسکیمای سازمانی (Organizational) ---
export const organizationalFormSchema = z.object({
  employee: z
    .object({
      personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),
      organization_id: z.number().optional(),
      
      position: z.string().nullable().optional(),
      starting_job: z.string().nullable().optional(),
      work_group_id: z.number().nullable().optional(),
      work_pattern_id: z.number().nullable().optional(),
      shift_schedule_id: z.number().nullable().optional(),
    })
    .nullable(),
});
export type OrganizationalFormData = z.infer<typeof organizationalFormSchema>;

// --- 4. اسکیمای تماس (Contact) ---
export const contactFormSchema = z.object({
  employee: z
    .object({
      phone_number: z.string().nullable().optional(),
      house_number: z.string().nullable().optional(),
      sos_number: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .nullable(),
});
export type ContactFormData = z.infer<typeof contactFormSchema>;

// --- 5. اسکیمای مدیریت دسترسی ---
export const accessManagementFormSchema = z.object({
  role: z.string().min(1, "انتخاب نقش الزامی است."),
});
export type AccessManagementFormData = z.infer<
  typeof accessManagementFormSchema
>;

export type UserProfileFormData =
  | AccountInfoFormData
  | PersonalDetailsFormData
  | OrganizationalFormData
  | ContactFormData
  | AccessManagementFormData;

// --- 6. اسکیمای فرم ایجاد کاربر (Create User) ---
export const createUserFormSchema = z.object({
  // سطح User
  user_name: z.string().min(1, "نام کاربری الزامی است."),
  email: z.string().email("ایمیل نامعتبر است.").min(1, "ایمیل الزامی است."),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .min(1, "رمز عبور الزامی است."),
  role: z.string().min(1, "انتخاب نقش الزامی است."),
  status: z.enum(["active", "inactive"], {
    message: "وضعیت باید 'active' یا 'inactive' باشد.",
  }),

  // سطح Employee
  employee: z.object({
    // اجباری‌ها
    first_name: z.string().min(1, "نام الزامی است."),
    last_name: z.string().min(1, "نام خانوادگی الزامی است."),
    personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),
    organization_id: z
      .number({ message: "ID سازمان باید عدد باشد." })
      .positive("سازمان الزامی است."),
    gender: z.enum(["male", "female"], {
      message: "جنسیت باید 'male' یا 'female' باشد.",
    }),
    is_married: z.boolean({ message: "وضعیت تاهل باید مشخص شود." }),

    // اختیاری‌ها
    birth_date: z.string().nullable().optional(),
    starting_job: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    house_number: z.string().nullable().optional(),
    sos_number: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    nationality_code: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    work_group_id: z.number().nullable().optional(),
    work_pattern_id: z.number().nullable().optional(),
    shift_schedule_id: z.number().nullable().optional(),

    // ✅ اصلاح شده: حذف پارامتر اشتباه required_error و استفاده از آرایه ثابت
    education_level: z.enum(EDUCATION_LEVELS),

    // تصاویر
    images: z
      .array(z.custom<File>())
      .optional()
      .refine((files) => {
        if (!files) return true;
        return files.every((file) => file.size <= MAX_FILE_SIZE);
      }, "حجم هر تصویر نباید بیشتر از ۵ مگابایت باشد.")
      .refine((files) => {
        if (!files) return true;
        return files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
      }, "فرمت فایل باید jpg, png یا webp باشد."),
  }),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;