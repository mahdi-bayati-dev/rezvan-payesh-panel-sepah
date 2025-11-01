import { z } from "zod";

// --- تایپ‌های پایه بر اساس API ---

// تایپ خلاصه‌شده سازمان (که در آبجکت کارمند می‌آید)
export interface OrganizationSmall {
  id: number;
  name: string;
  parent_id: number | null;
  // (سایر فیلدهای سازمان در صورت نیاز)
}

// تایپ آبجکت کارمند (employee)
export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  personnel_code: string;
  organization: OrganizationSmall; // ✅ آبجکت کامل سازمان
  position: string | null;
  starting_job: string | null;
  father_name: string | null;
  birth_date: string | null;
  nationality_code: string | null;
  gender: 'male' | 'female';
  is_married: boolean;
  education_level: 'diploma' | 'advanced_diploma' | 'bachelor' | 'master' | 'doctorate' | 'post_doctorate' | null;
  phone_number: string | null;
  house_number: string | null;
  sos_number: string | null;
  address: string | null;
  work_group_id: number | null;
  shift_schedule_id: number | null;
  work_pattern_id: number | null;
  // ... سایر فیلدهای کارمند
}

// تایپ آبجکت کاربر (User)
// این تایپ اصلی ما برای هر ردیف جدول و صفحه پروفایل است
export interface User {
  id: number;
  user_name: string;
  email: string;
  status: 'active' | 'inactive'; // ✅ افزودن status بر اساس اسکیما
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  employee: Employee | null; // ممکن است کاربری پروفایل کارمندی نداشته باشد
}

// --- تایپ‌های صفحه‌بندی (برای Index) ---

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

// تایپ پاسخ کامل API (Index)
export interface UserListResponse {
  data: User[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * تایپ پارامترهایی که به تابع fetchUsers پاس می‌دهیم
 */
export interface FetchUsersParams {
  page: number; // شماره صفحه (شروع از ۱)
  per_page: number; // تعداد آیتم در هر صفحه
  search?: string;
  organization_id?: number;
  role?: string;
}

// --- Zod Schemas برای فرم پروفایل (تفکیک‌شده) ---

// (توابع کمکی برای z.object({ employee: ... }))
// (zod تمام فیلدهای null را به undefined تبدیل می‌کند، ما null را مجاز می‌کنیم)
const nullableString = z.string().nullable().optional();
// const nullableBoolean = z.boolean().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const nullableDate = z.string().nullable().optional(); // (فرض می‌کنیم تاریخ‌ها به صورت YYYY-MM-DD ارسال می‌شوند)

// ۱. اسکیما برای تب "اطلاعات حساب"
export const accountInfoFormSchema = z.object({
  user_name: z.string().min(1, "نام کاربری الزامی است."),
  email: z.string().email("ایمیل نامعتبر است."),
  status: z.enum(['active', 'inactive']),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.").nullable().optional().or(z.literal('')), // (اختیاری)
});
export type AccountInfoFormData = z.infer<typeof accountInfoFormSchema>;


// ۲. اسکیما برای تب "مشخصات فردی"
export const personalDetailsFormSchema = z.object({
  employee: z.object({
    first_name: z.string().min(1, "نام الزامی است."),
    last_name: z.string().min(1, "نام خانوادگی الزامی است."),
    father_name: nullableString,
    nationality_code: nullableString,
    birth_date: nullableDate,
    gender: z.enum(['male', 'female']),
    is_married: z.boolean(),
    education_level: z.enum(['diploma', 'advanced_diploma', 'bachelor', 'master', 'doctorate', 'post_doctorate']).nullable().optional(),
  }).nullable()
});
export type PersonalDetailsFormData = z.infer<typeof personalDetailsFormSchema>;


// ۳. اسکیما برای تب "اطلاعات سازمانی"
export const organizationalFormSchema = z.object({
  employee: z.object({
    personnel_code: z.string().min(1, "کد پرسنلی الزامی است."),
    position: nullableString,
    starting_job: nullableDate,
    work_group_id: nullableNumber,
    shift_schedule_id: nullableNumber,
    work_pattern_id: nullableNumber,
    // organization_id (تغییر سازمان) در این فرم نیست چون فقط Super Admin مجاز است
  }).nullable()
});
export type OrganizationalFormData = z.infer<typeof organizationalFormSchema>;


// ۴. اسکیما برای تب "اطلاعات تماس"
export const contactFormSchema = z.object({
  employee: z.object({
    phone_number: nullableString,
    house_number: nullableString,
    sos_number: nullableString,
    address: nullableString,
  }).nullable()
});
export type ContactFormData = z.infer<typeof contactFormSchema>;


// (تایپ کلی برای آپدیت - ترکیبی از همه)
// (این همان تایپی است که useUpdateUserProfile در هوک استفاده می‌کند)
export type UserProfileFormData =
  | AccountInfoFormData
  | PersonalDetailsFormData
  | OrganizationalFormData
  | ContactFormData;

