import axiosInstance from "@/lib/AxiosConfig";
import {
  type ShiftScheduleResource,
  type PaginatedShiftScheduleResponse,
  type SingleShiftScheduleResponse,
  type ShiftSchedulePayload,
  type SlotUpdatePayload,
  type ScheduleSlotResource, // ✅ ایمپورت تایپ ScheduleSlotResource
  type ShiftScheduleUpdatePayload, // ✅ ایمپورت تایپ ShiftScheduleUpdatePayload
  type GenerateShiftsPayload, // ✅ ایمپورت تایپ جدید
} from "../types/index";

const API_URL = "/shift-schedules";

// --- ۱. مدیریت Shift Schedules ---

/**
 * GET /api/shift-schedules (بخش ۱.۱ مستندات)
 * دریافت لیست برنامه‌های شیفتی
 */
export const fetchShiftSchedules = async (
  page: number
): Promise<PaginatedShiftScheduleResponse> => {
  const response = await axiosInstance.get<PaginatedShiftScheduleResponse>(
    `${API_URL}?page=${page}`
  );
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
  return response.data.data;
};

/**
 * POST /api/shift-schedules (بخش ۱.۲ مستندات)
 * ایجاد برنامه شیفتی جدید
 */
export const createShiftSchedule = async (
  payload: ShiftSchedulePayload // ✅ استفاده از تایپ دقیق Payload
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
  payload: ShiftScheduleUpdatePayload // ✅ استفاده از تایپ دقیق Payload
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
  payload: SlotUpdatePayload; // ✅ استفاده از تایپ دقیق Payload
}): Promise<ScheduleSlotResource> => {
  // ✅✅✅ اصلاح کلیدی و بسیار مهم (مطابق بخش ۲.۱ مستندات) ✅✅✅
  // مستندات صراحتاً متد PATCH را برای این Endpoint مشخص کرده است.
  // استفاده از .put منجر به خطای Method Not Allowed (405) در لاراول می‌شود.
  const response = await axiosInstance.patch<{ data: ScheduleSlotResource }>( // ✅ تغییر متد از .put به .patch
    `${API_URL}/${shiftScheduleId}/slots/${scheduleSlotId}`,
    payload
  );

  // ✅✅✅ اصلاح کلیدی (مطابق بخش ۲.۱ مستندات) ✅✅✅
  // مستندات می‌گوید پاسخ موفق، آبجکت "ScheduleSlotResource" به‌روز شده است.
  // ساختار SingleShiftScheduleResponse (که حاوی کل برنامه بود) در اینجا اشتباه بود.
  // ما فرض می‌کنیم پاسخ مستقیماً حاوی { data: ScheduleSlotResource } است.
  return response.data.data;
};

// --- ✅✅✅ جدید: ۳. تولید شیفت‌ها ---

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
  // API در صورت موفقیت 202 (Accepted) برمی‌گرداند
  return response.data;
};
