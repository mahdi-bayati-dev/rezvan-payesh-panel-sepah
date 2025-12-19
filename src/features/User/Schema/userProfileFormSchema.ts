import { z } from "zod";

// --- تنظیمات اعتبار سنجی فایل ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 مگابایت
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// لیست مقادیر ثابت برای تحصیلات
const EDUCATION_LEVELS = [
  "diploma",
  "advanced_diploma",
  "bachelor",
  "master",
  "doctorate",
  "post_doctorate",
] as const;

// تابع کمکی برای فیلدهای متنی اجباری
const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} الزامی است.`);

// --- 1. اسکیمای اطلاعات حساب ---
export const accountInfoFormSchema = z.object({
  user_name: z.string().min(1, "نام کاربری الزامی است."),
  email: z.string().email("فرمت ایمیل نامعتبر است."),
  status: z.enum(["active", "inactive"]),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type AccountInfoFormData = z.infer<typeof accountInfoFormSchema>;

// --- 2. اسکیمای مشخصات فردی ---
export const personalDetailsFormSchema = z.object({
  employee: z
    .object({
      first_name: z.string().min(1, "نام الزامی است."),
      last_name: z.string().min(1, "نام خانوادگی الزامی است."),
      gender: z.enum(["male", "female"]),
      is_married: z.boolean(),
      father_name: requiredString("نام پدر"),
      nationality_code: z
        .string()
        .length(10, "کد ملی باید ۱۰ رقم باشد")
        .regex(/^\d+$/, "فقط عدد وارد کنید"),
      birth_date: requiredString("تاریخ تولد"),
      education_level: z.enum(EDUCATION_LEVELS),
      images: z.array(z.custom<File>()).optional().nullable(),
      delete_images: z.array(z.number()).optional().nullable(),
    })
    .nullable(),
});
export type PersonalDetailsFormData = z.infer<typeof personalDetailsFormSchema>;

// --- 3. اسکیمای سازمانی ---
export const organizationalFormSchema = z.object({
  employee: z
    .object({
      personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),
      organization_id: z.number().optional(),
      position: requiredString("سمت شغلی"),
      starting_job: requiredString("تاریخ شروع به کار"),
      work_group_id: z.number().nullable().optional(),
      work_pattern_id: z.number().nullable().optional(),
      shift_schedule_id: z.number().nullable().optional(),
    })
    .nullable(),
});
export type OrganizationalFormData = z.infer<typeof organizationalFormSchema>;

// --- 4. اسکیمای تماس ---
export const contactFormSchema = z.object({
  employee: z
    .object({
      phone_number: z
        .string()
        .regex(/^09[0-9]{9}$/, "فرمت موبایل صحیح نیست (مثال: 09123456789)"),
      house_number: z
        .string()
        .min(1, "تلفن منزل الزامی است")
        .regex(/^\d+$/, "فقط عدد وارد کنید"),
      sos_number: z
        .string()
        .min(1, "تلفن اضطراری الزامی است")
        .regex(/^\d+$/, "فقط عدد وارد کنید"),
      address: requiredString("آدرس"),
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

/**
 * تایپ جامع برای استفاده در API و هوک‌ها
 * این بخش در ویرایش قبلی جا افتاده بود که باعث بروز خطای Build شد.
 */
export type UserProfileFormData =
  | AccountInfoFormData
  | PersonalDetailsFormData
  | OrganizationalFormData
  | ContactFormData
  | AccessManagementFormData;

// --- 6. اسکیمای جامع فرم ایجاد کاربر (Create User) ---
export const createUserFormSchema = z.object({
  user_name: z.string().min(1, "نام کاربری الزامی است."),
  email: z.string().email("ایمیل نامعتبر است.").min(1, "ایمیل الزامی است."),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .min(1, "رمز عبور الزامی است."),
  role: z.string().min(1, "انتخاب نقش الزامی است."),
  status: z.enum(["active", "inactive"], { message: "وضعیت باید مشخص شود." }),

  employee: z.object({
    first_name: z.string().min(1, "نام الزامی است."),
    last_name: z.string().min(1, "نام خانوادگی الزامی است."),
    father_name: requiredString("نام پدر"),
    nationality_code: z
      .string()
      .length(10, "کد ملی باید ۱۰ رقم باشد")
      .regex(/^\d+$/, "کد ملی فقط شامل اعداد است"),
    birth_date: requiredString("تاریخ تولد"),
    gender: z.enum(["male", "female"]),
    is_married: z.boolean({ message: "وضعیت تاهل باید مشخص شود." }),
    education_level: z.enum(EDUCATION_LEVELS, {
      message: "سطح تحصیلات باید انتخاب شود.",
    }),
    personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),
    organization_id: z
      .number({ message: "سازمان نامعتبر است." })
      .positive("سازمان الزامی است."),
    position: requiredString("سمت شغلی"),
    starting_job: requiredString("تاریخ شروع به کار"),
    work_group_id: z.number().nullable().optional(),
    work_pattern_id: z.number().nullable().optional(),
    shift_schedule_id: z.number().nullable().optional(),
    phone_number: z
      .string()
      .regex(/^09[0-9]{9}$/, "فرمت موبایل صحیح نیست (مثال: 09123456789)"),
    house_number: z
      .string()
      .min(1, "تلفن منزل الزامی است")
      .regex(/^\d+$/, "تلفن منزل فقط شامل عدد باشد"),
    sos_number: z
      .string()
      .min(1, "تلفن اضطراری الزامی است")
      .regex(/^\d+$/, "تلفن اضطراری فقط شامل عدد باشد"),
    address: requiredString("آدرس سکونت"),

    images: z
      .array(z.custom<File>())
      .min(1, "لطفاً حداقل یک تصویر پروفایل انتخاب کنید.")
      .refine((files) => {
        return files.every((file) => file.size <= MAX_FILE_SIZE);
      }, "حجم برخی تصاویر بیش از ۵ مگابایت است.")
      .refine((files) => {
        return files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
      }, "فرمت برخی فایل‌ها نامعتبر است (فقط JPG, PNG, WEBP)."),
  }),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;
