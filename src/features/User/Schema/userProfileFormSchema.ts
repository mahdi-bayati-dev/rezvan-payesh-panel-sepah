import { z } from "zod";

// --- تنظیمات اعتبار سنجی فایل ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// --- اسکیماهای تب‌های پروفایل (موجود) ---
// (بخش‌های accountInfo, personalDetails و ... بدون تغییر باقی می‌مانند مگر اینکه بخواهید آپدیت عکس را در ویرایش هم اضافه کنید)
// فعلاً فقط بخش CreateUserFormSchema را تغییر می‌دهیم که طبق داکیومنت جدید است.

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
      father_name: z.string().nullable().optional(),
      nationality_code: z.string().nullable().optional(),
      birth_date: z.string().min(1, "تاریخ تولد الزامی است."),
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
      position: z.string().nullable().optional(),
      starting_job: z.string().min(1, "تاریخ شروع به کار الزامی است."),
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
      phone_number: z.string().nullable().optional(),
      house_number: z.string().nullable().optional(),
      sos_number: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    })
    .nullable(),
});
export type ContactFormData = z.infer<typeof contactFormSchema>;

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

// --- ✅ اسکیمای فرم ایجاد کاربر (Updated) ---
export const createUserFormSchema = z.object({
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

  employee: z.object({
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
    is_married: z.boolean({ message: "وضعیت تاهل باید مشخص شود." }),
    birth_date: z.string().min(1, "تاریخ تولد الزامی است."),
    starting_job: z.string().min(1, "تاریخ شروع به کار الزامی است."),

    position: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    nationality_code: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    work_group_id: z.number().nullable().optional(),
    work_pattern_id: z.number().nullable().optional(),

    education_level: z.enum([
      "diploma",
      "advanced_diploma",
      "bachelor",
      "master",
      "doctorate",
      "post_doctorate",
    ]),
    house_number: z.string().min(1, "تلفن منزل الزامی است."),
    sos_number: z.string().min(1, "تلفن اضطراری الزامی است."),
    shift_schedule_id: z.number().positive("برنامه شیفتی الزامی است."),

    // ✅ فیلد جدید: تصاویر
    // ما آرایه ای از فایل‌ها را دریافت می‌کنیم (از نوع File مرورگر)
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
