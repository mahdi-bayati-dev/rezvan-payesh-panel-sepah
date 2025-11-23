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
 * دریافت لیست کاربران
 */
export const fetchUsers = async (
  params: FetchUsersParams
): Promise<UserListResponse> => {
  console.log("🔍 [API] Fetching Users with Params:", params);

  const queryParams = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  });

  if (params.search) queryParams.append("search", params.search);
  if (params.organization_id)
    queryParams.append("organization_id", String(params.organization_id));
  if (params.role) queryParams.append("role", params.role);
  if (params.work_pattern_id)
    queryParams.append("work_pattern_id", String(params.work_pattern_id));
  if (params.shift_schedule_id)
    queryParams.append("shift_schedule_id", String(params.shift_schedule_id));

  if (params.is_not_assigned_to_group) {
    queryParams.append("work_group_id", "null");
  } else if (params.work_group_id) {
    queryParams.append("work_group_id", String(params.work_group_id));
  }

  try {
    const { data } = await axiosInstance.get(
      `/users?${queryParams.toString()}`
    );
    return data;
  } catch (error) {
    console.error("❌ [API] Error Fetching Users:", error);
    throw error;
  }
};

/**
 * سایر متدها (updateUserOrganization, etc.) بدون تغییر...
 */
export const updateUserOrganization = async ({
  userId,
  organizationId,
}: {
  userId: number;
  organizationId: number;
}): Promise<User> => {
  const payload = { employee: { organization_id: organizationId } };
  const { data } = await axiosInstance.put(`/users/${userId}`, payload);
  return data;
};

export const updateUserShiftScheduleAssignment = async ({
  userId,
  shiftScheduleId,
}: {
  userId: number;
  shiftScheduleId: number | null;
}): Promise<User> => {
  const payload: UserProfileFormData = {
    employee: { shift_schedule_id: shiftScheduleId } as any,
  };
  return updateUserProfile({ userId, payload });
};

export const fetchUserById = async (userId: number): Promise<User> => {
  const { data } = await axiosInstance.get(`/users/${userId}`);
  console.log(data.data);
  
  return data.data;
};

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

export const deleteUser = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

/**
 * ✅ ایجاد کاربر جدید (همراه با آپلود تصویر)
 * POST /api/users
 * Content-Type: multipart/form-data
 */
export const createUser = async (
  payload: CreateUserFormData
): Promise<User> => {
  console.group("🚀 [API Request] Create User (Multipart)");

  // ۱. ساخت FormData
  const formData = new FormData();

  // ۲. اضافه کردن فیلدهای سطح User
  formData.append("user_name", payload.user_name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role", payload.role);
  formData.append("status", payload.status);

  // ۳. اضافه کردن فیلدهای سطح Employee (با فرمت آرایه‌ای PHP/Laravel)
  // مثال: employee[first_name]
  if (payload.employee) {
    Object.entries(payload.employee).forEach(([key, value]) => {
      // از پردازش فیلد images در این حلقه خودداری می‌کنیم چون باید جداگانه هندل شود
      if (key === "images") return;

      if (value !== null && value !== undefined) {
        // تبدیل boolean به 0 و 1 (استاندارد لاراول)
        if (typeof value === "boolean") {
          formData.append(`employee[${key}]`, value ? "1" : "0");
        } else {
          formData.append(`employee[${key}]`, String(value));
        }
      }
    });

    // ۴. هندل کردن تصاویر (طبق داکیومنت: employee[images][0], employee[images][1]...)
    if (payload.employee.images && payload.employee.images.length > 0) {
      payload.employee.images.forEach((file, index) => {
        // نکته مهم: فایل باید بایندری واقعی باشد که از input type=file می‌آید
        formData.append(`employee[images][${index}]`, file);
      });
    }
  }

  // Debug: نمایش محتویات FormData (فقط برای دولوپر)
  // for (let [key, value] of formData.entries()) {
  //   console.log(`${key}:`, value);
  // }

  console.groupEnd();

  try {
    // نکته: وقتی FormData می‌فرستیم، axios معمولاً خودش هدر Content-Type را ست می‌کند
    // اما برای اطمینان می‌توانیم هدر را دستی هم ست کنیم (اختیاری)
    const { data } = await axiosInstance.post("/users", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ [API Success] User Created:", data);
    return data.data;
  } catch (error: any) {
    console.group("🔥 [API Error] Create User Failed");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.groupEnd();
    throw error;
  }
};
