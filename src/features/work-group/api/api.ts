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
  console.log(data);
  
  return data;
};

// 3.3: دریافت یک گروه کاری خاص
export const fetchWorkGroupById = async (id: number): Promise<WorkGroup> => {
  // استفاده از axiosInstance
  const { data } = await axiosInstance.get(`/work-groups/${id}`);
  return data.data;
};

// 3.2: ایجاد گروه کاری جدید
export const createWorkGroup = async (payload: {
  name: string;
  work_pattern_id?: number | null;
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
    work_pattern_id?: number | null;
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
  const { data } = await axiosInstance.get('week-patterns');
  return data.data;


};

// هوک فرضی برای گرفتن لیست برنامه‌های شیفتی
export const fetchShiftSchedulesList = async (): Promise<BaseNestedItem[]> => {
  // const { data } = await axiosInstance.get('/shift-schedules-list');
  // return data;

  // داده‌های تستی موقت:
  return [
    { id: 10, name: "برنامه چرخشی ۴ روزه" },
    { id: 11, name: "برنامه هفتگی بیمارستان" },
  ];
};
