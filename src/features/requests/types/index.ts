// features/requests/types/index.ts

// ۱. [اصلاح کلیدی] وارد کردن تایپ‌های استاندارد از ماژول‌های دیگر
// نام مستعار BaseUser را حفظ می‌کنیم تا در اینجا قابل تشخیص باشد
import {
  type User as BaseUser,
  type Employee,
} from "@/features/User/types/index";
import { type LeaveType } from "../api/api-type"; // (از فایل api-type.ts خودتان)

// ✅ تعریف تایپ User جدید که BaseUser را بسط می‌دهد (برای رفع خطای TS2339)
// این تعریف فقط برای استفاده داخلی در این ماژول است، نه برای Export تکراری.
interface InternalUser extends BaseUser {
  first_name: string;
  last_name: string;
}

/**
 * تایپ اصلی: ساختار کامل یک درخواست مرخصی
 * مطابق با LeaveRequestResource در مستندات
 */
export interface LeaveRequest {
  id: number;
  status: "pending" | "approved" | "rejected";
  start_time: string; // "2025-11-20 09:00:00"
  end_time: string; // "2025-11-21 17:00:00"
  duration_for_humans: string; // "2 days"
  reason?: string | null;
  rejection_reason?: string | null;
  processed_at?: string | null;
  created_at: string;

  // --- روابط (با استفاده از تایپ‌های وارداتی) ---
  employee: Employee; // <-- ۲. استفاده از تایپ کامل Employee
  leave_type: LeaveType; // <-- ۳. استفاده از تایپ LeaveType
  processor?: InternalUser | null; // <-- ۴. استفاده از تایپ داخلی اصلاح‌شده
}

// --- تایپ‌های مربوط به Pagination (بدون تغییر) ---
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
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

// تایپ استاندارد برای پاسخ‌های API (یک آیتم)
export interface ApiResponse<T> {
  data: T;
}

// تایپ استاندارد برای پاسخ‌های API (لیست Paginate شده)
export interface ApiPaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

// --- تایپ‌های Payloads (ورودی‌های API) (بدون تغییر) ---
export interface CreateLeaveRequestPayload {
  leave_type_id: number;
  start_time: string; // "YYYY-MM-DD HH:mm:ss"
  end_time: string; // "YYYY-MM-DD HH:mm:ss"
  reason?: string;
}

export type UpdateLeaveRequestPayload = CreateLeaveRequestPayload;

export interface ProcessLeaveRequestPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
}

// ✅ [رفع خطای TS2484] فقط یکبار Export نهایی را انجام می‌دهیم.
// Export تایپ User را از InternalUser به نام نهایی User تغییر می‌دهیم.
export { type Employee, type LeaveType };
export type User = InternalUser; // Export نهایی تایپ User
