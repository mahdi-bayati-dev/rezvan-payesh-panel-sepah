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
  // 🟢 DEBUG: لاگ کردن پارامترهای فیلتر
  console.log("🔍 [API] Fetching Users with Params:", params);

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
    queryParams.append("work_group_id", "null");
  }
  // حالت ۲: کارمندان عضو گروه خاص (برای AssignedEmployeesTable)
  else if (params.work_group_id) {
    // برای فیلتر کردن بر اساس ID گروه (کارمندان عضو)
    queryParams.append("work_group_id", String(params.work_group_id));
  }

  // --- ۲. ارسال درخواست ---
  try {
    const { data } = await axiosInstance.get(
      `/users?${queryParams.toString()}`
    );
    // 🟢 DEBUG: موفقیت آمیز بودن دریافت لیست
    // console.log("✅ [API] Users Fetched:", data);
    return data;
  } catch (error) {
    console.error("❌ [API] Error Fetching Users:", error);
    throw error;
  }
};

// --- بقیه توابع ---

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
  const payload = {
    employee: {
      organization_id: organizationId,
    },
  };
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);

  return data;
};

/**
 * ✅✅✅ تابع API جدید: تخصیص برنامه شیفتی به کاربر
 */
export const updateUserShiftScheduleAssignment = async ({
  userId,
  shiftScheduleId,
}: {
  userId: number;
  shiftScheduleId: number | null;
}): Promise<User> => {
  const payload: UserProfileFormData = {
    employee: {
      shift_schedule_id: shiftScheduleId,
    } as any,
  };

  return updateUserProfile({ userId, payload });
};

/**
 * دریافت اطلاعات تکی کاربر (برای صفحه پروفایل)
 * GET /api/users/{userId}
 */
export const fetchUserById = async (userId: number): Promise<User> => {
  const { data } = await axiosInstance.get(`/users/${userId}`);
  console.log(data.data);
  
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
  payload: UserProfileFormData;
}): Promise<User> => {
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);
  return data;
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
  // 🟢🟢🟢 DEBUG START: شروع لاگ‌گذاری دقیق 🟢🟢🟢
  console.group("🚀 [API Request] Create User");
  console.log("Endpoint: POST /users");
  console.log(
    "📦 Payload (JSON):",
    JSON.stringify(payload, null, 2)
  ); // نمایش جیسون مرتب

  // بررسی‌های اولیه سمت کلاینت برای کمک به دیباگ
  if (payload.employee?.birth_date === "")
    console.warn("⚠️ Warning: birth_date is Empty String (should be null)");
  if (payload.employee?.starting_job === "")
    console.warn("⚠️ Warning: starting_job is Empty String (should be null)");
  if (payload.employee?.organization_id === undefined)
    console.error("⛔ Error: organization_id is missing!");

  console.groupEnd();
  // 🟢🟢🟢 DEBUG END 🟢🟢🟢

  try {
    const { data } = await axiosInstance.post("/users", payload);
    console.log("✅ [API Success] User Created:", data);
    return data.data;
  } catch (error: any) {
    // 🔴🔴🔴 ERROR LOGGING 🔴🔴🔴
    console.group("🔥 [API Error] Create User Failed");
    console.error("Status Code:", error.response?.status);
    console.error("Error Message:", error.message);
    console.error("Server Response Data:", error.response?.data); // اینجا معمولاً متن خطای 500 یا لاراول دیده می‌شود
    console.groupEnd();
    // 🔴🔴🔴 ERROR LOGGING END 🔴🔴🔴

    throw error;
  }
};