import axiosInstance from "@/lib/AxiosConfig";
import {
  // تایپ‌های API گزارش‌ها
  type ApiAttendanceLog,
  type AttendanceLogCollection,
  // تایپ‌های API کاربران
  type ApiUserCollection,
  // تایپ‌های UI
  type FilterOption,
} from "@/features/reports/types";
// [جدید] ایمپورت کلیدهای ستون‌های مجاز
import { type AllowedExportColumn } from "@/features/reports/types/index";
import { type DateObject } from "react-multi-date-picker";

// === مسیرهای ادمین ===
const ADMIN_REPORTS_API_PATH = "/admin/attendance-logs";
const ADMIN_REPORTS_EXPORT_API_PATH = "/reports/attendance/export"; // ❗️ مسیر طبق داکیومنت
const ADMIN_USERS_API_PATH = "/users";

// === [جدید] مسیرهای کاربر (My Reports) ===
const MY_REPORTS_API_PATH = "/my/attendance-logs";

// --- تعریف تایپ‌های Payloads ---

// فیلترهای ادمین
export interface LogFilters {
  page?: number;
  employee_id?: number;
  date_from?: string; // YYYY-MM-DD (برای ارسال به API)
  date_to?: string; // YYYY-MM-DD (برای ارسال به API)
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  search?: string;

  // [اصلاح کلیدی]: اضافه کردن فیلدهای محلی (Local State) برای مدیریت DateObject
  localDateFrom?: DateObject | null;
  localDateTo?: DateObject | null;
}

// [جدید] فیلترهای کاربر (My Reports)
// بر اساس مستندات API شما
export interface MyLogFilters {
  page?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  type?: "check_in" | "check_out";
  is_manual?: boolean;
  has_lateness?: boolean;
  search?: string; // (جستجو در remarks)
  sort_by?: "timestamp" | "type" | "is_manual" | "lateness_minutes";
  sort_dir?: "asc" | "desc";
  per_page?: number;
}

// ... (CreateLogPayload و UpdateLogPayload بدون تغییر) ...
export interface CreateLogPayload {
  employee_id: number | string;
  event_type: "check_in" | "check_out";
  timestamp: string; // "YYYY-MM-DD HH:mm:ss"
  remarks: string;
}

export interface UpdateLogPayload {
  event_type?: "check_in" | "check_out";
  timestamp?: string; // "YYYY-MM-DD HH:mm:ss"
  remarks: string;
}

// (ReportExportPayload بدون تغییر)
export interface ReportExportPayload {
  date_from: string; // YYYY-MM-DD
  date_to: string; // YYYY-MM-DD
  columns: AllowedExportColumn[];
  sort_by?: "timestamp" | "employee_name";
  sort_direction?: "asc" | "desc";
  filters?: {
    organization_id?: number;
    event_type?: "check_in" | "check_out";
    has_lateness?: boolean;
  };
}

// --- توابع API گزارش‌های ادمین ---
// (fetchLogs, fetchLogById, createLog, updateLog, approveLog)
// (این توابع بدون تغییر باقی می‌مانند و فقط مسیرشان را به ADMIN_... تغییر می‌دهیم)

/**
 * ۱. (Admin Index) واکشی لیست لاگ‌ها
 */
export const fetchLogs = async (
  filters: LogFilters
): Promise<AttendanceLogCollection> => {
  console.log("[API Admin] Fetching logs with filters:", filters);
  // [نکته]: فیلدهای localDateFrom و localDateTo به API ارسال نخواهند شد،
  // زیرا `axiosInstance.get` فقط فیلدهای تعریف شده و غیر null را می‌فرستد.
  const response = await axiosInstance.get<AttendanceLogCollection>(
    ADMIN_REPORTS_API_PATH,
    {
      params: filters,
    }
  );
  return response.data; // -> { data: [...], links: ..., meta: ... }
};

/**
 * ۲. (Admin Show) واکشی جزئیات یک لاگ خاص
 */
