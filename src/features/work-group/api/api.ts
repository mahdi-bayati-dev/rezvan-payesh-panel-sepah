import axiosInstance from "@/lib/AxiosConfig";
import {
  type WorkGroup,
  type BaseNestedItem,
  type PaginatedResponse,
} from "@/features/work-group/types/index";

// --- توابع Fetcher ---

// 3.1: دریافت لیست گروه‌های کاری (صفحه‌بندی شده)
export const fetchWorkGroups = async (
  page: number,
  perPage: number
): Promise<PaginatedResponse<WorkGroup>> => {
  // استفاده از axiosInstance
  const { data } = await axiosInstance.get("/work-groups", {
    params: { page, per_page: perPage },
  });
  console.log("Response Work Groups List:", data);

  return data;
};

// 3.3: دریافت یک گروه کاری خاص
export const fetchWorkGroupById = async (id: number): Promise<WorkGroup> => {
  // استفاده از axiosInstance
  const { data } = await axiosInstance.get(`/work-groups/${id}`);
  console.log(`Response Work Group ${id} Detail:`, data);
  return data.data;
};

// 3.2: ایجاد گروه کاری جدید
export const createWorkGroup = async (payload: {
  name: string;
  week_pattern_id?: number | null;
  shift_schedule_id?: number | null;
}): Promise<WorkGroup> => {
  // استفاده از axiosInstance
  const { data } = await axiosInstance.post("/work-groups", payload);
  return data.data;
};

// 3.4: به‌روزرسانی گروه کاری
export const updateWorkGroup = async (
  id: number,
  payload: {
    name: string;
    week_pattern_id?: number | null;
    shift_schedule_id?: number | null;
  }
): Promise<WorkGroup> => {
  // استفاده از axiosInstance
  const { data } = await axiosInstance.put(`/work-groups/${id}`, payload);
  return data.data;
};

// 3.5: حذف گروه کاری
export const deleteWorkGroup = async (id: number): Promise<void> => {
  // استفاده از axiosInstance
  await axiosInstance.delete(`/work-groups/${id}`);
};

// --- توابع Fetcher برای فرم ---

// هوک فرضی برای گرفتن لیست الگوهای کاری
export const fetchWorkPatternsList = async (): Promise<BaseNestedItem[]> => {
  const { data } = await axiosInstance.get("week-patterns");
  return data.data;
};

/**
 * دریافت لیست برنامه‌های شیفتی (واقعی)
 * GET /shift-schedules
 */
export const fetchShiftSchedulesList = async (): Promise<BaseNestedItem[]> => {
  const { data } = await axiosInstance.get("/shift-schedules");

  return data.data;
};

// --- ✅✅✅ توابع جدید برای مدیریت اعضای گروه کاری ✅✅✅ ---

/**
 * تخصیص (Assign) / حذف (Detach) کارمندان به یک گروه کاری
 * @param groupId شناسه گروه کاری
 * @param employeeIds لیست ID کارمندانی که باید اضافه یا حذف شوند
 * @param action 'attach' برای اضافه کردن، 'detach' برای حذف کردن
 * @returns پیام موفقیت
 */
export const updateGroupEmployees = async ({
  groupId,
  employeeIds,
  action,
}: {
  groupId: number;
  employeeIds: number[];
  action: "attach" | "detach";
}): Promise<string> => {
  // اگر employeeIds خالی باشد، نیازی به ارسال درخواست نیست
  if (employeeIds.length === 0) {
    return "عملیاتی انجام نشد.";
  }

  // ✅ اصلاح کلیدی: ارسال employee_ids در Payload
  const payload = {
    employee_ids: employeeIds, // نام فیلد را اصلاح می‌کنیم
    action: action,
  };

  const { data } = await axiosInstance.patch(
    `/work-groups/${groupId}/employees`,
    payload
  );

  // فرض می‌کنیم در صورت موفقیت، یک پیام ساده برمی‌گرداند.
  return (
    data.message ||
    `عملیات ${action === "attach" ? "افزودن" : "حذف"} با موفقیت انجام شد.`
  );
};
