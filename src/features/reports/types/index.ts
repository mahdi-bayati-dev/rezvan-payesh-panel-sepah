// --- تایپ‌های مربوط به API گزارش‌ها (AttendanceLogs) ---

/**
 * ساختار کارمند در پاسخ API گزارش‌ها (رابطه employee)
 */
export interface ApiEmployee {
  id: number;
  user_id: number; // <-- [اصلاح ۱] این فیلد حیاتی است و باید توسط API ارسال شود
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
 * [به‌روزرسانی] فیلدهای جدید بر اساس مستندات /my/attendance-logs اضافه شدند
 */
export interface ApiAttendanceLog {
  id: number;
  employee_id: number;
  event_type: "check_in" | "check_out";
  timestamp: string;
  source_name: string;
  source_type: string; // "auto", "manual", "edited"
  remarks: string | null;
  device_id: number | null;
  edited_by_user_id: number | null;
  is_allowed?: boolean; // <-- [اصلاح ۱] این فیلد در JSON شما نبود، اختیاری شد
  created_at: string;
  updated_at: string;
  employee?: ApiEmployee; // <-- [اصلاح ۲] کل آبجکت کارمند اختیاری شد
  editor: ApiEditor | null;

  // [جدید] این فیلدها در مستندات /my/.. و /admin/.. وجود دارند
  lateness_minutes: number | null; // <-- [اصلاح ۳] این فیلد در JSON شما null بود
  early_departure_minutes: number | null; // <-- [اصلاح ۴] این فیلد می‌تواند null باشد
}

/**
 * ساختار آبجکت Collection برای لیست گزارش‌ها
 */
export interface AttendanceLogCollection {
  data: ApiAttendanceLog[];
  links: {
    first: string | null;
    last: string | null; // [اصلاح]
    prev: string | null; // [اصلاح]
    next: string | null; // [اصلاح]
  };
  meta: {
    current_page: number;
    from: number; // [اصلاح]
    last_page: number;
    links: any[]; // [اصلاح]
    path: string; // [اصلاح]
    per_page: number;
    to: number; // [اصلاح]
    total: number;
  };
}

// --- تایپ‌های جدید: بر اساس مستندات API کاربران (Users) ---
// (این بخش بدون تغییر)
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
/**
 * [به‌روزرسانی] فیلدهای جدید برای نمایش در UI اضافه شدند
 */
export interface ActivityLog {
  id: string;
  employee: {
    id: number; // employee_id
    userId: number; // <-- [اصلاح ۲] این فیلد برای واکشی ثانویه اضافه شد
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

  // [جدید] فیلدهای اضافه‌شده
  is_manual: boolean; // (محاسباتی از source_type)
  lateness_minutes: number;
  early_departure_minutes: number;
}

// نوع برای گزینه‌های فیلتر (بدون تغییر)
export interface FilterOption {
  id: string | number;
  name: string;
}

// خروجی
// (این بخش بدون تغییر)
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

export type AllowedExportColumn = (typeof ALLOWED_EXPORT_COLUMN_KEYS)[number];

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
