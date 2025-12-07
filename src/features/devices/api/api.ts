import aiAxiosInstance from "@/lib/AiAxiosConfig";
import { AppConfig } from "@/config"; // ✅ ایمپورت کانفیگ مرکزی
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
  // ۱. دریافت کلید امنیتی از کانفیگ مرکزی (Runtime Config)
  // این مقدار حالا می‌تواند از داکر خوانده شود
  const apiKey = AppConfig.AI.SECRET;

  if (import.meta.env.DEV) {
    console.log("==> AI Key used:", apiKey ? "Present" : "Missing");
  }

  if (!apiKey && import.meta.env.DEV) {
    console.warn("⚠️ هشدار: مقدار VITE_AI_SERVICE_SECRET در کانفیگ پیدا نشد!");
  }

  // ۲. ارسال درخواست POST همراه با Body
  const response = await aiAxiosInstance.post<DevicesAPIResponse>(API_URL, {
    api_key: apiKey,
  });

  if (import.meta.env.DEV) {
    console.log("پاسخ دیوایس", response.data);
  }

  return response.data;
}
