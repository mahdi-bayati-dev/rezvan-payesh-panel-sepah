// --- تایپ‌های مربوط به API گزارش‌ها (AttendanceLogs) ---
// (این بخش بدون تغییر باقی می‌ماند)

/**
 * ساختار کارمند در پاسخ API گزارش‌ها (رابطه employee)
 */
export interface ApiEmployee {
  id: number;
  first_name: string;
  last_name: string;
  avatarUrl?: string;
  employee_code?: string;
}

/**
 * ساختار ویرایشگر در پاسخ API گزارش‌ها (رابطه editor)
 */
export interface ApiEditor {
  id: number;
  user_name: string;
}

/**
 * ساختار خام لاگ تردد (از API گزارش‌ها)
 */
export interface ApiAttendanceLog {
  id: number;
  employee_id: number;
  event_type: "check_in" | "check_out";
  timestamp: string;
  source_name: string;
  source_type: string;
  remarks: string | null;
  device_id: number | null;
  edited_by_user_id: number | null;
  is_allowed: boolean;
  created_at: string;
  updated_at: string;
  employee: ApiEmployee;
  editor: ApiEditor | null;
}

/**
 * ساختار آبجکت Collection برای لیست گزارش‌ها
 */
export interface AttendanceLogCollection {
  data: ApiAttendanceLog[];
  links: {
    first: string | null;
  }
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    // ...
  };
}

// --- تایپ‌های جدید: بر اساس مستندات API کاربران (Users) ---

/**
 * ساختار کارمند در پاسخ API کاربران (Users API)
 * (این ساختار کامل‌تر از ApiEmployee در گزارش‌ها است)
 */
export interface ApiUserEmployeeProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  personnel_code: string;
  organization?: {
    id: number;
    name: string;
  };
}

export interface ApiUserResource {
  id: number; // این همان ID است که برای employee_id در لاگ‌ها استفاده می‌شود
  user_name: string;
  email: string;
  roles: string[];
  employee: ApiUserEmployeeProfile; // آبجکت کارمند
}

/**
 * ساختار آبجکت Collection برای لیست کاربران
 * (بر اساس UserCollection در داکیومنت جدید)
 */
export interface ApiUserCollection {
  data: ApiUserResource[]; // آرایه‌ای از کاربران
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    // ...
  };
}

// --- تایپ‌های UI (بدون تغییر) ---
// (این تایپ، داده‌ای است که کامپوننت‌های UI شما مصرف می‌کنند)
export interface ActivityLog {
  id: string;
  employee: {
    id: number;
    name: string;
    avatarUrl?: string;
    employeeId: string; // شماره پرسنلی
  };
  activityType: "entry" | "exit" | "delay" | "haste";
  trafficArea: string; // (منبع / Source Name)
  date: string;
  time: string;
  is_allowed: boolean;
  remarks: string | null;
}

// نوع برای گزینه‌های فیلتر (بدون تغییر)
export interface FilterOption {
  id: string | number;
  name: string;
}

// خروجی
// این فایل جدید، ستون‌های مجاز برای خروجی اکسل را به صورت تایپ‌اسکریپت تعریف می‌کند
// این کار به ما کمک می‌کند تا در مودال انتخاب ستون، دچار خطا نشویم.

/**
 * کلیدهای ستون‌های مجاز بر اساس مستندات API
 * (AttendanceLogExport::ALLOWED_COLUMNS)
 */
export const ALLOWED_EXPORT_COLUMN_KEYS = [
  "id",
  "employee_id",
  "employee_name",
  "employee_personnel_code",
  "organization_name",
  "timestamp",
  "event_type",
  "lateness_minutes",
  "early_departure_minutes",
  "source_name",
  "source_type",
  "remarks",
] as const;

/**
 * تایپ Union از کلیدهای ستون‌های مجاز
 */
export type AllowedExportColumn = (typeof ALLOWED_EXPORT_COLUMN_KEYS)[number];

/**
 * مپ برای نمایش لیبل‌های خوانا در UI مودال
 */
export const EXPORT_COLUMN_MAP: Record<AllowedExportColumn, string> = {
  id: "شناسه لاگ",
  employee_id: "شناسه کارمند",
  employee_name: "نام کارمند",
  employee_personnel_code: "کد پرسنلی",
  organization_name: "سازمان",
  timestamp: "زمان ثبت",
  event_type: "نوع رویداد",
  lateness_minutes: "دقایق تاخیر",
  early_departure_minutes: "دقایق تعجیل",
  source_name: "نام دستگاه",
  source_type: "منبع",
  remarks: "ملاحظات",
};
