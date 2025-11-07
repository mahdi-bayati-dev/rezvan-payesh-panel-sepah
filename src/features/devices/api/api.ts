// devices/api/api.ts

import axiosInstance from "@/lib/AxiosConfig";
import type {  Device } from "../types";

const BASE_PATH = "/devices";

/**
 * 💡 تابع برای دریافت لیست دستگاه‌ها (صفحه‌بندی شده)
 * @param page - شماره صفحه
 * @param pageSize - تعداد آیتم در هر صفحه
 * @returns - پاسخ صفحه‌بندی شده شامل آرایه‌ای از دستگاه‌ها
 */
// 💡 تغییر ۱: نوع بازگشتی به Promise<Device[]> تغییر کرد
export async function getDevices(
  page: number = 1,
  pageSize: number = 10
): Promise<Device[]> {
  // کامنت مهم: ارسال پارامترهای page و per_page (معمولاً لاراول از per_page استفاده می‌کند)
  const response = await axiosInstance.get(BASE_PATH, {
    params: {
      page: page,
      per_page: pageSize, // پارامتر pageSize را اضافه می‌کنیم
    },
  });
  // 💡 تغییر ۲: چون API آبجکت صفحه‌بندی نیست، فقط داده‌ها را برمی‌گردانیم
  // (توجه: اگر API شما صفحه‌بندی را پشتیبانی نمی‌کند، پارامترهای بالا نادیده گرفته می‌شوند)
  return response.data;
}
/**
 * 💡 تابع برای دریافت جزئیات یک دستگاه تکی
 * (بدون تغییر)
 */
export async function getDevice(deviceId: number): Promise<Device> {
  const response = await axiosInstance.get(`${BASE_PATH}/${deviceId}`);
  return response.data;
}
