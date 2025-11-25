import axiosInstance from "@/lib/AxiosConfig";
import {
  type ShiftScheduleResource,
  type PaginatedShiftScheduleResponse,
  type SingleShiftScheduleResponse,
  type ShiftSchedulePayload,
  type SlotUpdatePayload,
  type ScheduleSlotResource,
  type ShiftScheduleUpdatePayload,
  type GenerateShiftsPayload,
} from "../types/index";

const API_URL = "/shift-schedules";
import type { GetShiftsParams, PaginatedShiftsResponse } from "../types/index";


// --- ۱. مدیریت Shift Schedules ---

/**
 * GET /api/shift-schedules (بخش ۱.۱ مستندات)
 * دریافت لیست برنامه‌های شیفتی
 * ✅ آپدیت: پارامتر per_page اضافه شد
 */
export const fetchShiftSchedules = async (
  page: number,
  per_page: number = 15 // مقدار پیش‌فرض ۱۵
): Promise<PaginatedShiftScheduleResponse> => {
  // ✅ پارامتر per_page به کوئری استرینگ اضافه شد
  const response = await axiosInstance.get<PaginatedShiftScheduleResponse>(
    `${API_URL}?page=${page}&per_page=${per_page}`
  );
  console.log(" دریافت لیست برنامه‌های شیفتی", response.data);

  return response.data;
};

/**
 * GET /api/shift-schedules/{id} (بخش ۱.۳ مستندات)
 * دریافت جزئیات برنامه شیفتی
 */
export const fetchShiftScheduleById = async (
  id: number | string
): Promise<ShiftScheduleResource> => {
  const response = await axiosInstance.get<SingleShiftScheduleResponse>(
    `${API_URL}/${id}`
  );
  console.log(" دریافت جزیات برنامه‌ شیفتی", response.data);
// console.log(response.data.data);

  return response.data.data;
};

/**
 * POST /api/shift-schedules (بخش ۱.۲ مستندات)
 * ایجاد برنامه شیفتی جدید
 */
export const createShiftSchedule = async (
  payload: ShiftSchedulePayload
): Promise<ShiftScheduleResource> => {
  const response = await axiosInstance.post<SingleShiftScheduleResponse>(
    API_URL,
    payload
  );
  return response.data.data;
};

/**
 * PUT /api/shift-schedules/{id} (بخش ۱.۴ مستندات)
 * به‌روزرسانی نام و تاریخ شروع برنامه شیفتی
 */
export const updateShiftSchedule = async (
  id: number | string,
  payload: ShiftScheduleUpdatePayload
): Promise<ShiftScheduleResource> => {
  const response = await axiosInstance.put<SingleShiftScheduleResponse>(
    `${API_URL}/${id}`,
    payload
  );
  return response.data.data;
};

/**
 * DELETE /api/shift-schedules/{id} (بخش ۱.۵ مستندات)
 * حذف برنامه شیفتی
 */
export const deleteShiftSchedule = async (
  id: number | string
): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};

// --- ۲. مدیریت Schedule Slots ---

/**
 * PATCH /api/shift-schedules/{shiftSchedule}/slots/{scheduleSlot} (بخش ۲.۱ مستندات)
 * به‌روزرسانی جزئیات یک اسلات خاص
 */
export const updateScheduleSlot = async ({
  shiftScheduleId,
  scheduleSlotId,
  payload,
}: {
  shiftScheduleId: number | string;
  scheduleSlotId: number | string;
  payload: SlotUpdatePayload;
}): Promise<ScheduleSlotResource> => {
  const response = await axiosInstance.patch<{ data: ScheduleSlotResource }>(
    `${API_URL}/${shiftScheduleId}/slots/${scheduleSlotId}`,
    payload
  );
  return response.data.data;
};

// --- ۳. تولید شیفت‌ها ---

/**
 * POST /api/shift-schedules/{shiftSchedule}/generate-shifts
 * ارسال دستور تولید شیفت‌ها (به صورت جاب در صف)
 */
export const generateShifts = async (
  shiftScheduleId: number | string,
  payload: GenerateShiftsPayload
): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(
    `${API_URL}/${shiftScheduleId}/generate-shifts`,
    payload
  );
  return response.data;
};

// ... (کدهای قبلی)

/**
 * GET /api/shift-schedules/{shiftSchedule}/shifts
 * دریافت لیست شیفت‌های تخصیص داده شده
 */
export const getGeneratedShifts = async (
  shiftScheduleId: number | string,
  params: GetShiftsParams
): Promise<PaginatedShiftsResponse> => {
  const response = await axiosInstance.get<PaginatedShiftsResponse>(
    `${API_URL}/${shiftScheduleId}/shifts`,
    { params }
  );
  return response.data;
};
