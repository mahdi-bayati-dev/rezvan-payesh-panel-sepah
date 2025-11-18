import axiosInstance from "../../../lib/AxiosConfig";
import {
  type UserListResponse,
  type FetchUsersParams,
  type User,
} from "@/features/User/types/index";
import type {
  UserProfileFormData,
  CreateUserFormData,
} from "@/features/User/Schema/userProfileFormSchema";
/**
 * دریافت لیست کاربران (فیلتر شده و صفحه‌بندی شده)
 * GET /api/users
 */
export const fetchUsers = async (
  params: FetchUsersParams
): Promise<UserListResponse> => {
  // --- ۱. ساخت Query Parameters ---
  const queryParams = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.organization_id) {
    queryParams.append("organization_id", String(params.organization_id));
  }
  if (params.role) {
    queryParams.append("role", params.role);
  }
  if (params.work_pattern_id) {
    queryParams.append("work_pattern_id", String(params.work_pattern_id));
  }
  if (params.shift_schedule_id) {
    queryParams.append("shift_schedule_id", String(params.shift_schedule_id));
  }
  
  // ✅✅✅ منطق فیلتر Work Group (نهایی و استاندارد) ✅✅✅

  // حالت ۱: کارمندان آزاد (برای AvailableEmployeesTable)
  if (params.is_not_assigned_to_group) {
    // برای کارمندانی که work_group_id آنها NULL است.
    // این روش معمولاً در Laravel برای فیلتر whereNull جواب می‌دهد.
    queryParams.append("work_group_id", "null"); 
  }
  // حالت ۲: کارمندان عضو گروه خاص (برای AssignedEmployeesTable)
  else if (params.work_group_id) {
    // برای فیلتر کردن بر اساس ID گروه (کارمندان عضو)
    queryParams.append("work_group_id", String(params.work_group_id));
  }

  // --- ۲. ارسال درخواست ---
  const { data } = await axiosInstance.get(`/users?${queryParams.toString()}`);
  console.log("==>", data);

  return data;
};

// --- بقیه توابع (بدون تغییر) ---

/**
 * به‌روزرسانی سازمان یک کاربر (فقط Super Admin)
 * PUT /api/users/{userId}
 */
export const updateUserOrganization = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}): Promise<User> => {
  // ... (کد موجود شما)
  const payload = {
    employee: {
      organization_id: organizationId,
    },
  };
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);

  return data; // API شما UserResource را برمی‌گرداند
};
/**
 * ✅✅✅ تابع API جدید: تخصیص برنامه شیفتی به کاربر
 * (این یک Wrapper اختصاصی برای updateUserProfile است)
 */
export const updateUserShiftScheduleAssignment = async ({
  userId,
  shiftScheduleId,
}: {
  userId: number;
  shiftScheduleId: number | null;
}): Promise<User> => {
  // ما از همان اندپوینت PUT /users/{userId} استفاده می‌کنیم
  // اما payload را طوری می‌سازیم که فقط shift_schedule_id را تغییر دهد
  const payload: UserProfileFormData = {
    employee: {
      shift_schedule_id: shiftScheduleId,
    } as any, // (cast as any چون فقط یک فیلد می‌فرستیم)
  };

  // (از تابع موجود updateUserProfile استفاده مجدد می‌کنیم)
  return updateUserProfile({ userId, payload });
};

/**
 * دریافت اطلاعات تکی کاربر (برای صفحه پروفایل)
 * GET /api/users/{userId}
 */
export const fetchUserById = async (userId: number): Promise<User> => {
  // لاگ‌های دیباگ حذف شدند
  const { data } = await axiosInstance.get(`/users/${userId}`);

  // لاگ‌های دیباگ حذف شدند
  return data.data;
};

/**
 * به‌روزرسانی اطلاعات پروفایل کاربر
 * PUT /api/users/{userId}
 */
export const updateUserProfile = async ({
  userId,
  payload,
}: {
  userId: number;
  payload: UserProfileFormData; // از تایپ Zod استفاده می‌کنیم
}): Promise<User> => {
  // API شما اجازه ارسال بخشی از فیلدها را می‌دهد (PATCH/PUT)
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);
  return data; // UserResource به‌روز شده را برمی‌گرداند
};

/**
 * حذف کاربر
 * DELETE /api/users/{userId}
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

/**
 * ایجاد کاربر جدید (Store)
 * POST /api/users
 */
export const createUser = async (
  payload: CreateUserFormData
): Promise<User> => {
  // بر اساس مستندات API، ما کل آبجکت فرم را ارسال می‌کنیم
  // API در پاسخ 201، آبجکت UserResource را برمی‌گرداند
  const { data } = await axiosInstance.post("/users", payload);
  // (فرض می‌کنیم API در پاسخ موفق، مستقیم آبجکت User را برمی‌گرداند،
  // مشابه updateUserProfile)
  return data.data;
};