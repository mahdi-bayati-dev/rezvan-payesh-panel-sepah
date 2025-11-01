// (لطفاً مسیر axiosInstance را بر اساس پروژه خودتان تنظیم کنید)
import axiosInstance from "../../../lib/AxiosConfig"; // ✅ مسیر نسبی
import {
  type UserListResponse,
  type FetchUsersParams,
  type User,
  // ✅ تایپ فرم
} from "@/features/User/types/index"; // ✅ مسیر نسبی
import type { UserProfileFormData } from "@/features/User/Schema/userProfileFormSchema";
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

// --- ✅ توابع جدید ---

/**
 * دریافت اطلاعات تکی کاربر (برای صفحه پروفایل)
 * GET /api/users/{userId}
 */
export const fetchUserById = async (userId: number): Promise<User> => {
  // API یک UserResource کامل برمی‌گرداند
  const { data } = await axiosInstance.get(`/users/${userId}`);
    console.log('====>',data);
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
