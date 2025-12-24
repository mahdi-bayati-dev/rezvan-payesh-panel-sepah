import axiosInstance from "@/lib/AxiosConfig";
import {
  type WorkGroup,
  type BaseNestedItem,
  type PaginatedResponse,
} from "@/features/work-group/types/index";

// --- تایپ‌های اختصاصی منطبق با PDF ---
interface ManageGroupEmployeesPayload {
  employee_ids: number[];
  action: "attach" | "detach";
}

interface ManageGroupEmployeesResponse {
  message: string;
  current_count?: number; // طبق داکیومنت، این فیلد اختیاری برمی‌گردد
}

// --- توابع Fetcher ---

export const fetchWorkGroups = async (
  page: number,
  perPage: number
): Promise<PaginatedResponse<WorkGroup>> => {
  const { data } = await axiosInstance.get("/work-groups", {
    params: { page, per_page: perPage },
  });
  return data;
};

export const fetchWorkGroupById = async (id: number): Promise<WorkGroup> => {
  const { data } = await axiosInstance.get(`/work-groups/${id}`);
  return data.data;
};

export const createWorkGroup = async (payload: {
  name: string;
  week_pattern_id?: number | null;
  shift_schedule_id?: number | null;
}): Promise<WorkGroup> => {
  const { data } = await axiosInstance.post("/work-groups", payload);
  return data.data;
};

export const updateWorkGroup = async (
  id: number,
  payload: {
    name: string;
    week_pattern_id?: number | null;
    shift_schedule_id?: number | null;
  }
): Promise<WorkGroup> => {
  const { data } = await axiosInstance.put(`/work-groups/${id}`, payload);
  return data.data;
};

export const deleteWorkGroup = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/work-groups/${id}`);
};

export const fetchWorkPatternsList = async (): Promise<BaseNestedItem[]> => {
  const { data } = await axiosInstance.get("week-patterns");
  return data.data;
};

export const fetchShiftSchedulesList = async (): Promise<BaseNestedItem[]> => {
  const { data } = await axiosInstance.get("/shift-schedules");
  return data.data;
};

// --- ✅✅✅ توابع مدیریت اعضای گروه (دقیق طبق داکیومنت) ✅✅✅ ---

/**
 * مدیریت تخصیص یا حذف سربازان از گروه کاری
 * متد: PATCH
 * مسیر: /api/work-groups/{groupId}/employees
 */
export const updateGroupEmployees = async ({
  groupId,
  payload,
}: {
  groupId: number;
  payload: ManageGroupEmployeesPayload;
}): Promise<ManageGroupEmployeesResponse> => {
  // گارد: اگر لیست خالی است، درخواستی ارسال نکن (صرفه جویی در منابع)
  if (!payload.employee_ids.length) {
    throw new Error("لیست سربازان انتخاب شده نمی‌تواند خالی باشد.");
  }

  const { data } = await axiosInstance.patch<ManageGroupEmployeesResponse>(
    `/work-groups/${groupId}/employees`,
    payload
  );

  return data;
};
