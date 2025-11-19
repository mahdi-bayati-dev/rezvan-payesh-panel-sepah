/**
 * اینترفیس اصلی آبجکت سازمان
 */
export interface Organization {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;

  employees_count?: number;
  employees?: any[];

  // children همیشه آرایه‌ای از سازمان‌هاست (حتی اگر خالی باشد)
  children?: Organization[];

  // descendants برای ادمین‌های سطح پایین ممکن است پر شود
  descendants?: Organization[];
}

/**
 * ریسپانس استاندارد API که همیشه دیتا داخل فیلد data است
 */
export interface ApiResponse<T> {
  data: T;
  message?: string; // معمولا API ها پیام هم دارند
}

// تایپ‌های کمکی برای تمیزی کد
export type OrganizationCollection = Organization[];
export type OrganizationResource = Organization;

// آیتم مسطح شده برای استفاده در دراپ‌داون‌ها
export interface FlatOrgOption {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
}
