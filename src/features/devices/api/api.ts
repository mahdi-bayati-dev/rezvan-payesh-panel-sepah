// src/features/devices/api/api.ts

import axiosInstance from "@/lib/AxiosConfig";
import type { DevicesAPIResponse } from "../types";

// آدرس اندپوینت طبق مستندات
const API_URL = "/cameras-status";

/**
 * 💡 دریافت وضعیت لحظه‌ای تمام دوربین‌ها
 * متد: GET
 * @returns پرامیس شامل لیست دوربین‌ها و اطلاعات کلی
 */
export async function getDevicesStatus(): Promise<DevicesAPIResponse> {
  // نکته: طبق مستندات، این درخواست Query Parameter ندارد
  // هدر Accept: application/json معمولاً در axiosInstance تنظیم شده است
  const response = await axiosInstance.get<DevicesAPIResponse>(API_URL);
  return response.data;
}