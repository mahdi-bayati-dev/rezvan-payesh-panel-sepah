// src/features/devices/types/index.ts

/**
 * 💡 اینترفیس مدل دستگاه (دوربین) طبق مستندات جدید
 * نکته: فیلدهای name, api_key, health_url در داکیومنت نبودند و حذف شدند.
 * فقط فیلدهایی که سرور برمی‌گرداند را اینجا تعریف می‌کنیم.
 */
export interface Device {
  source_name: string; // نام منبع/دوربین (جایگزین name)
  status: "online" | "offline"; // وضعیت
  last_seen: string; // زمان آخرین رویت
}

/**
 * 💡 اینترفیس پاسخ کلی API
 */
export interface DevicesAPIResponse {
  total: number;
  cameras: Device[];
  generated_at: string;
}
