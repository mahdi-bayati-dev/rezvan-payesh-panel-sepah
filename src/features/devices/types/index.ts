// src/features/devices/types/index.ts

/**
 * 💡 اینترفیس مدل دستگاه (دوربین) طبق مستندات جدید API
 * Endpoint: /api/cameras-status
 */
export interface Device {
  api_key: string;        // شناسه یکتا (جایگزین ID عددی)
  name: string;           // نام نمایشی دستگاه
  source_name: string;    // نام مکان یا منبع (Descriptive location)
  status: "online" | "offline"; // وضعیت دقیق
  last_seen: string;      // زمان آخرین رویت (YYYY-MM-DD HH:MM:SS) یا "Never"
  health_url: string | null; // لینک مستقیم بررسی سلامت (در صورت آنلاین بودن)
}

/**
 * 💡 اینترفیس پاسخ کلی API
 * شامل متادیتای کلی و لیست دوربین‌ها
 */
export interface DevicesAPIResponse {
  total: number;          // تعداد کل دوربین‌ها
  cameras: Device[];      // آرایه لیست دوربین‌ها
  generated_at: string;   // زمان تولید پاسخ سمت سرور
}