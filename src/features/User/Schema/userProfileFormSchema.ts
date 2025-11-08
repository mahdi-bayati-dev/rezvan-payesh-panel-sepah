import { z } from "zod";

// --- اسکیماهای تب‌های پروفایل (بدون تغییر) ---

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

export const personalDetailsFormSchema = z.object({
  employee: z
    .object({
      first_name: z.string().min(1, "نام الزامی است."),
      last_name: z.string().min(1, "نام خانوادگی الزامی است."),

      // ✅ اصلاح: z.preprocess حذف شد
      father_name: z.string().nullable().optional(),
      nationality_code: z.string().nullable().optional(),
      birth_date: z.string().nullable().optional(),

      gender: z.enum(["male", "female"]),
      is_married: z.boolean(),

      education_level: z
        .enum([
          "diploma",
          "advanced_diploma",
          "bachelor",
          "master",
          "doctorate",
          "post_doctorate",
        ])
        .nullable()
        .optional(),
    })
    .nullable(),
});
export type PersonalDetailsFormData = z.infer<typeof personalDetailsFormSchema>;

export const organizationalFormSchema = z.object({
  employee: z
    .object({
      personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),

      // ✅ اصلاح: z.preprocess حذف شد
      position: z.string().nullable().optional(),
      starting_job: z.string().nullable().optional(),
      work_group_id: z.number().nullable().optional(),
      work_pattern_id: z.number().nullable().optional(),
      shift_schedule_id: z.number().nullable().optional(),
    })
    .nullable(),
});
export type OrganizationalFormData = z.infer<typeof organizationalFormSchema>;

export const contactFormSchema = z.object({
  employee: z
    .object({
      // ✅ اصلاح: z.preprocess حذف شد
      phone_number: z.string().nullable().optional(),
      house_number: z.string().nullable().optional(),
      sos_number: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .nullable(),
});
export type ContactFormData = z.infer<typeof contactFormSchema>;

// --- ✅ اسکیمای جدید: مدیریت دسترسی (تغییر نقش) ---
// این اسکیما فقط شامل فیلد role است.
export const accessManagementFormSchema = z.object({
  role: z.string().min(1, "انتخاب نقش الزامی است."),
});
export type AccessManagementFormData = z.infer<
  typeof accessManagementFormSchema
>;
// --- --- --- --- --- --- --- --- --- --- --- ---

export type UserProfileFormData =
  | AccountInfoFormData
  | PersonalDetailsFormData
  | OrganizationalFormData
  | ContactFormData
  // ✅ اضافه کردن تایپ فرم جدید
  | AccessManagementFormData;

// --- اسکیمای فرم ایجاد کاربر ---
export const createUserFormSchema = z.object({
  // --- بخش User ---
  user_name: z.string().min(1, "نام کاربری الزامی است."),
  email: z.string().email("ایمیل نامعتبر است.").min(1, "ایمیل الزامی است."),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .min(1, "رمز عبور الزامی است."),
  // ✅ اصلاح: .default() حذف شد
  role: z.string().min(1, "انتخاب نقش الزامی است."),
  status: z.enum(["active", "inactive"], {
    message: "وضعیت باید 'active' یا 'inactive' باشد.",
  }),
  // ✅ اصلاح: .default() حذف شد
  // --- بخش Employee ---
  employee: z.object({
    // الزامی
    first_name: z.string().min(1, "نام الزامی است."),
    last_name: z.string().min(1, "نام خانوادگی الزامی است."),
    personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),
    phone_number: z.string().min(1, "شماره موبایل الزامی است."),
    organization_id: z
      .number({ message: "ID سازمان باید عدد باشد." })
      .positive("سازمان الزامی است."),
    gender: z.enum(["male", "female"], {
      message: "جنسیت باید 'male' یا 'female' باشد.",
    }),
    // ✅ اصلاح: .default() حذف شد
    is_married: z.boolean({ message: "وضعیت تاهل باید boolean باشد." }),
    // ✅ اصلاح: .default() حذف شد
    // ✅ اصلاح: z.preprocess حذف شد (این بخش از قبل درست بود)
    position: z.string().nullable().optional(),
    starting_job: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    birth_date: z.string().nullable().optional(),
    nationality_code: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    work_group_id: z.number().nullable().optional(),
    work_pattern_id: z.number().nullable().optional(),

    // فیلدهای NOT NULL در دیتابیس (باید default داشته باشند)
    education_level: z.enum([
      "diploma",
      "advanced_diploma",
      "bachelor",
      "master",
      "doctorate",
      "post_doctorate",
    ]),
    // ✅ اصلاح: .default() حذف شد
    // ✅ اصلاح: .default() حذف شد
    house_number: z.string().min(1, "تلفن منزل الزامی است."),
    // ✅ اصلاح: .default() حذف شد
    sos_number: z.string().min(1, "تلفن اضطراری الزامی است."),

    shift_schedule_id: z.number().positive("برنامه شیفتی الزامی است."),
    // ✅ اصلاح: .default() حذف شد
  }),
});

// تایپ نهایی فرم ایجاد کاربر
export type CreateUserFormData = z.infer<typeof createUserFormSchema>;