export const fetchLogById = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  console.log(`[API Admin] Fetching log by ID: ${logId}`);
  const response = await axiosInstance.get<{ data: ApiAttendanceLog }>(
    `${ADMIN_REPORTS_API_PATH}/${logId}`
  );
  console.log('====>',response.data.data);
  
  return response.data.data; // -> { id: ..., employee: ... }
};

/**
 * ۳. (Admin Store) ایجاد یک لاگ تردد دستی جدید
 */
export const createLog = async (
  payload: CreateLogPayload
): Promise<ApiAttendanceLog> => {
  console.log("[API Admin] Creating new log:", payload);
  const response = await axiosInstance.post<{ data: ApiAttendanceLog }>(
    ADMIN_REPORTS_API_PATH,
    payload
  );
  return response.data.data;
};

/**
 * ۴. (Admin Update) ویرایش یک لاگ تردد موجود
 */
export const updateLog = async ({
  id,
  payload,
}: {
  id: string | number;
  payload: UpdateLogPayload;
}): Promise<ApiAttendanceLog> => {
  console.log(`[API Admin] Updating log ${id}:`, payload);
  const response = await axiosInstance.put<{ data: ApiAttendanceLog }>(
    `${ADMIN_REPORTS_API_PATH}/${id}`,
    payload
  );
  return response.data.data;
};

/**
 * ۵. (Admin Destroy/Approve) تأیید کردن یک لاگ تردد
 */
export const approveLog = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  console.log(`[API Admin] Approving (DELETE) log: ${logId}`);
  const response = await axiosInstance.delete<{ data: ApiAttendanceLog }>(
    `${ADMIN_REPORTS_API_PATH}/${logId}`
  );
  return response.data.data;
};

/**
 * ۶. (Admin Export) درخواست شروع ساخت گزارش اکسل
 */
export const requestAttendanceExport = async (
  payload: ReportExportPayload
): Promise<{ message: string }> => {
  console.log("[API Admin] Requesting Excel export with payload:", payload);
  const response = await axiosInstance.post(
    ADMIN_REPORTS_EXPORT_API_PATH,
    payload
  );
  return response.data; // -> { message: "..." }
};

// --- [جدید] توابع API گزارش‌های کاربر (My Reports) ---

/**
 * ۷. (My Index) واکشی لیست لاگ‌های کاربر لاگین کرده
 */
export const fetchMyLogs = async (
  filters: MyLogFilters
): Promise<AttendanceLogCollection> => {
  console.log("[API My] Fetching my logs with filters:", filters);
  const response = await axiosInstance.get<AttendanceLogCollection>(
    MY_REPORTS_API_PATH,
    {
      params: filters,
    }
  );
  return response.data; // -> { data: [...], links: ..., meta: ... }
};

/**
 * ۸. (My Show) واکشی جزئیات یک لاگ خاص کاربر
 */
export const fetchMyLogById = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  console.log(`[API My] Fetching my log by ID: ${logId}`);
  // مستندات شما '{attendance_log}' را به عنوان پارامتر URL مشخص کرده است
  const response = await axiosInstance.get<{ data: ApiAttendanceLog }>(
    `${MY_REPORTS_API_PATH}/${logId}`
  );
  console.log('====>',response.data.data);
  return response.data.data; // -> { id: ..., employee: ... }
};

// --- [بهینه] توابع واکشی کارمندان (Admin) ---
// (mapUsersToFilterOptions و fetchEmployeeOptionsList بدون تغییر)
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
  console.log(
    "[API Admin] Fetching employee options (List/Search)...",
    searchQuery
  );

  const params: any = {
    per_page: 20,
  };

  if (searchQuery) {
    params.search = searchQuery;
  } else {
    params.per_page = 20;
  }

  const response = await axiosInstance.get<ApiUserCollection>(
    ADMIN_USERS_API_PATH,
    {
      params: params,
    }
  );
  console.log("[API Admin] Raw employee response:", response.data);
  const options = mapUsersToFilterOptions(response.data);
  console.log(
    `[API Admin] Fetched and mapped ${options.length} employee options.`
  );
  return options;
};
