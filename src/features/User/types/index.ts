// --- تایپ‌های پایه بر اساس API ---

// [جدید] ایمپورت تایپ پایه از ماژول دیگر
import type { BaseNestedItem } from "@/features/work-group/types/index";

// تایپ خلاصه‌شده سازمان (که در آبجکت کارمند می‌آید)
export interface OrganizationSmall {
  id: number;
  name: string;
  parent_id: number | null;
  // (سایر فیلدهای سازمان در صورت نیاز)
}

// تایپ آبجکت کارمند (employee)
// تایپ آبجکت کارمند (employee)
export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  personnel_code: string;
  organization: OrganizationSmall;
  position: string | null;
  starting_job: string | null;
  father_name: string | null;
  birth_date: string | null;
  nationality_code: string | null;
  gender: "male" | "female";
  is_married: boolean;
  education_level:
    | "diploma"
    | "advanced_diploma"
    | "bachelor"
    | "master"
    | "doctorate"
    | "post_doctorate"
    | null;
  phone_number: string | null;
  house_number: string | null;
  sos_number: string | null;
  address: string | null;
  work_group: BaseNestedItem | null;
  week_pattern: BaseNestedItem | null;
  shift_schedule: BaseNestedItem | null;
}

// تایپ آبجکت کاربر (User)
// این تایپ اصلی ما برای هر ردیف جدول و صفحه پروفایل است
export interface User {
  id: number;
  user_name: string;
  email: string;
  status: "active" | "inactive";
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  employee: Employee | null; // ممکن است کاربری پروفایل کارمندی نداشته باشد
}

// --- تایپ‌های صفحه‌بندی (برای Index) ---
// (این بخش بدون تغییر است)
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
  work_pattern_id?: number;
  shift_schedule_id?: number; 
}
