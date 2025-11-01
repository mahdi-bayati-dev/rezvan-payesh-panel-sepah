/**
 * اینترفیس‌های مربوط به API کاربران (GET /api/users)
 * بر اساس مستندات API شما
 */

// تایپ خلاصه‌شده سازمان (که در آبجکت کارمند می‌آید)
export interface OrganizationSmall {
  id: number;
  name: string;
  parent_id: number | null;
}

// تایپ آبجکت کارمند (employee)
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  personnel_code: string;
  position: string; // عنوان شغلی
  starting_job: string;
  organization: OrganizationSmall;
  father_name?: string;
  birth_date?: string;
  // ... سایر فیلدهای کارمند
}

// تایپ آبجکت کاربر (User)
// این تایپ اصلی ما برای هر ردیف جدول است
export interface User {
  id: number;
  user_name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: string[];
  employee: Employee | null; // ممکن است کاربری پروفایل کارمندی نداشته باشد
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

// تایپ پاسخ کامل API
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
