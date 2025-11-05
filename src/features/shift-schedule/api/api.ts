import axiosInstance from "@/lib/AxiosConfig";
import {
  type ShiftScheduleResource,
  type PaginatedShiftScheduleResponse,
  type SingleShiftScheduleResponse,
  type ShiftSchedulePayload,
  type SlotUpdatePayload,
  type ScheduleSlotResource, // ✅ ایمپورت تایپ ScheduleSlotResource
} from "../types/index";

const API_URL = "/shift-schedules";

// --- ۱. مدیریت Shift Schedules ---

/**
 * GET /shift-schedules
 * کامنت: دریافت لیست برنامه‌های شیفتی (با اصلاح خواندن داده‌های آرایه‌ای)
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
 * GET /shift-schedules/{id}
 * کامنت: دریافت جزئیات برنامه شیفتی
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
 * POST /shift-schedules
 * کامنت: ایجاد برنامه شیفتی جدید
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
 * PUT /shift-schedules/{id}
 * کامنت: به‌روزرسانی نام و تاریخ شروع برنامه شیفتی
 */
export const updateShiftSchedule = async (
  id: number | string,
  payload: { name: string; cycle_start_date: string }
): Promise<ShiftScheduleResource> => {
  const response = await axiosInstance.put<SingleShiftScheduleResponse>(
    `${API_URL}/${id}`,
    payload
  );
  return response.data.data;
};

/**
 * DELETE /shift-schedules/{id}
 * کامنت: حذف برنامه شیفتی
 */
export const deleteShiftSchedule = async (
  id: number | string
): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};

// --- ۲. مدیریت Schedule Slots ---

/**
 * PATCH /shift-schedules/{shiftSchedule}/slots/{scheduleSlot}
 * کامنت: به‌روزرسانی جزئیات یک اسلات خاص
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
  // ✅✅✅ اصلاح کلیدی: تغییر متد از .put به .patch ✅✅✅
  // کامنت: سرور لاراول صراحتاً اعلام کرده که برای این روت متد PATCH را پشتیبانی می‌کند.
  const response = await axiosInstance.patch<SingleShiftScheduleResponse>(
    `${API_URL}/${shiftScheduleId}/slots/${scheduleSlotId}`,
    payload
  );

  // کامنت: فرض می‌کنیم Response API برای PATCH Slot، آبجکت Slot به‌روز شده را در data.data برمی‌گرداند.
  // (اگر ساختار پاسخ متفاوت است، این بخش باید اصلاح شود)
  return response.data.data as unknown as ScheduleSlotResource;
};
