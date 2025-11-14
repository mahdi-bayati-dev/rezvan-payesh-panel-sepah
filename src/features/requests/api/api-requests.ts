/**
 * لایه ارتباط با API برای /api/leave-requests
 */
import axiosInstance from "@/lib/AxiosConfig";
import {
  type LeaveRequest,
  type ApiResponse,
  type ApiPaginatedResponse,
  type CreateLeaveRequestPayload,
  type UpdateLeaveRequestPayload,
  type ProcessLeaveRequestPayload,
} from "../types"; // استفاده از تایپ‌های ماژول requests

const API_URL = "/leave-requests";

// پارامترهای قابل قبول برای فیلتر لیست
export interface GetLeaveRequestsParams {
  page?: number;
  per_page?: number;
  status?: "pending" | "approved" | "rejected" | "";
  employee_id?: number;

  // --- این فیلترها در کد شما استفاده شده‌اند ---
  // اما در مستندات API (بخش ۳، اندپوینت ۱) وجود ندارند.
  organization_id?: number;
  leave_type_id?: number;
}

/**
 * 1. دریافت لیست درخواست‌ها (Paginated)
 * GET /api/leave-requests
 */
export const getLeaveRequests = async (
  params: GetLeaveRequestsParams
): Promise<ApiPaginatedResponse<LeaveRequest>> => {
  const queryParams = new URLSearchParams();

  // افزودن پارامترهای موجود (که توسط API پشتیبانی می‌شوند)
  if (params.page) queryParams.append("page", String(params.page));
  if (params.per_page) queryParams.append("per_page", String(params.per_page));
  if (params.status) queryParams.append("status", params.status);

  // employee_id فقط زمانی ارسال می‌شود که در پارامترها وجود داشته باشد
  // (هوک useLeaveRequests این را برای ادمین‌ها مدیریت می‌کند)
  if (params.employee_id)
    queryParams.append("employee_id", String(params.employee_id));

  // --- ✅✅✅ راه‌حل یافته ۲ (تطبیق با مستندات API) ---
  // از ارسال پارامترهایی که در مستندات نیستند، خودداری می‌کنیم
  // این کدها کامنت می‌شوند تا فیلترها به اشتباه ارسال نشوند
  /*
  if (params.organization_id) {
    console.warn("API Note: organization_id filter is not supported by API, skipping.");
    // queryParams.append("organization_id", String(params.organization_id));
  }
  if (params.leave_type_id) {
    console.warn("API Note: leave_type_id filter is not supported by API, skipping.");
     // queryParams.append("leave_type_id", String(params.leave_type_id));
  }
  */
  // --- پایان اصلاحیه ---

  const response = await axiosInstance.get<ApiPaginatedResponse<LeaveRequest>>(
    `${API_URL}?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * 2. ثبت درخواست مرخصی جدید
 * POST /api/leave-requests
 */
export const createLeaveRequest = async (
  payload: CreateLeaveRequestPayload
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await axiosInstance.post<ApiResponse<LeaveRequest>>(
    API_URL,
    payload
  );
  return response.data;
};

/**
 * 3. پردازش درخواست (تایید/رد)
 * POST /api/leave-requests/{id}/process
 */
export const processLeaveRequest = async (
  id: number,
  payload: ProcessLeaveRequestPayload
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await axiosInstance.post<ApiResponse<LeaveRequest>>(
    `${API_URL}/${id}/process`,
    payload
  );
  return response.data;
};

/**
 * 4. دریافت جزئیات یک درخواست
 * GET /api/leave-requests/{id}
 */
export const getLeaveRequestById = async (
  id: number
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await axiosInstance.get<ApiResponse<LeaveRequest>>(
    `${API_URL}/${id}`
  );
  return response.data;
};

/**
 * 5. ویرایش درخواست
 * PUT /api/leave-requests/{id}
 */
export const updateLeaveRequest = async (
  id: number,
  payload: UpdateLeaveRequestPayload
): Promise<ApiResponse<LeaveRequest>> => {
  const response = await axiosInstance.put<ApiResponse<LeaveRequest>>(
    `${API_URL}/${id}`,
    payload
  );
  return response.data;
};

/**
 * 6. لغو درخواست
 * DELETE /api/leave-requests/{id}
 */
export const deleteLeaveRequest = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};
