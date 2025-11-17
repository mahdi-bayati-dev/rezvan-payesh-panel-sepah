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
  // ... (کد موجود شما)
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
  // ✅ افزودن پارامتر فیلتر جدید
  if (params.work_pattern_id) {
    queryParams.append("work_pattern_id", String(params.work_pattern_id));
  }

  const { data } = await axiosInstance.get(`/users?${queryParams.toString()}`);
  return data;
};

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
