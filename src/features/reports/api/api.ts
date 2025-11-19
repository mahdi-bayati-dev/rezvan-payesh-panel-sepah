import axiosInstance from "@/lib/AxiosConfig";
import {
  type ApiAttendanceLog,
  type AttendanceLogCollection,
  type ApiUserCollection,
  type FilterOption,
  type AllowedExportColumn,
} from "@/features/reports/types";
import { type DateObject } from "react-multi-date-picker";

const ADMIN_REPORTS_API_PATH = "/admin/attendance-logs";
const ADMIN_REPORTS_EXPORT_API_PATH = "/reports/attendance/export";
const ADMIN_USERS_API_PATH = "/users";
const MY_REPORTS_API_PATH = "/my/attendance-logs";

export interface LogFilters {
  page?: number;
  employee_id?: number;
  date_from?: string;
  date_to?: string;
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  search?: string;

  // این فیلدها نباید به API بروند
  localDateFrom?: DateObject | null;
  localDateTo?: DateObject | null;
}

export interface MyLogFilters {
  page?: number;
  start_date?: string;
  end_date?: string;
  type?: "check_in" | "check_out";
  is_manual?: boolean;
  has_lateness?: boolean;
  search?: string;
  sort_by?: "timestamp" | "type" | "is_manual" | "lateness_minutes";
  sort_dir?: "asc" | "desc";
  per_page?: number;
}

export interface CreateLogPayload {
  employee_id: number | string;
  event_type: "check_in" | "check_out";
  timestamp: string;
  remarks: string;
}

export interface UpdateLogPayload {
  event_type?: "check_in" | "check_out";
  timestamp?: string;
  remarks: string;
}

export interface ReportExportPayload {
  date_from: string;
  date_to: string;
  columns: AllowedExportColumn[];
  sort_by?: "timestamp" | "employee_name";
  sort_direction?: "asc" | "desc";
  filters?: {
    organization_id?: number;
    event_type?: "check_in" | "check_out";
    has_lateness?: boolean;
  };
}

// --- توابع API ---

export const fetchLogs = async (
  filters: LogFilters
): Promise<AttendanceLogCollection> => {
  // ✅ اصلاح مهم: جدا کردن پارامترهای لوکال
  // ما فقط apiParams را به سرور می‌فرستیم
  const { localDateFrom, localDateTo, ...apiParams } = filters;

  console.log("[API Admin] Fetching logs with Clean params:", apiParams);

  const response = await axiosInstance.get<AttendanceLogCollection>(
    ADMIN_REPORTS_API_PATH,
    {
      params: apiParams, // فقط پارامترهای استاندارد ارسال می‌شوند
    }
  );
  return response.data;
};

export const fetchLogById = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  const response = await axiosInstance.get<{ data: ApiAttendanceLog }>(
    `${ADMIN_REPORTS_API_PATH}/${logId}`
  );
  return response.data.data;
};

export const createLog = async (
  payload: CreateLogPayload
): Promise<ApiAttendanceLog> => {
  const response = await axiosInstance.post<{ data: ApiAttendanceLog }>(
    ADMIN_REPORTS_API_PATH,
    payload
  );
  return response.data.data;
};

export const updateLog = async ({
  id,
  payload,
}: {
  id: string | number;
  payload: UpdateLogPayload;
}): Promise<ApiAttendanceLog> => {
  const response = await axiosInstance.put<{ data: ApiAttendanceLog }>(
    `${ADMIN_REPORTS_API_PATH}/${id}`,
    payload
  );
  return response.data.data;
};

export const approveLog = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  const response = await axiosInstance.delete<{ data: ApiAttendanceLog }>(
    `${ADMIN_REPORTS_API_PATH}/${logId}`
  );
  return response.data.data;
};

export const requestAttendanceExport = async (
  payload: ReportExportPayload
): Promise<{ message: string }> => {
  const response = await axiosInstance.post(
    ADMIN_REPORTS_EXPORT_API_PATH,
    payload
  );
  return response.data;
};

export const fetchMyLogs = async (
  filters: MyLogFilters
): Promise<AttendanceLogCollection> => {
  // برای MyLogFilters فیلد لوکال نداشتیم ولی برای اطمینان لاگ می‌زنیم
  console.log("[API My] Fetching my logs:", filters);
  const response = await axiosInstance.get<AttendanceLogCollection>(
    MY_REPORTS_API_PATH,
    {
      params: filters,
    }
  );
  return response.data;
};

export const fetchMyLogById = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  const response = await axiosInstance.get<{ data: ApiAttendanceLog }>(
    `${MY_REPORTS_API_PATH}/${logId}`
  );
  return response.data.data;
};

// --- توابع Helper ---

const mapUsersToFilterOptions = (data: ApiUserCollection): FilterOption[] => {
  const validUsers = (data?.data || []).filter(
    (user) => user && user.employee && user.employee.id
  );
  return validUsers.map((user) => ({
    id: user.employee.id,
    name: `${user.employee.first_name || ""} ${
      user.employee.last_name || ""
    } (${user.employee.personnel_code || "N/A"})`,
  }));
};

export const fetchEmployeeOptionsList = async (
  searchQuery: string = ""
): Promise<FilterOption[]> => {
  const params: any = { per_page: 20 };
  if (searchQuery) params.search = searchQuery;

  const response = await axiosInstance.get<ApiUserCollection>(
    ADMIN_USERS_API_PATH,
    { params }
  );
  return mapUsersToFilterOptions(response.data);
};
