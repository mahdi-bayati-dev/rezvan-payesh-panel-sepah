// رابط (Interface) برای نمایش یک گروه کاری
export interface WorkGroup {
  id: number;
  name: string;
  // توجه: فیلد work_pattern_id در پاسخ API وجود ندارد، نام فیلد week_pattern_id است.
  // این فیلدها با API شما هماهنگ شده‌اند (که شما در فایل اصلی هم هماهنگ کرده بودید)
  week_pattern_id: number | null;
  week_pattern: BaseNestedItem | null; // آبجکت الگوی کاری

  shift_schedule_id: number | null;
  shift_schedule: BaseNestedItem | null; // آبجکت برنامه شیفتی

  created_at: string;
  updated_at: string;
}

// تایپ برای لیست‌های دریافتی از API (الگوها و برنامه‌ها)
export interface BaseNestedItem {
  id: number;
  name: string;
}

// تایپ پاسخ صفحه‌بندی شده از API (استاندارد لاراول/لومن)
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
