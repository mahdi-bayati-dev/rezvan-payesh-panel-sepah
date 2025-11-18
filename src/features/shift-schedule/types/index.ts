// shift-schedule/types/index.ts

import type {
  ApiPaginationLinks,
  ApiPaginationMeta,
} from "@/features/work-pattern/types/index";

// --- ۱. الگوی کاری (WorkPattern) ---
// بر اساس بخش ۳ مستندات (Data Structures)
export interface WorkPattern {
  id: number;
  name: string;
  type: "fixed" | "floating";
  start_time: string; // H:i
  end_time: string; // H:i
  work_duration_minutes: number;
}

// تایپ خلاصه‌تر که در فایل‌های دیگر استفاده شده بود
export type WorkPatternBase = Pick<WorkPattern, "id" | "name">;

// --- ۲. اسلات برنامه شیفتی (Schedule Slot) ---
// این تایپ ریسورس دریافتی از API است (بخش ۳ مستندات)
// ✅✅✅ اصلاح کلیدی: این ساختار باید دقیقاً با مستندات مطابقت داشته باشد
export interface ScheduleSlotResource {
  id: number;
  shift_schedule_id: number;
  day_in_cycle: number;
  work_pattern_id: number | null; // null یعنی روز استراحت
  override_start_time: string | null; // H:i
  override_end_time: string | null; // H:i
  // created_at و updated_at معمولاً وجود دارند، اما در مثال مستندات نبودند
  // created_at: string;
  // updated_at: string;
  
  // ✅✅✅ اصلاح کلیدی: بر اساس مستندات، آبجکت کامل work_pattern باید اینجا باشد
  work_pattern: WorkPattern | null; // آبجکت کامل WorkPattern
}

// --- ۳. برنامه شیفتی (Shift Schedule) ---
// این تایپ ریسورس دریافتی از API است (بخش ۳ مستندات)
export interface ShiftScheduleResource {
  id: number;
  name: string;
  cycle_length_days: number;
  cycle_start_date: string; // YYYY-MM-DD
  ignore_holidays: boolean; // ✅ فیلد جدید (دریافتی از API)
  // created_at: string;
  // updated_at: string;
  
  // ✅✅✅ اصلاح کلیدی: باید آرایه‌ای از ScheduleSlotResource کامل باشد
  slots: ScheduleSlotResource[]; 
}

// --- ۴. تایپ‌های پاسخ API ---
export interface PaginatedShiftScheduleResponse {
  data: ShiftScheduleResource[];
  links: ApiPaginationLinks;
  meta: ApiPaginationMeta;
}

export interface SingleShiftScheduleResponse {
  data: ShiftScheduleResource;
}

// --- ۵. تایپ‌های Payload (ارسالی به API) ---

// ✅✅✅ اصلاح کلیدی: این تایپ برای POST /shift-schedules است (بخش ۱.۲ مستندات)
export interface NewScheduleSlotPayload {
  day_in_cycle: number;
  is_off: boolean;
  name: string | null; // required_if:is_off,false
  start_time: string | null; // H:i, required_if:is_off,false
  end_time: string | null; // H:i, required_if:is_off,false
}

// ✅✅✅ اصلاح کلیدی: Payload ایجاد برنامه شیفتی (بخش ۱.۲ مستندات)
export interface ShiftSchedulePayload {
  name: string;
  cycle_length_days: number;
  cycle_start_date: string;
  ignore_holidays: boolean; // ✅ فیلد جدید (ارسالی به API)
  slots: NewScheduleSlotPayload[]; // آرایه‌ای از اسلات‌های جدید
}

// Payload برای آپدیت یک اسلات خاص (بخش ۲.۱ مستندات) - این تایپ در کد شما صحیح بود
export interface SlotUpdatePayload {
  work_pattern_id?: number | null;
  override_start_time?: string | null;
  override_end_time?: string | null;
}

// Payload برای آپدیت نام و تاریخ (بخش ۱.۴ مستندات) - این تایپ در کد شما صحیح بود
export interface ShiftScheduleUpdatePayload {
  name: string;
  cycle_start_date: string;
}

// ✅✅✅ جدید: Payload برای تولید شیفت‌ها
export interface GenerateShiftsPayload {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}