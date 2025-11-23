// --- تایپ‌های پایه بر اساس API ---

import type { BaseNestedItem } from "@/features/work-group/types/index";

// تایپ خلاصه‌شده سازمان
export interface OrganizationSmall {
  id: number;
  name: string;
  parent_id: number | null;
}

// ✅ تایپ جدید برای تصاویر کارمند (طبق داکیومنت جدید)
export interface EmployeeImage {
  id: number;
  employee_id: number;
  path: string; // آدرس فایل در سرور
  original_name: string;
  mime_type: string;
  size: number;
  created_at?: string;
}

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

  // ✅ اضافه شدن آرایه تصاویر به کارمند
  images?: EmployeeImage[];
}

// تایپ آبجکت کاربر (User)
export interface User {
  id: number;
  user_name: string;
  email: string;
  status: "active" | "inactive";
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  employee: Employee | null;
}

// --- تایپ‌های صفحه‌بندی ---
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

export interface UserListResponse {
  data: User[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface FetchUsersParams {
  page: number;
  per_page: number;
  search?: string;
  organization_id?: number;
  role?: string;
  work_pattern_id?: number;
  shift_schedule_id?: number;
  work_group_id?: number;
  is_not_assigned_to_group?: boolean;
}
