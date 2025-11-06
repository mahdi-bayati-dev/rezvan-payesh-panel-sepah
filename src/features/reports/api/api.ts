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

// مسیر پایه API گزارش‌ها
const REPORTS_API_PATH = "/admin/attendance-logs";
// مسیر پایه API کاربران
const USERS_API_PATH = "/users";

// --- تعریف تایپ‌های Payloads ---
export interface LogFilters {
  page?: number;
  employee_id?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";

  // [اصلاح] پارامتر جستجو اضافه شد
  // (فرض ما این است که بک‌اند پارامتری به نام 'search' را می‌پذیرد)
  search?: string;
}

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

// --- توابع API گزارش‌ها ---

/**
 * ۱. (Index) واکشی لیست لاگ‌ها
 */
export const fetchLogs = async (
  filters: LogFilters
): Promise<AttendanceLogCollection> => {
  // [اصلاح] لاگ کردن فیلترهای کامل (شامل جستجو)
  console.log("[API] Fetching logs with filters:", filters);
  const response = await axiosInstance.get<AttendanceLogCollection>(
    REPORTS_API_PATH,
    {
      params: filters,
    }
  );
  return response.data; // -> { data: [...], links: ..., meta: ... }
};

/**
 * ۲. (Show) واکشی جزئیات یک لاگ خاص
 */
export const fetchLogById = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  console.log(`[API] Fetching log by ID: ${logId}`);
  const response = await axiosInstance.get<{ data: ApiAttendanceLog }>(
    `${REPORTS_API_PATH}/${logId}`
  );
  return response.data.data; // -> { id: ..., employee: ... }
};

/**
 * ۳. (Store) ایجاد یک لاگ تردد دستی جدید
 */
export const createLog = async (
  payload: CreateLogPayload
): Promise<ApiAttendanceLog> => {
  console.log("[API] Creating new log:", payload);
  const response = await axiosInstance.post<{ data: ApiAttendanceLog }>(
    REPORTS_API_PATH,
    payload
  );
  console.log(response.data.data);

  return response.data.data;
};

/**
 * ۴. (Update) ویرایش یک لاگ تردد موجود
 */
export const updateLog = async ({
  id,
  payload,
}: {
  id: string | number;
  payload: UpdateLogPayload;
}): Promise<ApiAttendanceLog> => {
  console.log(`[API] Updating log ${id}:`, payload);
  const response = await axiosInstance.put<{ data: ApiAttendanceLog }>(
    `${REPORTS_API_PATH}/${id}`,
    payload
  );
  return response.data.data;
};

/**
 * ۵. (Destroy/Approve) تأیید کردن یک لاگ تردد
 */
export const approveLog = async (
  logId: string | number
): Promise<ApiAttendanceLog> => {
  console.log(`[API] Approving (DELETE) log: ${logId}`);
  const response = await axiosInstance.delete<{ data: ApiAttendanceLog }>(
    `${REPORTS_API_PATH}/${logId}`
  );
  return response.data.data;
};

// ---  تابع واکشی کارمندان ---
export const fetchEmployeeOptions = async (): Promise<FilterOption[]> => {
  console.log("[API] Fetching employee options...");
  const response = await axiosInstance.get<ApiUserCollection>(USERS_API_PATH, {
    params: {
      per_page: 1000,
    },
  });
  console.log("[API] Raw employee response:", response.data);

  // فیلتر کردن کاربرانی که پروفایل کارمندی کامل دارند
  const validUsers = (response.data?.data || []).filter(
    (user) => user && user.employee && user.employee.id // <-- اطمینان از وجود employee.id
  );

  const options: FilterOption[] = validUsers.map((user) => ({
    id: user.employee.id, // <-- قبلاً user.id بود که اشتباه است
    // -----------------------

    name: `${user.employee.first_name || ""} ${
      user.employee.last_name || ""
    } (${user.employee.personnel_code || "N/A"})`,
  }));

  console.log(`[API] Fetched and mapped ${options.length} employee options.`);
  return options;
};
