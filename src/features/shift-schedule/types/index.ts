// shift-schedule/types/index.ts

// کامنت: تایپ‌های API شیفت‌بندی بر اساس مستندات شما

// ✅ ۱. ایمپورت تایپ‌های مشترک صفحه‌بندی از ماژول work-pattern
import type {
  ApiPaginationLinks,
  ApiPaginationMeta,
} from "@/features/work-pattern/types/index";

// --- ۱. الگوهای کاری (برای اسلات‌ها) ---
// کامنت: اینها الگوهای اتمی هستند که برای تخصیص به هر اسلات استفاده می‌شوند
export interface WorkPatternBase {
  id: number;
  name: string;
}

// --- ۲. اسلات برنامه شیفتی (Schedule Slot) ---
// کامنت: فرمت کامل اسلات از API
export interface ScheduleSlotResource {
  id: number;
  shift_schedule_id: number;
  day_in_cycle: number; // ۱ تا cycle_length_days
  work_pattern_id: number | null; // null یعنی روز استراحت
  work_pattern_name: string | null;
  override_start_time: string | null; // HH:mm
  override_end_time: string | null; // HH:mm
  created_at: string;
  updated_at: string;
}

// --- ۳. برنامه شیفتی (Shift Schedule) ---
// کامنت: منبع اصلی برای جزئیات برنامه
export interface ShiftScheduleResource {
  id: number;
  name: string;
  cycle_length_days: number;
  cycle_start_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  slots?: ScheduleSlotResource[]; // ✅ این فیلد در GET single/POST/PUT لود می‌شود
}

// --- ۴. تایپ‌های پاسخ API ---
export interface PaginatedShiftScheduleResponse {
  data: ShiftScheduleResource[];
  // ✅ ۲. اصلاح خطا: استفاده از تایپ مشترک و دقیق
  links: ApiPaginationLinks;
  // ✅ ۳. اصلاح خطا: استفاده از تایپ مشترک و دقیق
  meta: ApiPaginationMeta;
}

export interface SingleShiftScheduleResponse {
  data: ShiftScheduleResource;
}

// --- ۵. تایپ‌های Payload (ارسالی به API) ---

// کامنت: Payload برای ایجاد برنامه شیفتی POST /shift-schedules
export interface ShiftSchedulePayload {
  name: string;
  cycle_length_days: number;
  cycle_start_date: string;
  slots?: {
    day_in_cycle: number;
    work_pattern_id: number | null;
  }[]; // اگرچه اختیاری است، اما در تایپ حفظ می‌شود
}

// کامنت: Payload برای آپدیت یک اسلات خاص PUT /slots/{id}
export interface SlotUpdatePayload {
  work_pattern_id?: number | null; // ID الگوی اتمی جدید
  override_start_time?: string | null; // زمان شروع جایگزین
  override_end_time?: string | null; // زمان پایان جایگزین
}

// کامنت: Payload برای آپدیت نام و تاریخ شروع برنامه شیفتی PUT /shift-schedules/{id}
export interface ShiftScheduleUpdatePayload {
  name: string;
  cycle_start_date: string;
  // کامنت: cycle_length_days در آپدیت مجاز نیست، پس حذف می‌شود
}
