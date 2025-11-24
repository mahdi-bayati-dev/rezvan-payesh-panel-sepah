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
} from "../types";

const API_URL = "/leave-requests";

// پارامترهای قابل قبول برای فیلتر لیست
export interface GetLeaveRequestsParams {
  page?: number;
  per_page?: number;
  status?: "pending" | "approved" | "rejected" | "";
  employee_id?: number;
  organization_id?: number;
  leave_type_id?: number;
}

// ✅ اصلاح اینترفیس خروجی طبق مستندات PDF (و استانداردهای لاراول)
export interface ExportLeaveRequestsParams {
  status?: "pending" | "approved" | "rejected" | "";
  organization_id?: number;
  leave_type_id?: number;
  
  // تغییر نام به استاندارد لاراول (مطابق PDF بخش کنترلرها که from_date ذکر شده)
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  
  // تنظیمات نمایشی
  with_details?: boolean;
  with_organization?: boolean;
  with_category?: boolean;
  title?: string;
}

/**
 * 1. دریافت لیست درخواست‌ها (Paginated)
 */
export const getLeaveRequests = async (
  params: GetLeaveRequestsParams
): Promise<ApiPaginatedResponse<LeaveRequest>> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", String(params.page));
  if (params.per_page) queryParams.append("per_page", String(params.per_page));
  if (params.status) queryParams.append("status", params.status);
  if (params.employee_id) queryParams.append("employee_id", String(params.employee_id));
  if (params.organization_id) queryParams.append("organization_id", String(params.organization_id));
  if (params.leave_type_id) queryParams.append("leave_type_id", String(params.leave_type_id));

  const response = await axiosInstance.get<ApiPaginatedResponse<LeaveRequest>>(
    `${API_URL}?${queryParams.toString()}`
  );
  console.log(response.data);
  
  return response.data;
};

/**
 * ✅ 7. درخواست خروجی اکسل (Async)
 * GET /api/leave-requests/export
 */
export const exportLeaveRequests = async (
  params: ExportLeaveRequestsParams
): Promise<{ message: string }> => {
  // ارسال پارامترها به عنوان query string
  const response = await axiosInstance.get<{ message: string }>(
    `${API_URL}/export`,
    { params }
  );
  return response.data;
};

/**
 * 2. ثبت درخواست مرخصی جدید
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
 */
export const deleteLeaveRequest = async (id: number): Promise<void> => {
  await axiosInstance.delete(`${API_URL}/${id}`);
};