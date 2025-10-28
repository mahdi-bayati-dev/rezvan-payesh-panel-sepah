// کامنت: این فایل توابع API برای فیچر "الگوی هفتگی" است
// و کاملاً با مستندات نهایی شما هماهنگ شده است.

import axiosInstance from '@/lib/AxiosConfig';
import type {
  PaginatedWeekPatternsListApiResponse,
  SingleWeekPatternApiResponse,
  WeekPatternPayload, // استفاده از Payload نهایی (داک ۱)
} from '@/features/work-pattern/types/index';

const API_URL = '/week-patterns';

/**
 * کامنت: دریافت لیست صفحه‌بندی شده الگوهای کاری هفتگی
 * (این تابع از کد اولیه شما حفظ شد)
 */
export const getWeekPatternsList = async (page: number = 1): Promise<PaginatedWeekPatternsListApiResponse> => {
  const response = await axiosInstance.get<PaginatedWeekPatternsListApiResponse>(`${API_URL}?page=${page}`);
  return response.data;
};

/**
 * کامنت: دریافت جزئیات کامل یک الگوی کاری هفتگی
 * (پاسخ این تابع مطابق داک شما { data: ... } است)
 */
export const getWeekPatternById = async (id: number | string): Promise<SingleWeekPatternApiResponse> => {
  const response = await axiosInstance.get<SingleWeekPatternApiResponse>(`${API_URL}/${id}`);
  return response.data;
};

/**
 * کامنت: ایجاد یک الگوی کاری هفتگی جدید (بر اساس داک نهایی)
 * POST /api/week-patterns
 */
export const createWeekPattern = async (payload: WeekPatternPayload): Promise<SingleWeekPatternApiResponse> => {
  // کامنت: Payload ارسالی دقیقاً ساختار داک شما را دارد
  // { name: "...", days: [...] }
  const response = await axiosInstance.post<SingleWeekPatternApiResponse>(API_URL, payload);
  // کامنت: پاسخ 201 داک شما ساختار { data: ... } دارد
  return response.data;
};

/**
 * کامنت: به‌روزرسانی یک الگوی کاری هفتگی موجود
 * (فرض می‌کنیم Payload آپدیت مشابه Payload ایجاد است)
 */
export const updateWeekPattern = async (id: number | string, payload: WeekPatternPayload): Promise<SingleWeekPatternApiResponse> => {
  const response = await axiosInstance.put<SingleWeekPatternApiResponse>(`${API_URL}/${id}`, payload);
  return response.data;
};

/**
 * کامنت: حذف یک الگوی کاری هفتگی
 */
export const deleteWeekPattern = async (id: number | string): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};
