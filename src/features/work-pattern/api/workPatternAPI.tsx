
import axiosInstance from '@/lib/AxiosConfig';
import type {
  PaginatedWeekPatternsListApiResponse,
  SingleWeekPatternApiResponse,
  WeekPatternPayload, 
} from '@/features/work-pattern/types/index';

const API_URL = '/week-patterns';

/**
 * کامنت: دریافت لیست صفحه‌بندی شده الگوهای کاری هفتگی
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
 * کامنت: ایجاد یک الگوی کاری هفتگی جدید )
 * POST /api/week-patterns
 */
export const createWeekPattern = async (payload: WeekPatternPayload): Promise<SingleWeekPatternApiResponse> => {
  const response = await axiosInstance.post<SingleWeekPatternApiResponse>(API_URL, payload);
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
