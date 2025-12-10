// shift-schedule/types/index.ts

import type {
  ApiPaginationLinks,
  ApiPaginationMeta,
} from "@/features/work-pattern/types/index";

// --- ۱. الگوی کاری (WorkPattern) ---
export interface WorkPattern {
  id: number;
  name: string;
  type: "fixed" | "floating";
  start_time: string; // H:i
  end_time: string; // H:i
  work_duration_minutes: number;
}

export type WorkPatternBase = Pick<WorkPattern, "id" | "name">;

// ✅ تایپ جدید برای دراپ‌داون (شامل ساعت‌ها برای نمایش Placeholder)
export type AvailableWorkPattern = Pick<
  WorkPattern,
  "id" | "name" | "start_time" | "end_time"
>;

// --- ۲. اسلات برنامه شیفتی (Schedule Slot) ---
export interface ScheduleSlotResource {
  id: number;
  shift_schedule_id: number;
  day_in_cycle: number;
  work_pattern_id: number | null; // null یعنی روز استراحت
  override_start_time: string | null; // H:i
  override_end_time: string | null; // H:i
  work_pattern: WorkPattern | null;
}

// --- ۳. برنامه شیفتی (Shift Schedule) ---
export interface ShiftScheduleResource {
  id: number;
  name: string;
  cycle_length_days: number;
  cycle_start_date: string; // YYYY-MM-DD
  ignore_holidays: boolean;
  floating_start: number;
  floating_end: number;
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

export interface NewScheduleSlotPayload {
  day_in_cycle: number;
  is_off: boolean;
  name: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface ShiftSchedulePayload {
  name: string;
  cycle_length_days: number;
  cycle_start_date: string;
  ignore_holidays: boolean;
  floating_start: number;
  floating_end: number;
  slots: NewScheduleSlotPayload[];
}

export interface SlotUpdatePayload {
  work_pattern_id?: number | null;
  override_start_time?: string | null;
  override_end_time?: string | null;
}

export interface ShiftScheduleUpdatePayload {
  name: string;
  cycle_start_date: string;
  floating_start?: number;
  floating_end?: number;
}

export interface GenerateShiftsPayload {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

// ... (تایپ‌های دریافت لیست شیفت‌ها)
export interface ShiftResource {
  id: number;
  date: string; // Y-m-d
  is_off_day: boolean;
  expected_start_time: string; // datetime
  expected_end_time: string; // datetime
  source: string; // e.g., "scheduled"
  shift_schedule_id: number;
  employee: {
    id: number;
    first_name: string;
    last_name: string;
    personnel_code: string;
    user?: {
      id: number;
      username: string;
      email: string;
    };
  };
  work_pattern?: {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    type: string;
  };
}

export interface GetShiftsParams {
  start_date?: string;
  end_date?: string;
  employee_id?: number;
  is_off_day?: 0 | 1;
  per_page?: number;
  page?: number;
  sort_order?: "asc" | "desc";
}

export interface PaginatedShiftsResponse {
  data: ShiftResource[];
  links: any;
  meta: any;
}
