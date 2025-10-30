export interface WorkGroup {
  id: number;
  name: string;
  work_pattern_id: number | null;
 
  created_at: string;
  updated_at: string;
    // --- اصلاحیه ---
  // این فیلدها با API شما هماهنگ شدند
  week_pattern_id: number | null; 
  week_pattern: BaseNestedItem | null; // قبلاً work_pattern_name بود
  
  shift_schedule_id: number | null;
  shift_schedule: BaseNestedItem | null; // قبلاً shift_schedule_name بود
  // --- پایان اصلاحیه ---

}

// تایپ برای لیست‌های دریافتی از API (الگوها و برنامه‌ها)
export interface BaseNestedItem {
  id: number;
  name: string;
}

// تایپ پاسخ صفحه‌بندی شده از API
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
