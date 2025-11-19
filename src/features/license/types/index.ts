// src/features/license/types/index.ts

/**
 * وضعیت‌های ممکن برای لایسنس
 */
export type LicenseStatus = "trial" | "licensed" | "expired" | "tampered";

/**
 * ساختار داده‌ای وضعیت لایسنس (پاسخ GET)
 */
export interface LicenseState {
  installation_id: string; // شناسه منحصر به فرد نصب برای نمایش به کاربر
  status: LicenseStatus;
  user_limit: number; // سقف تعداد کاربر
  trial_days_used?: number; // فقط در حالت آزمایشی
  trial_last_run?: string; // تاریخ آخرین اجرا
  expires_at: string | null; // تاریخ انقضا (null یعنی دائم یا نامشخص در ترایال)
}

/**
 * ساختار بدنه درخواست فعال‌سازی (POST)
 */
export interface ActivateLicensePayload {
  license_token: string;
}

/**
 * ساختار پاسخ موفقیت‌آمیز فعال‌سازی
 */
export interface ActivateLicenseResponse {
  message: string;
  license: LicenseState;
}

/**
 * ساختار خطای استاندارد لایسنس (در پاسخ 403)
 */
export interface LicenseErrorResponse {
  error_code: "TRIAL_EXPIRED" | "LICENSE_EXPIRED" | "TAMPERED";
  message: string;
}
