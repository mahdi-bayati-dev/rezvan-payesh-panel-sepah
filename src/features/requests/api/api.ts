// features/requests/services/leaveTypesApi.ts
import axiosInstance from "@/lib/AxiosConfig"; // (بر اساس authSlice)

// ۱. تعریف تایپ بر اساس مستندات API شماره ۱
export interface LeaveType {
  id: number;
  name: string;
  description?: string | null;
  parent_id: number | null;
  parent?: LeaveType | null;
  children: LeaveType[]; // برای ساختار درختی
}

export type LeaveTypePayload = {
  name: string;
  // ✅ اصلاحیه خطای ۳: این فیلد باید null را هم بپذیرد (مطابق اسکیما و فرم)
  description?: string | null;
  parent_id: number | null;
};

// ۲. توابع API (با استفاده از Axios)
const API_URL = "/leave-types";

/**
 * (API 1) دریافت لیست کامل درختی انواع مرخصی
 * GET /api/admin/leave-types
 */
export const getLeaveTypesTree = async (): Promise<LeaveType[]> => {
  // API فقط ریشه‌ها را برمی‌گرداند که هر کدام children دارند
  const response = await axiosInstance.get<{ data: LeaveType[] }>(API_URL);
  return response.data.data;
};

/**
 * (API 3) دریافت جزئیات یک نوع مرخصی خاص
 * GET /api/admin/leave-types/{id}
 */
export const getLeaveTypeById = async (id: number): Promise<LeaveType> => {
  const response = await axiosInstance.get<{ data: LeaveType }>(
    `${API_URL}/${id}`
  );
  return response.data.data;
};

/**
 * (API 2) ایجاد نوع مرخصی جدید
 * POST /api/admin/leave-types
 */
export const createLeaveType = async (
  payload: LeaveTypePayload
): Promise<LeaveType> => {
  const response = await axiosInstance.post<{ data: LeaveType }>(
    API_URL,
    payload
  );
  return response.data.data;
};

/**
 * (API 4) به‌روزرسانی نوع مرخصی
 * PUT /api/admin/leave-types/{id}
 */
export const updateLeaveType = async (
  id: number,
  payload: LeaveTypePayload
): Promise<LeaveType> => {
  const response = await axiosInstance.put<{ data: LeaveType }>(
    `${API_URL}/${id}`,
    payload
  );
  return response.data.data;
};

/**
 * (API 5) حذف نوع مرخصی
 * DELETE /api/admin/leave-types/{id}
 */
export const deleteLeaveType = async (id: number): Promise<void> => {
  // در صورت موفقیت (204) پاسخی برنمی‌گرداند
  await axiosInstance.delete(`${API_URL}/${id}`);
};
