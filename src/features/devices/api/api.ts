// src/features/devices/api/api.ts

import aiAxiosInstance from "@/lib/AiAxiosConfig";
import type { DevicesAPIResponse } from "../types";

// طبق مستندات جدید:
// Endpoint: /api/cameras-status
// Method: POST
const API_URL = "/cameras-status";

/**
 * 💡 دریافت وضعیت لحظه‌ای تمام دوربین‌ها از سرویس AI
 * متد: POST (طبق مستندات جدید)
 * نیاز به ارسال api_key در بدنه درخواست دارد.
 */
export async function getDevicesStatus(): Promise<DevicesAPIResponse> {
  // ۱. دریافت کلید امنیتی از متغیرهای محیطی
  // نکته استاندارد: هرگز کلیدهای امنیتی را در کد هاردکد نکنید.
  const apiKey = import.meta.env.VITE_AI_SERVICE_SECRET;

  if (!apiKey && import.meta.env.DEV) {
    console.warn(
      "⚠️ هشدار: مقدار VITE_AI_SERVICE_SECRET در فایل .env تنظیم نشده است!"
    );
  }

  // ۲. ارسال درخواست POST همراه با Body
  const response = await aiAxiosInstance.post<DevicesAPIResponse>(API_URL, {
    api_key: apiKey,
  });

  return response.data;
}