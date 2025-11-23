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
    console.log(data);
    
    return data;
  } catch (error) {
    console.error("❌ [API] Error Fetching Users:", error);
    throw error;
  }
};

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

/**
 * ✅ آپدیت پروفایل کاربر (هوشمند برای فایل و جیسون)
 * اگر عکس داشته باشد، به FormData تبدیل می‌شود.
 */
export const updateUserProfile = async ({
  userId,
  payload,
}: {
  userId: number;
  payload: UserProfileFormData;
}): Promise<User> => {
  
  // بررسی وجود فایل در پی‌لود (مخصوص تب مشخصات فردی)
  const hasFiles = (payload as any).employee?.images && (payload as any).employee.images.length > 0;
  
  // اگر فایل نداشتیم، ارسال معمولی JSON (متد PUT)
  if (!hasFiles) {
     const { data } = await axiosInstance.put(`/users/${userId}`, payload);
     return data;
  }

  // اگر فایل داشتیم، تبدیل به FormData (متد POST + _method: PUT)
  console.group(`🚀 [API Request] Update User Profile (Multipart) - User: ${userId}`);
  const formData = new FormData();
  formData.append("_method", "PUT"); // تکنیک لاراول برای آپدیت فایل‌دار

  // تابع بازگشتی برای تبدیل آبجکت به FormData
  const appendToFormData = (data: any, rootKey?: string) => {
      if (data instanceof File) {
          // اگر کلید اصلی images است، باید به صورت آرایه اضافه شود
          // اما چون در loop والد کنترل می‌شود، اینجا شاید نرسد. 
          // این بخش برای امنیت بیشتر است.
           if (rootKey) formData.append(rootKey, data);
           return;
      }
      
      if (Array.isArray(data)) {
           data.forEach((item, index) => {
               // اگر آرایه فایل بود (مثل images)
               if (item instanceof File && rootKey === 'employee[images]') {
                   formData.append(`${rootKey}[${index}]`, item);
               } 
               // اگر آرایه اعداد بود (مثل deleted_image_ids)
               else if (typeof item !== 'object' && rootKey) {
                   formData.append(`${rootKey}[${index}]`, String(item));
               }
               // سایر آرایه‌ها
               else {
                   appendToFormData(item, `${rootKey}[${index}]`);
               }
           });
           return;
      }

      if (data !== null && typeof data === 'object') {
           Object.keys(data).forEach(key => {
                const value = data[key];
                const formKey = rootKey ? `${rootKey}[${key}]` : key;
                
                // مدیریت خاص برای تصاویر
                if (key === 'images' && Array.isArray(value)) {
                    value.forEach((file, idx) => {
                        formData.append(`${formKey}[${idx}]`, file);
                    });
                } else {
                    appendToFormData(value, formKey);
                }
           });
           return;
      }

      if (data !== null && data !== undefined) {
          if (typeof data === 'boolean') {
               if (rootKey) formData.append(rootKey, data ? "1" : "0");
          } else {
               if (rootKey) formData.append(rootKey, String(data));
          }
      }
  };

  appendToFormData(payload);

  try {
    const { data } = await axiosInstance.post(`/users/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ [API Success] User Updated:", data);
    console.groupEnd();
    return data.data; // API معمولا data.data برمی‌گرداند
  } catch (error) {
    console.error("🔥 [API Error] Update Failed:", error);
    console.groupEnd();
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/users/${userId}`);
};

export const createUser = async (
  payload: CreateUserFormData
): Promise<User> => {
  console.group("🚀 [API Request] Create User (Multipart)");

  const formData = new FormData();
  formData.append("user_name", payload.user_name);
  formData.append("email", payload.email);
  formData.append("password", payload.password);
  formData.append("role", payload.role);
  formData.append("status", payload.status);

  if (payload.employee) {
    Object.entries(payload.employee).forEach(([key, value]) => {
      if (key === "images") return;

      if (value !== null && value !== undefined) {
        if (typeof value === "boolean") {
          formData.append(`employee[${key}]`, value ? "1" : "0");
        } else {
          formData.append(`employee[${key}]`, String(value));
        }
      }
    });

    if (payload.employee.images && payload.employee.images.length > 0) {
      payload.employee.images.forEach((file, index) => {
        formData.append(`employee[images][${index}]`, file);
      });
    }
  }

  try {
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