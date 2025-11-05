// work-pattern/types/index.ts

// کامنت: این فایل نهایی تایپ‌ها است که با داک API (ورود دستی زمان)
// و با اصلاح جزئی Payload هماهنگ شده است.

// --- تایپ‌های پایه ---

// کامنت: تایپ برای الگوی کاری اتمی (که در پاسخ API می‌آید)
export interface AtomicPattern {
  id: number;
  name: string;
  type: "fixed" | "floating";
  start_time: string | null;
  end_time: string | null;
  work_duration_minutes: number;
}

// --- تایپ‌های Payload (ارسالی به API) ---

// کامنت: تایپ یک روز در Payload ارسالی (بر اساس داک)
export interface DayPayload {
  day_of_week: number;
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
  work_duration_minutes: number | null;
}

// کامنت: تایپ Payload اصلی برای POST (بر اساس داک)
export interface WeekPatternPayload {
  name: string;
  days: DayPayload[]; // آرایه ۷ تایی
}

// --- تایپ‌های Response (دریافتی از API) ---

// کامنت: تایپ پاسخ موفقیت‌آمیز برای GET /{id} یا POST (بر اساس داک)
export interface WeekPatternDetail {
  id: number;
  name: string;
  organization_name?: string;
  saturday_pattern: AtomicPattern | null;
  sunday_pattern: AtomicPattern | null;
  monday_pattern: AtomicPattern | null;
  tuesday_pattern: AtomicPattern | null;
  wednesday_pattern: AtomicPattern | null;
  thursday_pattern: AtomicPattern | null;
  friday_pattern: AtomicPattern | null;
  created_at?: string;
  updated_at?: string;
}

// کامنت: تایپ پاسخ تکی (wrapper)
export interface SingleWeekPatternApiResponse {
  data: WeekPatternDetail;
}

// --- تایپ‌های لیست (برای GET /week-patterns) ---

export interface ApiPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface ApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedWeekPatternsListApiResponse {
  data: WeekPatternDetail[];
  meta: ApiPaginationMeta;
  links: ApiPaginationLinks;
}

// --- تایپ‌های خطا ---
export interface ApiValidationError {
  message: string;
  errors: {
    [key: string]: string[];
  };
}

// --- تایپ‌های UI (برای نمایش در کامپوننت‌ها) ---

export interface DailyScheduleUI {
  dayOfWeekName:
    | "شنبه"
    | "یکشنبه"
    | "دوشنبه"
    | "سه شنبه"
    | "چهارشنبه"
    | "پنجشنبه"
    | "جمعه";
  dayIndex: number; // 0-6
  atomicPattern: AtomicPattern | null;
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
  work_duration_minutes: number;
}

// ✅✅✅ اصلاح کلیدی: تایپ مشترک UI ✅✅✅
// این تایپ حالا می‌تواند هم "الگوی ثابت" و هم "برنامه شیفتی" را توصیف کند.
export interface WorkPatternUI {
  // فیلدهای مشترک
  id: number;
  name: string;

  // ✅ فیلد کلیدی برای تفکیک نوع الگو
  pattern_type: "WEEK_PATTERN" | "SHIFT_SCHEDULE";

  // ✅✅✅ اصلاح خطا (TS2339): افزودن فیلد type
  // کامنت: این فیلد در useWeekPatternDetails محاسبه می‌شود
  // و نوع کلی الگو (ثابت، شناور، خاموش یا ترکیبی) را مشخص می‌کند.
  type?: "fixed" | "floating" | "mixed" | "off";

  // فیلدهای مختص الگوی ثابت (WEEK_PATTERN)
  daily_schedules?: DailyScheduleUI[];
  organizationName?: string;

  // فیلدهای مختص برنامه شیفتی (SHIFT_SCHEDULE)
  cycle_length_days?: number;
  cycle_start_date?: string; // YYYY-MM-DD
}
